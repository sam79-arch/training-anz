# Reusable Slot for Premium Model Prompt (GitHub Copilot Pro / Claude 3.7)

> **Hướng dẫn:** File này là slot duy nhất được ghi đè tự động khi kích hoạt giao thức `premium` (từ khóa: `"premium"`, `"prenium"`, `"tạo prompt copilot"`).
> Nếu muốn lưu lại prompt này vĩnh viễn, yêu cầu Agent: `"lưu prompt này thành <tên_file>"`.

---

```markdown
# Role: Senior Node.js Backend Engineer & Distributed Systems Specialist (HCLTech x ANZ Bank)

## Objective & Task
Thẩm định, rà soát và hoàn thiện toàn diện Implementation Plan cho **Issue #12 (Node.js Internals: Microtasks vs Macrotasks & Starvation)**. Xác định chính xác các điểm khuyết (gaps) so với tiêu chuẩn `docs/PLAN_STANDARD.md`, chuẩn hóa cấu trúc Test-First bằng native Node.js `assert`, và tích hợp case study ngân hàng thực tế (sự cố nghẽn mạng thanh toán do Event Loop Starvation).

---

## 1. Context & Active State
- **Repository**: `/home/samnguyen/projects/training-anz` (PBL Backend Interview Prep targeting ANZ Bank Data Platform Team).
- **Environment**: Native Node.js 18.x / 20.x, zero external npm dependencies (`node:assert`, `node:crypto`, `node:fs`).
- **Active State (`docs/AGENT_STATE.md`)**:
  - Current Phase: Pilot Week Day 4.
  - Completed: Day 1 (Move Zeroes, Valid Palindrome), Day 2 (Libuv & 6 Event Loop Phases), Day 3 (Two Sum II).
  - Target Issue: Issue #12 (`[Week 1 - Day 4 / Thứ 5] Node.js Internals: Microtasks vs Macrotasks & Starvation`).
- **Branch & Git Protocol**:
  - Feature Branch: `feature/week-01-day-04-microtasks-macrotasks`
  - Target Base: `main`
  - Commit Type: `feat(internals): document microtasks vs macrotasks and starvation mechanisms (close #12)`
  - Labels: `documentation`, `system-design`

---

## 2. Technical Invariants & Architectural Truths
1. **Microtask Priority Matrix**:
   $$\text{Call Stack (Sync)} \longrightarrow \text{nextTickQueue (VIP)} \longrightarrow \text{microtaskQueue (Promise / queueMicrotask)} \longrightarrow \text{Event Loop Macrotask Phase}$$
   Node.js luôn xả cạn `process.nextTick` trước khi chạm tới `Promise.then` / `queueMicrotask`.
2. **Node 11+ Behavioral Alignment (HTML5 Spec)**:
   Trước Node 11, các timer callbacks được thực thi theo batch trước khi xả microtasks. Kể từ Node 11+, sau **mỗi** macrotask callback (`setTimeout`, `setImmediate`), toàn bộ hàng đợi Microtasks sẽ được xả ngay lập tức.
3. **Event Loop Starvation Mechanics in Banking Systems**:
   Đệ quy `process.nextTick` liên tục chèn callback mới vào `nextTickQueue` trong khi Call Stack chưa kịp rảnh, làm tê liệt Event Loop.
   *Hậu quả thực tế tại ANZ:* TCP Socket của cổng thanh toán (Payment Gateway Webhook) không thể đọc dữ liệu I/O; HTTP `/healthz` probe của Kubernetes bị timeout dẫn đến Pod bị Restart (CrashLoopBackOff).
4. **Cooperative Scheduling (Chunking)**:
   Thay thế đệ quy `nextTick` bằng `setImmediate` để nhả quyền điều khiển sau mỗi batch xử lý (chunk), cho phép Event Loop chuyển sang pha Poll để xử lý I/O và Timers.

---

## 3. Scope & Affected Files
| File Path | Action | Description |
|---|---|---|
| `architecture/week-01/04-microtasks-macrotasks.test.js` | CREATE | Test suite tự động (native assert) kiểm chứng 4 kịch bản bất đồng bộ |
| `notes/week-01/day-04-microtasks-macrotasks.md` | CREATE | Cẩm nang ghi chú: Sơ đồ ASCII hàng đợi, Sev-1 Banking Incident, 5 câu đố code phỏng vấn, kịch bản tiếng Anh |
| `package.json` | MODIFY | Bổ sung script `"test:04"` và cập nhật chuỗi lệnh `"test"` / `"test:all"` |
| `README.md` | MODIFY | Tích xanh hoàn thành Day 4 trên Dashboard tiến độ |

---

## 4. Test-First Verification Plan
Implement the test suite `architecture/week-01/04-microtasks-macrotasks.test.js` covering:
- **TC-01 (Microtask Priority)**: Đồng bộ $\rightarrow$ `nextTick` $\rightarrow$ `Promise.then` $\rightarrow$ `queueMicrotask`.
- **TC-02 (Node 11+ Interleaved Flush)**: `Promise.then` được lên lịch bên trong `setTimeout` #1 phải hoàn tất trước khi `setTimeout` #2 kích hoạt.
- **TC-03 (Starvation Prevention via setImmediate)**: Chứng minh `setImmediate` nhường quyền cho các tác vụ xen kẽ (cooperative multitasking) trong khi đệ quy `nextTick` khóa chặt Call Stack.
- **TC-04 (Complex Async Tracing Puzzle)**: Chuỗi kết hợp 3 tầng lồng nhau: `Sync` + `nextTick` + `Promise` + `setImmediate` + `setTimeout(0)`.

---

## 5. Constraints & Quality Bar
- Zero external npm libraries (chỉ dùng `node:assert`).
- Bắt buộc kiểm tra guard clause đầu dòng cho mọi hàm logic.
- Không gây ra bất kỳ ghost change nào ngoài các file đã liệt kê.
- Kịch bản tiếng Anh phải bao gồm đầy đủ cấu trúc STAR và kỹ thuật Think Out Loud.

---

## 6. Verification Commands
```bash
# Chạy riêng test suite Day 4
node architecture/week-01/04-microtasks-macrotasks.test.js

# Chạy toàn bộ test suites của repo
npm test
```

```
```
