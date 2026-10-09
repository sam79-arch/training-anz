# Technical Plan: Week 4 Complete Through Friday (Days 2 to 5)

> **Task Type:** `DBMS Execution` & `New Request`  
> **Status:** `Closed` (Pending PR Merge)  
> **Target Branch:** `feat/week-04-complete-through-friday`  
> **Closes:** #47, #48, #49, #50  

---

## 1. Objective & Metadata

- **Task Type**: `DBMS Execution` (Days 2, 4) & `New Request` (Days 3, 5).
- **Status**: `Closed` (Pending PR Merge).
- **Target Branch**: `feat/week-04-complete-through-friday`.
- **Target Issues**:
  - Closes [#47](https://github.com/sam79-arch/training-anz/issues/47): Connection Pooling in Node.js
  - Closes [#48](https://github.com/sam79-arch/training-anz/issues/48): DSA Min Stack
  - Closes [#49](https://github.com/sam79-arch/training-anz/issues/49): Database Scaling: Sharding & Replication Lag (Read-Your-Own-Writes)
  - Closes [#50](https://github.com/sam79-arch/training-anz/issues/50): Mock HackerRank 45m & Friday Recall Test 15m

---

## 2. Executive & Business Summary

- **Business / Problem Title**: Complete Delivery for Week 4 Days 2–5 (Connection Pooling, Min Stack, Sharding & Replication Lag, and Mock HackerRank / Friday Recall).
- **Why**: Solidify database concurrency, scaling, and interview readiness for ANZ Bank Data Platform Team.
- **What**:
  - Pure Node.js `ConnectionPool` engine with leak detection and acquire timeout.
  - $O(1)$ Min Stack with two parallel arrays and duplicate min protection.
  - Consistent Hash `ShardedCluster` with Pin-to-Primary and Min-LSN routing preventing stale reads under replication lag.
  - Friday 15m Recall Test (Container With Most Water) and Mock HackerRank (Palindrome Linked List in-place $O(1)$ space with list restoration).
- **Impact**: Zero stale reads under high concurrency; 100% test pass rate across 20 test suites; sub-millisecond execution times.
- **How to Verify**: Run `npm test` verifying 20/20 test suites pass.

---

## 3. Affected Files

| File | Action | Description |
|---|---|---|
| `architecture/week-04/02-connection-pooling.js` | CREATE | ConnectionPool engine in pure Node.js |
| `architecture/week-04/02-connection-pooling.test.js` | CREATE | 9 test cases covering pool lifecycle, timeouts, leak detection |
| `architecture/week-04/02-connection-pooling.md` | CREATE | Architectural documentation & PostgreSQL sizing formula |
| `coding/week-04/02-min-stack.js` | CREATE | Two Parallel Stacks MinStack engine |
| `coding/week-04/02-min-stack.test.js` | CREATE | 8 test cases covering duplicate mins, monotonicity, 50k ops |
| `coding/week-04/02-min-stack.md` | CREATE | 6-step English interview script & PBL guide |
| `architecture/week-04/04-db-sharding-replication.js` | CREATE | ShardedCluster & ReadYourOwnWritesManager |
| `architecture/week-04/04-db-sharding-replication.test.js` | CREATE | 6 test cases for hash routing, lag staleness, pin-to-primary, LSN |
| `architecture/week-04/04-db-sharding-replication.md` | CREATE | Distributed database replication lag & pin-to-primary guide |
| `coding/week-04/03-mock-hackerrank-and-recall.js` | CREATE | Recall Container + In-place Palindrome Linked List |
| `coding/week-04/03-mock-hackerrank-and-recall.test.js` | CREATE | 8 test cases verifying recall, fast-slow pointers, restoration |
| `coding/week-04/03-mock-hackerrank-and-recall.md` | CREATE | 45m HackerRank simulation guide & Recall results |
| `package.json` | MODIFY | Added scripts `test:w4-02` to `test:w4-05`, updated `test` & `test:all` |
| `README.md` | MODIFY | Updated Week 4 progress dashboard |
| `docs/plans/_ACTIVE.md` | MODIFY | Registered active and closed plans |
| `docs/AGENT_STATE.md` | MODIFY | Updated state ledger and handoff status |

---

## 4. Implementation Checklist

- [x] Day 2: `architecture/week-04/02-connection-pooling.test.js` (9/9 TCs PASS)
- [x] Day 2: `architecture/week-04/02-connection-pooling.js`
- [x] Day 2: `architecture/week-04/02-connection-pooling.md`
- [x] Day 3: `coding/week-04/02-min-stack.test.js` (8/8 TCs PASS)
- [x] Day 3: `coding/week-04/02-min-stack.js`
- [x] Day 3: `coding/week-04/02-min-stack.md`
- [x] Day 4: `architecture/week-04/04-db-sharding-replication.test.js` (6/6 TCs PASS)
- [x] Day 4: `architecture/week-04/04-db-sharding-replication.js`
- [x] Day 4: `architecture/week-04/04-db-sharding-replication.md`
- [x] Day 5: `coding/week-04/03-mock-hackerrank-and-recall.test.js` (8/8 TCs PASS)
- [x] Day 5: `coding/week-04/03-mock-hackerrank-and-recall.js`
- [x] Day 5: `coding/week-04/03-mock-hackerrank-and-recall.md`
- [x] Config: `package.json` scripts updated
- [x] Config: `README.md` progress dashboard updated
- [x] Verification: Full repository regression `npm test` passes 20/20 test suites (163 test cases)

