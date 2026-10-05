/**
 * Problem: Linked List Cycle (LeetCode #141 - Easy)
 * 
 * Target: HCLTech x ANZ Bank (Data Platform Team)
 * Algorithm: Floyd's Tortoise and Hare (Slow & Fast Pointers)
 * Time Complexity: O(n) | Auxiliary Space Complexity: O(1)
 * Constraints: Strictly in-place, zero mutation on node objects, native Node.js.
 */

'use strict';

/**
 * Definition for singly-linked list node.
 */
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * Determines if a linked list has a cycle using Floyd's Tortoise and Hare algorithm.
 * 
 * @param {ListNode|null} head
 * @returns {boolean}
 */
function hasCycle(head) {
  // Guard Clause at Line 1 (Mandatory ANZ Coding Standard)
  if (!head || typeof head !== 'object' || !head.next) return false;

  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;          // Tortoise moves 1 step
    fast = fast.next.next;     // Hare moves 2 steps

    if (slow === fast) {
      return true;             // Hare caught up with Tortoise -> Cycle detected
    }
  }

  return false;                // Fast reached null -> Linear list without cycle
}

module.exports = {
  hasCycle,
  ListNode,
};
