# Plan Writing Standard

> **Source of truth for all plan files in this repository.**
> Every agent (Gemini, Codex, Claude, Cursor, or human) MUST follow this
> format when writing a plan, and MUST treat this format as the parsing
> contract when reading a plan written by another agent.

---

## Why This Standard Exists

Plans are written by one agent and executed by another (or the same agent
in a later session). Without a shared format:

- Checklists get lost in prose → implementer skips items
- Scope is ambiguous → implementer adds or omits work silently
- Non-technical stakeholders (Interviewer, Mentor, QA) cannot understand the value or logic without reading raw code
- Test cases are vague → coverage is inconsistent across agents

This standard makes plans **machine-parseable**, **agent-agnostic**, and **accessible to both technical and business stakeholders**.

---

## Required Sections

Every plan file MUST contain all sections below, in this exact order,
with these exact H2/H3 headers. Do not rename, reorder, or omit sections.

---

### 1. Objective & Metadata

One paragraph (≤ 5 sentences) plus mandatory metadata:
- **Task Type**: `<Standard Task Type>` *(must be exactly 1 of the 16 Standard Task Types)*
- **Status**: `<Open | In Processing | Pending | Cancelled | Closed>` *(must follow Plan Status Lifecycle)*
- **Target Branch**: `main`
- What problem does this solve?
- Why does it need solving now?
- What is the expected outcome when done?

---

### 2. Executive & Business Summary (Non-Technical)

> **Mandatory for all plans.** This section MUST be written in plain, non-technical language so that mentors, interviewers, and team members can immediately understand the problem, approach, and verification steps.

Every plan must include these 5 standard fields:

```markdown
## 📌 Executive & Business Summary (Tóm tắt Nghiệp vụ / Bài toán)

- **Business / Problem Title**: 
  > Feature, algorithm, or architecture topic described clearly without obscure abbreviations.

- **Why / Problem Statement**:
  > What difficulty or limitation exists currently? (e.g. $O(n^2)$ complexity, missing edge cases, architectural bottleneck).

- **What / Solution**:
  > What is changing or being implemented at a high level? (Concise bullet points: algorithm pattern, data structure, or design pattern).

- **Impact & Expected Performance**:
  > Time Complexity $O(...)$, Space Complexity $O(...)$, maintainability and scalability impact.

- **How to Verify**:
  > 2-3 clear verification steps (test command, edge cases checked).
```

---

### 3. Affected Files

A table listing **every** file that will be created or modified.
Do not list files that will remain untouched.

| File | Action | Description |
|------|--------|-------------|
| `coding/week-01/04-container-water.js` | CREATE | Solution using Two Pointers |
| `coding/week-01/04-container-water.test.js` | CREATE | Native test suite with 7 edge cases |
| `coding/week-01/04-container-water.md` | CREATE | Documentation and 6-step English script |

Valid actions: `CREATE`, `MODIFY`, `DELETE`, `RENAME`.

---

### 4. Implementation Checklist

> **This is the authoritative action list for implementers.**
> An agent executing this plan MUST tick every item and MUST NOT implement
> anything not listed here.

Rules for writing checklist items:
- Each item = one independently verifiable unit of work
- Format: `- [ ] \`path/to/file\`: <specific action with function/class name>`
- **Test items MUST appear before their corresponding implementation items (test-first order)**
- No vague items like "add tests" or "fix the bug" — be explicit

Example:

```markdown
- [ ] `coding/week-01/04-container-water.test.js`: CASE 1 – null/undefined/empty array → 0
- [ ] `coding/week-01/04-container-water.test.js`: CASE 2 – array with length < 2 → 0
- [ ] `coding/week-01/04-container-water.test.js`: CASE 3 – standard LeetCode example [1,8,6,2,5,4,8,3,7] → 49
- [ ] `coding/week-01/04-container-water.js`: Implement `maxArea(height)` with guard clauses and two pointers
- [ ] `coding/week-01/04-container-water.md`: Write problem scenario and 6-step English interview script
```

---

### 5. Out of Scope

Explicit list of what will NOT be changed in this task.
Every item must be a concrete statement, not "everything else".

Example:
- External dependencies will NOT be introduced (pure Node.js native assert only).
- Other modules in `architecture/` remain untouched.

---

### 6. Data Model / Architecture Changes *(omit section if none)*

If the task involves system design or architecture changes, include:
- Component diagram / sequence flow
- Storage, Cache (Redis), or Queue (Kafka) interaction
- Idempotency & Failure recovery mechanisms

---

### 7. Edge Cases & Error Handling

List each edge case and the expected handling behavior.

| Scenario | Expected behavior |
|----------|------------------|
| Input is `null` or `undefined` | Guard clause returns early (default/error value) |
| Empty array `[]` | Return 0 or empty result without throwing `TypeError` |
| Negative numbers or extreme values | Correct handling without integer overflow or NaN |

---

### 8. Git Info

```
Branch:               <prefix>/<short-description>
Target Branch:        main
Commit message:       <type>(<scope>): <imperative description>
GitHub PR Labels:     <Labels> (e.g. coding, enhancement, test)
```

Branch prefix and commit type MUST follow the **Standard Task Types (16 Types)**:

