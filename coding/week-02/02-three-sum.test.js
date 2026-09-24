/**
 * ============================================================================
 * 🧪 TEST SUITE: 3SUM (LeetCode #15 - Week 2 Day 2)
 * ============================================================================
 * Quy chuẩn kiểm thử:
 * - Native node:assert (Zero external npm libraries)
 * - Test-First Discipline: Viết toàn bộ 8 test cases trước khi code logic
 * - Bao quát 100% edge cases: Null, empty, all zeroes, duplicate triplets, benchmark
 * ============================================================================
 */

const assert = require('node:assert');
const { threeSum } = require('./02-three-sum');

console.log('--- Starting Test Suite: 3Sum (Week 2 Day 2) ---');

// Helper chuẩn hóa các bộ ba để so sánh bất kể thứ tự trả về
function normalizeTriplets(triplets) {
  if (!Array.isArray(triplets)) return [];
  return triplets
    .map(t => [...t].sort((a, b) => a - b)) // Sắp xếp số trong từng bộ ba
    .sort((a, b) => {
      // Sắp xếp các bộ ba theo từng phần tử
      if (a[0] !== b[0]) return a[0] - b[0];
      if (a[1] !== b[1]) return a[1] - b[1];
      return a[2] - b[2];
    });
}

console.log('Running TC-01: Guard clause & Edge cases (null, undefined, invalid type, length < 3)...');
assert.deepStrictEqual(threeSum(null), [], 'Should return [] when input is null');
assert.deepStrictEqual(threeSum(undefined), [], 'Should return [] when input is undefined');
assert.deepStrictEqual(threeSum('not an array'), [], 'Should return [] when input is not an array');
assert.deepStrictEqual(threeSum({}), [], 'Should return [] when input is an object');
assert.deepStrictEqual(threeSum([]), [], 'Should return [] when input is empty array');
assert.deepStrictEqual(threeSum([0]), [], 'Should return [] when input length is 1');
assert.deepStrictEqual(threeSum([0, 1]), [], 'Should return [] when input length is 2');

console.log('Running TC-02: Standard mixed array [-1, 0, 1, 2, -1, -4]...');
const input2 = [-1, 0, 1, 2, -1, -4];
const expected2 = [[-1, -1, 2], [-1, 0, 1]];
assert.deepStrictEqual(
  normalizeTriplets(threeSum(input2)),
  normalizeTriplets(expected2),
  'Should correctly find all non-duplicate triplets summing to 0'
);

console.log('Running TC-03: Array of all zeroes [0, 0, 0, 0]...');
const input3 = [0, 0, 0, 0];
const expected3 = [[0, 0, 0]];
assert.deepStrictEqual(
  normalizeTriplets(threeSum(input3)),
  normalizeTriplets(expected3),
  'Should return exactly one triplet [0, 0, 0] without duplicates'
);

console.log('Running TC-04: No triplets sum to zero (All positive / All negative / No match)...');
assert.deepStrictEqual(threeSum([1, 2, 3, 4, 5]), [], 'All positive numbers should return []');
assert.deepStrictEqual(threeSum([-5, -4, -3, -2]), [], 'All negative numbers should return []');
assert.deepStrictEqual(threeSum([1, 2, -1]), [], 'Sum is not 0 should return []');

console.log('Running TC-05: Minimal valid array of exactly 3 elements [-1, 0, 1]...');
const input5 = [-1, 0, 1];
const expected5 = [[-1, 0, 1]];
assert.deepStrictEqual(
  normalizeTriplets(threeSum(input5)),
  normalizeTriplets(expected5),
  'Minimal length 3 array should return [[-1, 0, 1]]'
);

console.log('Running TC-06: Array with multiple duplicate numbers [-2, 0, 0, 2, 2]...');
const input6 = [-2, 0, 0, 2, 2];
const expected6 = [[-2, 0, 2]];
assert.deepStrictEqual(
  normalizeTriplets(threeSum(input6)),
  normalizeTriplets(expected6),
  'Should skip duplicates and return [[-2, 0, 2]] exactly once'
);

console.log('Running TC-07: Early exit when first element > 0 in sorted array [2, 3, 4, 5]...');
const input7 = [2, 3, 4, 5];
assert.deepStrictEqual(threeSum(input7), [], 'Should early exit and return [] when smallest element is > 0');

console.log('Running TC-08: Performance test with 1,000 integers (< 50ms)...');
const largeInput = [];
// Tạo mảng đối xứng có nhiều bộ ba thỏa mãn và trùng lặp
for (let i = -500; i < 500; i++) {
  largeInput.push(i);
}

const startTime = process.hrtime.bigint();
const result = threeSum(largeInput);
const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;

assert.ok(Array.isArray(result), 'Result must be an array');
assert.ok(result.length > 0, 'Should find multiple triplets in balanced array');
console.log(`⚡ Performance: Processed 1,000 numbers, found ${result.length} triplets in ${durationMs.toFixed(2)}ms (Target < 50ms)`);
assert.ok(durationMs < 50, `Performance target exceeded: ${durationMs.toFixed(2)}ms >= 50ms`);

console.log('------------------------------------------------------------------------');
console.log('✅ ALL 3SUM TESTS PASSED SUCCESSFULLY! (8/8 test cases passed)');
console.log('Time Complexity: O(n²) | Auxiliary Space Complexity: O(1)');

