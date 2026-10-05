/**
 * Database Concurrency & ACID Isolation Levels Simulation Engine
 * 
 * Target: HCLTech x ANZ Bank (Data Platform Team)
 * Architecture: Native in-memory simulation of 4 ANSI SQL Isolation Levels,
 *               MVCC snapshot reads, Row-level Exclusive Locks (Pessimistic),
 *               and Atomic CAS Versioning (Optimistic).
 * Constraints: Native Node.js only, zero external dependencies, guard clauses at line 1.
 */

'use strict';

const IsolationLevel = Object.freeze({
  READ_UNCOMMITTED: 'READ_UNCOMMITTED',
  READ_COMMITTED: 'READ_COMMITTED',
  REPEATABLE_READ: 'REPEATABLE_READ',
  SERIALIZABLE: 'SERIALIZABLE',
});

class Database {
  constructor() {
    this.accounts = new Map(); // id -> { id, balance, version }
    this.rowLocks = new Map(); // id -> { txId, lockType: 'EXCLUSIVE' }
    this.uncommittedWrites = new Map(); // id -> { txId, balance }
    this.rangeScans = []; // [{ txId, minBalance }]
    this.activeTransactions = new Set();
    this.nextTxId = 1;
  }

  seedAccount(id, balance) {
    if (!id || typeof id !== 'string' || typeof balance !== 'number') return;
    this.accounts.set(id, { id, balance, version: 1 });
  }

  getCommitted(id) {
    if (!id || typeof id !== 'string') return null;
    const acc = this.accounts.get(id);
    return acc ? { ...acc } : null;
  }

  beginTransaction(isolationLevel = IsolationLevel.READ_COMMITTED) {
    if (!isolationLevel || !IsolationLevel[isolationLevel]) {
      isolationLevel = IsolationLevel.READ_COMMITTED;
    }
    const txId = this.nextTxId++;
    const tx = new Transaction(txId, isolationLevel, this);
    this.activeTransactions.add(txId);
    return tx;
  }
}

class Transaction {
  constructor(id, isolationLevel, db) {
    this.id = id;
    this.isolationLevel = isolationLevel;
    this.db = db;
    this.uncommittedWrites = new Map();
    this.pendingVersionIncrements = new Map();
    this.heldLocks = new Set();
    this.isCompleted = false;

    // MVCC Snapshot initialization for REPEATABLE_READ and SERIALIZABLE
    this.snapshot = new Map();
    if (
      isolationLevel === IsolationLevel.REPEATABLE_READ ||
      isolationLevel === IsolationLevel.SERIALIZABLE
    ) {
      for (const [key, val] of db.accounts.entries()) {
        this.snapshot.set(key, { ...val });
      }
    }
  }

  read(id) {
    if (!id || typeof id !== 'string') return null;
    if (this.isCompleted) throw new Error('TransactionAlreadyCompleted');

    // 1. Transaction's own private uncommitted writes take highest priority
    if (this.uncommittedWrites.has(id)) {
      return this.uncommittedWrites.get(id);
    }

    // 2. READ_UNCOMMITTED: Dirty Read allowed (sees any active tx's uncommitted write)
    if (this.isolationLevel === IsolationLevel.READ_UNCOMMITTED) {
      if (this.db.uncommittedWrites.has(id)) {
        return this.db.uncommittedWrites.get(id).balance;
      }
      const committed = this.db.accounts.get(id);
      return committed ? committed.balance : null;
    }

    // 3. REPEATABLE_READ & SERIALIZABLE: MVCC Snapshot read
    if (
      this.isolationLevel === IsolationLevel.REPEATABLE_READ ||
      this.isolationLevel === IsolationLevel.SERIALIZABLE
    ) {
      const snap = this.snapshot.get(id);
      return snap ? snap.balance : null;
    }

    // 4. READ_COMMITTED: Always reads latest globally committed data
    const committed = this.db.accounts.get(id);
    return committed ? committed.balance : null;
  }

  write(id, balance) {
    if (!id || typeof id !== 'string' || typeof balance !== 'number') return;
    if (this.isCompleted) throw new Error('TransactionAlreadyCompleted');

    this.uncommittedWrites.set(id, balance);
    this.db.uncommittedWrites.set(id, { txId: this.id, balance });
  }

