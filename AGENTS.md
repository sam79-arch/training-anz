# Training ANZ Platform - Agent Guide

## Project Overview

PBL-driven Backend Interview Prep in JavaScript targeting **HCLTech Vietnam x ANZ Bank** (Data Platform Team). The project emphasizes native Node.js, zero external dependencies, rigorous algorithmic complexity analysis ($O(n)$ / $O(1)$), distributed systems architecture, Node.js internals, and English interview communication.

- **Primary Language**: Native JavaScript (Node.js 18.x / 20.x, native `assert`, `crypto`, `fs`).
- **Standard Branch**: `main`.
- **CI / Automation**: GitHub Actions (`ci.yml` matrix test, `pr-automation.yml` auto-labeling and milestone matching).

---

## Plan Writing Standard

All plan files in this repository follow a shared format defined in:

> **`docs/PLAN_STANDARD.md`**

When writing a new plan OR reading an existing plan written by another agent,
read that file first. It defines the required sections, checklist format,
and the rules every implementing agent must follow.

**Mandatory Non-Technical Summary**: Every plan MUST include Section 2 (`Executive & Business Summary`) using plain language (Business / Problem Title, Why, What, Impact, How to Verify) so mentors, interviewers, and team members can immediately understand the change and verify its correctness.

---

## Planning Workflow

When starting or continuing work:
1. **Check Shared State & Acknowledge to User**: Read `docs/AGENT_STATE.md` first to understand current work in progress, active phase, and handoff instructions. **Immediately output a brief 3-4 line summary to the user** (Active Task, Current Phase, and Next Action) so the user can verify the context is accurate and knows where the project stands.
2. Read `docs/PLAN_STANDARD.md` to ensure any new plan follows the shared format.
3. Check `docs/plans/` and `docs/plans/_ACTIVE.md` for existing context or active plans.
4. Create new plan files (preferring English + Vietnamese pairs `<plan-name>.md` and `<plan-name>.vi.md` where appropriate) inside `docs/plans/`.
5. Wait for user approval ("OK") before starting implementation (as per the Core SOP).
6. Once a phase or task is completed (or session pauses), update `docs/AGENT_STATE.md` with the current handoff status and next steps (keep `docs/AGENT_STATE.md` compact under 50 lines with a sliding window of max 5 recent history entries).

---

## Plan Status Lifecycle Standard (5 Statuses)

Every plan in this repository MUST have an explicit status from the 5 lifecycle states:

| Status | Tiếng Việt | Ý nghĩa & Khi nào áp dụng | Hành động tiếp theo |
|---|---|---|---|
| `Open` | Sẵn sàng thực hiện | Kế hoạch đã lập xong, đã duyệt, sẵn sàng để Agent/Dev nhận làm khi có yêu cầu. | Chờ phân bổ hoặc kích hoạt thực thi. |
| `In Processing` | Đang thực hiện | Kế hoạch đang được tích cực triển khai code, viết test hoặc sửa bài trong phiên làm việc. | Tiếp tục làm theo Implementation Checklist. |
| `Pending` | Tạm dừng / Chờ | Kế hoạch tạm hoãn (vướng blocker, chờ confirm từ User/Mentor, hoặc chưa ưu tiên làm ngay). | Giữ nguyên trạng thái chờ giải phóng blocker. |
| `Cancelled` | Đã hủy bỏ | Kế hoạch không còn cần thiết hoặc bị thay thế bởi phương án khác. | Đánh dấu để không tính vào backlog tồn đọng. |
| `Closed` | Đã hoàn tất | Kế hoạch đã hoàn thành 100%, pass toàn bộ test native và đã commit/push/merge PR. | Đưa vào lịch sử bàn giao (Handoff History). |

### Quy tắc Cập nhật Status vào Cuối Ngày (EOD) & Chuyển giao Quy trình
1. **Bắt đầu thực hiện plan**: Chuyển Status của plan sang `In Processing` và cập nhật `docs/plans/_ACTIVE.md` cùng `docs/AGENT_STATE.md`.
2. **Tạm dừng / Kết thúc ca làm việc (EOD / Handoff)**:
   - Nếu công việc đang làm dở: Giữ `In Processing` (hoặc chuyển `Pending` nếu vướng blocker/chờ xác nhận).
   - Nếu hoàn thành và push/merge PR xong: Chuyển Status sang `Closed` và đưa vào bảng `Closed Plans` trong `docs/plans/_ACTIVE.md`.
   - Nếu người dùng quyết định hủy bỏ hoặc không làm nữa: Chuyển Status sang `Cancelled` ngay lập tức.

