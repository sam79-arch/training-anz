/**
 * ============================================================================
 * 🌊 ARCHITECTURE: NODE.JS STREAMS & BACKPRESSURE (Week 2 Day 5)
 * ============================================================================
 * Target: HCLTech x ANZ Bank Backend Interview (Data Platform Architecture)
 * Pattern: Streaming Ingestion, Backpressure Handshake & PCI-DSS Masking
 *
 * 🏦 Banking Problem Scenario (ANZ High-Volume Data Ingestion):
 * Trong hệ thống quyết toán giao dịch thẻ (EOD Settlement Batch), mỗi đêm hệ thống
 * tiếp nhận các file sao kê có dung lượng từ 1GB đến 10GB chứa hàng triệu giao dịch.
 * - ❌ Naive Approach: Sử dụng `fs.readFile()` nạp toàn bộ file vào RAM gây lỗi
 *   `JavaScript heap out of memory` hoặc bị Kubernetes kill pod (OOMKilled - Exit Code 137).
 * - ✅ Streams & Backpressure Architecture:
 *   Sử dụng luồng 3 tầng (Readable -> Transform -> Writable).
 *   Khi tốc độ ghi DB/Kafka chậm hơn tốc độ đọc đĩa, cơ chế Backpressure tự động
 *   tạm dừng (pause) nguồn phát và chỉ tiếp tục (resume) khi nhận sự kiện 'drain',
 *   giữ mức tiêu thụ RAM luôn ổn định ở mức < 30MB bất kể file lớn bao nhiêu!
 * ============================================================================
 */

const { Readable, Writable, Transform, pipeline } = require('node:stream');
const { promisify } = require('node:util');

const pipelineAsync = promisify(pipeline);

/**
 * 1. Custom Readable Stream: Phát ra luồng các bản ghi giao dịch ngân hàng giả lập
 */
class TransactionGeneratorStream extends Readable {
  /**
   * @param {Object} options
   * @param {number} options.totalRecords - Tổng số bản ghi cần phát
   * @param {number} [options.highWaterMark=16] - Kích thước bộ đệm nội tại
   */
  constructor(options = {}) {
    // 🚨 Guard clause tại dòng 1
    if (options === null || typeof options !== 'object') {
      options = {};
    }
    super({
      objectMode: true,
      highWaterMark: options.highWaterMark || 16,
    });

    this.totalRecords = options.totalRecords !== undefined ? options.totalRecords : 100;
    this.currentIndex = 0;
  }

  /**
   * V8 Stream Engine gọi _read() khi bộ đệm có chỗ trống
   */
  _read() {
    while (this.currentIndex < this.totalRecords) {
      this.currentIndex++;
      const transaction = {
        id: `tx-anz-${this.currentIndex}`,
        accountNumber: `ANZ-${10000000 + (this.currentIndex % 50000)}`,
        cardNumber: `4532${String(100000000000 + this.currentIndex).slice(-12)}`,
        amount: Number(((this.currentIndex * 13.37) % 5000).toFixed(2)) + 1.0,
        currency: 'AUD',
        timestamp: Date.now(),
      };

      // this.push(chunk) trả về false khi internal buffer đầy (Backpressure kích hoạt)
      const canAcceptMore = this.push(transaction);
      if (!canAcceptMore) {
        // Tự động dừng đẩy dữ liệu và chờ lần gọi _read() tiếp theo
        return;
      }
    }

    // Đẩy null báo hiệu kết thúc luồng (EOF)
    this.push(null);
  }
}

/**
 * 2. Custom Transform Stream: Chuẩn hóa và che mờ dữ liệu nhạy cảm theo chuẩn PCI-DSS
 */
class SensitiveDataMasker extends Transform {
  /**
   * @param {Object} options
   * @param {number} [options.shouldFailAfter=-1] - Số lượng bản ghi trước khi giả lập lỗi
   */
  constructor(options = {}) {
    if (options === null || typeof options !== 'object') {
      options = {};
    }
    super({
      objectMode: true,
      highWaterMark: options.highWaterMark || 16,
    });

    this.shouldFailAfter = options.shouldFailAfter || -1;
    this.processedCount = 0;
  }

  _transform(chunk, encoding, callback) {
    this.processedCount++;

    // Giả lập lỗi luồng nếu cần kiểm tra Error Handling & Resource Cleanup
    if (this.shouldFailAfter > 0 && this.processedCount > this.shouldFailAfter) {
      return callback(new Error('Simulated stream failure in data transformation'));
    }

    try {
      const maskedRecord = { ...chunk };

      // PCI-DSS Compliance: Giữ lại 4 số đầu và 4 số cuối, che 8 số ở giữa bằng ********
      if (typeof maskedRecord.cardNumber === 'string' && maskedRecord.cardNumber.length === 16) {
        maskedRecord.cardNumber = `${maskedRecord.cardNumber.slice(0, 4)}********${maskedRecord.cardNumber.slice(12)}`;
      }

      this.push(maskedRecord);
      callback();
    } catch (err) {
      callback(err);
    }
  }
}

/**
 * 3. Custom Writable Stream: Giả lập điểm tiếp nhận dữ liệu chậm (DB batch insert / Kafka publisher)
 */
class SlowBatchConsumerStream extends Writable {
  /**
   * @param {Object} options
   * @param {number} [options.highWaterMark=16] - Ngưỡng kích hoạt Backpressure
   * @param {number} [options.delayMs=5] - Độ trễ xử lý mỗi batch (mili-giây)
   */
  constructor(options = {}) {
    if (options === null || typeof options !== 'object') {
      options = {};
    }
    super({
      objectMode: true,
      highWaterMark: options.highWaterMark || 16,
    });

    this.delayMs = options.delayMs !== undefined ? options.delayMs : 5;
    this.consumedCount = 0;
  }

  _write(chunk, encoding, callback) {
    this.consumedCount++;

    if (this.delayMs > 0) {
      setTimeout(() => {
        callback();
      }, this.delayMs);
    } else {
      callback();
    }
  }
}

/**
 * 4. Hàm điều phối luồng hoàn chỉnh bằng stream.pipeline
 * Tự động quản lý Backpressure, unpipe và cleanup file descriptors khi có lỗi.
 */
async function executeStreamPipeline(sourceStream, transformStream, destinationStream) {
  return await pipelineAsync(sourceStream, transformStream, destinationStream);
}

/**
 * 5. Benchmark kiểm chứng độ ổn định bộ nhớ (Memory Stability Test)
 * Xử lý hàng chục nghìn bản ghi và đo lường Heap Used Delta
 */
async function measureStreamMemoryDelta(totalRecords = 50000) {
  // Gợi ý V8 thực hiện Garbage Collection ban đầu nếu có cờ --expose-gc
  if (global.gc) {
    global.gc();
  }

  const initialHeap = process.memoryUsage().heapUsed;

  const generator = new TransactionGeneratorStream({ totalRecords, highWaterMark: 64 });
  const masker = new SensitiveDataMasker({ highWaterMark: 64 });
  const consumer = new SlowBatchConsumerStream({ highWaterMark: 64, delayMs: 0 });

  await pipelineAsync(generator, masker, consumer);

  const finalHeap = process.memoryUsage().heapUsed;
  const deltaBytes = Math.max(0, finalHeap - initialHeap);
  return deltaBytes / (1024 * 1024); // Đổi ra MB
}

module.exports = {
  TransactionGeneratorStream,
  SensitiveDataMasker,
  SlowBatchConsumerStream,
  executeStreamPipeline,
  measureStreamMemoryDelta,
};
