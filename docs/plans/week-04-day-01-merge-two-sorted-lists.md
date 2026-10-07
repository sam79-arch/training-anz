# Kế Hoạch Triển Khai: Tuần 4 — Day 1: Merge Two Sorted Lists (LeetCode #21)

> **Status:** `Closed`  
> **Task Type:** `New Request`  
> **Target Branch:** `feat/week-04-day-01-merge-two-sorted-lists`  
> **Scope:** Khởi động Tuần 4 Day 1 (Thứ 2) với thuật toán Linked List Splicing bằng Dummy Head Node.

---

## 1. Objective & Metadata

- **Task Type**: `New Request`
- **Status**: `Closed`
- **Target Branch**: `feat/week-04-day-01-merge-two-sorted-lists`
- **Vấn đề cần giải quyết**:
  - Hợp nhất hai danh sách liên kết đơn đã được sắp xếp thành một danh sách duy nhất theo thứ tự tăng dần.
  - Sử dụng kỹ thuật Dummy Head Node (`dummy = new ListNode(0)`) kết hợp duyệt hai con trỏ in-place, đạt $O(n+m)$ thời gian và $O(1)$ không gian phụ.
  - Tránh đệ quy gây tràn Call Stack (`RangeError`) và tránh tạo mảng phụ tốn bộ nhớ.

---

## 2. 📌 Executive & Business Summary

| Hạng mục | Nội dung |
|---|---|
| **Business Title** | Hợp nhất 2 luồng dữ liệu giao dịch đã sắp xếp (Merge Two Sorted Lists) |
| **Why** | Tránh sao chép dữ liệu làm tăng tải Garbage Collector và phòng ngừa tràn Call Stack khi danh sách vượt quá 10,000 nodes. |
| **What** | Dùng Dummy Head Node neo giữ đầu danh sách, so sánh và nối trực tiếp con trỏ `tail.next` vào node nhỏ hơn, sau đó nối phần còn lại trong $O(1)$. |
| **Impact** | Time Complexity $O(n+m)$, Auxiliary Space Complexity $O(1)$. Xử lý 50,000 nodes trong 1.17ms. |
| **How to Verify** | Chạy `npm run test:w4-01` (8/8 test cases pass) và `npm test` (16/16 test suites pass 100%). |

---

## 3. Affected Files

| File | Action | Purpose |
|---|---|---|
| `coding/week-04/01-merge-two-sorted-lists.test.js` | CREATE | Test suite native `assert` kiểm chứng 8 kịch bản (test-first) |
| `coding/week-04/01-merge-two-sorted-lists.js` | CREATE | Giải thuật in-place Dummy Head Node $O(n+m)$ time, $O(1)$ space |
| `coding/week-04/01-merge-two-sorted-lists.md` | CREATE | Cẩm nang 3-file tinh gọn: 6 bước tiếng Anh, phân tích con trỏ in-place |
| `package.json` | MODIFY | Bổ sung script `test:w4-01` và gắn vào `test` / `test:all` |
| `README.md` | MODIFY | Cập nhật tiến độ Tuần 4 Day 1 trên Progress Dashboard |
| `docs/plans/week-04-day-01-merge-two-sorted-lists.md` | CREATE | File kế hoạch này |
| `docs/plans/_ACTIVE.md` | MODIFY | Cập nhật registry active plans |
| `docs/AGENT_STATE.md` | MODIFY | Cập nhật trạng thái handoff |

---

## 4. Implementation Checklist

- [x] `coding/week-04/01-merge-two-sorted-lists.test.js`: Viết bộ kiểm thử Test-First (8 test cases):
  - [x] TC-01: Guard clauses & Invalid / Empty inputs (`null`, `undefined`, single list empty).
  - [x] TC-02: Hai danh sách có cùng độ dài, giá trị xen kẽ (`[1, 3, 5]` và `[2, 4, 6]`).
  - [x] TC-03: Hai danh sách chứa giá trị trùng lặp nhau (`[1, 2, 4]` và `[1, 3, 4]`).
  - [x] TC-04: Một danh sách có tất cả giá trị nhỏ hơn danh sách kia (`[1, 2, 3]` và `[7, 8, 9]`).
  - [x] TC-05: Độ dài danh sách lệch lớn (List 1 có 1 node, List 2 có 1,000 nodes).
  - [x] TC-06: Danh sách chứa số âm và số 0 (`[-10, -5, 0]` và `[-7, 2, 3]`).
  - [x] TC-07: In-place Node Identity Invariant: Đảm bảo các node trong kết quả giữ nguyên tham chiếu gốc ($O(1)$ space).
  - [x] TC-08: Stress test hiệu năng: Ghép 2 danh sách 25,000 nodes (Tổng 50,000 nodes) trong 1.17ms (< 15ms target).
- [x] `coding/week-04/01-merge-two-sorted-lists.js`: Hiện thực giải thuật chuẩn Node.js:
  - [x] Khai báo `ListNode(val, next)`.
  - [x] Hàm `mergeTwoLists(list1, list2)` với Guard Clause ở dòng 1: `if (!list1) return list2 || null; if (!list2) return list1;`.
  - [x] Khởi tạo `dummy = new ListNode(0)` và con trỏ `tail = dummy`.
  - [x] Vòng lặp `while (p1 !== null && p2 !== null)` so sánh giá trị và nối liên kết in-place.
  - [x] Nối chuỗi còn lại: `tail.next = p1 !== null ? p1 : p2;`.
  - [x] Trả về `dummy.next` đạt $O(n+m)$ time, $O(1)$ auxiliary space.
- [x] `coding/week-04/01-merge-two-sorted-lists.md`: Soạn cẩm nang tích hợp 6 bước tiếng Anh chuẩn ANZ.
- [x] `package.json`: Thêm script `test:w4-01`, gắn vào lệnh `test` tổng hợp.
- [x] `README.md`: Đánh dấu hoàn thành Tuần 4 Day 1 trên Progress Dashboard.
- [x] `docs/plans/week-04-day-01-merge-two-sorted-lists.md`: Lưu trữ file kế hoạch.
- [x] `docs/plans/_ACTIVE.md`: Cập nhật registry sang `Closed`.
- [x] `docs/AGENT_STATE.md`: Cập nhật trạng thái handoff.
- [x] Chạy `npm test` toàn hệ thống xác nhận 16/16 test suites pass 100%.

---

## 5. Test Results

- `node coding/week-04/01-merge-two-sorted-lists.test.js`: 8/8 tests pass trong 3.05ms (Stress test 50k nodes pass trong 1.17ms).
- `npm test`: 16/16 test suites pass 100% (123/123 tests pass).

