/**
 * ============================================================================
 * 📦 DATABASE SHARDING & REPLICATION LAG ARCHITECTURE (Week 4 Day 4)
 * ============================================================================
 * Mô phỏng phân mảnh cơ sở dữ liệu (Sharding) và cơ chế Read-Your-Own-Writes:
 *   - Phân mảnh dữ liệu theo Hash(accountId) bảo đảm phân bổ đồng đều.
 *   - Mô phỏng độ trễ nhân bản bất đồng bộ (Replication Lag) giữa Primary và Replicas.
 *   - Cơ chế Pin-to-Primary định tuyến các truy vấn đọc trong cửa sổ ghi về Primary.
 *   - Cơ chế Min-LSN Routing đợi hoặc tìm replica đã đồng bộ đủ LSN của giao dịch.
 * ============================================================================
 */

/**
 * Đại diện cho một node cơ sở dữ liệu (Primary hoặc Read Replica)
 */
class DatabaseNode {
  constructor(id, role = 'REPLICA') {
    this.id = id;
    this.role = role;
    this.data = new Map();
    this.lsn = 0; // Log Sequence Number
  }

  /**
   * Ghi dữ liệu trực tiếp vào node
   * @param {string} key - Account ID
   * @param {number} value - Số dư
   * @param {number} [targetLSN] - LSN cụ thể nếu là replica đồng bộ
   * @returns {Object}
   */
  write(key, value, targetLSN = null) {
    // Guard clause tại dòng 1
    if (!key || typeof key !== 'string') {
      throw new TypeError(`Invalid account key: ${key}`);
    }

    this.data.set(key, value);
    this.lsn = targetLSN !== null ? targetLSN : this.lsn + 1;
    return {
      key,
      value,
      lsn: this.lsn,
      nodeId: this.id
    };
  }

  /**
   * Đọc trực tiếp từ node
   * @param {string} key - Account ID
   * @returns {Object}
   */
  readDirect(key) {
    // Guard clause tại dòng 1
    if (!key || typeof key !== 'string') {
      throw new TypeError(`Invalid account key: ${key}`);
    }

    return {
      balance: this.data.has(key) ? this.data.get(key) : null,
      currentLSN: this.lsn,
      nodeId: this.id,
      role: this.role
    };
  }
}

/**
 * Một phân mảnh (Shard) gồm 1 Primary và N Read Replicas
 */
class Shard {
  constructor(id, numReplicas = 1, replicationLagMs = 30) {
    this.id = id;
    this.replicationLagMs = replicationLagMs;
    this.primary = new DatabaseNode(`shard_${id}_primary`, 'PRIMARY');
    this.replicas = [];

    for (let i = 0; i < numReplicas; i++) {
      this.replicas.push(new DatabaseNode(`shard_${id}_replica_${i}`, 'REPLICA'));
    }
  }

  /**
   * Đồng bộ dữ liệu bất đồng bộ sang các replicas sau một khoảng thời gian lag
   * @param {string} key
   * @param {number} value
   * @param {number} lsn
   */
  async replicateAsync(key, value, lsn) {
    setTimeout(() => {
      for (const replica of this.replicas) {
        replica.write(key, value, lsn);
      }
    }, this.replicationLagMs);
  }
}

/**
 * Cụm cơ sở dữ liệu phân mảnh (Sharded Cluster)
 */
class ShardedCluster {
  constructor(options = {}) {
    this.numShards = options.numShards || 4;
    this.replicasPerShard = options.replicasPerShard || 1;
    this.replicationLagMs = options.replicationLagMs || 30;

    this.shards = [];
    for (let i = 0; i < this.numShards; i++) {
      this.shards.push(new Shard(i, this.replicasPerShard, this.replicationLagMs));
    }
  }

