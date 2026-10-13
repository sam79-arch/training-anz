/**
 * ============================================================================
 * 🧠 WEEK 5 - DAY 2: REDIS CACHING PATTERNS & TTL JITTER (Architecture)
 * ============================================================================
 * Target: Data Platform System Design | ANZ Bank Architecture Interview
 * Focus:
 * 1. Cache-Aside (Lazy Loading) + Cache Invalidation
 * 2. Write-Through (Synchronous consistency)
 * 3. Write-Behind / Write-Back (Asynchronous batch queue)
 * 4. TTL Jitter Math (Anti-Cache Avalanche / Stampede)
 * 5. Invariants: Pure Node.js, Line 1 Guard Clauses, Native Map storage.
 * ============================================================================
 */

/**
 * In-memory Mock Redis Cache with TTL support and telemetry
 */
class MockRedisCache {
  constructor() {
    this.store = new Map();
    this.hitCount = 0;
    this.missCount = 0;
  }

  get(key) {
    if (!key) return null;
    const entry = this.store.get(key);
    if (!entry) {
      this.missCount++;
      return null;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.value;
  }

  set(key, value, ttlSeconds = 300) {
    if (!key) return;
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  del(key) {
    if (!key) return false;
    return this.store.delete(key);
  }

  has(key) {
    if (!key) return false;
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  clear() {
    this.store.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

/**
 * In-memory Mock Database with I/O instrumentation
 */
class MockDatabase {
  constructor() {
    this.data = new Map();
    this.readCount = 0;
    this.writeCount = 0;
  }

  get(key) {
    if (!key) return null;
    this.readCount++;
    return this.data.get(key) || null;
  }

  set(key, value) {
    if (!key) return;
    this.writeCount++;
    this.data.set(key, value);
  }

  del(key) {
    if (!key) return false;
    this.writeCount++;
    return this.data.delete(key);
  }
}

/**
 * Calculates randomized TTL to prevent simultaneous cache key expiration (Cache Avalanche).
 *
 * Formula: TTL = BaseTTL + Random(-JitterRange, +JitterRange)
 *
 * @param {number} baseTTL - Baseline TTL in seconds
 * @param {number} jitterRatio - Proportion of noise (e.g. 0.15 = +/- 15%)
 * @returns {number} Randomized TTL
 */
function calculateTTLWithJitter(baseTTL, jitterRatio = 0.15) {
  if (typeof baseTTL !== 'number' || baseTTL <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, typeof jitterRatio === 'number' ? jitterRatio : 0.15));
  const delta = baseTTL * ratio;
  const randomNoise = (Math.random() * 2 - 1) * delta;
  return Math.round((baseTTL + randomNoise) * 10) / 10;
}

/**
 * Pattern 1: Cache-Aside (Lazy Loading) Manager
 */
class CacheAsideManager {
  constructor(db, cache, baseTTL = 300, jitterRatio = 0.15) {
    if (!db || !cache) throw new Error('Database and Cache instances are required');
    this.db = db;
    this.cache = cache;
    this.baseTTL = baseTTL;
    this.jitterRatio = jitterRatio;
  }

  get(key) {
    if (!key) return null;

    // Step 1: Check Cache
    const cachedData = this.cache.get(key);
    if (cachedData !== null) {
      return cachedData;
    }

    // Step 2: Cache Miss -> Read from DB
    const dbData = this.db.get(key);
    if (dbData !== null) {
      // Step 3: Populate cache with randomized TTL Jitter
      const ttl = calculateTTLWithJitter(this.baseTTL, this.jitterRatio);
      this.cache.set(key, dbData, ttl);
    }

    return dbData;
  }

  set(key, value) {
    if (!key) return;

    // Step 1: Write directly to Primary DB
    this.db.set(key, value);

    // Step 2: Invalidate Cache key to prevent Stale Reads
    this.cache.del(key);
  }
}

/**
 * Pattern 2: Write-Through Manager (Synchronous Double-Write)
 */
class WriteThroughManager {
  constructor(db, cache, baseTTL = 300) {
    if (!db || !cache) throw new Error('Database and Cache instances are required');
    this.db = db;
    this.cache = cache;
    this.baseTTL = baseTTL;
  }

  get(key) {
    if (!key) return null;
    const cached = this.cache.get(key);
    if (cached !== null) return cached;

    const dbData = this.db.get(key);
    if (dbData !== null) {
      this.cache.set(key, dbData, this.baseTTL);
    }
    return dbData;
  }

  set(key, value) {
    if (!key) return;
    // Synchronously write to both DB and Cache
    this.db.set(key, value);
    this.cache.set(key, value, this.baseTTL);
  }
}

/**
 * Pattern 3: Write-Behind (Write-Back) Manager (Asynchronous Batch Queue)
 */
class WriteBehindManager {
  constructor(db, cache, baseTTL = 300) {
    if (!db || !cache) throw new Error('Database and Cache instances are required');
    this.db = db;
    this.cache = cache;
    this.baseTTL = baseTTL;
    this.writeQueue = [];
  }

  get(key) {
    if (!key) return null;
    const cached = this.cache.get(key);
    if (cached !== null) return cached;
    return this.db.get(key);
  }

  set(key, value) {
    if (!key) return;
    // Write immediately to Cache
    this.cache.set(key, value, this.baseTTL);
    // Queue for asynchronous DB flush
    this.writeQueue.push({ key, value });
  }

  flush() {
    if (this.writeQueue.length === 0) return 0;
    const count = this.writeQueue.length;
    for (const item of this.writeQueue) {
      this.db.set(item.key, item.value);
    }
    this.writeQueue = [];
    return count;
  }
}

module.exports = {
  MockRedisCache,
  MockDatabase,
  CacheAsideManager,
  WriteThroughManager,
  WriteBehindManager,
  calculateTTLWithJitter
};

