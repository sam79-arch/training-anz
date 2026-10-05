# Database Concurrency: ACID Isolation Levels & Locking Mechanisms

> **Topic:** Database Concurrency, MVCC & Transaction Isolation  
> **Milestone:** Phase 1B (Week 3 Day 4 - DBMS Deep Dive 2)  
> **Target:** HCLTech x ANZ Bank (Data Platform Team)  
> **Rule:** TUYỆT ĐỐI CẤM GIẢI LEETCODE — Trọng tâm 100% vào RDBMS Internals & System Design

---

## 1. Problem Scenario (Bối Cảnh Thực Tế Ngân Hàng)

Trong hệ thống xử lý giao dịch thời gian thực (Real-time Core Banking Ledger) của ANZ Bank, hàng triệu giao dịch chuyển tiền (NPP / Osko payments) diễn ra đồng thời mỗi giây. Giả sử tài khoản `ACC-A` có số dư ban đầu là **$1,000**.
Hai tiến trình xử lý song song:
- **Tx 1**: Khách hàng rút $800 tại ATM.
- **Tx 2**: Lệnh trích nợ tự động tiền thuê nhà $600.

Nếu hệ thống cơ sở dữ liệu không có cơ chế kiểm soát đồng thời (Concurrency Control):
1. **Lost Update Anomaly**: Cả Tx 1 và Tx 2 cùng đọc số dư $1,000. Tx 1 tính $1,000 - $800 = $200 và ghi xuống đĩa. Ngay sau đó, Tx 2 tính $1,000 - $600 = $400 và ghi đè lên $200. Kết quả: Khách hàng rút được tổng cộng $1,400 nhưng tài khoản vẫn còn $400 $\rightarrow$ Ngân hàng thất thoát tài chính nghiêm trọng!
2. **Dirty Read Anomaly**: Tx 1 chuyển $5,000 vào tài khoản nhưng chưa commit. Tx 2 đọc thấy số dư và duyệt hạn mức thẻ tín dụng. Ngay sau đó Tx 1 bị lỗi mạng và rollback. Tx 2 đã ra quyết định dựa trên số liệu "rác" chưa từng tồn tại hợp lệ.

---

## 2. 4 Cấp Độ Cô Lập ANSI SQL & 3 Hiện Tượng Dị Thường (Anomalies)

| Isolation Level | Dirty Read | Non-repeatable Read | Phantom Read | Cơ chế ngầm định (Implementation) |
|---|:---:|:---:|:---:|---|
| **Read Uncommitted** | ❌ Bị dính | ❌ Bị dính | ❌ Bị dính | Đọc trực tiếp dirty memory buffer, không kiểm tra lock. |
| **Read Committed** *(Postgres/Oracle default)* | ✅ Ngăn chặn | ❌ Bị dính | ❌ Bị dính | Chỉ đọc các row đã commit. Mỗi câu lệnh SQL tạo 1 Read View mới. |
| **Repeatable Read** *(MySQL InnoDB default)* | ✅ Ngăn chặn | ✅ Ngăn chặn | ⚠️ Postgres ngăn được / MySQL cần Next-Key Lock | Tạo Read View / Snapshot 1 lần duy nhất lúc bắt đầu Transaction (MVCC). |
| **Serializable** | ✅ Ngăn chặn | ✅ Ngăn chặn | ✅ Ngăn chặn | Two-Phase Locking (2PL) nghiêm ngặt hoặc SSI (Serializable Snapshot Isolation). |

---

## 3. Kiến Trúc MVCC (Multi-Version Concurrency Control)

Nguyên lý cốt lõi: **"Readers do not block Writers, and Writers do not block Readers"** (Tiến trình đọc không chặn tiến trình ghi, và tiến trình ghi không chặn tiến trình đọc).

### 🐘 PostgreSQL MVCC Internals
- Mỗi hàng (row tuple) trong PostgreSQL đều có 2 metadata ẩn:
  - `xmin`: Transaction ID (TxID) đã tạo ra tuple này.
  - `xmax`: TxID đã xóa hoặc cập nhật tuple này (nếu chưa xóa thì `xmax = 0`).
- Khi UPDATE: PostgreSQL không ghi đè dữ liệu cũ. Nó chèn một tuple mới với `xmin = current_tx` và đánh dấu `xmax = current_tx` vào tuple cũ.
- Khi SELECT ở `REPEATABLE_READ`: Transaction chụp một `Snapshot` gồm danh sách các TxID đang hoạt động (active). Tuple chỉ hiển thị với Tx nếu:
  1. `xmin` đã commit VÀ nhỏ hơn TxID của snapshot.
  2. `xmax = 0` HOẶC `xmax` lớn hơn TxID của snapshot (chưa commit xóa).
- **Vấn đề Tuple Bloat & VACUUM**: Các tuple cũ (dead tuples) tích tụ chiếm dung lượng đĩa. Worker `VACUUM` chạy định kỳ để thu dọn dead tuples và chống hiện tượng Transaction ID Wraparound (2 tỷ transactions).

