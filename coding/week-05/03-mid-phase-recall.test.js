/**
 * ============================================================================
 * 🧪 TEST SUITE: MID-PHASE RECALL & CONSOLIDATION (Week 5 Day 3)
 * ============================================================================
 * 1. Spaced Repetition Recall: Longest Substring Without Repeating Characters (LeetCode #3).
 * 2. Systems Recall: B+Tree Index Bookmark Lookup vs Covering Index Scan.
 * ============================================================================
 */

const assert = require('node:assert');
const {
  recallLongestSubstring,
  simulateBTreeScan
} = require('./03-mid-phase-recall.js');

console.log('--- Starting Test Suite: Mid-Phase Recall & Consolidation (Week 5 Day 3) ---');

// ============================================================================
// TC-01: Recall Sliding Window — Standard String Sequences
// ============================================================================
console.log('Running TC-01: Recall Sliding Window — Standard strings...');

assert.strictEqual(recallLongestSubstring('abcabcbb'), 3, "'abcabcbb' longest unique is 'abc' len 3");
assert.strictEqual(recallLongestSubstring('bbbbb'), 1, "'bbbbb' longest unique is 'b' len 1");
assert.strictEqual(recallLongestSubstring('pwwkew'), 3, "'pwwkew' longest unique is 'wke' len 3");
assert.strictEqual(recallLongestSubstring('abba'), 2, "'abba' sliding window backward index trap must return 2");

console.log('✅ TC-01 PASSED: Sliding Window recall handles duplicates and the classic abba trap.');

// ============================================================================
// TC-02: Recall Sliding Window — Edge Cases & Boundary Inputs
// ============================================================================
console.log('Running TC-02: Recall Sliding Window — Edge cases...');

assert.strictEqual(recallLongestSubstring(null), 0, 'null input returns 0');
assert.strictEqual(recallLongestSubstring(undefined), 0, 'undefined input returns 0');
assert.strictEqual(recallLongestSubstring(''), 0, 'empty string returns 0');
assert.strictEqual(recallLongestSubstring('a'), 1, 'single character returns 1');
assert.strictEqual(recallLongestSubstring('abcdef'), 6, 'all unique characters returns string length');

console.log('✅ TC-02 PASSED: Guard clauses and string boundaries verified.');

// ============================================================================
// TC-03: Recall B+Tree Index — Bookmark Lookup vs Covering Index
// ============================================================================
console.log('Running TC-03: Recall B+Tree Index — Bookmark Lookup vs Covering Index...');

const sampleAccounts = [
  { id: 101, branch: 'SYD', balance: 5000, riskScore: 'A' },
  { id: 102, branch: 'MEL', balance: 12000, riskScore: 'B' },
  { id: 103, branch: 'SYD', balance: 8000, riskScore: 'A' },
  { id: 104, branch: 'BNE', balance: 3000, riskScore: 'C' }
];

// Composite Index exists on: (branch, balance)
const indexCols = ['branch', 'balance'];

// Query 1: SELECT branch, balance WHERE branch = 'SYD'
// All requested columns are inside the composite index -> COVERING INDEX (Index-Only Scan)
const coveringResult = simulateBTreeScan(sampleAccounts, ['branch', 'balance'], indexCols);
assert.strictEqual(coveringResult.isCoveringIndex, true, 'Query columns match index -> Covering Index');
assert.strictEqual(coveringResult.heapAccessCount, 0, 'Zero table heap reads required for covering index');
assert.strictEqual(coveringResult.matchedCount, 2, '2 matching records found');

// Query 2: SELECT branch, balance, riskScore WHERE branch = 'SYD'
// 'riskScore' is NOT in index -> BOOKMARK LOOKUP (Table Heap Access needed!)
const lookupResult = simulateBTreeScan(sampleAccounts, ['branch', 'balance', 'riskScore'], indexCols);
assert.strictEqual(lookupResult.isCoveringIndex, false, 'Missing column requires Bookmark Lookup');
assert.strictEqual(lookupResult.heapAccessCount, 2, 'Must access heap 2 times to fetch riskScore');

console.log('✅ TC-03 PASSED: B+Tree Bookmark Lookup vs Covering Index verified.');

// ============================================================================
// TC-04: Complexity and Performance Scaling
// ============================================================================
console.log('Running TC-04: Complexity & Scaling benchmark...');

// 20,000 characters sliding window test
const bigStr = 'abcdefghijklmnopqrstuvwxyz'.repeat(800);
const startTime = process.hrtime.bigint();
const resultLen = recallLongestSubstring(bigStr);
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

console.log(`⚡ Sliding window execution for ${bigStr.length} chars: ${durationMs.toFixed(2)}ms`);
assert.strictEqual(resultLen, 26, 'Longest unique substring is full alphabet of 26');
assert.ok(durationMs < 15, `Duration ${durationMs.toFixed(2)}ms must be under 15ms`);

console.log('✅ TC-04 PASSED: Linear O(n) scaling confirmed for Sliding Window.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 4 MID-PHASE RECALL & CONSOLIDATION TESTS PASSED! (Week 5 Day 3)');

