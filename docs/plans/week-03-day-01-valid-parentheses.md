# Implementation Plan: Valid Parentheses (LeetCode #20 - Easy)

## 1. Objective & Metadata
Hiện thực giải pháp kiểm tra tính hợp lệ của chuỗi dấu ngoặc (`()`, `{}`, `[]`) theo cấu trúc dữ liệu Ngăn xếp (Stack - LIFO) và bảng ánh xạ ngoặc đối ứng bằng JavaScript thuần (Node.js Native, Zero External Dependencies). Bài toán mô phỏng kịch bản xác thực cú pháp lồng nhau (Payload Syntax Validation) trong các gói tin giao dịch tài chính ISO 20022 hoặc cấu trúc JSON/XML trước khi đẩy vào hệ thống thanh toán cốt lõi của ngân hàng ANZ.

- **Task Type**: `New Request`
- **Status**: `In Processing`
- **Issue**: [#34](https://github.com/sam79-arch/training-anz/issues/34)
- **Milestone**: [Milestone #6 (Week 3: Stack, Linked List & Database Deep Dive)](https://github.com/sam79-arch/training-anz/milestone/6)
- **Target Branch**: `main`

---

## 2. 📌 Executive & Business Summary (Tóm tắt Nghiệp vụ / Bài toán)

- **Business / Problem Title**:
  > Kiểm tra tính hợp lệ của các khối dữ liệu cấu trúc lồng nhau (Payload Bracket Validation) cho các bản tin giao dịch tài chính ISO 20022 bằng cấu trúc dữ liệu Ngăn xếp (Stack LIFO).

- **Why / Problem Statement**:
  > Trong các giao dịch chuyển mạch liên ngân hàng (như SWIFT MX / ISO 20022), dữ liệu XML/JSON được đóng mở theo các cặp thẻ lồng nhau. Nếu chuỗi đóng mở không đúng thứ tự (ví dụ `"(]"` hoặc `"([)]"`), việc giải mã (parsing) sâu ở downstream sẽ gây ra lỗi gián đoạn hoặc sập worker process. Cần một cơ chế tiền kiểm định (pre-validation) siêu tốc với độ phức tạp tuyến tính $O(n)$ và kiểm soát bộ nhớ $O(n)$ trước khi nạp vào bộ parser nặng nề.

- **What / Solution**:
  > 1. Thiết lập **Guard Clause dòng 1**: Kiểm tra input null/undefined/không phải string. Đặc biệt, nếu độ dài chuỗi là số lẻ (`s.length % 2 !== 0`), lập tức trả về `false` trong $O(1)$ mà không cần duyệt chuỗi.
  > 2. Sử dụng mảng JavaScript thuần làm **Stack** với 2 thao tác nguyên tử `push()` và `pop()`.
  > 3. Sử dụng một `Map` (hoặc lookup object) ánh xạ mỗi dấu đóng sang dấu mở tương ứng (`')' -> '('`, `'}' -> '{'`, `']' -> '['`).
  > 4. Khi gặp dấu mở: đẩy vào Stack. Khi gặp dấu đóng: lấy phần tử đỉnh Stack kiểm tra khớp đối ứng. Nếu không khớp hoặc Stack rỗng $\rightarrow$ `false`.
  > 5. Kết thúc: kiểm tra Stack có rỗng hoàn toàn không (`stack.length === 0`).

- **Impact & Expected Performance**:
  > - **Time Complexity**: $O(n)$ với 1 vòng lặp tuyến tính duy nhất qua chuỗi ký tự.
  > - **Space Complexity**: $O(n)$ trong trường hợp xấu nhất (chuỗi toàn dấu mở `((((...`).
  > - **Guard Early Exit**: Giảm thời gian kiểm tra các chuỗi lỗi độ dài lẻ về $O(1)$.

- **How to Verify**:
  > 1. Chạy unit test native: `node coding/week-03/01-valid-parentheses.test.js` (hoặc `npm test`).
  > 2. Kiểm thử 8 kịch bản (Chuỗi rỗng, độ dài lẻ, lồng nhau chuẩn, sai thứ tự đóng, đóng khi chưa mở, toàn mở, chuỗi cực lớn).

---

## 3. Affected Files

| File | Action | Purpose |
|---|:---:|---|
| `coding/week-03/01-valid-parentheses.test.js` | CREATE | Bộ kiểm thử unit test native assert (8 test cases, test-first). |
| `coding/week-03/01-valid-parentheses.js` | CREATE | Mã nguồn giải thuật Stack LIFO với Guard Clause và Map lookup. |
| `coding/week-03/01-valid-parentheses.md` | CREATE | Cẩm nang PBL: Tình huống nghiệp vụ ISO 20022, phân tích độ phức tạp, kịch bản tiếng Anh 6 bước. |
| `docs/visualizers/w3-01-valid-parentheses.html` | CREATE | Generative UI: Widget mô phỏng trực quan cơ chế Push/Pop của Stack với Dark Mode và State Machine Stepper. |
| `package.json` | MODIFY | Bổ sung test script của Tuần 3 Day 1 vào chuỗi `npm test`. |

---

## 4. Implementation Checklist
*(Tuân thủ nghiêm ngặt nguyên tắc Test-First: Test cases được viết trước khi hiện thực mã nguồn)*

- [x] `coding/week-03/01-valid-parentheses.test.js`: TC-01 – Guard clauses & Invalid inputs (null, undefined, non-string → `false`).
- [x] `coding/week-03/01-valid-parentheses.test.js`: TC-02 – Early exit cho chuỗi có độ dài lẻ (e.g. `"("`, `"(()"`, `"{[]"` → `false`).
- [x] `coding/week-03/01-valid-parentheses.test.js`: TC-03 – Chuỗi rỗng `""` → `true` (quy ước valid).
- [x] `coding/week-03/01-valid-parentheses.test.js`: TC-04 – Các trường hợp chuẩn hợp lệ (`"()"`, `"()[]{}"`, `"{[]}"` → `true`).
- [x] `coding/week-03/01-valid-parentheses.test.js`: TC-05 – Đóng sai loại ngoặc (`"(]"` → `false`).
- [x] `coding/week-03/01-valid-parentheses.test.js`: TC-06 – Đóng sai thứ tự lồng nhau (`"([)]"` → `false`).
- [x] `coding/week-03/01-valid-parentheses.test.js`: TC-07 – Dấu đóng xuất hiện khi stack rỗng (`"]"` hoặc `")()"` → `false`).
- [x] `coding/week-03/01-valid-parentheses.test.js`: TC-08 – Hiệu năng trên chuỗi cực lớn (100,000 ký tự hợp lệ lồng nhau < 20ms).
- [x] `coding/week-03/01-valid-parentheses.js`: Hiện thực hàm `isValid(s)` với guard clause, lookup map, và vòng lặp `for...of`.
- [x] `coding/week-03/01-valid-parentheses.md`: Soạn thảo tài liệu 5 bước PBL và kịch bản đối thoại phỏng vấn tiếng Anh 6 bước (Clarify, Brute-force, Optimize, Think Out Loud, Dry Run, Complexity).
- [x] `docs/visualizers/w3-01-valid-parentheses.html`: Dựng Generative UI Stepper mô phỏng ngăn xếp Stack hoạt động trực quan.
- [x] `package.json`: Tích hợp test suite của Tuần 3 Day 1 vào `npm test`.

---

## 5. Out of Scope

- Không kết hợp bài toán *Min Stack* vào cùng buổi này nhằm tuân thủ [Weekly Curriculum Balance & Anti-Burnout Protocol](file:///home/samnguyen/projects/training-anz/ROADMAP.md#L231) và kỷ luật 60 phút mỗi sáng (*Min Stack* được dời sang Tuần 4 Day 3).
- Không cài đặt thêm bất kỳ thư viện bên ngoài nào (Jest, Mocha, Chai, Lodash).

---

## 6. Edge Cases & Error Handling

| Scenario | Input | Expected Output | Cơ chế xử lý |
|---|---|---|---|
| Null / Undefined | `null`, `undefined` | `false` | Guard clause kiểm tra `typeof s !== 'string'` |
| Chuỗi rỗng | `""` | `true` | Quy ước LeetCode / ISO: Không có lỗi cấu trúc |
| Độ dài lẻ | `"(("`, `"([)"` | `false` | Early exit: `s.length % 2 !== 0` trong $O(1)$ |
| Toàn ngoặc mở | `"((((("` | `false` | Kiểm tra kết thúc: `stack.length === 0` |
| Dấu đóng khi stack rỗng | `")"` | `false` | `stack.pop()` trả về `undefined` khác với mapping |
| Sai thứ tự lồng nhau | `"([)]"` | `false` | Đỉnh stack không khớp với ngoặc đóng hiện tại |

---

## 7. Git Info

```
Branch:               feature/week-03-day-01-valid-parentheses
Target Branch:        main
Commit message:       feat(coding): implement valid parentheses using stack lifo and guard clauses (close #34)
GitHub PR Labels:     coding, enhancement
```
