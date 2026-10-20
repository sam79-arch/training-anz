# Kế Hoạch Triển Khai: Tuần 6 Trọn Gói (Milestone 3 / Phase 2A: Redis Advanced, Kadane & Binary Search)

> **Task Type:** `DBMS Execution` & `New Request` & `Documentation`  
> **Status:** `Open`  
> **Target Branch:** `feat/week-06-complete-curriculum`  
> **Scope:** Triển khai trọn gói toàn bộ lịch trình Tuần 6 (Từ Day 1 đến Day 6) — Hoàn tất Milestone 3 (Phase 2A) tuân thủ nghiêm ngặt Anti-Burnout Protocol:
>   - **Day 1 (Thứ 2)**: DSA: Search Insert Position (LeetCode #35 - Easy) — Biến thể Binary Search tìm vị trí chèn, củng cố boundary check (Khởi động tuần nhẹ nhàng).
>   - **Day 2 (Thứ 3)**: Database & Redis Architecture: Redis Advanced & High Availability — Redis Sentinel (Quorum & Failover), Redis Cluster Sharding (Hash Slot 16384 CRC16) & Cơ chế Memory Eviction (LRU/LFU) (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
>   - **Day 3 (Thứ 4)**: DSA: Maximum Subarray / Kadane's Algorithm (LeetCode #53 - **Bài LeetCode Medium DUY NHẤT của tuần**) — Thuật toán Kadane $O(n)$ time, $O(1)$ space, bẫy khởi tạo `maxSum = nums[0]` và truy vết chỉ mục mảng con.
>   - **Day 4 (Thứ 5)**: Database & Redis Architecture: Distributed Lock Redlock Consensus Deep Dive — Mô phỏng thuật toán Redlock qua 5 node độc lập, phân tích Clock Drift, Fencing Token chống Out-of-order Writes (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
>   - **Day 5 (Thứ 6)**: DSA: Binary Search Boundary Drill (First Bad Version style - Easy) + 🆕 **Friday Recall Test 15m** (gõ lại Best Time to Buy Stock từ trí nhớ).
>   - **Day 6 (Thứ 7)**: Behavioral STAR Story 5 (Sự cố Split-Brain cụm Redis & Mất kết nối DB) & Tổng kết Milestone 3 (Phase 2A Retrospective Scorecard).

---

## 1. Objective & Metadata

- **Task Type**: `DBMS Execution` (Day 2, Day 4), `New Request` (Day 1, Day 3, Day 5), `Documentation` (Day 6).
- **Status**: `Open` (Sẵn sàng thực hiện sau khi User duyệt "OK").
- **Target Branch**: `feat/week-06-complete-curriculum`.
- **Target Milestone**: Hoàn tất Milestone 3 (`Phase 2A: Caching Architecture & Redis Deep Dive`).
- **Mục tiêu kỹ thuật**:
  1. **DSA Nền tảng & 1 Bài Medium Kadane**: Nắm vững biến thể tìm kiếm nhị phân chèn phần tử `Search Insert Position`, giải thuật quy hoạch động kinh điển `Kadane's Algorithm` xử lý mảng toàn số âm, và kiểm soát tìm kiếm biên (Lower Bound / First Bad Version).
  2. **Kiến trúc CSDL & Redis Nâng Cao**: Mô phỏng kiến trúc High Availability (HA) với Redis Sentinel (bầu chọn Quorum $M/2 + 1$, phát hiện `+sdown` vs `+odown`), kỹ thuật phân mảnh dữ liệu Redis Cluster (16,384 Hash Slots CRC16 & Hash Tags `{user:id}`), các chính sách giải phóng bộ nhớ LRU / LFU; và giải thuật đồng thuận phân tán **Redlock** kèm Fencing Tokens bảo vệ giao dịch tài chính ANZ.
  3. **Khép lại Phase 2A & Behavioral STAR Story 5**: Soạn thảo kịch bản đối thoại tiếng Anh xử lý sự cố mạng phân vùng (Split-Brain / Network Partition) trên cụm Cache phân tán.

---

## 2. 📌 Executive & Business Summary

- **Business / Problem Title**: Giải Pháp Caching Độ Sẵn Sàng Cao (Redis Sentinel, Cluster Sharding, Redlock Consensus) & Thuật Toán Tối Ưu Hóa Giao Dịch Tài Chính (Kadane Subarray).
- **Why / Problem Statement**:
  - Tại ngân hàng số ANZ, một node Redis đơn lẻ là điểm lỗi chết người (Single Point of Failure - SPOF). Nếu Redis Master sập mà không có cơ chế tự động chuyển vùng dự phòng (Failover), hàng triệu giao dịch thanh toán sẽ bị nghẽn (Downtime).
  - Khi dữ liệu vượt quá dung lượng RAM của 1 server, hệ thống bắt buộc phải Sharding theo cụm (Redis Cluster), nhưng nếu chia slot sai hoặc phân bổ key không đồng đều sẽ gây ra Hotspot Node.
  - Về thuật toán xử lý dữ liệu giao dịch: Phân tích chuỗi biến động số dư lãi/lỗ liên tục để tìm khoảng thời gian sinh lời lớn nhất nếu dùng 2 vòng lặp sẽ tốn $O(n^2)$ làm treo luồng Node.js, đòi hỏi giải thuật Kadane $O(n)$ tuyến tính.
- **What / Solution**:
  - *Day 1*: `searchInsert(nums, target)` nhị phân $O(\log n)$ trả về vị trí phần tử hoặc vị trí chèn.
  - *Day 2*: `MockRedisCluster` tính toán CRC16 slot + `MockRedisSentinel` giám sát Quorum Failover + `CacheEvictionPolicy` (LRU/LFU).
  - *Day 3*: `maxSubArray(nums)` theo thuật toán Kadane $O(n)$ time, $O(1)$ space, xử lý an toàn mảng toàn số âm.
  - *Day 4*: `RedlockManager` chạy trên 5 node độc lập, tính toán Clock Drift và Fencing Token ngăn chặn Worker trễ ghi đè dữ liệu.
  - *Day 5*: `firstBadVersion(n, isBadVersion)` drill biên nhị phân + Friday Recall Test.
  - *Day 6*: STAR Story 5 & Tổng kết Phase 2A Scorecard.
- **Impact & Expected Performance**:
  - Đảm bảo tính khả dụng 99.99% cho tầng Cache ngân hàng thông qua Sentinel Quorum $\ge 2/3$;
  - Phân bổ đều dữ liệu qua 16,384 slots với Hash Tag `{...}`;
  - Độ phức tạp thuật toán: $O(n)$ cho Kadane, $O(\log n)$ cho Binary Search;
  - 100% test suites pass với sub-millisecond execution, zero external dependencies.
- **How to Verify**: Chạy `npm test` xác nhận toàn bộ 30 test suites (gồm 5 suites mới của Tuần 6) pass 100%.

---

## 3. Affected Files

| File | Action | Purpose |
|---|---|---|
| `coding/week-06/01-search-insert-position.js` | CREATE | Giải thuật Search Insert Position $O(\log n)$ time, $O(1)$ space |
| `coding/week-06/01-search-insert-position.test.js` | CREATE | Test suite 8 TCs (Guard clauses, found, insert mid/head/tail, single, 100k stress) |
| `coding/week-06/01-search-insert-position.md` | CREATE | Cẩm nang 3-file tinh gọn: 6 bước tiếng Anh, Invariant con trỏ `left` là vị trí chèn |
| `architecture/week-06/02-redis-sentinel-cluster-eviction.js` | CREATE | Redis HA Engine: Sentinel Quorum, Cluster Sharding (CRC16), Eviction (LRU/LFU) |
| `architecture/week-06/02-redis-sentinel-cluster-eviction.test.js` | CREATE | Test suite 6 TCs (CRC16 slot routing, hash tags, sentinel failover, LRU/LFU eviction) |
| `architecture/week-06/02-redis-sentinel-cluster-eviction.md` | CREATE | Cẩm nang kiến trúc Redis Sentinel, Cluster Topology & Eviction Math |
| `coding/week-06/03-maximum-subarray-kadane.js` | CREATE | Thuật toán Kadane $O(n)$ time, $O(1)$ space kèm truy vết chỉ mục `[start, end]` |
| `coding/week-06/03-maximum-subarray-kadane.test.js` | CREATE | Test suite 8 TCs (All negative trap, mixed, single, boundary tracking, 50k stress) |
| `coding/week-06/03-maximum-subarray-kadane.md` | CREATE | Cẩm nang 3-file: 6 bước tiếng Anh, phân tích bẫy `nums[0]` vs `0` |
| `architecture/week-06/04-redis-redlock-consensus.js` | CREATE | Engine Redlock: 5-node consensus, validity time, clock drift & fencing tokens |
| `architecture/week-06/04-redis-redlock-consensus.test.js` | CREATE | Test suite 6 TCs (Quorum lock, rollback on failure, clock drift, fencing token, concurrency) |
| `architecture/week-06/04-redis-redlock-consensus.md` | CREATE | Cẩm nang Redlock Algorithm, tranh luận Martin Kleppmann vs Salvatore Sanfilippo |
| `coding/week-06/05-binary-search-boundary-and-recall.js` | CREATE | Binary Search Lower Bound Drill + Friday Recall (Best Time to Buy Stock) |
| `coding/week-06/05-binary-search-boundary-and-recall.test.js` | CREATE | Test suite 8 TCs (Friday recall, first bad version, minimal calls, 1M stress) |
| `coding/week-06/05-binary-search-boundary-and-recall.md` | CREATE | Cẩm nang Binary Search Lower Bound & nhật ký Spaced Repetition |
| `notes/week-06/day-06-star-story-5-and-phase-2a-retrospective.md` | CREATE | STAR Story 5 (Redis Cluster Split-Brain) & Tổng kết Milestone 3 Scorecard |
| `package.json` | MODIFY | Bổ sung scripts `test:w6-01` đến `test:w6-05` và tích hợp vào `test` / `test:all` |
| `README.md` | MODIFY | Cập nhật dashboard Tuần 6 đánh dấu hoàn thành từ Day 1 đến Day 6 |
| `ROADMAP.md` | MODIFY | Cập nhật tiến độ Tuần 6 hoàn thành Milestone 3 |
| `docs/plans/week-06-complete-curriculum.md` | CREATE | Lưu trữ bản kế hoạch Tuần 6 |
| `docs/plans/_ACTIVE.md` | MODIFY | Đăng ký active/closed plan |
| `docs/AGENT_STATE.md` | MODIFY | Cập nhật shared state |

---

## 4. Implementation Checklist

### Part 1: Day 1 (Thứ 2) — DSA: Search Insert Position (LeetCode #35 - Easy)
- [x] `coding/week-06/01-search-insert-position.test.js`: Viết bộ kiểm thử Test-First (8 test cases):
  - [x] TC-01: Guard clauses & Invalid / Empty inputs (`null`, `undefined`, mảng rỗng trả về `0`).
  - [x] TC-02: Target tồn tại ở giữa mảng: `[1, 3, 5, 6]`, target = 5 $\rightarrow$ trả về `2`.
  - [x] TC-03: Target không tồn tại, chèn vào giữa: `[1, 3, 5, 6]`, target = 2 $\rightarrow$ trả về `1`.
  - [x] TC-04: Target không tồn tại, chèn vào cuối mảng: `[1, 3, 5, 6]`, target = 7 $\rightarrow$ trả về `4`.
  - [x] TC-05: Target không tồn tại, chèn vào đầu mảng: `[1, 3, 5, 6]`, target = 0 $\rightarrow$ trả về `0`.
  - [x] TC-06: Mảng 1 phần tử boundary: `[1]`, target = 0 $\rightarrow$ `0`; `[1]`, target = 2 $\rightarrow$ `1`.
  - [x] TC-07: Mảng chứa số âm và số 0: `[-10, -5, 0, 3, 9]`, target = -7 $\rightarrow$ trả về `1`.
  - [x] TC-08: Stress test hiệu năng: 100,000 phần tử tìm kiếm/chèn trong $< 0.1\text{ms}$ ($O(\log n)$ logarithmic scaling).
- [x] `coding/week-06/01-search-insert-position.js`: Hiện thực giải thuật ($O(\log n)$ time, $O(1)$ space):
  - [x] Line 1 Guard clause an toàn.
  - [x] Vòng lặp `while (left <= right)` với `mid = left + Math.floor((right - left) / 2)`.
  - [x] Invariant: Khi kết thúc vòng lặp, `left` là vị trí chèn chuẩn xác.
- [x] `coding/week-06/01-search-insert-position.md`: Cẩm nang 3-file tinh gọn với kịch bản 6 bước tiếng Anh.

### Part 2: Day 2 (Thứ 3) — Database & Redis Architecture: Sentinel, Cluster & Eviction
- [x] `architecture/week-06/02-redis-sentinel-cluster-eviction.test.js`: Viết bộ kiểm thử Test-First (6 test cases):
  - [x] TC-01: Redis Cluster Hash Slot routing: Xác thực CRC16 `% 16384` phân bổ chính xác vào 3 Master Shards.
  - [x] TC-02: Hash Tag `{...}`: Kiểm chứng `{user:101}:profile` và `{user:101}:orders` rơi vào cùng 1 slot trên cùng node.
  - [x] TC-03: Redis Sentinel Subjective (`+sdown`) vs Objective (`+odown`): Cần Quorum $\ge 2/3$ Sentinel đồng thuận để kích hoạt failover.
  - [x] TC-04: Sentinel Automatic Failover: Thăng cấp Replica thành Master mới, chuyển hướng client trong suốt, 0 mất mát cấu hình.
  - [x] TC-05: LRU Eviction Policy: Thuật toán loại bỏ phần tử truy cập xa nhất khi vượt ngưỡng bộ nhớ (`maxMemoryKeys`).
  - [x] TC-06: LFU Eviction Policy: Thuật toán loại bỏ phần tử có tần suất truy cập thấp nhất, xử lý tie-breaking theo thời gian.
- [x] `architecture/week-06/02-redis-sentinel-cluster-eviction.js`: Hiện thực Redis HA & Eviction Engine:
  - [x] `class MockRedisCluster`: Mô phỏng 16384 hash slots, CRC16 hashing, routing và hash tags.
  - [x] `class MockRedisSentinel`: Giám sát heartbeat, phát hiện node sập và tự động kích hoạt failover qua quorum.
  - [x] `class CacheEvictionManager`: Hiện thực bộ giải phóng bộ nhớ `LRU` và `LFU`.
- [x] `architecture/week-06/02-redis-sentinel-cluster-eviction.md`: Cẩm nang kiến trúc Redis HA & Sentinel Failover.

### Part 3: Day 3 (Thứ 4) — DSA: Maximum Subarray / Kadane's Algorithm (LeetCode #53 - Medium)
- [x] `coding/week-06/03-maximum-subarray-kadane.test.js`: Viết bộ kiểm thử Test-First (8 test cases):
  - [x] TC-01: Guard clauses & Invalid / Empty inputs.
  - [x] TC-02: Trường hợp chuẩn LeetCode: `[-2, 1, -3, 4, -1, 2, 1, -5, 4]` trả về `6` (mảng con `[4, -1, 2, 1]`).
  - [x] TC-03: **Bẫy sống còn ANZ: Mảng toàn số âm** `[-5, -1, -8, -3]` trả về `-1` (chứng minh khởi tạo `nums[0]`).
  - [x] TC-04: Mảng toàn số dương: `[1, 2, 3, 4]` trả về `10`.
  - [x] TC-05: Mảng 1 phần tử: `[5]` $\rightarrow$ `5`, `[-3]` $\rightarrow$ `-3`.
  - [x] TC-06: Mảng chứa số 0 và xen kẽ âm dương: `[0, -2, 0, 3, -1, 2, 0]` trả về `4`.
  - [x] TC-07: Truy vết chỉ mục mảng con: Trả về chính xác `{ maxSum, start, end, subarray }`.
  - [x] TC-08: Stress test hiệu năng: 50,000 số thực hiện trong $< 5\text{ms}$ ($O(n)$ linear scaling).
- [x] `coding/week-06/03-maximum-subarray-kadane.js`: Hiện thực thuật toán Kadane ($O(n)$ time, $O(1)$ space):
  - [x] Khởi tạo an toàn: `currentSum = nums[0]`, `maxSum = nums[0]`.
  - [x] Cập nhật: `currentSum = Math.max(nums[i], currentSum + nums[i])`.
  - [x] Cơ chế truy vết chỉ mục bắt đầu và kết thúc của mảng con tối ưu.
- [x] `coding/week-06/03-maximum-subarray-kadane.md`: Cẩm nang 3-file tinh gọn kèm 6 bước tiếng Anh.

### Part 4: Day 4 (Thứ 5) — Database & Redis Architecture: Redlock Consensus Deep Dive
- [x] `architecture/week-06/04-redis-redlock-consensus.test.js`: Viết bộ kiểm thử Test-First (6 test cases):
  - [x] TC-01: Đồng thuận Quorum: Khóa thành công khi chiếm được $\ge 3/5$ node trong khoảng thời gian hợp lệ (`validityTime`).
  - [x] TC-02: Thất bại & Rollback tức thời: Nếu không đủ quorum (ví dụ 3 node lỗi), giải phóng toàn bộ khóa trên các node đã cấp.
  - [x] TC-03: Clock Drift & Validity Time: Khóa bị hủy nếu thời gian chiếm dụng vượt quá TTL trừ độ trôi đồng hồ (`drift`).
  - [x] TC-04: Loại trừ tương hỗ (Mutual Exclusion): Hai worker cạnh tranh cùng tài nguyên, chỉ đúng 1 worker giành được lock.
  - [x] TC-05: Fencing Token: Storage layer từ chối lệnh ghi nếu mang fencing token cũ (chống worker trễ ghi đè).
  - [x] TC-06: High-Concurrency Banking Benchmark: 50 luồng chuyển tiền đồng thời, bảo đảm 100% tính toàn vẹn số dư.
- [x] `architecture/week-06/04-redis-redlock-consensus.js`: Hiện thực Redlock Consensus Engine:
  - [x] `class RedlockManager`: Quản lý 5 instance Redis độc lập, tính toán validity time và clock drift.
  - [x] `class FencingTokenStorage`: Lưu trữ và kiểm tra token đơn điệu tăng dần.
- [x] `architecture/week-06/04-redis-redlock-consensus.md`: Cẩm nang kỹ thuật Redlock và tranh luận Martin Kleppmann vs Antirez.

### Part 5: Day 5 (Thứ 6) — Binary Search Boundary Drill & Friday Recall Test 15m
- [x] `coding/week-06/05-binary-search-boundary-and-recall.test.js`: Viết bộ kiểm thử Test-First (8 test cases):
  - [x] TC-01: Friday Recall Test 15m — Best Time to Buy and Sell Stock từ trí nhớ.
  - [x] TC-02: Boundary Drill — Guard clauses và dữ liệu không hợp lệ.
  - [x] TC-03: First Bad Version ở đầu, giữa, cuối danh sách.
  - [x] TC-04: Toàn bộ phiên bản đều tốt hoặc toàn bộ đều hỏng.
  - [x] TC-05: Danh sách chỉ có 1 phiên bản.
  - [x] TC-06: Invariant tối ưu số lần gọi API: Đạt đúng $\le \lceil \log_2 n \rceil + 1$ lần gọi.
  - [x] TC-07: Invariant con trỏ: `left` hội tụ đúng phiên bản lỗi đầu tiên.
  - [x] TC-08: Stress test 1,000,000 phiên bản tìm kiếm trong $< 0.05\text{ms}$.
- [x] `coding/week-06/05-binary-search-boundary-and-recall.js`:
  - [x] `fridayRecallBestTimeToBuyStock(prices)`: Thuật toán mua bán cổ phiếu từ trí nhớ kèm comment recall.
  - [x] `firstBadVersion(n, isBadVersion)`: Template tìm kiếm cận dưới (Lower Bound / First Occurrence).
- [x] `coding/week-06/05-binary-search-boundary-and-recall.md`: Cẩm nang Binary Search Lower Bound & 6 bước tiếng Anh.

### Part 6: Day 6 (Thứ 7) — Behavioral STAR Story 5 & Milestone 3 Retrospective
- [x] `notes/week-06/day-06-star-story-5-and-phase-2a-retrospective.md`:
  - [x] STAR Story 5: Xử lý sự cố mạng phân vùng (Split-Brain) trên cụm Redis và phục hồi giao dịch không mất mát dữ liệu.
  - [x] Follow-up Q&A tiếng Anh chuẩn ANZ.
  - [x] Scorecard Tuần 6 & Milestone 3 Retrospective (30 test suites, 230+ tests pass 100%).

### Part 7: Cấu hình Hệ thống & Regression Testing
- [x] `package.json`: Cập nhật scripts `test:w6-01` đến `test:w6-05`, tích hợp vào `test` / `test:all`.
- [x] `README.md`: Cập nhật dashboard Tuần 6.
- [x] `ROADMAP.md`: Cập nhật tiến độ hoàn thành Milestone 3.
- [x] `docs/plans/week-06-complete-curriculum.md`: Lưu trữ file kế hoạch.
- [x] `docs/plans/_ACTIVE.md`: Đăng ký plan registry.
- [x] `docs/AGENT_STATE.md`: Cập nhật trạng thái handoff.
- [x] Chạy `npm test` toàn hệ thống xác nhận 30/30 test suites pass 100%.
- [ ] `ROADMAP.md`: Cập nhật tiến độ hoàn thành Milestone 3.
- [ ] `docs/plans/week-06-complete-curriculum.md`: Lưu trữ file kế hoạch.
- [ ] `docs/plans/_ACTIVE.md`: Đăng ký plan registry.
- [ ] `docs/AGENT_STATE.md`: Cập nhật trạng thái handoff.
- [ ] Chạy `npm test` toàn hệ thống xác nhận 30/30 test suites pass 100%.

---

## 5. Git Proposal

- **Feature Branch**: `feat/week-06-complete-curriculum`
- **Commit Message**: `feat(week-06): complete week 6 curriculum — search insert, redis sentinel & cluster, kadane, redlock & boundary drill`
- **Target Branch**: `main`

---

## 6. Verification Command

```bash
# 1. Chạy từng suite riêng biệt
npm run test:w6-01
npm run test:w6-02
npm run test:w6-03
npm run test:w6-04
npm run test:w6-05

# 2. Regression test toàn hệ thống
npm test
```

---

## 7. Out of Scope

- Không triển khai Apache Kafka hay Transactional Outbox (dành riêng cho Tuần 7 - Milestone 4).
- Không thêm bất kỳ package npm bên ngoài nào (tuân thủ nguyên tắc zero npm dependencies).