---

## Standard Task Types (16 Types) & GitHub Integration

All tasks, branches, commits, PR labels, and daily standup reports in this repository MUST be categorized under one of the 16 Standard Task Types:

| # | Task Type | Tiền tố Branch (`<prefix>/<short-desc>`) | Commit Type (`<type>(<scope>): <desc>`) | GitHub Label | Ý nghĩa & Phạm vi áp dụng |
|---|---|---|---|---|---|
| 1 | `Bug Fixing` | `fix/` | `fix(...)` | `bug` | Sửa test fail, exception, logic sai lệch hoặc thiếu edge case. |
| 2 | `Data Handling` | `data/` | `data(...)` | `enhancement` | Xử lý mảng dữ liệu, chuẩn hóa chuỗi, tiền xử lý test input. |
| 3 | `Consulting` | `docs/` | `docs(rfc): ...` | `documentation` | Phân tích bài toán, tư vấn giải thuật, đánh giá trade-off kiến trúc. |
| 4 | `Modification` | `mod/` | `mod(...)` | `enhancement` | Cập nhật cấu hình CI/CD, kịch bản PR automation, package script. |
| 5 | `Customization` | `custom/` | `feat(...)` | `coding` | Tùy biến giải thuật theo yêu cầu phỏng vấn đặc thù của ANZ Bank. |
| 6 | `New Request` | `feature/` | `feat(...)` | `coding` / `enhancement` | Giải bài toán DSA mới hoặc bổ sung chủ đề kiến trúc phân tán mới. |
| 7 | `Support` | `support/` | `chore(support): ...` | `enhancement` | Hỗ trợ setup môi trường, script phụ trợ, format code. |
| 8 | `Maintenance` | `maint/` | `chore(...)` | `refactor` | Tối ưu độ phức tạp (ví dụ từ $O(n^2)$ về $O(n)$), dọn dẹp mã nguồn. |
| 9 | `Meta Data` | `meta/` | `meta(...)` | `documentation` | Cập nhật roadmap, danh mục bài tập, template markdown. |
| 10 | `DBMS Execution` | `db/` | `db(...)` | `system-design` | Bài toán Index B+Tree, ACID, Transaction, Redis cache, outbox pattern. |
| 11 | `Documentation` | `docs/` | `docs(...)` | `documentation` | Soạn thảo ghi chú lý thuyết, kịch bản tiếng Anh 6 bước, STAR story. |
| 12 | `Reporting` | `report/` | `report(...)` | `documentation` | Báo cáo tiến độ tuần (Pilot review, Sprint retrospective). |
| 13 | `Troubleshooting` | `troubleshoot/` | `fix(...)` | `bug` | Điều tra nguyên nhân crash, rò rỉ bộ nhớ, event loop starvation. |
| 14 | `Testing` | `test/` | `test(...)` | `test` | Viết unit test native assert, kiểm tra độ phức tạp và boundary cases. |
| 15 | `Training` | `docs/training/` | `docs(training): ...` | `documentation` | Luyện phản xạ tiếng Anh, mock interview, đối thoại kỹ thuật. |
| 16 | `Research` | `research/` | `feat(poc): ...` | `system-design` | Nghiên cứu sâu Node.js Libuv, Event Loop, Kafka partitioning. |

---

## Daily Work Summary Protocol (Standup Format)

**Trigger Phrase:** Whenever the user says `"tóm tắt công việc"` (or asks for daily work summary / standup), immediately output the summary across sessions using the following standard template:

```text
[Yesterday]
[<Tên-Project-Scope>]
- [Task-Type] Task 1 Title / Description
- [Task-Type] Task 2 Title / Description

[Today]
[<Tên-Project-Scope>]
- [Task-Type] Task 1 Title / Description
- [Task-Type] Task 2 Title / Description
```

