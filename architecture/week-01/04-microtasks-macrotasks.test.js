/**
 * Unit Test / Verification: Node.js Microtasks vs Macrotasks & Starvation
 * Framework: Native Node.js assert (Zero external dependencies)
 * Command: node architecture/week-01/04-microtasks-macrotasks.test.js
 * Reference: Issue #12 & docs/plans/pilot-day-04-event-loop-microtasks.md
 */

const assert = require('assert');

/**
 * Helper function to assert log order with guard clause
 */
function assertLogOrder(logs, expected, label) {
  if (!Array.isArray(logs) || !Array.isArray(expected)) {
    throw new TypeError('assertLogOrder: logs and expected must be arrays');
  }
  assert.deepStrictEqual(logs, expected, label || 'Log order mismatch');
}

/**
 * TC-01: Microtask Priority Order
 * Verifies that nextTickQueue is drained to exhaustion before microtaskQueue (Promise, queueMicrotask),
 * regardless of registration order.
 */
function testMicrotaskPriority() {
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      try {
        console.log('Running TC-01: Testing Microtask Priority (Sync -> nextTick -> Promise -> queueMicrotask)...');
        const logs = [];

        logs.push('1: sync-start');

        // Register Promise first
        Promise.resolve().then(() => {
          logs.push('4: promise');
        });

        // Register queueMicrotask second
        queueMicrotask(() => {
          logs.push('5: queueMicrotask');
        });

        // Register process.nextTick LAST to prove priority overrides registration order
        process.nextTick(() => {
          logs.push('3: nextTick');
        });

        logs.push('2: sync-end');

        // Wait for microtasks to fully drain
        setImmediate(() => {
          try {
            assertLogOrder(logs, [
              '1: sync-start',
              '2: sync-end',
              '3: nextTick',
              '4: promise',
              '5: queueMicrotask'
            ], 'TC-01 Failed: Microtask priority order violated');
            console.log('✅ TC-01 PASSED: Sync runs first, nextTick drained before Promise and queueMicrotask!');
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * TC-02: Node 11+ Per-Macrotask Microtask Draining
 * Verifies that since Node 11 (HTML5 spec alignment), microtasks scheduled inside a macrotask
 * are drained immediately after THAT callback, before the next macrotask in the queue.
 */
function testNode11InterleavedMicrotask() {
  return new Promise((resolve, reject) => {
    try {
      console.log('Running TC-02: Testing Node 11+ Per-Macrotask Microtask Flushing...');
      const logs = [];

      setTimeout(() => {
        logs.push('1: timer-1');
        Promise.resolve().then(() => {
          logs.push('2: promise-in-timer-1');
        });
      }, 0);

      setTimeout(() => {
        logs.push('3: timer-2');
        try {
          assertLogOrder(logs, [
            '1: timer-1',
            '2: promise-in-timer-1',
            '3: timer-2'
          ], 'TC-02 Failed: Promise in timer-1 must run before timer-2 in Node 11+');
          console.log('✅ TC-02 PASSED: Microtasks flush after EACH macrotask callback (Node 11+ spec)!');
          resolve();
        } catch (err) {
          reject(err);
        }
      }, 0);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * TC-03: Bounded Starvation Probe (nextTick Starvation vs setImmediate Cooperative Scheduling)
 * Verifies that recursive process.nextTick starves the Check phase (probeNextTick === N),
 * whereas recursive setImmediate yields between turns (probeImmediate < N).
 */
function testStarvationVsCooperativeScheduling() {
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      try {
        console.log('Running TC-03: Testing Starvation vs Cooperative Scheduling (N = 1000)...');
        const N = 1000;

        // Part A: Recursive nextTick starvation
        let tickCount = 0;
        let probeNextTick = null;

        // Probe scheduled in Check phase before recursive nextTick begins
        setImmediate(() => {
          probeNextTick = tickCount;
        });

        function runNextTick() {
          tickCount++;
          if (tickCount < N) {
            process.nextTick(runNextTick);
          }
        }
        runNextTick();

        // Part B & Verification: After Part A drains into Check phase
        const checkInterval = setInterval(() => {
          if (probeNextTick !== null) {
            clearInterval(checkInterval);

            // Now test setImmediate cooperative scheduling
            let immCount = 0;
            let probeImmediate = null;
            let stopImmediate = false;

            function runImmediate() {
              immCount++;
              if (immCount < N && !stopImmediate) {
                setImmediate(runImmediate);
              }
            }
            runImmediate();

            // Probe scheduled in same Check phase turn
            setImmediate(() => {
              probeImmediate = immCount;
            });

            const pollImmediate = setInterval(() => {
              if (probeImmediate !== null) {
                clearInterval(pollImmediate);
                stopImmediate = true;

                try {
                  // In nextTick, probe runs ONLY after all N iterations finish (starvation)
                  assert.strictEqual(probeNextTick, N, `TC-03 Failed: probeNextTick should be ${N}, got ${probeNextTick}`);

                  // In setImmediate, probe runs cooperatively before all N iterations complete
                  assert(probeImmediate < N, `TC-03 Failed: probeImmediate (${probeImmediate}) should be < ${N}`);
                  assert(probeImmediate < probeNextTick, 'TC-03 Failed: Cooperative probe should observe count < starved probe');

                  console.log(`✅ TC-03 PASSED: nextTick starved probe until count=${probeNextTick}; setImmediate yielded at count=${probeImmediate}!`);
                  resolve();
                } catch (err) {
                  reject(err);
                }
              }
            }, 5);
          }
        }, 5);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * TC-04: Deterministic 3-Level Async Tracing Puzzle (11 tokens)
 * Top-level sync -> nextTick/Promise -> setImmediate (nested setTimeout)
 * Guaranteed 100% deterministic ordering across all OS platforms (no top-level timer race).
 */
function testComplexAsyncInterviewPuzzle() {
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      try {
        console.log('Running TC-04: Testing Deterministic 3-Level Async Tracing Puzzle (11 tokens)...');
        const logs = [];

        logs.push('1: sync-start');

        // Top-level nextTicks
        process.nextTick(() => {
          logs.push('3: nextTick-1');
          process.nextTick(() => {
            logs.push('4: nextTick-2');
          });
        });

        // Top-level Promises
        Promise.resolve().then(() => {
          logs.push('5: promise-1');
          Promise.resolve().then(() => {
            logs.push('6: promise-2');
          });
        });

        logs.push('2: sync-end');

        // Single top-level macrotask to eliminate timer/immediate competition
        setImmediate(() => {
          logs.push('7: setImmediate');

          process.nextTick(() => {
            logs.push('8: nextTick-in-immediate');
          });

          Promise.resolve().then(() => {
            logs.push('9: promise-in-immediate');
          });

          // Nested timer inside setImmediate ensures deterministic execution after immediate phase
          setTimeout(() => {
            logs.push('10: setTimeout-nested');

            process.nextTick(() => {
              logs.push('11: nextTick-in-timeout');

              try {
                assertLogOrder(logs, [
                  '1: sync-start',
                  '2: sync-end',
                  '3: nextTick-1',
                  '4: nextTick-2',
                  '5: promise-1',
                  '6: promise-2',
                  '7: setImmediate',
                  '8: nextTick-in-immediate',
                  '9: promise-in-immediate',
                  '10: setTimeout-nested',
                  '11: nextTick-in-timeout'
                ], 'TC-04 Failed: Complex async tracing output mismatched');
                console.log('✅ TC-04 PASSED: 11-token async execution trace matched 100% deterministically!');
                resolve();
              } catch (err) {
                reject(err);
              }
            });
          }, 0);
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Runner function for all test cases
 */
async function runAllTests() {
  if (typeof assert !== 'function' && typeof assert !== 'object') {
    throw new TypeError('assert module must be available');
  }

  console.log('--- Starting Test Suite: Microtasks vs Macrotasks & Starvation (Issue #12) ---');
  await testMicrotaskPriority();
  await testNode11InterleavedMicrotask();
  await testStarvationVsCooperativeScheduling();
  await testComplexAsyncInterviewPuzzle();
  console.log('--------------------------------------------------------------------------------');
  console.log('🎉 ALL DAY 04 MICROTASKS & MACROTASKS TESTS PASSED SUCCESSFULLY!');
}

if (require.main === module) {
  runAllTests().catch((err) => {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  });
}

module.exports = runAllTests;

