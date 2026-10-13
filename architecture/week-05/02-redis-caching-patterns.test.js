/**
 * ============================================================================
 * 🧪 TEST SUITE: REDIS CACHING PATTERNS & TTL JITTER (Week 5 Day 2)
 * ============================================================================
 * Target: Data Platform System Design | ANZ Bank Architecture Interview
 * Topics:
 * 1. Cache-Aside (Lazy Loading) with Cache Invalidation.
 * 2. Write-Through (Synchronous double-write).
 * 3. Write-Behind / Write-Back (Asynchronous batch queue).
 * 4. TTL Jitter Distribution (Anti-Cache Avalanche / Stampede).
 * 5. High-Concurrency Read Benchmark (95%+ Cache Hit shielding Primary DB).
 * ============================================================================
 */

const assert = require('node:assert');
const {
  MockRedisCache,
  MockDatabase,
  CacheAsideManager,
  WriteThroughManager,
  WriteBehindManager,
  calculateTTLWithJitter
} = require('./02-redis-caching-patterns.js');

console.log('--- Starting Test Suite: Redis Caching Patterns & TTL Jitter (Week 5 Day 2) ---');

// ============================================================================
// TC-01: Cache-Aside Read Hit vs Read Miss Behavior
// ============================================================================
console.log('Running TC-01: Cache-Aside read hit vs read miss...');

const db1 = new MockDatabase();
db1.set('acc:1001', { id: '1001', balance: 5000 });
const cache1 = new MockRedisCache();
const manager1 = new CacheAsideManager(db1, cache1, 300); // 300s TTL

// First read: Cache Miss -> Must read from DB and populate Cache
const data1 = manager1.get('acc:1001');
assert.strictEqual(data1.balance, 5000);
assert.strictEqual(db1.readCount, 1, 'DB must be read once on cache miss');
assert.strictEqual(cache1.has('acc:1001'), true, 'Key must be cached');

// Second read: Cache Hit -> Must read directly from Cache with zero DB calls
const data2 = manager1.get('acc:1001');
assert.strictEqual(data2.balance, 5000);
assert.strictEqual(db1.readCount, 1, 'DB read count must remain 1 on cache hit');

console.log('✅ TC-01 PASSED: Cache-Aside accurately handles Cache Miss then Cache Hit.');

// ============================================================================
// TC-02: Cache Invalidation on Update
// ============================================================================
console.log('Running TC-02: Cache Invalidation on update...');

// Update account balance
manager1.set('acc:1001', { id: '1001', balance: 6500 });
assert.strictEqual(cache1.has('acc:1001'), false, 'Cache key must be invalidated (deleted) on write');
assert.strictEqual(db1.data.get('acc:1001').balance, 6500, 'DB must contain updated value');

// Next read triggers cache miss and re-populates cache with fresh data
const data3 = manager1.get('acc:1001');
assert.strictEqual(data3.balance, 6500);
assert.strictEqual(db1.readCount, 2, 'DB must be called to refresh cache');
assert.strictEqual(cache1.has('acc:1001'), true, 'Cache must be re-populated');

console.log('✅ TC-02 PASSED: Cache invalidation successfully prevented stale read anomaly.');

// ============================================================================
// TC-03: Write-Through Pattern (Synchronous DB + Cache Write)
// ============================================================================
console.log('Running TC-03: Write-Through pattern...');

const db2 = new MockDatabase();
const cache2 = new MockRedisCache();
const writeThroughMgr = new WriteThroughManager(db2, cache2, 300);

writeThroughMgr.set('acc:2002', { id: '2002', balance: 12000 });
assert.strictEqual(db2.data.get('acc:2002').balance, 12000, 'DB must be written synchronously');
assert.strictEqual(cache2.has('acc:2002'), true, 'Cache must be populated synchronously');

// Read immediately hits cache with zero DB read
const wtData = writeThroughMgr.get('acc:2002');
assert.strictEqual(wtData.balance, 12000);
assert.strictEqual(db2.readCount, 0, 'Zero DB reads required after Write-Through');

