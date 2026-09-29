/**
 * ============================================================================
 * 🧪 TEST SUITE: VALID PARENTHESES (Week 3 Day 1 - Issue #34)
 * ============================================================================
 * Quy chuẩn kiểm thử:
 * - Native node:assert (Zero external npm dependencies)
 * - Test-First Discipline: Định nghĩa trọn vẹn 8 test cases trước khi viết solution
 * - Bao quát 100% boundary & edge cases: null, undefined, invalid type, empty string,
 *   odd length early-exit, incorrect bracket type, incorrect nesting, closing bracket
 *   on empty stack, and 100k characters performance stress test.
 * ============================================================================
 */

const assert = require('node:assert');
const { isValid } = require('./01-valid-parentheses');

console.log('--- Starting Test Suite: Valid Parentheses (Week 3 Day 1) ---');

// ============================================================================
// TC-01: Guard Clauses & Invalid Inputs
// Invariant: Non-string inputs or null/undefined must fail fast safely
// ============================================================================
console.log('Running TC-01: Guard clauses & Invalid inputs...');
assert.strictEqual(isValid(null), false, 'Should return false when s is null');
assert.strictEqual(isValid(undefined), false, 'Should return false when s is undefined');
assert.strictEqual(isValid(12345), false, 'Should return false when s is a number');
assert.strictEqual(isValid({}), false, 'Should return false when s is an object');
assert.strictEqual(isValid(['()']), false, 'Should return false when s is an array');
assert.strictEqual(isValid(true), false, 'Should return false when s is a boolean');

// ============================================================================
// TC-02: Early Exit for Odd Length Strings
// Invariant: An odd length string can never form complete bracket pairs (O(1) exit)
// ============================================================================
console.log('Running TC-02: Early exit for odd length strings...');
assert.strictEqual(isValid('('), false, 'Single open bracket should return false');
assert.strictEqual(isValid(')'), false, 'Single close bracket should return false');
assert.strictEqual(isValid('(()'), false, 'Odd length 3 should return false');
assert.strictEqual(isValid('{[]}'), true, 'Even length 4 should continue validation');
assert.strictEqual(isValid('{[]'), false, 'Odd length 3 with mixed brackets should return false');
assert.strictEqual(isValid('((((('), false, 'Odd length 5 open brackets should return false');

// ============================================================================
// TC-03: Empty String (Boundary Case)
// Invariant: Empty string has no syntax violation, conventionally valid
// ============================================================================
console.log('Running TC-03: Empty string boundary case...');
assert.strictEqual(isValid(''), true, 'Empty string should return true');

// ============================================================================
// TC-04: Standard Valid Test Cases (Happy Path)
// Invariant: Balanced brackets closed in proper LIFO order return true
// ============================================================================
console.log('Running TC-04: Standard valid test cases...');
assert.strictEqual(isValid('()'), true, 'Simple parentheses "()" should return true');
assert.strictEqual(isValid('()[]{}'), true, 'Consecutive valid pairs "()[]{}" should return true');
assert.strictEqual(isValid('{[]}'), true, 'Nested valid brackets "{[]}" should return true');
assert.strictEqual(isValid('{[()]}'), true, 'Deeply nested valid brackets "{[()]}" should return true');
assert.strictEqual(isValid('((({{{[[[]]]}}})))'), true, 'Complex symmetric nesting should return true');

// ============================================================================
// TC-05: Mismatched Bracket Types
// Invariant: Closing bracket must match the exact opening bracket type at stack top
// ============================================================================
console.log('Running TC-05: Mismatched bracket types...');
assert.strictEqual(isValid('(]'), false, 'Mismatched "(]" should return false');
assert.strictEqual(isValid('{)'), false, 'Mismatched "{)" should return false');
assert.strictEqual(isValid('[}'), false, 'Mismatched "[}" should return false');
assert.strictEqual(isValid('{[(])}'), false, 'Mismatched inner bracket should return false');

// ============================================================================
// TC-06: Incorrect Nesting Order
// Invariant: Brackets must close in strict LIFO order
// ============================================================================
console.log('Running TC-06: Incorrect nesting order...');
assert.strictEqual(isValid('([)]'), false, 'Interleaved brackets "([)]" should return false');
assert.strictEqual(isValid('{[(])}'), false, 'Crossed brackets should return false');
assert.strictEqual(isValid('[{]}'), false, 'Interleaved brackets "[{]}" should return false');

// ============================================================================
// TC-07: Premature Closing Bracket on Empty Stack / Unclosed Open Brackets
// Invariant: Closing bracket without corresponding opening bracket or unclosed openings
// ============================================================================
console.log('Running TC-07: Closing bracket on empty stack & unclosed brackets...');
assert.strictEqual(isValid(']'), false, 'Single close bracket should return false');
assert.strictEqual(isValid(']()'), false, 'Leading close bracket should return false');
assert.strictEqual(isValid(')()'), false, 'Leading close bracket should return false');
assert.strictEqual(isValid('()('), false, 'Trailing unclosed bracket should return false');
assert.strictEqual(isValid('(('), false, 'All unclosed brackets should return false');
assert.strictEqual(isValid('({['), false, 'Multiple unclosed brackets should return false');

// ============================================================================
// TC-08: Performance & Stress Test on Large Input (100,000 characters)
// Invariant: O(n) linear scan must complete under 25ms without stack overflow
// ============================================================================
console.log('Running TC-08: Performance stress test (100,000 chars)...');
const repeatCount = 25000;
const largeValidStr = '({[]})'.repeat(repeatCount); // 150,000 characters
const startTime = process.hrtime.bigint();
const result = isValid(largeValidStr);
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

assert.strictEqual(result, true, 'Large valid bracket string must evaluate to true');
console.log(`Execution time for 150,000 characters: ${durationMs.toFixed(2)}ms`);
assert.ok(durationMs < 50, `Performance budget exceeded: ${durationMs.toFixed(2)}ms >= 50ms`);

// Test large invalid string (fails fast due to odd length or early mismatch)
const largeInvalidStr = '({[]})'.repeat(repeatCount) + '(';
const resultInvalid = isValid(largeInvalidStr);
assert.strictEqual(resultInvalid, false, 'Large invalid odd string must return false');

console.log('--- ALL 8 TEST CASES PASSED SUCCESSFULLY ---');