| # | Task Type | Tiền tố Branch (`<prefix>/<short-desc>`) | Commit Type (`<type>(<scope>): <desc>`) | GitHub Label | Ý nghĩa & Phạm vi áp dụng |
|---|---|---|---|---|---|
| 1 | `Bug Fixing` | `fix/` | `fix(...)` | `bug` | Sửa test fail, logic sai lệch, edge cases chưa xử lý. |
| 2 | `Data Handling` | `data/` | `data(...)` | `enhancement` | Xử lý dữ liệu mảng, chuỗi, tiền xử lý input test. |
| 3 | `Consulting` | `docs/` | `docs(rfc): ...` | `documentation` | Phân tích bài toán, đề xuất mô hình kiến trúc. |
| 4 | `Modification` | `mod/` | `mod(...)` | `enhancement` | Cập nhật cấu hình, quy trình, CI/CD pipeline. |
| 5 | `Customization` | `custom/` | `feat(...)` | `coding` | Tùy biến giải thuật theo yêu cầu phỏng vấn ANZ. |
| 6 | `New Request` | `feature/` | `feat(...)` | `coding` / `enhancement` | Giải bài toán DSA mới hoặc bổ sung chủ đề kiến trúc mới. |
| 7 | `Support` | `support/` | `chore(support): ...` | `enhancement` | Hỗ trợ setup môi trường, script phụ trợ. |
| 8 | `Maintenance` | `maint/` hoặc `chore/` | `chore(...)` | `refactor` | Dọn dẹp mã nguồn, tối ưu bộ nhớ, loại bỏ dead code. |
| 9 | `Meta Data` | `meta/` | `meta(...)` | `documentation` | Cấu hình roadmap, danh mục bài tập, template markdown. |
| 10 | `DBMS Execution` | `db/` | `db(...)` | `system-design` | Bài toán Index B+Tree, ACID, Transaction, SQL vs NoSQL. |
| 11 | `Documentation` | `docs/` | `docs(...)` | `documentation` | Soạn thảo ghi chú, kịch bản tiếng Anh 6 bước, STAR stories. |
| 12 | `Reporting` | `report/` | `report(...)` | `documentation` | Báo cáo tiến độ ôn tập (Pilot, Weekly review). |
| 13 | `Troubleshooting` | `troubleshoot/` | `fix(...)` | `bug` | Điều tra nguyên nhân test crash, memory leak, Node.js event loop blocks. |
| 14 | `Testing` | `test/` | `test(...)` | `test` | Viết unit test native assert, kiểm tra độ phức tạp. |
| 15 | `Training` | `docs/training/` | `docs(training): ...` | `documentation` | Kịch bản phản biện trực tiếp, mock interview. |
| 16 | `Research` | `research/` | `feat(poc): ...` | `system-design` | Nghiên cứu sâu Node.js Libuv, V8 memory, Kafka internals. |

#### Standard Pull Request (PR) Description Template

When creating a Pull Request on GitHub, the description MUST follow this standard format:

```markdown
## 📌 Summary
- **Why**: <Problem Statement / Context>
- **What**: <Summary of changes / algorithms implemented>
- **Impact**: Time Complexity: O(...), Space Complexity: O(...)

## 🔍 Verification
1. Run native test: `npm test`
2. Test cases passed: X/X

## 🛠️ Context
- **Task Type**: `<Task Type>`
- **Related Plan**: `docs/plans/<plan-file>.md`
- **Target Branch**: `main`
```

---

## Plan Status Lifecycle

Every plan MUST maintain one of the 5 official lifecycle states:

| Status | Meaning | When to apply |
|---|---|---|
| `Open` | Ready for work | Plan is drafted, reviewed, and ready to be picked up by an Agent or Developer. |
| `In Processing` | Work in progress | Actively being coded, tested, or debugged in the current session. |
| `Pending` | On hold / Blocked | Paused due to external dependencies, blockers, or awaiting user decision. |
| `Cancelled` | Discarded | Decided not to implement or deprecated; kept for historical record. |
| `Closed` | Completed | 100% finished, fully verified, committed/pushed and merged. |

### Status Transition Rules
- When starting work on an `Open` or `Pending` plan → change status to `In Processing`.
- When pausing with unfinished work or hitting blockers at EOD → keep `In Processing` or change to `Pending`.
- When work is verified and pushed/merged → change to `Closed`.
- When user cancels a plan → change to `Cancelled`.

---

## Rules for the Implementing Agent

When given a plan file to execute:

1. **Read this file first** if you have not already done so this session.
2. Read the **Implementation Checklist** — this is your only action list.
3. Implement **test items first** (test-first order is mandatory).
4. After completing each checklist item, tick it: `- [x]`.
5. After all items are ticked, output the full checklist to confirm completeness.
6. If any item is **unticked**, implement it before reporting done.
7. If the checklist conflicts with the current codebase state, **STOP** and
   report the conflict to the user before proceeding.
8. Implement **nothing outside the checklist** without explicit user approval.
9. **Status Update**: Maintain the plan's `Status` field (`In Processing` during execution, `Closed` upon verified completion, `Pending` if blocked).

---

## Rules for the Planning Agent

When writing a plan:

1. **Executive & Business Summary Gate**: Every plan MUST begin with Section 2 (`Executive & Business Summary`) containing the 5 non-technical fields (Business Title, Why, What, Impact, How to Verify).
2. The Implementation Checklist must be complete enough that a different agent
   can implement the full feature without reading any other document.
3. Each checklist item must be verifiable: you must be able to answer
   "is this done?" with yes/no by reading the code alone.
4. Test items must be specific: state input, expected output, and the
   invariant being verified.
5. Do not write prose where a table or checkbox would suffice.
6. After writing the plan, read through the checklist once more and ask:
   "Could a junior developer implement this exactly as written?" If no, revise.
7. **Task Type Gate**: The plan MUST declare a valid `Task Type` from the 16 Standard Task Types in `Objective` and follow the corresponding branch prefix and commit convention in `Git Info`.
8. **Status Gate**: The plan MUST declare an explicit initial `Status` (`Open` or `In Processing`) in `Objective`.
9. **Target Branch Gate**: Default to `main` as the standard target branch.