console.log('✅ TC-03 PASSED: Write-Through verified synchronous consistency.');

// ============================================================================
// TC-04: Write-Behind (Write-Back) Pattern with Batch Flush
// ============================================================================
console.log('Running TC-04: Write-Behind (Write-Back) asynchronous queue...');

const db3 = new MockDatabase();
const cache3 = new MockRedisCache();
const writeBehindMgr = new WriteBehindManager(db3, cache3);

// Write to cache queue
writeBehindMgr.set('acc:3001', { id: '3001', balance: 100 });
writeBehindMgr.set('acc:3002', { id: '3002', balance: 200 });
writeBehindMgr.set('acc:3003', { id: '3003', balance: 300 });

assert.strictEqual(db3.writeCount, 0, 'DB write count must be 0 before flush');
assert.strictEqual(cache3.has('acc:3001'), true, 'Cache has immediate read access');

// Flush batch to DB
const flushedCount = writeBehindMgr.flush();
assert.strictEqual(flushedCount, 3, 'Flushed 3 queued writes');
assert.strictEqual(db3.writeCount, 3, 'DB write count must be 3 after flush');
assert.strictEqual(db3.data.get('acc:3003').balance, 300);

console.log('✅ TC-04 PASSED: Write-Behind batch flush successfully decoupled write latency.');

// ============================================================================
// TC-05: TTL Jitter Distribution (Anti-Cache Avalanche)
// ============================================================================
console.log('Running TC-05: TTL Jitter distribution math...');

const baseTTL = 3600; // 1 hour
const jitterRatio = 0.15; // +/- 15% (Range: [3060, 4140])
const sampleSize = 1000;
const ttlValues = new Set();

let minTTL = Infinity;
let maxTTL = -Infinity;

for (let i = 0; i < sampleSize; i++) {
  const ttl = calculateTTLWithJitter(baseTTL, jitterRatio);
  assert.ok(ttl >= baseTTL * (1 - jitterRatio), `TTL ${ttl} must be >= min threshold`);
  assert.ok(ttl <= baseTTL * (1 + jitterRatio), `TTL ${ttl} must be <= max threshold`);
  ttlValues.add(ttl);
  if (ttl < minTTL) minTTL = ttl;
  if (ttl > maxTTL) maxTTL = ttl;
}

// Ensure the distribution has high entropy (not identical values)
assert.ok(ttlValues.size > 100, `High entropy expected: got ${ttlValues.size} distinct TTLs`);
console.log(`⚡ TTL Jitter range: min=${minTTL.toFixed(1)}s, max=${maxTTL.toFixed(1)}s across ${sampleSize} keys`);

console.log('✅ TC-05 PASSED: TTL Jitter confirmed smoothed expiration distribution curve.');

// ============================================================================
// TC-06: High-Concurrency Benchmark (100 operations with 95% Cache Hit)
// ============================================================================
console.log('Running TC-06: High-concurrency read benchmark...');

const benchDB = new MockDatabase();
benchDB.set('acc:global_config', { maintenance: false, fee_rate: 0.001 });
const benchCache = new MockRedisCache();
const benchMgr = new CacheAsideManager(benchDB, benchCache, 300);

const totalRequests = 100;
for (let i = 0; i < totalRequests; i++) {
  benchMgr.get('acc:global_config');
}

// Exactly 1 DB read on request 0; 99 cache hits!
assert.strictEqual(benchDB.readCount, 1, 'Only 1 DB read allowed across 100 concurrent requests');
assert.strictEqual(benchCache.hitCount, 99, '99 cache hits verified');

console.log(`⚡ Benchmark: ${benchCache.hitCount}/${totalRequests} cache hits (99% hit rate shielding DB)`);
console.log('✅ TC-06 PASSED: Concurrency benchmark verified 99% DB offloading.');

console.log('------------------------------------------------------------------------');
console.log('🎉 ALL 6 REDIS CACHING & TTL JITTER TESTS PASSED! (Week 5 Day 2)');
