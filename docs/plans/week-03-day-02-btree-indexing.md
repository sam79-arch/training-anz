# Implementation Plan: Database Internals — B+Tree Index Architecture & Covering Index

## 1. Objective & Metadata
Nghiên cứu và mô phỏng chuyên sâu cấu trúc chỉ mục cây B+Tree (B+Tree Index Engine) trong cơ sở dữ liệu quan hệ (PostgreSQL / MySQL) phục vụ tối ưu hóa truy vấn Data Platform tại ANZ Bank. Bài học tập trung vào giải thích cơ chế tổ chức vật lý của Page/Node, Fanout bậc cao, danh sách liên kết kép (Doubly Linked List) ở tầng lá phục vụ Range Queries, phân biệt rạch ròi Clustered Index vs Secondary Index (Bookmark Lookup penalty), và kỹ thuật thiết kế **Covering Index** (Index-Only Scan) bằng mệnh đề `INCLUDE` để loại bỏ 100% chi phí Table Heap Fetch. Tuân thủ tuyệt đối quy tắc Anti-Burnout: Thứ 3 cấm giải LeetCode.

- **Task Type**: `DBMS Execution`
- **Status**: `Open`
- **Issue**: [#35](https://github.com/sam79-arch/training-anz/issues/35)
- **Milestone**: [Milestone #6 (Week 3: Stack, Linked List & Database Deep Dive)](https://github.com/sam79-arch/training-anz/milestone/6)
- **Target Branch**: `main`

---

## 2. 📌 Executive & Business Summary (Tóm tắt Nghiệp vụ / Bài toán)

- **Business / Problem Title**: 
  > Tối ưu hóa hiệu năng truy vấn lịch sử giao dịch (Transaction History Query) trên bảng hàng chục triệu bản ghi bằng cấu trúc B+Tree và kỹ thuật Covering Index (Index-Only Scan) trong hệ thống ANZ Data Platform.

- **Why / Problem Statement**:
  > Trong các ứng dụng ngân hàng lõi và đối soát giao dịch, một câu truy vấn tìm kiếm lịch sử thanh toán theo tài khoản và khoảng thời gian (`SELECT transaction_id, amount, created_at FROM transactions WHERE account_id = $1 AND created_at BETWEEN $2 AND $3`) khi chưa có index phù hợp sẽ buộc cơ sở dữ liệu phải quét tuần tự (Sequential Scan) toàn bộ bảng hàng triệu bản ghi, gây nghẽn I/O đĩa và tăng p99 latency lên > 2.5s. Nếu chỉ đánh index thông thường trên `account_id`, database vẫn phải thực hiện hàng ngàn phép đọc ngẫu nhiên (Random I/O) vào bảng dữ liệu (Table Heap Fetch / Bookmark Lookup) để lấy các cột `amount`, gây lãng phí bộ đệm buffer cache.

- **What / Solution**:
  > 1. Xây dựng mô hình mô phỏng kiến trúc **B+Tree Storage Engine** với cơ chế chia trang (Page-based storage 8KB/16KB), bậc cây (Fanout $M \ge 100$), và tầng lá liên kết 2 chiều (`prev` / `next`) cho phép quét phạm vi (Range Scan) không cần duyệt lại cây.
  > 2. So sánh định lượng chi phí I/O: **Table Sequential Scan** ($O(N)$ pages) vs **Secondary Index Scan + Bookmark Lookup** ($O(\log_M N) + K$ random heap fetches) vs **Covering Index-Only Scan** ($O(\log_M N) + \lceil K / P \rceil$ sequential index pages).
  > 3. Chứng minh sức mạnh của mệnh đề `CREATE INDEX ... ON transactions (account_id, created_at) INCLUDE (amount)` trong PostgreSQL, triệt tiêu hoàn toàn chi phí Heap Fetch.
  > 4. Hướng dẫn đọc và giải mã kế hoạch thực thi `EXPLAIN (ANALYZE, BUFFERS)`: nhận diện các node `Seq Scan`, `Index Scan`, `Bitmap Index Scan`, `Index Only Scan` và tỷ lệ `Buffers: shared hit`.

- **Impact & Expected Performance**:
  > - **Time Complexity**: Tìm kiếm điểm (Point Lookup) đạt $O(\log_M N)$ với độ cao cây $h \le 3-4$ trên 100 triệu dòng; Range Query đạt $O(\log_M N + K)$ nhờ tầng lá liên kết kép.
  > - **Page I/O Reduction**: Giảm từ hàng nghìn I/O đĩa xuống còn $3-5$ Page I/O; tỷ lệ Buffer Hit Ratio tăng lên > 99%.
  > - **Latency**: Giảm p99 query latency từ 2,500ms xuống < 10ms.

- **How to Verify**:
  > 1. Chạy test suite native `npm run test:w3-02` (hoặc `node architecture/week-03/02-btree-index-simulation.test.js`) kiểm thử 6 kịch bản định lượng Page I/O.
  > 2. Chạy regression test toàn repo `npm test` bảo đảm 100% test cases pass.
  > 3. Mở visualizer `docs/visualizers/w3-02-btree-index.html` kiểm tra trực quan hành vi duyệt cây và cơ chế Bookmark Lookup vs Index-Only Scan.

---

## 3. Affected Files

| File | Action | Purpose |
|---|:---:|---|
| `architecture/week-03/02-btree-index-simulation.test.js` | CREATE | Bộ kiểm thử unit test native assert (6 test cases đo đếm Page I/O và xác thực logic B+Tree, test-first). |
| `architecture/week-03/02-btree-index-simulation.js` | CREATE | Mô phỏng cấu trúc B+Tree Storage Engine (Page, InternalNode, LeafNode, Clustered, Secondary Index, Covering Index). |
| `notes/week-03/day-02-btree-indexing.md` | CREATE | Cẩm nang lý thuyết toàn diện: Cấu trúc B+Tree, Clustered vs Non-Clustered, Covering Index, giải mã `EXPLAIN (ANALYZE, BUFFERS)`, kịch bản tiếng Anh 6 bước. |
| `docs/visualizers/w3-02-btree-index.html` | CREATE | Generative UI: Widget tương tác trực quan mô phỏng cây B+Tree và so sánh I/O (Index Scan vs Index-Only Scan) với Dark Theme. |
| `package.json` | MODIFY | Thêm script `test:w3-02` và tích hợp vào chuỗi kiểm thử hồi quy `npm test`. |
| `README.md` | MODIFY | Cập nhật dashboard tiến độ Tuần 3 Day 2. |
| `docs/plans/week-03-day-02-btree-indexing.md` | CREATE | Bản kế hoạch kỹ thuật chuẩn theo PLAN_STANDARD. |
| `docs/plans/_ACTIVE.md` | MODIFY | Đăng ký kế hoạch Day 2 vào bảng trạng thái `In Processing` / `Open`. |
| `docs/AGENT_STATE.md` | MODIFY | Cập nhật trạng thái handoff và ledger phiên làm việc. |

---

## 4. Implementation Checklist
*(Tuân thủ nghiêm ngặt nguyên tắc Test-First: Test cases được viết trước khi hiện thực mã nguồn)*

- [ ] `architecture/week-03/02-btree-index-simulation.test.js`: TC-01 – Point Lookup: Tìm kiếm chính xác bản ghi theo khóa chính trong $O(\log_M N)$ với số lần đọc trang $\le h$.
- [ ] `architecture/week-03/02-btree-index-simulation.test.js`: TC-02 – Range Query: Duyệt qua tầng lá liên kết kép (Doubly Linked List) lấy chính xác các bản ghi trong khoảng `[from, to]` mà không phải quay lại duyệt từ Root.
- [ ] `architecture/week-03/02-btree-index-simulation.test.js`: TC-03 – Đo lường chi phí Sequential Table Scan: Quét toàn bộ Heap Pages khi không có index ($O(N)$ pages I/O).
- [ ] `architecture/week-03/02-btree-index-simulation.test.js`: TC-04 – Đo lường chi phí Secondary Index Scan + Bookmark Lookup: Đọc qua B+Tree Index Pages cộng thêm $K$ lần Random I/O truy cập Heap Pages để lấy dữ liệu ngoài index.
- [ ] `architecture/week-03/02-btree-index-simulation.test.js`: TC-05 – Đo lường chi phí Covering Index (Index-Only Scan): Bỏ qua 100% Heap Fetches (Heap I/O = 0), chỉ đọc Index Pages để hoàn tất truy vấn.
- [ ] `architecture/week-03/02-btree-index-simulation.test.js`: TC-06 – Benchmark hiệu năng và so sánh tỷ lệ suy giảm I/O (Covering Index tiết kiệm ít nhất 80% Page Reads so với Secondary Index có Bookmark Lookup trên tập 10,000 bản ghi).
- [ ] `architecture/week-03/02-btree-index-simulation.js`: Hiện thực lớp `BPlusTreeNode`, `BPlusTreeLeafNode`, `BPlusTreeEngine`, và hàm mô phỏng `explainQueryCost()` (Seq Scan vs Index Scan vs Index Only Scan).
- [ ] `notes/week-03/day-02-btree-indexing.md`: Soạn thảo tài liệu lý thuyết chuyên sâu:
  - Bản chất B+Tree vs B-Tree, công thức tính Fanout và chiều cao cây ($h = \lceil \log_{\text{fanout}} N \rceil$).
  - Tổ chức vật lý: Clustered Index (InnoDB B-Tree Clustered / PostgreSQL Heap + Index) vs Non-Clustered.
  - Kỹ thuật Covering Index bằng `INCLUDE` clause trong PostgreSQL 11+.
  - Giải mã kế hoạch thực thi `EXPLAIN (ANALYZE, BUFFERS)`: Nhận diện node scan và buffer hit.
  - Kịch bản đàm thoại kỹ thuật tiếng Anh chuẩn Senior cho vòng phỏng vấn ANZ Data Platform.
- [ ] `docs/visualizers/w3-02-btree-index.html`: Xây dựng Generative UI Stepper Dark Theme trực quan hóa cây B+Tree và so sánh I/O.
- [ ] `package.json`: Bổ sung script `test:w3-02` vào `package.json` và liên kết vào `npm test`.
- [ ] `README.md`: Cập nhật checklist Tuần 3 Day 2 trong dashboard.

---

## 5. Out of Scope

- Không giải bất kỳ bài toán LeetCode nào trong buổi này để tuân thủ triệt để [Weekly Curriculum Balance & Anti-Burnout Protocol](file:///home/samnguyen/projects/training-anz/.agents/rules/curriculum-balance.md).
- Không cài đặt database driver bên ngoài (như `pg`, `mysql2`) hoặc cơ sở dữ liệu thật; toàn bộ mô hình đo đếm I/O được mô phỏng bằng Node.js thuần (Pure Native JavaScript).
- Không mở rộng sang các loại index khác (GIN, GiST, BRIN, Hash Index) để giữ trọn vẹn kỷ luật 60 phút sáng sớm tập trung sâu vào B+Tree.

---

## 6. Data Model / Architecture Changes

### Cấu trúc B+Tree & Cơ chế Lưu Trữ Trang (Page-Based Storage)

```
                            [ Root Page (Level 2) ]
                                [ 100 | 200 ]
                                /     |     \
          ---------------------       |      ---------------------
         /                            |                           \
   [ Internal Page (L1) ]   [ Internal Page (L1) ]   [ Internal Page (L1) ]
       [ 30 | 70 ]               [ 130 | 170 ]            [ 230 | 270 ]
      /     |     \             /     |     \            /     |     \
   [Leaf] [Leaf] [Leaf] <===> [Leaf] [Leaf] [Leaf] <===> [Leaf] [Leaf] [Leaf]
   (P0)   (P1)   (P2)         (P3)   (P4)   (P5)         (P6)   (P7)   (P8)
      <-- Doubly Linked List for Range Scans (prev / next pointers) -->
```

- **Internal Node**: Chỉ lưu `keys` và `pointers` tới các node cấp dưới. Tuyệt đối không lưu dữ liệu dòng (Row Payload). Điều này giúp tối đa hóa **Fanout** (số lượng nhánh con trên một trang 8KB/16KB), giữ cho chiều cao cây cực thấp ($h \le 3-4$).
- **Leaf Node**: Lưu trữ toàn bộ `keys` và con trỏ trỏ tới dữ liệu thực tế (`Row Pointer` / `ctid`). Các Leaf Node được liên kết với nhau bằng con trỏ 2 chiều (`prev` và `next`), cho phép thực thi các câu lệnh Range Query (`BETWEEN $1 AND $2`) bằng một đường quét ngang tuần tự mà không bao giờ phải quay ngược lại duyệt từ Root.
- **Covering Index (`INCLUDE`)**: Các cột bổ trợ (ví dụ `amount`, `status`) được lưu trữ trực tiếp ngay tại Leaf Node của Index. Khi câu truy vấn chỉ yêu cầu các cột này, Database Engine thực hiện **Index-Only Scan**, trả về kết quả ngay lập tức mà không cần tốn một phép Random I/O nào vào Table Heap.

---

## 7. Edge Cases & Error Handling

| Kịch bản | Dữ liệu đầu vào | Hành vi xử lý mong muốn |
|---|---|---|
| Query ngoài phạm vi dữ liệu | `key < min` hoặc `key > max` | Duyệt tới Leaf Node đầu/cuối và trả về kết quả rỗng `[]` sau $\le h$ bước I/O |
| Khóa tìm kiếm không tồn tại | `key` lẻ trong dãy chẵn | Trả về `null`, tiêu tốn đúng $\le h$ Index Page I/O |
| Khoảng tìm kiếm rỗng | `[to < from]` | Guard Clause trả về `[]` trong $O(1)$ không thực hiện I/O |
| Bảng có 0 bản ghi (Empty Table) | B+Tree rỗng | Root là Leaf rỗng, trả về `[]` với Page I/O = 0 |

---

## 8. Git Info

```text
Branch:               db/week-03-day-02-btree-indexing
Target Branch:        main
Commit message:       db(index): implement b-plus tree simulation and covering index architecture (close #35)
GitHub PR Labels:     system-design, documentation
```
