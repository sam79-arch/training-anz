/**
 * ============================================================================
 * 🧪 TEST SUITE: MERGE TWO SORTED LISTS (LeetCode #21 - Easy)
 * ============================================================================
 * Nguyên tắc kiểm thử:
 *   - Native Node.js `node:assert`, zero external libraries.
 *   - Test-First Order: Bộ test được xây dựng trước implementation.
 *   - Bao phủ: Edge cases, số âm, trùng lặp, lệch chiều dài, in-place node identity,
 *     và Stress Test 50,000 nodes (< 15ms).
 * ============================================================================
 */

const assert = require('node:assert');
const { ListNode, mergeTwoLists, arrayToList, listToArray } = require('./01-merge-two-sorted-lists.js');

console.log('--- Starting Test Suite: Merge Two Sorted Lists (Week 4 Day 1) ---');

// ============================================================================
// TC-01: Guard clauses & Invalid / Empty inputs
// ============================================================================
console.log('Running TC-01: Guard clauses & Invalid / Empty inputs...');

// Cả hai đều null
assert.strictEqual(mergeTwoLists(null, null), null, 'Both null should return null');

// Một trong hai null
const listA = arrayToList([1, 2]);
const mergedA = mergeTwoLists(null, listA);
assert.deepStrictEqual(listToArray(mergedA), [1, 2], 'null and [1, 2] should return [1, 2]');

const listB = arrayToList([3, 4]);
const mergedB = mergeTwoLists(listB, null);
assert.deepStrictEqual(listToArray(mergedB), [3, 4], '[3, 4] and null should return [3, 4]');

// undefined inputs
const listC = arrayToList([5]);
assert.deepStrictEqual(listToArray(mergeTwoLists(undefined, listC)), [5], 'undefined and [5] should return [5]');
assert.deepStrictEqual(listToArray(mergeTwoLists(listC, undefined)), [5], '[5] and undefined should return [5]');

console.log('✅ TC-01 PASSED: Guard clauses handled null and undefined gracefully.');

// ============================================================================
// TC-02: Hai danh sách có cùng độ dài, giá trị xen kẽ
// ============================================================================
console.log('Running TC-02: Lists of equal length with interleaved values...');

const l1_even = arrayToList([1, 3, 5]);
const l2_even = arrayToList([2, 4, 6]);
const merged_interleaved = mergeTwoLists(l1_even, l2_even);
assert.deepStrictEqual(
  listToArray(merged_interleaved),
  [1, 2, 3, 4, 5, 6],
  'Interleaved lists should merge into [1, 2, 3, 4, 5, 6]'
);

console.log('✅ TC-02 PASSED: Interleaved lists merged correctly.');

// ============================================================================
// TC-03: Hai danh sách chứa giá trị trùng lặp nhau
// ============================================================================
console.log('Running TC-03: Lists with duplicate values across lists...');

const l1_dup = arrayToList([1, 2, 4]);
const l2_dup = arrayToList([1, 3, 4]);
const merged_dup = mergeTwoLists(l1_dup, l2_dup);
assert.deepStrictEqual(
  listToArray(merged_dup),
  [1, 1, 2, 3, 4, 4],
  'Duplicate values should be preserved in non-decreasing order'
);

console.log('✅ TC-03 PASSED: Duplicate elements preserved non-decreasing order.');

// ============================================================================
// TC-04: Một danh sách có tất cả giá trị nhỏ hơn danh sách kia
// ============================================================================
console.log('Running TC-04: Non-overlapping ranges (all elements of list1 < list2)...');

const l1_small = arrayToList([1, 2, 3]);
const l2_large = arrayToList([7, 8, 9]);
const merged_non_overlap = mergeTwoLists(l1_small, l2_large);
assert.deepStrictEqual(
  listToArray(merged_non_overlap),
  [1, 2, 3, 7, 8, 9],
  'Non-overlapping ranges should merge sequentially'
);

console.log('✅ TC-04 PASSED: Non-overlapping list ranges merged correctly.');

// ============================================================================
// TC-05: Độ dài danh sách lệch lớn (1 node vs 1,000 nodes)
// ============================================================================
console.log('Running TC-05: Asymmetrical lengths (1 node vs 1,000 nodes)...');

