/**
 * ============================================================================
 * 🧠 WEEK 5 - DAY 4: CACHE PENETRATION (BLOOM FILTER) & DISTRIBUTED LOCK
 * ============================================================================
 * Target: Data Platform System Design | ANZ Bank Architecture Interview
 * Focus:
 * 1. Cache Penetration Defense: Null Object Caching (Short TTL)
 * 2. Probabilistic Defense: Bloom Filter (Bit array + Multi-hashing)
 * 3. Distributed Lock (SET NX PX) + Safe Atomic Release
 * 4. High-Concurrency Banking Overdraft Protection
 * 5. Invariants: Pure Node.js, Line 1 Guard Clauses, Strict Financial Protection.
 * ============================================================================
 */

/**
 * Probabilistic Data Structure: Bloom Filter
 * Uses a bit array and 3 independent hash functions to determine set membership.
 * Guarantees: ZERO False Negatives (If mightContain returns false, key DEFINITELY does not exist).
 */
class BloomFilter {
  constructor(size = 1024) {
    this.size = Math.max(64, size);
    // Uint8Array where each byte holds 8 bits
    this.bitArray = new Uint8Array(Math.ceil(this.size / 8));
  }

  // Hash Function 1: DJB2
  _hashDjb2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % this.size;
  }

  // Hash Function 2: FNV-1a
  _hashFnv1a(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) & 0xffffffff;
    }
    return Math.abs(hash) % this.size;
  }

  // Hash Function 3: SDBM
  _hashSdbm(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
      hash = hash & hash;
    }
    return Math.abs(hash) % this.size;
  }

  _setBit(index) {
    const byteIndex = Math.floor(index / 8);
    const bitOffset = index % 8;
    this.bitArray[byteIndex] |= (1 << bitOffset);
  }

  _getBit(index) {
    const byteIndex = Math.floor(index / 8);
    const bitOffset = index % 8;
    return (this.bitArray[byteIndex] & (1 << bitOffset)) !== 0;
  }

  add(key) {
    if (typeof key !== 'string') key = String(key);
    this._setBit(this._hashDjb2(key));
    this._setBit(this._hashFnv1a(key));
    this._setBit(this._hashSdbm(key));
  }

  mightContain(key) {
    if (typeof key !== 'string') key = String(key);
    const b1 = this._getBit(this._hashDjb2(key));
    const b2 = this._getBit(this._hashFnv1a(key));
    const b3 = this._getBit(this._hashSdbm(key));
    return b1 && b2 && b3;
  }
}

/**
 * Cache Manager with Null Object Caching Defense against Cache Penetration
 */
class NullObjectCacheManager {
  constructor(db, nullTTLSeconds = 30, standardTTLSeconds = 300) {
    this.db = db;
    this.cache = new Map();
    this.nullTTLSeconds = nullTTLSeconds;
    this.standardTTLSeconds = standardTTLSeconds;
    this.dbReadCount = 0;
  }

  get(key) {
    if (!key) return null;

    const cachedEntry = this.cache.get(key);
    if (cachedEntry) {
      if (Date.now() <= cachedEntry.expiresAt) {
        return cachedEntry.isNull ? null : cachedEntry.value;
      }
      this.cache.delete(key);
    }

    // Cache Miss -> Query Database
    this.dbReadCount++;
    const dbValue = this.db instanceof Map ? this.db.get(key) : null;

    if (dbValue === undefined || dbValue === null) {
      // Key does NOT exist in DB: Cache NULL Object with short TTL!
      this.cache.set(key, {
        isNull: true,
        value: null,
        expiresAt: Date.now() + this.nullTTLSeconds * 1000
      });
      return null;
    }

    // Key exists: Cache real value with standard TTL
    this.cache.set(key, {
      isNull: false,
      value: dbValue,
      expiresAt: Date.now() + this.standardTTLSeconds * 1000
    });
    return dbValue;
  }
}

/**
 * Distributed Lock Manager (Redis SET NX PX Pattern)
 * Guarantees Mutual Exclusion and prevents lock theft via unique ownership verification.
 */
class DistributedLockManager {
  constructor() {
    this.locks = new Map(); // key -> { ownerId, expiresAt }
  }

  acquire(resourceKey, ttlMs = 5000, ownerId) {
    if (!resourceKey || !ownerId) return false;

    const existingLock = this.locks.get(resourceKey);
    const now = Date.now();

    if (existingLock) {
      if (now <= existingLock.expiresAt) {
        // Resource is actively locked by another owner
        return false;
      }
      // Lock has expired; reclaim it
      this.locks.delete(resourceKey);
    }

    // Atomically set lock with expiration and ownerId (SET key ownerId NX PX ttlMs)
    this.locks.set(resourceKey, {
      ownerId,
      expiresAt: now + ttlMs
    });
    return true;
  }

  release(resourceKey, ownerId) {
    if (!resourceKey || !ownerId) return false;

    const existingLock = this.locks.get(resourceKey);
    if (!existingLock) return false;

    // Critical Safety Invariant: Can ONLY release lock if ownerId matches!
    // (Simulates Redis Lua Script: if redis.call('get', KEYS[1]) == ARGV[1] then del else 0 end)
    if (existingLock.ownerId !== ownerId) {
      return false; // Lock owned by another worker or expired and re-acquired
    }

    this.locks.delete(resourceKey);
    return true;
  }

  isLocked(resourceKey) {
    if (!resourceKey) return false;
    const lock = this.locks.get(resourceKey);
    if (!lock) return false;
    if (Date.now() > lock.expiresAt) {
      this.locks.delete(resourceKey);
      return false;
    }
    return true;
  }
}

module.exports = {
  BloomFilter,
  NullObjectCacheManager,
  DistributedLockManager
};

