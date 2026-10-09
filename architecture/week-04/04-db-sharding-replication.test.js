/**
 * ============================================================================
 * 🧪 TEST SUITE: DATABASE SHARDING & REPLICATION LAG (Week 4 Day 4)
 * ============================================================================
 * Kiểm thử kiến trúc phân mảnh dữ liệu (Sharding) và xử lý Replication Lag:
 *   - Native Node.js `node:assert`, zero external libraries.
 *   - Test-First Order: Viết test trước implementation.
 *   - Bao phủ: Consistent Hash Sharding, Stale Read Anomaly, Pin-to-Primary,
 *     Window Expiry, Min-LSN Routing, Concurrency Banking Benchmark.
 * ============================================================================
 */

const assert = require('node:assert');
const {
  DatabaseNode,
  ShardedCluster,
  ReadYourOwnWritesManager
} = require('./04-db-sharding-replication.js');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('--- Starting Test Suite: DB Sharding & Replication Lag (Week 4 Day 4) ---');

  // ============================================================================
  // TC-01: Hash-based shard routing consistency
  // ============================================================================
  console.log('Running TC-01: Hash-based shard routing consistency...');
  const cluster1 = new ShardedCluster({ numShards: 4, replicasPerShard: 2 });

  const accountA = 'ACC_1001';
  const shard1 = cluster1.getShardForAccount(accountA);
  const shard2 = cluster1.getShardForAccount(accountA);
  assert.strictEqual(shard1.id, shard2.id, 'Account ACC_1001 must always map to the exact same shard');

  const accountB = 'ACC_9999';
  const shardB = cluster1.getShardForAccount(accountB);
  assert.ok(shardB.id >= 0 && shardB.id < 4, 'Shard ID must be within valid range [0, 3]');

  console.log('✅ TC-01 PASSED: Shard routing is deterministic and consistent.');

  // ============================================================================
  // TC-02: Mô phỏng hiện tượng Replication Lag (Stale Read Anomaly)
  // ============================================================================
  console.log('Running TC-02: Replication lag staleness demonstration...');
  const cluster2 = new ShardedCluster({ numShards: 2, replicasPerShard: 1, replicationLagMs: 50 });
  const account = 'ACC_2001';

  // Khởi tạo tài khoản với số dư 1,000 trên Primary và sync sang replica
  await cluster2.write(account, 1000);
  await sleep(60); // Đợi replica đồng bộ xong

  // Client cập nhật số dư lên 2,500 trên Primary
  await cluster2.write(account, 2500);

  // Đọc TRỰC TIẾP từ Read Replica ngay lập tức khi replica chưa sync xong
  const shard = cluster2.getShardForAccount(account);
  const staleData = shard.replicas[0].readDirect(account);

  assert.strictEqual(staleData.balance, 1000, 'Direct read from lagging replica returns stale balance (1000)');
  assert.notStrictEqual(staleData.balance, 2500, 'Direct read failed to reflect recent write on Primary');

  console.log('✅ TC-02 PASSED: Demonstrated Stale Read anomaly caused by Replication Lag.');

  // ============================================================================
  // TC-03: Pin-to-Primary Mechanism (Read-Your-Own-Writes Guarantee)
  // ============================================================================
  console.log('Running TC-03: Pin-to-Primary routing within write window...');
  const cluster3 = new ShardedCluster({ numShards: 2, replicasPerShard: 1, replicationLagMs: 80 });
  const ryowManager = new ReadYourOwnWritesManager({ writeWindowMs: 50 });

  const userId = 'USR_3001';
  const accId = 'ACC_3001';

  // Client thực hiện ghi số dư 5,000
  const writeResult = await cluster3.write(accId, 5000);
  ryowManager.recordWrite(userId, accId, writeResult.lsn);

  // Ngay lập tức client đọc lại số dư thông qua RYOW Manager
  const readResult = await ryowManager.read(userId, accId, cluster3);

  assert.strictEqual(readResult.balance, 5000, 'Read within window must return fresh balance (5000)');
  assert.strictEqual(readResult.routedTo, 'PRIMARY', 'Read must be pinned to PRIMARY');

  console.log('✅ TC-03 PASSED: Pin-to-Primary guaranteed Read-Your-Own-Writes consistency.');

  // ============================================================================
  // TC-04: Hết hạn cửa sổ ghi (Revert back to Read Replica)
  // ============================================================================
  console.log('Running TC-04: Expiry of write window & offloading Primary...');
  const cluster4 = new ShardedCluster({ numShards: 2, replicasPerShard: 1, replicationLagMs: 20 });
  const ryowManager2 = new ReadYourOwnWritesManager({ writeWindowMs: 40 });

  const user2 = 'USR_4001';
  const acc2 = 'ACC_4001';

  const wRes = await cluster4.write(acc2, 7000);
  ryowManager2.recordWrite(user2, acc2, wRes.lsn);

  // Chờ hết write window (40ms) và replica đã bắt kịp (20ms lag)
  await sleep(60);

  const readAfterWindow = await ryowManager2.read(user2, acc2, cluster4);
  assert.strictEqual(readAfterWindow.balance, 7000, 'Read after window still returns correct balance');
  assert.strictEqual(readAfterWindow.routedTo, 'REPLICA', 'Read must revert to REPLICA to offload Primary');

  console.log('✅ TC-04 PASSED: Expired window successfully offloaded queries back to Replica.');

  // ============================================================================
  // TC-05: Min-LSN based Routing (Chờ replica bắt kịp LSN)
  // ============================================================================
  console.log('Running TC-05: Min-LSN based Replica Routing...');
  const cluster5 = new ShardedCluster({ numShards: 2, replicasPerShard: 2, replicationLagMs: 30 });
  const user5 = 'USR_5001';
  const acc5 = 'ACC_5001';

  const write5 = await cluster5.write(acc5, 9500);
  const targetLSN = write5.lsn;

  // Đọc có điều kiện Min-LSN: Replica phải có LSN >= targetLSN
  const lsnRead = await cluster5.readWithMinLSN(acc5, targetLSN);
  assert.strictEqual(lsnRead.balance, 9500);
  assert.ok(lsnRead.currentLSN >= targetLSN, 'Replica currentLSN must be >= targetLSN');

  console.log('✅ TC-05 PASSED: Min-LSN routing verified.');

  // ============================================================================
  // TC-06: High-Concurrency Banking Benchmark (50 transfers + immediate read)
  // ============================================================================
  console.log('Running TC-06: Concurrency Banking Benchmark (50 transfers + immediate reads)...');
  const cluster6 = new ShardedCluster({ numShards: 4, replicasPerShard: 2, replicationLagMs: 40 });
  const ryow6 = new ReadYourOwnWritesManager({ writeWindowMs: 80 });

  const numOps = 50;
  const tasks = [];
  let staleCount = 0;

  const startTime = process.hrtime.bigint();
  for (let i = 0; i < numOps; i++) {
    const u = `USER_${i}`;
    const a = `ACC_${i}`;
    const deposit = 100 + i;

    tasks.push(
      (async () => {
        const w = await cluster6.write(a, deposit);
        ryow6.recordWrite(u, a, w.lsn);

        // Đọc ngay lập tức
        const r = await ryow6.read(u, a, cluster6);
        if (r.balance !== deposit) {
          staleCount++;
        }
      })()
    );
  }

  await Promise.all(tasks);
  const endTime = process.hrtime.bigint();
  const durationMs = Number(endTime - startTime) / 1e6;

  console.log(`⚡ Benchmark: 50 concurrent write-and-read operations in ${durationMs.toFixed(2)}ms`);
  assert.strictEqual(staleCount, 0, 'Zero stale reads allowed under high concurrency');

  console.log('✅ TC-06 PASSED: Concurrency benchmark verified 0 stale reads across all shards.');

  console.log('--------------------------------------------------------------------------------');
  console.log('🎉 ALL 6 DATABASE SHARDING & REPLICATION LAG TESTS PASSED! (Week 4 Day 4)');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
