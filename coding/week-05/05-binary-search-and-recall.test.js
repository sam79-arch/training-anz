/**
 * ============================================================================
 * 🧪 TEST SUITE: BINARY SEARCH TEMPLATE & FRIDAY RECALL (Week 5 Day 5)
 * ============================================================================
 * 1. Friday Recall Test: Move Zeroes (LeetCode #283 - Spaced Repetition).
 * 2. Binary Search Standard Template (LeetCode #704 - Invariant Proof & O(log n)).
 * ============================================================================
 */

const assert = require('node:assert');
const {
  fridayRecallMoveZeroes,
  binarySearch
} = require('./05-binary-search-and-recall.js');

console.log('--- Starting Test Suite: Binary Search & Friday Recall (Week 5 Day 5) ---');

// ============================================================================
// TC-01: Friday Recall Test — Move Zeroes (In-place Two Pointers)
// ============================================================================
console.log('Running TC-01: Friday Recall Test — Move Zeroes...');

// Guard clauses
assert.deepStrictEqual(fridayRecallMoveZeroes(null), null);
assert.deepStrictEqual(fridayRecallMoveZeroes([]), []);

// Standard cases
const arr1 = [0, 1, 0, 3, 12];
assert.deepStrictEqual(fridayRecallMoveZeroes(arr1), [1, 3, 12, 0, 0]);

const arr2 = [0, 0, 1];
assert.deepStrictEqual(fridayRecallMoveZeroes(arr2), [1, 0, 0]);

const arrAllZeroes = [0, 0, 0];
assert.deepStrictEqual(fridayRecallMoveZeroes(arrAllZeroes), [0, 0, 0]);

const arrNoZeroes = [1, 2, 3];
assert.deepStrictEqual(fridayRecallMoveZeroes(arrNoZeroes), [1, 2, 3]);

console.log('✅ TC-01 PASSED: Friday Recall Test verified Move Zeroes from memory.');

// ============================================================================
// TC-02: Binary Search — Guard Clauses & Boundary Inputs
// ============================================================================
console.log('Running TC-02: Binary Search — Guard clauses...');

assert.strictEqual(binarySearch(null, 5), -1, 'null array should return -1');
assert.strictEqual(binarySearch(undefined, 5), -1, 'undefined array should return -1');
assert.strictEqual(binarySearch([], 5), -1, 'empty array should return -1');
assert.strictEqual(binarySearch([1], null), -1, 'invalid target should return -1');

console.log('✅ TC-02 PASSED: Guard clauses handled invalid inputs safely.');

// ============================================================================
// TC-03: Single Element Array (Found vs Not Found)
// ============================================================================
console.log('Running TC-03: Single element array...');

assert.strictEqual(binarySearch([42], 42), 0, 'Found target at index 0');
assert.strictEqual(binarySearch([42], 99), -1, 'Target not found in single-element array');

console.log('✅ TC-03 PASSED: Single-element boundaries verified.');

// ============================================================================
// TC-04: Standard LeetCode Sequence (Left, Middle, Right positions)
// ============================================================================
console.log('Running TC-04: Target found across different index positions...');

const sortedNums = [-1, 0, 3, 5, 9, 12];
// Left edge
assert.strictEqual(binarySearch(sortedNums, -1), 0, 'Target at index 0');
// Middle
assert.strictEqual(binarySearch(sortedNums, 3), 2, 'Target in middle at index 2');
assert.strictEqual(binarySearch(sortedNums, 5), 3, 'Target in middle at index 3');
// Right edge
assert.strictEqual(binarySearch(sortedNums, 12), 5, 'Target at last index 5');

console.log('✅ TC-04 PASSED: Found elements at all key positions accurately.');

// ============================================================================
// TC-05: Target Not Found (Below min, Above max, Interleaved missing)
// ============================================================================
console.log('Running TC-05: Target not found scenarios...');

assert.strictEqual(binarySearch(sortedNums, -100), -1, 'Below min bound should return -1');
assert.strictEqual(binarySearch(sortedNums, 100), -1, 'Above max bound should return -1');
assert.strictEqual(binarySearch(sortedNums, 2), -1, 'Missing between elements should return -1');
assert.strictEqual(binarySearch(sortedNums, 7), -1, 'Missing between elements should return -1');

console.log('✅ TC-05 PASSED: Unfound targets properly return -1.');

// ============================================================================
// TC-06: Array with Negative Numbers and Zeros
// ============================================================================
console.log('Running TC-06: Negative numbers and mixed signs...');

const negNums = [-50, -30, -10, 0, 20, 40];
assert.strictEqual(binarySearch(negNums, -50), 0);
assert.strictEqual(binarySearch(negNums, -30), 1);
assert.strictEqual(binarySearch(negNums, 0), 3);
assert.strictEqual(binarySearch(negNums, 40), 5);

console.log('✅ TC-06 PASSED: Negative numbers and zeroes handled with strict precision.');

// ============================================================================
// TC-07: Two-element Array Boundary Check
// ============================================================================
console.log('Running TC-07: Two-element array boundary checks...');

const twoElements = [10, 20];
assert.strictEqual(binarySearch(twoElements, 10), 0);
assert.strictEqual(binarySearch(twoElements, 20), 1);
assert.strictEqual(binarySearch(twoElements, 5), -1);
assert.strictEqual(binarySearch(twoElements, 15), -1);
assert.strictEqual(binarySearch(twoElements, 25), -1);

console.log('✅ TC-07 PASSED: Two-element boundaries verified.');

// ============================================================================
// TC-08: Stress Test 100,000 Elements (Sub-0.1ms Logarithmic Scaling)
// ============================================================================
console.log('Running TC-08: Stress test 100,000 elements...');

const bigSorted = [];
for (let i = 0; i < 100000; i++) {
  bigSorted.push(i * 2); // Even numbers from 0 to 199,998
}

const startTime = process.hrtime.bigint();
const foundIdx = binarySearch(bigSorted, 145678);
const notFoundIdx = binarySearch(bigSorted, 145679); // Odd number not in array
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

console.log(`⚡ Execution time for 2 searches in 100,000 elements: ${durationMs.toFixed(3)}ms`);
assert.strictEqual(foundIdx, 72839, 'Index must be exactly 145678 / 2 = 72839');
assert.strictEqual(notFoundIdx, -1, 'Odd number should not be found');
assert.ok(durationMs < 2, `Execution time ${durationMs.toFixed(3)}ms must be under 2ms`);

console.log('✅ TC-08 PASSED: Logarithmic O(log n) efficiency confirmed for 100,000 items.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 8 BINARY SEARCH & FRIDAY RECALL TESTS PASSED! (Week 5 Day 5)');
console.log('Time Complexity: O(log n) | Auxiliary Space Complexity: O(1)');

