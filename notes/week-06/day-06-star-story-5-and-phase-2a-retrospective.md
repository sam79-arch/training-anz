# 🌟 Behavioral STAR Story 5 & Milestone 3 Retrospective (Week 6 Day 6)

> **Tuần 6 Day 6 (Thứ 7)**: Luyện phản xạ tiếng Anh phỏng vấn hành vi (Behavioral STAR) & Tổng kết Milestone 3 (Phase 2A: Caching Architecture & Redis Deep Dive).  
> **Target Role**: Senior Node.js Backend Engineer (ANZ Bank x HCLTech Vietnam).

---

## 🎙️ PHẦN 1: STAR STORY 5 — SỰ CỐ SPLIT-BRAIN CỤM REDIS & BẢO VỆ GIAO DỊCH TÀI CHÍNH

### 📌 Câu hỏi phỏng vấn ANZ (Interview Prompt):
> *"Tell me about a complex distributed system failure you encountered, how you diagnosed it under pressure, and the architectural safeguards you implemented to prevent data corruption."*

---

### 1. Situation (Bối cảnh thực tế)
> *"At my previous fintech project, we operated a high-throughput payment processing engine running on Kubernetes with a Redis Sentinel-managed primary-replica caching cluster handling over 25,000 requests per second. During a major cloud network partition (split-brain condition), the network link between our primary availability zone and the backup zone was severed. The Redis Master was isolated in Zone A with a minority of services, while two Redis Sentinels in Zone B detected a heartbeat timeout, declared `+odown`, and promoted a replica in Zone B to become the new Master. However, because Zone A's application pods could still reach the old Master, they continued writing transaction states to it, creating a dangerous Split-Brain anomaly where two masters accepted concurrent writes for the same account balances."*

---

### 2. Task (Mục tiêu & Trách nhiệm cá nhân)
> *"As the Senior Backend Engineer on duty, I needed to immediately halt conflicting state updates, ensure zero financial transaction discrepancies in our ledger, and architect permanent fail-safe mechanisms so that isolated Redis masters would autonomously reject write operations during partitions."*

---

### 3. Action (Hành động kỹ thuật bài bản)
> *"I executed three targeted interventions:*  
> *First, **immediate triage**: I used Redis CLI via our bastion host to issue `CLIENT KILL` on the isolated old Master in Zone A and redirected all ingress traffic strictly to the newly elected Master in Zone B. We reconciled the 18 transactions written to the old Master using our append-only database audit log, resolving all balance discrepancies with zero customer impact.*  
> *Second, **fail-safe master configuration**: To prevent isolated masters from ever accepting split-brain writes, I configured Redis parameter `min-replicas-to-write 1` along with `min-replicas-max-lag 10`. This guaranteed that if a Master loses contact with its replicas for more than 10 seconds, it automatically demotes itself to read-only mode and rejects incoming write operations.*  
> *Third, **end-to-end fencing tokens**: At the database persistence layer, we integrated monotonic Fencing Tokens generated during distributed locking. Even if a delayed client holding an expired lock from an old master attempted to update a customer's balance, PostgreSQL rejected the update because the incoming token was smaller than the highest committed token."*

---

### 4. Result (Kết quả & Giá trị định lượng)
> *"As a result:*  
> *1. **Zero Data Loss**: All 18 split-brain transactions were reconciled without any double-spending or financial discrepancy.*  
> *2. **Failover Resilience**: Our automated failover drill demonstrated that partitioned masters consistently transitioned to read-only mode in sub-10 seconds, eliminating split-brain risks entirely.*  
> *3. **SLA Compliance**: We sustained a 99.99% availability SLA, and our Redis Sentinel & Fencing Token architecture was adopted as the blueprint standard across all backend microservices."*

---

## 🏆 PHẦN 2: MILESTONE 3 (PHASE 2A) RETROSPECTIVE SCORECARD

### 1. Thống Kê Tổng Lực Codebase (Cumulative Health Check)
- **Tổng số Unit Test Suites**: **30 / 30 suites** (100% Native Node.js `node:assert`, zero third-party dependencies).
- **Tổng số Test Cases**: **231 / 231 test cases passed** (100% Pass rate).
- **Thời gian chạy toàn bộ Test Runner**: $< 1.5\text{ giây}$.

### 2. Bảng Tổng Hợp Kiến Thức Đã Hấp Thụ Trong Milestone 3 (Weeks 5 - 6)

| Chủ đề | DSA Coding ($O(n) / O(1)$) | Architecture & Internals (System Design) | Behavioral & Communication |
|---|---|---|---|
| **Tuần 5** | • Best Time to Buy Stock ($O(n)$)<br>• Binary Search Template ($O(\log n)$)<br>• Mid-Phase Recall (Sliding Window & B+Tree) | • Cache-Aside, Write-Through, Write-Behind<br>• TTL Jitter chống Cache Avalanche<br>• Bloom Filter & Null Object Caching<br>• Distributed Lock `SET NX PX` | STAR Story 4: Xử lý sự cố sập cụm Redis Production giờ cao điểm lương về. |
| **Tuần 6** | • Search Insert Position ($O(\log n)$)<br>• **Kadane's Algorithm ($O(n)$ - 1 Medium)**<br>• Binary Search Lower Bound Drill<br>• Friday Recall (Stock from memory) | • Redis Sentinel Quorum Consensus<br>• Redis Cluster Sharding (16,384 slots)<br>• Memory Eviction (LRU/LFU)<br>• **Redlock 5-node Consensus & Fencing Tokens** | STAR Story 5: Xử lý sự cố Split-Brain cụm Redis & Bảo vệ giao dịch tài chính. |

### 3. Sẵn Sàng Cho Milestone 4 (Weeks 7 - 8: Kafka & Event-Driven Architecture)
- Với việc hoàn tất Milestone 3, nền tảng Caching & Distributed Consensus của bạn đã đạt chuẩn Senior Backend Engineer.
- Tuần 7 sẽ chính thức mở ra **Milestone 4: Phase 2B (Event-Driven Kafka Architecture & Transactional Consistency)**.

