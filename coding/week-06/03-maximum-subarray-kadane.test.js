/**
 * Unit Test Suite: Maximum Subarray / Kadane's Algorithm (LeetCode #53 - Medium)
 * 
 * Target: HCLTech Vietnam x ANZ Bank Backend Interview Prep
 * Standard: Native Node.js assert, Zero External Dependencies, Test-First Order
 */

const assert = require('node:assert');
const { maxSubArray, maxSubArrayWithIndices } = require('./03-maximum-subarray-kadane.js');

console.log('--- Starting Test Suite: Maximum Subarray / Kadane (Week 6 Day 3) ---');

// TC-01: Guard clauses & Invalid / Empty inputs
console.log('Running TC-01: Guard clauses & Invalid inputs...');
assert.strictEqual(maxSubArray(null), 0, 'Null array should safely return 0');
assert.strictEqual(maxSubArray(undefined), 0, 'Undefined array should safely return 0');
assert.strictEqual(maxSubArray([]), 0, 'Empty array should return 0');
assert.strictEqual(maxSubArray('invalid'), 0, 'Non-array input should return 0');
assert.deepStrictEqual(
  maxSubArrayWithIndices([]),
  { maxSum: 0, start: -1, end: -1, subarray: [] },
  'Empty array with indices returns sentinel empty structure'
);
console.log('✅ TC-01 PASSED: Guard clauses handled invalid inputs safely.');

// TC-02: Standard LeetCode example [-2, 1, -3, 4, -1, 2, 1, -5, 4] -> 6
console.log('Running TC-02: Standard LeetCode example...');
const nums1 = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
assert.strictEqual(maxSubArray(nums1), 6, 'Max sum should be 6 ([4, -1, 2, 1])');
const res1 = maxSubArrayWithIndices(nums1);
assert.strictEqual(res1.maxSum, 6, 'maxSum should be 6');
assert.strictEqual(res1.start, 3, 'Start index should be 3');
assert.strictEqual(res1.end, 6, 'End index should be 6');
assert.deepStrictEqual(res1.subarray, [4, -1, 2, 1], 'Subarray content must match');
console.log('✅ TC-02 PASSED: Standard profit/subarray calculation verified.');

// TC-03: ANZ Crucial Survival Trap: All negative numbers [-5, -1, -8, -3] -> -1
console.log('Running TC-03: All negative numbers (Survival Trap)...');
const numsNeg = [-5, -1, -8, -3];
assert.strictEqual(
  maxSubArray(numsNeg),
  -1,
  'CRITICAL: All-negative array must return -1, NOT 0! Proves nums[0] initialization.'
);
const resNeg = maxSubArrayWithIndices(numsNeg);
assert.strictEqual(resNeg.maxSum, -1, 'maxSum for all negative array must be -1');
assert.strictEqual(resNeg.start, 1, 'Start index should point to -1');
assert.strictEqual(resNeg.end, 1, 'End index should point to -1');
assert.deepStrictEqual(resNeg.subarray, [-1], 'Subarray content must be [-1]');
console.log('✅ TC-03 PASSED: All-negative array safely evaluated (Zero-initialization trap avoided).');

// TC-04: All positive numbers [1, 2, 3, 4] -> 10
console.log('Running TC-04: All positive numbers...');
assert.strictEqual(maxSubArray([1, 2, 3, 4]), 10, 'All positive array sum should be entire sum 10');
const resPos = maxSubArrayWithIndices([1, 2, 3, 4]);
assert.strictEqual(resPos.maxSum, 10, 'maxSum should be 10');
assert.strictEqual(resPos.start, 0, 'Start index should be 0');
assert.strictEqual(resPos.end, 3, 'End index should be 3');
console.log('✅ TC-04 PASSED: All-positive array verified.');

// TC-05: Single element boundary [5] -> 5, [-3] -> -3
console.log('Running TC-05: Single element boundary checks...');
assert.strictEqual(maxSubArray([5]), 5, 'Single positive element returns itself');
assert.strictEqual(maxSubArray([-3]), -3, 'Single negative element returns itself');
assert.deepStrictEqual(
  maxSubArrayWithIndices([-3]),
  { maxSum: -3, start: 0, end: 0, subarray: [-3] },
  'Single negative element index structure verified'
);
console.log('✅ TC-05 PASSED: Single-element boundaries verified.');

// TC-06: Zeroes and alternating signs
console.log('Running TC-06: Zeroes and alternating signs...');
const numsZero = [0, -2, 0, 3, -1, 2, 0];
assert.strictEqual(maxSubArray(numsZero), 4, 'Max sum should be 4 ([3, -1, 2])');
console.log('✅ TC-06 PASSED: Zeroes and alternating signs handled accurately.');

// TC-07: Boundary tracking invariant
console.log('Running TC-07: Subarray boundary tracking invariant...');
const numsCustom = [5, 4, -1, 7, 8];
assert.strictEqual(maxSubArray(numsCustom), 23, 'Entire array sum is 23');
const resCustom = maxSubArrayWithIndices(numsCustom);
assert.strictEqual(resCustom.maxSum, 23);
assert.strictEqual(resCustom.start, 0);
assert.strictEqual(resCustom.end, 4);
console.log('✅ TC-07 PASSED: Boundary tracking invariant verified.');

// TC-08: Stress test 50,000 numbers for O(n) performance
console.log('Running TC-08: Stress test 50,000 numbers...');
const largeArray = Array.from({ length: 50000 }, (_, i) => (i % 2 === 0 ? 3 : -2));
const startTime = process.hrtime.bigint();
const result = maxSubArray(largeArray);
const resultWithIndices = maxSubArrayWithIndices(largeArray);
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

assert.ok(result > 0, 'Result must be strictly positive');
assert.strictEqual(result, resultWithIndices.maxSum, 'Both functions must return identical max sum');
assert.ok(durationMs < 10.0, `Execution time (${durationMs.toFixed(3)}ms) exceeded 10ms limit`);
console.log(`⚡ Execution time for 50,000 numbers: ${durationMs.toFixed(3)}ms`);
console.log('✅ TC-08 PASSED: Linear O(n) scaling verified for 50,000 numbers.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 8 MAXIMUM SUBARRAY (KADANE) TESTS PASSED! (Week 6 Day 3)');
console.log('Time Complexity: O(n) | Auxiliary Space Complexity: O(1)');

