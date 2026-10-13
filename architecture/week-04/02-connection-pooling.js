/**
 * ============================================================================
 * 📦 DATABASE CONNECTION POOLING ARCHITECTURE (Week 4 Day 2)
 * ============================================================================
 * Mô phỏng Connection Pool thuần Node.js theo chuẩn pg-pool / HikariCP:
 *   - Quản lý vòng đời kết nối: Created, Idle, Checked-out, Returned, Drain.
 *   - Điều phối hàng đợi Promise FIFO khi pool chạm ngưỡng max.
 *   - Connection Acquisition Timeout chống treo vô hạn request.
 *   - Connection Leak Detection giám sát thời gian checkout kèm stack trace.
 *   - Exception-Safe `query()` helper tự động release trong khối `finally`.
 *   - Sizing Math: Pool Size = 2 * CPU_CORES + Disk_Spindles.
 * ============================================================================
 */

const { EventEmitter } = require('node:events');

/**
 * Lỗi timeout khi không lấy được kết nối trong thời gian quy định
 */
class ConnectionTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConnectionTimeoutError';
  }
}

/**
 * Đại diện cho một kết nối vật lý tới cơ sở dữ liệu
 */
class DatabaseConnection {
  constructor(id) {
    this.id = `conn_${id}`;
    this.state = 'IDLE'; // 'IDLE' | 'ACTIVE' | 'CLOSED'
    this.createdAt = Date.now();
    this.lastUsedAt = Date.now();
    this.queryCount = 0;
  }

  /**
   * Giả lập thực thi câu lệnh SQL với độ trễ I/O bất đồng bộ
   * @param {string} sql - Câu lệnh SQL
   * @param {Array} params - Tham số truy vấn
   * @returns {Promise<Object>}
   */
  async query(sql, params = []) {
    // Guard clause dòng 1: Kiểm tra trạng thái đóng
    if (this.state === 'CLOSED') {
      throw new Error(`Cannot execute query on closed connection [${this.id}]`);
    }

    if (sql === 'INVALID SQL THROW') {
      throw new Error('Simulated SQL syntax error');
    }

    // Giả lập độ trễ truy vấn mạng / I/O đĩa
    await new Promise((resolve) => setTimeout(resolve, 2));

    this.queryCount++;
    this.lastUsedAt = Date.now();
    return {
      status: 'SUCCESS',
      sql,
      params,
      connectionId: this.id,
      executedAt: this.lastUsedAt
    };
  }

  /**
   * Đóng kết nối vật lý
   */
  close() {
    this.state = 'CLOSED';
  }
}

/**
 * Hệ thống Connection Pool thuần Node.js
 */
class ConnectionPool extends EventEmitter {
  constructor(options = {}) {
    super();

    this.max = options.max || 10;
    this.min = options.min || 2;
    this.idleTimeoutMillis = options.idleTimeoutMillis || 10000;
    this.connectionTimeoutMillis = options.connectionTimeoutMillis || 2000;
    this.leakDetectionThreshold = options.leakDetectionThreshold || 0;

    this._idCounter = 0;
    this._allConnections = new Set();
    this._idleConnections = [];
    this._checkedOut = new Map(); // conn -> { acquiredAt, timer, stack }
    this._waitingQueue = [];      // Array of { resolve, reject, timer, queuedAt }
    this._isDraining = false;
    this._drainWaiters = [];

    // Warm-up: Khởi tạo số lượng kết nối tối thiểu (min)
    const initialCount = Math.min(this.min, this.max);
    for (let i = 0; i < initialCount; i++) {
      const conn = this._createConnection();
      this._idleConnections.push(conn);
    }
  }

  /**
   * Tạo một kết nối mới và đưa vào tập hợp quản lý
   * @private
   */
  _createConnection() {
    const conn = new DatabaseConnection(++this._idCounter);
    this._allConnections.add(conn);
    return conn;
  }

  /**
   * Đăng ký trạng thái check-out và kích hoạt timer phát hiện leak
   * @private
   */
  _registerCheckout(conn) {
    conn.state = 'ACTIVE';
    const acquiredAt = Date.now();
    const stack = new Error().stack;

    let timer = null;
    if (this.leakDetectionThreshold > 0) {
      timer = setTimeout(() => {
        this.emit('connectionLeak', {
          connectionId: conn.id,
          heldTimeMs: Date.now() - acquiredAt,
          stack
        });
      }, this.leakDetectionThreshold);
    }

    this._checkedOut.set(conn, { acquiredAt, timer, stack });
  }

