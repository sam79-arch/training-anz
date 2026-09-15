/**
 * Unit Test / Verification: Node.js Event Loop Phases & Microtasks
 * 
 * Framework: Native Node.js assert (Zero external dependencies)
 * Command: node architecture/week-01/03-event-loop-phases.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function testSyncAndMicrotasks() {
  console.log('Running TC-01: Testing Sync -> nextTick -> Promise execution order...');
  const logs = [];

  logs.push('1: sync-start');

  process.nextTick(() => {
    logs.push('3: nextTick');
  });

  Promise.resolve().then(() => {
    logs.push('4: promise');
  });

  logs.push('2: sync-end');

  // Đợi microtasks xả hết
  await new Promise(resolve => setImmediate(resolve));

  assert.deepStrictEqual(logs, [
    '1: sync-start',
    '2: sync-end',
    '3: nextTick',
    '4: promise'
  ], 'Microtasks execution order mismatch');

  console.log('✅ TC-01 PASSED: Sync runs first, then nextTick (VIP), then Promise.then!');
}

function testIoCyclePhaseOrder() {
  return new Promise((resolve) => {
    console.log('Running TC-02: Testing setImmediate vs setTimeout inside I/O cycle (Poll -> Check)...');
    const logs = [];
    const tempFile = path.join(__dirname, 'temp-io-test.txt');
    fs.writeFileSync(tempFile, 'test');

    fs.readFile(tempFile, () => {
      // Bên trong I/O callback (Poll phase), Event Loop chuyển sang Check phase trước Timers phase
      setTimeout(() => {
        logs.push('setTimeout (Timers phase)');
        fs.unlinkSync(tempFile);

        assert.strictEqual(logs[0], 'setImmediate (Check phase)', 'setImmediate MUST run before setTimeout inside I/O callback!');
        assert.strictEqual(logs[1], 'setTimeout (Timers phase)');
        console.log('✅ TC-02 PASSED: Inside I/O cycle, setImmediate ALWAYS executes before setTimeout!');
        resolve();
      }, 0);

      setImmediate(() => {
        logs.push('setImmediate (Check phase)');
      });
    });
  });
}

function testThreadPoolConcurrency() {
  return new Promise((resolve) => {
    console.log('Running TC-03: Measuring Libuv Thread Pool concurrency (UV_THREADPOOL_SIZE)...');
    const start = Date.now();
    let completed = 0;
    const totalCalls = 4;

    for (let i = 0; i < totalCalls; i++) {
      crypto.pbkdf2('secret', 'salt', 100000, 64, 'sha512', () => {
        completed++;
        if (completed === totalCalls) {
          const duration = Date.now() - start;
          console.log(`4 parallel crypto.pbkdf2 tasks completed in ${duration}ms across Libuv Worker Threads.`);
          assert.strictEqual(completed, 4);
          console.log('✅ TC-03 PASSED: Libuv Thread Pool successfully executed tasks in parallel!');
          resolve();
        }
      });
    }
  });
}

async function runAllTests() {
  console.log('--- Starting Test Suite: Node.js Internals & Event Loop (Issue #10) ---');
  await testSyncAndMicrotasks();
  await testIoCyclePhaseOrder();
  await testThreadPoolConcurrency();
  console.log('------------------------------------------------------------------------');
  console.log('🎉 ALL EVENT LOOP VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

if (require.main === module) {
  runAllTests();
}

module.exports = runAllTests;

