# 🧭 Cẩm Nang Chuyên Sâu: Database Internals — B+Tree Index Architecture & Covering Index (Week 3 Day 2)

> **Mục tiêu phỏng vấn ANZ Data Platform:** Làm chủ bản chất vật lý của B+Tree Storage Engine trong hệ quản trị cơ sở dữ liệu quan hệ (PostgreSQL / MySQL InnoDB), phân biệt triệt để Clustered vs Secondary Index, giải mã hiện tượng Random I/O do Bookmark Lookup, thiết kế Covering Index bằng mệnh đề `INCLUDE` để loại bỏ 100% Heap Fetches, và thuần thục phân tích kế hoạch thực thi `EXPLAIN (ANALYZE, BUFFERS)` bằng tiếng Anh.

---

## 🔬 1. Kiến Trúc Cốt Lõi: Tại Sao Cơ Sở Dữ Liệu Chọn B+Tree Thay Vì B-Tree Hay Binary Search Tree (BST)?

### 1.1. Thất bại của Binary Search Tree (AVL / Red-Black Tree) trên đĩa
- **Vấn đề kích thước khối I/O:** Đĩa từ (HDD) đọc theo Sector (512B/4KB), còn ổ cứng SSD / NVMe đọc theo Flash Block/Page (4KB - 16KB). Hệ điều hành quản lý bộ đệm theo Page Cache (thường là 4KB), trong khi các Database Engine (PostgreSQL, MySQL) cấu hình Page Size là **8KB hoặc 16KB**.
- Trong cây nhị phân (Binary Search Tree / AVL / Red-Black Tree), mỗi node chỉ có tối đa 2 con (Fanout = 2).
  - Với $N = 100,000,000$ dòng dữ liệu, chiều cao cây:
    $$h \approx \log_2(10^8) \approx 27$$
  - Mỗi tầng là một con trỏ bộ nhớ nằm ở vị trí ngẫu nhiên trên đĩa. Để tìm 1 bản ghi, hệ thống phải thực hiện **27 lần Disk Seek ngẫu nhiên (Random I/O)**. Với HDD độ trễ 10ms/seek $\rightarrow$ mất 270ms; với SSD NVMe độ trễ 50µs $\rightarrow$ mất 1.35ms. Đây là thảm họa đối với hệ thống ngân hàng xử lý hàng chục nghìn TPS.

### 1.2. B-Tree vs. B+Tree: Bước nhảy vọt về Fanout
Trong B-Tree cổ điển, dữ liệu dòng (Data Payload hoặc Tuple Pointer) được lưu trữ ở **tất cả mọi node** (kể cả Internal Node).

| Đặc tính kiến trúc | B-Tree (Cổ điển) | B+Tree (Chuẩn RDBMS hiện đại) | Lợi thế cạnh tranh của B+Tree |
|---|---|---|---|
| **Vị trí lưu trữ dữ liệu dòng (Payload / Pointer)** | Nằm rải rác ở **tất cả các node** (Root, Internal, Leaf). | **CHỈ nằm tại Leaf Node**. Internal Node chỉ lưu Key và Child Pointer. | Tối đa hóa **Fanout** của Internal Node. |
| **Dung lượng Internal Page** | Bị chiếm dụng bởi dữ liệu hàng $\rightarrow$ Fanout nhỏ ($M \approx 10 - 20$). | Chỉ chứa Key (8 bytes) + Child Pointer (8 bytes) $\rightarrow$ Fanout khổng lồ ($M \approx 500 - 1000$). | Chiều cao cây cực thấp ($h \le 3-4$) cho hàng trăm triệu bản ghi. |
| **Hỗ trợ Range Query (`BETWEEN`)** | Rất kém. Phải duyệt cây In-order Traversal (liên tục nhảy lên node cha rồi xuống node con). | **Vượt trội**. Toàn bộ Leaf Node được kết nối thành **Doubly Linked List** (`prev` / `next`). | Sau khi chạm Leaf đầu tiên, chỉ cần đi ngang theo con trỏ `next` không bao giờ phải duyệt lại Root. |
| **Tính dự đoán được của Latency (SLA)** | Biến thiên: Bản ghi ở Root tìm thấy sau 1 I/O, bản ghi ở Leaf mất $h$ I/O. | **Đồng nhất 100%**: Mọi truy vấn Point Lookup đều tốn chính xác $h$ Index Page I/O. | Bảo đảm SLA giao dịch đồng nhất cho hệ thống Core Banking. |