  /**
   * Hàm băm DJB2 đơn giản phân bổ Account ID vào Shard
   * @private
   */
  _hash(key) {
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) + hash) + key.charCodeAt(i);
    }
    return Math.abs(hash) % this.numShards;
  }

  /**
   * Xác định Shard quản lý Account ID
   * @param {string} accountId
   * @returns {Shard}
   */
  getShardForAccount(accountId) {
    // Guard clause dòng 1
    if (!accountId || typeof accountId !== 'string') {
      throw new TypeError(`Invalid accountId: ${accountId}`);
    }

    const shardId = this._hash(accountId);
    return this.shards[shardId];
  }

  /**
   * Ghi dữ liệu vào Primary của Shard tương ứng và kích hoạt replicate bất đồng bộ
   * @param {string} accountId
   * @param {number} balance
   * @returns {Promise<Object>}
   */
  async write(accountId, balance) {
    const shard = this.getShardForAccount(accountId);
    const writeResult = shard.primary.write(accountId, balance);

    // Kích hoạt đồng bộ sang replica
    shard.replicateAsync(accountId, balance, writeResult.lsn);

    return {
      accountId,
      balance,
      lsn: writeResult.lsn,
      shardId: shard.id,
      routedTo: 'PRIMARY'
    };
  }

  /**
   * Đọc dữ liệu từ Read Replica với điều kiện LSN của replica phải >= minLSN
   * @param {string} accountId
   * @param {number} minLSN
   * @returns {Promise<Object>}
   */
  async readWithMinLSN(accountId, minLSN) {
    const shard = this.getShardForAccount(accountId);
    const maxRetries = 20;
    const retryIntervalMs = 10;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      for (const replica of shard.replicas) {
        if (replica.lsn >= minLSN) {
          const res = replica.readDirect(accountId);
          return {
            balance: res.balance,
            currentLSN: res.currentLSN,
            routedTo: 'REPLICA',
            nodeId: replica.id
          };
        }
      }
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
    }

    // Fallback sang Primary nếu các replicas quá hạn mà chưa sync kịp
    const primaryRes = shard.primary.readDirect(accountId);
    return {
      balance: primaryRes.balance,
      currentLSN: primaryRes.currentLSN,
      routedTo: 'PRIMARY',
      nodeId: shard.primary.id
    };
  }
}

/**
 * Trình quản lý tính nhất quán Read-Your-Own-Writes
 */
class ReadYourOwnWritesManager {
  constructor(options = {}) {
    this.writeWindowMs = options.writeWindowMs || 2000;
    this.recentWrites = new Map(); // `${userId}:${accountId}` -> { lastWriteTimestamp, lastLSN }
  }

  /**
   * Ghi nhận một giao dịch ghi của User
   * @param {string} userId
   * @param {string} accountId
   * @param {number} lsn
   */
  recordWrite(userId, accountId, lsn) {
    // Guard clause dòng 1
    if (!userId || !accountId) return;

    const key = `${userId}:${accountId}`;
    this.recentWrites.set(key, {
      lastWriteTimestamp: Date.now(),
      lastLSN: lsn
    });
  }

  /**
   * Định tuyến truy vấn đọc thông minh (Pin-to-Primary vs Read Replica)
   * @param {string} userId
   * @param {string} accountId
   * @param {ShardedCluster} cluster
   * @returns {Promise<Object>}
   */
  async read(userId, accountId, cluster) {
    // Guard clause dòng 1
    if (!cluster || typeof cluster.getShardForAccount !== 'function') {
      throw new TypeError('Invalid cluster instance');
    }

    const key = `${userId}:${accountId}`;
    const recent = this.recentWrites.get(key);
    const shard = cluster.getShardForAccount(accountId);

    // Kiểm tra xem User có vừa ghi vào tài khoản này trong writeWindowMs không
    if (recent && (Date.now() - recent.lastWriteTimestamp) < this.writeWindowMs) {
      // Pin-to-Primary: Đọc thẳng từ Primary để bảo đảm không bị Stale Read
      const res = shard.primary.readDirect(accountId);
      return {
        balance: res.balance,
        currentLSN: res.currentLSN,
        routedTo: 'PRIMARY',
        nodeId: shard.primary.id
      };
    }

    // Sau khi hết hạn cửa sổ ghi: Chuyển về đọc từ Read Replica để giảm tải cho Primary
    const targetReplica = shard.replicas[0] || shard.primary;
    const res = targetReplica.readDirect(accountId);
    return {
      balance: res.balance,
      currentLSN: res.currentLSN,
      routedTo: targetReplica.role,
      nodeId: targetReplica.id
    };
  }
}

module.exports = {
  DatabaseNode,
  Shard,
  ShardedCluster,
  ReadYourOwnWritesManager
};

