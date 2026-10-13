/**
 * ============================================================================
 * 🧠 WEEK 4 - DAY 5: MOCK HACKERRANK 45M & FRIDAY RECALL TEST 15M
 * ============================================================================
 * Target: ANZ Bank Technical Live Coding & Spaced Repetition Discipline
 * Invariant:
 * 1. Line 1 must be a guard clause.
 * 2. Friday Recall: Two-pointer inward collision O(n) time, O(1) space.
 * 3. Mock HackerRank (Palindrome Linked List):
 *    - In-place Fast & Slow Pointers finding middle.
 *    - In-place reversal of second half.
 *    - Compare first and second half values.
 *    - Invariant: MUST restore original list structure before returning!
 *    - Time Complexity: O(n) | Space Complexity: O(1) auxiliary.
 * ============================================================================
 */

/**
 * Singly-linked list node definition
 */
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * Friday 15-Minute Spaced Repetition Recall Test
 * Problem: Container With Most Water (LeetCode #11)
 * Recall: [2026-10-09] - PASS in 11m
 *
 * @param {number[]} heights
 * @returns {number} Maximum water area
 *
 * Time Complexity: O(n) - Single pass with two pointers converging inward
 * Space Complexity: O(1) - Two pointer variables and max tracker
 */
function fridayRecallContainer(heights) {
  if (!Array.isArray(heights) || heights.length < 2) return 0;

  let left = 0;
  let right = heights.length - 1;
  let maxArea = 0;

  while (left < right) {
    const width = right - left;
    const h = Math.min(heights[left], heights[right]);
    const area = width * h;

    if (area > maxArea) {
      maxArea = area;
    }

    if (heights[left] < heights[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxArea;
}

/**
 * Helper: In-place Linked List Reversal
 * @param {ListNode|null} node
 * @returns {ListNode|null} New head of reversed list
 */
function reverseLinkedList(node) {
  let prev = null;
  let curr = node;

  while (curr !== null) {
    const nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }

  return prev;
}

/**
 * Mock HackerRank 45m Problem: Palindrome Linked List (LeetCode #234)
 * In-place check with structure preservation.
 *
 * @param {ListNode|null} head
 * @returns {boolean} True if linked list is palindrome, false otherwise
 *
 * Time Complexity: O(n) - O(n/2) to find middle + O(n/2) reverse + O(n/2) compare + O(n/2) restore = O(n)
 * Space Complexity: O(1) - In-place pointer manipulation with zero extra memory allocation
 */
function isPalindromeList(head) {
  if (!head || !head.next) return true;

  // Step 1: Find middle using Fast and Slow pointers
  let slow = head;
  let fast = head;
  while (fast.next !== null && fast.next.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }

  // Step 2: Reverse the second half in-place
  let secondHalfHead = reverseLinkedList(slow.next);

  // Step 3: Compare first half and reversed second half
  let p1 = head;
  let p2 = secondHalfHead;
  let isPal = true;

  while (isPal && p2 !== null) {
    if (p1.val !== p2.val) {
      isPal = false;
    }
    p1 = p1.next;
    p2 = p2.next;
  }

  // Step 4: Restore original list structure (Critical Banking Invariant)
  slow.next = reverseLinkedList(secondHalfHead);

  return isPal;
}

/**
 * Helper: Convert Array to Singly-Linked List
 * @param {Array} arr
 * @returns {ListNode|null}
 */
function arrayToList(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const dummy = new ListNode(0);
  let curr = dummy;
  for (let i = 0; i < arr.length; i++) {
    curr.next = new ListNode(arr[i]);
    curr = curr.next;
  }
  return dummy.next;
}

/**
 * Helper: Convert Singly-Linked List to Array
 * @param {ListNode|null} head
 * @returns {Array}
 */
function listToArray(head) {
  if (!head) return [];

  const result = [];
  let curr = head;
  while (curr) {
    result.push(curr.val);
    curr = curr.next;
  }
  return result;
}

module.exports = {
  ListNode,
  fridayRecallContainer,
  isPalindromeList,
  arrayToList,
  listToArray
};