  /**
   * Lấy một kết nối từ pool (hoặc chờ trong hàng đợi FIFO)
   * @returns {Promise<DatabaseConnection>}
   */
  async acquire() {
    // Guard clause dòng 1: Kiểm tra pool đang drain
    if (this._isDraining) {
      throw new Error('Cannot acquire connection: pool is draining or closed');
    }

    // Trường hợp 1: Có kết nối rảnh rỗi trong pool
    if (this._idleConnections.length > 0) {
      const conn = this._idleConnections.pop();
      this._registerCheckout(conn);
      return conn;
    }

    // Trường hợp 2: Chưa chạm ngưỡng max, tạo thêm kết nối mới
    if (this._allConnections.size < this.max) {
      const conn = this._createConnection();
      this._registerCheckout(conn);
      return conn;
    }

    // Trường hợp 3: Đã đạt max kết nối, đưa request vào hàng đợi FIFO
    return new Promise((resolve, reject) => {
      const queuedAt = Date.now();
      const waiter = { resolve, reject, timer: null, queuedAt };

      if (this.connectionTimeoutMillis > 0) {
        waiter.timer = setTimeout(() => {
          // Xóa khỏi hàng đợi khi hết hạn chờ
          const idx = this._waitingQueue.indexOf(waiter);
          if (idx !== -1) {
            this._waitingQueue.splice(idx, 1);
          }
          reject(
            new ConnectionTimeoutError(
              `Connection acquisition timed out after ${this.connectionTimeoutMillis}ms (Queue position: ${idx})`
            )
          );
        }, this.connectionTimeoutMillis);
      }

      this._waitingQueue.push(waiter);
    });
  }

  /**
   * Hoàn trả kết nối về pool
   * @param {DatabaseConnection} conn - Kết nối cần hoàn trả
   */
  release(conn) {
    // Guard clause dòng 1: Kiểm tra kết nối hợp lệ đang được checkout
    if (!conn || !this._checkedOut.has(conn)) {
      return;
    }

    const info = this._checkedOut.get(conn);
    if (info.timer) {
      clearTimeout(info.timer);
    }
    this._checkedOut.delete(conn);

    // Ưu tiên 1: Chuyển giao ngay cho yêu cầu đang chờ trong hàng đợi FIFO
    if (this._waitingQueue.length > 0) {
      const waiter = this._waitingQueue.shift();
      if (waiter.timer) {
        clearTimeout(waiter.timer);
      }
      this._registerCheckout(conn);
      waiter.resolve(conn);
      return;
    }

    // Ưu tiên 2: Nếu pool đang drain, đóng luôn kết nối
    if (this._isDraining) {
      conn.close();
      this._allConnections.delete(conn);
      if (this._allConnections.size === 0) {
        this._drainWaiters.forEach((resolve) => resolve());
        this._drainWaiters = [];
      }
      return;
    }

    // Ưu tiên 3: Đưa về danh sách idle
    conn.state = 'IDLE';
    this._idleConnections.push(conn);
  }

  /**
   * Hàm tiện ích: Tự động acquire và release an toàn trong khối finally
   * @param {string} sql - Câu lệnh SQL
   * @param {Array} params - Tham số
   * @returns {Promise<Object>}
   */
  async query(sql, params = []) {
    const conn = await this.acquire();
    try {
      return await conn.query(sql, params);
    } finally {
      this.release(conn);
    }
  }

  /**
   * Đóng toàn bộ pool một cách an toàn (Graceful Shutdown)
   * @returns {Promise<void>}
   */
  async drain() {
    this._isDraining = true;

    // Đóng toàn bộ idle connections ngay lập tức
    while (this._idleConnections.length > 0) {
      const conn = this._idleConnections.pop();
      conn.close();
      this._allConnections.delete(conn);
    }

    // Huỷ các request còn đang chờ trong queue
    while (this._waitingQueue.length > 0) {
      const waiter = this._waitingQueue.shift();
      if (waiter.timer) clearTimeout(waiter.timer);
      waiter.reject(new Error('Connection acquisition aborted: pool is draining'));
    }

    if (this._allConnections.size === 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this._drainWaiters.push(resolve);
    });
  }

  /**
   * Trả về thông số thời gian thực của pool
   * @returns {Object}
   */
  getStats() {
    return {
      total: this._allConnections.size,
      idle: this._idleConnections.length,
      active: this._checkedOut.size,
      waiting: this._waitingQueue.length
    };
  }
}

module.exports = {
  ConnectionPool,
  DatabaseConnection,
  ConnectionTimeoutError
};

