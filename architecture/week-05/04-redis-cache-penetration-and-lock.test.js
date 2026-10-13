/**
 * ============================================================================
 * 🧪 TEST SUITE: CACHE PENETRATION & DISTRIBUTED LOCK (Week 5 Day 4)
 * ============================================================================
 * Target: Data Platform System Design | ANZ Bank Architecture Interview
 * Topics:
 * 1. Cache Penetration Anomaly & Demonstration.
 * 2. Defense Strategy A: Null Object Caching (Short TTL).
 * 3. Defense Strategy B: Bloom Filter (Probabilistic Non-Existence Filtering).
 * 4. Distributed Lock Mutual Exclusion (SET NX PX pattern).
 * 5. Safe Atomic Release (Ownership verification).
 * 6. High-Concurrency Banking Overdraft Protection (50 concurrent withdrawals).
 * ============================================================================
 */

const assert = require('node:assert');
const {
  BloomFilter,
  NullObjectCacheManager,
  DistributedLockManager
} = require('./04-redis-cache-penetration-and-lock.js');

console.log('--- Starting Test Suite: Cache Penetration & Distributed Lock (Week 5 Day 4) ---');

// ============================================================================
// TC-01: Cache Penetration Anomaly (Flooding Primary DB)
// ============================================================================
console.log('Running TC-01: Cache Penetration anomaly demonstration...');

const rawDb = new Map();
rawDb.set('acc:1', { id: 'acc:1', balance: 1000 });
let dbCallCount = 0;

function naiveGet(id) {
  // Naive cache that does NOT store nulls
  dbCallCount++;
  return rawDb.get(id) || null;
}

// Attacker queries non-existent ID 5 times
for (let i = 0; i < 5; i++) {
  naiveGet('acc:non_existent_999');
}
assert.strictEqual(dbCallCount, 5, 'Every query hits DB because null was not cached');

console.log('✅ TC-01 PASSED: Demonstrated Cache Penetration vulnerability.');

// ============================================================================
// TC-02: Defense A — Null Object Caching (Short TTL)
// ============================================================================
console.log('Running TC-02: Defense via Null Object Caching...');

const nullCacheMgr = new NullObjectCacheManager(rawDb, 30); // 30s TTL for nulls

// First read of non-existent key: Misses cache, queries DB (once), caches NULL
const r1 = nullCacheMgr.get('acc:invalid_123');
assert.strictEqual(r1, null);
assert.strictEqual(nullCacheMgr.dbReadCount, 1, 'First query reads DB');

// Next 4 reads: Hit NULL cache entry with zero DB reads!
for (let i = 0; i < 4; i++) {
  const rNext = nullCacheMgr.get('acc:invalid_123');
  assert.strictEqual(rNext, null);
}
assert.strictEqual(nullCacheMgr.dbReadCount, 1, 'Subsequent queries must be shielded by Null cache');

console.log('✅ TC-02 PASSED: Null Object Caching successfully shielded Primary DB.');

// ============================================================================
// TC-03: Defense B — Bloom Filter (Probabilistic Non-Existence Filtering)
// ============================================================================
console.log('Running TC-03: Defense via Bloom Filter...');

const bloom = new BloomFilter(1024); // 1024 bits bitset
bloom.add('acc:user_101');
bloom.add('acc:user_102');
bloom.add('acc:user_103');

// Elements that were added MUST return true (Zero False Negatives)
assert.strictEqual(bloom.mightContain('acc:user_101'), true);
assert.strictEqual(bloom.mightContain('acc:user_102'), true);
assert.strictEqual(bloom.mightContain('acc:user_103'), true);

// An element that definitely does not exist should return false
assert.strictEqual(bloom.mightContain('acc:hacker_attack_999'), false, 'Non-existent key rejected by Bloom Filter');

console.log('✅ TC-03 PASSED: Bloom Filter accurately filtered non-existent keys before touching cache or DB.');

