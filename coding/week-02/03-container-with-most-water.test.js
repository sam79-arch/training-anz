/**
 * ============================================================================
 * 🧪 TEST SUITE: CONTAINER WITH MOST WATER (LeetCode #11 - Week 2 Day 3)
 * ============================================================================
 * Quy chuẩn kiểm thử:
 * - Native node:assert (Zero external npm dependencies)
 * - Test-First Discipline: Viết toàn bộ 8 test cases trước khi code mã nguồn
 * - Bao quát 100% boundary: Null, empty, 1 phần tử, 2 phần tử, mảng đồng nhất,
 *   mảng tăng/giảm liên tục, đỉnh nhọn hai đầu, và benchmark 100,000 phần tử.
 * ============================================================================
 */

const assert = require('node:assert');
const { maxArea } = require('./03-container-with-most-water');

console.log('--- Starting Test Suite: Container With Most Water (Week 2 Day 3) ---');

console.log('Running TC-01: Guard clause & Edge cases (null, undefined, invalid type, length < 2)...');
assert.strictEqual(maxArea(null), 0, 'Should return 0 for null input');
assert.strictEqual(maxArea(undefined), 0, 'Should return 0 for undefined input');
assert.strictEqual(maxArea('invalid string'), 0, 'Should return 0 for string input');
assert.strictEqual(maxArea({}), 0, 'Should return 0 for object input');
assert.strictEqual(maxArea([]), 0, 'Should return 0 for empty array');
assert.strictEqual(maxArea([5]), 0, 'Should return 0 for single element array');

console.log('Running TC-02: Standard classic LeetCode example [1, 8, 6, 2, 5, 4, 8, 3, 7]...');
const input2 = [1, 8, 6, 2, 5, 4, 8, 3, 7];
// Between index 1 (height 8) and index 8 (height 7): min(8, 7) * (8 - 1) = 7 * 7 = 49
assert.strictEqual(maxArea(input2), 49, 'Standard LeetCode example should return 49');

console.log('Running TC-03: Minimal valid array of exactly 2 elements...');
assert.strictEqual(maxArea([1, 1]), 1, 'Two elements [1, 1] should return 1');
assert.strictEqual(maxArea([4, 3]), 3, 'Two elements [4, 3] should return 3');
assert.strictEqual(maxArea([2, 5]), 2, 'Two elements [2, 5] should return 2');

console.log('Running TC-04: Array with all identical heights [5, 5, 5, 5, 5]...');
// Between index 0 and index 4: min(5, 5) * (4 - 0) = 5 * 4 = 20
assert.strictEqual(maxArea([5, 5, 5, 5, 5]), 20, 'Identical heights should return height * (n - 1)');

console.log('Running TC-05: Strictly decreasing array [9, 8, 7, 6, 5, 4, 3, 2, 1]...');
// Pairs to check: [9, 1] -> 1*8=8, [8, 1]... best is between 9 and 5 (idx 0 and 4: 5*4=20) or 8 and 4 (idx 1 and 5: 4*4=16), etc.
// At idx 0 (9) and idx 4 (5): min(9, 5) * 4 = 20
assert.strictEqual(maxArea([9, 8, 7, 6, 5, 4, 3, 2, 1]), 20, 'Strictly decreasing array should return 20');

console.log('Running TC-06: Strictly increasing array [1, 2, 3, 4, 5, 6, 7, 8, 9]...');
// Symmetrical to decreasing: best between idx 4 (5) and idx 8 (9): min(5, 9) * 4 = 20
assert.strictEqual(maxArea([1, 2, 3, 4, 5, 6, 7, 8, 9]), 20, 'Strictly increasing array should return 20');

console.log('Running TC-07: Mountain / V-shaped array with tall peaks at boundaries [10, 1, 1, 1, 10]...');
// Between index 0 (10) and index 4 (10): min(10, 10) * 4 = 40
assert.strictEqual(maxArea([10, 1, 1, 1, 10]), 40, 'V-shaped array with tall boundaries should return 40');

console.log('Running TC-08: Performance test with 100,000 elements (< 20ms)...');
const largeInput = new Array(100000);
for (let i = 0; i < 100000; i++) {
  // Pattern tạo các cột cao thấp xen kẽ
  largeInput[i] = (i * 37) % 1000 + 1;
}

const startTime = process.hrtime.bigint();
const result = maxArea(largeInput);
const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;

assert.ok(typeof result === 'number' && result > 0, 'Result must be a positive number');
console.log(`⚡ Performance: Processed 100,000 bars in ${durationMs.toFixed(2)}ms (Target < 20ms)`);
assert.ok(durationMs < 20, `Performance target exceeded: ${durationMs.toFixed(2)}ms >= 20ms`);

console.log('------------------------------------------------------------------------');
console.log('✅ ALL CONTAINER WITH MOST WATER TESTS PASSED SUCCESSFULLY! (8/8 passed)');
console.log('Time Complexity: O(n) | Auxiliary Space Complexity: O(1)');

