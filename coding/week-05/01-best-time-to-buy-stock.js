/**
 * ============================================================================
 * 🧠 WEEK 5 - DAY 1: BEST TIME TO BUY AND SELL STOCK (LeetCode #121 - Easy)
 * ============================================================================
 * Target: HCLTech x ANZ Bank (Data Platform Team)
 * Invariants:
 * 1. Line 1 must be a guard clause.
 * 2. Time-arrow invariant: You can only sell stock AFTER you buy it.
 * 3. Safe initialization: minPrice initialized with prices[0].
 * 4. Time Complexity: O(n) - Single pass through price history.
 * 5. Space Complexity: O(1) - Only two scalar tracking variables.
 * ============================================================================
 */

/**
 * Calculates the maximum profit achievable from a single buy and sell transaction.
 *
 * @param {number[]} prices - Array of daily stock prices
 * @returns {number} Maximum achievable profit, or 0 if no profit is possible
 */
function maxProfit(prices) {
  if (!Array.isArray(prices) || prices.length < 2) return 0;

  let minPrice = prices[0];
  let maxProfit = 0;

  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i];
    if (currentPrice < minPrice) {
      minPrice = currentPrice;
    } else {
      const currentProfit = currentPrice - minPrice;
      if (currentProfit > maxProfit) {
        maxProfit = currentProfit;
      }
    }
  }

  return maxProfit;
}

module.exports = {
  maxProfit
};