  queryRange(minBalance) {
    if (typeof minBalance !== 'number') return [];
    if (this.isCompleted) throw new Error('TransactionAlreadyCompleted');

    if (this.isolationLevel === IsolationLevel.SERIALIZABLE) {
      this.db.rangeScans.push({ txId: this.id, minBalance });
    }

    const results = [];
    if (
      this.isolationLevel === IsolationLevel.REPEATABLE_READ ||
      this.isolationLevel === IsolationLevel.SERIALIZABLE
    ) {
      for (const acc of this.snapshot.values()) {
        const balance = this.uncommittedWrites.has(acc.id)
          ? this.uncommittedWrites.get(acc.id)
          : acc.balance;
        if (balance >= minBalance) {
          results.push({ ...acc, balance });
        }
      }
    } else {
      // READ_COMMITTED
      for (const acc of this.db.accounts.values()) {
        const balance = this.uncommittedWrites.has(acc.id)
          ? this.uncommittedWrites.get(acc.id)
          : acc.balance;
        if (balance >= minBalance) {
          results.push({ ...acc, balance });
        }
      }
    }
    return results;
  }

  insert(id, balance) {
    if (!id || typeof id !== 'string' || typeof balance !== 'number') return;
    if (this.isCompleted) throw new Error('TransactionAlreadyCompleted');

    // Predicate lock check for SERIALIZABLE isolation
    for (const scan of this.db.rangeScans) {
      if (scan.txId !== this.id && balance >= scan.minBalance) {
        throw new Error(
          `SerializationFailure: PredicateLockConflict - Insert of account ${id} ($${balance}) conflicts with active Serializable range scan from Tx ${scan.txId}`
        );
      }
    }

    this.db.accounts.set(id, { id, balance, version: 1 });
  }

  selectForUpdate(id) {
    if (!id || typeof id !== 'string') throw new Error('Invalid account ID');
    if (this.isCompleted) throw new Error('TransactionAlreadyCompleted');

    const currentLock = this.db.rowLocks.get(id);
    if (currentLock && currentLock.txId !== this.id) {
      throw new Error(
        `ResourceLockedError: LockWaitTimeout - Row ${id} is locked by transaction ${currentLock.txId}`
      );
    }

    this.db.rowLocks.set(id, { txId: this.id, lockType: 'EXCLUSIVE' });
    this.heldLocks.add(id);

    const acc = this.db.accounts.get(id);
    return acc ? { ...acc } : null;
  }

  updateWithVersion(id, newBalance, expectedVersion) {
    if (
      !id ||
      typeof id !== 'string' ||
      typeof newBalance !== 'number' ||
      typeof expectedVersion !== 'number'
    ) {
      throw new Error('Invalid parameters');
    }
    if (this.isCompleted) throw new Error('TransactionAlreadyCompleted');

    const current = this.db.accounts.get(id);
    if (!current) throw new Error(`AccountNotFound: ${id}`);

    if (current.version !== expectedVersion) {
      throw new Error(
        `OptimisticLockException: StaleObjectState - Expected version ${expectedVersion} but found ${current.version}`
      );
    }

    this.uncommittedWrites.set(id, newBalance);
    this.pendingVersionIncrements.set(id, expectedVersion + 1);
    this.db.uncommittedWrites.set(id, { txId: this.id, balance: newBalance });
    return true;
  }

  commit() {
    if (this.isCompleted) return;

    // Apply uncommitted writes to committed database state
    for (const [id, balance] of this.uncommittedWrites.entries()) {
      const existing = this.db.accounts.get(id) || { id, version: 1 };
      const nextVersion = this.pendingVersionIncrements.get(id) || existing.version;
      this.db.accounts.set(id, {
        id,
        balance,
        version: nextVersion,
      });
      this.db.uncommittedWrites.delete(id);
    }

    this._cleanup();
    this.isCompleted = true;
  }

  rollback() {
    if (this.isCompleted) return;

    for (const id of this.uncommittedWrites.keys()) {
      this.db.uncommittedWrites.delete(id);
    }

    this._cleanup();
    this.isCompleted = true;
  }

  _cleanup() {
    // Release held exclusive locks
    for (const id of this.heldLocks) {
      const lock = this.db.rowLocks.get(id);
      if (lock && lock.txId === this.id) {
        this.db.rowLocks.delete(id);
      }
    }
    this.heldLocks.clear();

    // Clean active transactions and range scans
    this.db.activeTransactions.delete(this.id);
    this.db.rangeScans = this.db.rangeScans.filter((scan) => scan.txId !== this.id);
  }
}

module.exports = {
  Database,
  Transaction,
  IsolationLevel,
};
