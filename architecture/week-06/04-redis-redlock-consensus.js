/**
 * Architecture Simulation: Distributed Lock Redlock Consensus & Fencing Tokens
 * 
 * Target: HCLTech Vietnam x ANZ Bank Backend Interview Prep
 * Concepts:
 *   1. Redlock Algorithm across N=5 independent Redis nodes
 *   2. Quorum Consensus (N/2 + 1 = 3/5)
 *   3. Clock Drift & Validity Time Calculation
 *   4. Fencing Token Monotonicity (Martin Kleppmann Critique Defense)
 */

/**
 * MockRedisInstance: Represents an independent standalone Redis master node
 */
class MockRedisInstance {
  constructor(nodeId) {
    this.nodeId = nodeId;
    this.storage = new Map(); // key -> { ownerId, expiresAt }
    this.isAlive = true;
  }

  acquire(key, ownerId, ttlMs) {
    if (!this.isAlive) return false;

    const now = Date.now();
    const existing = this.storage.get(key);

    // Clean up expired key
    if (existing && existing.expiresAt <= now) {
      this.storage.delete(key);
    }

    // Key exists and not expired -> lock cannot be acquired
    if (this.storage.has(key)) {
      return false;
    }

    // SET key ownerId NX PX ttlMs
    this.storage.set(key, {
      ownerId,
      expiresAt: now + ttlMs
    });
    return true;
  }

  release(key, ownerId) {
    if (!this.isAlive) return false;

    const existing = this.storage.get(key);
    if (!existing) return true; // Already gone or expired

    // Safe Lua script atomic release: only owner can delete
    if (existing.ownerId === ownerId) {
      this.storage.delete(key);
      return true;
    }
    return false;
  }

  get(key) {
    if (!this.isAlive) return null;
    const now = Date.now();
    const existing = this.storage.get(key);
    if (existing && existing.expiresAt > now) {
      return existing.ownerId;
    }
    return null;
  }
}

/**
 * RedlockManager: Manages 5 independent Redis instances and implements Redlock consensus
 */
class RedlockManager {
  constructor({ nodeCount = 5 } = {}) {
    this.nodeCount = nodeCount;
    this.quorum = Math.floor(nodeCount / 2) + 1; // 3 out of 5
    this.nodes = Array.from({ length: nodeCount }, (_, i) => new MockRedisInstance(`redis-node-${i + 1}`));
    this.fencingCounter = 0;
  }

  acquireLock(resource, ttlMs, ownerId, { simulatedDelayMs = 0 } = {}) {
    const startTime = Date.now();
    let acquiredNodes = [];

    // Step 1: Attempt to acquire lock on all nodes
    for (const node of this.nodes) {
      if (node.acquire(resource, ownerId, ttlMs)) {
        acquiredNodes.push(node);
      }
    }

    // Step 2: Compute elapsed time & clock drift
    const elapsedTime = (Date.now() - startTime) + simulatedDelayMs;
    // Clock drift formula: 1% of TTL + 2ms
    const clockDrift = Math.floor(ttlMs * 0.01) + 2;
    const validityTime = ttlMs - elapsedTime - clockDrift;

    // Step 3: Check Quorum and Validity Window
    if (acquiredNodes.length >= this.quorum && validityTime > 0) {
      this.fencingCounter++;
      return {
        success: true,
        resource,
        ownerId,
        validityTime,
        fencingToken: this.fencingCounter,
        acquiredNodeCount: acquiredNodes.length
      };
    }

    // Step 4: Acquisition failed -> Rollback across all nodes immediately
    for (const node of this.nodes) {
      node.release(resource, ownerId);
    }

    const reason = acquiredNodes.length < this.quorum
      ? 'QUORUM_NOT_REACHED'
      : 'LOCK_EXPIRED_DURING_ACQUISITION';

    return {
      success: false,
      reason,
      validityTime: 0,
      fencingToken: 0
    };
  }

  releaseLock(lockObj) {
    if (!lockObj || !lockObj.resource || !lockObj.ownerId) {
      return false;
    }

    let releaseCount = 0;
    for (const node of this.nodes) {
      if (node.release(lockObj.resource, lockObj.ownerId)) {
        releaseCount++;
      }
    }
    return releaseCount >= this.quorum;
  }
}

/**
 * FencingTokenStorage: Simulates database storage layer enforcing fencing tokens
 * Protects against delayed client writes caused by GC pauses (Kleppmann Critique)
 */
class FencingTokenStorage {
  constructor() {
    this.lastTokens = new Map(); // resource -> highest token
    this.storage = new Map();    // resource -> payload
  }

  write(resource, fencingToken, data) {
    const currentMax = this.lastTokens.get(resource) || 0;

    if (fencingToken <= currentMax) {
      return {
        success: false,
        reason: 'STALE_FENCING_TOKEN',
        expectedGreaterThan: currentMax,
        actual: fencingToken
      };
    }

    this.lastTokens.set(resource, fencingToken);
    this.storage.set(resource, data);

    return {
      success: true,
      committedToken: fencingToken
    };
  }

  read(resource) {
    return this.storage.get(resource) || null;
  }
}

module.exports = {
  MockRedisInstance,
  RedlockManager,
  FencingTokenStorage
};

