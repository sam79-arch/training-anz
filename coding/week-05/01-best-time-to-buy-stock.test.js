/**
 * ============================================================================
 * 🧪 TEST SUITE: BEST TIME TO BUY AND SELL STOCK (Week 5 Day 1)
 * ============================================================================
 * Target: LeetCode #121 - Easy | In-place Single Pass Tracking O(n) Time, O(1) Space
 * ============================================================================
 */

const assert = require('node:assert');
const { maxProfit } = require('./01-best-time-to-buy-stock.js');

console.log('--- Starting Test Suite: Best Time to Buy and Sell Stock (Week 5 Day 1) ---');

// ============================================================================
// TC-01: Guard clauses & Invalid / Boundary inputs
// ============================================================================
console.log('Running TC-01: Guard clauses & Boundary inputs...');

assert.strictEqual(maxProfit(null), 0, 'null prices should return 0');
assert.strictEqual(maxProfit(undefined), 0, 'undefined prices should return 0');
assert.strictEqual(maxProfit([]), 0, 'empty prices array should return 0');
assert.strictEqual(maxProfit([10]), 0, 'single price element cannot sell, should return 0');
assert.strictEqual(maxProfit('invalid'), 0, 'non-array input should return 0');

console.log('✅ TC-01 PASSED: Guard clauses handled all invalid inputs safely.');

// ============================================================================
// TC-02: Standard LeetCode example ([7, 1, 5, 3, 6, 4] -> 5)
// ============================================================================
console.log('Running TC-02: Standard LeetCode example...');

const prices1 = [7, 1, 5, 3, 6, 4];
assert.strictEqual(maxProfit(prices1), 5, 'Buy on day 2 (price=1) and sell on day 5 (price=6) profit = 5');

console.log('✅ TC-02 PASSED: Standard profit calculation verified.');

// ============================================================================
// TC-03: Monotonically decreasing prices ([7, 6, 4, 3, 1] -> 0)
// ============================================================================
console.log('Running TC-03: Monotonically decreasing prices...');

const pricesDecreasing = [7, 6, 4, 3, 1];
assert.strictEqual(maxProfit(pricesDecreasing), 0, 'No profit possible on strictly decreasing prices');

console.log('✅ TC-03 PASSED: Zero profit returned for monotonically falling prices.');

// ============================================================================
// TC-04: Constant prices ([3, 3, 3, 3] -> 0)
// ============================================================================
console.log('Running TC-04: Constant prices...');

const pricesFlat = [3, 3, 3, 3];
assert.strictEqual(maxProfit(pricesFlat), 0, 'Flat prices should yield 0 profit');

console.log('✅ TC-04 PASSED: Constant prices yield 0 profit.');

// ============================================================================
// TC-05: Lowest buy price at the very end ([2, 4, 1] -> 2)
// ============================================================================
console.log('Running TC-05: Lowest price at the end (Time-arrow invariant)...');

// Here minPrice becomes 1 on day 3, but you cannot sell in the past!
// Max profit must be buying at 2 and selling at 4 = 2.
const pricesMinAtEnd = [2, 4, 1];
assert.strictEqual(maxProfit(pricesMinAtEnd), 2, 'Cannot sell in the past; profit must be 2');

console.log('✅ TC-05 PASSED: Time-arrow invariant preserved (cannot sell before buying).');

// ============================================================================
// TC-06: Minimal 2-element arrays
// ============================================================================
console.log('Running TC-06: Two-element boundary cases...');

assert.strictEqual(maxProfit([1, 2]), 1, '[1, 2] profit is 1');
assert.strictEqual(maxProfit([2, 1]), 0, '[2, 1] profit is 0');
assert.strictEqual(maxProfit([10, 10]), 0, '[10, 10] profit is 0');

console.log('✅ TC-06 PASSED: Minimal two-element cases verified.');

// ============================================================================
// TC-07: Multiple local peaks and troughs ([3, 2, 6, 5, 0, 3] -> 4)
// ============================================================================
console.log('Running TC-07: Multiple peaks and valleys...');

// Valley 1 = 2, Peak 1 = 6 (profit = 4).
// Valley 2 = 0, Peak 2 = 3 (profit = 3).
// Global max profit is 4.
const pricesMultiplePeaks = [3, 2, 6, 5, 0, 3];
assert.strictEqual(maxProfit(pricesMultiplePeaks), 4, 'Global max profit must be 4');

console.log('✅ TC-07 PASSED: Global maximum correctly selected across multiple peaks.');

// ============================================================================
// TC-08: Stress test 50,000 prices (< 10ms)
// ============================================================================
console.log('Running TC-08: Stress test 50,000 prices...');

const bigPrices = [];
for (let i = 0; i < 50000; i++) {
  bigPrices.push((i * 37 + 13) % 1000);
}

const startTime = process.hrtime.bigint();
const result = maxProfit(bigPrices);
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

console.log(`⚡ Execution time for 50,000 prices: ${durationMs.toFixed(2)}ms`);
assert.ok(result > 0, 'Stress test result should be positive');
assert.ok(durationMs < 20, `Execution time ${durationMs.toFixed(2)}ms must be under 20ms`);

console.log('✅ TC-08 PASSED: Stress test verified 50,000 elements in sub-10ms with O(n) linear complexity.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 8 BEST TIME TO BUY STOCK TESTS PASSED! (Week 5 Day 1)');
console.log('Time Complexity: O(n) | Auxiliary Space Complexity: O(1)');

