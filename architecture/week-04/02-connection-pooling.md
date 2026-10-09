# 🏛️ Architecture Deep Dive: Database Connection Pooling trong Node.js

> **Tuần 4 — Day 2 (Thứ 3)**: Database Scaling & Connection Management  
> **Target**: Data Platform Team @ ANZ Bank  
> **Chuẩn hóa**: Tích hợp 3-file tinh gọn (Source, Unit Test, Cẩm nang Kiến trúc & Kịch bản tiếng Anh 6 bước).

---

## 1. 🏦 Business Scenario & Architectural Pain Point

Trong hệ thống xử lý giao dịch tài chính của ANZ Bank, microservice Node.js phục vụ luồng thanh toán và đối soát sổ cái với cơ sở dữ liệu quan hệ (PostgreSQL / Oracle).

### ⚠️ The Problem: Direct Connection-per-Request & Connection Storm
Nếu mỗi khi có HTTP request gửi đến, ứng dụng lại mở một kết nối vật lý mới tới cơ sở dữ liệu:
1. **Chi phí Handshake đắt đỏ**: Mỗi kết nối đòi hỏi TCP 3-way handshake, TLS negotiation, và xác thực bảo mật (Kerberos / SCRAM-SHA-256).
2. **PostgreSQL Process-per-Connection Overhead**:
   - PostgreSQL sử dụng mô hình kiến trúc đa tiến trình (`fork()`). Mỗi kết nối tương ứng với một tiến trình `postgres backend` độc lập trên hệ điều hành, tiêu tốn **~10MB RAM** bộ nhớ riêng và shared memory.
   - 1,000 kết nối đồng thời ngốn ngay **~10GB RAM** chỉ để duy trì kết nối mà chưa thực thi câu lệnh SQL nào.
3. **OS Context Switching & Buffer Contention Thrashing**:
   - Khi CPU chỉ có 8-16 cores vật lý nhưng phải điều phối hàng trăm tiến trình cạnh tranh truy cập `shared_buffers`, chi phí chuyển đổi ngữ cảnh (Context Switching) và tranh chấp khóa (Spinlock / LwLock) sẽ làm CPU nghẽn ở mức 100%, thông lượng hệ thống sụt giảm thảm hại (Throughput Collapse).
4. **Connection Leak Disaster**:
   - Lập trình viên quên giải phóng kết nối trong khối `catch` khi có lỗi xảy ra. Sau một thời gian, toàn bộ kết nối trong pool bị "chiếm giữ", khiến các request tiếp theo bị treo vô hạn (`Hang`) và làm tê liệt toàn bộ API Gateway.

---

## 2. 💡 The Solution: Native Node.js Connection Pooling Engine

### Sơ đồ Kiến trúc Điều Phối Kết Nối

```
 [ Client Requests (1000 req/s) ]
               │
               ▼
   ┌─────────────────────────────────────────────────────────┐
   │             Node.js ConnectionPool                      │
   │                                                         │
   │   ┌──────────────────┐        ┌─────────────────────┐   │
   │   │ _idleConnections │        │    _checkedOut      │   │
   │   │ [conn_1, conn_2] │        │ [conn_3 -> Timer]   │   │
   │   └──────────────────┘        └─────────────────────┘   │
   │            ▲                             ▲              │
   │            │ release()                   │ acquire()    │
   │            └──────────────┬──────────────┘              │
   │                           │                             │
   │   ┌─────────────────────────────────────────────────┐   │
   │   │       FIFO Waiting Queue (_waitingQueue)        │   │
   │   │       [Req_4 (timer), Req_5 (timer), ...]       │   │
   │   └─────────────────────────────────────────────────┘   │
   └───────────────────────────┬─────────────────────────────┘
                               │ Physical Sockets (max: 10)
                               ▼
            ┌──────────────────────────────────────┐
            │        PostgreSQL Cluster            │
            │     (Dedicated Backend Workers)      │
            └──────────────────────────────────────┘
```

### Các Trụ Cột Kỹ Thuật
1. **Fixed Upper Bound (`max`)**: Khống chế số lượng kết nối vật lý tối đa mở tới DB server, bảo vệ database không bao giờ bị quá tải bộ nhớ.
2. **FIFO Promise Waiting Queue**: Khi pool chạm ngưỡng `max`, các yêu cầu mới không bị từ chối ngay mà được xếp hàng theo thứ tự đến trước - phục vụ trước.
3. **Acquire Timeout (`connectionTimeoutMillis`)**: Ngăn chặn request bị treo vĩnh viễn khi cơ sở dữ liệu chậm hoặc pool cạn kiệt. Nếu quá thời hạn (ví dụ 2000ms), Promise sẽ bị reject với lỗi `ConnectionTimeoutError`.
4. **Leak Detection Threshold (`leakDetectionThreshold`)**: Tự động kích hoạt bộ đếm thời gian khi connection được checkout. Nếu connection bị giữ quá ngưỡng quy định (ví dụ 3000ms), hệ thống sẽ phát sinh sự kiện cảnh báo `connectionLeak` kèm Stack Trace chính xác nơi connection được lấy ra để hỗ trợ Debug.
5. **Exception-Safe Pattern (`finally`)**:
   ```javascript
   async function query(sql, params) {
     const conn = await pool.acquire();
     try {
       return await conn.query(sql, params);
     } finally {
       pool.release(conn); // Luôn luôn trả kết nối về pool kể cả khi query ném lỗi
     }
   }
   ```

