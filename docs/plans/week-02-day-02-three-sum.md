# Kế hoạch Kỹ thuật: Week 2 Day 2 — 3Sum (Two Pointers Medium)

## 1. Objective & Metadata

- **Task Type**: `New Request`
- **Status**: `In Processing`
- **Target Branch**: `main`
- **Feature Branch**: `feature/week-02-day-02-three-sum`
- **Commit Message**: `feat(coding): implement 3sum using sorted two pointers and duplicate skipping (close #23)`

Kế hoạch này triển khai bài toán thứ hai của Tuần 2: **3Sum (LeetCode #15 - Medium)**. Mục tiêu là làm chủ kỹ thuật Two Pointers kẹp hai đầu trên mảng đã sắp xếp, tối ưu độ phức tạp từ vét cạn $O(n^3)$ xuống $O(n^2)$ time và $O(1)$ auxiliary space, triệt tiêu hoàn toàn bẫy trùng lặp (Skip Duplicates) bằng nhảy cóc con trỏ 3 tầng, và ứng dụng vào bài toán Tri-party Settlement Balancing tại ANZ Bank.

---

## 📌 2. Executive & Business Summary (Tóm tắt Nghiệp vụ)

- **Business / Problem Title**: 
  > 3Sum — Thuật toán tìm bộ ba có tổng bằng 0 bằng Two Pointers & Kỹ thuật loại bỏ trùng lặp tại chỗ.

- **Why / Problem Statement**:
  > Vét cạn bằng 3 vòng lặp lồng nhau tốn $O(n^3)$ khiến hệ thống bị Time Limit Exceeded (TLE) ngay lập tức khi mảng có từ 1,000 phần tử trở lên. Ngoài ra, việc dùng `Set` với chuỗi serialize để lọc trùng tốn $O(n^2)$ bộ nhớ và làm chậm V8 execution do kích hoạt Garbage Collection liên tục.

- **What / Solution**:
  > - Sắp xếp số học mảng đầu vào trong $O(n \log n)$ bằng `nums.sort((a, b) => a - b)`.
  > - Vòng lặp ngoài cố định phần tử thứ nhất `nums[i]`: ngắt sớm nếu `nums[i] > 0`, skip duplicates nếu `nums[i] === nums[i - 1]`.
  > - Vòng lặp trong dùng hai con trỏ `left` và `right` kẹp từ hai đầu: khi tìm thấy `sum === 0`, ghi nhận kết quả và nhảy cóc bỏ qua các số giống nhau ở cả hai con trỏ trong $O(1)$ auxiliary space.

- **Impact**:
  > Giảm thời gian xử lý từ $O(n^3)$ xuống $O(n^2)$, auxiliary space $O(1)$, kiểm soát 100% không phát sinh bộ ba trùng lặp, đáp ứng bài toán đối soát 3 chiều (Tri-party Clearing) của ANZ Data Platform.

- **How to Verify**:
  > Bộ test native 8 test cases bao phủ toàn bộ biên: mảng null, rỗng, toàn số 0 `[0, 0, 0, 0]`, số âm dương đan xen, không có cặp nào thỏa mãn, và benchmark mảng 1,000 phần tử chạy dưới 50ms.

---

## 3. Scope & Affected Files

| Thao tác | Đường dẫn file | Mục đích |
|---|---|---|
| **[NEW]** | `coding/week-02/02-three-sum.js` | Source code hàm `threeSum(nums)` tối ưu $O(n^2)$ |
| **[NEW]** | `coding/week-02/02-three-sum.test.js` | Test suite native 8 test cases |
| **[NEW]** | `coding/week-02/02-three-sum.md` | Tài liệu PBL và kịch bản 6 bước tiếng Anh |
| **[NEW]** | `notes/week-02/day-02-three-sum-patterns.md` | Cẩm nang chuyên sâu: Two Pointers kẹp hai đầu & Xử lý Duplicate |
| **[NEW]** | `docs/plans/week-02-day-02-three-sum.md` | Bản kế hoạch lưu trữ theo chuẩn `PLAN_STANDARD.md` |
| **[MODIFY]** | `package.json` | Thêm script `test:w2-02` và cập nhật `test`, `test:all` |
| **[MODIFY]** | `README.md` | Cập nhật tiến độ Tuần 2 Day 2 |
| **[MODIFY]** | `docs/plans/_ACTIVE.md` | Đưa kế hoạch vào danh mục `In Processing` |
| **[MODIFY]** | `docs/AGENT_STATE.md` | Cập nhật sổ cái cho Day 2 |

---

## 4. Implementation Checklist

- [x] Tạo nhánh `feature/week-02-day-02-three-sum` từ `main`.
- [x] Viết bộ test-first `coding/week-02/02-three-sum.test.js` (8 test cases).
- [x] Cài đặt mã nguồn `coding/week-02/02-three-sum.js` với guard clause dòng 1 và 3-tier duplicate skipping.
- [x] Soạn thảo cẩm nang giải thuật `coding/week-02/02-three-sum.md` (kịch bản tiếng Anh 6 bước).
- [x] Soạn thảo cẩm nang chuyên sâu `notes/week-02/day-02-three-sum-patterns.md`.
- [x] Lưu trữ kế hoạch kỹ thuật `docs/plans/week-02-day-02-three-sum.md`.
- [ ] Cập nhật `package.json` với script test cho Day 2.
- [ ] Cập nhật `README.md`, `docs/plans/_ACTIVE.md`, và `docs/AGENT_STATE.md`.
- [ ] Chạy toàn bộ regression test `npm test` xác nhận 62/62 test cases PASS.

---

## 5. Verification Command

```bash
# Test riêng bài 3Sum
node coding/week-02/02-three-sum.test.js

# Test toàn bộ regression suites
npm test
```

