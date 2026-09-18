# AGENT SHARED STATE & HANDOFF LEDGER

## 🚦 TRẠNG THÁI HIỆN TẠI (Current State)

- **Task Type**: `Research` → **Pilot Week: Day 4 Microtasks vs Macrotasks & Starvation Hoàn tất**
- **Status**: `Closed`
- **Task:** Hoàn tất Day 4: Deep dive Microtasks (`nextTickQueue` vs `microtaskQueue`) vs Macrotasks, hiện tượng Event Loop Starvation, kiểm chứng Node 11+ per-callback microtask flush; test suite `architecture/week-01/04-microtasks-macrotasks.test.js` PASS 4/4; cẩm nang `notes/week-01/day-04-microtasks-macrotasks.md` hoàn thiện.
- **Phase:** Hoàn thành Day 4 (Pilot Week). Sẵn sàng cho Day 5 (STAR Story 1).
- **Handoff:** `PILOT_DAY_04_MICROTASKS_MACROTASKS_COMPLETED`.
- **Branch:** `research/week-01-day-04-microtasks-macrotasks` (sẵn sàng commit & PR vào `main`).

## 🎯 4-POINT MANDATORY HANDOFF CHECKLIST

1. **Location:** `architecture/week-01/04-microtasks-macrotasks.test.js`, `notes/week-01/day-04-microtasks-macrotasks.md`, `package.json`, `README.md`.
2. **Completed vs pending:**
   - **Completed:** Move Zeroes (Day 1), Valid Palindrome (Day 1), Libuv Event Loop (Day 2), Two Sum II (Day 3), Microtasks vs Macrotasks & Starvation (Day 4); 100% native tests pass (32/32 checkpoints); full regression `npm test` PASS.
   - **Pending:** Day 5: Behavioral interview STAR Story 1 (Technical Disagreement); Day 6: Full week retrospective.
3. **Exact next step:** Khởi động kế hoạch Day 5 (`docs/plans/pilot-day-05-star-behavioral-story-1.md`) về STAR Story 1.
4. **Gotchas & Constraints:**
   - Sử dụng native Node.js (`node:assert`, `node:crypto`), tuyệt đối không cài external libraries.
   - Khi viết async tests kiểm tra microtask priority trong `runAllTests()`, bọc phần khởi chạy trong `setImmediate` để tránh bị rò rỉ context Promise microtask của `await`.
   - Luôn đặt Guard clause ở dòng 1 của mọi hàm xử lý.
   - Tránh dùng `splice()` hoặc `unshift()` trong vòng lặp ($O(n^2)$ trap).

## 📅 NHẬT KÝ TÍCH LŨY TRONG NGÀY (Daily In-Progress Ledger)

*(Khu vực ghi nhận tích lũy giữa các phiên làm việc trong ngày theo lệnh "Lưu bàn giao")*

## 📜 LỊCH SỬ BÀN GIAO (Rolling Handoff History)

- **2026-09-17:** `PILOT_DAY_04_MICROTASKS_MACROTASKS_COMPLETED` - Hoàn thành kiểm chứng Microtasks vs Macrotasks, cơ chế Starvation và kỹ thuật cooperative chunking với setImmediate, pass 4/4 test cases, biên soạn cẩm nang Sev-1 incident và kịch bản STAR tiếng Anh.
- **2026-09-17:** `AGENT_FRAMEWORK_SYNCHRONIZED` - Khởi tạo bộ tài liệu Agent, quy chuẩn lập kế hoạch `PLAN_STANDARD.md`, sổ cái `AGENT_STATE.md`, bảng registry `_ACTIVE.md`, và các chỉ dẫn đồng bộ từ extract-doc-product.
- **2026-09-16:** `PILOT_DAY_03_TWO_SUM_II_COMPLETED` - Hoàn thành giải thuật Two Sum II với Two Pointers, 7/7 test cases pass, kịch bản tiếng Anh 6 bước và cẩm nang phân loại 2 biến thể con trỏ.
- **2026-09-15:** `PILOT_DAY_02_EVENT_LOOP_VERIFIED` - Kiểm chứng kiến trúc Libuv Event Loop 6 pha, thứ tự ưu tiên Sync -> nextTick -> Promise -> Timer -> Check, đo Thread Pool với 4 crypto task parallel pass.
- **2026-09-14:** `PILOT_DAY_01_SETUP_AND_MOVE_ZEROES` - Khởi tạo repo, thiết lập CI GitHub Actions với matrix Node 18/20, PR Automation, giải bài 01 Move Zeroes và 02 Valid Palindrome.

