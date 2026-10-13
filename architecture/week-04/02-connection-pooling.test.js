/**
 * ============================================================================
 * 🧪 TEST SUITE: DATABASE CONNECTION POOLING ARCHITECTURE (Week 4 Day 2)
 * ============================================================================
 * Kiểm thử cơ chế Connection Pool thuần Node.js (pg-pool / HikariCP principles):
 *   - Native Node.js `node:assert`, zero external libraries.
 *   - Test-First Order: Viết test trước implementation.
 *   - Bao phủ: Min/Max sizing, FIFO queue, acquire timeout, leak detection,
 *     exception-safe query helper, high-concurrency benchmark, graceful drain.
 * ============================================================================
 */

const assert = require('node:assert');
const { ConnectionPool, DatabaseConnection } = require('./02-connection-pooling.js');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('--- Starting Test Suite: Database Connection Pooling Architecture (Week 4 Day 2) ---');

  // ============================================================================
  // TC-01: Khởi tạo Pool và warm-up min connections
  // ============================================================================
  console.log('Running TC-01: Pool initialization & min connection warm-up...');
  const pool1 = new ConnectionPool({ max: 5, min: 2 });
  const stats1 = pool1.getStats();
  assert.strictEqual(stats1.total, 2, 'Pool should initialize with min = 2 connections');
  assert.strictEqual(stats1.idle, 2, 'All initialized connections should be idle');
  assert.strictEqual(stats1.active, 0, 'Zero active connections initially');
  assert.strictEqual(stats1.waiting, 0, 'Zero waiting requests initially');
  await pool1.drain();
  console.log('✅ TC-01 PASSED: Pool initialized min connections correctly.');

  // ============================================================================
  // TC-02: Tái sử dụng kết nối (Reuse idle connection without allocating new ones)
  // ============================================================================
  console.log('Running TC-02: Connection reuse from idle pool...');
  const pool2 = new ConnectionPool({ max: 5, min: 2 });
  const connA = await pool2.acquire();
  const initialId = connA.id;
  assert.strictEqual(pool2.getStats().active, 1);
  assert.strictEqual(pool2.getStats().idle, 1);

  pool2.release(connA);
  assert.strictEqual(pool2.getStats().active, 0);
  assert.strictEqual(pool2.getStats().idle, 2);

  const connB = await pool2.acquire();
  assert.strictEqual(connB.id, initialId, 'Released connection should be reused');
  assert.strictEqual(pool2.getStats().total, 2, 'Total connections should remain at min');
  pool2.release(connB);
  await pool2.drain();
  console.log('✅ TC-02 PASSED: Connection reused cleanly without memory allocation.');

  // ============================================================================
  // TC-03: Thực thi giới hạn max và đưa yêu cầu vào hàng đợi
  // ============================================================================
  console.log('Running TC-03: Max pool size enforcement & queueing...');
  const pool3 = new ConnectionPool({ max: 3, min: 1 });
  const c1 = await pool3.acquire();
  const c2 = await pool3.acquire();
  const c3 = await pool3.acquire();
  assert.strictEqual(pool3.getStats().total, 3, 'Total reached max limit of 3');
  assert.strictEqual(pool3.getStats().active, 3);
  assert.strictEqual(pool3.getStats().idle, 0);

  // Request thứ 4 phải bị đưa vào hàng đợi
  let fourthAcquired = false;
  const p4 = pool3.acquire().then((c) => {
    fourthAcquired = true;
    return c;
  });

  await sleep(10);
  assert.strictEqual(fourthAcquired, false, 'Fourth acquire should wait in queue');
  assert.strictEqual(pool3.getStats().waiting, 1, 'Waiting queue length should be 1');

  pool3.release(c1);
  const c4 = await p4;
  assert.strictEqual(fourthAcquired, true, 'Fourth acquire completed upon release');
  assert.strictEqual(pool3.getStats().waiting, 0);

  pool3.release(c2);
  pool3.release(c3);
  pool3.release(c4);
  await pool3.drain();
  console.log('✅ TC-03 PASSED: Max pool limit enforced and requests queued properly.');

  // ============================================================================
  // TC-04: Cơ chế FIFO Queue: Dispatch theo thứ tự yêu cầu đến trước
  // ============================================================================
  console.log('Running TC-04: FIFO Waiting Queue dispatch...');
  const pool4 = new ConnectionPool({ max: 1, min: 1 });
  const lockedConn = await pool4.acquire();

  const order = [];
  const pA = pool4.acquire().then((c) => { order.push('A'); pool4.release(c); });
  const pB = pool4.acquire().then((c) => { order.push('B'); pool4.release(c); });
  const pC = pool4.acquire().then((c) => { order.push('C'); pool4.release(c); });

  assert.strictEqual(pool4.getStats().waiting, 3, '3 callers waiting in FIFO queue');
  pool4.release(lockedConn);

  await Promise.all([pA, pB, pC]);
  assert.deepStrictEqual(order, ['A', 'B', 'C'], 'Dispatch order must be strictly FIFO');
  await pool4.drain();
  console.log('✅ TC-04 PASSED: FIFO dispatch order verified.');

  // ============================================================================
  // TC-05: Connection Acquisition Timeout (connectionTimeoutMillis)
  // ============================================================================
  console.log('Running TC-05: Connection Acquisition Timeout...');
  const pool5 = new ConnectionPool({ max: 1, min: 1, connectionTimeoutMillis: 50 });
  const activeConn = await pool5.acquire();

  let timeoutError = null;
  try {
    await pool5.acquire();
  } catch (err) {
    timeoutError = err;
  }

  assert.ok(timeoutError, 'Should throw timeout error');
  assert.strictEqual(timeoutError.name, 'ConnectionTimeoutError');
  assert.ok(timeoutError.message.includes('50ms'), 'Error message should include timeout duration');
  assert.strictEqual(pool5.getStats().waiting, 0, 'Timed-out request removed from queue');

  pool5.release(activeConn);
  await pool5.drain();
  console.log('✅ TC-05 PASSED: Acquisition timeout rejected and cleaned up queue.');

  // ============================================================================
  // TC-06: Phát hiện rò rỉ kết nối (leakDetectionThreshold)
  // ============================================================================
  console.log('Running TC-06: Connection Leak Detection & Alarming...');
  const pool6 = new ConnectionPool({ max: 2, min: 1, leakDetectionThreshold: 50 });

  let leakEvent = null;
  pool6.on('connectionLeak', (evt) => {
    leakEvent = evt;
  });

  const leakyConn = await pool6.acquire();
  await sleep(80); // Chờ vượt ngưỡng 50ms

  assert.ok(leakEvent, 'connectionLeak event must fire after threshold');
  assert.strictEqual(leakEvent.connectionId, leakyConn.id);
  assert.ok(leakEvent.heldTimeMs >= 50, 'Event should record held time');
  assert.ok(leakEvent.stack, 'Event should include acquisition stack trace');

  pool6.release(leakyConn);
  await pool6.drain();
  console.log('✅ TC-06 PASSED: Connection leak detected with diagnostic stack trace.');

  // ============================================================================
  // TC-07: Hàm tiện ích query() bảo đảm an toàn với khối finally
  // ============================================================================
  console.log('Running TC-07: Safe query helper with automatic finally release...');
  const pool7 = new ConnectionPool({ max: 2, min: 1 });

  // Query thành công
  const res1 = await pool7.query('SELECT 1', []);
  assert.strictEqual(res1.status, 'SUCCESS');
  assert.strictEqual(pool7.getStats().active, 0, 'Connection automatically released after success');

  // Query ném exception
  let queryError = null;
  try {
    await pool7.query('INVALID SQL THROW', []);
  } catch (err) {
    queryError = err;
  }
  assert.ok(queryError, 'Query should throw error');
  assert.strictEqual(pool7.getStats().active, 0, 'Connection automatically released even on error');
  await pool7.drain();
  console.log('✅ TC-07 PASSED: Safe query wrapper prevented connection leaks.');

  // ============================================================================
  // TC-08: High-Concurrency Banking Benchmark (100 concurrent queries over 5 connections)
  // ============================================================================
  console.log('Running TC-08: High-Concurrency Banking Benchmark (100 txs over 5 conns)...');
  const pool8 = new ConnectionPool({ max: 5, min: 2, connectionTimeoutMillis: 2000 });

  let bankBalance = 100000;
  const numTransactions = 100;
  const transferAmount = 10;

  const startTime = process.hrtime.bigint();
  const txPromises = [];
  for (let i = 0; i < numTransactions; i++) {
    txPromises.push(
      pool8.query('TRANSFER', [transferAmount]).then(() => {
        bankBalance -= transferAmount;
      })
    );
  }

  await Promise.all(txPromises);
  const endTime = process.hrtime.bigint();
  const durationMs = Number(endTime - startTime) / 1e6;

  console.log(`⚡ Benchmark: 100 concurrent transactions completed in ${durationMs.toFixed(2)}ms`);
  assert.strictEqual(bankBalance, 100000 - numTransactions * transferAmount, 'Balance must be exact');
  assert.strictEqual(pool8.getStats().active, 0, 'Zero active connections after high load');
  assert.strictEqual(pool8.getStats().waiting, 0, 'Zero waiting requests');
  assert.ok(pool8.getStats().total <= 5, 'Total connections never exceeded max limit of 5');

  await pool8.drain();
  console.log('✅ TC-08 PASSED: High-concurrency benchmark verified conservation of funds.');

  // ============================================================================
  // TC-09: Graceful Shutdown (drain)
  // ============================================================================
  console.log('Running TC-09: Graceful shutdown via drain()...');
  const pool9 = new ConnectionPool({ max: 3, min: 2 });
  const pendingConn = await pool9.acquire();

  let drainResolved = false;
  const drainPromise = pool9.drain().then(() => {
    drainResolved = true;
  });

  await sleep(20);
  assert.strictEqual(drainResolved, false, 'drain() must wait for checked-out connections');

  // Không cho acquire khi pool đang drain
  let drainAcquireError = null;
  try {
    await pool9.acquire();
  } catch (err) {
    drainAcquireError = err;
  }
  assert.ok(drainAcquireError, 'Cannot acquire when pool is draining');

  pool9.release(pendingConn);
  await drainPromise;
  assert.strictEqual(drainResolved, true, 'drain() completed once active connection was released');
  assert.strictEqual(pool9.getStats().total, 0, 'All connections closed');

  console.log('✅ TC-09 PASSED: Graceful drain and shutdown verified.');

  console.log('--------------------------------------------------------------------------------');
  console.log('🎉 ALL 9 DATABASE CONNECTION POOLING TESTS PASSED SUCCESSFULLY! (Week 4 Day 2)');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});