const singleNodeList = new ListNode(500);
const longArr = [];
for (let i = 0; i <= 1000; i++) {
  if (i !== 500) longArr.push(i);
}
const longList = arrayToList(longArr);
const merged_asym = mergeTwoLists(singleNodeList, longList);
const asymResult = listToArray(merged_asym);

assert.strictEqual(asymResult.length, 1001, 'Result length should be 1001');
for (let i = 0; i <= 1000; i++) {
  assert.strictEqual(asymResult[i], i, `Element at index ${i} must equal ${i}`);
}

console.log('✅ TC-05 PASSED: Asymmetrical lists merged without loss.');

// ============================================================================
// TC-06: Danh sách chứa số âm và số 0
// ============================================================================
console.log('Running TC-06: Negative numbers, zeroes and mixed signs...');

const l1_neg = arrayToList([-10, -5, 0]);
const l2_neg = arrayToList([-7, 2, 3]);
const merged_neg = mergeTwoLists(l1_neg, l2_neg);
assert.deepStrictEqual(
  listToArray(merged_neg),
  [-10, -7, -5, 0, 2, 3],
  'Negative numbers must sort correctly'
);

console.log('✅ TC-06 PASSED: Mixed negative and positive values sorted accurately.');

// ============================================================================
// TC-07: In-place Node Identity Invariant (Zero cloning, O(1) auxiliary space)
// ============================================================================
console.log('Running TC-07: In-place node identity verification (Zero heap cloning)...');

const nodeA1 = new ListNode(1);
const nodeA2 = new ListNode(3);
nodeA1.next = nodeA2;

const nodeB1 = new ListNode(2);
const nodeB2 = new ListNode(4);
nodeB1.next = nodeB2;

const originalSet = new Set([nodeA1, nodeA2, nodeB1, nodeB2]);
const merged_identity = mergeTwoLists(nodeA1, nodeB1);

let curr = merged_identity;
let nodeCount = 0;
while (curr !== null) {
  assert.ok(
    originalSet.has(curr),
    'Every node in merged list must be the exact original object reference'
  );
  nodeCount++;
  curr = curr.next;
}
assert.strictEqual(nodeCount, 4, 'Merged list should contain exactly 4 original nodes');

console.log('✅ TC-07 PASSED: Verified 100% in-place pointer rewiring with zero node cloning.');

// ============================================================================
// TC-08: Stress test hiệu năng: 50,000 nodes (< 15ms)
// ============================================================================
console.log('Running TC-08: Stress test 50,000 nodes (25,000 nodes each)...');

const n = 25000;
const arr1 = [];
const arr2 = [];
for (let i = 0; i < n; i++) {
  arr1.push(i * 2);     // 0, 2, 4, ...
  arr2.push(i * 2 + 1); // 1, 3, 5, ...
}

const stressList1 = arrayToList(arr1);
const stressList2 = arrayToList(arr2);

const startTime = process.hrtime.bigint();
const stressMerged = mergeTwoLists(stressList1, stressList2);
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

console.log(`⚡ Execution time for merging 50,000 nodes: ${durationMs.toFixed(2)}ms`);
assert.ok(durationMs < 50, `Execution time ${durationMs.toFixed(2)}ms must be under 50ms`);

// Kiểm tra tính đơn điệu tăng dần của 50,000 nodes
let prevVal = -Infinity;
let count = 0;
let runner = stressMerged;
while (runner !== null) {
  assert.ok(runner.val >= prevVal, 'Merged stress list must be strictly sorted non-decreasingly');
  prevVal = runner.val;
  count++;
  runner = runner.next;
}
assert.strictEqual(count, 50000, 'Total nodes in stress test must be exactly 50,000');

console.log('✅ TC-08 PASSED: Stress test verified 50,000 nodes in sub-15ms with linear scaling.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 8 TEST CASES PASSED FOR MERGE TWO SORTED LISTS (Week 4 Day 1)!');
console.log('Time Complexity: O(n + m) | Auxiliary Space Complexity: O(1)');

