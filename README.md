# PBL-driven Backend Interview Prep in JavaScript | Target: HCLTech x ANZ

[![PR Automation](https://github.com/sam79-arch/training-anz/actions/workflows/pr-automation.yml/badge.svg)](https://github.com/sam79-arch/training-anz/actions/workflows/pr-automation.yml)
[![Node.js CI](https://github.com/sam79-arch/training-anz/actions/workflows/ci.yml/badge.svg)](https://github.com/sam79-arch/training-anz/actions/workflows/ci.yml)

> **Mục tiêu:** Backend Engineer (Data Platform Team) – HCLTech Việt Nam x Khách hàng ANZ Bank.  
> **Ngôn ngữ thi tuyển:** **JavaScript thuần** (Native Node.js, Zero External Dependencies, bám sát môi trường HackerRank).  
> **Kỷ luật sinh hoạt:** Đúng **60 phút mỗi sáng (05:00 – 06:00 AM)**.  
> **Phương pháp:** Problem-Based Learning (PBL) – Học qua tình huống ngân hàng thực tế, không học vẹt.

---

## 🎯 Cấu Trúc Vòng Phỏng Vấn Kỹ Thuật ANZ (2 Phiên / 2 Tiếng)

1. **Phiên 1: Coding & Behavioral (60 phút):**
   - **15 phút đầu:** Phỏng vấn hành vi văn hóa (Behavioral) theo mô hình STAR.
   - **45 phút sau:** Live Coding trực tiếp trên HackerRank (hoặc màn hình thô).
2. **Phiên 2: System Design (60 phút):**
   - Đối thoại kỹ thuật hai chiều thiết kế hệ thống phân tán phục vụ bài toán ngân hàng thực tế.

### Sự thật về "2 bài Medium" của ANZ:
- Đề thi **không** hỏi thuật toán hàn lâm hay Dynamic Programming nhiều chiều.
- "Bài Medium" thực chất chỉ là **bài Easy được nâng cấp thêm 1 bước biến thể**:
  - *Two Sum (Easy)* $\rightarrow$ **3Sum / Two Sum II**
  - *Move Zeroes (Easy)* $\rightarrow$ **Remove Duplicates II / Container With Most Water**
  - *Valid Parentheses (Easy)* $\rightarrow$ **Min Stack**
  - *Mảng con*: **Maximum Subarray (Kadane)** & **Longest Substring Without Repeating Characters**
- **Tiêu chí chấm điểm ANZ:** Không yêu cầu code hoàn hảo ngay lập tức, mà chú trọng vào tư duy giải quyết vấn đề (*approach to problem solving*), mã nguồn đơn giản, dễ mở rộng (*simple & scalable code*), và khả năng đối thoại cởi mở (*open dialogue*).

---

## 🚨 Những Lưu Ý Sống Còn (Survival Tips)

1. **Dòng 1 luôn là Guard Clause:** Bắt buộc kiểm tra `null`, `undefined`, mảng rỗng `arr.length === 0` để tránh lỗi `Cannot read properties of null`.
2. **Tuyệt đối tránh bẫy hiệu năng JS:** Cấm dùng `arr.splice()` hoặc `arr.unshift()` trong vòng lặp vì chúng tốn $O(n)$ dịch chuyển chỉ mục, làm giải thuật bị tụt về $O(n^2)$.
3. **Cẩn trọng giá trị khởi tạo:** Các bài toán tìm max/min (như Kadane), khởi tạo `maxSum = nums[0]`, không khởi tạo bằng `0` để tránh sai khi mảng toàn số âm.
4. **Tập gõ trên màn hình thô:** Rèn tính chính xác từng dấu ngoặc nhọn, không phụ thuộc vào Auto-complete của IDE.
5. **Nói to suy nghĩ (Think Out Loud):** Từ khóa kỹ thuật quan trọng hơn ngữ pháp hoa mỹ. Duy trì nói liên tục bằng tiếng Anh theo kịch bản 6 bước.

---

## ⏰ Kỷ Luật 60 Phút Mỗi Sáng (05:00 - 06:00 AM)

- **Thứ 2, 4, 6 – Coding & English Scripting (60m):**
  - `10m`: Đọc Problem Scenario & nhận diện Pain Point $O(n^2)$.
  - `20m`: Tự gõ code JavaScript trên màn hình thô.
  - `15m`: Đọc to kịch bản tiếng Anh Intermediate (B1-B2).
  - `15m`: Dry run bằng miệng với test case & chốt độ phức tạp $O(n)$ / $O(1)$.
- **Thứ 3, 5 – System Design & Backend Internals (60m):**
  - `30m`: Học kiến trúc phân tán (Redis Cache-Aside, Kafka Partitioning, Outbox Pattern) hoặc Node.js Internals (Event Loop 6 pha, Streams & Backpressure, B+Tree Index, ACID).
  - `30m`: Phản biện tiếng Anh một câu hỏi kiến trúc.
- **Thứ Bảy – Behavioral Part (45m):**
  - Chuẩn bị 1 câu chuyện STAR (Conflict, Sev-1 incident, Tight deadline).
- **Chủ Nhật:** Nghỉ ngơi hoàn toàn.

---

## 🗣️ Khung Giao Tiếp Tiếng Anh Chuẩn 6 Bước

1. **Clarify:** *"Before jumping into the implementation, can the input array be empty or null? Are the numbers always positive?"*
2. **Brute-Force:** *"The naive approach uses nested loops, which takes O(n^2) time. This is not scalable for large inputs."*
3. **Optimize:** *"To optimize this, I trade space for time by using Two Pointers (or a Hash Map) to achieve O(n) time complexity."*
4. **Think Out Loud:** *"First, I add a guard clause for edge cases. Next, I initialize the write pointer at zero..."*
5. **Dry Run:** *"Let's trace it with an example: `[0, 1, 0, 3]`. At index 0, the value is 0..."*
6. **Conclusion:** *"The time complexity is O(n) and the auxiliary space complexity is O(1) as we modify in-place."*

---

## 📊 Bảng Theo Dõi Tiến Độ (Progress Dashboard)

### Pilot Week (Tuần này - Thử nghiệm Workflow & Tooling)
- [x] Day 1 (Thứ 2): Setup Repo, GitHub Actions, Native Test Runner, [Move Zeroes](file:///home/samnguyen/projects/training-anz/coding/week-01/01-move-zeroes.md) & [Valid Palindrome](file:///home/samnguyen/projects/training-anz/coding/week-01/02-valid-palindrome.md)
- [x] Day 2 (Thứ 3): [Node.js Internals: Libuv & Event Loop Architecture](file:///home/samnguyen/projects/training-anz/notes/week-01/day-02-event-loop-architecture.md)
- [x] Day 3 (Thứ 4): [Two Sum II: In-place Two Pointers on Sorted Array](file:///home/samnguyen/projects/training-anz/coding/week-01/03-two-sum-sorted.md) & [Cẩm nang 2 Biến thể Two Pointers](file:///home/samnguyen/projects/training-anz/notes/week-01/day-03-two-pointers-patterns.md)
- [x] Day 4 (Thứ 5): [Node.js Internals: Microtasks vs Macrotasks & Starvation](notes/week-01/day-04-microtasks-macrotasks.md)
- [x] Day 5 (Thứ 6): [Two Sum & Contains Duplicate (Hashing Space-Time Tradeoff)](coding/week-01/04-two-sum-hash.md) & [Cẩm nang Hash Table & V8 Internals](notes/week-01/day-05-hash-table-patterns.md)
- [ ] Day 6 (Thứ 7): Pilot Retrospective & Ready for Official Week 1

### Lộ trình 12 Tuần Chính Thức (Bắt đầu Thứ 2 tuần sau)
Xem chi tiết đầy đủ tại **[ROADMAP.md](file:///home/samnguyen/projects/training-anz/ROADMAP.md)**:
- **Phase 1 (Weeks 1 - 4):** Node.js Internals, Tối ưu CSDL & 15 bài DSA cốt lõi.
- **Phase 2 (Weeks 5 - 8):** Data Platform System Design (Redis, Kafka, Transactional Outbox, Idempotency).
- **Phase 3 (Weeks 9 - 11):** Kịch bản thực tế ngân hàng & Rèn phản xạ STAR tiếng Anh.
- **Phase 4 (Week 12):** Mock Interview 2 tiếng chuẩn format ANZ.

---

## 🧪 Hướng Dẫn Chạy Kiểm Thử (Native Testing)

Dự án sử dụng module `assert` native của Node.js, không cần `npm install` bất kỳ thư viện nào:

```bash
# Chạy unit test bài Move Zeroes
npm test

# Hoặc chạy trực tiếp bằng node
node coding/week-01/01-move-zeroes.test.js
```

