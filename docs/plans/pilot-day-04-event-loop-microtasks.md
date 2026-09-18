# Pilot Day 04 — Node.js Internals: Microtasks vs Macrotasks & Event Loop Starvation

> **Plan ID:** `pilot-day-04-event-loop-microtasks`
> **GitHub Issue:** #12 — `[Week 1 - Day 4 / Thứ 5] Node.js Internals: Microtasks vs Macrotasks & Starvation`
> **Related Prior Art:** Day 02 note (`notes/week-01/day-02-event-loop-architecture.md`), Day 02 test (`architecture/week-01/03-event-loop-phases.test.js`), Issue #10.

---

## 1. Objective & Metadata

- **Task Type**: `Research` *(Standard Task Type #16)*
- **Status**: `Closed`
- **Target Branch**: `main`
- **Owner / Date**: samnguyen — Pilot Week Day 4 (Thứ 5), 2026-09-17

**What problem does this solve?**
Day 02 documented the 6 Libuv phases at a surface level but did not prove, with executable evidence, the *priority contract* between `nextTickQueue`, the microtask queue, and macrotask phases — nor the starvation failure mode that this contract creates in production.

**Why does it need solving now?**
Event Loop Starvation is the single most common Node.js Sev-1 root cause in payment/banking workloads, and it is a high-probability System Design follow-up in the ANZ interview. It also closes the "Pending" item recorded in `docs/AGENT_STATE.md`.

**What is the expected outcome when done?**
A deterministic, zero-dependency native test suite that empirically proves: (1) `nextTick` priority, (2) Node 11+ per-macrotask microtask flush, (3) cooperative scheduling via `setImmediate` vs `nextTick` starvation, and (4) a 3-level async trace; plus a notes dossier containing the payment-gateway Sev-1 case study, 5 interview puzzles, and a STAR + Think-Out-Loud English script.

---

## 📌 Executive & Business Summary (Tóm tắt Nghiệp vụ / Bài toán)

- **Business / Problem Title**:
  > Node.js Event Loop scheduling: how urgent "micro" work (`process.nextTick`, `Promise`) can starve real-world work (network I/O, timers, health checks).

- **Why / Problem Statement**:
  > Node.js runs application code on a single thread. If recurring `process.nextTick` callbacks keep refilling their queue, the Event Loop can never advance to the I/O phases. In a bank, this means the payment-gateway socket stops draining, `/healthz` never answers, and Kubernetes kills an otherwise healthy Pod (CrashLoopBackOff) — a customer-visible outage caused by a scheduling bug, not by load.

- **What / Solution**:
  > A pure-JavaScript, deterministic verification suite using only `node:assert`. Four test cases isolate each scheduling rule. The starvation case uses **bounded** recursion so CI can never hang, and proves the fix (`setImmediate` chunking) by letting a queued probe run before the work finishes.

- **Impact & Expected Performance**:
  > Run-time: constant work per case, bounded to fixed iteration counts (`N = 1000`), completing in well under one second. Space: `O(1)` (two counters + two log arrays). Business impact: converts a recurring Sev-1 outage class into a documented, interview-ready prevention pattern (chunking + `setImmediate` yielding); strengthens the System Design narrative for the ANZ Data Platform panel.

- **How to Verify**:
  > 1. Run `node architecture/week-01/04-microtasks-macrotasks.test.js` → all 4 TC groups PASS.
  > 2. Run `npm test` → Day 4 suite is appended and at least 4/4 Day 4 TCs PASS alongside all prior suites.
  > 3. Confirm TC-03 terminates (no hang) and asserts `probeNextTick === N` and `probeImmediate < N`.

---

## 3. Affected Files

| File | Action | Description |
|------|--------|-------------|
| `docs/plans/pilot-day-04-event-loop-microtasks.md` | CREATE | This standardized plan (source of truth for Issue #12) |
| `architecture/week-01/04-microtasks-macrotasks.test.js` | CREATE | Native `assert` test suite: TC-01 → TC-04 + runner |
| `notes/week-01/day-04-microtasks-macrotasks.md` | CREATE | Queue priority ASCII map, Node 11+ interleaving, payment-gateway Sev-1 case study, 5 interview puzzles, English script |
| `package.json` | MODIFY | Add `"test:04"`; append Day 4 suite to `"test"` and `"test:all"` (append only, never replace) |
| `README.md` | MODIFY | Tick Day 4 on the Pilot Week dashboard (line ~75) and link the new note |
| `docs/plans/_ACTIVE.md` | MODIFY | Move this plan to `In Processing` on start, then `Closed` on verified completion |
| `docs/AGENT_STATE.md` | MODIFY | Update Handoff Checklist / rolling history per `AGENTS.md` protocol |

---

## 4. Implementation Checklist

> **Test-first order is mandatory.** Test items appear before implementation items.
> Each item is independently verifiable by reading the file alone.

**Test suite (must be authored first):**

- [x] `architecture/week-01/04-microtasks-macrotasks.test.js`: header block (framework, run command, issue #12) + `require('assert')`.
- [x] `architecture/week-01/04-microtasks-macrotasks.test.js`: helper `assertLogOrder(logs, expected, label)` with a **line-1 guard clause** (`if (!Array.isArray(logs) || !Array.isArray(expected)) throw new TypeError(...)`).
- [x] `architecture/week-01/04-microtasks-macrotasks.test.js`: **TC-01** — register `Promise.then` then `queueMicrotask` then `process.nextTick` (nextTick last), plus two sync pushes; assert exact order `[sync-1, sync-2, nextTick, promise, queueMicrotask]`.
- [x] `architecture/week-01/04-microtasks-macrotasks.test.js`: **TC-02** — two `setTimeout(..., 0)`; inside timer #1 schedule `Promise.resolve().then(...)`; assert `[timer-1, promise-in-timer-1, timer-2]` (Node 11+ per-macrotask microtask flush; Node 18/20 both post-11).
- [x] `architecture/week-01/04-microtasks-macrotasks.test.js`: **TC-03** — bounded starvation probe: `setImmediate` probe scheduled *before* `recNextTick()` (N=1000) observes `probeNextTick === N`; then a second `setImmediate` probe scheduled before `recSetImmediate()` (N=1000) observes `probeImmediate < N`; assert `probeImmediate < probeNextTick`.
- [x] `architecture/week-01/04-microtasks-macrotasks.test.js`: **TC-04** — deterministic 3-level trace (top-level sync → `nextTick`/`Promise` → `setImmediate` → nested `setTimeout(0)`) asserting the exact 11-token order with no top-level timer/immediate race.
- [x] `architecture/week-01/04-microtasks-macrotasks.test.js`: `runAllTests()` runner (each step `await`ed, guard clause at line 1) + `if (require.main === module)` guard + `module.exports = runAllTests`.
- [x] Verify the suite terminates: `node architecture/week-01/04-microtasks-macrotasks.test.js` (must not hang; bounded N guarantees exit).

**Documentation and configuration (after tests pass):**

- [x] `notes/week-01/day-04-microtasks-macrotasks.md`: Section A — ASCII priority map `Call Stack → nextTickQueue → microtaskQueue → macrotask phase` plus state-transition table.
- [x] `notes/week-01/day-04-microtasks-macrotasks.md`: Section B — Node 11+ behavioral change (pre-11 batch flush vs post-11 per-callback flush) with before/after traces.
- [x] `notes/week-01/day-04-microtasks-macrotasks.md`: Section C — banking case study: payment-gateway webhook socket + `/healthz` Kubernetes probe → CrashLoopBackOff; root cause, timeline, blast radius, and the `setImmediate` chunking remediation.
- [x] `notes/week-01/day-04-microtasks-macrotasks.md`: Section D — 5 interview code puzzles each with the question, the exact expected output, and the explanation.
- [x] `notes/week-01/day-04-microtasks-macrotasks.md`: Section E — English script combining the 6-step framework (Clarify, Brute-force, Optimize, Think Out Loud, Dry Run, Conclusion) with a full STAR story for the Sev-1 incident.
- [x] `package.json`: add `"test:04": "node architecture/week-01/04-microtasks-macrotasks.test.js"` and append it to the `"test"` and `"test:all"` chains.
- [x] `README.md`: change the Day 4 checkbox to `[x]` and link `notes/week-01/day-04-microtasks-macrotasks.md`.
- [x] `docs/plans/_ACTIVE.md`: set this plan's status (`In Processing` → `Closed`) in the correct registry table.
- [x] `docs/AGENT_STATE.md`: record `PILOT_DAY_04_MICROTASKS_MACROTASKS_COMPLETED` in the rolling history and update the 4-point handoff.

---

## 5. Out of Scope

- No external npm dependencies will be introduced; only Node.js built-ins (`node:assert`) are permitted. No Jest/Mocha.
- `architecture/week-01/03-event-loop-phases.test.js` and all `coding/week-01/*` files remain untouched.
- No changes to `.github/workflows/ci.yml` or `pr-automation.yml` (the CI `npm test` chain will pick up Day 4 automatically once `package.json` is updated).
- No real sockets, HTTP servers, or `fs` I/O are exercised; starvation is proven with in-process probes only.
- Node.js versions before 11 are not supported for the interleaving assertion; the pre-11 behavior is documented in prose only.
- No `.vi.md` translation pair is produced in this task; the primary `.md` note is bilingual (VN explanation + EN script) as with Day 02/03.
- No algorithm/DSA source module is added — this is a research + verification deliverable, not a coding-problem deliverable.

---

## 6. Data Model / Architecture Changes

### 6.1 Scheduling Model (Microtask Priority Contract)

```text
        ┌──────────────────────────┐
        │      Call Stack (Sync)   │   ← runs to completion first
        └─────────────┬────────────┘
                      │ stack empties
                      ▼
        ┌──────────────────────────┐
        │   nextTickQueue (VIP 1)  │   ← drained to exhaustion, highest priority
        └─────────────┬────────────┘
                      │ empty?
                      ▼
        ┌──────────────────────────┐
        │ microtaskQueue (VIP 2)   │   ← Promise.then, queueMicrotask, async/await
        └─────────────┬────────────┘
                      │ empty?
                      ▼
 ┌─────────────────────────────────────────────────────────┐
 │                  Libuv Event Loop Phases                 │
 │  Timers → Pending → Idle/Prepare → Poll → Check → Close  │
 │  (after EVERY macrotask callback → back to VIP 1 + 2)    │
 └─────────────────────────────────────────────────────────┘
```

### 6.2 Node 11+ Interleaving (HTML5 Alignment)

| Behavior | Node ≤ 10 | Node ≥ 11 (Target: 18/20) |
|---|---|---|
| Microtask flush timing | Batch: all timer callbacks first, then microtasks | After **each** macrotask callback, drain VIP queues |
| `Promise` inside `setTimeout` #1 | Runs after `setTimeout` #2 | Runs **before** `setTimeout` #2 |
| Interleaving visible to app | No | Yes |

### 6.3 Starvation Mechanics & Cooperative Remediation

| Layer | Naive (defect) | Cooperative (fix) |
|---|---|---|
| Driver | Recursive `process.nextTick(work)` | Recursive `setImmediate(chunk)` |
| Queue drained | VIP queue refills before it can empty | Each chunk runs in Check phase, then loop yields |
| Poll phase (I/O) | Never reached → sockets stall | Reached between chunks → sockets drain |
| Timers phase | Never reached → health probe times out | Reached between chunks → `/healthz` answers |

### 6.4 Banking Case Study Mapping (Payment Gateway Sev-1)

```text
Client → API Gateway → Payment Service (Node.js)
                           │
                           ├── paymentWebhookSocket.on('data')  ← Poll phase (STARVED)
                           ├── /healthz                 ← Timers/Poll (STARVED)
                           └── process.nextTick(parseBatch) ← VIP queue (INFINITE REFILL)

Result: socket read stalls → webhook backlog → k8s liveness probe 3× timeout
        → Pod killed every ~60s → CrashLoopBackOff → settlement delay (Sev-1)

Remediation: replace nextTick recursion with setImmediate chunking (e.g. 500 records/chunk),
             cap queue depth, emit backpressure, and monitor event-loop lag.
```

**Idempotency & failure recovery note (for interview depth):** the webhook consumer must remain idempotent (dedupe by `paymentId` / event id) because a Pod that restarts mid-batch will re-deliver events; chunking bounds the re-work window and makes recovery predictable. Redis/Kafka are not introduced here — they are referenced only as the natural production home for the dedupe key and the dead-letter path.

---

## 7. Edge Cases & Error Handling

| Scenario | Expected behavior |
|----------|-------------------|
| Recursive `process.nextTick` runs unbounded | **Mitigated by design**: TC-03 caps recursion at `N = 1000` so the process always terminates and CI cannot hang. |
| Top-level `setTimeout(0)` competing with top-level `setImmediate` | Non-deterministic ordering by spec. TC-04 avoids the race by nesting the timer inside the `setImmediate`, guaranteeing a stable expected sequence. |
| Relative order of `Promise.then` vs `queueMicrotask` | Both share the V8 microtask queue → FIFO by registration order. TC-01 fixes registration order to make the assertion deterministic. |
| `nextTick` starvation assertion depends on wall-clock timing | Avoided: probes are queued *before* the workload and assert observed counters, not elapsed time. |
| Helper receives a non-array log/expected | Guard clause at line 1 throws `TypeError` before any comparison. |
| Running under Node < 11 | Out of scope; documented as behavioral difference in the note (Section B) and in this plan's Section 5. |
| Test suite imported (not run directly) | `if (require.main === module)` guard prevents auto-execution; `module.exports = runAllTests` allows reuse. |
| `package.json` edit accidentally drops an existing suite | Checklist mandates **append-only** changes to `"test"` and `"test:all"`; verification runs the full `npm test` chain. |
| Starvation probe fails to be "starved" (assertion `probeNextTick === N` fails) | Treated as a genuine behavioral regression signal (platform/semantics change), not a flaky test — investigation required before merge. |

---

## 8. Git Info

```
Branch:               research/week-01-day-04-microtasks-macrotasks
Target Branch:        main
Commit message:       feat(poc): document microtasks vs macrotasks and starvation mechanisms (close #12)
GitHub PR Labels:     system-design
Milestone:            Pilot: Workflow & Setup
```

> **Convention note:** This task is classified as `Research` (Standard Task Type #16), matching its registration in `docs/plans/_ACTIVE.md`. Per `docs/PLAN_STANDARD.md`, `Research` mandates the `research/` branch prefix, the `feat(poc):` commit type, and the `system-design` label. This intentionally supersedes the seed prompt's `feature/…` + `feat(internals)…` values, which do not map to a single Standard Task Type. The `test` and `documentation` labels will additionally be auto-applied by `.github/workflows/pr-automation.yml` based on file content/branch text.

### Standard Pull Request Description

```markdown
## 📌 Summary
- **Why**: Node.js Event Loop starvation is a recurring Sev-1 root cause in payment systems; Day 02 covered phases but not the microtask priority contract or its failure mode.
- **What**: Added a deterministic native-assert suite (4 TCs) proving nextTick priority, Node 11+ per-macrotask microtask flush, bounded starvation vs setImmediate cooperative scheduling, and a 3-level async trace; added a notes dossier with the payment-gateway Sev-1 case study, 5 puzzles, and a STAR English script.
- **Impact**: Runtime O(1) bounded (N=1000); Space O(1); converts a Sev-1 outage class into a documented prevention pattern.

## 🔍 Verification
1. Run native test: `node architecture/week-01/04-microtasks-macrotasks.test.js`
2. Test cases passed: 4/4 TC groups (TC-01 → TC-04)
3. Full regression: `npm test`

## 🛠️ Context
- **Task Type**: `Research`
- **Related Plan**: `docs/plans/pilot-day-04-event-loop-microtasks.md`
- **Target Branch**: `main`
```