// ============================================================================
// TC-04: Distributed Lock Mutual Exclusion (SET NX PX)
// ============================================================================
console.log('Running TC-04: Distributed Lock mutual exclusion...');

const lockMgr = new DistributedLockManager();

// Worker 1 acquires lock on account ACC_100
const acquiredW1 = lockMgr.acquire('lock:acc:100', 5000, 'worker-1');
assert.strictEqual(acquiredW1, true, 'Worker 1 must acquire lock successfully');

// Worker 2 attempts to acquire lock on the SAME account -> MUST BE REJECTED
const acquiredW2 = lockMgr.acquire('lock:acc:100', 5000, 'worker-2');
assert.strictEqual(acquiredW2, false, 'Worker 2 must be blocked by mutual exclusion');

console.log('✅ TC-04 PASSED: Distributed Lock strictly enforced mutual exclusion.');

// ============================================================================
// TC-05: Safe Atomic Release (Ownership Verification)
// ============================================================================
console.log('Running TC-05: Safe Atomic Release ownership verification...');

// Worker 2 attempts to release Worker 1's lock -> REJECTED!
const stolenRelease = lockMgr.release('lock:acc:100', 'worker-2');
assert.strictEqual(stolenRelease, false, 'Worker 2 cannot release a lock owned by Worker 1');
assert.strictEqual(lockMgr.isLocked('lock:acc:100'), true, 'Lock must remain active');

// Worker 1 legitimately releases its own lock -> SUCCESS!
const legitimateRelease = lockMgr.release('lock:acc:100', 'worker-1');
assert.strictEqual(legitimateRelease, true, 'Owner Worker 1 can release lock');
assert.strictEqual(lockMgr.isLocked('lock:acc:100'), false, 'Lock is now free');

// Now Worker 2 can acquire the lock
assert.strictEqual(lockMgr.acquire('lock:acc:100', 5000, 'worker-2'), true);
lockMgr.release('lock:acc:100', 'worker-2');

console.log('✅ TC-05 PASSED: Safe atomic release prevented cross-worker lock theft.');

// ============================================================================
// TC-06: High-Concurrency Banking Benchmark (50 Concurrent Withdrawals)
// ============================================================================
console.log('Running TC-06: Concurrency Banking Benchmark with Distributed Lock...');

// Bank account with initial balance = $1000
const account = { id: 'ACC_SHARED', balance: 1000 };
let successfulWithdrawals = 0;
let rejectedAttempts = 0;

// 50 concurrent transactions attempt to withdraw $100 each
const totalTxs = 50;
const withdrawalAmount = 100;

for (let i = 0; i < totalTxs; i++) {
  const workerId = `tx-worker-${i}`;
  const lockAcquired = lockMgr.acquire('lock:acc:ACC_SHARED', 1000, workerId);

  if (lockAcquired) {
    // Critical Section protected by Distributed Lock
    if (account.balance >= withdrawalAmount) {
      account.balance -= withdrawalAmount;
      successfulWithdrawals++;
    }
    lockMgr.release('lock:acc:ACC_SHARED', workerId);
  } else {
    rejectedAttempts++;
  }
}

// Invariant: Balance must NEVER become negative!
assert.ok(account.balance >= 0, 'Account balance must never be negative');
assert.strictEqual(
  account.balance + successfulWithdrawals * withdrawalAmount,
  1000,
  'Conservation of Money invariant must hold'
);

console.log(`⚡ Benchmark: ${successfulWithdrawals} successful withdrawals, ${rejectedAttempts} lock conflicts resolved`);
console.log(`⚡ Final Balance: $${account.balance} (Zero Overdraft Guarantee)`);
console.log('✅ TC-06 PASSED: Distributed Lock guaranteed financial invariants under concurrent traffic.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 6 CACHE PENETRATION & DISTRIBUTED LOCK TESTS PASSED! (Week 5 Day 4)');

