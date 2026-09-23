# Kế hoạch Kỹ thuật: Week 2 Day 1 — Valid Anagram & Group Anagrams

## 1. Objective & Metadata

- **Task Type**: `New Request`
- **Status**: `In Processing`
- **Target Branch**: `main`
- **Feature Branch**: `feature/week-02-day-01-valid-anagram`
- **Commit Message**: `feat(coding): implement valid anagram and group anagrams using frequency hashing (close #22)`

Kế hoạch này khởi động Tuần 2 của lộ trình chuẩn bị phỏng vấn HCLTech x ANZ Bank. Mục tiêu là làm chủ kỹ thuật Frequency Hashing thông qua 2 bài toán kinh điển: Valid Anagram (#242) và Group Anagrams (#49 Medium), đạt độ phức tạp tuyến tính $O(N \cdot K)$ và $O(1)$ space cho bài kiểm tra đảo chữ đơn lẻ.

---

## 📌 2. Executive & Business Summary (Tóm tắt Nghiệp vụ)

- **Business / Problem Title**: 
  > Valid Anagram & Group Anagrams — Kỹ thuật Frequency Hashing và gom cụm định dạng giao dịch ngân hàng.

- **Why / Problem Statement**:
  > Kiểm tra và gom nhóm chuỗi bằng sorting tốn $O(K \log K)$ per string. Với khối lượng hàng triệu bản ghi giao dịch tại ngân hàng, chi phí sắp xếp chuỗi gây tắc nghẽn CPU và tăng độ trễ hệ thống.

- **What / Solution**:
  > - Dùng mảng cố định 26 phần tử (`new Array(26).fill(0)`) cho `isAnagram`, đạt $O(n)$ time và $O(1)$ auxiliary space.
  > - Dùng chữ ký tần suất phân cách bằng `#` làm Key cho `new Map()` trong `groupAnagrams`, giảm độ phức tạp xuống $O(N \cdot K)$.

- **Impact**:
  > Tối ưu hóa triệt để tài nguyên tính toán, giải quyết bài toán Transaction Pattern Matching trong thời gian thực.

- **How to Verify**:
  > Chạy bộ kiểm thử native assert gồm 10 test cases, đo benchmark xử lý 5,000 chuỗi dưới 30ms.

---

## 3. Scope & Affected Files

| Thao tác | Đường dẫn file | Mục đích |
|---|---|---|
| **[NEW]** | `coding/week-02/01-valid-anagram.js` | Source code 2 hàm `isAnagram` và `groupAnagrams` |
| **[NEW]** | `coding/week-02/01-valid-anagram.test.js` | Test suite native 10 test cases |
| **[NEW]** | `coding/week-02/01-valid-anagram.md` | Tài liệu PBL và kịch bản 6 bước tiếng Anh |
| **[NEW]** | `notes/week-02/day-01-frequency-hashing.md` | Cẩm nang chuyên sâu Frequency Hashing |
| **[NEW]** | `docs/plans/week-02-day-01-valid-anagram.md` | Bản kế hoạch lưu trữ theo chuẩn `PLAN_STANDARD.md` |
| **[MODIFY]** | `package.json` | Thêm script `test:w2-01` và chuỗi `test` |
| **[MODIFY]** | `README.md` | Khởi tạo bảng theo dõi Tuần 2 |
| **[MODIFY]** | `docs/plans/_ACTIVE.md` | Đưa kế hoạch vào danh mục `In Processing` |
| **[MODIFY]** | `docs/AGENT_STATE.md` | Cập nhật trạng thái Tuần 2 Day 1 |

---

## 4. Implementation Checklist

- [x] Tạo nhánh `feature/week-02-day-01-valid-anagram` từ `main`.
- [x] Viết bộ test-first `coding/week-02/01-valid-anagram.test.js` (10 test cases).
- [x] Cài đặt mã nguồn `coding/week-02/01-valid-anagram.js` với guard clause dòng 1.
- [x] Soạn thảo cẩm nang giải thuật `coding/week-02/01-valid-anagram.md` (kịch bản tiếng Anh 6 bước).
- [x] Soạn thảo cẩm nang chuyên sâu `notes/week-02/day-01-frequency-hashing.md`.
- [x] Lưu trữ kế hoạch kỹ thuật `docs/plans/week-02-day-01-valid-anagram.md`.
- [ ] Cập nhật `package.json` với script test cho Week 2.
- [ ] Cập nhật `README.md`, `docs/plans/_ACTIVE.md`, và `docs/AGENT_STATE.md`.
- [ ] Chạy toàn bộ regression test `npm test` xác nhận 54/54 test cases PASS.

---

## 5. Verification Command

```bash
node coding/week-02/01-valid-anagram.test.js
npm test
```

