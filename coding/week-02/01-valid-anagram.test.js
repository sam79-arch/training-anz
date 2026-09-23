/**
 * ============================================================================
 * 🧪 TEST SUITE: VALID ANAGRAM & GROUP ANAGRAMS (Week 2 Day 1)
 * ============================================================================
 * Quy chuẩn kiểm thử:
 * - Native node:assert (Zero external npm libraries)
 * - Test-First: Định nghĩa toàn bộ 10 test cases trước khi cài đặt giải thuật
 * - Bao quát 100% edge cases: Null, undefined, empty, single char, large input
 * ============================================================================
 */

const assert = require('node:assert');
const { isAnagram, groupAnagrams } = require('./01-valid-anagram');

console.log('--- Starting Test Suite: Valid Anagram & Group Anagrams (Week 2 Day 1) ---');

// ============================================================================
// 1. UNIT TESTS: VALID ANAGRAM (LeetCode #242)
// ============================================================================

console.log('Running TC-01: Valid Anagram - Guard clauses & Invalid inputs...');
assert.strictEqual(isAnagram(null, 'anagram'), false, 'Should return false when s is null');
assert.strictEqual(isAnagram('anagram', undefined), false, 'Should return false when t is undefined');
assert.strictEqual(isAnagram(123, '123'), false, 'Should return false when s is not a string');
assert.strictEqual(isAnagram({}, 'test'), false, 'Should return false when s is an object');
assert.strictEqual(isAnagram([], []), false, 'Should return false when inputs are arrays');

console.log('Running TC-02: Valid Anagram - Different lengths (Early-Exit)...');
assert.strictEqual(isAnagram('a', 'ab'), false, 'Different length should return false immediately');
assert.strictEqual(isAnagram('abc', 'abcd'), false, 'Different length should return false immediately');
assert.strictEqual(isAnagram('bank', 'ban'), false, 'Different length should return false immediately');

console.log('Running TC-03: Valid Anagram - Standard positive test cases...');
assert.strictEqual(isAnagram('anagram', 'nagaram'), true, 'Standard anagram should return true');
assert.strictEqual(isAnagram('listen', 'silent'), true, '"listen" and "silent" should return true');
assert.strictEqual(isAnagram('debitcard', 'badcredit'), true, 'Financial anagram "debitcard" vs "badcredit" should return true');

console.log('Running TC-04: Valid Anagram - Same length but different characters / frequencies...');
assert.strictEqual(isAnagram('rat', 'car'), false, '"rat" and "car" should return false');
assert.strictEqual(isAnagram('aa', 'bb'), false, 'Same length different letters should return false');
assert.strictEqual(isAnagram('aacc', 'ccac'), false, 'Same characters but different frequencies should return false');

console.log('Running TC-05: Valid Anagram - Empty strings & Single character...');
assert.strictEqual(isAnagram('', ''), true, 'Two empty strings should be anagrams');
assert.strictEqual(isAnagram('a', 'a'), true, 'Same single character should return true');
assert.strictEqual(isAnagram('a', 'b'), false, 'Different single characters should return false');

// ============================================================================
// 2. UNIT TESTS: GROUP ANAGRAMS (LeetCode #49)
// ============================================================================

// Helper function to normalize grouped results for deterministic assertion comparison
function normalizeGroups(groups) {
  if (!Array.isArray(groups)) return [];
  return groups
    .map(group => [...group].sort()) // Sắp xếp các phần tử bên trong mỗi nhóm
    .sort((a, b) => {
      // Sắp xếp các nhóm theo độ dài, rồi theo phần tử đầu tiên
      if (a.length !== b.length) return a.length - b.length;
      return (a[0] || '').localeCompare(b[0] || '');
    });
}

console.log('Running TC-06: Group Anagrams - Guard clauses & Minimal inputs...');
assert.deepStrictEqual(groupAnagrams(null), [], 'Should return [] for null input');
assert.deepStrictEqual(groupAnagrams(undefined), [], 'Should return [] for undefined input');
assert.deepStrictEqual(groupAnagrams('not an array'), [], 'Should return [] for non-array input');
assert.deepStrictEqual(groupAnagrams([]), [], 'Should return [] for empty array');
assert.deepStrictEqual(groupAnagrams(['a']), [['a']], 'Should return [["a"]] for single element array');

console.log('Running TC-07: Group Anagrams - Standard LeetCode example...');
const input7 = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
const expected7 = [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']];
assert.deepStrictEqual(
  normalizeGroups(groupAnagrams(input7)),
  normalizeGroups(expected7),
  'Should correctly group anagrams for standard mixed input'
);

console.log('Running TC-08: Group Anagrams - Multiple empty strings...');
const input8 = ['', ''];
const expected8 = [['', '']];
assert.deepStrictEqual(
  normalizeGroups(groupAnagrams(input8)),
  normalizeGroups(expected8),
  'Should group multiple empty strings together'
);

console.log('Running TC-09: Group Anagrams - All unique words (No matching anagrams)...');
const input9 = ['apple', 'banana', 'orange'];
const expected9 = [['apple'], ['banana'], ['orange']];
assert.deepStrictEqual(
  normalizeGroups(groupAnagrams(input9)),
  normalizeGroups(expected9),
  'Each unique word should be in its own single-item group'
);

console.log('Running TC-10: Group Anagrams - Large performance benchmark (5,000 items)...');
const largeInput = [];
const baseWords = ['listen', 'silent', 'enlist', 'tinsel', 'inlets', 'google', 'elastic', 'anzbank'];
for (let i = 0; i < 5000; i++) {
  largeInput.push(baseWords[i % baseWords.length]);
}

const startTime = process.hrtime.bigint();
const largeResult = groupAnagrams(largeInput);
const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;

assert.ok(Array.isArray(largeResult), 'Result must be an array');
assert.strictEqual(largeResult.length, 4, 'Should group 5000 words into exactly 4 distinct anagram groups');
console.log(`⚡ Performance: Processed 5,000 strings in ${durationMs.toFixed(2)}ms (Target < 30ms)`);
assert.ok(durationMs < 30, `Performance target exceeded: ${durationMs.toFixed(2)}ms >= 30ms`);

console.log('------------------------------------------------------------------------');
console.log('✅ ALL VALID ANAGRAM & GROUP ANAGRAMS TESTS PASSED SUCCESSFULLY! (10/10 TCs)');
console.log('Time Complexity: O(N * K) | Space Complexity: O(N * K)');

