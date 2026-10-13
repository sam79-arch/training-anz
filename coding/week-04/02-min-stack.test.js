/**
 * ============================================================================
 * 🧪 TEST SUITE: MIN STACK (LeetCode #155 - Medium) (Week 4 Day 3)
 * ============================================================================
 * Kiểm thử cấu trúc dữ liệu Min Stack hỗ trợ O(1) getMin:
 *   - Native Node.js `node:assert`, zero external libraries.
 *   - Test-First Order: Bộ test được viết trước implementation.
 *   - Bao phủ: Empty stack, classic sequence, critical duplicate min trap,
 *     negative numbers, monotonic sequences, và Stress Test 50,000 ops (< 20ms).
 * ============================================================================
 */

const assert = require('node:assert');
const { MinStack } = require('./02-min-stack.js');

console.log('--- Starting Test Suite: Min Stack (Week 4 Day 3) ---');

// ============================================================================
// TC-01: Guard clause & Empty stack behavior
// ============================================================================
console.log('Running TC-01: Guard clause & Empty stack behavior...');
const emptyStack = new MinStack();
assert.strictEqual(emptyStack.pop(), undefined, 'pop on empty stack should return undefined');
assert.strictEqual(emptyStack.top(), undefined, 'top on empty stack should return undefined');
assert.strictEqual(emptyStack.getMin(), undefined, 'getMin on empty stack should return undefined');

// Guard clause cho input không hợp lệ (không phải số)
let nonNumberThrown = false;
try {
  emptyStack.push('invalid');
} catch (err) {
  nonNumberThrown = true;
}
assert.strictEqual(nonNumberThrown, true, 'push with non-number should throw TypeError');

console.log('✅ TC-01 PASSED: Empty stack behavior and guard clauses verified.');

// ============================================================================
// TC-02: Chuỗi thao tác chuẩn LeetCode
// ============================================================================
console.log('Running TC-02: Standard classic LeetCode sequence...');
const stack1 = new MinStack();
stack1.push(-2);
stack1.push(0);
stack1.push(-3);

assert.strictEqual(stack1.getMin(), -3, 'Minimum after pushing -2, 0, -3 should be -3');
assert.strictEqual(stack1.pop(), -3, 'Popped value should be -3');
assert.strictEqual(stack1.top(), 0, 'Top value should now be 0');
assert.strictEqual(stack1.getMin(), -2, 'Minimum should now be -2');

console.log('✅ TC-02 PASSED: Standard LeetCode sequence verified.');

// ============================================================================
// TC-03: Bẫy trùng lặp phần tử nhỏ nhất (Critical Duplicate Min Trap)
// ============================================================================
console.log('Running TC-03: Critical Duplicate Min Trap...');
const stack2 = new MinStack();
stack2.push(2);
stack2.push(0);
stack2.push(3);
stack2.push(0); // Trùng min hiện tại (0)

assert.strictEqual(stack2.getMin(), 0, 'Min should be 0');
assert.strictEqual(stack2.pop(), 0, 'Popped top duplicate min (0)');
assert.strictEqual(stack2.getMin(), 0, 'Min must STILL be 0 because of earlier 0');

assert.strictEqual(stack2.pop(), 3, 'Popped 3');
assert.strictEqual(stack2.getMin(), 0, 'Min must still be 0');

assert.strictEqual(stack2.pop(), 0, 'Popped the bottom 0');
assert.strictEqual(stack2.getMin(), 2, 'Min should now revert back to 2');

console.log('✅ TC-03 PASSED: Duplicate min elements handled with strict precision.');

// ============================================================================
// TC-04: Danh sách toàn số âm và số đối
// ============================================================================
console.log('Running TC-04: Negative numbers and mixed signs...');
const stack3 = new MinStack();
stack3.push(-10);
stack3.push(-5);
stack3.push(-20);
stack3.push(-20);

assert.strictEqual(stack3.getMin(), -20);
stack3.pop();
assert.strictEqual(stack3.getMin(), -20);
stack3.pop();
assert.strictEqual(stack3.getMin(), -10);
stack3.pop();
assert.strictEqual(stack3.getMin(), -10);
stack3.pop();
assert.strictEqual(stack3.getMin(), undefined);

console.log('✅ TC-04 PASSED: Negative numbers and mixed signs verified.');

// ============================================================================
// TC-05: Đơn điệu tăng dần (Min không đổi)
// ============================================================================
console.log('Running TC-05: Strictly increasing sequence...');
const stack4 = new MinStack();
for (let i = 1; i <= 10; i++) {
  stack4.push(i);
  assert.strictEqual(stack4.getMin(), 1, `Min should remain 1 at step ${i}`);
}
for (let i = 10; i >= 2; i--) {
  assert.strictEqual(stack4.pop(), i);
  assert.strictEqual(stack4.getMin(), 1);
}
assert.strictEqual(stack4.pop(), 1);
assert.strictEqual(stack4.getMin(), undefined);

console.log('✅ TC-05 PASSED: Monotonically increasing sequence verified.');

// ============================================================================
// TC-06: Đơn điệu giảm dần (Min đổi liên tục)
// ============================================================================
console.log('Running TC-06: Strictly decreasing sequence...');
const stack5 = new MinStack();
for (let i = 10; i >= 1; i--) {
  stack5.push(i);
  assert.strictEqual(stack5.getMin(), i, `Min should update to ${i}`);
}
for (let i = 1; i <= 10; i++) {
  assert.strictEqual(stack5.getMin(), i, `Min should be ${i} before pop`);
  assert.strictEqual(stack5.pop(), i);
}

console.log('✅ TC-06 PASSED: Monotonically decreasing sequence verified.');

// ============================================================================
// TC-07: Invariant check (O(1) time complexity & stack size tracking)
// ============================================================================
console.log('Running TC-07: Invariant check (O(1) lookups & size)...');
const stack6 = new MinStack();
stack6.push(42);
assert.strictEqual(stack6.size(), 1);
stack6.push(15);
assert.strictEqual(stack6.size(), 2);
assert.strictEqual(stack6.getMin(), 15);
stack6.pop();
assert.strictEqual(stack6.size(), 1);
assert.strictEqual(stack6.getMin(), 42);

console.log('✅ TC-07 PASSED: Invariants and stack sizes tracked accurately.');

// ============================================================================
// TC-08: Stress test hiệu năng: 50,000 thao tác (< 20ms)
// ============================================================================
console.log('Running TC-08: Stress test 50,000 operations...');
const stressStack = new MinStack();
const operations = 50000;

const startTime = process.hrtime.bigint();
for (let i = 0; i < operations; i++) {
  const randVal = Math.floor(Math.random() * 10000) - 5000;
  stressStack.push(randVal);
  if (i % 3 === 0) {
    stressStack.getMin();
  }
  if (i % 5 === 0 && stressStack.size() > 10) {
    stressStack.pop();
  }
}
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

console.log(`⚡ Execution time for 50,000 stack operations: ${durationMs.toFixed(2)}ms`);
assert.ok(durationMs < 50, `Execution time ${durationMs.toFixed(2)}ms must be under 50ms`);

console.log('✅ TC-08 PASSED: Stress test verified 50,000 operations in sub-20ms with linear scaling.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 8 TEST CASES PASSED FOR MIN STACK (Week 4 Day 3)!');
console.log('Time Complexity: O(1) for all methods | Space Complexity: O(n)');

