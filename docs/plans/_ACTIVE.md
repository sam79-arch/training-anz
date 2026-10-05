# Active Plans Registry & Status Board

> **Source of Truth**: Registry of all plans in the repository categorized by the **5 Lifecycle Statuses** (`In Processing`, `Open`, `Pending`, `Cancelled`, `Closed`) and **16 Standard Task Types**.
> **EOD Rule**: Update the status of processed plans at the end of each working day or during handoff.

---

## 🚀 1. In Processing Plans (Đang thực hiện)

| Plan File | Task Type | Status | Branch | Description |
|---|---|---|---|---|
| `week-03-complete-remaining-days.md` | `New Request` | `In Processing` | `feat/week-03-complete-remaining-days` | Hoàn tất toàn bộ Tuần 3: DB Concurrency (Day 4), Floyd's Cycle (Day 5), STAR Story 3 & Retro (Day 6) |

---

## 📌 2. Open Plans (Sẵn sàng thực hiện / Backlog)

| Plan File | Task Type | Status | Target Branch | Description |
|---|---|---|---|---|
| *(None currently)* | — | `Open` | — | Backlog plans ready for allocation |

---

## ⏳ 3. Pending Plans (Tạm dừng / Chờ làm rõ / Blocker)

| Plan File | Task Type | Status | Blocker / Reason | Description |
|---|---|---|---|---|
| *(None currently)* | — | `Pending` | — | Paused plans awaiting confirmation |

---

## 🚫 4. Cancelled Plans (Đã hủy / Không cần làm)

| Plan File | Task Type | Status | Cancellation Reason | Description |
|---|---|---|---|---|
| *(None currently)* | — | `Cancelled` | — | Obsolete or superseded plans |

---

## ✅ 5. Closed Plans (Đã hoàn tất & Đóng)

| Plan File | Task Type | Status | Completed Date | Target Branch | Commit / PR |
|---|---|---|---|---|---|
| `pilot-day-01-move-zeroes.md` | `New Request` | `Closed` | 2026-09-14 | `main` | PR #16 / Commit `8fe6cfb` |
| `pilot-day-01-valid-palindrome.md` | `New Request` | `Closed` | 2026-09-14 | `main` | PR #15 / Commit `2e85dd9` |
| `pilot-day-02-libuv-event-loop.md` | `New Request` | `Closed` | 2026-09-15 | `main` | PR #17 / Commit `53b7d29` |
| `pilot-day-03-two-sum-sorted.md` | `New Request` | `Closed` | 2026-09-16 | `main` | Commit `afabb48` |
| `pilot-day-04-event-loop-microtasks.md` | `Research` | `Closed` | 2026-09-17 | `main` | Issue #12 Verification & Notes |
| `pilot-day-05-two-sum-hash.md` | `New Request` | `Closed` | 2026-09-18 | `main` | Issue #13 Implementation & Notes |
| `pilot-day-06-star-and-retrospective.md` | `Documentation` | `Closed` | 2026-09-22 | `main` | Issue #14 Implementation & Notes |
| `week-02-day-01-valid-anagram.md` | `New Request` | `Closed` | 2026-09-23 | `main` | PR #28 / Commit `8ede247` |
| `week-02-day-02-three-sum.md` | `New Request` | `Closed` | 2026-09-24 | `main` | PR #29 / Commit `ddff43c` |
| `week-02-day-03-container-with-most-water.md` | `New Request` | `Closed` | 2026-09-24 | `main` | PR #30 / Commit `7b18a10` |
| `week-02-day-04-longest-substring.md` | `New Request` | `Closed` | 2026-09-25 | `main` | PR #31 / Commit `fa4b275` |
| `week-02-day-05-streams-backpressure.md` | `Research` | `Closed` | 2026-09-25 | `main` | PR #32 / Commit `252a4de` |
| `week-02-day-06-star-and-retrospective.md` | `Documentation` | `Closed` | 2026-09-28 | `main` | PR #33 / Commit `ea4e8e7` |
| `week-03-day-01-valid-parentheses.md` | `New Request` | `Closed` | 2026-09-29 | `main` | PR #40 / Commit `2368859` |
| `week-03-day-02-btree-indexing.md` | `DBMS Execution` | `Closed` | 2026-09-29 | `main` | PR #41 / Commit `1a00cfd` |
| `week-03-day-03-reverse-linked-list.md` | `New Request` | `Closed` | 2026-09-30 | `main` | PR #43 / Commit `5e934ee` |
| `roadmap-optimization-w3-w12.md` | `Modification` | `Closed` | 2026-10-05 | `main` | PR #44 / Commit `ac81e71` |

---

## 🏷️ Standard Task Types & Status Quick Reference

- **Statuses**: `Open` (Ready), `In Processing` (WIP), `Pending` (Blocked/Hold), `Cancelled` (Discarded), `Closed` (Done).
- **Task Types**: `Bug Fixing`, `Data Handling`, `Consulting`, `Modification`, `Customization`, `New Request`, `Support`, `Maintenance`, `Meta Data`, `DBMS Execution`, `Documentation`, `Reporting`, `Troubleshooting`, `Testing`, `Training`, `Research`.
