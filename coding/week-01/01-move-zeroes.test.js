/**
 * Unit Test: Move Zeroes (In-place Two Pointers)
 * 
 * Framework: Native Node.js assert (Zero external dependencies)
 * Command: node coding/week-01/01-move-zeroes.test.js
 */

const assert = require('assert');
const moveZeroes = require('./01-move-zeroes');

function runTests() {
  console.log('--- Starting Test Suite: Move Zeroes (PBL Day 1) ---');

  // Test Case 1: Edge cases (null, undefined, empty array)
  console.log('Running TC-01: Guard clause & Edge cases...');
  assert.strictEqual(moveZeroes(null), null, 'Failed on null input');
  assert.strictEqual(moveZeroes(undefined), undefined, 'Failed on undefined input');
  const emptyArr = [];
  assert.deepStrictEqual(moveZeroes(emptyArr), [], 'Failed on empty array');
  assert.strictEqual(moveZeroes(emptyArr), emptyArr, 'Must return same reference');

  // Test Case 2: Single element array
  console.log('Running TC-02: Single element array...');
  const singleZero = [0];
  assert.deepStrictEqual(moveZeroes(singleZero), [0]);
  assert.strictEqual(moveZeroes(singleZero), singleZero);

  const singleNonZero = [5];
  assert.deepStrictEqual(moveZeroes(singleNonZero), [5]);

  // Test Case 3: Array without zeroes
  console.log('Running TC-03: Array with no zeroes...');
  const noZeroes = [1, 2, 3, 4];
  assert.deepStrictEqual(moveZeroes(noZeroes), [1, 2, 3, 4]);

  // Test Case 4: Array with only zeroes
  console.log('Running TC-04: Array with only zeroes...');
  const allZeroes = [0, 0, 0];
  assert.deepStrictEqual(moveZeroes(allZeroes), [0, 0, 0]);

  // Test Case 5: Standard LeetCode mixed example
  console.log('Running TC-05: Standard mixed array [0, 1, 0, 3, 12]...');
  const standardArr = [0, 1, 0, 3, 12];
  const result = moveZeroes(standardArr);
  assert.deepStrictEqual(result, [1, 3, 12, 0, 0]);
  assert.strictEqual(result, standardArr, 'In-place modification required (must mutate original reference)');

  // Test Case 6: Mixed with negative numbers
  console.log('Running TC-06: Array with negative numbers...');
  const negativeArr = [-1, 0, 0, -2, 5];
  assert.deepStrictEqual(moveZeroes(negativeArr), [-1, -2, 5, 0, 0]);

  // Test Case 7: Trailing zeroes & Leading zeroes
  console.log('Running TC-07: Leading and trailing zeroes...');
  const boundaryArr = [0, 0, 1];
  assert.deepStrictEqual(moveZeroes(boundaryArr), [1, 0, 0]);

  console.log('----------------------------------------------------');
  console.log('✅ ALL TESTS PASSED SUCCESSFULLY! (7/7 test cases passed)');
  console.log('Time Complexity: O(n) | Auxiliary Space Complexity: O(1)');
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;

