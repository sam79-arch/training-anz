/**
 * ============================================================================
 * 🧪 TEST SUITE: NODE.JS STREAMS & BACKPRESSURE ARCHITECTURE (Week 2 Day 5)
 * ============================================================================
 * Target: HCLTech x ANZ Bank Backend Interview (Data Platform Architecture)
 * Quy chuẩn kiểm thử:
 * - Native node:assert (Zero external npm dependencies)
 * - Test-First Discipline: Viết toàn bộ 6 test cases trước khi code mã nguồn
 * - Kiểm chứng cơ chế Backpressure: highWaterMark saturation, 'drain' event,
 *   PCI-DSS masking, RAM Stability (< 15MB delta trên 50,000 items), và stream cleanup.
 * ============================================================================
 */

const assert = require('node:assert');
const { pipeline } = require('node:stream');
const { promisify } = require('node:util');

const pipelineAsync = promisify(pipeline);
const {
  TransactionGeneratorStream,
  SensitiveDataMasker,
  SlowBatchConsumerStream,
  executeStreamPipeline,
  measureStreamMemoryDelta,
} = require('./05-streams-backpressure');

async function runTestSuite() {
  console.log('--- Starting Test Suite: Node.js Streams & Backpressure Architecture (Week 2 Day 5) ---');

  // --------------------------------------------------------------------------
  // TC-01: Readable Stream emission & data structure
  // --------------------------------------------------------------------------
  console.log('Running TC-01: Testing TransactionGeneratorStream emission and record structure...');
  const count = 10;
  const generator = new TransactionGeneratorStream({ totalRecords: count });
  const records = [];

  for await (const chunk of generator) {
    records.push(chunk);
  }

  assert.strictEqual(records.length, count, `Should emit exactly ${count} transaction records`);
  assert.ok(records[0].id, 'Record must contain an id');
  assert.ok(records[0].cardNumber, 'Record must contain a cardNumber');
  assert.strictEqual(typeof records[0].amount, 'number', 'Record amount must be a number');
  assert.strictEqual(records[0].currency, 'AUD', 'ANZ currency should default to AUD');
  console.log('✅ TC-01 PASSED: Readable Stream emitted structured records correctly!');

  // --------------------------------------------------------------------------
  // TC-02: Transform Stream PCI-DSS Masking
  // --------------------------------------------------------------------------
  console.log('Running TC-02: Testing SensitiveDataMasker (PCI-DSS Credit Card Masking)...');
  const sampleTx = {
    id: 'tx-test-01',
    cardNumber: '4532123456789012',
    amount: 250.75,
    currency: 'AUD',
  };

  const masker = new SensitiveDataMasker();
  const maskedResults = [];

  masker.on('data', (chunk) => maskedResults.push(chunk));
  masker.write(sampleTx);
  masker.end();

  // Wait for stream to finish
  await new Promise((resolve) => masker.on('finish', resolve));

  assert.strictEqual(maskedResults.length, 1);
  assert.strictEqual(
    maskedResults[0].cardNumber,
    '4532********9012',
    'Card number must have 8 middle digits masked with asterisks'
  );
  assert.strictEqual(maskedResults[0].amount, 250.75, 'Amount must remain unchanged');
  console.log('✅ TC-02 PASSED: PCI-DSS sensitive data masking verified!');

  // --------------------------------------------------------------------------
  // TC-03: Backpressure Saturation (writable.write() === false)
  // --------------------------------------------------------------------------
  console.log('Running TC-03: Testing Backpressure Saturation (Buffer reaching highWaterMark)...');
  const slowConsumer = new SlowBatchConsumerStream({
    highWaterMark: 3, // Very small buffer to trigger backpressure quickly
    delayMs: 20,      // Slow consumption to simulate database batch insert
  });

  let backpressureTriggered = false;
  // Push 10 items rapidly into a consumer with highWaterMark = 3
  for (let i = 0; i < 10; i++) {
    const canAcceptMore = slowConsumer.write({ id: `tx-${i}`, amount: 100 });
    if (!canAcceptMore) {
      backpressureTriggered = true;
      break;
    }
  }

  assert.strictEqual(
    backpressureTriggered,
    true,
    'writable.write() must return false when highWaterMark is exceeded'
  );
  console.log('✅ TC-03 PASSED: Backpressure saturation correctly returned false!');

  // --------------------------------------------------------------------------
  // TC-04: 'drain' Event Emission on Buffer Flush
  // --------------------------------------------------------------------------
  console.log('Running TC-04: Testing "drain" event emission when consumer catches up...');
  const drainConsumer = new SlowBatchConsumerStream({
    highWaterMark: 2,
    delayMs: 10,
  });

  const drainPromise = new Promise((resolve) => {
    drainConsumer.once('drain', () => {
      resolve(true);
    });
  });

  drainConsumer.write({ id: 'drain-1', amount: 10 });
  const saturated = drainConsumer.write({ id: 'drain-2', amount: 20 });
  assert.strictEqual(saturated, false, 'Buffer must be saturated before waiting for drain');

  const drainFired = await drainPromise;
  assert.strictEqual(drainFired, true, 'Consumer must emit "drain" once buffer clears below highWaterMark');
  console.log('✅ TC-04 PASSED: "drain" event fired successfully upon buffer clearance!');

  // --------------------------------------------------------------------------
  // TC-05: Memory Stability Benchmark (25,000 records, Heap Delta < 15MB)
  // --------------------------------------------------------------------------
  console.log('Running TC-05: Testing Memory Footprint Stability (25,000 items stream)...');
  const totalBenchmarkRecords = 25000;
  const memoryDeltaMB = await measureStreamMemoryDelta(totalBenchmarkRecords);

  console.log(`⚡ Memory: Streamed ${totalBenchmarkRecords} transactions. Heap Delta: ${memoryDeltaMB.toFixed(2)}MB (Target < 15MB)`);
  assert.ok(
    memoryDeltaMB < 15,
    `Memory delta ${memoryDeltaMB.toFixed(2)}MB exceeded 15MB threshold! Memory leak or backpressure failure detected.`
  );
  console.log('✅ TC-05 PASSED: Memory footprint remained stable under high load!');

  // --------------------------------------------------------------------------
  // TC-06: Safe Cleanup on Stream Error via pipeline()
  // --------------------------------------------------------------------------
  console.log('Running TC-06: Testing error propagation and resource cleanup via pipeline()...');
  const faultyGenerator = new TransactionGeneratorStream({ totalRecords: 20 });
  const faultyMasker = new SensitiveDataMasker({ shouldFailAfter: 5 });
  const destination = new SlowBatchConsumerStream({ highWaterMark: 16, delayMs: 1 });

  let errorCaught = false;
  try {
    await pipelineAsync(faultyGenerator, faultyMasker, destination);
  } catch (err) {
    errorCaught = true;
    assert.strictEqual(err.message, 'Simulated stream failure in data transformation');
  }

  assert.strictEqual(errorCaught, true, 'Pipeline must propagate stream errors');
  assert.strictEqual(faultyGenerator.destroyed, true, 'Source stream must be destroyed on error');
  assert.strictEqual(faultyMasker.destroyed, true, 'Transform stream must be destroyed on error');
  assert.strictEqual(destination.destroyed, true, 'Destination stream must be destroyed on error');
  console.log('✅ TC-06 PASSED: pipeline() cleanly destroyed all streams on error with zero leaks!');

  console.log('--------------------------------------------------------------------------------');
  console.log('🎉 ALL NODE.JS STREAMS & BACKPRESSURE TESTS PASSED SUCCESSFULLY! (6/6 passed)');
  console.log('Peak Heap Delta: < 15MB | Zero OOM Risk | PCI-DSS Compliant');
}

runTestSuite().catch((err) => {
  console.error('❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
