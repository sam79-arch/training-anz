# 🏛️ Architecture Deep Dive: Database Sharding & Replication Lag (Read-Your-Own-Writes)

> **Tuần 4 — Day 4 (Thứ 5)**: Horizontal Database Scaling & Distributed Consistency  
> **Target**: Data Platform Team @ ANZ Bank  
> **Chuẩn hóa**: Tích hợp 3-file tinh gọn (Source, Unit Test, Cẩm nang Kiến trúc & Kịch bản tiếng Anh 6 bước).

---

## 1. 🏦 Business Scenario & Architectural Pain Point

Trong hệ thống Sổ cái Ngân hàng (ANZ Core Banking Settlement Platform), lưu trữ 50 triệu tài khoản khách hàng với hàng chục nghìn giao dịch tài chính mỗi giây:

### ⚠️ The Limit of Vertical Scaling & Need for Sharding
1. **Single Node Bottleneck**: Một máy chủ cơ sở dữ liệu duy nhất (dù là máy chủ vật lý 128 cores, 1TB RAM) cũng sẽ chạm ngưỡng giới hạn I/O đĩa và khóa hàng (Row Lock Contention) khi xử lý lưu lượng ghi khổng lồ.
2. **Cần phân mảnh ngang (Horizontal Sharding)**: Phân tách bảng `accounts` thành nhiều Shards độc lập trên các cụm máy chủ khác nhau dựa trên khóa phân mảnh `accountId`.

### ⚠️ The Replica Lag & Stale Read Nightmare
Để tăng thông lượng đọc, mỗi Shard gồm:
- **1 Primary Node**: Xử lý toàn bộ các giao dịch Ghi (`INSERT`, `UPDATE`, `DELETE`).
- **N Read Replica Nodes**: Đồng bộ bất đồng bộ từ Primary thông qua WAL (Write-Ahead Log) streaming để phục vụ các truy vấn Đọc (`SELECT`).

**Vấn đề xảy ra khi có Replication Lag (Độ trễ nhân bản)**:
- Khách hàng thực hiện chuyển tiền 1,000 AUD lúc $T_0$. Primary cập nhật số dư trừ 1,000 AUD.
- Vì mạng hoặc I/O trễ, WAL streaming sang Read Replica mất **50ms - 200ms**.
- Lúc $T_0 + 10\text{ms}$, ứng dụng Mobile Banking của khách hàng tải lại trang số dư. Yêu cầu đọc được cân bằng tải vào **Read Replica**.
- **Hậu quả**: Khách hàng thấy số dư vẫn y như cũ (chưa bị trừ)! Khách hàng hoảng hốt bấm nút chuyển tiền lần nữa $\rightarrow$ **Double-Spending / Duplicate Payment Disaster**.

---

## 2. 💡 Architectural Solutions for Read-Your-Own-Writes Consistency

### Kiến trúc Điều Phối Truy Vấn

```
                                [ Client Request ]
                                        │
                                        ▼
                  ┌──────────────────────────────────────────┐
                  │        ReadYourOwnWritesManager          │
                  │   (Tracks User Last Write & Min-LSN)     │
                  └─────────────────────┬────────────────────┘
                                        │
                         Is read within Write Window?
                           (or Replica LSN < Min-LSN?)
                                ┌───────┴───────┐
                          YES   │               │   NO (Window expired /
                                │               │       Replica caught up)
                                ▼               ▼
                       ┌────────────────┐ ┌────────────────┐
                       │  Shard Primary │ │  Read Replica  │
                       │ (Guaranteed    │ │ (Offload read  │
                       │  Fresh Data)   │ │  traffic)      │
                       └────────────────┘ └────────────────┘
```

### 3 Giải Pháp Kỹ Thuật Cốt Lõi:

#### 1. Pin-to-Primary (Time-Window Based Routing)
- Khi một client thực hiện ghi trên tài khoản $A$, hệ thống lưu vết `lastWriteTimestamp` vào Session / Cache (Redis hoặc in-process memory).
- Trong cửa sổ thời gian $T_{\text{window}}$ (ví dụ: **2,000ms** sau khi ghi), mọi yêu cầu đọc tài khoản $A$ của chính client đó **bắt buộc định tuyến về Primary Node**.
- Sau khi hết 2,000ms (thời gian thừa đủ để replica đồng bộ xong), các yêu cầu đọc sau đó tự động chuyển về **Read Replica** để bảo toàn mục tiêu giảm tải cho Primary.

