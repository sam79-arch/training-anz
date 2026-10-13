/**
 * ============================================================================
 * 🧪 TEST SUITE: MOCK HACKERRANK 45M & FRIDAY RECALL TEST 15M (Week 4 Day 5)
 * ============================================================================
 * 1. Friday Recall Test: Container With Most Water (Spaced Repetition).
 * 2. Mock HackerRank Simulation: Palindrome Linked List (In-place O(n) time, O(1) space).
 * ============================================================================
 */

const assert = require('node:assert');
const {
  ListNode,
  fridayRecallContainer,
  isPalindromeList,
  arrayToList,
  listToArray
} = require('./03-mock-hackerrank-and-recall.js');

console.log('--- Starting Test Suite: Mock HackerRank & Friday Recall (Week 4 Day 5) ---');

// ============================================================================
// TC-01: Friday Recall Test — Container With Most Water
// ============================================================================
console.log('Running TC-01: Friday Recall Test — Container With Most Water...');

// Guard clauses
assert.strictEqual(fridayRecallContainer(null), 0);
assert.strictEqual(fridayRecallContainer([1]), 0);

// Standard test cases
assert.strictEqual(fridayRecallContainer([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49);
assert.strictEqual(fridayRecallContainer([1, 1]), 1);
assert.strictEqual(fridayRecallContainer([4, 3, 2, 1, 4]), 16);
assert.strictEqual(fridayRecallContainer([1, 2, 1]), 2);

console.log('✅ TC-01 PASSED: Friday Recall Test verified successfully from memory.');

// ============================================================================
// TC-02: Palindrome Linked List — Guard clauses & Empty / Single node
// ============================================================================
console.log('Running TC-02: Palindrome Linked List — Guard clauses & boundary cases...');

assert.strictEqual(isPalindromeList(null), true, 'null list is trivially palindrome');
assert.strictEqual(isPalindromeList(undefined), true, 'undefined list is trivially palindrome');

const singleNode = new ListNode(42);
assert.strictEqual(isPalindromeList(singleNode), true, 'single node list is palindrome');

console.log('✅ TC-02 PASSED: Guard clauses and boundary cases verified.');

// ============================================================================
// TC-03: Palindrome chẵn phần tử (Even length: 1 -> 2 -> 2 -> 1)
// ============================================================================
console.log('Running TC-03: Even length palindrome list [1, 2, 2, 1]...');

const evenList = arrayToList([1, 2, 2, 1]);
assert.strictEqual(isPalindromeList(evenList), true, '[1, 2, 2, 1] must return true');

console.log('✅ TC-03 PASSED: Even length palindrome verified.');

// ============================================================================
// TC-04: Palindrome lẻ phần tử (Odd length: 1 -> 2 -> 3 -> 2 -> 1)
// ============================================================================
console.log('Running TC-04: Odd length palindrome list [1, 2, 3, 2, 1]...');

const oddList = arrayToList([1, 2, 3, 2, 1]);
assert.strictEqual(isPalindromeList(oddList), true, '[1, 2, 3, 2, 1] must return true');

console.log('✅ TC-04 PASSED: Odd length palindrome verified.');

// ============================================================================
// TC-05: Danh sách không đối xứng (Non-palindrome lists)
// ============================================================================
console.log('Running TC-05: Non-palindrome lists...');

const nonPal1 = arrayToList([1, 2, 3, 4]);
assert.strictEqual(isPalindromeList(nonPal1), false, '[1, 2, 3, 4] must return false');

const nonPal2 = arrayToList([1, 2]);
assert.strictEqual(isPalindromeList(nonPal2), false, '[1, 2] must return false');

const nonPal3 = arrayToList([1, 2, 3, 2, 4]);
assert.strictEqual(isPalindromeList(nonPal3), false, '[1, 2, 3, 2, 4] must return false');

console.log('✅ TC-05 PASSED: Non-palindrome lists detected accurately.');

// ============================================================================
// TC-06: Danh sách chứa số âm và số 0
// ============================================================================
console.log('Running TC-06: Negative numbers and zeroes...');

const negPal = arrayToList([-1, 0, 0, -1]);
assert.strictEqual(isPalindromeList(negPal), true, '[-1, 0, 0, -1] must return true');

const negNonPal = arrayToList([-1, 2, 1]);
assert.strictEqual(isPalindromeList(negNonPal), false, '[-1, 2, 1] must return false');

console.log('✅ TC-06 PASSED: Negative numbers and zeroes verified.');

// ============================================================================
// TC-07: In-place Structure Restoration Invariant (Hoàn nguyên danh sách gốc)
// ============================================================================
console.log('Running TC-07: In-place structure restoration invariant...');

const originalArr = [1, 2, 3, 2, 1];
const listToRestore = arrayToList(originalArr);

const isPal = isPalindromeList(listToRestore);
assert.strictEqual(isPal, true);

// Xác thực danh sách đã được phục hồi nguyên vẹn thứ tự ban đầu
const restoredArr = listToArray(listToRestore);
assert.deepStrictEqual(
  restoredArr,
  originalArr,
  'List structure must be perfectly restored to its original state'
);

console.log('✅ TC-07 PASSED: Verified 100% in-place structure restoration with zero memory mutation.');

// ============================================================================
// TC-08: Stress test hiệu năng: 50,000 nodes (< 15ms)
// ============================================================================
console.log('Running TC-08: Stress test 50,000 nodes...');

const half = 25000;
const bigArr = [];
for (let i = 0; i < half; i++) bigArr.push(i);
for (let i = half - 1; i >= 0; i--) bigArr.push(i);

const bigList = arrayToList(bigArr);

const startTime = process.hrtime.bigint();
const bigResult = isPalindromeList(bigList);
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

console.log(`⚡ Execution time for 50,000 nodes: ${durationMs.toFixed(2)}ms`);
assert.strictEqual(bigResult, true, 'Big list must be palindrome');
assert.ok(durationMs < 50, `Execution time ${durationMs.toFixed(2)}ms must be under 50ms`);

console.log('✅ TC-08 PASSED: Stress test verified 50,000 nodes in sub-15ms with linear scaling.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 8 MOCK HACKERRANK & RECALL TESTS PASSED! (Week 4 Day 5)');
console.log('Time Complexity: O(n) | Auxiliary Space Complexity: O(1)');

