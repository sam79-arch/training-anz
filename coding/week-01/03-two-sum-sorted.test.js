/**
 * Unit Test: Two Sum II - Input Array Is Sorted (LeetCode #167)
 * 
 * Framework: Native Node.js assert (Zero external dependencies)
 * Command: node coding/week-01/03-two-sum-sorted.test.js
 */

const assert = require('assert');
const twoSumSorted = require('./03-two-sum-sorted');

function runTests() {
  console.log('--- Starting Test Suite: Two Sum II (Issue #11 - Week 1 Day 3) ---');

  // TC-01: Guard clauses (null, undefined, empty array, single element)
  console.log('Running TC-01: Guard clauses & Edge cases...');
  assert.deepStrictEqual(twoSumSorted(null, 5), [], 'null should return []');
  assert.deepStrictEqual(twoSumSorted(undefined, 5), [], 'undefined should return []');
  assert.deepStrictEqual(twoSumSorted([], 5), [], 'Empty array should return []');
  assert.deepStrictEqual(twoSumSorted([1], 1), [], 'Single element array should return []');
  assert.deepStrictEqual(twoSumSorted('not-an-array', 5), [], 'Non-array type should return []');

  // TC-02: Standard basic case
  console.log('Running TC-02: Standard basic case [2, 7, 11, 15] with target 9...');
  assert.deepStrictEqual(
    twoSumSorted([2, 7, 11, 15], 9),
    [1, 2],
    'Indices of 2 and 7 must be [1, 2]'
  );

  // TC-03: Array with duplicate numbers
  console.log('Running TC-03: Array with duplicate numbers...');
  assert.deepStrictEqual(
    twoSumSorted([2, 3, 4], 6),
    [1, 3],
    'Indices of 2 and 4 must be [1, 3]'
  );
  assert.deepStrictEqual(
    twoSumSorted([0, 0, 3, 4], 0),
    [1, 2],
    'Indices of 0 and 0 must be [1, 2]'
  );
  assert.deepStrictEqual(
    twoSumSorted([5, 5], 10),
    [1, 2],
    'Duplicate pair [5, 5] must be [1, 2]'
  );

  // TC-04: Negative numbers and zero
  console.log('Running TC-04: Mixed negative numbers and zero...');
  assert.deepStrictEqual(
    twoSumSorted([-3, 0, 3, 4], 0),
    [1, 3],
    'Indices of -3 and 3 must be [1, 3]'
  );
  assert.deepStrictEqual(
    twoSumSorted([-5, -2, 0, 3, 5], 0),
    [1, 5],
    'Indices of -5 and 5 must be [1, 5]'
  );

  // TC-05: Both numbers negative
  console.log('Running TC-05: Both numbers negative with negative target...');
  assert.deepStrictEqual(
    twoSumSorted([-5, -3, -1, 0, 2], -8),
    [1, 2],
    'Indices of -5 and -3 must be [1, 2]'
  );
  assert.deepStrictEqual(
    twoSumSorted([-10, -7, -4, -2, 0], -9),
    [2, 4],
    'Indices of -7 and -2 must be [2, 4]'
  );

  // TC-06: Array with exactly two elements
  console.log('Running TC-06: Minimal array with exactly two elements...');
  assert.deepStrictEqual(
    twoSumSorted([-1, 0], -1),
    [1, 2],
    'Minimal array [-1, 0] must return [1, 2]'
  );

  // TC-07: Elements far apart at boundaries of longer array
  console.log('Running TC-07: Elements far apart at boundaries of array...');
  assert.deepStrictEqual(
    twoSumSorted([1, 3, 5, 7, 9, 11, 20], 21),
    [1, 7],
    'Boundary elements 1 and 20 must return [1, 7]'
  );

  console.log('------------------------------------------------------------------------');
  console.log('✅ ALL TWO SUM II TESTS PASSED SUCCESSFULLY! (7/7 test cases passed)');
  console.log('Time Complexity: O(n) | Auxiliary Space Complexity: O(1)');
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
