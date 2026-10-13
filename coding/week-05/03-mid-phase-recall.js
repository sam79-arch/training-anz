/**
 * ============================================================================
 * 🧠 WEEK 5 - DAY 3: MID-PHASE RECALL & CONSOLIDATION
 * ============================================================================
 * 1. Spaced Repetition Recall: Longest Substring Without Repeating Characters (LeetCode #3)
 *    Mid-Phase Recall: [2026-10-14] - PASS in 12m
 * 2. System Design Recall: B+Tree Bookmark Lookup vs Covering Index Scan
 * Invariant: Line 1 must be a guard clause. Pure native Node.js.
 * ============================================================================
 */

/**
 * Mid-Phase Recall: Longest Substring Without Repeating Characters
 * Recalled from memory: Two Pointers Sliding Window with Map.
 *
 * @param {string} s - Input string
 * @returns {number} Maximum length of substring with unique characters
 *
 * Time Complexity: O(n) - Single pass with two pointers
 * Space Complexity: O(min(m, n)) - Set/Map bounded by alphabet size
 */
function recallLongestSubstring(s) {
  if (typeof s !== 'string' || s.length === 0) return 0;

  let left = 0;
  let maxLen = 0;
  const lastSeenMap = new Map();

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    if (lastSeenMap.has(char)) {
      // Critical 'abba' trap: left pointer must NEVER move backwards!
      left = Math.max(left, lastSeenMap.get(char) + 1);
    }

    lastSeenMap.set(char, right);
    const windowLength = right - left + 1;
    if (windowLength > maxLen) {
      maxLen = windowLength;
    }
  }

  return maxLen;
}

/**
 * Mid-Phase Systems Recall: Simulates B+Tree Index Scan paths
 * - Covering Index (Index-Only Scan): All projected columns exist in composite index -> 0 heap I/O.
 * - Bookmark Lookup: Missing column requires reading Table Heap pages via pointer (Bookmark).
 *
 * @param {Array<Object>} records - Table records
 * @param {string[]} queryCols - Columns requested in SELECT clause
 * @param {string[]} indexCols - Columns indexed in B+Tree Composite Index
 * @returns {Object} { isCoveringIndex, heapAccessCount, matchedCount }
 */
function simulateBTreeScan(records, queryCols, indexCols) {
  if (!Array.isArray(records) || !Array.isArray(queryCols) || !Array.isArray(indexCols)) {
    return { isCoveringIndex: false, heapAccessCount: 0, matchedCount: 0 };
  }

  const indexSet = new Set(indexCols);
  // id is implicitly available in secondary index leaf node as row pointer
  indexSet.add('id');

  // Check if every query column is covered by the index
  let isCoveringIndex = true;
  for (const col of queryCols) {
    if (!indexSet.has(col)) {
      isCoveringIndex = false;
      break;
    }
  }

  // Find matching records (e.g. branch = 'SYD')
  const matchedRecords = records.filter(r => r.branch === 'SYD');
  const matchedCount = matchedRecords.length;

  // If covering index: 0 heap I/O; otherwise 1 heap read per matching row (Bookmark Lookup)
  const heapAccessCount = isCoveringIndex ? 0 : matchedCount;

  return {
    isCoveringIndex,
    heapAccessCount,
    matchedCount
  };
}

module.exports = {
  recallLongestSubstring,
  simulateBTreeScan
};