### 1.3. Công thức tính Fanout và Chiều cao cây ($h$)
Giả sử PostgreSQL Page Size = 8,192 bytes (8KB):
- Page Header: 24 bytes.
- Key (`BIGINT` id): 8 bytes.
- Child Pointer (`BlockIdData`): 8 bytes.
- Slot Pointer: 4 bytes.
- Mỗi khóa điều hướng tốn: $8 + 8 + 4 = 20\text{ bytes}$.
$$\text{Fanout } M = \left\lfloor \frac{8192 - 24}{20} \right\rfloor \approx 408$$

Với Fanout $M = 400$:
- Tầng 1 (Root Page): Chứa 400 con trỏ $\rightarrow$ Quản lý $400$ node tầng dưới.
- Tầng 2 (Internal Level 1): $400 \times 400 = 160,000$ leaf pages.
- Tầng 3 (Leaf Level): Mỗi leaf page chứa 100 dòng $\rightarrow 160,000 \times 100 = 16,000,000$ dòng dữ liệu!
- Tầng 4 (Nếu có thêm 1 tầng): $160,000 \times 400 \times 100 = 6.4 \text{ tỷ bản ghi}$!

$$\text{Chiều cao cây } h = \left\lceil \log_{\text{fanout}} N \right\rceil \le 3 \text{ hoặc } 4$$

> **Bất biến kiến trúc:** Root Page và các Internal Page của B+Tree gần như luôn nằm gọn 100% trong RAM (`Buffer Pool` / `shared_buffers`). Do đó, chi phí duyệt qua Internal Nodes tiêu tốn $\approx 0\text{ ms}$ CPU RAM cache.

---

## 🏢 2. Mô Hình Lưu Trữ Vật Lý: Clustered Index vs. Heap Table & Secondary Index

Có sự khác biệt nền tảng giữa **MySQL InnoDB** và **PostgreSQL** trong cách tổ chức lưu trữ vật lý:

```
[ PostgreSQL Model: Heap-Organized Table ]
  +-------------------------------------------+
  | Table Heap Pages (Unordered Tuple Storage) |
  | Page 0: [Tuple 1] [Tuple 2]               |
  | Page 1: [Tuple 3] [Tuple 4]               |
  +-------------------------------------------+
         ^                              ^
         | (ctid = page, slot)          | (ctid = page, slot)
  +--------------------+         +--------------------+
  | Primary B+Tree Idx |         | Secondary B+Tree   |
  | Leaf: [Key -> ctid]|         | Leaf: [Acc -> ctid]|
  +--------------------+         +--------------------+

[ MySQL InnoDB Model: Index-Organized Table (Clustered) ]
  +-----------------------------------------------+
  | Clustered Index (Primary Key B+Tree)          |
  | Internal: [Keys -> Child Pointers]            |
  | Leaf: [PK | Full Row Columns Data ...]        |
  +-----------------------------------------------+
         ^
         | Primary Key Value (e.g., id = 250)
  +-----------------------------------------------+
  | Secondary Index (e.g. account_id B+Tree)      |
  | Leaf: [Key -> Primary Key Value (id)]         |
  +-----------------------------------------------+
```

### 2.1. Nỗi Đau "Bookmark Lookup" (Table Heap Fetch)
Khi câu truy vấn sử dụng Secondary Index (ví dụ trên `account_id`) nhưng `SELECT` các cột không có trong index (ví dụ `amount`, `created_at`):
1. Database tìm kiếm trên B+Tree của Secondary Index để lấy danh sách các con trỏ dòng (PostgreSQL: `ctid` gồm `{page_id, slot_id}`; InnoDB: Primary Key `id`).
2. Với mỗi con trỏ dòng tìm được, Database buộc phải nhảy sang **Table Heap** (hoặc Clustered Index) để đọc toàn bộ dòng dữ liệu nhằm lấy ra các cột còn thiếu.
3. **Hiện tượng Random I/O:** Các dòng dữ liệu trên Table Heap không được xếp thứ tự theo `account_id` mà nằm rải rác trên hàng nghìn Data Pages khác nhau. Nếu truy vấn trả về 500 dòng, database có thể phải thực hiện tới **500 phép đọc trang ngẫu nhiên (Random Page Fetches)**!

---

## 🚀 3. Đỉnh Cao Tối Ưu Hóa: Kỹ Thuật Covering Index Bằng Mệnh Đề `INCLUDE`

