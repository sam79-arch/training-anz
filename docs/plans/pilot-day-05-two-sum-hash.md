# Pilot Day 05 — DSA: Two Sum & Contains Duplicate (Hashing Space-Time Tradeoff)

> **Plan ID:** `pilot-day-05-two-sum-hash`
> **GitHub Issue:** #13 — `[Week 1 - Day 5 / Thứ 6] DSA: Two Sum & Contains Duplicate (Hashing Space-Time Tradeoff)`
> **Related Prior Art:** Day 03 Two Sum II (`coding/week-01/03-two-sum-sorted.js`), Issue #11.

---

## 1. Objective & Metadata

- **Task Type**: `New Request` *(Standard Task Type #6)*
- **Status**: `Closed`
- **Target Branch**: `main`
- **Owner / Date**: samnguyen — Pilot Week Day 5 (Thứ 6), 2026-09-18

**What problem does this solve?**
Giải quyết bài toán tìm cặp số có tổng bằng target trên mảng chưa sắp xếp và kiểm tra tính trùng lặp của dữ liệu mà không làm suy giảm hiệu năng xuống $O(n^2)$ (Brute-Force) hoặc $O(n \log n)$ (Sort).

**Why does it need solving now?**
Đây là bài tập cốt lõi của Day 5 (Thứ 6) nhằm rèn luyện tư duy đánh đổi không gian lấy thời gian (Space-Time Tradeoff), áp dụng trực tiếp vào nghiệp vụ chống trùng lặp giao dịch (Idempotency Deduplication) trong hệ thống ngân hàng ANZ.

**What is the expected outcome when done?**
Hoàn thành bộ đôi hàm `twoSum` và `containsDuplicate` tối ưu $O(n)$ time sử dụng `new Map()` và `new Set()`; 12/12 unit tests tự động PASS; cẩm nang phân tích sâu `Map` vs `{}` trong Node.js và kịch bản tiếng Anh chuẩn Senior Backend.

---

## 📌 2. Executive & Business Summary (Tóm tắt Nghiệp vụ / Bài toán)

- **Business / Problem Title**:
  > Kiểm soát giao dịch trùng lặp (Idempotency Deduplication) và đối soát cân bằng số dư hai chiều (Offsetting Transaction Matching) trong hệ thống ngân hàng ANZ bằng kỹ thuật Hashing.

- **Why / Problem Statement**:
  > Khi mảng giao dịch chưa được sắp xếp (Unsorted Stream), việc dùng 2 vòng lặp lồng nhau (Brute-Force) sẽ tốn $O(n^2)$ CPU, gây nghẽn nghiêm trọng khi có hàng trăm nghìn giao dịch. Nếu sắp xếp mảng để dùng Two Pointers, ta tốn $O(n \log n)$ và làm đảo lộn vị trí chỉ mục gốc (`original index`), không thể trả về đúng vị trí giao dịch ban đầu.

- **What / Solution**:
  > Áp dụng triết lý **Space-Time Tradeoff**: Chấp nhận đầu tư $O(n)$ RAM để đổi lấy tốc độ tra cứu tức thời $O(1)$ Time:
  > - `Two Sum`: Vừa duyệt mảng vừa lưu trữ các phần tử đã qua vào `Map`; với mỗi số `num`, tra cứu phần bù `target - num` trong $O(1)$.
  > - `Contains Duplicate`: Dùng `Set` lưu trữ Idempotency Key / Transaction ID; vừa gặp phần tử đã tồn tại là lập tức return `true` (Early-Exit) mà không cần duyệt hết mảng.

- **Impact & Expected Performance**:
  > - **Time Complexity**: $O(n)$ tuyến tính (duyệt tối đa 1 lượt).
  > - **Auxiliary Space Complexity**: $O(n)$ cho Hash Map / Set.
  > - **Hiệu năng thực tế**: Rút ngắn thời gian tra cứu từ hàng giây ($O(n^2)$) xuống chỉ vài mili-giây ($O(n)$), ngăn chặn 100% lỗi trừ tiền trùng lặp (Double-charging).

- **How to Verify**:
  > 1. Chạy suite kiểm thử độc lập: `node coding/week-01/04-two-sum-hash.test.js` $\rightarrow$ 12/12 test cases PASS.
  > 2. Chạy toàn bộ regression test suite: `npm test` $\rightarrow$ Tất cả các bài tập tuần 1 đều PASS.

---

## 3. Affected Files

| File | Action | Description |
|---|---|---|
| `docs/plans/pilot-day-05-two-sum-hash.md` | CREATE | Kế hoạch chuẩn hóa theo `docs/PLAN_STANDARD.md` |
| `coding/week-01/04-two-sum-hash.test.js` | CREATE | Unit test native assert: 7 test cases cho Two Sum + 5 test cases cho Contains Duplicate |
| `coding/week-01/04-two-sum-hash.js` | CREATE | Lời giải JavaScript chuẩn $O(n)$ dùng `new Map()` và `new Set()`, guard clause dòng 1 |
| `coding/week-01/04-two-sum-hash.md` | CREATE | Cẩm nang PBL, bối cảnh Idempotency ANZ, so sánh `Map` vs `{}` trong Node.js, kịch bản tiếng Anh 6 bước |
| `package.json` | MODIFY | Bổ sung `"test:05"` và nối vào chuỗi lệnh `"test"` / `"test:all"` |
| `README.md` | MODIFY | Tích xanh Day 5 trên Progress Dashboard |
| `docs/plans/_ACTIVE.md` | MODIFY | Đăng ký plan Day 5 vào registry |
| `docs/AGENT_STATE.md` | MODIFY | Cập nhật Current State và 4-point handoff checklist |

---

## 4. Implementation Checklist

> **Test-first order is mandatory.** Test items appear before implementation items.
> Each item is independently verifiable by reading the file alone.

**Test suite (must be authored first):**

- [x] `coding/week-01/04-two-sum-hash.test.js`: Header block & `require('assert')` + import `{ twoSum, containsDuplicate }`.
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-01 (Two Sum Guard Clauses): Input `null`, `undefined`, non-array, length < 2 $\rightarrow$ `[]`.
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-02 (Two Sum Standard): `[2, 7, 11, 15]`, target `9` $\rightarrow$ `[0, 1]`.
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-03 (Two Sum Duplicate Values): `[3, 3]`, target `6` $\rightarrow$ `[0, 1]` (không dùng cùng 1 chỉ mục 2 lần).
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-04 (Two Sum Negative Numbers): `[-1, -2, -3, -4, -5]`, target `-8` $\rightarrow$ `[2, 4]`.
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-05 (Two Sum Mixed with Zero): `[0, 4, 3, 0]`, target `0` $\rightarrow$ `[0, 3]`.
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-06 (Two Sum Unsorted & Displaced): `[3, 2, 4]`, target `6` $\rightarrow$ `[1, 2]`.
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-07 (Two Sum No Solution): `[1, 2, 3]`, target `7` $\rightarrow$ `[]`.
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-08 (Contains Duplicate Guard Clauses): `null`, `undefined`, length <= 1 $\rightarrow$ `false`.
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-09 (Contains Duplicate Standard True): `[1, 2, 3, 1]` $\rightarrow$ `true`.
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-10 (Contains Duplicate Standard False): `[1, 2, 3, 4]` $\rightarrow$ `false`.
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-11 (Contains Duplicate Mixed & Negatives): `[1, 1, 1, 3, 3, 4, -2, -2]` $\rightarrow$ `true`.
- [x] `coding/week-01/04-two-sum-hash.test.js`: TC-12 (Contains Duplicate Early-Exit Simulation): Mảng 10,000 phần tử có số trùng ở vị trí đầu $\rightarrow$ xác nhận thoát sớm tức thì.
- [x] `coding/week-01/04-two-sum-hash.test.js`: Runner `runAllTests()` và `if (require.main === module)` guard.

**Implementation and documentation:**

- [x] `coding/week-01/04-two-sum-hash.js`: Triển khai hàm `twoSum(nums, target)` với guard clause dòng 1 và One-Pass Hash Map.
- [x] `coding/week-01/04-two-sum-hash.js`: Triển khai hàm `containsDuplicate(nums)` với guard clause dòng 1 và Early-Exit `Set`.
- [x] `coding/week-01/04-two-sum-hash.js`: Export cả hai hàm: `module.exports = { twoSum, containsDuplicate }`.
- [x] `coding/week-01/04-two-sum-hash.md`: Biên soạn cẩm nang PBL đầy đủ 5 phần, so sánh chi tiết `Map` vs `{}` trong Node.js, kịch bản tiếng Anh 6 bước.
- [x] `package.json`: Thêm `"test:05": "node coding/week-01/04-two-sum-hash.test.js"` và nối vào `"test"` / `"test:all"`.
- [x] `README.md`: Tích xanh hoàn thành Day 5 trên Dashboard.
- [x] `docs/plans/_ACTIVE.md`: Cập nhật trạng thái plan (`Open` $\rightarrow$ `In Processing` $\rightarrow$ `Closed`).
- [x] `docs/AGENT_STATE.md`: Ghi nhận `PILOT_DAY_05_TWO_SUM_HASH_COMPLETED` vào lịch sử bàn giao.

---

## 5. Out of Scope

- Không can thiệp vào các thuật toán của các bài tập trước (`01-move-zeroes`, `02-valid-palindrome`, `03-two-sum-sorted`).
- Không cài đặt thêm bất kỳ thư viện ngoài nào (không dùng Lodash, Jest, Mocha).
- Không sửa đổi mã nguồn workflow GitHub Actions.

---

## 6. Data Model / Architecture Changes (Hashing Mechanism & Space-Time Tradeoff)

```text
               ONE-PASS HASH TABLE LOOKUP
               Target = 9, Current num = 7
               
     nums:  [ 2 ,  7 , 11 , 15 ]
                  ▲
               index i=1
               
     complement = Target - num = 9 - 7 = 2
     
     numMap:
     ┌───────────┬───────────┐
     │ Key (num) │ Val (idx) │
     ├───────────┼───────────┤
     │     2     │     0     │  <── has(complement)? YES!
     └───────────┴───────────┘
     
     👉 Tìm thấy ngay lập tức trong O(1)! 
     👉 Trả về [numMap.get(2), 1] = [0, 1].
```

---

## 7. Edge Cases & Error Handling

| Scenario | Expected Behavior |
|---|---|
| Input là `null` hoặc `undefined` | Guard clause trả về `[]` (twoSum) hoặc `false` (containsDuplicate) |
| Mảng có độ dài < 2 | Guard clause trả về `[]` (twoSum) hoặc `false` (containsDuplicate) |
| Cặp số đối ứng là chính nó (`nums[i] === complement`) | Kiểm tra map chỉ sau khi tìm kiếm để không tự ghép với chính nó |
| Mảng có các số âm và số 0 | `Map` và `Set` xử lý key là số âm và số `0` chính xác mà không nhầm falsy value |
| Mảng cực lớn có trùng lặp ở đầu | `containsDuplicate` ngắt sớm ngay lập tức trong $O(1)$ mà không tốn công duyệt hết |

---

## 8. Git Info

```
Branch:               feature/week-01-day-05-two-sum-hash
Target Branch:        main
Commit message:       feat(coding): implement two sum and contains duplicate using hash map and set (close #13)
GitHub PR Labels:     coding, enhancement
Milestone:            Week 1: Two Pointers, Hashing & Event Loop
```

