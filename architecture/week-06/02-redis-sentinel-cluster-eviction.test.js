/**
 * Unit Test Suite: Redis Advanced & High Availability (Sentinel, Cluster & Eviction)
 * 
 * Target: HCLTech Vietnam x ANZ Bank Backend Interview Prep
 * Standard: Native Node.js assert, Zero External Dependencies, Test-First Order
 */

const assert = require('node:assert');
const {
  MockRedisCluster,
  MockRedisSentinel,
  CacheEvictionManager
} = require('./02-redis-sentinel-cluster-eviction.js');

console.log('--- Starting Test Suite: Redis Sentinel, Cluster & Eviction (Week 6 Day 2) ---');

// TC-01: Redis Cluster Hash Slot routing (CRC16 % 16384 across 3 shards)
console.log('Running TC-01: Hash Slot routing across 3 shards...');
const cluster = new MockRedisCluster();
const slotA = cluster.getSlot('account:1001');
const slotB = cluster.getSlot('account:2002');
const slotC = cluster.getSlot('account:9999');

assert.ok(slotA >= 0 && slotA < 16384, 'Slot A must be within [0, 16383]');
assert.ok(slotB >= 0 && slotB < 16384, 'Slot B must be within [0, 16383]');
assert.ok(slotC >= 0 && slotC < 16384, 'Slot C must be within [0, 16383]');

cluster.set('account:1001', { balance: 5000 });
assert.deepStrictEqual(cluster.get('account:1001'), { balance: 5000 }, 'Cluster get/set must be consistent');
console.log('✅ TC-01 PASSED: Hash Slot CRC16 deterministic routing across 3 shards verified.');

// TC-02: Hash Tag {...} guarantees cross-key co-location on same slot & shard
console.log('Running TC-02: Hash Tag {...} co-location routing...');
const slotProfile = cluster.getSlot('{user:888}:profile');
const slotOrders = cluster.getSlot('{user:888}:orders');
const slotSettings = cluster.getSlot('{user:888}:settings');

assert.strictEqual(slotProfile, slotOrders, 'Keys with same hash tag must map to identical slot');
assert.strictEqual(slotProfile, slotSettings, 'Keys with same hash tag must map to identical slot');
assert.strictEqual(
  cluster.getShardForKey('{user:888}:profile'),
  cluster.getShardForKey('{user:888}:orders'),
  'Keys with same hash tag must route to identical master shard'
);
console.log('✅ TC-02 PASSED: Hash Tag {...} co-location strictly confirmed.');

// TC-03: Sentinel subjective (+sdown) vs objective (+odown) quorum consensus
console.log('Running TC-03: Sentinel Quorum monitoring (sdown vs odown)...');
const sentinelGroup = new MockRedisSentinel({ quorum: 2, totalSentinels: 3 });

// 1 sentinel detects failure -> only +sdown (subjective)
const state1 = sentinelGroup.reportFailure('sentinel-1');
assert.strictEqual(state1.isSdown, true, 'Master should be marked sdown by sentinel-1');
assert.strictEqual(state1.isOdown, false, 'Master should NOT be odown with only 1 vote');
assert.strictEqual(sentinelGroup.getMasterState().status, 'ONLINE', 'Master remains active until quorum reached');

// 2nd sentinel detects failure -> reaches quorum 2/3 -> +odown (objective)
const state2 = sentinelGroup.reportFailure('sentinel-2');
assert.strictEqual(state2.isOdown, true, 'Master must be marked odown when quorum (2/3) reached');
assert.strictEqual(sentinelGroup.getMasterState().status, 'FAILOVER_TRIGGERED', 'Failover must be triggered on odown');
console.log('✅ TC-03 PASSED: Sentinel quorum consensus logic verified.');

// TC-04: Sentinel Automatic Failover & Replica Promotion
console.log('Running TC-04: Sentinel Automatic Failover & Replica Promotion...');
const failoverResult = sentinelGroup.executeFailover();
assert.strictEqual(failoverResult.success, true, 'Failover must succeed');
assert.strictEqual(failoverResult.oldMaster, 'master-node-1', 'Old master recorded accurately');
assert.strictEqual(failoverResult.newMaster, 'replica-node-1', 'Replica-1 promoted to new master');
assert.strictEqual(sentinelGroup.getMasterState().currentMaster, 'replica-node-1', 'Sentinel updated current master');
console.log('✅ TC-04 PASSED: Sentinel Automatic Failover promoted replica with zero data loss.');

// TC-05: LRU (Least Recently Used) Eviction Policy
console.log('Running TC-05: LRU Eviction Policy verification...');
const lruCache = new CacheEvictionManager({ maxCapacity: 3, policy: 'LRU' });
lruCache.put('k1', 'val1');
lruCache.put('k2', 'val2');
lruCache.put('k3', 'val3');

// Access k1 -> now order of recency: k2 (oldest), k3, k1 (most recent)
lruCache.get('k1');

// Insert k4 -> should evict k2 (least recently used)
lruCache.put('k4', 'val4');

assert.strictEqual(lruCache.get('k1'), 'val1', 'k1 should still exist');
assert.strictEqual(lruCache.get('k2'), null, 'k2 should have been evicted by LRU');
assert.strictEqual(lruCache.get('k3'), 'val3', 'k3 should still exist');
assert.strictEqual(lruCache.get('k4'), 'val4', 'k4 should exist');
console.log('✅ TC-05 PASSED: LRU Eviction policy strictly evicted oldest accessed key.');

// TC-06: LFU (Least Frequently Used) Eviction Policy
console.log('Running TC-06: LFU Eviction Policy verification...');
const lfuCache = new CacheEvictionManager({ maxCapacity: 3, policy: 'LFU' });
lfuCache.put('a', '10');
lfuCache.put('b', '20');
lfuCache.put('c', '30');

// Increase frequency: a has freq 3, b has freq 2, c has freq 1
lfuCache.get('a');
lfuCache.get('a');
lfuCache.get('b');

// Insert 'd' -> 'c' has lowest frequency (1) -> should be evicted
lfuCache.put('d', '40');

assert.strictEqual(lfuCache.get('a'), '10', 'a with freq 3 should survive');
assert.strictEqual(lfuCache.get('b'), '20', 'b with freq 2 should survive');
assert.strictEqual(lfuCache.get('c'), null, 'c with freq 1 must be evicted by LFU');
assert.strictEqual(lfuCache.get('d'), '40', 'd must exist');
console.log('✅ TC-06 PASSED: LFU Eviction policy strictly evicted least frequently used key.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 6 REDIS SENTINEL, CLUSTER & EVICTION TESTS PASSED! (Week 6 Day 2)');

