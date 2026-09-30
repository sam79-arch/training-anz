# Implementation Plan: Reverse Linked List (LeetCode #206 - Easy)

## 1. Objective & Metadata
Hiện thực giải thuật đảo ngược danh sách liên kết đơn (Singly Linked List) bằng kỹ thuật 3 con trỏ trượt in-place (`prev`, `curr`, `next`) với JavaScript thuần (Node.js Native, Zero External Dependencies). Bài toán mô phỏng kịch bản đảo ngược chuỗi nhật ký kiểm toán giao dịch tài chính (Banking Audit Trail & Transaction Ledger Replay) nhằm phục vụ báo cáo đối soát đảo ngược thứ tự thời gian (Reverse Chronological Reconciliation) trong hệ thống Data Platform ngân hàng ANZ mà không tiêu tốn thêm bộ nhớ đệm hay gây tràn V8 Call Stack.

- **Task Type**: `New Request`
- **Status**: `In Processing`
- **Issue**: [#36](https://github.com/sam79-arch/training-anz/issues/36)
- **Milestone**: [Milestone #6 (Week 3: Stack, Linked List & Database Deep Dive)](https://github.com/sam79-arch/training-anz/milestone/6)
- **Target Branch**: `main`

---

## 2. 📌 Executive & Business Summary (Tóm tắt Nghiệp vụ / Bài toán)

- **Business / Problem Title**:
  > Đảo ngược thứ tự chuỗi nhật ký giao dịch ngân hàng (Banking Audit Trail Reversal) bằng kỹ thuật 3 con trỏ In-place trên Danh sách liên kết đơn (Singly Linked List).

- **Why / Problem Statement**:
  > Trong các hệ thống sổ cái ngân hàng (Transaction Ledger), các sự kiện kiểm toán thường được liên kết theo danh sách đơn theo thứ tự phát sinh (chronological order: A -> B -> C -> D). Khi kiểm toán viên yêu cầu xuất báo cáo đối soát theo thứ tự mới nhất trước (reverse chronological order: D -> C -> B -> A) hoặc khi kích hoạt quy trình bù trừ hoàn tác giao dịch (Compensating Transaction Replay), hệ thống cần đảo ngược chuỗi liên kết. Nếu sao chép toàn bộ sang mảng mới rồi tạo lại node, hệ thống sẽ gánh chịu chi phí cấp phát bộ nhớ (GC allocation churn) và phân mảnh bộ nhớ V8. Nếu dùng đệ quy (recursion), khi danh sách có hàng chục nghìn giao dịch, V8 sẽ văng ngoại lệ `RangeError: Maximum call stack size exceeded`. Cần một giải thuật duyệt tuyến tính vòng lặp $O(n)$ với bộ nhớ phụ $O(1)$ tuyệt đối an toàn.

- **What / Solution**:
  > 1. Thiết lập **Guard Clause tại dòng 1**: Kiểm tra nếu `!head || !head.next` (danh sách rỗng hoặc chỉ có 1 node duy nhất), lập tức trả về `head` mà không cần xử lý con trỏ.
  > 2. Sử dụng kỹ thuật **3 con trỏ chạy trượt (Sliding 3-Pointer Pattern)**:
  >    - `prev`: Khởi tạo bằng `null` (sẽ trở thành `head` mới của danh sách đảo ngược).
  >    - `curr`: Bắt đầu từ `head` (node hiện thời đang được xử lý).
  >    - `next`: Biến tạm lưu địa chỉ node kế tiếp (`curr.next`) trước khi phá vỡ liên kết.
  > 3. Trong vòng lặp `while (curr !== null)`:
  >    - Lưu node sau: `next = curr.next`
  >    - Đảo ngược liên kết: `curr.next = prev`
  >    - Tịnh tiến con trỏ `prev`: `prev = curr`
  >    - Tịnh tiến con trỏ `curr`: `curr = next`
  > 4. Khi `curr === null`, kết thúc vòng lặp và trả về `prev` (đỉnh danh sách mới).
  > 5. Cung cấp các helper `ListNode`, `arrayToList`, và `listToArray` phục vụ kiểm thử và debug.

- **Impact & Expected Performance**:
  > - **Time Complexity**: $O(n)$ với 1 lần duyệt tuyến tính duy nhất qua $n$ phần tử của danh sách.
  > - **Space Complexity**: $O(1)$ auxiliary space tuyệt đối vì tái sử dụng trực tiếp các node hiện có (in-place mutation), không cấp phát node mới.
  > - **Call Stack Safety**: Giải thuật lặp (iterative) đảm bảo an toàn tuyệt đối khi xử lý chuỗi 50,000+ nodes, loại trừ 100% rủi ro Call Stack Overflow so với đệ quy.

- **How to Verify**:
  > 1. Chạy unit test native: `node coding/week-03/02-reverse-linked-list.test.js` (hoặc `npm test`).
  > 2. Kiểm thử 8 kịch bản (Null/Undefined, danh sách rỗng, 1 phần tử, 2 phần tử, danh sách chuẩn, số âm, bất biến tái sử dụng node in-place, và stress test 50,000 phần tử).

---

## 3. Affected Files

| File | Action | Purpose |
|---|:---:|---|
| `coding/week-03/02-reverse-linked-list.test.js` | CREATE | Bộ kiểm thử unit test native assert (8 test cases, test-first). |
| `coding/week-03/02-reverse-linked-list.js` | CREATE | Lớp `ListNode`, các hàm helper và giải thuật `reverseList` in-place 3 con trỏ. |
| `coding/week-03/02-reverse-linked-list.md` | CREATE | Cẩm nang PBL: Tình huống nghiệp vụ sổ cái ngân hàng, phân tích bẫy đệ quy Call Stack, kịch bản tiếng Anh 6 bước. |
| `docs/visualizers/w3-03-reverse-linked-list.html` | CREATE | Generative UI: Widget mô phỏng bước nhảy con trỏ `prev`, `curr`, `next` với Dark Mode tương phản cao. |
| `package.json` | MODIFY | Tích hợp test script của Tuần 3 Day 3 (`test:w3-03`) vào chuỗi `npm test` và `test:all`. |
| `README.md` | MODIFY | Cập nhật checklist tiến độ Tuần 3 Day 3 trong Dashboard. |
| `docs/plans/_ACTIVE.md` | MODIFY | Cập nhật trạng thái Day 2 sang `Closed` và Day 3 sang `In Processing`. |
| `docs/AGENT_STATE.md` | MODIFY | Cập nhật trạng thái handoff và lộ trình kế tiếp của hệ thống. |

---

## 4. Implementation Checklist
*(Tuân thủ nghiêm ngặt nguyên tắc Test-First: Test cases được viết trước khi hiện thực mã nguồn)*

- [ ] `coding/week-03/02-reverse-linked-list.test.js`: TC-01 – Guard clauses & Invalid inputs (null, undefined, non-object → trả về an toàn không quăng lỗi).
- [ ] `coding/week-03/02-reverse-linked-list.test.js`: TC-02 – Danh sách rỗng (`head === null` → `null`).
- [ ] `coding/week-03/02-reverse-linked-list.test.js`: TC-03 – Danh sách 1 phần tử (`[42]` → `[42]`, giữ nguyên tham chiếu).
- [ ] `coding/week-03/02-reverse-linked-list.test.js`: TC-04 – Danh sách 2 phần tử (`[1, 2]` → `[2, 1]`).
- [ ] `coding/week-03/02-reverse-linked-list.test.js`: TC-05 – Happy path danh sách chuẩn (`[1, 2, 3, 4, 5]` → `[5, 4, 3, 2, 1]`).
- [ ] `coding/week-03/02-reverse-linked-list.test.js`: TC-06 – Danh sách chứa số âm và số 0 (`[-10, -5, 0, 5, 10]` → `[10, 5, 0, -5, -10]`).
- [ ] `coding/week-03/02-reverse-linked-list.test.js`: TC-07 – Invariant kiểm tra tái sử dụng node gốc (In-place node identity verification).
- [ ] `coding/week-03/02-reverse-linked-list.test.js`: TC-08 – Stress test 50,000 nodes chống tràn Call Stack (< 30ms).
- [ ] `coding/week-03/02-reverse-linked-list.js`: Định nghĩa lớp `ListNode(val, next)`, hàm chuyển đổi `arrayToList(arr)`, `listToArray(head)`.
- [ ] `coding/week-03/02-reverse-linked-list.js`: Hiện thực hàm `reverseList(head)` với guard clause dòng 1 và vòng lặp 3 con trỏ `prev`, `curr`, `next`.
- [ ] `coding/week-03/02-reverse-linked-list.md`: Soạn thảo tài liệu 5 bước PBL và kịch bản đối thoại phỏng vấn tiếng Anh 6 bước (Clarify, Brute-force, Optimize, Think Out Loud, Dry Run, Complexity).
- [ ] `docs/visualizers/w3-03-reverse-linked-list.html`: Dựng Generative UI Stepper mô phỏng đảo chiều liên kết node trực quan.
- [ ] `package.json`: Thêm script `"test:w3-03"` và tích hợp vào `"test"` / `"test:all"`.
- [ ] `README.md`: Đánh dấu hoàn thành Tuần 3 Day 3 trên Progress Dashboard.
- [ ] `docs/plans/_ACTIVE.md`: Cập nhật bảng kế hoạch hoạt động (`_ACTIVE.md`).
- [ ] `docs/AGENT_STATE.md`: Ghi nhận trạng thái hoàn tất và bàn giao.

---

## 5. Out of Scope

- Không kết hợp bài toán *Reverse Linked List II* (đảo ngược mảng con giữa vị trí `left` và `right`) vào cùng buổi nhằm tuân thủ [Weekly Curriculum Balance & Anti-Burnout Protocol](file:///home/samnguyen/projects/training-anz/ROADMAP.md#L231) và kỷ luật 60 phút mỗi sáng.
- Không sử dụng phương pháp đệ quy (recursive approach) làm giải pháp chính trong production code vì nguy cơ tràn Call Stack trong Node.js V8.
- Không cài đặt thêm bất kỳ thư viện bên ngoài nào (Jest, Mocha, Chai, Lodash).

---

## 6. Edge Cases & Error Handling

| Scenario | Input | Expected Output | Cơ chế xử lý |
|---|---|---|---|
| Null / Undefined | `null`, `undefined` | `null` / input | Guard clause dòng 1: `if (!head \|\| !head.next) return head;` |
| Danh sách rỗng | `head = null` | `null` | Early exit $O(1)$ |
| Danh sách 1 node | `[1]` | `[1]` | Early exit `!head.next` trả về chính `head` |
| Danh sách 2 nodes | `[1, 2]` | `[2, 1]` | Hoán đổi liên kết chính xác sau 2 bước lặp |
| Danh sách có số âm & 0 | `[-1, 0, 1]` | `[1, 0, -1]` | Thuật toán chỉ thao tác trên con trỏ `.next`, giá trị `.val` không bị ảnh hưởng |
| Danh sách cực lớn (50k nodes) | 50,000 nodes | Đảo ngược trọn vẹn < 30ms | Vòng lặp `while` trên Heap, không tốn Call Stack Frames |

---

## 7. Git Info

```
Branch:               feature/week-03-day-03-reverse-linked-list
Target Branch:        main
Commit message:       feat(coding): implement reverse linked list using in-place three pointers (close #36)
GitHub PR Labels:     coding, enhancement
```
