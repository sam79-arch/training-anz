# Behavioral STAR Story 4 & Week 5 Retrospective

> **Dự án:** PBL-driven Backend Interview Prep in JavaScript — Target: HCLTech x ANZ Bank (Data Platform Team)  
> **Nội dung:** STAR Story 4 (Production Cache Stampede & Cluster Resiliency) + Báo cáo tổng kết Tuần 5 (Milestone 3 Scorecard)  
> **Thời gian:** 17/10/2026 (Tuần 5: Day 6)  
> **Scorecard:** 25/25 Unit Test Suites PASS 100% (195/195 Test Cases) — Zero External Dependencies.  

---

## 🌟 PHẦN 1: BEHAVIORAL STAR STORY 4

### 📌 Chủ đề: Distributed Cache Breakdown & Production Stampede Mitigation
> **Câu hỏi phỏng vấn ANZ:** *"Tell me about a time when a caching or distributed system failure caused a severe degradation in your backend services. How did you diagnose the root cause, mitigate immediate damage, and re-architect the system for resilience?"*

---

### 1. Situation (Bối Cảnh)
Tại hệ thống Core Account Balance Query Service của ngân hàng số phục vụ hơn 5 triệu người dùng di động, một cụm Redis Cache Cluster được đặt trước PostgreSQL Primary để giảm tải truy vấn số dư.
Vào ngày 30 hàng tháng (ngày giải ngân lương tập trung của các tập đoàn lớn), một tài khoản doanh nghiệp chi trả lương cho 200,000 nhân viên cùng lúc.
- Key số dư của doanh nghiệp này (`acc:corp:payroll_999`) là một **Hotspot Key cực lớn**.
- Đúng 11:00 AM, key này chạm ngưỡng hết hạn TTL cố định (`TTL = 1800s`).
- Ngay trong giây tiếp theo, hơn **15,000 mobile client requests/second** đồng thời gặp Cache Miss và cùng lúc ùa xuống PostgreSQL Primary (*Thảm họa Cache Breakdown / Stampede*).
- PostgreSQL connection pool (max 50) cạn kiệt trong 200ms; hàng đợi chờ tràn ngập, đẩy CPU database lên 100% và kéo sập cổng API Gateway.

---

### 2. Task (Mục Tiêu & Trách Nhiệm)
Với tư cách là Senior Backend Engineer trực On-Call:
- Tôi phải khôi phục lưu thông API Gateway trong vòng 15 phút mà không làm mất mát bất kỳ bản ghi giao dịch nào.
- Ngăn chặn dòng thác 15,000 req/s tiếp tục đè bẹp PostgreSQL.
- Tái cấu trúc cơ chế Caching để triệt tiêu vĩnh viễn hiện tượng Cache Breakdown và Cache Avalanche trong tương lai.

---

### 3. Action (Hành Động Cụ Thể)
1. **Cô lập tức thời (Immediate Crisis Containment)**:
   - Kích hoạt khẩn cấp Circuit Breaker tại API Gateway: Tạm thời trả về số dư snapshot gần nhất kèm cờ `stale_warning: true` cho người dùng tra cứu thụ động, ưu tiên băng thông cho các giao dịch chuyển tiền trực tiếp.
   - Dùng Redis CLI nạp thủ công một bản ghi tạm với TTL dài để giải tỏa áp lực tức thì cho Database.
2. **Khắc phục tận gốc bằng Mutex Lock (`SET NX PX`)**:
   - Tái cấu trúc hàm đọc Cache-Aside: Khi xảy ra Cache Miss đối với một key, thread ứng dụng **không được gọi DB ngay**. Thay vào đó, nó phải cố gắng chiếm một khóa phân tán ngắn hạn:
     ```bash
     SET lock:cache:acc:<id> <unique_uuid> NX PX 3000
     ```
   - **Worker duy nhất** lấy được lock mới được phép truy vấn PostgreSQL và nạp lại Cache.
   - Các worker còn lại bị chặn (không lấy được lock) sẽ `sleep(50ms)` và đọc lại Cache.
3. **Phòng thủ đa tầng bổ sung (Layered Defense)**:
   - **TTL Jitter**: Bổ sung độ trễ ngẫu nhiên $\pm 15\%$ vào mọi key để ngăn chặn các key hết hạn đồng thời (Anti-Avalanche).
   - **Bloom Filter Pre-check**: Chặn đứng các truy vấn ID rác ở tầng ngoài cùng.

---

