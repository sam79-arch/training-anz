/**
 * Unit Test Suite: Binary Search Boundary Drill & Friday Recall Test 15m
 * 
 * Target: HCLTech Vietnam x ANZ Bank Backend Interview Prep
 * Standard: Native Node.js assert, Zero External Dependencies, Test-First Order
 */

const assert = require('node:assert');
const {
  fridayRecallBestTimeToBuyStock,
  firstBadVersion
} = require('./05-binary-search-boundary-and-recall.js');

console.log('--- Starting Test Suite: Binary Search Boundary & Friday Recall (Week 6 Day 5) ---');

// TC-01: Friday Recall Test 15m — Best Time to Buy and Sell Stock from memory
console.log('Running TC-01: Friday Recall Test (Best Time to Buy Stock)...');
assert.strictEqual(
  fridayRecallBestTimeToBuyStock([7, 1, 5, 3, 6, 4]),
  5,
  'Standard case: Buy at 1, sell at 6 -> profit 5'
);
assert.strictEqual(
  fridayRecallBestTimeToBuyStock([7, 6, 4, 3, 1]),
  0,
  'Monotonically decreasing prices -> 0 profit'
);
assert.strictEqual(
  fridayRecallBestTimeToBuyStock([2, 4, 1]),
  2,
  'Time-arrow invariant: Buy at 2, sell at 4 -> profit 2'
);
assert.strictEqual(fridayRecallBestTimeToBuyStock([]), 0, 'Empty array returns 0');
console.log('✅ TC-01 PASSED: Friday Recall Test verified Best Time to Buy Stock from memory.');

// TC-02: Boundary Drill — Guard clauses & invalid inputs
console.log('Running TC-02: First Bad Version guard clauses...');
assert.strictEqual(firstBadVersion(0, () => true), 0, 'Invalid n=0 returns 0');
assert.strictEqual(firstBadVersion(-5, () => true), 0, 'Negative n returns 0');
assert.strictEqual(firstBadVersion(10, null), 0, 'Null validator returns 0');
console.log('✅ TC-02 PASSED: Guard clauses handled invalid inputs safely.');

// TC-03: First Bad Version in beginning, middle, and end of range
console.log('Running TC-03: First Bad Version across positions...');
// Case: First version is bad (bad = 1)
assert.strictEqual(firstBadVersion(5, (v) => v >= 1), 1, 'First bad version at 1');

// Case: Middle version is bad (bad = 4 out of 5)
assert.strictEqual(firstBadVersion(5, (v) => v >= 4), 4, 'First bad version at 4');

// Case: Last version is bad (bad = 10 out of 10)
assert.strictEqual(firstBadVersion(10, (v) => v >= 10), 10, 'First bad version at 10');
console.log('✅ TC-03 PASSED: Positions verified across start, middle, and end.');

// TC-04: Single version boundary check
console.log('Running TC-04: Single version boundary...');
assert.strictEqual(firstBadVersion(1, (v) => v >= 1), 1, 'Single version that is bad returns 1');
assert.strictEqual(firstBadVersion(1, () => false), 0, 'Single version that is good returns 0');
console.log('✅ TC-04 PASSED: Single version boundary verified.');

// TC-05: None of versions bad
console.log('Running TC-05: No bad versions in entire sequence...');
assert.strictEqual(firstBadVersion(100, () => false), 0, 'When no versions are bad, returns 0');
console.log('✅ TC-05 PASSED: Handled scenario with no bad versions gracefully.');

// TC-06: Invariant: Optimal API call count (Logarithmic calls <= ceil(log2 n) + 1)
console.log('Running TC-06: Minimal API call count invariant...');
let apiCallCount = 0;
const n = 1000;
const badTarget = 654;
const isBad = (v) => {
  apiCallCount++;
  return v >= badTarget;
};

const result = firstBadVersion(n, isBad);
assert.strictEqual(result, badTarget, 'Detected exact bad version');
const maxExpectedCalls = Math.ceil(Math.log2(n)) + 1; // 10 + 1 = 11 calls max
assert.ok(
  apiCallCount <= maxExpectedCalls,
  `API calls (${apiCallCount}) exceeded theoretical logarithmic limit (${maxExpectedCalls})`
);
console.log(`⚡ API call count for n=1000: ${apiCallCount} calls (Logarithmic bound <= ${maxExpectedCalls})`);
console.log('✅ TC-06 PASSED: Minimal API call count strictly verified.');

// TC-07: Invariant boundary convergence (left < right template)
console.log('Running TC-07: Boundary convergence check...');
assert.strictEqual(firstBadVersion(2, (v) => v >= 2), 2, 'Two elements: [Good, Bad] -> 2');
assert.strictEqual(firstBadVersion(2, (v) => v >= 1), 1, 'Two elements: [Bad, Bad] -> 1');
console.log('✅ TC-07 PASSED: Two-element boundary convergence verified.');

// TC-08: Stress test 1,000,000 versions for O(log n) efficiency
console.log('Running TC-08: Stress test 1,000,000 versions...');
const million = 1000000;
const badMillion = 777777;
let callsMillion = 0;
const isBadMillion = (v) => {
  callsMillion++;
  return v >= badMillion;
};

const startTime = process.hrtime.bigint();
const millionResult = firstBadVersion(million, isBadMillion);
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

assert.strictEqual(millionResult, badMillion, 'Found first bad version in 1M');
assert.ok(callsMillion <= 21, `API calls for 1M exceeded 21 (actual: ${callsMillion})`);
assert.ok(durationMs < 2.0, `Duration (${durationMs.toFixed(3)}ms) exceeded 2ms`);
console.log(`⚡ Execution time for 1,000,000 versions: ${durationMs.toFixed(3)}ms (${callsMillion} API calls)`);
console.log('✅ TC-08 PASSED: Logarithmic O(log n) efficiency verified for 1M versions.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 8 BINARY SEARCH BOUNDARY & FRIDAY RECALL TESTS PASSED! (Week 6 Day 5)');
console.log('Time Complexity: O(log n) | Auxiliary Space Complexity: O(1)');

