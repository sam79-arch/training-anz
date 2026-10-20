/**
 * Solution: Binary Search Boundary Drill & Friday Recall Test 15m
 * 
 * Target: HCLTech Vietnam x ANZ Bank Backend Interview Prep
 * Complexity: Time O(log n) | Auxiliary Space O(1)
 * Pattern: Binary Search Lower Bound (First Occurrence / Bad Version)
 */

/**
 * 🆕 Friday Recall Test 15m: Best Time to Buy and Sell Stock (LeetCode #121)
 * Reconstructed 100% from memory without looking at reference code
 * 
 * // Recall: 2026-10-20 - PASS in 5m
 * 
 * @param {number[]} prices 
 * @returns {number}
 */
function fridayRecallBestTimeToBuyStock(prices) {
  // Line 1: Mandatory Guard Clause
  if (!Array.isArray(prices) || prices.length < 2) {
    return 0;
  }

  let minPrice = prices[0];
  let maxProfit = 0;

  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i];
    if (currentPrice < minPrice) {
      minPrice = currentPrice;
    } else {
      const profit = currentPrice - minPrice;
      if (profit > maxProfit) {
        maxProfit = profit;
      }
    }
  }

  return maxProfit;
}

/**
 * Binary Search Boundary Drill: First Bad Version (LeetCode #278 - Easy)
 * Template: Lower Bound / First True in Monotonic Boolean Sequence [F, F, ..., T, T]
 * 
 * @param {number} n - Total version count from 1 to n
 * @param {function(number): boolean} isBadVersion - API checking if version is corrupted
 * @returns {number} - 1-based index of first bad version, or 0 if none bad
 */
function firstBadVersion(n, isBadVersion) {
  // Line 1: Mandatory Guard Clause
  if (typeof n !== 'number' || n < 1 || typeof isBadVersion !== 'function') {
    return 0;
  }

  // Quick check: If the latest version is not bad, no version is bad
  if (!isBadVersion(n)) {
    return 0;
  }

  let left = 1;
  let right = n;

  // Invariant: while (left < right) converges on the exact boundary element
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);

    if (isBadVersion(mid)) {
      // The first bad version is at mid or to the left of mid
      right = mid;
    } else {
      // The first bad version must be strictly to the right of mid
      left = mid + 1;
    }
  }

  // When loop terminates, left === right, pointing to the first bad version
  return left;
}

module.exports = {
  fridayRecallBestTimeToBuyStock,
  firstBadVersion
};

