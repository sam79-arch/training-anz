/**
 * Solution: Maximum Subarray / Kadane's Algorithm (LeetCode #53 - Medium)
 * 
 * Target: HCLTech Vietnam x ANZ Bank Backend Interview Prep
 * Complexity: Time O(n) | Auxiliary Space O(1)
 * Pattern: Dynamic Programming / Kadane's Single-Pass Invariant
 */

/**
 * Standard Kadane's Algorithm returning the maximum contiguous subarray sum
 * @param {number[]} nums 
 * @returns {number}
 */
function maxSubArray(nums) {
  // Line 1: Mandatory Guard Clause
  if (!Array.isArray(nums) || nums.length === 0) {
    return 0;
  }

  // CRITICAL ANZ INVARIANT: Safe initialization with nums[0], NEVER 0!
  // If array is [-5, -1, -8], initializing with 0 produces incorrect 0 instead of -1.
  let currentSum = nums[0];
  let maxSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // Decision: Start new subarray at nums[i] or extend existing subarray
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

/**
 * Extended Kadane's Algorithm tracking exact start and end indices of optimal subarray
 * Common ANZ Senior Follow-up Question
 * @param {number[]} nums 
 * @returns {{ maxSum: number, start: number, end: number, subarray: number[] }}
 */
function maxSubArrayWithIndices(nums) {
  // Line 1: Mandatory Guard Clause
  if (!Array.isArray(nums) || nums.length === 0) {
    return { maxSum: 0, start: -1, end: -1, subarray: [] };
  }

  let currentSum = nums[0];
  let maxSum = nums[0];
  let start = 0;
  let end = 0;
  let tempStart = 0;

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > currentSum + nums[i]) {
      currentSum = nums[i];
      tempStart = i; // Reset candidate start index
    } else {
      currentSum += nums[i];
    }

    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
    }
  }

  return {
    maxSum,
    start,
    end,
    subarray: nums.slice(start, end + 1)
  };
}

module.exports = {
  maxSubArray,
  maxSubArrayWithIndices
};

