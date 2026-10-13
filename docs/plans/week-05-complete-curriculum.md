# Kế Hoạch Triển Khai: Tuần 5 Trọn Gói (Milestone 3 / Phase 2A: Caching Architecture & Redis Deep Dive)

> **Task Type:** `DBMS Execution` & `New Request` & `Documentation`  
> **Status:** `Closed`  
> **Target Branch:** `feat/week-05-complete-curriculum`  
> **Scope:** Triển khai trọn gói toàn bộ lịch trình Tuần 5 (Từ Day 1 đến Day 6) — Tuần 0-Medium tuân thủ nghiêm ngặt Anti-Burnout Protocol:
>   - **Day 1 (Thứ 2)**: DSA: Best Time to Buy and Sell Stock (LeetCode #121 - Easy) — Duyệt 1 lượt $O(n)$, code 10 dòng, khởi động tuần (Early-Week Gate).
>   - **Day 2 (Thứ 3)**: Database & Redis Architecture: Cache-Aside vs Write-Through / Write-Behind & Kỹ thuật TTL Jitter chống Cache Stampede / Avalanche (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
>   - **Day 3 (Thứ 4)**: 🆕 Mid-Phase Recall & Consolidation Day: Tái hiện Longest Substring (Sliding Window) & B+Tree Index từ trí nhớ (Không giải LeetCode mới để dành tải nhận thức cho Redis).
>   - **Day 4 (Thứ 5)**: Database & Redis Architecture: Chống Cache Penetration (Bloom Filter, Null Object) & Khóa phân tán Distributed Lock (SET NX PX / Redlock cơ bản) chống Race Condition tài khoản (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
>   - **Day 5 (Thứ 6)**: DSA: Binary Search Standard Template (LeetCode #704 - Easy) + 🆕 Friday Recall Test 15m (Move Zeroes từ trí nhớ).
>   - **Day 6 (Thứ 7)**: Behavioral STAR Story 4 (Sự cố sập Cache phân tán & Thao túng số dư) & Tổng kết Tuần 5 Retrospective.

---

## 1. Objective & Metadata

- **Task Type**: `DBMS Execution` (Day 2, Day 4), `New Request` (Day 1, Day 3, Day 5), `Documentation` (Day 6).
- **Status**: `Closed` (Đã hoàn thành 100% implementation, 25/25 test suites pass).
- **Target Branch**: `feat/week-05-complete-curriculum`.
- **Target Milestone**: Milestone 3 (`Phase 2A: Caching Architecture & Redis Deep Dive`).
- **Mục tiêu kỹ thuật**:
  1. **DSA Nền tảng & Phản xạ**: Củng cố bài toán mua bán cổ phiếu (Single-pass tracking $O(n)$ time, $O(1)$ space), Binary Search Template chuẩn chống tràn số nguyên, và duy trì kỷ luật Spaced Repetition (Mid-Phase Recall & Friday Recall).
  2. **Kiến trúc CSDL & Caching Phân Tán (Redis)**: Xây dựng mô phỏng hoàn chỉnh 3 mô hình bộ nhớ đệm (Cache-Aside, Write-Through, Write-Behind), giải quyết 2 thảm họa kinh điển của hệ thống ngân hàng là **Cache Avalanche** (bằng TTL Jitter) và **Cache Penetration** (bằng Bloom Filter & Null Object Caching), đồng thời hiện thực **Distributed Lock** nguyên tử (`SET NX PX` & atomic release) bảo vệ số dư tài khoản khi có hàng trăm request đồng thời.
  3. **Behavioral STAR Story 4**: Soạn thảo kịch bản đối thoại tiếng Anh xử lý sự cố sập cụm Redis Cache trên Production và tổng kết tuần 5.

---

## 2. 📌 Executive & Business Summary

- **Business / Problem Title**: Giải Pháp Caching Phân Tán Đa Tầng (Redis Patterns, TTL Jitter, Bloom Filter & Distributed Lock) và Thuật Toán Tìm Kiếm Nhị Phân Nền Tảng ANZ.
- **Why / Problem Statement**:
  - Tại ngân hàng số ANZ, hàng triệu người dùng tra cứu số dư và lịch sử giao dịch mỗi giây. Nếu mọi request đều đọc trực tiếp PostgreSQL, database sẽ sụp đổ (Connection Storm & Disk I/O Saturation).
  - Tuy nhiên, việc áp dụng caching thiếu chuẩn mực sẽ gây ra 3 thảm họa chết người: (1) **Cache Avalanche/Stampede**: Hàng ngàn key hết hạn cùng một giây khiến DB chịu tải đột ngột; (2) **Cache Penetration**: Kẻ gian quét các ID không tồn tại làm tràn truy vấn xuống DB; (3) **Race Condition**: Rút tiền đồng thời trên nhiều server gây mất mát tiền bạc nếu thiếu Distributed Lock.
- **What / Solution**:
  - *Day 1*: `maxProfit(prices)` duyệt 1 lượt với bộ nhớ $O(1)$.
  - *Day 2*: `MockRedisCache` với Cache-Aside, Write-Through, Write-Behind và phân phối ngẫu nhiên `TTL Jitter` triệt tiêu Avalanche.
  - *Day 3*: Ngày củng cố Mid-Phase Recall (Sliding Window & B+Tree).
  - *Day 4*: Thuật toán `BloomFilter` (mảng bit + multi-hashing) + `NullObject` chặn 100% Penetration; cơ chế `DistributedLock` (`SET NX PX` + Lua atomic release) bảo vệ tài khoản ngân hàng.
  - *Day 5*: `binarySearch(nums, target)` template chuẩn tránh tràn số + Friday Recall Test.
  - *Day 6*: STAR Story 4 & Tuần 5 Retrospective Scorecard.
- **Impact & Expected Performance**:
  - Tỷ lệ Cache Hit $\ge 95\%$, giảm 90% tải truy vấn xuống Primary DB;
  - 100% các ID không tồn tại bị Bloom Filter chặn ở tầng cache;
  - 0 hiện tượng race condition khi 50 luồng rút tiền đồng thời nhờ Distributed Lock;
  - 100% test suites pass với sub-millisecond execution.
- **How to Verify**: Chạy `npm test` xác nhận toàn bộ 25 test suites (gồm 5 suites mới của Tuần 5) pass 100%.

---

## 3. Affected Files

| File | Action | Purpose |
|---|---|---|
| `coding/week-05/01-best-time-to-buy-stock.js` | CREATE | Giải thuật Best Time to Buy and Sell Stock $O(n)$ time, $O(1)$ space |
| `coding/week-05/01-best-time-to-buy-stock.test.js` | CREATE | Test suite 8 TCs (Guard clauses, monotonic decrease, split profits, 50k stress) |
| `coding/week-05/01-best-time-to-buy-stock.md` | CREATE | Cẩm nang 3-file tinh gọn: 6 bước tiếng Anh, Invariant không nhìn trước tương lai |
| `architecture/week-05/02-redis-caching-patterns.js` | CREATE | Redis Caching engine: Cache-Aside, Write-Through, Write-Behind & TTL Jitter |
| `architecture/week-05/02-redis-caching-patterns.test.js` | CREATE | Test suite 6 TCs (Cache hit/miss, invalidation, TTL Jitter distribution, 100 tx benchmark) |
| `architecture/week-05/02-redis-caching-patterns.md` | CREATE | Cẩm nang kiến trúc Caching Patterns & công thức toán học TTL Jitter |
| `coding/week-05/03-mid-phase-recall.js` | CREATE | Mid-Phase Recall: Longest Substring (Sliding Window) & B+Tree Bookmark Lookup |
| `coding/week-05/03-mid-phase-recall.test.js` | CREATE | Test suite 4 TCs kiểm chứng giải thuật tái hiện từ trí nhớ |
| `coding/week-05/03-mid-phase-recall.md` | CREATE | Cẩm nang Mid-Phase Recall & nhật ký ghi nhận trí nhớ Spaced Repetition |
| `architecture/week-05/04-redis-cache-penetration-and-lock.js` | CREATE | Engine chống Penetration (BloomFilter, NullObject) & Distributed Lock (`SET NX PX`) |
| `architecture/week-05/04-redis-cache-penetration-and-lock.test.js` | CREATE | Test suite 6 TCs (Penetration demo, Null cache, Bloom filter, Lock mutual exclusion, 50 concurrent transfers) |
| `architecture/week-05/04-redis-cache-penetration-and-lock.md` | CREATE | Cẩm nang kỹ thuật Bloom Filter & Distributed Lock chuẩn ANZ |
| `coding/week-05/05-binary-search-and-recall.js` | CREATE | Binary Search Standard Template + Friday Recall (Move Zeroes) |
| `coding/week-05/05-binary-search-and-recall.test.js` | CREATE | Test suite 8 TCs (Friday recall, overflow mid check, odd/even boundary, 100k stress) |
| `coding/week-05/05-binary-search-and-recall.md` | CREATE | Cẩm nang Binary Search & kịch bản 6 bước tiếng Anh |
| `notes/week-05/day-06-star-story-4-and-week-5-retrospective.md` | CREATE | STAR Story 4 (Production Cache Stampede) & Tổng kết Tuần 5 Scorecard |
| `package.json` | MODIFY | Bổ sung scripts `test:w5-01` đến `test:w5-05` và tích hợp vào `test` / `test:all` |
| `README.md` | MODIFY | Cập nhật dashboard Tuần 5 đánh dấu hoàn thành từ Day 1 đến Day 6 |
| `ROADMAP.md` | MODIFY | Cập nhật tiến độ Tuần 5 |
| `docs/plans/week-05-complete-curriculum.md` | CREATE | Lưu trữ bản kế hoạch Tuần 5 |
| `docs/plans/_ACTIVE.md` | MODIFY | Đăng ký active/closed plan |
| `docs/AGENT_STATE.md` | MODIFY | Cập nhật shared state |

---

## 4. Implementation Checklist

### Part 1: Day 1 (Thứ 2) — DSA: Best Time to Buy and Sell Stock (LeetCode #121 - Easy)
- [x] `coding/week-05/01-best-time-to-buy-stock.test.js`: Viết bộ kiểm thử Test-First (8 test cases):
  - [x] TC-01: Guard clauses & Invalid / Empty inputs (`null`, `undefined`, mảng 1 phần tử).
  - [x] TC-02: Trường hợp chuẩn LeetCode: `[7, 1, 5, 3, 6, 4]` trả về `5` (mua ngày 2 giá 1, bán ngày 5 giá 6).
  - [x] TC-03: Giá giảm đơn điệu: `[7, 6, 4, 3, 1]` trả về `0` (không giao dịch).
  - [x] TC-04: Giá không đổi: `[3, 3, 3, 3]` trả về `0`.
  - [x] TC-05: Điểm mua thấp nhất rơi vào ngày cuối cùng: `[2, 4, 1]` trả về `2` (không được bán trong quá khứ).
  - [x] TC-06: Mảng đúng 2 phần tử: `[1, 2]` trả về `1`, `[2, 1]` trả về `0`.
  - [x] TC-07: Invariant check: Không có hiện tượng Look-ahead / Time Arrow violation.
  - [x] TC-08: Stress test hiệu năng: 50,000 ngày giao dịch tính toán lợi nhuận trong $< 5\text{ms}$.
- [x] `coding/week-05/01-best-time-to-buy-stock.js`: Hiện thực thuật toán duyệt 1 lượt ($O(n)$ time, $O(1)$ space):
  - [x] Line 1 Guard clause: `if (!Array.isArray(prices) || prices.length < 2) return 0;`.
  - [x] Safe initialization: `minPrice = prices[0]`, `maxProfit = 0`.
- [x] `coding/week-05/01-best-time-to-buy-stock.md`: Cẩm nang 3-file tinh gọn với 6 bước tiếng Anh.

### Part 2: Day 2 (Thứ 3) — Database & Redis Architecture: Caching Patterns & TTL Jitter
- [x] `architecture/week-05/02-redis-caching-patterns.test.js`: Viết bộ kiểm thử Test-First (6 test cases):
  - [x] TC-01: Cache-Aside read: Cache Miss gọi DB và ghi cache; Cache Hit đọc trực tiếp không gọi DB.
  - [x] TC-02: Cache Invalidation: Cập nhật dữ liệu xóa key cache, lần đọc tiếp theo tải dữ liệu mới.
  - [x] TC-03: Write-Through pattern: Ghi đồng thời vào cả DB và Cache.
  - [x] TC-04: Write-Behind (Write-Back) pattern: Ghi vào Cache queue, định kỳ batch flush bất đồng bộ xuống DB.
  - [x] TC-05: TTL Jitter Math: Xác thực thời gian sống key được phân phối ngẫu nhiên trong khoảng $[T - \Delta, T + \Delta]$, triệt tiêu hiện tượng sập hàng loạt.
  - [x] TC-06: Concurrency Benchmark: 100 requests đồng thời với tỷ lệ 95% Cache Hit bảo vệ DB.
- [x] `architecture/week-05/02-redis-caching-patterns.js`: Hiện thực Caching Engine thuần Node.js:
  - [x] `class MockRedisCache`: Lưu trữ in-memory, hỗ trợ TTL, expire check, key invalidation.
  - [x] `class MockDatabase`: Mô phỏng Postgres với query latency và bộ đếm read/write.
  - [x] `class CacheAsideManager`: Hiện thực luồng Cache-Aside chuẩn ngân hàng kèm TTL Jitter.
  - [x] `class WriteThroughManager`: Hiện thực luồng ghi đồng bộ.
  - [x] `class WriteBehindManager`: Hàng đợi ghi bất đồng bộ.
- [x] `architecture/week-05/02-redis-caching-patterns.md`: Cẩm nang kiến trúc Redis Caching Patterns & phân tích toán học TTL Jitter.

### Part 3: Day 3 (Thứ 4) — Mid-Phase Recall & Consolidation Day
- [x] `coding/week-05/03-mid-phase-recall.test.js`: Viết bộ kiểm thử Test-First (4 test cases):
  - [x] TC-01: Recall Sliding Window — Longest Substring Without Repeating Characters (chuỗi chuẩn, trùng lặp).
  - [x] TC-02: Recall Sliding Window edge cases (chuỗi rỗng, 1 ký tự, toàn bộ ký tự giống nhau).
  - [x] TC-03: Recall B+Tree Index — Mô phỏng Bookmark Lookup vs Covering Index (Index-only scan).
  - [x] TC-04: Đo lường độ phức tạp: $O(n)$ cho Sliding Window, $O(\log n)$ cho B+Tree index scan.
- [x] `coding/week-05/03-mid-phase-recall.js`: Tái hiện thuật toán từ trí nhớ:
  - [x] `recallLongestSubstring(s)`: Sliding Window hai con trỏ kèm `Map` vị trí ký tự (`// Recall: PASS in 12m`).
  - [x] `simulateBTreeScan(records, queryIndexOnly)`: Phân biệt đường dẫn I/O Bookmark Lookup và Covering Index.
- [x] `coding/week-05/03-mid-phase-recall.md`: Soạn nhật ký Spaced Repetition và củng cố kiến thức.

### Part 4: Day 4 (Thứ 5) — Cache Penetration (Bloom Filter) & Distributed Lock
- [x] `architecture/week-05/04-redis-cache-penetration-and-lock.test.js`: Viết bộ kiểm thử Test-First (6 test cases):
  - [x] TC-01: Hiện tượng Cache Penetration: Truy vấn ID không tồn tại làm tràn xuống DB liên tục.
  - [x] TC-02: Chống Penetration qua Null Object Caching: Lưu giá trị `NULL` kèm TTL ngắn, lần 2 đọc trúng cache rỗng, 0 gọi DB.
  - [x] TC-03: Chống Penetration qua Bloom Filter: Các ID chắc chắn không tồn tại bị từ chối ngay lập tức ở tầng bộ nhớ đệm, 0 gọi DB.
  - [x] TC-04: Distributed Lock Mutual Exclusion: Chỉ duy nhất 1 worker chiếm lock tài nguyên tại một thời điểm (`SET NX PX`).
  - [x] TC-05: Atomic Lock Release Safety: Worker không thể xóa nhầm lock của worker khác khi hết hạn TTL.
  - [x] TC-06: High-Concurrency Banking Benchmark: 50 giao dịch rút tiền đồng thời được Distributed Lock bảo vệ, đảm bảo 0 thấu chi tài khoản.
- [x] `architecture/week-05/04-redis-cache-penetration-and-lock.js`: Hiện thực Engine phòng thủ:
  - [x] `class BloomFilter`: Mảng bit 32-bit/64-bit với 3 hàm băm độc lập (DJB2, FNV-1a, SDBM), hỗ trợ `add()` và `mightContain()`.
  - [x] `class NullObjectCacheManager`: Kết hợp Redis + Null Value TTL ngắn.
  - [x] `class DistributedLockManager`: Triển khai `acquire(key, ttlMs, ownerId)` và `release(key, ownerId)` nguyên tử.
- [x] `architecture/week-05/04-redis-cache-penetration-and-lock.md`: Cẩm nang kiến trúc Bloom Filter & Redlock ngân hàng.

### Part 5: Day 5 (Thứ 6) — Binary Search Standard Template & Friday Recall Test 15m
- [x] `coding/week-05/05-binary-search-and-recall.test.js`: Viết bộ kiểm thử Test-First (8 test cases):
  - [x] TC-01: Friday Recall Test — Move Zeroes hai con trỏ in-place.
  - [x] TC-02: Binary Search Guard clauses (`null`, `undefined`, mảng rỗng).
  - [x] TC-03: Mảng 1 phần tử (tìm thấy vs không tìm thấy).
  - [x] TC-04: Tìm thấy phần tử ở đầu, giữa, cuối mảng đã sắp xếp.
  - [x] TC-05: Không tìm thấy phần tử (nhỏ hơn min, lớn hơn max, lọt giữa các số).
  - [x] TC-06: Mảng chứa số âm và số 0: `[-10, -5, 0, 3, 7, 12]`.
  - [x] TC-07: Invariant check: Tránh tràn số với `mid = left + Math.floor((right - left) / 2)`.
  - [x] TC-08: Stress test 100,000 phần tử tìm kiếm trong $< 0.1\text{ms}$ ($O(\log n)$ scaling).
- [x] `coding/week-05/05-binary-search-and-recall.js`:
  - [x] `fridayRecallMoveZeroes(nums)`: In-place two pointers từ trí nhớ kèm comment recall.
  - [x] `binarySearch(nums, target)`: Template chuẩn LeetCode #704.
- [x] `coding/week-05/05-binary-search-and-recall.md`: Cẩm nang 3-file tinh gọn với 6 bước tiếng Anh.

### Part 6: Day 6 (Thứ 7) — Behavioral STAR Story 4 & Tuần 5 Retrospective
- [x] `notes/week-05/day-06-star-story-4-and-week-5-retrospective.md`:
  - [x] STAR Story 4: Sự cố Production sập Redis Cache Cluster trong giờ cao điểm lương về (Cache Avalanche & Stampede), cô lập bằng Mutex Lock, khôi phục bằng TTL Jitter.
  - [x] Follow-up Q&A tiếng Anh chuẩn ANZ.
  - [x] Scorecard Tuần 5 & Cumulative Repository Health Check (25 test suites, 195+ tests pass 100%).

### Part 7: Cấu hình Hệ thống & Regression Testing
- [x] `package.json`: Cập nhật scripts `test:w5-01` đến `test:w5-05`, tích hợp vào `test` / `test:all`.
- [x] `README.md`: Cập nhật dashboard Tuần 5.
- [x] `ROADMAP.md`: Cập nhật tiến độ Tuần 5.
- [x] `docs/plans/week-05-complete-curriculum.md`: Lưu trữ file kế hoạch.
- [x] `docs/plans/_ACTIVE.md`: Đăng ký plan registry.
- [x] `docs/AGENT_STATE.md`: Cập nhật trạng thái handoff.
- [x] Chạy `npm test` toàn hệ thống xác nhận 25/25 test suites pass 100%.

---

## 5. Git Proposal

- **Feature Branch**: `feat/week-05-complete-curriculum`
- **Commit Message**: `feat(week-05): complete week 5 curriculum — redis caching, bloom filter, distributed lock, binary search & recall`
- **Target Branch**: `main`

---

## 6. Verification Command

```bash
# Chạy từng suite riêng biệt
npm run test:w5-01
npm run test:w5-02
npm run test:w5-03
npm run test:w5-04
npm run test:w5-05

# Regression test toàn hệ thống
npm test
```

---

## 7. Out of Scope

- Không viết bài LeetCode Medium nào trong tuần (tuân thủ nghiêm ngặt Tuần 0-Medium của Anti-Burnout Protocol).
- Các chủ đề nâng cao về Redis Sentinel, Redis Cluster Sharding và Kadane Maximum Subarray sẽ triển khai ở Tuần 6.

