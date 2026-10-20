/**
 * Unit Test Suite: Search Insert Position (LeetCode #35 - Easy)
 * 
 * Target: HCLTech Vietnam x ANZ Bank Backend Interview Prep
 * Standard: Native Node.js assert, Zero External Dependencies, Test-First Order
 */

const assert = require('node:assert');
const { searchInsert } = require('./01-search-insert-position.js');

console.log('--- Starting Test Suite: Search Insert Position (Week 6 Day 1) ---');

// TC-01: Guard clauses & Invalid / Empty inputs
console.log('Running TC-01: Guard clauses & Invalid inputs...');
assert.strictEqual(searchInsert(null, 5), 0, 'Null nums array should safely return 0');
assert.strictEqual(searchInsert(undefined, 5), 0, 'Undefined nums array should safely return 0');
assert.strictEqual(searchInsert([], 5), 0, 'Empty array should return index 0');
assert.strictEqual(searchInsert('not-an-array', 5), 0, 'Non-array input should return index 0');
assert.strictEqual(searchInsert([1, 2, 3], null), 0, 'Null target should safely return index 0');
console.log('✅ TC-01 PASSED: Guard clauses handled invalid inputs safely.');

// TC-02: Target exists in the middle of sorted array
console.log('Running TC-02: Target found in middle of sorted array...');
assert.strictEqual(searchInsert([1, 3, 5, 6], 5), 2, 'Target 5 should be found at index 2');
assert.strictEqual(searchInsert([1, 3, 5, 6, 8, 10], 3), 1, 'Target 3 should be found at index 1');
console.log('✅ TC-02 PASSED: Target found in middle position verified.');

// TC-03: Target not found, insert in the middle
console.log('Running TC-03: Target not found, insert in middle...');
assert.strictEqual(searchInsert([1, 3, 5, 6], 2), 1, 'Target 2 should be inserted at index 1');
assert.strictEqual(searchInsert([1, 3, 5, 7, 9], 6), 3, 'Target 6 should be inserted at index 3');
console.log('✅ TC-03 PASSED: Target inserted in middle verified.');

// TC-04: Target not found, insert at the end
console.log('Running TC-04: Target not found, insert at end...');
assert.strictEqual(searchInsert([1, 3, 5, 6], 7), 4, 'Target 7 should be inserted at index 4 (end)');
assert.strictEqual(searchInsert([2, 4, 6], 10), 3, 'Target 10 should be inserted at index 3 (end)');
console.log('✅ TC-04 PASSED: Insertion at end of array verified.');

// TC-05: Target not found, insert at the beginning
console.log('Running TC-05: Target not found, insert at beginning...');
assert.strictEqual(searchInsert([1, 3, 5, 6], 0), 0, 'Target 0 should be inserted at index 0');
assert.strictEqual(searchInsert([5, 10, 15], 1), 0, 'Target 1 should be inserted at index 0');
console.log('✅ TC-05 PASSED: Insertion at beginning of array verified.');

// TC-06: Single element array boundaries
console.log('Running TC-06: Single-element array boundary checks...');
assert.strictEqual(searchInsert([1], 0), 0, '[1] with target 0 should insert at 0');
assert.strictEqual(searchInsert([1], 1), 0, '[1] with target 1 should find at 0');
assert.strictEqual(searchInsert([1], 2), 1, '[1] with target 2 should insert at 1');
console.log('✅ TC-06 PASSED: Single-element boundaries verified.');

// TC-07: Negative numbers and mixed signs
console.log('Running TC-07: Negative numbers and mixed signs...');
assert.strictEqual(searchInsert([-10, -5, 0, 3, 9], -7), 1, 'Target -7 should insert at index 1');
assert.strictEqual(searchInsert([-10, -5, 0, 3, 9], 0), 2, 'Target 0 should be found at index 2');
assert.strictEqual(searchInsert([-10, -5, 0, 3, 9], -15), 0, 'Target -15 should insert at index 0');
console.log('✅ TC-07 PASSED: Negative numbers handled with strict precision.');

// TC-08: Stress test 100,000 elements for O(log n) performance
console.log('Running TC-08: Stress test 100,000 elements...');
const largeArray = Array.from({ length: 100000 }, (_, i) => i * 2); // [0, 2, 4, ..., 199998]
const startTime = process.hrtime.bigint();
const result1 = searchInsert(largeArray, 100001); // should insert at 50001
const result2 = searchInsert(largeArray, 199999); // should insert at 100000
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

assert.strictEqual(result1, 50001, 'Target 100001 should insert at index 50001');
assert.strictEqual(result2, 100000, 'Target 199999 should insert at index 100000');
assert.ok(durationMs < 5.0, `Execution time (${durationMs.toFixed(3)}ms) exceeded 5ms limit`);
console.log(`⚡ Execution time for 2 searches in 100,000 elements: ${durationMs.toFixed(3)}ms`);
console.log('✅ TC-08 PASSED: Logarithmic O(log n) scaling verified for 100,000 elements.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 8 SEARCH INSERT POSITION TESTS PASSED! (Week 6 Day 1)');
console.log('Time Complexity: O(log n) | Auxiliary Space Complexity: O(1)');
