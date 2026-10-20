/**
 * Solution: Search Insert Position (LeetCode #35 - Easy)
 * 
 * Target: HCLTech Vietnam x ANZ Bank Backend Interview Prep
 * Complexity: Time O(log n) | Auxiliary Space O(1)
 * Pattern: Binary Search Insertion Invariant
 * 
 * @param {number[]} nums - Sorted array of distinct integers
 * @param {number} target - Value to search or insert
 * @returns {number} - Index of target or insertion index
 */
function searchInsert(nums, target) {
  // Line 1: Mandatory Guard Clause
  if (!Array.isArray(nums) || nums.length === 0 || typeof target !== 'number') {
    return 0;
  }

  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    // Invariant: Prevent 32-bit integer overflow in typed runtimes
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // Invariant: When the loop terminates (left > right),
  // left points to the exact position where target must be inserted
  // to maintain sorted order (all elements before left are < target).
  return left;
}

module.exports = { searchInsert };