### 🐬 MySQL InnoDB MVCC Internals
- Thay vì lưu dead tuples trực tiếp trên data page như Postgres, InnoDB lưu phiên bản hiện tại trên Clustered Index (B+Tree) và lưu các phiên bản cũ trong **Undo Log** dạng danh sách liên kết ngược:
  - `DB_TRX_ID`: TxID cuối cùng cập nhật hàng.
  - `DB_ROLL_PTR`: Con trỏ trỏ tới bản ghi tương ứng trong Undo Log Segment.
- Khi rollback hoặc snapshot read: InnoDB lần theo con trỏ `DB_ROLL_PTR` để tái tạo lại giá trị tại thời điểm Read View được tạo.
- Giảm thiểu phân mảnh data page so với Postgres, nhưng Undo Log phình to nếu transaction kéo dài (Long-running Transaction).

---

## 4. Đối Chiếu Thực Nghiệm: Pessimistic vs Optimistic Locking

```
                                      CONCURRENCY LOCKING STRATEGY
                                                   │
                 ┌─────────────────────────────────┴─────────────────────────────────┐
                 ▼                                                                   ▼
       PESSIMISTIC LOCKING                                                 OPTIMISTIC LOCKING
   (SELECT ... FOR UPDATE)                                               (WHERE version = expected)
   - Triết lý: Bi quan, luôn nghi ngờ conflict                         - Triết lý: Lạc quan, tin conflict hiếm xảy ra
   - Cơ chế: Giữ Exclusive Row Lock trên DB                            - Cơ chế: Kiểm tra số phiên bản (CAS - Compare & Swap)
   - Ưu điểm: Đảm bảo 100% thành công tuần tự, không rollback          - Ưu điểm: Không chiếm lock DB, throughput cực cao
   - Nhược điểm: Giảm throughput, rủi ro Deadlock                      - Nhược điểm: Phải rollback & retry nếu tỷ lệ ghi xung đột cao
   - Phù hợp: Giao dịch chuyển tiền ngân hàng, mua vé ghế rạp chiếu phim - Phù hợp: Cập nhật profile, giỏ hàng thương mại điện tử
```

### Mã nguồn so sánh (Node.js Pattern)

#### A. Pessimistic Locking (`SELECT FOR UPDATE`)
```javascript
async function transferPessimistic(fromId, toId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Lock cả 2 tài khoản theo thứ tự ID để chống DEADLOCK
    const [firstId, secondId] = fromId < toId ? [fromId, toId] : [toId, fromId];
    await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [firstId]);
    await client.query('SELECT balance FROM accounts WHERE id = $2 FOR UPDATE', [secondId]);

    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromId]);
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

#### B. Optimistic Locking (`version` column)
```javascript
async function updateAccountOptimistic(accountId, newBalance, expectedVersion) {
  const result = await db.query(
    'UPDATE accounts SET balance = $1, version = version + 1 WHERE id = $2 AND version = $3',
    [newBalance, accountId, expectedVersion]
  );
  if (result.rowCount === 0) {
    // Không có dòng nào được cập nhật -> Xung đột phiên bản!
    throw new OptimisticLockException('Data was modified by another transaction. Please retry.');
  }
}
```

---

## 5. Kịch Bản Đối Thoại Tiếng Anh Chuẩn 6 Bước (ANZ Interview Script)

### Step 1: Clarify
> *"In a banking ledger context, concurrent transfers on the same account can easily cause Lost Updates or Dirty Reads. Are we optimizing for maximum throughput with optimistic retries, or zero-failure strict consistency with pessimistic locking?"*

### Step 2: Brute-Force / Naive Approach
> *"The naive approach is simply running regular `SELECT` followed by `UPDATE`. However, under concurrent load, two transactions read the same initial balance, calculate locally, and overwrite each other, causing a Lost Update anomaly and violating ACID Atomicity and Consistency."*

### Step 3: Optimize & Trade-offs
> *"To guarantee consistency, we have two primary approaches: First, Pessimistic Locking via `SELECT ... FOR UPDATE` acquires row-level exclusive locks in InnoDB or Postgres. To prevent deadlocks, we must enforce a global locking order (e.g. sorting account IDs). Second, Optimistic Locking uses an atomic version column. If contention is low, optimistic locking yields much higher throughput with zero database locking overhead."*

### Step 4: Think Out Loud (MVCC & Isolation)
> *"For read operations, modern databases rely on MVCC. In Postgres, tuples store `xmin` and `xmax`. Under `Repeatable Read`, a snapshot is taken at the start of the transaction, ensuring that even if another transaction commits new updates, our transaction reads immutable historic tuples from its snapshot, eliminating Non-repeatable Reads without blocking writers."*

### Step 5: Dry Run
> *"Let's trace our simulation: Tx1 starts under `REPEATABLE_READ` and reads $500. Tx2 starts, updates balance to $1,500 and commits. Tx1 reads again: because its MVCC snapshot was established before Tx2 committed, Tx1 still observes $500. The Conservation of Money is preserved."*

### Step 6: Conclusion
> *"In ANZ's core settlement pipeline, we recommend Pessimistic Locking with deterministic ID sorting for financial debits to eliminate retry storms, while utilizing Read Committed or Repeatable Read MVCC for reporting queries to maximize read concurrency."*

---

## 6. Verification
```bash
# Chạy bộ test kiểm chứng 4 cấp độ cô lập và Locking
node architecture/week-03/04-acid-concurrency.test.js
```
