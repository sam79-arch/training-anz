# Behavioral STAR Story 3 & Week 3 Retrospective

> **Dự án:** PBL-driven Backend Interview Prep in JavaScript — Target: HCLTech x ANZ Bank (Data Platform Team)  
> **Nội dung:** STAR Story 3 (Đàm phán phạm vi với PO dưới áp lực tiến độ) + Báo cáo tổng kết Tuần 3 (Scorecard Milestone 2)  
> **Thời gian:** 05/10/2026 (Tuần 3: Day 6)

---

## 🌟 PHẦN 1: BEHAVIORAL STAR STORY 3

### 📌 Chủ đề: Tight Deadline vs Technical Debt — Negotiating Scope with Product Owner
> **Câu hỏi phỏng vấn ANZ:** *"Tell me about a time when you faced a tight delivery deadline but the project had significant technical debt. How did you balance business urgency with engineering quality and negotiate with stakeholders?"*

---

### 1. Situation (Bối Cảnh)
Tại hệ thống Core Banking Settlement Service phục vụ chuẩn Open Banking của thị trường Úc, toàn bộ dịch vụ phải tuân thủ hạn chót kiểm toán quy định pháp lý (Regulatory Audit Deadline) trong đúng **3 tuần**. Tuy nhiên, module xử lý thanh toán bù trừ kế thừa từ hệ thống cũ (legacy batch processing) đang gặp nợ kỹ thuật nghiêm trọng:
- Không có bất kỳ unit test tự động nào (0% test coverage).
- Sử dụng kết nối cơ sở dữ liệu trực tiếp không qua Connection Pool, gây hiện tượng rò rỉ kết nối (`connection leak`) và nghẽn I/O khi lưu lượng thanh toán tăng đột biến.
- Trong khi đó, Product Owner (PO) lại yêu cầu bổ sung thêm **5 bộ lọc báo cáo giao dịch thời gian thực** (Real-time Reporting Filters) vào cùng đợt phát hành này.

---

### 2. Task (Mục Tiêu & Trách Nhiệm)
Với tư cách là Senior Backend Engineer chịu trách nhiệm chính về module:
- Tôi phải đảm bảo hệ thống hoàn thành kiểm toán đúng hạn chót 3 tuần mà không xảy ra sự cố gián đoạn dịch vụ hoặc mất mát giao dịch (Zero Data Loss).
- Tôi không thể đồng ý "nhồi nhét" cả 5 bộ lọc của PO vào một nền tảng đang rò rỉ kết nối vì rủi ro sập database toàn hệ thống trong đợt kiểm toán là 100%.
- Nhiệm vụ trọng tâm là **đàm phán lại phạm vi (Scope Negotiation)** với PO dựa trên dữ liệu kỹ thuật thực tế, thay vì nói "không" một cách cảm tính.

---

### 3. Action (Hành Động Cụ Thể)
1. **Phân tích dữ liệu & Chứng minh thực nghiệm (Data-Driven Evidence)**:
   - Tôi dựng một bài kiểm thử tải mô phỏng (Load Test benchmark) chứng minh rằng: Nếu thực thi 5 bộ lọc thời gian thực trên các cột chưa được đánh chỉ mục trong khi connection pool bị leak, thời gian phản hồi của DB sẽ vọt từ 450ms lên **8,500ms**, khiến 42% giao dịch thanh toán bị timeout.
2. **Đàm phán giải pháp 2 giai đoạn (Phased Delivery Strategy)**:
   - Tôi tổ chức cuộc họp 30 phút với PO và áp dụng mô hình phân loại **MoSCoW**:
     - **Giai đoạn 1 (Tuần 1 & 2 - P0 Must-Have)**: Ưu tiên tuyệt đối sửa nợ kỹ thuật: Tích hợp Connection Pooling chuẩn, bọc Transaction ACID cô lập, và viết bộ kiểm thử hồi quy tự động (Regression Test Suite). Đồng thời chỉ giữ lại 1 bộ lọc báo cáo cốt lõi phục vụ trực tiếp cho kiểm toán viên.
     - **Giai đoạn 2 (Tuần 4 - P1 Should-Have)**: Sau khi hệ thống vượt qua kiểm toán và ổn định, 4 bộ lọc còn lại sẽ được triển khai bất đồng bộ qua Read-Replica để bảo vệ cơ sở dữ liệu chính.
3. **Thực thi kỷ luật kỹ thuật (Engineering Discipline)**:
   - Áp dụng nguyên tắc Test-First với `node:assert`, bao phủ toàn bộ các edge cases về số dư âm, giao dịch trùng lặp và deadlock.
   - Thiết lập cơ chế Deadlock Prevention (sắp xếp ID tài khoản trước khi lock).

---

### 4. Result (Kết Quả Đo Lường Được)
- **Về tiến độ**: Triển khai thành công lên Production sớm **4 ngày** trước hạn chót kiểm toán của cơ quan quản lý.
- **Về hiệu năng & độ tin cậy**:
  - Triệt tiêu 100% hiện tượng connection leak trong 30 ngày liên tục sau khi Go-Live.
  - Độ trễ p99 của tiến trình thanh toán giảm mạnh từ **450ms xuống 65ms** (cải thiện ~85%).
