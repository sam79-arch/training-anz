# Kế Hoạch Triển Khai: Tuần 4 — Day 2 (Database Connection Pooling) & Day 3 (Min Stack)

> **Status:** `Closed`  
> **Task Type:** `DBMS Execution` (Day 2) & `New Request` (Day 3)  
> **Target Branch:** `feat/week-04-day-02-and-day-03`  
> **Scope:** Triển khai trọn gói Day 2 (Database Connection Pooling trong Node.js - Issue #47) và Day 3 (Min Stack Two Parallel Stacks - Issue #48).

---

## 1. Objective & Metadata

- **Task Type**: `DBMS Execution` (Day 2) & `New Request` (Day 3).
- **Status**: `Closed`
- **Target Branch**: `feat/week-04-day-02-and-day-03`
- **Issues Liên Quan**: 
  - Closes [#47](https://github.com/sam79-arch/training-anz/issues/47): `[Week 4 - Day 2 / Thứ 3] Database Architecture: Connection Pooling trong Node.js`
  - Closes [#48](https://github.com/sam79-arch/training-anz/issues/48): `[Week 4 - Day 3 / Thứ 4] DSA: Min Stack (Two Parallel Stacks O(1) getMin)`
- **Vấn đề đã giải quyết**:
  1. **Day 2 (Thứ 3 - Database Connection Pooling)**: Xây dựng cơ chế Connection Pooling chuẩn kiến trúc Node.js (`pg-pool` / HikariCP principles). Giải quyết bài toán thắt cổ chai kết nối (Connection Storm, OOM do `fork()` backend process ~10MB RAM, OS context switching, buffer lock contention) trong hệ thống ngân hàng bằng hàng đợi FIFO, cơ chế Acquire Timeout, và Connection Leak Detection.
  2. **Day 3 (Thứ 4 - Min Stack - LeetCode #155)**: Hiện thực cấu trúc dữ liệu Ngăn xếp hỗ trợ `push`, `pop`, `top`, và truy xuất phần tử nhỏ nhất `getMin` trong thời gian $O(1)$ nghiêm ngặt. Áp dụng kỹ thuật Hai Ngăn Xếp Song Song (Two Parallel Stacks) để xử lý triệt để bẫy trùng lặp giá trị min (`val <= currentMin`) và số âm.

---

## 2. 📌 Executive & Business Summary

| Hạng mục | Nội dung |
|---|---|
| **Business Title** | Database Connection Pooling trong Node.js & Min Stack Audit Streaming |
| **Why** | Chống sập hệ thống do Connection Storm / Connection Leak và tối ưu truy vấn kiểm toán số dư nhỏ nhất trong $O(1)$. |
| **What** | Hiện thực `ConnectionPool` thuần Node.js (FIFO Queue, Acquire Timeout, Leak Alarm) và `MinStack` (Two Parallel Stacks). |
| **Impact** | 100 concurrent banking transactions qua pool 5 connections chạy trong 46.35ms với 0 leak; 50,000 stack operations chạy trong 9.73ms với $O(1)$ getMin. |
| **How to Verify** | `npm run test:w4-02` (9/9 pass), `npm run test:w4-03` (8/8 pass), và `npm test` toàn hệ thống (18/18 test suites pass 100%). |

---

## 3. Affected Files

| File | Action | Purpose |
|---|---|---|
| `architecture/week-04/02-connection-pooling.js` | CREATE | ConnectionPool engine thuần Node.js (EventEmitter, FIFO Queue, Timeout, Leak Detection) |
| `architecture/week-04/02-connection-pooling.test.js` | CREATE | Test suite native `assert` kiểm chứng 9 kịch bản connection pooling |
| `architecture/week-04/02-connection-pooling.md` | CREATE | Cẩm nang kiến trúc `pg-pool`/HikariCP, công thức sizing math, kịch bản tiếng Anh |
| `coding/week-04/02-min-stack.js` | CREATE | Giải thuật Min Stack Two Parallel Stacks với `getMin()` trong $O(1)$ |
| `coding/week-04/02-min-stack.test.js` | CREATE | Test suite native `assert` kiểm chứng 8 kịch bản min stack |
| `coding/week-04/02-min-stack.md` | CREATE | Cẩm nang 3-file tinh gọn: 6 bước tiếng Anh, bẫy trùng lặp min |
| `package.json` | MODIFY | Bổ sung scripts `test:w4-02`, `test:w4-03` và cập nhật `test` / `test:all` |
| `README.md` | MODIFY | Cập nhật tiến độ Tuần 4 Day 2 & Day 3 trên Progress Dashboard |
| `docs/plans/week-04-day-02-and-day-03.md` | CREATE | File kế hoạch này |
| `docs/plans/_ACTIVE.md` | MODIFY | Đăng ký plan vào registry |
| `docs/AGENT_STATE.md` | MODIFY | Cập nhật trạng thái handoff |

---

## 4. Implementation Checklist

- [x] Part 1: Day 2 (Thứ 3) — Database Connection Pooling trong Node.js (Issue #47)
  - [x] TC-01: Khởi tạo Pool và warm-up min connections.
  - [x] TC-02: Tái sử dụng kết nối (Reuse idle connection without allocating new ones).
  - [x] TC-03: Thực thi giới hạn max và đưa yêu cầu vào hàng đợi FIFO.
  - [x] TC-04: Dispatch theo thứ tự yêu cầu đến trước (Strict FIFO).
  - [x] TC-05: Connection Acquisition Timeout (`connectionTimeoutMillis`).
  - [x] TC-06: Phát hiện rò rỉ kết nối (`leakDetectionThreshold`) kèm diagnostic stack trace.
  - [x] TC-07: Hàm tiện ích `query(sql, params)` bảo đảm an toàn với khối `finally`.
  - [x] TC-08: High-Concurrency Banking Benchmark (100 txs over 5 conns in 46.35ms, 0 leak, bảo toàn số dư).
  - [x] TC-09: Graceful Shutdown qua `drain()`.
  - [x] Hiện thực `architecture/week-04/02-connection-pooling.js`.
  - [x] Soạn cẩm nang `architecture/week-04/02-connection-pooling.md`.
- [x] Part 2: Day 3 (Thứ 4) — DSA: Min Stack (LeetCode #155 - Medium) (Issue #48)
  - [x] TC-01: Guard clause & Empty stack behavior.
  - [x] TC-02: Chuỗi thao tác chuẩn LeetCode (`push(-2), push(0), push(-3), getMin()=-3, pop(), top()=0, getMin()=-2`).
  - [x] TC-03: Bẫy trùng lặp phần tử nhỏ nhất (Critical Duplicate Min Trap).
  - [x] TC-04: Danh sách toàn số âm và số đối.
  - [x] TC-05: Đơn điệu tăng dần.
  - [x] TC-06: Đơn điệu giảm dần.
  - [x] TC-07: Invariant check ($O(1)$ lookups & size tracking).
  - [x] TC-08: Stress test hiệu năng: 50,000 thao tác ngẫu nhiên trong 9.73ms (< 20ms).
  - [x] Hiện thực `coding/week-04/02-min-stack.js`.
  - [x] Soạn cẩm nang `coding/week-04/02-min-stack.md`.
- [x] Part 3: Cấu hình Hệ thống & Regression Testing
  - [x] `package.json`: Thêm script `test:w4-02` và `test:w4-03`, gắn vào lệnh `test` tổng hợp.
  - [x] `README.md`: Cập nhật tiến độ Tuần 4 Day 2 & Day 3 trên Progress Dashboard.
  - [x] `docs/plans/week-04-day-02-and-day-03.md`: Lưu trữ file kế hoạch.
  - [x] `docs/plans/_ACTIVE.md`: Đăng ký plan vào registry.
  - [x] `docs/AGENT_STATE.md`: Cập nhật trạng thái handoff.
  - [x] Chạy `npm test` toàn hệ thống xác nhận 18/18 test suites pass 100% (140/140 tests).

---

## 5. Test Results

- `node architecture/week-04/02-connection-pooling.test.js`: 9/9 tests pass trong ~180ms.
- `node coding/week-04/02-min-stack.test.js`: 8/8 tests pass trong ~35ms.
- `npm test`: 18/18 test suites pass 100% (140/140 tests pass).