### 3.1. Bí quyết loại bỏ 100% Bookmark Lookup
Để biến một câu truy vấn từ `Index Scan with Bookmark Lookup` thành **`Index Only Scan`** (truy vấn hoàn tất 100% chỉ trong tầng Leaf của Index mà không cần chạm vào Table Heap), ta sử dụng kỹ thuật **Covering Index**.

Trước PostgreSQL 11, kỹ sư thường tạo Composite Index:
```sql
-- Cách cũ: Nhét cả amount vào khóa chỉ mục
CREATE INDEX idx_txn_acc_amt ON transactions (account_id, amount);
```
Nhược điểm của cách cũ:
- Cột `amount` tham gia vào khóa sắp xếp của B+Tree $\rightarrow$ Tăng kích thước các Internal Nodes.
- Làm giảm Fanout của cây $\rightarrow$ Có nguy cơ làm tăng chiều cao cây $h$.
- Khóa phức hợp làm chậm thao tác `INSERT / UPDATE` do phải duy trì thứ tự 2 cột.

### 3.2. Chuẩn mực hiện đại: Mệnh đề `INCLUDE` (PostgreSQL 11+, SQL Server)
```sql
-- Chuẩn mực Enterprise ANZ:
CREATE INDEX idx_txn_acc_include_amt 
ON transactions (account_id, created_at) 
INCLUDE (amount, status);
```

#### Cơ chế hoạt động của `INCLUDE`:
1. Các cột trong ngoặc chính `(account_id, created_at)` là **Search Keys** (khóa tìm kiếm): Được dùng để định tuyến điều hướng ở cả Internal Nodes và Leaf Nodes.
2. Các cột trong mệnh đề `INCLUDE (amount, status)` là **Payload Columns** (dữ liệu kèm theo): **CHỈ ĐƯỢC LƯU TẠI TẦNG LEAF**, tuyệt đối không xuất hiện ở Internal Nodes!
3. **Lợi ích kép:**
   - Fanout của Internal Nodes được bảo toàn nguyên vẹn 100%.
   - Truy vấn `SELECT account_id, created_at, amount, status WHERE account_id = $1` trở thành **Index Only Scan**, số lần đọc Table Heap = **0**.

---

## 🔍 4. Giải Mã Kế Hoạch Thực Thi: `EXPLAIN (ANALYZE, BUFFERS)`

Trong phỏng vấn ANZ, ứng viên Senior bắt buộc phải đọc hiểu tường tận output của lệnh `EXPLAIN (ANALYZE, BUFFERS)`:

```text
QUERY PLAN
--------------------------------------------------------------------------------------------------------------------------------------
Index Only Scan using idx_txn_acc_include_amt on transactions  (cost=0.43..24.50 rows=300 width=28) (actual time=0.035..0.128 rows=300 loops=1)
  Index Cond: ((account_id = 'ACC_1001'::text) AND (created_at >= 1774828800000::bigint))
  Heap Fetches: 0
  Buffers: shared hit=22
Planning Time: 0.082 ms
Execution Time: 0.155 ms
```

### Các chỉ số quan trọng cần phân tích:
1. **Node Type (`Index Only Scan`):** Khẳng định truy vấn không cần đọc Table Heap.
2. **`Heap Fetches: 0`:** Bằng chứng cho thấy toàn bộ dữ liệu đã được lấy từ Leaf Node (kết hợp với Visibility Map của PostgreSQL). Nếu `Heap Fetches > 0`, chứng tỏ bảng chưa được `VACUUM` kịp thời để cập nhật Visibility Map.
3. **`Buffers: shared hit=22`:** Toàn bộ 22 pages được đọc từ RAM Buffer Pool (`shared_buffers`), 0 page phải đọc từ đĩa (`shared read=0`).
4. **Đối chiếu với `Index Scan` thông thường:**
   ```text
   Index Scan using idx_txn_acc on transactions ...
     Buffers: shared hit=322 (index=22, heap=300)
   ```
   Chi phí I/O tăng gấp **14.6 lần** (từ 22 lên 322 buffers) chỉ vì 300 lần Bookmark Lookup!

---

## 💬 5. Kịch Bản Đàm Thoại Phỏng Vấn 6 Bước Chuẩn Senior (English Dialogue)

### Step 1: Clarify Requirements & Query Profile
> **Candidate:** "Before designing the index strategy for the transaction history service, I would like to clarify the query patterns and data volume. Are we dealing with tens of millions of records, and is the primary lookup an exact account match with a timestamp range, such as `WHERE account_id = $1 AND created_at BETWEEN $2 AND $3`? Also, what are the selected columns? If the frontend only requires `transaction_id`, `amount`, and `created_at`, we have a prime candidate for an Index-Only Scan."

