/**
 * Architecture Simulation: Redis Advanced & High Availability
 * 
 * Target: HCLTech Vietnam x ANZ Bank Backend Interview Prep
 * Topics:
 *   1. Redis Cluster Sharding (CRC16 % 16384 & Hash Tag co-location)
 *   2. Redis Sentinel Quorum Consensus & Automatic Failover
 *   3. Memory Eviction Policies (LRU & LFU)
 */

/**
 * Standard CRC16-CCITT implementation for Redis Cluster hash slot calculation
 * @param {string} str 
 * @returns {number} 16-bit integer
 */
function crc16(str) {
  let crc = 0x0000;
  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc;
}

/**
 * Extracts string inside {...} if present, as per Redis Hash Tag specification
 * @param {string} key 
 * @returns {string}
 */
function extractHashTag(key) {
  const start = key.indexOf('{');
  if (start !== -1) {
    const end = key.indexOf('}', start + 1);
    if (end !== -1 && end > start + 1) {
      return key.substring(start + 1, end);
    }
  }
  return key;
}

/**
 * MockRedisCluster: Simulates Redis Cluster with 16,384 Hash Slots across 3 Master Shards
 */
class MockRedisCluster {
  constructor() {
    this.TOTAL_SLOTS = 16384;
    // 3 Shards partitioning 16,384 slots
    this.shards = [
      { id: 'shard-0', minSlot: 0, maxSlot: 5460, storage: new Map() },
      { id: 'shard-1', minSlot: 5461, maxSlot: 10922, storage: new Map() },
      { id: 'shard-2', minSlot: 10923, maxSlot: 16383, storage: new Map() }
    ];
  }

  getSlot(key) {
    const hashString = extractHashTag(String(key));
    return crc16(hashString) % this.TOTAL_SLOTS;
  }

  getShardForKey(key) {
    const slot = this.getSlot(key);
    for (const shard of this.shards) {
      if (slot >= shard.minSlot && slot <= shard.maxSlot) {
        return shard.id;
      }
    }
    return this.shards[0].id;
  }

  set(key, value) {
    const slot = this.getSlot(key);
    for (const shard of this.shards) {
      if (slot >= shard.minSlot && slot <= shard.maxSlot) {
        shard.storage.set(key, value);
        return { slot, shard: shard.id };
      }
    }
  }

  get(key) {
    const slot = this.getSlot(key);
    for (const shard of this.shards) {
      if (slot >= shard.minSlot && slot <= shard.maxSlot) {
        return shard.storage.has(key) ? shard.storage.get(key) : null;
      }
    }
    return null;
  }
}

/**
 * MockRedisSentinel: Simulates Sentinel Quorum Consensus & Master Failover
 */
class MockRedisSentinel {
  constructor({ quorum = 2, totalSentinels = 3 } = {}) {
    this.quorum = quorum;
    this.totalSentinels = totalSentinels;
    this.currentMaster = 'master-node-1';
    this.replicas = ['replica-node-1', 'replica-node-2'];
    this.failedSentinels = new Set();
    this.status = 'ONLINE'; // 'ONLINE' | 'FAILOVER_TRIGGERED' | 'FAILOVER_COMPLETED'
  }

  reportFailure(sentinelId) {
    this.failedSentinels.add(sentinelId);
    const votes = this.failedSentinels.size;
    const isSdown = true; // Subjectively down to reporting sentinel
    const isOdown = votes >= this.quorum; // Objectively down when quorum reached

    if (isOdown) {
      this.status = 'FAILOVER_TRIGGERED';
    }

    return {
      sentinelId,
      votes,
      isSdown,
      isOdown
    };
  }

  executeFailover() {
    if (this.status !== 'FAILOVER_TRIGGERED') {
      return { success: false, reason: 'Quorum not reached' };
    }

    const oldMaster = this.currentMaster;
    const newMaster = this.replicas.shift(); // Promote first healthy replica
    this.currentMaster = newMaster;
    this.status = 'ONLINE';
    this.failedSentinels.clear();

    return {
      success: true,
      oldMaster,
      newMaster,
      remainingReplicas: this.replicas
    };
  }

  getMasterState() {
    return {
      currentMaster: this.currentMaster,
      status: this.status,
      failedVotes: this.failedSentinels.size
    };
  }
}

/**
 * CacheEvictionManager: Simulates Redis memory-management policies (LRU & LFU)
 */
class CacheEvictionManager {
  constructor({ maxCapacity = 3, policy = 'LRU' } = {}) {
    this.maxCapacity = maxCapacity;
    this.policy = policy; // 'LRU' | 'LFU'
    this.cache = new Map(); // key -> { value, freq, lastAccess }
    this.clock = 0;
  }

  get(key) {
    if (!this.cache.has(key)) return null;

    const entry = this.cache.get(key);
    this.clock++;
    entry.freq += 1;
    entry.lastAccess = this.clock;

    if (this.policy === 'LRU') {
      // Re-insert to end of Map to maintain insertion order
      this.cache.delete(key);
      this.cache.set(key, entry);
    }

    return entry.value;
  }

  put(key, value) {
    this.clock++;

    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      entry.value = value;
      entry.freq += 1;
      entry.lastAccess = this.clock;
      if (this.policy === 'LRU') {
        this.cache.delete(key);
        this.cache.set(key, entry);
      }
      return;
    }

    // Check capacity overflow
    if (this.cache.size >= this.maxCapacity) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      freq: 1,
      lastAccess: this.clock
    });
  }

  evict() {
    if (this.cache.size === 0) return;

    if (this.policy === 'LRU') {
      // First key in Map is the least recently accessed
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    } else if (this.policy === 'LFU') {
      // Find key with minimal frequency, tie-break on oldest lastAccess
      let minKey = null;
      let minFreq = Infinity;
      let oldestAccess = Infinity;

      for (const [k, entry] of this.cache.entries()) {
        if (entry.freq < minFreq) {
          minFreq = entry.freq;
          oldestAccess = entry.lastAccess;
          minKey = k;
        } else if (entry.freq === minFreq && entry.lastAccess < oldestAccess) {
          oldestAccess = entry.lastAccess;
          minKey = k;
        }
      }

      if (minKey !== null) {
        this.cache.delete(minKey);
      }
    }
  }

  size() {
    return this.cache.size;
  }
}

module.exports = {
  crc16,
  extractHashTag,
  MockRedisCluster,
  MockRedisSentinel,
  CacheEvictionManager
};

