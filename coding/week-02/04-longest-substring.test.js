/**
 * ============================================================================
 * 🧪 TEST SUITE: LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS (LeetCode #3)
 * ============================================================================
 * Quy chuẩn kiểm thử:
 * - Native node:assert (Zero external npm dependencies)
 * - Test-First Discipline: Viết toàn bộ 8 test cases trước khi code mã nguồn
 * - Bao quát 100% boundary: Null, undefined, non-string, chuỗi rỗng, 1 ký tự,
 *   chuỗi đồng nhất, bẫy nhảy lùi con trỏ (abba trap), ký tự đặc biệt/dấu cách,
 *   toàn bộ ký tự duy nhất, và benchmark 50,000 ký tự.
 * ============================================================================
 */

const assert = require('node:assert');
const { lengthOfLongestSubstring } = require('./04-longest-substring');

console.log('--- Starting Test Suite: Longest Substring Without Repeating Characters (Week 2 Day 4) ---');

console.log('Running TC-01: Guard clause & Invalid inputs (null, undefined, non-string)...');
assert.strictEqual(lengthOfLongestSubstring(null), 0, 'Null input should return 0');
assert.strictEqual(lengthOfLongestSubstring(undefined), 0, 'Undefined input should return 0');
assert.strictEqual(lengthOfLongestSubstring(12345), 0, 'Number input should return 0');
assert.strictEqual(lengthOfLongestSubstring({}), 0, 'Object input should return 0');
assert.strictEqual(lengthOfLongestSubstring([]), 0, 'Array input should return 0');
assert.strictEqual(lengthOfLongestSubstring(true), 0, 'Boolean input should return 0');

console.log('Running TC-02: Boundary cases (empty string, single character, single whitespace)...');
assert.strictEqual(lengthOfLongestSubstring(''), 0, 'Empty string should return 0');
assert.strictEqual(lengthOfLongestSubstring('a'), 1, 'Single character should return 1');
assert.strictEqual(lengthOfLongestSubstring(' '), 1, 'Single whitespace should return 1');

console.log('Running TC-03: Standard classic LeetCode cases ("abcabcbb", "bbbbb", "pwwkew")...');
assert.strictEqual(lengthOfLongestSubstring('abcabcbb'), 3, 'abcabcbb should return 3 (abc)');
assert.strictEqual(lengthOfLongestSubstring('bbbbb'), 1, 'bbbbb should return 1 (b)');
assert.strictEqual(lengthOfLongestSubstring('pwwkew'), 3, 'pwwkew should return 3 (wke)');

console.log('Running TC-04: Critical Backward-Jump Trap ("abba", "tmmzuxt")...');
// In "abba": At index 3 ('a'), previous 'a' is at index 0.
// But window left pointer is ALREADY at index 2 (after 'b').
// Left pointer MUST NOT jump backward from 2 to 1 (0 + 1).
assert.strictEqual(lengthOfLongestSubstring('abba'), 2, 'abba must return 2 (ab or ba), left must not jump backward');
assert.strictEqual(lengthOfLongestSubstring('tmmzuxt'), 5, 'tmmzuxt must return 5 (mzuxt)');

console.log('Running TC-05: Strings with special characters, numbers, and whitespaces...');
assert.strictEqual(lengthOfLongestSubstring('a b c a b c'), 3, '"a b c a b c" should return 3 ("a b" or " b ")');
assert.strictEqual(lengthOfLongestSubstring('abc 123!@# abc'), 10, 'Mixed alphanumeric and symbols should return 10');
assert.strictEqual(lengthOfLongestSubstring('   '), 1, 'Multiple consecutive spaces should return 1');

console.log('Running TC-06: Strings with all unique characters...');
assert.strictEqual(lengthOfLongestSubstring('abcdefghijk'), 11, 'All unique characters should return s.length');
assert.strictEqual(lengthOfLongestSubstring('0123456789'), 10, 'All unique digits should return 10');

console.log('Running TC-07: Optimal substring at boundary edges ("aab", "dvdf", "cdd")...');
assert.strictEqual(lengthOfLongestSubstring('aab'), 2, 'aab should return 2 (ab at the end)');
assert.strictEqual(lengthOfLongestSubstring('dvdf'), 3, 'dvdf should return 3 (vdf)');
assert.strictEqual(lengthOfLongestSubstring('cdd'), 2, 'cdd should return 2 (cd at the start)');

console.log('Running TC-08: Performance benchmark (50,000 characters < 20ms)...');
const largePattern = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'
  .repeat(1000); // 48 * 1000 = 48,000 characters
const startTime = process.hrtime.bigint();
const result = lengthOfLongestSubstring(largePattern);
const endTime = process.hrtime.bigint();
const elapsedMs = Number(endTime - startTime) / 1e6;

assert.strictEqual(result, 48, 'Should find longest non-repeating sequence of 48 characters');
console.log(`⚡ Performance: Processed ${largePattern.length} characters in ${elapsedMs.toFixed(2)}ms (Target < 20ms)`);
assert.ok(elapsedMs < 20, `Execution time ${elapsedMs.toFixed(2)}ms exceeded 20ms threshold`);

console.log('------------------------------------------------------------------------');
console.log('✅ ALL LONGEST SUBSTRING TESTS PASSED SUCCESSFULLY! (8/8 test cases passed)');
console.log('Time Complexity: O(n) | Auxiliary Space Complexity: O(min(m, n))');