---

## 3. 📐 Sizing Math: Công Thức Tính Connection Pool Tối Ưu

Nhiều kỹ sư thường có trực giác sai lầm: *"Muốn xử lý 10,000 req/s thì Connection Pool phải đặt 1,000 hoặc 5,000"*.

Công thức chuẩn mực được nhóm phát triển **HikariCP** và **PostgreSQL** khuyến nghị:

$$\text{Pool Size} = 2 \times \text{CPU\_CORES} + \text{Effective\_Spindle\_Count}$$

- **$\text{CPU\_CORES}$**: Số nhân CPU vật lý của máy chủ cơ sở dữ liệu.
- **$\text{Effective\_Spindle\_Count}$**: Số ổ đĩa quay (Spindle). Với ổ cứng thể rắn **NVMe / SSD**, giá trị này thường được tính là **1**.

### Ví dụ Thực Tế:
Với Database Server có 8 Cores CPU và ổ đĩa SSD:
$$\text{Pool Size} = 2 \times 8 + 1 = 17 \text{ kết nối}$$

### Tại sao 17 kết nối lại nhanh hơn 500 kết nối?
- 8 Cores CPU tại một thời điểm chỉ có thể thực thi chính xác 8 luồng tính toán song song thực sự.
- Nếu mở 500 kết nối, 500 tiến trình sẽ liên tục tranh giành 8 cores, sinh ra hàng triệu phép chuyển ngữ cảnh (Context Switches) mỗi giây.
- Bằng cách giới hạn pool ở mức 15-20 kết nối, các câu lệnh SQL hoàn thành trong $< 2\text{ms}$, kết nối được tái sử dụng liên tục và thông lượng toàn hệ thống tăng gấp 5 - 10 lần.

---

## 4. 🗣️ 6-Step English Communication Script (Phỏng Vấn ANZ)

### Step 1: Clarify
> *"In a high-throughput banking environment, direct connection-per-request causes connection storms and exhausting database server memory. Are we designing an in-process connection pool that enforces a maximum client limit, queues pending requests with timeouts, and detects connection leaks?"*

### Step 2: Brute-Force
> *"A naive approach opens and closes a TCP connection for every incoming API request. In PostgreSQL, each client spawns a separate OS backend process consuming roughly 10MB of RAM. Under a spike of 1,000 requests, this triggers a connection storm, exhausting memory and causing severe CPU thrashing due to OS context switching."*

### Step 3: Optimize
> *"We optimize this by managing a reusable pool of persistent connections using an event-driven architecture in Node.js.  
> We maintain an idle list and an active map. When all connections reach the max threshold, subsequent callers wait in a FIFO Promise queue bounded by an acquisition timeout. Furthermore, we attach leak detection timers with captured stack traces to catch unreleased connections."*

### Step 4: Think Out Loud
> 1. *"First, we initialize the pool with a minimum number of warmed-up connections."*  
> 2. *"In `acquire()`, if an idle client is available, we pop it, register it in `_checkedOut`, start the leak timer, and return it immediately."*  
> 3. *"If total connections are below `max`, we lazily instantiate a new `DatabaseConnection`."*  
> 4. *"If saturated, we enqueue the Promise resolver and set a timeout timer to reject if the threshold is breached."*  
> 5. *"In `release()`, we clear the leak timer and dispatch the connection directly to the oldest waiting request in the FIFO queue before returning it to the idle list."*

### Step 5: Dry Run
> *"Consider `max = 2`. Request 1 and 2 acquire `conn_1` and `conn_2`. Request 3 enters the queue. If Request 1 finishes in 10ms, its `release()` directly hands `conn_1` over to Request 3 without allocating memory. If Request 3 waits longer than `connectionTimeoutMillis`, it is ejected from the queue with a clean `ConnectionTimeoutError`."*

### Step 6: Conclusion
> *"By applying the HikariCP sizing formula $\text{Pool Size} = 2 \times \text{CPU\_CORES} + \text{Disk\_Spindles}$, a modest pool of 15 to 20 connections can reliably sustain thousands of requests per second with sub-millisecond acquisition latency and zero resource leaks."*

---

## 5. 🔬 Verification Commands

```bash
# Chạy bộ unit test kiểm thử 9 kịch bản Connection Pooling
node architecture/week-04/02-connection-pooling.test.js

# Hoặc qua npm script
npm run test:w4-02
```

