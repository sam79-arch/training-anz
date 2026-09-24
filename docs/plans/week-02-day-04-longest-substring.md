# Kế hoạch Kỹ thuật: Week 2 Day 4 — Longest Substring Without Repeating Characters (Sliding Window Medium)

## 1. Objective & Metadata

- **Task Type**: `New Request`
- **Status**: `In Processing`
- **Target Branch**: `main`
- **Feature Branch**: `feature/week-02-day-04-longest-substring`
- **Commit Message**: `feat(coding): implement longest substring without repeating characters using sliding window (close #25)`

Kế hoạch này triển khai bài toán thứ tư của Tuần 2: **Longest Substring Without Repeating Characters (LeetCode #3 - Medium)**. Mục tiêu là làm chủ kỹ thuật Cửa sổ trượt linh hoạt (Dynamic-size Sliding Window) kết hợp Hash Map lưu vị trí cuối cùng, phân tích cơ chế nhảy tức thời $O(1)$ của con trỏ `left` để đạt $O(n)$ Single-Pass time và $O(\min(m, n))$ auxiliary space, chống bẫy nhảy lùi con trỏ (Backward Jump Trap), và xây dựng widget mô phỏng tương tác Generative UI trực quan.

---

## 📌 2. Executive & Business Summary (Tóm tắt Nghiệp vụ)

- **Business / Problem Title**: 
  > Sliding Session Token Validation & Rate Limiting Window — Thuật toán tìm chuỗi con dài nhất không trùng lặp bằng Sliding Window kết hợp Hash Map.

- **Why / Problem Statement**:
  > Kiểm tra tính độc nhất của các token giao dịch liên tục tại API Gateway nhằm chống lại tấn công Replay Attack. Thuật toán Brute-force $O(n^3)$ hoặc $O(n^2)$ làm nghẽn CPU và gây trễ nghiêm trọng khi tiếp nhận luồng 50,000 transaction tokens liên tục.

- **What / Solution**:
  > - Sử dụng 2 con trỏ `left` và `right` tạo thành cửa sổ trượt động $[L, R]$.
  > - Dùng native `Map` lưu trữ vị trí xuất hiện gần nhất của từng ký tự.
  > - Khi gặp ký tự đã xuất hiện, con trỏ `left` nhảy tức thời qua vị trí trùng lặp: `left = Math.max(left, map.get(char) + 1)`. `Math.max` ngăn chặn con trỏ `left` bị nhảy lùi về quá khứ khi ký tự trùng lặp nằm ngoài cửa sổ hiện tại (ví dụ: `"abba"`).
  > - Cập nhật độ dài tối đa tại mỗi bước `maxLength = Math.max(maxLength, right - left + 1)`.

- **Impact**:
  > Tối ưu thời gian duyệt từ $O(n^2)$ về $O(n)$ Single-Pass, bộ nhớ phụ trợ $O(\min(m, n))$. Benchmark xử lý 48,000 ký tự trong chỉ 4.34ms (mục tiêu < 20ms).

- **How to Verify**:
  > Bộ test native assert 8 test cases bao phủ: input không hợp lệ, chuỗi rỗng/1 ký tự, classic LeetCode cases, bẫy nhảy lùi `"abba"`, chuỗi ký tự đặc biệt/dấu cách, toàn bộ ký tự duy nhất, và benchmark hiệu năng 50,000 ký tự.

---

## 3. Scope & Affected Files

| Thao tác | Đường dẫn file | Mục đích |
|---|---|---|
| **[NEW]** | `coding/week-02/04-longest-substring.js` | Source code hàm `lengthOfLongestSubstring(s)` tối ưu $O(n)$ Single-Pass |
| **[NEW]** | `coding/week-02/04-longest-substring.test.js` | Test suite native assert 8 test cases |
| **[NEW]** | `coding/week-02/04-longest-substring.md` | Tài liệu PBL và kịch bản 6 bước tiếng Anh ANZ |
| **[NEW]** | `notes/week-02/day-04-sliding-window-patterns.md` | Cẩm nang chuyên sâu: Phân loại Sliding Window & bẫy nhảy lùi con trỏ |
| **[NEW]** | `docs/visualizers/w2-04-longest-substring.html` | Bảng mô phỏng tương tác Generative UI Dark Mode |
| **[NEW]** | `docs/plans/week-02-day-04-longest-substring.md` | Bản kế hoạch lưu trữ theo chuẩn `PLAN_STANDARD.md` |
| **[MODIFY]** | `package.json` | Thêm script `test:w2-04` và cập nhật `test`, `test:all` |
| **[MODIFY]** | `README.md` | Cập nhật tiến độ Tuần 2 Day 4 |
| **[MODIFY]** | `docs/plans/_ACTIVE.md` | Đưa kế hoạch vào danh mục `In Processing` |
| **[MODIFY]** | `docs/AGENT_STATE.md` | Cập nhật sổ cái cho Day 4 |

---

## 4. Implementation Checklist

- [x] Tạo nhánh `feature/week-02-day-04-longest-substring` từ `main`.
- [x] Viết bộ test-first `coding/week-02/04-longest-substring.test.js` (8 test cases).
- [x] Cài đặt mã nguồn `coding/week-02/04-longest-substring.js` với guard clause dòng 1 và Single-Pass Sliding Window.
- [x] Soạn thảo cẩm nang giải thuật `coding/week-02/04-longest-substring.md` (kịch bản tiếng Anh 6 bước).
- [x] Soạn thảo cẩm nang chuyên sâu `notes/week-02/day-04-sliding-window-patterns.md`.
- [x] Xây dựng bảng mô phỏng tương tác Generative UI `w2-04-longest-substring.html`.
- [x] Lưu trữ kế hoạch kỹ thuật `docs/plans/week-02-day-04-longest-substring.md`.
- [ ] Cập nhật `package.json` (thêm `test:w2-04`, cập nhật `test` và `test:all`).
- [ ] Cập nhật `README.md` (đánh dấu hoàn tất Day 4 và thêm liên kết).
- [ ] Cập nhật `docs/plans/_ACTIVE.md` và `docs/AGENT_STATE.md`.
- [ ] Chạy kiểm thử toàn bộ `npm test` xác nhận 74/74 test cases PASS 100%.

---

## 5. Out of Scope

- Không sửa đổi mã nguồn hoặc test của các ngày trước (Week 1 và Week 2 Day 1-3).
- Không thêm bất kỳ npm package bên ngoài nào (tuân thủ nghiêm ngặt chuẩn native `node:assert`).
- Không thực hiện git push hay merge trước khi có sự chấp thuận từ User.

---

## 6. Git Info

```
Branch:               feature/week-02-day-04-longest-substring
Target Branch:        main
Commit message:       feat(coding): implement longest substring without repeating characters using sliding window (close #25)
GitHub PR Labels:     coding, enhancement, test
```

---

## 7. Verification Command

```bash
# Test riêng bài Longest Substring
npm run test:w2-04

# Chạy toàn bộ regression test suites trong repo
npm test
```