### Step 2: Explain Naive / Brute-Force Approach & Bottlenecks
> **Candidate:** "Without an index, the database executes a **Sequential Scan** ($O(N)$ Page I/O), reading every single 8KB table page into `shared_buffers`. For a 50GB table, this saturates disk bandwidth, causes severe Buffer Pool churn, and drives p99 latency beyond 2.5 seconds. If we only add a standard secondary index on `account_id`, the database performs an **Index Scan with Bookmark Lookup**. While index traversal takes $O(\log N)$ pages, retrieving missing columns like `amount` triggers hundreds of random heap page fetches (`shared hit/read`), which degrades performance under high concurrency."

### Step 3: Propose Architecture Optimization (B+Tree & Covering Index)
> **Candidate:** "To achieve predictable sub-10ms response times, I propose creating a **Covering Index** using the `INCLUDE` clause:  
`CREATE INDEX idx_txn_covering ON transactions (account_id, created_at) INCLUDE (amount);`  
In a B+Tree, Internal Nodes maintain a high fanout ($M \ge 400$) by storing only router keys, keeping tree height $h \le 3$. By appending `amount` as payload exclusively in the leaf nodes, we satisfy all projection columns directly from the index leaf pages. The leaves form a doubly linked list, enabling the engine to execute range scans via forward pointer chasing without re-traversing the root."

### Step 4: Think Out Loud While Explaining Internal Execution Flow
> **Candidate:** "When the query planner evaluates this index, it chooses an **Index-Only Scan**. The engine enters the root page, performs binary search across keys, and traverses down 2 internal pages to locate the first matching leaf node. It then traverses horizontally using `leaf.next` pointers across approximately 19 leaf pages. Because `amount` is stored in the leaf payload, `heapPagesRead` is strictly zero. We bypass the Table Heap entirely, eliminating random I/O."

### Step 5: Dry Run with Concrete Numbers
> **Candidate:** "Let's trace a query retrieving 300 transactions for a given account across a 5,000-page table. With a standard secondary index, we would read 3 internal pages, 19 leaf pages, and perform 300 random heap tuple lookups—totaling 322 buffer page accesses. With our covering index, we read 3 internal pages and 19 leaf pages, with zero heap reads—totaling exactly 22 buffer accesses. That is a **93.17% reduction in Page I/O**, verifiable directly in `EXPLAIN (ANALYZE, BUFFERS)` with `Heap Fetches: 0`."

### Step 6: Conclude with Complexity & Operational Trade-offs
> **Candidate:** "In conclusion, Time Complexity is reduced from $O(N)$ to $O(\log_M N + K)$ where $K$ is the number of returned records, with $h \le 3$. Space-wise, storing `amount` in leaf nodes increases index size by roughly 15-20%, which is a deliberate, highly favorable trade-off for eliminating 93% of disk I/O. Operationally, in PostgreSQL, we must ensure autovacuum maintains an up-to-date Visibility Map so that the planner doesn't fall back to heap fetches for transaction visibility checks."

---

## 📋 6. Production Checklist: Đánh Index Chuẩn ANZ Data Platform

- [x] **Áp dụng Left-to-Right Matching (Composite Index Order):** Đặt cột lọc đẳng thức (`=`) lên đầu, cột lọc phạm vi (`BETWEEN`, `>`, `<`) ở sau cùng của Search Keys.
- [x] **Dùng `INCLUDE` cho Non-Filter Projection Columns:** Tuyệt đối không đưa các cột chỉ xuất hiện ở `SELECT` vào phần Search Keys để tránh làm giảm Fanout của B+Tree.
- [x] **Kiểm soát Write Amplification:** Mỗi index bổ sung sẽ làm chậm thao tác `INSERT`, `UPDATE`, `DELETE` và tiêu tốn dung lượng Write-Ahead Log (WAL). Chỉ tạo index có bằng chứng đo lường I/O từ `pg_stat_statements`.
- [x] **Đảm bảo Autovacuum cho Index-Only Scan:** Thiết lập `autovacuum_vacuum_scale_factor = 0.05` trên các bảng giao dịch lớn để Visibility Map luôn được làm mới, bảo đảm `Heap Fetches = 0`.
- [x] **Tạo Index Không Gây Lock Bảng (`CONCURRENTLY`):** Trong môi trường Production 24/7 của ngân hàng, luôn dùng `CREATE INDEX CONCURRENTLY` để tránh chiếm `ACCESS EXCLUSIVE lock` làm nghẽn giao dịch thanh toán.

