---
name: Training ANZ Project Rules
description: Project guidelines, native JS rules, and workflow standards for Gemini and Antigravity agents in training-anz.
---

# 🛡️ Training ANZ - Project Guidelines & SOP Extensions

When working in this repository, the agent must adhere to the Core SOP in combination with the following project-specific standards:

## 1. Authoritative Guidelines & State
- **Primary Agent Guide**: Refer to [`AGENTS.md`](./AGENTS.md) for full protocol details.
- **Plan Writing Standard**: All technical plans must adhere to [`docs/PLAN_STANDARD.md`](./docs/PLAN_STANDARD.md).
- **Active State Ledger**: Always inspect and maintain [`docs/AGENT_STATE.md`](./docs/AGENT_STATE.md) upon session start, pause ("Lưu bàn giao"), and conclusion ("Kết bàn giao").
- **Active Plans Registry**: Check and maintain [`docs/plans/_ACTIVE.md`](./docs/plans/_ACTIVE.md).

## 2. Core Technical Constraints
- **Native JavaScript Only**: Strictly zero external dependencies. Only native modules (`node:assert`, `node:crypto`, `node:fs`) are permitted.
- **Execution & Test Runner**: Use `npm test` or direct node invocation `node <path-to-test>.test.js`. Do NOT install or run Jest, Mocha, or Babel.
- **Test-First Discipline**: Always implement test cases in `*.test.js` before writing solutions in `*.js`.
- **Line 1 Guard Clauses**: Mandatory validation of `null`, `undefined`, and boundary cases at the very start of functions.
- **No In-Loop Array Mutations**: Do not use `splice()` or `unshift()` inside loops ($O(n^2)$ trap).
- **6-Step English Communication Framework**: All algorithm documentation (`*.md`) must include the 6-step script: Clarify, Brute-Force, Optimize, Think Out Loud, Dry Run, Conclusion.

