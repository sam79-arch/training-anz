/**
 * Unit Test: Two Sum & Contains Duplicate (Hashing Space-Time Tradeoff)
 * 
 * Framework: Native Node.js assert (Zero external dependencies)
 * Command: node coding/week-01/04-two-sum-hash.test.js
 * Reference: Issue #13 & docs/plans/pilot-day-05-two-sum-hash.md
 */

const assert = require('assert');
const { twoSum, containsDuplicate } = require('./04-two-sum-hash');

function runTests() {
  console.log('--- Starting Test Suite: Two Sum & Contains Duplicate (Issue #13 - Day 5) ---');

  // ==========================================
  // SECTION 1: TWO SUM TESTS (LeetCode #1)
  // ==========================================

  // TC-01: Two Sum Guard Clauses
  console.log('Running TC-01: Two Sum - Guard clauses & Edge cases...');
  assert.deepStrictEqual(twoSum(null, 9), [], 'null nums should return []');
  assert.deepStrictEqual(twoSum(undefined, 9), [], 'undefined nums should return []');
  assert.deepStrictEqual(twoSum([], 9), [], 'Empty array should return []');
  assert.deepStrictEqual(twoSum([1], 1), [], 'Single element array should return []');
  assert.deepStrictEqual(twoSum('not-array', 5), [], 'Non-array input should return []');

  // TC-02: Two Sum Standard basic case
  console.log('Running TC-02: Two Sum - Standard case [2, 7, 11, 15] with target 9...');
  assert.deepStrictEqual(
    twoSum([2, 7, 11, 15], 9),
    [0, 1],
    'Indices of 2 and 7 must be [0, 1]'
  );

  // TC-03: Two Sum Duplicate values
  console.log('Running TC-03: Two Sum - Duplicate values forming target [3, 3], target 6...');
  assert.deepStrictEqual(
    twoSum([3, 3], 6),
    [0, 1],
    'Duplicate values [3, 3] must return [0, 1]'
  );

  // TC-04: Two Sum Negative numbers
  console.log('Running TC-04: Two Sum - Negative numbers [-1, -2, -3, -4, -5], target -8...');
  assert.deepStrictEqual(
    twoSum([-1, -2, -3, -4, -5], -8),
    [2, 4],
    'Indices of -3 and -5 must be [2, 4]'
  );

  // TC-05: Two Sum Mixed numbers with Zero
  console.log('Running TC-05: Two Sum - Mixed positive, negative, and zeroes [0, 4, 3, 0], target 0...');
  assert.deepStrictEqual(
    twoSum([0, 4, 3, 0], 0),
    [0, 3],
    'Indices of zeroes must be [0, 3]'
  );

  // TC-06: Two Sum Unsorted & Displaced indices
  console.log('Running TC-06: Two Sum - Unsorted array [3, 2, 4], target 6...');
  assert.deepStrictEqual(
    twoSum([3, 2, 4], 6),
    [1, 2],
    'Indices of 2 and 4 must be [1, 2]'
  );

  // TC-07: Two Sum No solution exists
  console.log('Running TC-07: Two Sum - No pair matching target [1, 2, 3], target 7...');
  assert.deepStrictEqual(
    twoSum([1, 2, 3], 7),
    [],
    'No valid pair should return []'
  );

  // ==========================================
  // SECTION 2: CONTAINS DUPLICATE TESTS (LeetCode #217)
  // ==========================================

  // TC-08: Contains Duplicate Guard Clauses
  console.log('Running TC-08: Contains Duplicate - Guard clauses & Edge cases...');
  assert.strictEqual(containsDuplicate(null), false, 'null should return false');
  assert.strictEqual(containsDuplicate(undefined), false, 'undefined should return false');
  assert.strictEqual(containsDuplicate([]), false, 'Empty array should return false');
  assert.strictEqual(containsDuplicate([1]), false, 'Single element array should return false');
  assert.strictEqual(containsDuplicate('invalid'), false, 'Non-array should return false');

  // TC-09: Contains Duplicate Standard True
  console.log('Running TC-09: Contains Duplicate - Array with duplicates [1, 2, 3, 1]...');
  assert.strictEqual(
    containsDuplicate([1, 2, 3, 1]),
    true,
    'Array with duplicate 1 should return true'
  );

  // TC-10: Contains Duplicate Standard False
  console.log('Running TC-10: Contains Duplicate - Array with all unique elements [1, 2, 3, 4]...');
  assert.strictEqual(
    containsDuplicate([1, 2, 3, 4]),
    false,
    'Array with unique elements should return false'
  );

  // TC-11: Contains Duplicate Negative Numbers & Multiple Duplicates
  console.log('Running TC-11: Contains Duplicate - Multiple duplicates with negative numbers...');
  assert.strictEqual(
    containsDuplicate([1, 1, 1, 3, 3, 4, 3, 2, 4, 2]),
    true,
    'Multiple duplicates should return true'
  );
  assert.strictEqual(
    containsDuplicate([-1, -2, -3, -1]),
    true,
    'Duplicate negative numbers should return true'
  );
  assert.strictEqual(
    containsDuplicate([-1, -2, -3, -4]),
    false,
    'Unique negative numbers should return false'
  );

  // TC-12: Contains Duplicate Large-scale Early-Exit Verification (Idempotency Simulation)
  console.log('Running TC-12: Contains Duplicate - Early-Exit performance check (10,000 items)...');
  const largeArray = [999, 999]; // Duplicate right at the start
  for (let i = 0; i < 10000; i++) {
    largeArray.push(i);
  }
  const start = process.hrtime.bigint();
  const hasDup = containsDuplicate(largeArray);
  const end = process.hrtime.bigint();
  const durationMicros = Number(end - start) / 1000;

  assert.strictEqual(hasDup, true, 'Large array should return true');
  assert(durationMicros < 1000, `Early exit should execute in < 1ms, took ${durationMicros}µs`);
  console.log(`⚡ Early-exit detected duplicate in ${durationMicros.toFixed(2)}µs without scanning full array!`);

  console.log('------------------------------------------------------------------------');
  console.log('✅ ALL TWO SUM & CONTAINS DUPLICATE TESTS PASSED SUCCESSFULLY! (12/12 test cases)');
  console.log('Time Complexity: O(n) | Auxiliary Space Complexity: O(n)');
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;

