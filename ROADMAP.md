# Implementation Plan: Khởi tạo Project Ôn tập Phỏng vấn Backend (HCLTech x ANZ)

## Objective
Thiết lập toàn bộ cấu trúc dự án `training-anz` (`anz-interview-prep`) theo đúng phương pháp Problem-Based Learning (PBL) và kỷ luật 60 phút mỗi sáng (05:00 - 06:00). Dự án được thiết kế chuyên biệt cho vòng phỏng vấn kỹ thuật ANZ Bank (Stage 1: Coding & Behavioral; Stage 2: System Design), sử dụng JavaScript thuần, zero external dependencies, sẵn sàng cho buổi học đầu tiên sáng mai về bài toán **Move Zeroes**.

> [!NOTE]
> **Giai đoạn thử nghiệm (Pilot Phase):** Các ngày còn lại trong tuần này dành để kiểm thử quy trình (workflow), test runner và tính tương thích của template. Lộ trình chính thức (Official Roadmap) sẽ được kích hoạt toàn diện bắt đầu từ **Thứ Hai tuần sau**.

---

## ANZ Interview Format & "2 bài Medium" Reality
- **Format chuẩn ANZ**: 2 phiên riêng biệt (mỗi phiên 1 tiếng: 15m Behavioral + 45m Live Coding trên HackerRank).
- **Bản chất "2 bài Medium"**: Không phải giải thuật hóc búa hay quy hoạch động nhiều chiều, mà là **bài Easy được nâng cấp thêm 1 bước biến thể**:
  - *Two Sum (Easy)* $\rightarrow$ **3Sum** hoặc **Two Sum II** (thêm 1 vòng lặp cố định 1 số).
  - *Move Zeroes (Easy)* $\rightarrow$ **Remove Duplicates II** hoặc **Container With Most Water** (đổi điều kiện di chuyển con trỏ).
  - *Valid Parentheses (Easy)* $\rightarrow$ **Min Stack** (kỹ thuật 2 stack song song).
  - *Mảng con*: **Maximum Subarray (Kadane)** (code 5-7 dòng) & **Longest Substring Without Repeating Characters** (Sliding Window + Set/Map).
- **Tiêu chí chấm điểm ANZ**: *"It's not always about getting the exact solution, the interviewer is more interested in your approach to problem solving and how you communicate this."*
- **Quy trình chuẩn 45m Coding**: Brute-force ($O(n^2)$) $\rightarrow$ Chỉ ra điểm nghẽn bottleneck $\rightarrow$ Đề xuất tối ưu (Map/Two Pointers) $\rightarrow$ Vừa gõ vừa Think Out Loud $\rightarrow$ Dry Run và chốt độ phức tạp.

---

## 🚨 Những lưu ý sống còn (Survival Tips & Traps)
1. **Quy tắc Code An Toàn (Guard Clauses)**: Bắt buộc dòng 1 của mọi hàm luôn là bắt các edge cases: `if (!arr || arr.length === 0) return ...`. Tuyệt đối không để xảy ra lỗi `Cannot read properties of null`.
2. **Bẫy hiệu năng JS (Performance Traps)**: **TUYỆT ĐỐI KHÔNG** dùng `splice()` hoặc `unshift()` bên trong vòng lặp vì chúng tốn $O(n)$ thời gian dịch chuyển chỉ mục, khiến giải thuật lùi về $O(n^2)$.
3. **Cẩn trọng khởi tạo (Initialization Traps)**: Trong các thuật toán cộng dồn (như Kadane), khởi tạo `maxSum = nums[0]`, KHÔNG khởi tạo bằng `0` vì sẽ sai khi mảng toàn số âm.
4. **Môi trường màn hình thô (Raw Text Editor)**: Rèn luyện tính chính xác từng dấu ngoặc, vì có thể người phỏng vấn sẽ yêu cầu gõ trên Google Docs/Notepad, hoàn toàn không có gợi ý IDE.
5. **Tiếng Anh phỏng vấn**: Từ khóa kỹ thuật quan trọng hơn ngữ pháp. Chấp nhận nói vấp, miễn là nói to được luồng suy nghĩ (*Think Out Loud*) để tạo cơ hội cho kỹ sư ANZ đưa Hint.

