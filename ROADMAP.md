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
Lộ trình được thiết kế đúng chuẩn 12 tuần bền vững (60m mỗi sáng 05:00 - 06:00), chia thành 4 giai đoạn chiến lược, bao quát toàn bộ 15 bài DSA cốt lõi, Node.js Internals, CSDL, System Design phân tán và 3 câu chuyện STAR:

### 🏁 Milestone 0: Pilot Week (Tuần này)
- **Mục tiêu**: Thử nghiệm nhịp sinh học 05:00 AM, kiểm thử test-runner native, template PBL, và GitHub PR automation.
- **DSA**: Move Zeroes (In-place Two Pointers $O(1)$ space).

### 🧱 Giai đoạn 1 (Weeks 1 - 4): Node.js Internals, Tối ưu CSDL & DSA Nền tảng
- **Milestone 1 (Week 1 - 2): `Phase 1A: Two Pointers, Hashing & Event Loop`**
  - **DSA**: Valid Palindrome, Two Sum II / 3Sum, Two Sum, Contains Duplicate, Valid Anagram.
  - **Node.js Internals**: Libuv Architecture, 6 pha Event Loop (Timers $\rightarrow$ Pending $\rightarrow$ Idle $\rightarrow$ Poll $\rightarrow$ Check $\rightarrow$ Close), Microtasks (`nextTick`, `Promise`) vs Macrotasks (`setTimeout`, `setImmediate`).
  - **Behavioral (STAR)**: Story 1 - Bất đồng quan điểm kỹ thuật (Technical Disagreement), dùng dữ liệu benchmark để tạo đồng thuận.
- **Milestone 2 (Week 3 - 4): `Phase 1B: Stack, Streams, Backpressure & RDBMS Indexing`**
  - **DSA**: Valid Parentheses, Min Stack, Reverse Linked List, Linked List Cycle (Floyd's Tortoise & Hare), Merge Two Sorted Lists.
  - **Node.js Internals**: Node.js Streams (Readable, Writable, Transform) & Backpressure mechanism khi xử lý batch dữ liệu lớn không tràn RAM.
  - **Database Optimization**: B+Tree Indexing, Clustered vs Non-Clustered Index, đọc `EXPLAIN ANALYZE`, Covering Index, ACID Isolation Levels (Dirty, Non-repeatable, Phantom Read).
  - **Behavioral (STAR)**: Story 2 - Xử lý sự cố nghiêm trọng Production (Sev-1 Incident, Hotfix, RCA).

### 🚀 Giai đoạn 2 (Weeks 5 - 8): Kiến trúc phân tán & Data Platform System Design
- **Milestone 3 (Week 5 - 6): `Phase 2A: Caching Architecture & Redis Deep Dive`**
  - **DSA**: Maximum Subarray (Kadane), Best Time to Buy/Sell Stock, Longest Substring Without Repeating Characters.
  - **System Design**:
    - Cache-Aside (Lazy Loading) vs Write-Through / Write-Behind.
    - Xử lý Cache Stampede / Avalanche bằng **TTL Jitter**.
    - Xử lý Cache Penetration bằng Bloom Filter hoặc Null Object có TTL ngắn.
    - Khóa phân tán (Distributed Lock) với `SET key value NX EX` / Redlock kiểm soát race condition trừ tiền.
  - **Behavioral (STAR)**: Story 3 - Đàm phán phạm vi với PO dưới áp lực tiến độ gắt gao (Tight Deadline vs Tech Debt).
- **Milestone 4 (Week 7 - 8): `Phase 2B: Event-Driven Kafka & Transactional Consistency`**
  - **DSA**: Luyện phản xạ biến thể Two Pointers & Sliding Window, ôn tập bẫy edge-case.
  - **System Design**:
    - Apache Kafka: Lựa chọn Partition Key theo Customer Account ID để bảo đảm thứ tự nghiêm ngặt.
    - Consumer Group & Rebalance: Tinh chỉnh `max.poll.interval.ms`, heartbeat, xử lý consumer lag.
    - **Transactional Outbox Pattern**: Tích hợp Debezium CDC đọc DB Outbox table bắn vào Kafka (chống mất sự kiện tài chính).
    - **Idempotency Key**: Thiết kế API thanh toán chống double-charging khi client retry mạng.

### 🛡️ Giai đoạn 3 (Weeks 9 - 11): Kịch bản thực tế ngân hàng & Tích hợp liên hoàn
- **Milestone 5 (Week 9 - 11): `Phase 3: Banking Real-time Scenarios & STAR Mastery`**
  - **DSA**: Xử lý luồng dữ liệu (Data Stream Deduplication, Transaction Matching Window), giải quyết bài toán trên màn hình thô không gợi ý.
  - **System Design**: Thiết kế hệ thống Real-time Ledger / Transaction Settlement System hoàn chỉnh, Rate Limiting (Token Bucket / Sliding Window Counter) & Circuit Breaker.
  - **English & STAR**: Rèn luyện trôi chảy 3 kịch bản STAR và phản biện System Design bằng tiếng Anh.

### 🎯 Giai đoạn 4 (Week 12): Full Mock Interviews & Sẵn sàng lâm trận
- **Milestone 6 (Week 12): `Phase 4: Full ANZ Mock Simulation`**
  - Giả lập trọn vẹn buổi phỏng vấn 2 tiếng: 15m STAR + 45m Coding HackerRank + 60m System Design đối thoại trực tiếp.

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