### Temporal Logic for Daily Standup:
- **`[Yesterday]`**: Represents the **completed work of the current/most recent working day** (to be reported as "yesterday's work" in the next morning standup). *Exception on Monday:* `[Yesterday]` refers to work completed on **Friday** of the previous week.
- **`[Today]`**: Represents the **planned work for the upcoming working day (tomorrow)** (or Monday's plan if reporting on Friday).

### Project Scope Mapping
- **`[Training-ANZ]`**: Codebase at `/home/samnguyen/projects/training-anz` (PBL Backend Interview Prep in native JavaScript: DSA, Node.js Internals & System Design).
- **`[Shine-Extraction]`**: Codebase at `/home/samnguyen/projects/extract-doc-product` (Document extraction monorepo: client, server, locations, ingestion).
- **`[Shine-AI]`**: Codebase at `/home/samnguyen/projects/aic-shine/shine-ai` (AIC / Shine AI core processing engine).

---

## Multi-IDE Handoff Protocol ("Lưu bàn giao" & "Kết bàn giao")

To prevent race conditions and information loss when multiple IDEs or agents work concurrently or sequentially on the same day, handoff follows a 3-stage lifecycle:

### Stage 1: Mid-Session Accumulation ("Lưu bàn giao")
**Trigger Phrases:** Whenever the user says `"Lưu bàn giao"`, `"Handoff session"`, `"Tạm dừng công việc"`, or similar pause commands.
- **Append-only behavior:** Do NOT overwrite or clear existing records in `docs/AGENT_STATE.md`.
- **Timestamped Ledger:** Append a new entry under `## 📅 NHẬT KÝ TÍCH LŨY TRONG NGÀY (Daily In-Progress Ledger)` formatted with an exact timestamp: `### [YYYY-MM-DD HH:mm:ss] - Session Handoff`.
- **Mandatory 4-Point Capture:** Each appended entry MUST include:
  1. **Current In-Progress Location:** Exact file path, line number, and function currently being edited.
  2. **Completed vs. Failing/Pending:** What was completed in this session vs. what test/step is currently failing or unfinished.
  3. **Exact Next Step for Next Agent:** The precise first action (file to open, function to edit, or test command to run) the next agent must execute.
  4. **Gotchas & Constraints:** Invariants, edge cases, or complexity traps identified during the session.
- **User Feedback:** Output a concise 2-3 line confirmation summarizing the appended timestamped entry.

### Stage 2: Final Consolidation & Deduplication ("Kết bàn giao")
**Trigger Phrases:** Whenever the user explicitly says `"Kết bàn giao"`, `"Tổng kết bàn giao"`, `"Finalize handoff"`, or similar closing commands.
- **Synthesize & Deduplicate:** The agent reads all accumulated entries under the current day's ledger.
- **Consolidate State:** Merges and reconciles all completed vs. pending tasks into the top-level `## 🚦 TRẠNG THÁI HIỆN TẠI (Current State)` and `## 🎯 4-POINT MANDATORY HANDOFF CHECKLIST`.
- **Clean Ledger:** Removes duplicate / superseded intermediate steps, keeping only the consolidated final state and adding a single summarized entry to `## 📜 LỊCH SỬ BÀN GIAO (Rolling Handoff History)`.
- **User Feedback:** Output a concise summary of the finalized state and confirm deduplication.

### Stage 3: New Working Day Rollover
- When starting work on a new date (current date > last recorded date in `docs/AGENT_STATE.md`):
- Overwrite/reset the daily accumulated ledger section for the new day, preserving the consolidated `Current State` and keeping `docs/AGENT_STATE.md` compact (under 50-60 lines).

---

## Premium Prompt Generation Protocol (`premium`)

**Trigger Phrases:** Any chat message whose first line begins with `"premium"`, `"prenium"`, `"premium prompt"`, or `"tạo prompt copilot"` (case-insensitive, e.g. `"premium:"`, `"prenium:"`). The rest is a free-form description of the task.

When triggered, the agent MUST **not** implement any code. It compiles a reusable prompt for a premium/expensive model (e.g. GitHub Copilot Pro / Claude 3.7) so the user can paste it and spend a single premium request. Workflow:

1. **Load context**: read `docs/AGENT_STATE.md`, the relevant active plan, and the real code in the affected scope (exact file paths, native assert test cases, algorithm invariants).
2. **Produce a seed** (decision summary) and print it to chat for quick review. The seed separates what is *already decided* (`Đã chốt`) from what is *still open* (`Còn mở`).
3. **Resolve open decisions first**: before generating the final prompt, ask the user about any decision the agent cannot decide itself.
4. **Generate the final premium prompt** with standard sections:
   - **Role**: Senior Node.js Backend Engineer & Algorithms Specialist for ANZ Bank.
   - **Task**: Focused objective following test-first order.
   - **Context**: Real code snippets, active state invariants, exact file paths.
   - **Design & Invariants**: Step-by-step logic, complexity targets $O(n)/O(1)$, native assert verification.
   - **Constraints**: Zero ghost changes, pure native Node.js (zero external npm deps), guard clause at line 1.
   - **Output & Validation**: Exact files, diffs, and verification commands (`npm test`).
5. **Store**: overwrite the single reusable slot `docs/prompts/_LATEST.md` (never create a new file per trigger) and print the full prompt to chat for immediate copy.

---

## Repository Structure

```
.
├── coding/                 # DSA solutions, native tests, and English scripts
│   └── week-XX/            # Organized by roadmap weeks
├── architecture/           # System design scenarios, templates, event loop tests
│   └── week-XX/
├── notes/                  # Core concepts, theoretical deep dives, pattern guides
│   └── week-XX/
├── docs/                   # Agent shared state, plan standards, and prompt slots
│   ├── AGENT_STATE.md      # Shared state & handoff ledger
│   ├── PLAN_STANDARD.md    # Shared plan writing standard
│   ├── plans/              # Plan files & _ACTIVE.md registry
│   └── prompts/            # Premium prompts (_LATEST.md)
└── .github/workflows/      # CI matrix and PR automation
```

---

## Testing & Execution Rules

- **Native Test Runner**: The repository strictly uses `node:assert` and `npm test` without Jest/Mocha or any third-party test libraries:
  ```bash
  # Run all unit tests
  npm test

  # Run a specific test suite
  node coding/week-01/01-move-zeroes.test.js
  node architecture/week-01/03-event-loop-phases.test.js
  ```
- **Test-First Order**: Always implement unit test cases covering all edge cases (null, empty array, single element, negative numbers, boundary limits) in `*.test.js` before writing implementation code in `*.js`.

---

## Survival Tips & Coding Guardrails for ANZ Bank

1. **Line 1 Must Be a Guard Clause**: Always validate inputs against `null`, `undefined`, or invalid types/lengths before performing any logic.
2. **Never Use $O(n)$ In-Loop Array Mutations**: Using `arr.splice()` or `arr.unshift()` inside loops degrades $O(n)$ two-pointer or linear algorithms into $O(n^2)$.
3. **Safe Initialization for Max/Min**: Always initialize min/max with actual elements (e.g. `nums[0]`) instead of `0` to handle arrays containing negative numbers.
4. **Structured 6-Step English Communication Script**:
   - Step 1: **Clarify** (inputs, bounds, edge cases).
   - Step 2: **Brute-Force** (explain the $O(n^2)$ naive approach and its trade-offs).
   - Step 3: **Optimize** (propose $O(n)$ space-for-time trade-off or two-pointer pattern).
   - Step 4: **Think Out Loud** (narrate logic while coding).
   - Step 5: **Dry Run** (trace line-by-line with an example).
   - Step 6: **Conclusion** (state final Time and Space Complexity).
5. **Interactive Visualizer Protocol for Complex DSA & Architecture**:
   - Đối với các bài toán Medium hoặc các chủ đề kiến trúc phân tán / Event Loop trừu tượng, Agent chủ động tạo widget mô phỏng Generative UI tương tác từng bước (State Machine Stepper với Dark Mode tương phản cao, thẻ `bg-[#1e293b]`, viền phát sáng và nút bấm) để hỗ trợ trực quan hóa cơ chế con trỏ/dữ liệu và củng cố tư duy trước khi phỏng vấn.