#### 2. Min-LSN / Version-Vector Tracking (PostgreSQL `pg_last_wal_replay_lsn`)
- Khi ghi vào Primary thành công, Primary trả về vị trí **Log Sequence Number (LSN)** hoặc Transaction Version (ví dụ: `LSN: 104520`).
- Token phiên của client mang theo `minLSN: 104520`.
- Khi đọc, router kiểm tra các Read Replicas:
  - Nếu `replica.lsn >= minLSN`: Đọc từ Replica (đảm bảo dữ liệu đã bắt kịp giao dịch của user).
  - Nếu toàn bộ Replicas đều có `lsn < minLSN`: Định tuyến fallback về Primary.

#### 3. Sharding Strategy: Consistent Hashing by Account ID
- Sử dụng hàm băm đồng đều (Consistent Hashing) trên `accountId`:
  $$\text{Shard ID} = \text{Hash}(\text{accountId}) \pmod{\text{NumShards}}$$
- Toàn bộ dữ liệu của một tài khoản (Balance, History, Locks) luôn nằm trọn vẹn trong cùng 1 Shard, loại bỏ nhu cầu Cross-Shard Joins đắt đỏ.

---

## 3. 🗣️ 6-Step English Communication Script (Phỏng Vấn ANZ)

### Step 1: Clarify
> *"When scaling a core banking data platform beyond a single database node, we partition data horizontally across shards and scale read throughput using asynchronous read replicas.  
> However, replication lag can cause customers to observe stale balances immediately after submitting a payment. Are we designing a sharded architecture that guarantees **Read-Your-Own-Writes consistency** while still offloading reads to replicas?"*

### Step 2: Brute-Force
> *"A naive approach simply directs all reads to read replicas round-robin. Under high load, asynchronous WAL replication lag between primary and replicas causes customers to see their old balance immediately after a transfer, triggering duplicate payment attempts.  
> Conversely, routing all reads to the primary defeats the entire purpose of read scaling and causes primary node exhaustion."*

### Step 3: Optimize
> *"We resolve this with two techniques:  
> 1. **Deterministic Hash Sharding**: Shard by `accountId` to isolate customer data onto dedicated database clusters, avoiding distributed cross-shard locks.  
> 2. **Session-Level Pin-to-Primary with Min-LSN tracking**: When a user performs a write, we record their transaction's Log Sequence Number (LSN) and a bounded time window (e.g. 2 seconds). Subsequent reads from that specific user are pinned to the Primary or directed only to replicas that have caught up (`replica.lsn >= minLSN`), while other users continue reading from replicas."*

### Step 4: Think Out Loud
> 1. *"First, the `ShardedCluster` hashes the `accountId` to deterministically select the owning Shard."*  
> 2. *"When a write occurs, it executes on that Shard's Primary, updates the LSN, and triggers asynchronous replication."*  
> 3. *"The `ReadYourOwnWritesManager` records `{ lastWriteTimestamp, lastLSN }` for that user."*  
> 4. *"On a read request, if the user wrote within the time window, we pin to Primary for instant freshness."*  
> 5. *"Once the window expires, queries revert to read replicas to preserve primary capacity."*

### Step 5: Dry Run
> *"Consider User A deposits \$500 at $T_0$. The Primary updates to \$1500 with LSN 105. User A refreshes at $T_0 + 5\text{ms}$. The replica has only replayed up to LSN 100 with \$1000 balance. Because User A is within the write window, the router pins to Primary, returning \$1500. Meanwhile, User B reading account statistics is routed to the replica, successfully offloading the Primary."*

### Step 6: Conclusion
> *"By combining consistent hash sharding with adaptive Read-Your-Own-Writes routing, we eliminate stale read anomalies in financial transactions while maximizing cluster read throughput."*

---

## 4. 🔬 Verification Commands

```bash
# Chạy bộ unit test kiểm thử 6 kịch bản Sharding & Replication Lag
node architecture/week-04/04-db-sharding-replication.test.js

# Hoặc qua npm script
npm run test:w4-04
```

