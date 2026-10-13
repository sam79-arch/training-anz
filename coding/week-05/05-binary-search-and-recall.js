/**
 * ============================================================================
 * 🧠 WEEK 5 - DAY 5: BINARY SEARCH STANDARD TEMPLATE & FRIDAY RECALL
 * ============================================================================
 * 1. Friday Recall Test: Move Zeroes (LeetCode #283 - Spaced Repetition)
 *    Recall: [2026-10-16] - PASS in 8m
 * 2. Binary Search Standard Template (LeetCode #704 - Easy)
 * Invariants:
 * - Line 1 must be a guard clause.
 * - Overflow-safe midpoint: left + Math.floor((right - left) / 2).
 * - Exact boundary condition: while (left <= right).
 * - Time Complexity: O(log n) | Auxiliary Space Complexity: O(1).
 * ============================================================================
 */

/**
 * Friday Spaced Repetition Recall: Move Zeroes
 * Recalled from memory: In-place Read/Write pointer pattern.
 *
 * @param {number[]} nums
 * @returns {number[]} Mutated nums reference
 */
function fridayRecallMoveZeroes(nums) {
  if (!Array.isArray(nums) || nums.length < 2) return nums;

  let writeIdx = 0;

  // Move all non-zero elements to front
  for (let readIdx = 0; readIdx < nums.length; readIdx++) {
    if (nums[readIdx] !== 0) {
      nums[writeIdx++] = nums[readIdx];
    }
  }

  // Fill remainder with zeroes
  while (writeIdx < nums.length) {
    nums[writeIdx++] = 0;
  }

  return nums;
}

/**
 * Binary Search Standard Template
 *
 * @param {number[]} nums - Sorted integer array in ascending order
 * @param {number} target - Value to find
 * @returns {number} Index of target if found, otherwise -1
 *
 * Time Complexity: O(log n) - Search space halved on each iteration
 * Space Complexity: O(1) - Two pointer variables and midpoint scalar
 */
function binarySearch(nums, target) {
  if (!Array.isArray(nums) || nums.length === 0 || typeof target !== 'number') {
    return -1;
  }

  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    // Overflow-safe midpoint calculation
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1; // Discard left half
    } else {
      right = mid - 1; // Discard right half
    }
  }

  return -1;
}

module.exports = {
  fridayRecallMoveZeroes,
  binarySearch
};

