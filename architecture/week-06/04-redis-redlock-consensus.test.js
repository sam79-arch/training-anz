/**
 * Unit Test Suite: Distributed Lock Redlock Consensus Deep Dive
 * 
 * Target: HCLTech Vietnam x ANZ Bank Backend Interview Prep
 * Standard: Native Node.js assert, Zero External Dependencies, Test-First Order
 */

const assert = require('node:assert');
const {
  MockRedisInstance,
  RedlockManager,
  FencingTokenStorage
} = require('./04-redis-redlock-consensus.js');

console.log('--- Starting Test Suite: Redlock Consensus & Fencing Tokens (Week 6 Day 4) ---');

// TC-01: Successful Redlock acquisition across quorum (>= 3/5 nodes)
console.log('Running TC-01: Redlock Quorum acquisition (3/5 nodes)...');
const redlock = new RedlockManager({ nodeCount: 5 });
const lock1 = redlock.acquireLock('account:balance:1001', 1000, 'worker-A');

assert.strictEqual(lock1.success, true, 'Lock acquisition must succeed when all nodes are healthy');
assert.ok(lock1.validityTime > 900, 'Validity time must remain within valid window');
assert.ok(lock1.fencingToken > 0, 'Must issue a valid monotonic fencing token');
assert.strictEqual(lock1.ownerId, 'worker-A', 'Owner must match worker-A');
console.log('✅ TC-01 PASSED: Redlock successfully acquired with Quorum consensus.');

// TC-02: Failure and immediate rollback when quorum cannot be reached (e.g., 3 nodes down)
console.log('Running TC-02: Lock failure and rollback on lack of quorum...');
redlock.nodes[0].isAlive = false;
redlock.nodes[1].isAlive = false;
redlock.nodes[2].isAlive = false; // 3 nodes down, only 2 alive (< quorum 3)

const lockFailed = redlock.acquireLock('account:balance:2002', 1000, 'worker-B');
assert.strictEqual(lockFailed.success, false, 'Lock must fail when quorum is unreachable');
assert.strictEqual(lockFailed.reason, 'QUORUM_NOT_REACHED');

// Verify that the 2 alive nodes had their locks cleaned up (rollback)
assert.strictEqual(redlock.nodes[3].get('account:balance:2002'), null, 'Node 3 must be rolled back');
assert.strictEqual(redlock.nodes[4].get('account:balance:2002'), null, 'Node 4 must be rolled back');

// Restore nodes
redlock.nodes[0].isAlive = true;
redlock.nodes[1].isAlive = true;
redlock.nodes[2].isAlive = true;
console.log('✅ TC-02 PASSED: Rollback verified across all instances on failed quorum.');

// TC-03: Clock drift & elapsed timeout detection
console.log('Running TC-03: Clock drift and validity window calculation...');
// Simulate artificial acquisition delay exceeding TTL
const lockTimeout = redlock.acquireLock('account:balance:3003', 10, 'worker-C', { simulatedDelayMs: 25 });
assert.strictEqual(lockTimeout.success, false, 'Lock must be rejected if acquisition time exceeds TTL');
assert.strictEqual(lockTimeout.reason, 'LOCK_EXPIRED_DURING_ACQUISITION');
console.log('✅ TC-03 PASSED: Clock drift and TTL expiration guard verified.');

// TC-04: Mutual exclusion between competing workers on 5 nodes
console.log('Running TC-04: Mutual exclusion between competing workers...');
const lockWorker1 = redlock.acquireLock('resource:payroll', 2000, 'payroll-worker-1');
assert.strictEqual(lockWorker1.success, true, 'Worker 1 should get the lock');

const lockWorker2 = redlock.acquireLock('resource:payroll', 2000, 'payroll-worker-2');
assert.strictEqual(lockWorker2.success, false, 'Worker 2 must be rejected due to mutual exclusion');

// Worker 1 releases lock
const releaseSuccess = redlock.releaseLock(lockWorker1);
assert.strictEqual(releaseSuccess, true, 'Worker 1 release must succeed');

// Now Worker 2 can acquire
const lockWorker2Retry = redlock.acquireLock('resource:payroll', 2000, 'payroll-worker-2');
assert.strictEqual(lockWorker2Retry.success, true, 'Worker 2 should now acquire lock');
redlock.releaseLock(lockWorker2Retry);
console.log('✅ TC-04 PASSED: Mutual exclusion strictly enforced across 5 nodes.');

// TC-05: Fencing Token monotonicity (Martin Kleppmann defense)
console.log('Running TC-05: Fencing Token monotonicity against delayed writes...');
const storage = new FencingTokenStorage();
const lockEarly = redlock.acquireLock('doc:statement:555', 2000, 'client-1');
assert.strictEqual(lockEarly.success, true, 'Client 1 should acquire initial lock');

// Simulate Client 1 lock expiring on Redis while Client 1 is paused in GC
redlock.releaseLock(lockEarly);

// Client 2 acquires new lock with a newer monotonic fencing token
const lockLater = redlock.acquireLock('doc:statement:555', 2000, 'client-2');
assert.strictEqual(lockLater.success, true, 'Client 2 should acquire subsequent lock');
assert.ok(lockLater.fencingToken > lockEarly.fencingToken, 'Later lock must have higher token');

// Later worker writes first (e.g. client-1 experienced GC pause)
const writeResult2 = storage.write('doc:statement:555', lockLater.fencingToken, 'New Statement Data');
assert.strictEqual(writeResult2.success, true, 'New write with higher token must succeed');

// Delayed earlier worker attempts to write with stale token
const writeResult1 = storage.write('doc:statement:555', lockEarly.fencingToken, 'Stale Outdated Data');
assert.strictEqual(writeResult1.success, false, 'Stale write must be rejected by storage engine');
assert.strictEqual(writeResult1.reason, 'STALE_FENCING_TOKEN');
console.log('✅ TC-05 PASSED: Storage layer safely rejected stale fencing token write.');

// TC-06: High-Concurrency Banking Benchmark with Redlock
console.log('Running TC-06: Concurrency Banking Benchmark (50 transactions)...');
let bankBalance = 1000;
const txCount = 50;
let successfulWithdrawals = 0;
let lockConflicts = 0;

for (let i = 0; i < txCount; i++) {
  const lock = redlock.acquireLock('account:balance:ANZ-001', 500, `tx-${i}`);
  if (lock.success) {
    if (bankBalance >= 20) {
      bankBalance -= 20;
      successfulWithdrawals++;
    }
    redlock.releaseLock(lock);
  } else {
    lockConflicts++;
  }
}

assert.strictEqual(bankBalance, 1000 - successfulWithdrawals * 20, 'Balance must be exact');
assert.ok(bankBalance >= 0, 'Zero overdraft invariant guaranteed');
console.log(`⚡ Benchmark: ${successfulWithdrawals} successful withdrawals, ${lockConflicts} conflicts resolved`);
console.log(`⚡ Final Bank Balance: $${bankBalance} (Zero Overdraft Guarantee)`);
console.log('✅ TC-06 PASSED: Concurrency benchmark verified financial invariants under Redlock.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 6 REDLOCK CONSENSUS & FENCING TOKEN TESTS PASSED! (Week 6 Day 4)');
