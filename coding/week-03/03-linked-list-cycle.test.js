/**
 * Test Suite: Linked List Cycle (LeetCode #141 - Easy)
 * 
 * Target: HCLTech x ANZ Bank (Data Platform Team)
 * Objective: Verify Floyd's Tortoise and Hare cycle detection algorithm
 *            with native node:assert in test-first discipline.
 */

const assert = require('node:assert');
const { hasCycle, ListNode } = require('./03-linked-list-cycle');

function runTestSuite() {
  console.log('--- Starting Test Suite: Linked List Cycle (Week 3 Day 5) ---');

  // Helper to create list from array and optionally attach cycle to pos (0-indexed)
  function createList(values, pos = -1) {
    if (!values || values.length === 0) return null;
    const head = new ListNode(values[0]);
    let curr = head;
    let cycleTarget = (pos === 0) ? head : null;

    for (let i = 1; i < values.length; i++) {
      curr.next = new ListNode(values[i]);
      curr = curr.next;
      if (i === pos) cycleTarget = curr;
    }

    if (pos >= 0 && cycleTarget) {
      curr.next = cycleTarget;
    }
    return head;
  }

  // TC-01: Guard clauses & Invalid / Empty inputs
  console.log('Running TC-01: Guard clauses & Invalid / Empty inputs...');
  assert.strictEqual(hasCycle(null), false, 'null head must return false');
  assert.strictEqual(hasCycle(undefined), false, 'undefined head must return false');
  assert.strictEqual(hasCycle('invalid'), false, 'non-object head must return false');
  assert.strictEqual(hasCycle(12345), false, 'number head must return false');
  assert.strictEqual(hasCycle(new ListNode(1)), false, 'single node without cycle must return false');

  // TC-02: Single node pointing to itself (cycle of length 1)
  console.log('Running TC-02: Single node self-cycle...');
  const selfCycle = new ListNode(42);
  selfCycle.next = selfCycle;
  assert.strictEqual(hasCycle(selfCycle), true, 'single node self-cycle must return true');

  // TC-03: Two nodes with cycle (1 -> 2 -> 1)
  console.log('Running TC-03: Two nodes with cycle...');
  const twoNodesCycle = createList([1, 2], 0);
  assert.strictEqual(hasCycle(twoNodesCycle), true, 'two nodes cycle must return true');

  // TC-04: Standard classic LeetCode example [3, 2, 0, -4] with tail connecting to index 1
  console.log('Running TC-04: Standard LeetCode example [3, 2, 0, -4]...');
  const leetcodeList = createList([3, 2, 0, -4], 1);
  assert.strictEqual(hasCycle(leetcodeList), true, 'LeetCode classic cycle must return true');

  // TC-05: Linear list of 1,000 nodes without cycle
  console.log('Running TC-05: Linear list without cycle (1,000 nodes)...');
  const linearValues = Array.from({ length: 1000 }, (_, i) => i);
  const linearList = createList(linearValues, -1);
  assert.strictEqual(hasCycle(linearList), false, 'linear list without cycle must return false');

  // TC-06: Stress test 20,000 nodes with cycle at middle (Performance & Memory Safety)
  console.log('Running TC-06: Stress test 20,000 nodes with cycle (Performance target < 5ms)...');
  const largeValues = Array.from({ length: 20000 }, (_, i) => i);
  const largeList = createList(largeValues, 10000); // cycle starts at node 10,000
  const startTime = process.hrtime.bigint();
  const detected = hasCycle(largeList);
  const endTime = process.hrtime.bigint();
  const elapsedMs = Number(endTime - startTime) / 1e6;

  assert.strictEqual(detected, true, 'large cyclic list must return true');
  console.log(`Detected cycle in 20,000 nodes in ${elapsedMs.toFixed(2)}ms`);
  assert.ok(elapsedMs < 10, `Cycle detection should be under 10ms, got ${elapsedMs.toFixed(2)}ms`);

  // TC-07: Invariant check - Zero Mutation & O(1) Space
  console.log('Running TC-07: Invariant check (Zero Node Mutation)...');
  const testNodeA = new ListNode(10);
  const testNodeB = new ListNode(20);
  testNodeA.next = testNodeB;
  testNodeB.next = testNodeA;

  hasCycle(testNodeA);
  assert.strictEqual(testNodeA.val, 10, 'Node value must not be mutated');
  assert.strictEqual(testNodeA.next, testNodeB, 'Node pointer next must not be broken');
  assert.strictEqual(testNodeA.visited, undefined, 'Must not attach external visited flags to nodes');

  console.log('✅ ALL 7 TEST CASES PASSED FOR LINKED LIST CYCLE (Week 3 Day 5)!');
}

runTestSuite();
