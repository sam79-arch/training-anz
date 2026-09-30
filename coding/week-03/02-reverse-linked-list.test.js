/**
 * ============================================================================
 * 🧪 TEST SUITE: REVERSE LINKED LIST (Week 3 Day 3 - Issue #36)
 * ============================================================================
 * Quy chuẩn kiểm thử:
 * - Native node:assert (Zero external npm dependencies)
 * - Test-First Discipline: Viết trọn vẹn 8 test cases trước khi code solution
 * - Bao phủ 100% boundary & edge cases: null, undefined, invalid type, empty list,
 *   single node (identity check), two nodes, standard list, negative & duplicate values,
 *   strict in-place node reuse invariant, và stress test 50,000 nodes chống tràn Call Stack.
 * ============================================================================
 */

const assert = require('node:assert');
const {
  ListNode,
  reverseList,
  arrayToList,
  listToArray,
} = require('./02-reverse-linked-list');

console.log('--- Starting Test Suite: Reverse Linked List (Week 3 Day 3) ---');

// ============================================================================
// TC-01: Guard Clauses & Invalid Inputs
// Invariant: Non-object or invalid inputs must be handled safely without throwing
// ============================================================================
console.log('Running TC-01: Guard clauses & Invalid inputs...');
assert.strictEqual(reverseList(null), null, 'reverseList(null) should return null');
assert.strictEqual(reverseList(undefined), undefined, 'reverseList(undefined) should return undefined');
assert.strictEqual(reverseList(12345), 12345, 'Non-object number should return itself safely');
assert.strictEqual(reverseList('string'), 'string', 'Non-object string should return itself safely');

// ============================================================================
// TC-02: Boundary Case - Empty List
// Invariant: Empty list (head === null) returns null
// ============================================================================
console.log('Running TC-02: Empty list boundary case...');
const emptyList = arrayToList([]);
assert.strictEqual(emptyList, null, 'arrayToList([]) must produce null');
assert.strictEqual(reverseList(emptyList), null, 'Reversing empty list must return null');
assert.deepStrictEqual(listToArray(null), [], 'listToArray(null) must return empty array []');

// ============================================================================
// TC-03: Boundary Case - Single Node List
// Invariant: Single node list returns the original node reference unchanged
// ============================================================================
console.log('Running TC-03: Single node list...');
const singleNode = new ListNode(42);
const reversedSingle = reverseList(singleNode);
assert.strictEqual(reversedSingle, singleNode, 'Reversing single node must return exact same node instance');
assert.strictEqual(reversedSingle.val, 42, 'Value of single node must remain 42');
assert.strictEqual(reversedSingle.next, null, 'next pointer must remain null');
assert.deepStrictEqual(listToArray(reversedSingle), [42], 'listToArray must yield [42]');

// ============================================================================
// TC-04: Two Nodes List
// Invariant: [1, 2] -> [2, 1] with links correctly reversed
// ============================================================================
console.log('Running TC-04: Two nodes list...');
const twoNodeList = arrayToList([1, 2]);
const reversedTwo = reverseList(twoNodeList);
assert.deepStrictEqual(listToArray(reversedTwo), [2, 1], '[1, 2] reversed must equal [2, 1]');

// ============================================================================
// TC-05: Standard Multi-Node Happy Path
// Invariant: [1, 2, 3, 4, 5] -> [5, 4, 3, 2, 1]
// ============================================================================
console.log('Running TC-05: Standard multi-node list [1, 2, 3, 4, 5]...');
const list5 = arrayToList([1, 2, 3, 4, 5]);
const reversed5 = reverseList(list5);
assert.deepStrictEqual(listToArray(reversed5), [5, 4, 3, 2, 1], 'Standard list reversal mismatch');

// ============================================================================
// TC-06: Negative Numbers, Zero & Duplicate Values
// Invariant: Pointer reversal must be value-agnostic
// ============================================================================
console.log('Running TC-06: Negative numbers, zero & duplicates...');
const mixedList = arrayToList([-10, -5, 0, 5, 10, -5]);
const reversedMixed = reverseList(mixedList);
assert.deepStrictEqual(
  listToArray(reversedMixed),
  [-5, 10, 5, 0, -5, -10],
  'List with negatives, zero, and duplicates must reverse correctly'
);

// ============================================================================
// TC-07: In-Place Node Identity Invariant
// Invariant: No new ListNode instances allocated; original node instances reused
// ============================================================================
console.log('Running TC-07: In-place node identity verification...');
const n1 = new ListNode('A');
const n2 = new ListNode('B');
const n3 = new ListNode('C');
n1.next = n2;
n2.next = n3;

const reversedNodes = reverseList(n1);
// Inverted structure must be: n3 -> n2 -> n1 -> null
assert.strictEqual(reversedNodes, n3, 'New head must be the exact original node n3 instance');
assert.strictEqual(n3.next, n2, 'n3.next must point to original n2 instance');
assert.strictEqual(n2.next, n1, 'n2.next must point to original n1 instance');
assert.strictEqual(n1.next, null, 'n1.next (old head) must now terminate at null');

// ============================================================================
// TC-08: High Volume Stress Test (50,000 nodes) - Call Stack Safety
// Invariant: Iterative reversal of 50,000 nodes must complete in < 50ms with ZERO stack overflow
// ============================================================================
console.log('Running TC-08: Stress test 50,000 nodes (Call Stack & Memory Safety)...');
const NUM_NODES = 50000;
let headLarge = new ListNode(1);
let currentBuild = headLarge;
for (let i = 2; i <= NUM_NODES; i++) {
  currentBuild.next = new ListNode(i);
  currentBuild = currentBuild.next;
}

const startTime = process.hrtime.bigint();
const reversedLarge = reverseList(headLarge);
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

console.log(`Reversed ${NUM_NODES.toLocaleString()} nodes in ${durationMs.toFixed(2)}ms`);
assert.strictEqual(reversedLarge.val, NUM_NODES, `New head must be ${NUM_NODES}`);

// Verify first 3 and last 3 nodes
assert.strictEqual(reversedLarge.next.val, NUM_NODES - 1, 'Second node value check');
assert.strictEqual(reversedLarge.next.next.val, NUM_NODES - 2, 'Third node value check');

let walk = reversedLarge;
let count = 0;
let lastNode = null;
while (walk !== null) {
  count++;
  lastNode = walk;
  walk = walk.next;
}

assert.strictEqual(count, NUM_NODES, `Count of nodes after reversal must be exactly ${NUM_NODES}`);
assert.strictEqual(lastNode.val, 1, 'Tail node value after reversal must be 1');
assert.strictEqual(lastNode.next, null, 'Tail node next must be null');
assert.ok(durationMs < 50, `Stress test took ${durationMs}ms, should be under 50ms`);

console.log('✅ ALL 8 TEST CASES PASSED FOR REVERSE LINKED LIST (Week 3 Day 3)!');
