# Kế hoạch Kỹ thuật: Week 2 Day 3 — Container With Most Water (Two Pointers Medium)

## 1. Objective & Metadata

- **Task Type**: `New Request`
- **Status**: `In Processing`
- **Target Branch**: `main`
- **Feature Branch**: `feature/week-02-day-03-container-with-most-water`
- **Commit Message**: `feat(coding): implement container with most water using two pointers area maximization (close #24)`

Kế hoạch này triển khai bài toán thứ ba của Tuần 2: **Container With Most Water (LeetCode #11 - Medium)**. Mục tiêu là làm chủ kỹ thuật Two Pointers kẹp hai đầu trên mảng không sắp xếp, chứng minh bất biến toán học loại trừ không gian nghiệm (Search Space Elimination) để tối ưu từ vét cạn $O(n^2)$ xuống $O(n)$ time và $O(1)$ auxiliary space, đồng thời xây dựng widget mô phỏng tương tác Generative UI trực quan.

---

## 📌 2. Executive & Business Summary (Tóm tắt Nghiệp vụ)

- **Business / Problem Title**: 
  > Container With Most Water — Thuật toán tìm dung tích chứa nước cực đại bằng Two Pointers kẹp hai đầu.

- **Why / Problem Statement**:
  > Thử mọi cặp thanh đứng bằng 2 vòng lặp lồng nhau tốn $O(n^2)$. Với mảng lớn $100,000$ mốc thời gian, $O(n^2)$ đòi hỏi $5 \times 10^9$ phép tính, gây tắc nghẽn CPU và sập hệ thống xử lý giao dịch thời gian thực. Không thể sắp xếp mảng vì sẽ phá hủy khoảng cách $R - L$ giữa các thanh.

- **What / Solution**:
  > - Đặt con trỏ $L$ tại đầu mảng (`0`) và $R$ tại cuối mảng (`n - 1`), tối đa hóa chiều rộng ban đầu $R - L$.
  > - Tính diện tích $\text{Area} = \min(height[L], height[R]) \times (R - L)$. Cập nhật `maxWater`.
  > - Dịch con trỏ ở cột thấp hơn vào trong: Vì chiều rộng luôn giảm sau mỗi bước, cơ hội duy nhất để tìm được diện tích lớn hơn là tìm một cột mới cao hơn cột thấp hiện tại.

- **Impact**:
  > Tối ưu thời gian xử lý từ $O(n^2)$ xuống $O(n)$, auxiliary space $O(1)$, xử lý mảng $100,000$ phần tử trong chưa đầy 2 mili-giây. Áp dụng vào bài toán tối ưu đệm thanh khoản nội ngày (Intraday Liquidity Buffer) tại ANZ Bank.

- **How to Verify**:
  > Bộ test native assert gồm 8 test cases bao phủ toàn diện các trường hợp biên: mảng < 2 phần tử, mảng bằng nhau, mảng tăng/giảm liên tục, trường hợp LeetCode kinh điển và benchmark 100,000 phần tử.

---

## 3. Scope & Affected Files

| Thao tác | Đường dẫn file | Mục đích |
|---|---|---|
| **[NEW]** | `coding/week-02/03-container-with-most-water.js` | Source code hàm `maxArea(height)` tối ưu $O(n)$ |
| **[NEW]** | `coding/week-02/03-container-with-most-water.test.js` | Test suite native assert 8 test cases |
| **[NEW]** | `coding/week-02/03-container-with-most-water.md` | Tài liệu PBL và kịch bản 6 bước tiếng Anh |
| **[NEW]** | `notes/week-02/day-03-container-patterns.md` | Cẩm nang chuyên sâu: Two Pointers kẹp hai đầu trên mảng không sort |
| **[NEW]** | `docs/plans/week-02-day-03-container-with-most-water.md` | Bản kế hoạch lưu trữ theo chuẩn `PLAN_STANDARD.md` |
| **[MODIFY]** | `package.json` | Thêm script `test:w2-03` và cập nhật `test`, `test:all` |
| **[MODIFY]** | `README.md` | Cập nhật tiến độ Tuần 2 Day 3 |
| **[MODIFY]** | `docs/plans/_ACTIVE.md` | Đưa kế hoạch vào danh mục `In Processing` |
| **[MODIFY]** | `docs/AGENT_STATE.md` | Cập nhật sổ cái cho Day 3 |

---

## 4. Implementation Checklist

- [x] Tạo nhánh `feature/week-02-day-03-container-with-most-water` từ `main`.
- [x] Viết bộ test-first `coding/week-02/03-container-with-most-water.test.js` (8 test cases).
- [x] Cài đặt mã nguồn `coding/week-02/03-container-with-most-water.js` với guard clause dòng 1 và Two Pointers.
- [x] Soạn thảo cẩm nang giải thuật `coding/week-02/03-container-with-most-water.md` (kịch bản tiếng Anh 6 bước).
- [x] Soạn thảo cẩm nang chuyên sâu `notes/week-02/day-03-container-patterns.md`.
- [x] Xây dựng bảng mô phỏng tương tác Generative UI `container_visualizer.html`.
- [x] Lưu trữ kế hoạch kỹ thuật `docs/plans/week-02-day-03-container-with-most-water.md`.
- [ ] Cập nhật `package.json` với script test `test:w2-03`.
- [ ] Cập nhật `README.md`, `docs/plans/_ACTIVE.md`, và `docs/AGENT_STATE.md`.
- [ ] Chạy toàn bộ regression test `npm test` xác nhận 66/66 test cases PASS.

---

## 5. Verification Command

```bash
# Test riêng bài Container With Most Water
node coding/week-02/03-container-with-most-water.test.js

# Test toàn bộ regression suites
npm test
```

