# Claude Agent Instructions — training-anz

This file provides context and strict guidelines for Claude Code (and other Anthropic agents) working in this repository. It mirrors the intent of `AGENTS.md` which is read by OpenAI Codex and Google Gemini/Antigravity agents.

---

## Plan Writing Standard

All plan files in this repository follow a shared format defined in:

> **`docs/PLAN_STANDARD.md`**

When writing a new plan OR reading an existing plan written by another agent, read that file first. It defines the required sections, checklist format, and the rules every implementing agent must follow.

---

## Project Context & Architecture

This repository is dedicated to **PBL-driven Backend Interview Prep in native JavaScript** targeting the **HCLTech x ANZ Bank** technical interview:
- **Core Technology**: Native Node.js (18.x / 20.x), native `node:assert`, `node:crypto`, zero external npm dependencies.
- **Components**:
  - `coding/`: Solutions, test suites, and English interview scripts organized by roadmap weeks.
  - `architecture/`: System design templates, distributed systems notes, and event loop test suites.
  - `notes/`: Theory deep dives and two-pointer pattern guides.
  - `docs/`: Shared state ledger (`AGENT_STATE.md`), plan standard (`PLAN_STANDARD.md`), active plan registry (`plans/_ACTIVE.md`), and premium prompt slot (`prompts/_LATEST.md`).

---

## Native Testing & Verification

Do not use Jest or Mocha. All test suites are run natively:

```bash
# Run all unit tests
npm test

# Run specific test file
node coding/week-01/01-move-zeroes.test.js
node architecture/week-01/03-event-loop-phases.test.js
```

---

## Survival Tips & Coding Guardrails

1. **Line 1 Guard Clause**: Mandatory null/undefined/empty input check on line 1 of every function.
2. **Zero $O(n)$ In-Loop Array Mutations**: Never call `arr.splice()` or `arr.unshift()` inside loops.
3. **Test-First Order**: Always create/update test cases in `*.test.js` covering edge cases before writing implementation code in `*.js`.
4. **Think Out Loud English Script**: Always structure explanations in `*.md` files using the 6-step framework (Clarify, Brute-force, Optimize, Think out loud, Dry run, Conclusion).

---

## Planning & Handoff Workflow

1. Read `docs/AGENT_STATE.md` first and acknowledge the current state.
2. Create plans in `docs/plans/` adhering to `docs/PLAN_STANDARD.md`.
3. Wait for user approval ("OK") before writing production code.
4. Support the Multi-IDE Handoff Protocol ("Lưu bàn giao" and "Kết bàn giao") by updating `docs/AGENT_STATE.md`.