### 4. Result (Kết Quả Đo Lường Được)
- **Về thời gian khắc phục**: Hệ thống hạ nhiệt và phục hồi bình thường sau **12 phút**; 0 giao dịch tài chính bị mất mát hoặc thất thoát tiền bạc.
- **Về hiệu năng sau tái cấu trúc**:
  - Tỷ lệ Cache Hit tại các ngày cao điểm cuối tháng tiếp theo đạt **99.2%**.
  - Khi một Hotspot Key hết hạn, số lượng truy vấn xuống PostgreSQL Primary giảm từ **15,000 qps xuống đúng 1 qps** duy nhất (nhờ Mutex Lock).
  - CPU của PostgreSQL trong giờ cao điểm duy trì ổn định ở mức $< 35\%$.
- Bài học được đúc kết thành kiến trúc chuẩn (Architectural RFC) và được ban kiến trúc ngân hàng chuẩn hóa cho toàn bộ các squad thanh toán.

---

### 🗣️ Kịch Bản Tiếng Anh & Câu Hỏi Đào Sâu (Follow-Up Q&A)

#### Q1: *"What happens if the single worker that acquired the mutex lock crashes while querying the database?"*
> **Answer:** *"That is why the lock is acquired with an explicit TTL: `SET NX PX 3000`. If the worker crashes or experiences a long network pause, the lock automatically expires after 3 seconds in Redis. The next waiting worker will successfully acquire the lock and fetch the data, guaranteeing the system never enters a permanent deadlock."*

#### Q2: *"Why not just use asynchronous cache pre-warming instead of reactive mutex locking?"*
> **Answer:** *"In our revised architecture, we actually combine both. For known predictable hotspots (like corporate payroll accounts), we run a background cron job that refreshes the cache before TTL expires (Logical Expiration pattern). The reactive Mutex Lock serves as our resilient safety net for unexpected spikes and dynamic keys that cannot be pre-warmed."*

---

## 📊 PHẦN 2: BÁO CÁO TỔNG KẾT TUẦN 5 (WEEK 5 RETROSPECTIVE)

### 🏆 1. Bảng Điểm Kỹ Thuật Tuần 5 (Milestone 3 Scorecard)

| Ngày | Chủ đề bài học | Phân loại | Kết quả kiểm thử | Ghi chú & Invariant |
|---|---|---|:---:|---|
| **Day 1 (T2)** | Best Time to Buy and Sell Stock (LeetCode #121) | DSA (Easy) | ✅ 8/8 PASS | Duyệt 1 lượt $O(n)$, $O(1)$ space, Time-arrow invariant, 50k prices trong 1.94ms. |
| **Day 2 (T3)** | Redis Caching Patterns & TTL Jitter | DBMS Execution | ✅ 6/6 PASS | Cache-Aside (invalidation on write), Write-Through, Write-Behind batch queue, TTL Jitter math, 99% cache hit benchmark. |
| **Day 3 (T4)** | Mid-Phase Recall & Consolidation Day | Spaced Repetition | ✅ 4/4 PASS | Tái hiện Sliding Window (Longest Substring) đạt chuẩn 12m; B+Tree Bookmark Lookup vs Covering Index scan. |
| **Day 4 (T5)** | Cache Penetration (Bloom Filter) & Distributed Lock | DBMS Execution | ✅ 6/6 PASS | Null Object caching, Bloom Filter 3 hàm băm $O(1)$, Distributed Lock (`SET NX PX` + Lua atomic release), 50 tx overdraft protection. |
| **Day 5 (T6)** | Binary Search Standard Template + Friday Recall | DSA & Live Coding | ✅ 8/8 PASS | Recall Move Zeroes đạt chuẩn 8m; Binary Search chống tràn số `mid = left + Math.floor((right - left) / 2)`, 100k items trong 0.007ms. |
| **Day 6 (T7)** | STAR Story 4 & Tuần 5 Retrospective | Behavioral & Docs | ✅ Hoàn tất | STAR Story 4 (Production Cache Stampede), Scorecard & định hướng Tuần 6. |

---

### 📈 2. Cumulative Repository Health Check (Milestone 3 In-Progress)

- **Tổng số Test Suites**: **25 test suites** độc lập chạy bằng `node:assert`.
- **Tổng số Test Cases**: **195/195 unit test cases PASS 100%**.
- **Độ phụ thuộc bên ngoài**: **0 (Zero external npm dependencies)**.
- **Thời gian chạy regression toàn hệ thống**: $< 1.35$ giây.
- **Tuân thủ quy chuẩn**:
  - 100% các file tuân thủ Guard Clause tại dòng 1.
  - Tuần 5 hoàn thành đúng quy chuẩn **Tuần 0-Medium** (Anti-Burnout Protocol).
  - Spaced Repetition hoàn thành 2 buổi recall: Mid-Phase Recall (Day 3) và Friday Recall (Day 5).

