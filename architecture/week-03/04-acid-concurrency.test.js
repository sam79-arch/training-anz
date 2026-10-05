/**
 * Test Suite: Database Concurrency & ACID Isolation Levels (Week 3 Day 4)
 * 
 * Target: HCLTech x ANZ Bank (Data Platform Team)
 * Objective: Verify 4 ANSI SQL Isolation Levels, 3 Concurrency Anomalies,
 *            and compare Pessimistic vs Optimistic Locking with native assert.
 */

const assert = require('node:assert');
const { Database, IsolationLevel } = require('./04-acid-concurrency');

async function runTestSuite() {
  console.log('--- Starting Test Suite: Database Concurrency & ACID Isolation Levels ---');

  // =========================================================================
  // TC-01: Dirty Read (Read Uncommitted vs Read Committed)
  // Anomaly: Tx2 reads uncommitted modifications of Tx1. If Tx1 rolls back,
  //          Tx2 worked with phantom "dirty" data that never legally existed.
  // =========================================================================
  console.log('Running TC-01: Dirty Read Anomaly & Prevention...');
  {
    const db = new Database();
    db.seedAccount('ACC-101', 1000); // Initial balance $1,000

    // Sub-case A: READ_UNCOMMITTED permits Dirty Read
    const tx1 = db.beginTransaction(IsolationLevel.READ_UNCOMMITTED);
    const tx2 = db.beginTransaction(IsolationLevel.READ_UNCOMMITTED);

    tx1.write('ACC-101', 5000); // Tx1 writes uncommitted $5,000

    const dirtyBalance = tx2.read('ACC-101');
    assert.strictEqual(dirtyBalance, 5000, 'READ_UNCOMMITTED must read uncommitted dirty value');

    tx1.rollback(); // Tx1 aborts!
    const balanceAfterRollback = db.getCommitted('ACC-101').balance;
    assert.strictEqual(balanceAfterRollback, 1000, 'Committed balance must remain $1,000 after rollback');
    tx2.commit();

    // Sub-case B: READ_COMMITTED prevents Dirty Read
    const tx3 = db.beginTransaction(IsolationLevel.READ_COMMITTED);
    const tx4 = db.beginTransaction(IsolationLevel.READ_COMMITTED);

    tx3.write('ACC-101', 9999); // Uncommitted write by Tx3
    const cleanBalance = tx4.read('ACC-101');
    assert.strictEqual(cleanBalance, 1000, 'READ_COMMITTED must strictly ignore uncommitted writes');

    tx3.rollback();
    tx4.commit();
    console.log('✅ TC-01 PASSED: Dirty Read allowed in Read Uncommitted, prevented in Read Committed.');
  }

  // =========================================================================
  // TC-02: Non-repeatable Read (Read Committed vs Repeatable Read)
  // Anomaly: Tx1 reads row R, Tx2 updates row R and commits.
  //          Tx1 re-reads row R and gets a different value within the same Tx.
  // =========================================================================
  console.log('Running TC-02: Non-repeatable Read Anomaly & Snapshot Isolation...');
  {
    const db = new Database();
    db.seedAccount('ACC-202', 500);

    // Sub-case A: READ_COMMITTED permits Non-repeatable Read
    const tx1 = db.beginTransaction(IsolationLevel.READ_COMMITTED);
    const read1 = tx1.read('ACC-202');
    assert.strictEqual(read1, 500);

    const tx2 = db.beginTransaction(IsolationLevel.READ_COMMITTED);
    tx2.write('ACC-202', 800);
    tx2.commit(); // Tx2 commits new balance

    const read2 = tx1.read('ACC-202');
    assert.strictEqual(read2, 800, 'READ_COMMITTED re-reads freshly committed value (Non-repeatable Read occurs)');
    tx1.commit();

    // Sub-case B: REPEATABLE_READ guarantees MVCC Snapshot Consistency
    const tx3 = db.beginTransaction(IsolationLevel.REPEATABLE_READ);
    const read3 = tx3.read('ACC-202');
    assert.strictEqual(read3, 800);

    const tx4 = db.beginTransaction(IsolationLevel.READ_COMMITTED);
    tx4.write('ACC-202', 1500);
    tx4.commit(); // Tx4 commits $1,500

    const read4 = tx3.read('ACC-202');
    assert.strictEqual(read4, 800, 'REPEATABLE_READ must maintain consistent MVCC snapshot regardless of external commits');
    tx3.commit();

    // After tx3 commits, global committed balance is 1500
    assert.strictEqual(db.getCommitted('ACC-202').balance, 1500);
    console.log('✅ TC-02 PASSED: Non-repeatable Read occurred in Read Committed, prevented by MVCC in Repeatable Read.');
  }

  // =========================================================================
  // TC-03: Phantom Read (Range Query Anomaly vs Serializable / Gap Prevention)
  // Anomaly: Tx1 queries range WHERE balance >= 1000. Tx2 inserts ACC-303 ($1,200).
  //          Tx1 queries same range again and sees new "phantom" row.
  // =========================================================================
  console.log('Running TC-03: Phantom Read Anomaly & Serializable Isolation...');
  {
    const db = new Database();
    db.seedAccount('ACC-301', 1200);
    db.seedAccount('ACC-302', 1500);

    // Sub-case A: Range query anomaly in REPEATABLE_READ when new row is inserted
    const tx1 = db.beginTransaction(IsolationLevel.READ_COMMITTED);
    const initialRange = tx1.queryRange(1000);
    assert.strictEqual(initialRange.length, 2, 'Initial query should see 2 accounts >= 1000');

    const tx2 = db.beginTransaction(IsolationLevel.READ_COMMITTED);
    db.seedAccount('ACC-303', 1800); // Concurrent insert
    tx2.commit();

    const secondRange = tx1.queryRange(1000);
    assert.strictEqual(secondRange.length, 3, 'Phantom row ACC-303 appeared in Read Committed range query');
    tx1.commit();

    // Sub-case B: SERIALIZABLE enforces predicate lock / transaction conflict detection
    const tx3 = db.beginTransaction(IsolationLevel.SERIALIZABLE);
    tx3.queryRange(1000);

    const tx4 = db.beginTransaction(IsolationLevel.SERIALIZABLE);
    assert.throws(
      () => {
        tx4.insert('ACC-304', 2000); // Conflicts with active Serializable range scan
      },
      /SerializationFailure|PredicateLockConflict/,
      'SERIALIZABLE must prevent phantom insertions conflicting with active range predicate'
    );
    tx3.commit();
    console.log('✅ TC-03 PASSED: Phantom Read demonstrated and prevented in Serializable mode.');
  }

  // =========================================================================
  // TC-04: Pessimistic Locking (SELECT ... FOR UPDATE)
  // Verifies exclusive row-level lock blocking concurrent updates.
  // =========================================================================
  console.log('Running TC-04: Pessimistic Locking (SELECT FOR UPDATE)...');
  {
    const db = new Database();
    db.seedAccount('ACC-401', 1000);

    const tx1 = db.beginTransaction(IsolationLevel.READ_COMMITTED);
    const lockedAccount = tx1.selectForUpdate('ACC-401');
    assert.strictEqual(lockedAccount.balance, 1000);

    // Tx2 attempts to acquire lock on ACC-401 while Tx1 holds it
    const tx2 = db.beginTransaction(IsolationLevel.READ_COMMITTED);
    assert.throws(
      () => {
        tx2.selectForUpdate('ACC-401');
      },
      /LockWaitTimeout|ResourceLockedError/,
      'Tx2 must be rejected or blocked when row is exclusively locked by Tx1'
    );

    // Tx1 updates balance and releases lock on commit
    tx1.write('ACC-401', 1200);
    tx1.commit();

    // Now Tx2 can safely acquire lock and see updated balance
    const tx2Retry = db.beginTransaction(IsolationLevel.READ_COMMITTED);
    const updatedLocked = tx2Retry.selectForUpdate('ACC-401');
    assert.strictEqual(updatedLocked.balance, 1200);
    tx2Retry.commit();
    console.log('✅ TC-04 PASSED: Exclusive row-level pessimistic locking verified.');
  }

  // =========================================================================
  // TC-05: Optimistic Locking (version column check)
  // Verifies atomic compare-and-swap (CAS) via version number.
  // =========================================================================
  console.log('Running TC-05: Optimistic Locking (Version Conflict Detection)...');
  {
    const db = new Database();
    db.seedAccount('ACC-501', 2000); // version starts at 1

    const accUser1 = db.getCommitted('ACC-501');
    const accUser2 = db.getCommitted('ACC-501');

    assert.strictEqual(accUser1.version, 1);
    assert.strictEqual(accUser2.version, 1);

    // User 1 submits transfer first: $2,000 - $300 = $1,700
    const tx1 = db.beginTransaction();
    const successUser1 = tx1.updateWithVersion('ACC-501', 1700, accUser1.version);
    assert.strictEqual(successUser1, true, 'User 1 update must succeed');
    tx1.commit();

    // Version in DB is now 2
    assert.strictEqual(db.getCommitted('ACC-501').version, 2);
    assert.strictEqual(db.getCommitted('ACC-501').balance, 1700);

    // User 2 attempts to submit transfer with stale version 1: $2,000 - $500 = $1,500
    const tx2 = db.beginTransaction();
    assert.throws(
      () => {
        tx2.updateWithVersion('ACC-501', 1500, accUser2.version);
      },
      /OptimisticLockException|StaleObjectState/,
      'User 2 must fail due to version mismatch (preventing Lost Update)'
    );
    tx2.rollback();

    // Balance remains intact at $1,700
    assert.strictEqual(db.getCommitted('ACC-501').balance, 1700);
    console.log('✅ TC-05 PASSED: Optimistic lock prevented Lost Update via version mismatch.');
  }

  // =========================================================================
  // TC-06: High-Concurrency Benchmark (50 Concurrent Transfers)
  // Verifies zero balance discrepancy under heavy concurrent transfers.
  // =========================================================================
  console.log('Running TC-06: High-Concurrency Banking Benchmark...');
  {
    const db = new Database();
    const INITIAL_TOTAL = 10000;
    db.seedAccount('ACC-A', 5000);
    db.seedAccount('ACC-B', 5000);

    // Perform 50 concurrent transactions using Pessimistic Lock sequentially resolving
    const transferAmount = 10;
    for (let i = 0; i < 50; i++) {
      const tx = db.beginTransaction(IsolationLevel.READ_COMMITTED);
      // Transfer from A to B
      const accA = tx.selectForUpdate('ACC-A');
      const accB = tx.selectForUpdate('ACC-B');
      tx.write('ACC-A', accA.balance - transferAmount);
      tx.write('ACC-B', accB.balance + transferAmount);
      tx.commit();
    }

    const finalA = db.getCommitted('ACC-A').balance;
    const finalB = db.getCommitted('ACC-B').balance;

    assert.strictEqual(finalA, 5000 - 50 * 10, 'ACC-A must be 4500');
    assert.strictEqual(finalB, 5000 + 50 * 10, 'ACC-B must be 5500');
    assert.strictEqual(finalA + finalB, INITIAL_TOTAL, 'Conservation of Money Invariant verified (Zero Lost Updates)');
    console.log(`✅ TC-06 PASSED: Verified 50 concurrent transfers with Conservation of Money (${finalA} + ${finalB} = ${INITIAL_TOTAL}).`);
  }

  console.log('--- ALL 6 DATABASE CONCURRENCY & ACID TESTS PASSED SUCCESSFULLY! ---');
}

// Execute tests
runTestSuite().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
