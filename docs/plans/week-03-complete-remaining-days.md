# Kế Hoạch Hoàn Tất Toàn Bộ Các Ngày Còn Thiếu Của Tuần 3

> **Status:** `In Processing`  
> **Task Type:** `New Request` / `DBMS Execution` / `Documentation` (Gộp đợt cuối Tuần 3)  
> **Branch:** `feat/week-03-complete-remaining-days`  
> **Scope:** Khép lại 100% Tuần 3 gồm Day 4 (Database Concurrency), Day 5 (Linked List Cycle), và Day 6 (STAR Story 3 & Retrospective).

---

## 1. Objective

### Vấn đề cần giải quyết
Hoàn thiện toàn bộ nội dung học tập và bộ test kiểm thử cho 3 ngày còn lại của Tuần 3 trong 1 lần duy nhất theo yêu cầu của User:
1. **Day 4 (Thứ 5 - Database Concurrency)**: Nghiên cứu chuyên sâu 4 cấp độ cô lập ACID, các hiện tượng dị thường (Dirty, Non-repeatable, Phantom Read), cơ chế MVCC snapshot, và đối chiếu thực nghiệm Pessimistic Locking (`SELECT FOR UPDATE`) vs Optimistic Locking (`version`).
2. **Day 5 (Thứ 6 - Linked List Cycle & Friday Recall)**: Hiện thực thuật toán Con trỏ Rùa & Thỏ (Floyd's Tortoise & Hare) $O(n)$ time, $O(1)$ space, zero-mutation; tích hợp khung Spaced Repetition Friday Recall 15m; xây dựng Generative UI Visualizer tương tác.
3. **Day 6 (Thứ 7 - Behavioral & Retrospective)**: Soạn kịch bản STAR Story 3 (Đàm phán phạm vi với PO dưới áp lực tiến độ: Tight Deadline vs Tech Debt) và Báo cáo tổng kết Tuần 3 (Scorecard Milestone 2).

---

## 2. Executive & Business Summary

| Hạng mục | Nội dung |
|---|---|
| **Business Title** | Hoàn tất gói học tập & kiểm thử Tuần 3 (Database Concurrency, Floyd's Cycle DSA, STAR Story 3) |
| **Why** | Giúp candidate có sẵn 100% tài liệu, mã nguồn và bài test của Tuần 3 để chủ động tự học và luyện tập mà không bị ngắt quãng giữa các phiên làm việc. |
| **What** | Hiện thực 3 module: (1) Concurrency Simulation Engine (ACID & Locking), (2) Floyd's Cycle Solution + Test Suite + Generative UI Stepper, (3) STAR Story 3 & Retrospective. Cập nhật `package.json` và `README.md`. |
| **Impact** | Cung cấp bài học thực chiến sát 100% với yêu cầu phỏng vấn Data Platform của ANZ Bank (ACID, Locks, In-place $O(1)$ DSA, Behavioral). |
| **How to Verify** | Chạy `npm test` với toàn bộ 15 test suites hệ thống (115/115 test cases PASS 100%). |

---

## 3. Affected Files

| File Path | Action | Purpose |
|---|---|---|
| `architecture/week-03/04-acid-concurrency.js` | NEW | Concurrency Engine mô phỏng Transaction, MVCC snapshot, 4 Isolation Levels, Pessimistic & Optimistic Locking |
| `architecture/week-03/04-acid-concurrency.test.js` | NEW | Test suite native `assert` kiểm chứng 3 hiện tượng dị thường (Dirty, Non-repeatable, Phantom Read) và so sánh 2 cơ chế Lock |
| `architecture/week-03/04-acid-concurrency.md` | NEW | Cẩm nang PBL Day 4: 6 bước đối thoại tiếng Anh, cơ chế MVCC trong PostgreSQL/MySQL, bảng ma trận Locking |
| `coding/week-03/03-linked-list-cycle.js` | NEW | Giải thuật Floyd's Tortoise & Hare $O(n)$ time / $O(1)$ space, zero-mutation |
| `coding/week-03/03-linked-list-cycle.test.js` | NEW | Test suite native `assert` kiểm chứng cycle detection (không chu trình, tự lặp, chu trình lớn 20k nodes) |
| `coding/week-03/03-linked-list-cycle.md` | NEW | Cẩm nang PBL Day 5: Kịch bản tiếng Anh 6 bước, chứng minh toán học con trỏ rùa & thỏ, quy trình Friday Recall |
| `docs/visualizers/w3-05-linked-list-cycle.html` | NEW | Generative UI Visualizer tương tác (Dark Mode Stepper) mô phỏng cuộc đua Rùa & Thỏ phát hiện chu trình |
| `notes/week-03/day-06-star-and-retrospective.md` | NEW | Kịch bản STAR Story 3 (Tight Deadline vs Tech Debt) + Báo cáo tổng kết tuần 3 Scorecard |
| `package.json` | MODIFY | Bổ sung scripts: `test:w3-04`, `test:w3-05` và cập nhật lệnh `test` tổng hợp |
| `README.md` | MODIFY | Đánh dấu hoàn thành toàn bộ Tuần 3 trên Progress Dashboard |
| `docs/plans/week-03-complete-remaining-days.md` | NEW | Lưu trữ bản kế hoạch hoàn tất Tuần 3 |
| `docs/plans/_ACTIVE.md` | MODIFY | Đăng ký plan hoàn tất Tuần 3 |
| `docs/AGENT_STATE.md` | MODIFY | Cập nhật trạng thái handoff |

---

## 4. Implementation Checklist

### Part 1: Day 4 (Thứ 5) — Database Concurrency: ACID Isolation Levels & Locking
- [x] 1.1. **Test-First**: Viết `architecture/week-03/04-acid-concurrency.test.js`:
  - TC-01: Dirty Read trong `READ_UNCOMMITTED` vs Ngăn chặn trong `READ_COMMITTED`.
  - TC-02: Non-repeatable Read trong `READ_COMMITTED` vs Tính nhất quán Snapshot trong `REPEATABLE_READ`.
  - TC-03: Phantom Read detection trong `REPEATABLE_READ` vs Ngăn chặn triệt để trong `SERIALIZABLE`.
  - TC-04: Pessimistic Locking (`SELECT FOR UPDATE`) ngăn chặn lost update và đảm bảo thứ tự thực thi.
  - TC-05: Optimistic Locking phát hiện xung đột version và từ chối ghi đè (`Abort & Retry`).
  - TC-06: Concurrency Benchmark: 50 concurrent transfers kiểm tra số dư tài khoản ngân hàng.
- [x] 1.2. **Code**: Hiện thực `architecture/week-03/04-acid-concurrency.js`:
  - `class InMemoryDB`: Bảng accounts có `balance`, `version`, lock registry.
  - `class Transaction`: Quản lý `txId`, `isolationLevel`, `snapshot`, `activeLocks`.
  - Hàm `read(key)`, `write(key, value)`, `commit()`, `rollback()`.
  - Hàm `selectForUpdate(key)` (Pessimistic) và `updateWithVersion(key, newBalance, expectedVersion)` (Optimistic).
- [x] 1.3. **Docs**: Soạn `architecture/week-03/04-acid-concurrency.md`:
  - Khung PBL 6 bước tiếng Anh đối thoại kỹ thuật với Senior Interviewer ANZ.
  - So sánh chi tiết MVCC PostgreSQL (`xmin`, `xmax`) vs MySQL InnoDB (Undo Log, Read View).
  - Bảng ma trận so sánh trade-off Pessimistic vs Optimistic Locking trong hệ thống Core Banking.

### Part 2: Day 5 (Thứ 6) — Linked List Cycle & Friday Recall
- [x] 2.1. **Test-First**: Viết `coding/week-03/03-linked-list-cycle.test.js`:
  - TC-01: Guard clauses & input không hợp lệ (`null`, `undefined`, single node không lặp).
  - TC-02: Single node tự trỏ vào chính nó (`head.next = head`).
  - TC-03: Hai node tạo chu trình khép kín (`1 -> 2 -> 1`).
  - TC-04: Chu trình LeetCode tiêu chuẩn (`[3, 2, 0, -4]`, đuôi trỏ vào node vị trí 1).
  - TC-05: Danh sách tuyến tính dài 1,000 nodes không có chu trình (trả về `false`).
  - TC-06: Danh sách lớn 20,000 nodes có chu trình ở 5,000 nodes cuối (chạy < 5ms).
  - TC-07: Invariant check: Đảm bảo không thay đổi giá trị hoặc thuộc tính của node đầu vào ($O(1)$ space).
- [x] 2.2. **Code**: Hiện thực `coding/week-03/03-linked-list-cycle.js`:
  - Hàm `hasCycle(head)` áp dụng Floyd's Tortoise and Hare (con trỏ `slow` bước 1, `fast` bước 2).
  - Guard clause tại Dòng 1: `if (!head || typeof head !== 'object' || !head.next) return false;`.
  - Time Complexity: $O(n)$, Auxiliary Space Complexity: $O(1)$.
- [x] 2.3. **Docs**: Soạn `coding/week-03/03-linked-list-cycle.md`:
  - Cẩm nang 6 bước tiếng Anh chuẩn ANZ.
  - Chứng minh toán học bước gặp nhau của con trỏ: Khoảng cách thu hẹp mỗi bước là 1 node.
  - Hướng dẫn thực hành Spaced Repetition Friday Recall 15m.
- [x] 2.4. **Visualizer**: Xây dựng `docs/visualizers/w3-05-linked-list-cycle.html`:
  - Giao diện Dark Mode tương tác với Stepper State Machine mô phỏng 2 con trỏ rùa & thỏ chạy trong chu trình.

### Part 3: Day 6 (Thứ 7) — STAR Story 3 & Week 3 Retrospective
- [x] 3.1. Soạn `notes/week-03/day-06-star-and-retrospective.md`:
  - **STAR Story 3**: Đàm phán phạm vi với Product Owner dưới áp lực tiến độ (Tight Deadline vs Tech Debt trong hệ thống Core Banking Settlement).
  - Kịch bản tiếng Anh 4 phần (Situation, Task, Action, Result) và 3 câu hỏi đào sâu (Follow-up Questions).
  - **Week 3 Retrospective**: Bảng điểm Scorecard toàn bộ Tuần 3, tổng kết số lượng unit tests trong repo, heap profile và bài học chuyển tiếp sang Tuần 4 (Database Connection Pooling & Min Stack).

### Part 4: Cấu hình & Tích hợp Regression
- [x] 4.1. Cập nhật `package.json` với script `test:w3-04`, `test:w3-05` và nối vào lệnh `test`.
- [x] 4.2. Cập nhật `README.md` (đánh dấu hoàn tất toàn bộ Tuần 3 với 6/6 ngày hoàn thành).
- [x] 4.3. Kiểm thử hồi quy toàn hệ thống: Chạy `npm test` xác nhận 100% tests pass (115/115 test cases).

---

## 5. Test Plan & Benchmark Results
- Day 4 Concurrency: 6/6 tests pass (Dirty Read, Non-repeatable Read, Phantom Read, Pessimistic lock, Optimistic lock, 50 concurrent transfers).
- Day 5 Floyd Cycle: 7/7 tests pass (Stress test 20,000 nodes trong 0.99ms).
- Regression: 15/15 test suites pass 100% trong 350ms.

---

## 6. Git Proposal
- **Branch:** `feat/week-03-complete-remaining-days`
- **Commit Message:** `feat(week-03): complete remaining curriculum for week 3 — db concurrency, floyd cycle, and star story 3`
