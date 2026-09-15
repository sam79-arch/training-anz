/**
 * Unit Test: Valid Palindrome (Two Pointers Left-Right Collision)
 * 
 * Framework: Native Node.js assert (Zero external dependencies)
 * Command: node coding/week-01/02-valid-palindrome.test.js
 */

const assert = require('assert');
const isPalindrome = require('./02-valid-palindrome');

function runTests() {
  console.log('--- Starting Test Suite: Valid Palindrome (Issue #9 - Week 1 Day 1) ---');

  // TC-01: Empty string and single character
  console.log('Running TC-01: Empty string and single character...');
  assert.strictEqual(isPalindrome(''), true, 'Empty string should be palindrome');
  assert.strictEqual(isPalindrome('a'), true, 'Single character should be palindrome');

  // TC-02: Guard clause (null, undefined, non-string types)
  console.log('Running TC-02: Guard clause with invalid types...');
  assert.strictEqual(isPalindrome(null), false, 'null should return false');
  assert.strictEqual(isPalindrome(undefined), false, 'undefined should return false');
  assert.strictEqual(isPalindrome(12321), false, 'number type should return false');
  assert.strictEqual(isPalindrome({}), false, 'object type should return false');

  // TC-03: Basic lowercase palindromes
  console.log('Running TC-03: Basic lowercase palindromes...');
  assert.strictEqual(isPalindrome('radar'), true, 'radar should be palindrome');
  assert.strictEqual(isPalindrome('level'), true, 'level should be palindrome');
  assert.strictEqual(isPalindrome('noon'), true, 'noon should be palindrome');

  // TC-04: Standard LeetCode mixed with punctuation, spaces, and case
  console.log('Running TC-04: Standard LeetCode sentence example...');
  assert.strictEqual(
    isPalindrome('A man, a plan, a canal: Panama'),
    true,
    'Classic Panama palindrome must be true'
  );

  // TC-05: Non-palindromes
  console.log('Running TC-05: Non-palindromes...');
  assert.strictEqual(isPalindrome('race a car'), false, 'race a car is not palindrome');
  assert.strictEqual(isPalindrome('0P'), false, '0P is not palindrome');
  assert.strictEqual(isPalindrome('hello'), false, 'hello is not palindrome');

  // TC-06: String with only special characters and spaces
  console.log('Running TC-06: Only special characters and spaces...');
  assert.strictEqual(isPalindrome('   .,!?  '), true, 'Only non-alphanumeric should be considered palindrome');
  assert.strictEqual(isPalindrome(':::'), true, 'Only symbols should be considered palindrome');

  // TC-07: Mixed alphanumeric and underscores
  console.log('Running TC-07: Mixed alphanumeric with numbers and underscores...');
  assert.strictEqual(isPalindrome('ab_a'), true, 'ab_a should ignore underscore and be palindrome');
  assert.strictEqual(isPalindrome('Was it a car or a cat I saw?'), true, 'Sentence palindrome must be true');

  console.log('------------------------------------------------------------------------');
  console.log('✅ ALL TESTS PASSED SUCCESSFULLY! (7/7 test cases passed)');
  console.log('Time Complexity: O(n) | Auxiliary Space Complexity: O(1)');
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;