---

## Milestone Roadmap (Lộ trình chiến lược 12 Tuần HCLTech x ANZ)
Lộ trình được thiết kế chuẩn mực 12 tuần bền vững (kỷ luật 60 phút mỗi sáng 05:00 - 06:00 AM), tuân thủ nghiêm ngặt [Weekly Curriculum Balance & Anti-Burnout Protocol](#weekly-curriculum-balance--anti-burnout-protocol): xen kẽ Thứ 2, 4, 6 học DSA Coding (tối đa 1 bài Medium/tuần); Thứ 3, 5 học System Design/Database (tuyệt đối cấm giải LeetCode); Thứ 7 luyện STAR Story; Chủ nhật nghỉ ngơi hoàn toàn.

### 🏁 Milestone 0: Pilot Week (Hoàn thành 100%)
- **Mục tiêu**: Thử nghiệm nhịp sinh học 05:00 AM, kiểm thử test-runner native assert, template PBL, và GitHub Actions automation.
- **DSA**: Move Zeroes (In-place Two Pointers $O(1)$ space).

---

### 🧱 Giai đoạn 1 (Weeks 1 - 4): Node.js Internals, Tối ưu CSDL & DSA Nền tảng

#### ✅ Milestone 1 (Weeks 1 - 2): `Phase 1A: Two Pointers, Hashing, Event Loop & Streams` (HOÀN THÀNH 100% - 80/80 Tests Pass)
- **DSA Cốt lõi**:
  - Valid Palindrome, Two Sum II (Sorted Two Pointers).
  - Two Sum & Contains Duplicate (Hash Map & Set space-time tradeoff).
  - Valid Anagram & Group Anagrams (Frequency Hashing).
  - 3Sum & Container With Most Water (Two Pointers Medium).
  - Longest Substring Without Repeating Characters (Single-Pass Sliding Window).
- **Node.js Internals**:
  - Libuv Architecture & 6 pha Event Loop.
  - Microtasks (`nextTick`, `Promise`) vs Macrotasks (`setTimeout`, `setImmediate`) & Event Loop Starvation.
  - Node.js Custom Streams & Backpressure mechanism (`highWaterMark`, `drain`, `pipeline()`).
- **Behavioral (STAR)**:
  - Story 1: Bất đồng quan điểm kỹ thuật (Technical Disagreement), dùng benchmark data để tạo đồng thuận.
  - Story 2: Xử lý sự cố nghiêm trọng Production (Sev-1 Outage, K8s Pod OOMKilled, RCA & Zero Data Loss).

#### 🚀 Milestone 2 (Weeks 3 - 4): `Phase 1B: Stack, Linked List & RDBMS Deep Dive` (ĐANG THỰC HIỆN)
- **Tuần 3 (Tuần 100% Easy DSA + Database Internals - Giảm tải nhận thức)**:
  - **Day 1 (T2)**: [Valid Parentheses](coding/week-03/01-valid-parentheses.md) (LeetCode #20 - Easy) — Cơ chế Stack LIFO, Map lookup, Guard Clause kiểm tra độ dài lẻ early exit trong $O(1)$.
  - **Day 2 (T3)**: [Database Deep Dive 1: B+Tree Index Architecture](notes/week-03/day-02-btree-indexing.md) — Clustered vs Non-Clustered Index, Covering Index & `EXPLAIN ANALYZE` (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 3 (T4)**: [Reverse Linked List](coding/week-03/02-reverse-linked-list.md) (LeetCode #206 - Easy) — Thao tác 3 con trỏ trượt `prev`, `curr`, `next` in-place $O(1)$ space (12 dòng code).
  - **Day 4 (T5)**: Database Concurrency — 4 Cấp độ cô lập ACID (Dirty, Non-repeatable, Phantom Read), MVCC & Locking (Pessimistic `SELECT FOR UPDATE` vs Optimistic `version`) (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 5 (T6)**: [Linked List Cycle](coding/week-03/03-linked-list-cycle.md) (LeetCode #141 - Easy) — Thuật toán Rùa & Thỏ (Floyd's Tortoise & Hare) $O(n)$ time, $O(1)$ space. 🆕 **Kèm Friday Recall Test 15m** (gõ lại 1 bài tuần 1 hoặc 2 từ trí nhớ).
  - **Day 6 (T7)**: Behavioral STAR Story 3 — Đàm phán phạm vi với PO dưới áp lực tiến độ (Tight Deadline vs Tech Debt) & Week 3 Retrospective.
  - **Chủ Nhật**: Nghỉ ngơi hoàn toàn.
- **Tuần 4 (Kết thúc Phase 1B & Database Scaling - Áp dụng chuẩn 3-File Output)**:
  - **Day 1 (T2)**: Merge Two Sorted Lists (LeetCode #21 - Easy) — Kỹ thuật Dummy Head Node ghép 2 danh sách giao dịch (Áp dụng chuẩn 3-file tinh gọn, không tạo visualizer).
  - **Day 2 (T3)**: Database Connection Pooling trong Node.js — Kiến trúc `pg-pool` / `HikariCP`, tính toán pool sizing, timeout và chống leak connection khi có traffic spike (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 3 (T4)**: Min Stack (LeetCode #155 - **Bài LeetCode Medium DUY NHẤT của tuần**) — Kỹ thuật 2 stack song song để `getMin()` trong $O(1)$ time.
  - **Day 4 (T5)**: Database Sharding & Replication Lag — Kiến trúc Master-Slave, giải quyết bài toán Đọc sau khi Ghi (Read-Your-Own-Writes consistency) (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 5 (T6)**: Mock HackerRank 45m trên màn hình thô (ôn tập Stack & Linked List) + 🆕 **Friday Recall Test 15m** (gõ lại 3Sum hoặc Container With Most Water).
  - **Day 6 (T7)**: Tổng kết Milestone 2 (Phase 1B Retrospective) & Review STAR Story 1 - 3.
  - **Chủ Nhật**: Nghỉ ngơi hoàn toàn.

---

### 🚀 Giai đoạn 2 (Weeks 5 - 8): Kiến trúc phân tán & Data Platform System Design

#### 📦 Milestone 3 (Weeks 5 - 6): `Phase 2A: Caching Architecture & Redis Deep Dive`
- **Tuần 5 (Redis Caching Core & Binary Search Nền Tảng - Tuần 0-Medium)**:
  - **Day 1 (T2)**: Best Time to Buy and Sell Stock (LeetCode #121 - Easy) — Duyệt 1 lượt $O(n)$, code 10 dòng, khởi động tuần nhẹ nhàng (Early-Week Gate).
  - **Day 2 (T3)**: Redis Caching Deep Dive 1 — Cache-Aside (Lazy Loading) vs Write-Through / Write-Behind & Kỹ thuật TTL Jitter chống Cache Stampede / Avalanche (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 3 (T4)**: 🆕 **Mid-Phase Recall & Consolidation Day** — Gõ lại Longest Substring Without Repeating Characters (Sliding Window) & ôn tập B+Tree Index từ trí nhớ (Không giải LeetCode mới để dành tải nhận thức hấp thụ kiến trúc Redis).
  - **Day 4 (T5)**: Redis Caching Deep Dive 2 — Cache Penetration (Bloom Filter, Null Object) & Distributed Lock Redlock cơ bản kiểm soát race condition trừ tiền (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 5 (T6)**: Binary Search Standard Template (LeetCode #704 - Easy) — Template chuẩn tránh tràn số `mid = left + Math.floor((right - left) / 2)` (code 10 dòng) + 🆕 **Friday Recall Test 15m** (gõ lại Move Zeroes hoặc Two Sum).
  - **Day 6 (T7)**: Behavioral STAR Story follow-up & Deep dive kịch bản xử lý lỗi cache phân tán.
  - **Chủ Nhật**: Nghỉ ngơi hoàn toàn.
- **Tuần 6 (Redis Advanced & Kadane Maximum Subarray - 1 Medium/Tuần)**:
  - **Day 1 (T2)**: Search Insert Position (LeetCode #35 - Easy) — Biến thể Binary Search tìm vị trí chèn, củng cố boundary check (Khởi động tuần nhẹ nhàng).
  - **Day 2 (T3)**: Redis Advanced & High Availability — Redis Sentinel, Redis Cluster Sharding, Failover scenarios & Memory Eviction policies (LRU/LFU) (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 3 (T4)**: Maximum Subarray / Kadane's Algorithm (LeetCode #53 - **Bài LeetCode Medium DUY NHẤT của tuần**) — Thuật toán Kadane $O(n)$ time, $O(1)$ space, bẫy khởi tạo `maxSum = nums[0]`.
  - **Day 4 (T5)**: Distributed Lock Redlock Deep Dive — Thuật toán Redlock với 5 node Redis độc lập, clock drift analysis và fencing token (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 5 (T6)**: Binary Search Boundary Drill (First Bad Version style - Easy) + 🆕 **Friday Recall Test 15m** (gõ lại Best Time to Buy Stock hoặc Valid Anagram).
  - **Day 6 (T7)**: Phase 2A Retrospective (Tổng kết kiến trúc Caching & Redis) + STAR Story review.
  - **Chủ Nhật**: Nghỉ ngơi hoàn toàn.

#### ⚡ Milestone 4 (Weeks 7 - 8): `Phase 2B: Event-Driven Kafka & Transactional Consistency`
- **Tuần 7 (Kafka Architecture & Rotated Binary Search - 1 Medium/Tuần)**:
  - **Day 1 (T2)**: 🆕 **Phase Kick-off Recall Day** — Gõ lại Kadane & Merge Two Sorted Lists từ trí nhớ (20m) + Khởi động tuần nhẹ nhàng.
  - **Day 2 (T3)**: Apache Kafka Architecture — Phân bổ Partition Key theo Customer Account ID bảo đảm thứ tự nghiêm ngặt, Consumer Group & Rebalance protocol (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 3 (T4)**: Search in Rotated Sorted Array (LeetCode #33 - **Bài LeetCode Medium DUY NHẤT của tuần**) — Biến thể Binary Search xác định nửa đã sắp xếp (Sorted Half Invariant).
  - **Day 4 (T5)**: Transactional Outbox Pattern — Tích hợp Debezium CDC đọc PostgreSQL outbox table đẩy vào Kafka, chống mất giao dịch tài chính (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 5 (T6)**: Linked List Cycle II / Floyd's Cycle Review (Easy/Medium-light, có visualizer Rùa & Thỏ) + 🆕 **Friday Recall Test 15m** (gõ lại Binary Search).
  - **Day 6 (T7)**: Behavioral STAR Story 4 (Data Pipeline / Event-driven Failure) + Week 7 Review.
  - **Chủ Nhật**: Nghỉ ngơi hoàn toàn.
- **Tuần 8 (Kafka Reliability, Idempotency & Tổng Kết Phase 2 - Tuần 0-Medium)**:
  - **Day 1 (T2)**: Mock HackerRank 45m (Binary Search + Array/String mixed Easy) — Rèn luyện phản xạ gõ trên màn hình thô.
  - **Day 2 (T3)**: Idempotency Key Design — Thiết kế API thanh toán chống double-charging khi client retry mạng, kết hợp Redis TTL & DB Unique Constraint (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 3 (T4)**: 🆕 **Comprehensive Mid-Phase Recall Day** — Gõ lại 2 thuật toán cốt lõi từ trí nhớ (Phase 1 & Phase 2A) hoàn toàn không xem code mẫu.
  - **Day 4 (T5)**: Kafka Reliability & Consumer Lag — Tinh chỉnh `max.poll.interval.ms`, Heartbeat thread, Dead Letter Queue (DLQ) & Exactly-Once Semantics (EOS) (TUYỆT ĐỐI CẤM GIẢI LEETCODE).
  - **Day 5 (T6)**: Live Coding Drill 45m trên màn hình thô (ôn tập biến thể mảng/chuỗi) + 🆕 **Friday Recall Test 15m**.
  - **Day 6 (T7)**: Milestone 4 Retrospective (Khép lại trọn vẹn Phase 2: Caching, Kafka & Consistency).
  - **Chủ Nhật**: Nghỉ ngơi hoàn toàn.

---

### 🛡️ Giai đoạn 3 (Weeks 9 - 11): Kịch bản thực tế ngân hàng & Tích hợp liên hoàn

#### 🏦 Milestone 5 (Weeks 9 - 11): `Phase 3: Banking Real-time Scenarios & STAR Mastery`
- **DSA Live Coding**: Không học bài mới. Tập trung Live Coding mô phỏng bấm giờ 45 phút trên Notepad/Google Docs, vừa gõ vừa nói tiếng Anh theo kịch bản 6 bước.
- **System Design**:
  - Thiết kế hoàn chỉnh: **Real-time Ledger & Transaction Settlement System** (Hệ thống sổ cái giao dịch thời gian thực).
  - Cơ chế phòng vệ hệ thống: **Rate Limiting** (Token Bucket / Sliding Window Counter) & **Circuit Breaker** (chống sập dây chuyền).
  - High Availability & Multi-Region Active-Active Data Platform.
- **English & STAR**: Rèn luyện trôi chảy 3 kịch bản STAR và phản biện System Design bằng tiếng Anh.

---

### 🎯 Giai đoạn 4 (Week 12): Full Mock Interviews & Sẵn sàng lâm trận

#### 🎓 Milestone 6 (Week 12): `Phase 4: Full ANZ Mock Simulation`
- Giả lập trọn vẹn 2 tiếng chuẩn format ANZ Bank:
  - **Phiên 1 (60 phút)**: 15m Behavioral (STAR) + 45m Coding HackerRank (1 bài Easy + 1 bài biến thể).
  - **Phiên 2 (60 phút)**: System Design đối thoại trực tiếp 2 chiều về hệ thống Data Platform ngân hàng.

---

## Affected Files
| File Path | Action | Purpose |
|---|---|---|
| `package.json` | NEW | Quản lý thông tin dự án và script chạy test kiểm chứng (`npm test`) |
| `.gitignore` | NEW | Bỏ qua các file rác môi trường, log, os metadata |
| `README.md` | NEW | Bản đồ tiến độ, lịch sinh hoạt 60m/ngày, khung giao tiếp tiếng Anh Intermediate, hướng dẫn PBL |
| `coding/week-01/01-move-zeroes.test.js` | NEW | Unit test kiểm thử bài toán Move Zeroes (chạy bằng `node:assert`, test-first) |
| `coding/week-01/01-move-zeroes.js` | NEW | Solution JavaScript in-place $O(n)$ time / $O(1)$ space |
| `coding/week-01/01-move-zeroes.md` | NEW | Tài liệu PBL: Problem Scenario, Pain Point $O(n^2)$, English Dialogue Script, Pattern Synthesis |
| `architecture/week-01/01-system-design-template.md` | NEW | Template và kịch bản System Design phân tán (Cache-Aside, Kafka, Outbox, Node.js internals) |
| `architecture/week-01/02-behavioral-star-template.md` | NEW | Template chuẩn bị câu chuyện phỏng vấn hành vi theo cấu trúc STAR |
| `.github/workflows/pr-automation.yml` | NEW | GitHub Actions tự động hóa PR: gán Assignee, gán Milestone thông minh, gán Label theo branch |
| `.github/workflows/ci.yml` | NEW | GitHub Actions tự động chạy `npm test` khi tạo/cập nhật PR để đảm bảo chất lượng code |

---

## Implementation Checklist
*(Tuân thủ nguyên tắc Test-First: Test cases được định nghĩa và tạo trước mã nguồn)*

- [x] 1. Test Suite: Tạo `coding/week-01/01-move-zeroes.test.js` với các test case:
  - Input rỗng: `[]` $\rightarrow$ `[]`
  - Không có số 0: `[1, 2, 3]` $\rightarrow$ `[1, 2, 3]`
  - Toàn bộ số 0: `[0, 0, 0]` $\rightarrow$ `[0, 0, 0]`
  - Số 0 ở đầu/cuối/xen kẽ: `[0, 1, 0, 3, 12]` $\rightarrow$ `[1, 3, 12, 0, 0]`
  - Mảng có số âm: `[-1, 0, 0, -2, 5]` $\rightarrow$ `[-1, -2, 5, 0, 0]`
  - Đảm bảo sửa đổi in-place trên chính mảng đầu vào (mutate original reference).
- [x] 2. Config: Tạo `.gitignore` chuẩn cho JavaScript/Node.js.
- [x] 3. Config: Tạo `package.json` với script `test: "node coding/week-01/01-move-zeroes.test.js"`.
- [x] 4. Code: Tạo `coding/week-01/01-move-zeroes.js` hiện thực thuật toán Two Pointers (Write/Read pointers) $O(n)$ time, $O(1)$ auxiliary space.
- [x] 5. Docs/Script: Tạo `coding/week-01/01-move-zeroes.md` đầy đủ 5 bước PBL và English script (Clarify, Brute-force, Optimize, Think Out Loud, Dry Run, Conclusion).
- [x] 6. Architecture: Tạo `architecture/week-01/01-system-design-template.md` chuẩn bị cho ngày lẻ (Redis Cache-Aside, Node.js Event Loop, Kafka).
- [x] 7. Behavioral: Tạo `architecture/week-01/02-behavioral-star-template.md` chuẩn bị cho Thứ Bảy (STAR Model).
- [x] 8. Core Portal: Tạo `README.md` tích hợp Dashboard theo dõi tiến độ từng ngày, hướng dẫn chi tiết kịch bản luyện tập 60m mỗi sáng.
- [x] 9. GitHub Actions Automation: Tạo `.github/workflows/pr-automation.yml` (Auto Assignee, Auto Milestone, Auto Label theo branch: `enhancement`, `bug`, `documentation`, `refactor`, `test`, `system-design`).
- [x] 10. GitHub Actions CI: Tạo `.github/workflows/ci.yml` (Tự động chạy `npm test` trên Node 18/20 khi mở PR).

---

## Detailed Changes Per File

### 1. `coding/week-01/01-move-zeroes.test.js`
- Sử dụng built-in module `assert` của Node.js (tương thích mọi phiên bản Node.js, không cần thư viện ngoài).
- Định nghĩa hàm `runTests()` thực thi 5 kịch bản kiểm thử:
  - Empty array verification.
  - No zeroes array.
  - All zeroes array.
  - Standard LeetCode example (`[0, 1, 0, 3, 12]`).
  - Mixed positive and negative integers with zeroes.
  - Reference equality check (`nums === returnRef` để đảm bảo strictly in-place).

### 2. `.gitignore`
- Bỏ qua: `node_modules/`, `npm-debug.log*`, `.DS_Store`, `.env`, `*.log`.

### 3. `package.json`
- Tên package: `anz-interview-prep`
- Type: `commonjs` (thuần cho HackerRank style và Node.js native).
- Scripts: `"test": "node coding/week-01/01-move-zeroes.test.js"`.

### 4. `coding/week-01/01-move-zeroes.js`
- Hàm: `function moveZeroes(nums)`
- Thuật toán Two Pointers:
  - `writeIndex = 0`
  - Vòng lặp `readIndex` từ 0 tới `nums.length - 1`.
  - Khi gặp `nums[readIndex] !== 0`:
    - Nếu `readIndex !== writeIndex`, gán `nums[writeIndex] = nums[readIndex]` và `nums[readIndex] = 0` (hoặc swap).
    - Tăng `writeIndex++`.
  - In-place modification, trả về `nums` để tiện chaining/asserting.
  - Time Complexity: $O(n)$
  - Space Complexity: $O(1)$

### 5. `coding/week-01/01-move-zeroes.md`
- Cấu trúc 5 bước PBL:
  1. Problem Scenario: Bài toán gom các giao dịch không hợp lệ/chờ xử lý về cuối batch trong hệ thống thanh toán.
  2. Pain Point: Tại sao `filter()` hoặc `splice()` là $O(n^2)$ hoặc lãng phí bộ nhớ trên hàng triệu giao dịch.
  3. Discovery & Coding: Hai con trỏ Đọc/Ghi.
  4. Open Dialogue & English Scripting (Intermediate B1-B2): Kịch bản nói to thành tiếng từng bước.
  5. Pattern Synthesis: *"When an in-place array reordering is required while preserving order, use a Read Pointer and a Write Pointer."*

### 6. `architecture/week-01/01-system-design-template.md`
- Khung phản biện thiết kế hệ thống 30 phút:
  - Step 1: Clarify Scope & Functional / Non-Functional Requirements.
  - Step 2: High-Level Architecture (API Gateway, Node.js Service, Redis Cache, Kafka, Database).
  - Step 3: Deep Dive (Cache-Aside, TTL Jitter, Transactional Outbox pattern, Idempotency).
  - Step 4: Resiliency & Failure Modes.

### 7. `architecture/week-01/02-behavioral-star-template.md`
- Khung phản hồi STAR (Situation - Task - Action - Result) 15 phút đầu vòng phỏng vấn ANZ:
  - Engineering conflict resolution.
  - High-pressure production incident resolution.
  - Trade-off between speed and code quality.

### 8. `README.md`
- Tổng quan mục tiêu HCLTech x ANZ Bank.
- Lịch sinh hoạt 05:00 - 06:00 AM.
- Bảng checklist 4 tuần (Week 01 đến Week 04).
- Bộ mẫu giao tiếp tiếng Anh chuẩn.

### 9. `.github/workflows/pr-automation.yml`
- Chuẩn hóa theo cấu trúc của `perfume-bot-backend`:
  - **Auto Assignee**: Tự động gán người tạo PR vào Assignee.
  - **Auto Milestone**: Đọc từ mô tả PR (`milestones: <tên>`) hoặc commit message để gán milestone GitHub tương ứng.
  - **Auto Label**: Tự động phân loại nhãn theo tiền tố branch (`feature`/`feat` $\rightarrow$ `enhancement`, `fix` $\rightarrow$ `bug`, `docs` $\rightarrow$ `documentation`, `refactor` $\rightarrow$ `refactor`, `sys` $\rightarrow$ `system-design`).

### 10. `.github/workflows/ci.yml`
- Tự động hóa CI chạy trên GitHub Actions mỗi khi tạo hoặc cập nhật Pull Request vào nhánh chính (`main`).
- Chạy `node --test` hoặc `npm test` để xác thực toàn bộ test suite thuật toán luôn PASS trước khi merge.

---

## Data Model Changes
- Không có (N/A).

---

## Service & Business Logic
- Logic xử lý mảng in-place với Two Pointers đảm bảo không cấp phát thêm bộ nhớ phụ thuộc vào kích thước mảng đầu vào ($O(1)$ auxiliary space).
- Xử lý mảng rỗng hoặc mảng không có số 0 mượt mà mà không ném ngoại lệ (`guard clause`: `if (!nums || nums.length <= 1) return nums`).

---

## Test Plan
| Test Case | Input | Expected Output | Invariant Verified |
|---|---|---|---|
| TC-01: Empty array | `[]` | `[]` | Không lỗi index, mảng rỗng giữ nguyên |
| TC-02: Single element | `[0]` | `[0]` | Xử lý an toàn mảng 1 phần tử |
| TC-03: No zeroes | `[1, 2, 3]` | `[1, 2, 3]` | Thứ tự không đổi, không ghi đè nhầm |
| TC-04: All zeroes | `[0, 0, 0]` | `[0, 0, 0]` | Không vòng lặp vô hạn, mảng giữ nguyên toàn 0 |
| TC-05: Standard mixed | `[0, 1, 0, 3, 12]` | `[1, 3, 12, 0, 0]` | Đưa toàn bộ 0 về cuối, giữ nguyên thứ tự tương đối |
| TC-06: Negative numbers | `[-1, 0, 0, -2, 5]` | `[-1, -2, 5, 0, 0]` | Nhận diện đúng số âm không phải là 0 |
| TC-07: In-place check | `nums = [0, 1]` | `nums === result` | Reference mảng ban đầu được giữ nguyên |

---

## Git Proposal
- **Branch**: `feature/init-project-structure`
- **Commit Message**: `feat: initialize anz interview prep project with pbl framework and week 1 starter`

---

## Verification Command
```bash
node coding/week-01/01-move-zeroes.test.js
```

---

## Out of Scope
- Không cài đặt các thư viện ngoài nặng nề (Jest/Mocha/Babel/Webpack) để giữ môi trường tối giản, sát với điều kiện HackerRank thuần.
- Không triển khai các tuần học tiếp theo (Week 02+) trong lần khởi tạo này để giữ đúng phạm vi phiên làm việc.