- **Về mối quan hệ hợp tác**: PO đánh giá cao sự minh bạch và cách tiếp cận dựa trên bằng chứng kỹ thuật, tin tưởng giao cho team quyền tự chủ trong việc cân bằng nợ kỹ thuật cho các quý tiếp theo.

---

### 🗣️ Kịch Bản Tiếng Anh & Câu Hỏi Đào Sâu (Follow-Up Q&A)

#### Q1: *"What would you have done if the Product Owner strictly refused your two-phase proposal and demanded all features delivered immediately?"*
> **Answer:** *"If a business stakeholder pushed back, I would refrain from emotional arguments. Instead, I would frame the risk in terms of business impact: a production crash during the regulatory audit would result in severe financial penalties and reputational damage for the bank. I would ask the PO and engineering leadership to sign off on an explicit risk-acceptance document. In my experience, once risks are quantified in terms of SLA breaches and financial impact, stakeholders invariably agree to phased delivery."*

#### Q2: *"How did you ensure that fixing technical debt didn't introduce new regressions in the legacy codebase?"*
> **Answer:** *"Because the legacy service had zero tests, before touching any line of production code, I created a black-box regression harness. I captured real sanitized transaction payloads from production logs and replayed them against the legacy implementation to record expected outputs. Then I implemented our new connection-pooled engine and verified that 100% of test cases produced identical ledger outputs down to the cent."*

---

## 📊 PHẦN 2: BÁO CÁO TỔNG KẾT TUẦN 3 (WEEK 3 RETROSPECTIVE)

### 🏆 1. Bảng Điểm Kỹ Thuật Toàn Diện (Milestone 2 Scorecard)

| Ngày | Chủ đề bài học | Phân loại | Kết quả kiểm thử | Trực quan hóa / Ghi chú |
|---|---|---|:---:|---|
| **Day 1 (T2)** | Valid Parentheses (Stack LIFO) | DSA (Easy) | ✅ 8/8 Tests PASS | `coding/week-03/01-valid-parentheses.*` |
| **Day 2 (T3)** | B+Tree Index Architecture & Covering Index | DBMS Execution | ✅ 6/6 Tests PASS | `architecture/week-03/02-btree-index-simulation.*` + HTML Visualizer |
| **Day 3 (T4)** | Reverse Linked List (In-place 3 Pointers) | DSA (Easy) | ✅ 8/8 Tests PASS | `coding/week-03/02-reverse-linked-list.*` + HTML Stepper |
| **Day 4 (T5)** | Database Concurrency: ACID & Locking | DBMS Execution | ✅ 6/6 Tests PASS | `architecture/week-03/04-acid-concurrency.*` |
| **Day 5 (T6)** | Linked List Cycle (Floyd's Tortoise & Hare) | DSA (Easy) | ✅ 7/7 Tests PASS | `coding/week-03/03-linked-list-cycle.*` + HTML Visualizer |
| **Day 6 (T7)** | STAR Story 3 & Week 3 Retrospective | Behavioral | ✅ Hoàn tất | `notes/week-03/day-06-star-and-retrospective.md` |

### 📈 2. Chỉ Số Tiến Độ Repository (Cumulative Metrics)
- **Tổng số Test Suites**: **15 test suites** độc lập chạy bằng `node:assert`.
- **Tổng số Test Cases**: **115/115 unit test cases PASS 100%** (Thời gian chạy toàn bộ test runner < 350ms).
- **Tuân thủ quy chuẩn**:
  - Zero external npm dependencies.
  - Dòng 1 luôn là Guard Clause.
  - Chuẩn hóa 3-File Output format áp dụng triệt để từ Day 4 Tuần 3.
  - 100% các bài DSA và kiến trúc đều có kịch bản đối thoại tiếng Anh 6 bước.

---

### 🧭 3. Định Hướng Tuần 4 (Kết Thúc Phase 1B & Sẵn Sàng Sang Phase 2 Caching)
- **Day 1 (T2)**: Merge Two Sorted Lists (LeetCode #21 - Easy) — Kỹ thuật Dummy Head Node.
- **Day 2 (T3)**: Database Connection Pooling trong Node.js — Kiến trúc `pg-pool` / `HikariCP`, tính toán pool sizing và chống connection leak.
- **Day 3 (T4)**: Min Stack (LeetCode #155 - **Bài Medium duy nhất của tuần**) — Kỹ thuật 2 stack song song $O(1)$ `getMin()`.
- **Day 4 (T5)**: Database Sharding & Replication Lag — Kiến trúc Master-Slave, giải quyết bài toán Đọc sau khi Ghi (Read-Your-Own-Writes).
- **Day 5 (T6)**: Mock HackerRank 45m trên màn hình thô + Friday Recall Test 15m (gõ lại 3Sum hoặc Container With Most Water).
- **Day 6 (T7)**: Tổng kết Phase 1B Retrospective & Review STAR Story 1 - 3.
