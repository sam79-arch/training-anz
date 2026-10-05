# Kế Hoạch Tối Ưu Lộ Trình Học: Tuần 3 → Tuần 12

> **Status:** `Open` — Chờ User duyệt ("OK") trước khi thực thi  
> **Task Type:** `Modification`  
> **Branch:** `mod/roadmap-optimization-w3-w12`  
> **Ngày lập:** 30/09/2026

---

## 1. Objective

### Vấn đề cần giải quyết
Sau đánh giá lộ trình từ Pilot Week đến Tuần 3, đã xác định **3 nguồn gốc gây cảm giác ngộp**:

1. **Density quá cao**: Mỗi bài DSA hiện sinh ra 5 file (`.js`, `.test.js`, `.md`, `notes/*.md`, `visualizer/*.html`) — tổng cộng 50+ files sau 3 tuần. Không ai ôn hết trong 60 phút/sáng.
2. **Thiếu Spaced Repetition**: Không có slot review kiến thức cũ nào trong 12 tuần. Học liên tục nạp vào mà không có cơ chế củng cố gây quên nhanh.
3. **Tuần 2 nhồi 3 Medium liên tiếp**: 3Sum (T3) → Container (T4) → Sliding Window (T5) — tuy là "biến thể" về pattern, nhưng mỗi ngày vẫn yêu cầu sản xuất đầy đủ docs + test. Tải nhận thức thực tế tương đương 3 bài Medium riêng lẻ.

### Mục tiêu
- **Giảm output/bài** từ 5 loại file xuống 3 loại.
- **Thêm "Friday Recall" (15 phút)** vào Thứ 6 — gõ lại 1 bài cũ từ trí nhớ, không xem tài liệu.
- **Giải nén lịch**: Hard cap 1 Medium/tuần, không ngoại lệ.
- **Bảo toàn 100% nội dung kiến thức gốc** trong ROADMAP.md — chỉ tái phân bổ trật tự và giảm tải.

---

## 2. Executive & Business Summary

| Hạng mục | Nội dung |
|---|---|
| **Business Title** | Tối ưu lịch học để giảm ngộp nhận thức, tăng khả năng ghi nhớ dài hạn |
| **Why** | Candidate đang học đúng hướng nhưng density mỗi ngày quá cao → dễ burnout trước Week 6 khi vào Redis/Kafka |
| **What** | 3 can thiệp: (A) Streamline output format, (B) thêm Friday Recall 15m, (C) điều chỉnh lịch Tuần 4–8 |
| **Impact** | Giảm ~30% tải file mỗi bài, tăng retention rate thực đo qua Recall test mỗi Thứ 6 |
| **How to Verify** | Cuối Tuần 4: chạy 1 Recall test không xem tài liệu. Nếu giải được trong 15 phút → cải thiện hiệu quả |

---

## 3. Affected Files

| File Path | Action | Mô tả |
|---|---|---|
| `ROADMAP.md` | MODIFY | Cập nhật lịch Tuần 4–8 theo phân bổ mới |
| `README.md` | MODIFY | Cập nhật bảng tiến độ + thêm quy tắc Friday Recall |
| `docs/plans/roadmap-optimization-w3-w12.md` | NEW | File plan này |
| `docs/plans/_ACTIVE.md` | MODIFY | Thêm plan mới vào registry |
| `AGENTS.md` | MODIFY | Cập nhật quy tắc output format và Friday Recall |

---

## 4. Implementation Checklist

- [x] **A. Chuẩn hóa Output Format** — Cập nhật AGENTS.md (quy tắc 3 files/bài, tiêu chí visualizer)
- [x] **B. Thêm Friday Recall Rule** — Cập nhật AGENTS.md + ROADMAP.md (phân bổ 60m Thứ 6 mới)
- [x] **C. Tái phân bổ lịch Tuần 4** — Cập nhật ROADMAP.md (Tuần 4 giữ nguyên, áp format mới)
- [x] **D. Tái phân bổ lịch Tuần 5–6** — Cập nhật ROADMAP.md (đổi vị trí Kadane + Binary Search)
- [x] **E. Tái phân bổ lịch Tuần 7–8** — Cập nhật ROADMAP.md (thêm Recall day đầu Phase)
- [x] **F. Cập nhật README.md** — Phản ánh các thay đổi lịch và quy tắc mới
- [x] **G. Cập nhật _ACTIVE.md** — Đăng ký plan này

---

## 5. Chi Tiết 3 Can Thiệp

---

### Can Thiệp A: Streamline Output Format (giảm 5 → 3 files/bài)

#### Quy tắc hiện tại (5 files/bài)
```
coding/week-XX/NN-<bài>.js          ← Solution
coding/week-XX/NN-<bài>.test.js     ← Test suite
coding/week-XX/NN-<bài>.md          ← PBL guide + English script
notes/week-XX/day-XX-<pattern>.md   ← Pattern cẩm nang (riêng)
docs/visualizers/wX-XX-<bài>.html   ← Visualizer (mỗi bài)
```

#### Quy tắc mới (3 files/bài, bắt đầu từ Tuần 3 Day 4)
```
coding/week-XX/NN-<bài>.js          ← Solution (giữ nguyên)
coding/week-XX/NN-<bài>.test.js     ← Test suite (giữ nguyên)
coding/week-XX/NN-<bài>.md          ← PBL guide + English script
                                       + Pattern notes (MERGE vào đây)
                                       + Complexity analysis
```

**Bỏ 2 loại file:**

| File bị bỏ | Lý do | Thay thế |
|---|---|---|
| `notes/week-XX/day-XX-<pattern>.md` | Nội dung trùng lặp với `.md` chính | Merge "Pattern Synthesis" section vào `.md` chính |
| `docs/visualizers/*.html` | Chỉ tạo khi có cơ chế PHỨC TẠP thực sự cần hình ảnh | Tiêu chí bên dưới |

**Tiêu chí quyết định có làm visualizer không:**
- ✅ Tạo visualizer: Sliding Window (abba trap), B+Tree (I/O path), Kafka (partition routing), Floyd's Cycle (fast/slow pointer)
- ❌ Bỏ visualizer: Valid Parentheses, Reverse Linked List, Merge Two Lists, Binary Search cơ bản

**Tiết kiệm thực tế:** ~2 files/bài × 9 bài còn lại ≈ **18 files ít hơn**, tiết kiệm ~45–60 phút/tuần.

---

### Can Thiệp B: Friday Recall — Spaced Repetition thực sự

**Thêm 15 phút vào Thứ 6** (trong slot 60 phút sáng):

```
Thứ 6 (DSA Day) — Phân bổ 60 phút mới:
├── 10m: Đọc Problem Scenario + nhận diện pattern
├── 15m: 🆕 RECALL TEST — Gõ lại 1 bài cũ từ trí nhớ (KHÔNG mở file)
│         Tuần 3: Gõ lại Two Sum (Hash) hoặc Valid Anagram
│         Tuần 4: Gõ lại 3Sum hoặc Container With Most Water
│         Tuần 5+: Chọn bài random từ 2 tuần trước
├── 20m: Tự gõ bài mới trên màn hình thô
└── 15m: Đọc to kịch bản tiếng Anh + chốt complexity
```

**Tiêu chí PASS Recall Test:**
- Gõ được đầy đủ guard clause + core logic trong 15 phút
- Không xem `.md`, `.js`, hay bất kỳ tài liệu nào
- Kết quả ghi vào 1 dòng comment trong file: `// Recall: [ngày] — PASS/FAIL in Xm`

---

### Can Thiệp C: Tái Phân Bổ Lịch Tuần 4–8

> **Nguyên tắc bất biến**: Không cắt bỏ bất kỳ chủ đề kiến thức nào. Chỉ tái phân bổ trật tự và giảm density.

#### Tuần 4 — Giữ nguyên cấu trúc, áp Output Format mới

```
T2 (T2): Merge Two Sorted Lists (Easy) — Dummy Head Node
T3 (T3): DB Connection Pooling — pg-pool, HikariCP, pool sizing
T4 (T4): Min Stack (Medium duy nhất tuần) — 2 stack song song O(1) getMin
T5 (T5): DB Sharding & Replication Lag — Master-Slave, Read-Your-Own-Writes
T6 (T6): Mock HackerRank 45m + Recall Test (gõ lại 1 bài tuần 2/3)
T7 (T7): Phase 1B Retrospective + Review STAR Story 1–3
```

**Thay đổi duy nhất:** Áp Output Format 3 files (bỏ `notes/*.md` riêng và visualizer nếu bài Easy đơn giản).

---

#### Tuần 5 — Phase 2A Week 1 (điều chỉnh)

```
Gốc (ROADMAP.md):                    Mới (đề xuất):
T2: Best Time to Buy Stock (Easy)    T2: Best Time to Buy Stock (Easy)        ← giữ
T3: Cache-Aside + TTL Jitter         T3: Cache-Aside vs Write-Through + TTL Jitter  ← giữ
T4: [bài Medium Kadane]              T4: 🆕 RECALL DAY — gõ lại Sliding Window
                                          + xem lại B+Tree note (không bài mới)
T5: Cache Penetration + Redlock      T5: Cache Penetration + Bloom Filter + Redlock  ← giữ
T6: Kadane / Max Subarray (Medium)   T6: Binary Search template (Easy pattern) + Recall
T7: STAR Story + Redis review        T7: STAR Story + Redis architecture review  ← giữ
```

**Lý do chuyển Kadane:** Redis deep dive (T3 + T5) + Kadane Medium (T6) cùng tuần = lặp lại lỗi Tuần 2. Thay bằng Binary Search Easy ở T6, Kadane chuyển sang Tuần 6.

---

#### Tuần 6 — Phase 2A Week 2 (điều chỉnh)

```
T2: Maximum Subarray / Kadane (Medium)     ← CHUYỂN từ Tuần 5 T6
    → Build từ Best Time to Buy Stock (Tuần 5) → không phải pattern mới
T3: Distributed Lock Redlock deep dive     ← giữ
T4: Recall Test: Buy Stock + Binary Search (2 bài × 10m, không xem file)
T5: Redis Cluster + Sentinel + Failover    ← giữ
T6: Search in Rotated Sorted Array (Medium) ← CHUYỂN từ Tuần 7
T7: Phase 2A Retrospective + STAR Story follow-up
```

---

#### Tuần 7–8 — Phase 2B: Kafka (điều chỉnh nhỏ)

```
Tuần 7:
  T2: Recall Day — gõ lại Kadane + Merge Two Lists (20m) + Binary Search biến thể (30m)
  T3: Kafka Partitioning + Consumer Group Rebalance
  T4: Search in Rotated đã học → Recall + biến thể nhỏ
  T5: Transactional Outbox Pattern + Debezium CDC
  T6: Linked List Cycle (Floyd's Tortoise & Hare) — Medium nhẹ, có visualizer
  T7: STAR Story 4 (Data pipeline failure) + Kafka review

Tuần 8:
  T2: Mock HackerRank 45m (Binary Search + Linked List mixed)
  T3: Idempotency Key + API payment retry design
  T4: Recall Test tổng hợp Phase 1 + Phase 2A (2 bài từ trí nhớ)
  T5: Kafka advanced: Dead Letter Queue + Exactly-Once semantics
  T6: Ôn tập tự do hoặc biến thể Max Product Subarray (nếu còn sức)
  T7: Milestone 4 Retrospective — Phase 2 hoàn tất
```

---

## 6. Bảng So Sánh Trước/Sau

| Chỉ số | Trước (hiện tại) | Sau (áp dụng plan) |
|---|---|---|
| Files/bài DSA | 5 (`.js` + `.test.js` + `.md` + `notes/*.md` + visualizer) | 3 (`.js` + `.test.js` + `.md` tích hợp) |
| Visualizer/tuần | Mỗi bài DSA đều có | Chỉ bài có cơ chế phức tạp (≤2/tuần) |
| Medium/tuần thực tế | Không giới hạn nghiêm (Tuần 2 có 3) | **Hard cap: 1 Medium/tuần, không ngoại lệ** |
| Revision slot | Không có | **15 phút Recall mỗi Thứ 6** |
| Phase transition | Không có warm-down | **Thứ 4 đầu Phase mới = Recall day**, không bài mới |
| Thứ 7 | Chỉ STAR Story | STAR Story (30m) + Gõ lại 1 bài cũ từ trí nhớ (15m) |

---

## 7. Out of Scope

- **Không thay đổi** kiến thức gốc trong ROADMAP.md (Redis, Kafka, ACID, B+Tree vẫn giữ nguyên)
- **Không thay đổi** tổng số bài DSA (vẫn đủ Two Pointers, Hashing, Stack, Linked List, Binary Search)
- **Không thay đổi** thứ tự T2/T4/T6 = DSA, T3/T5 = System Design
- **Không retrofit** lại các bài đã làm (Tuần 1–3 giữ nguyên hoàn toàn)
- **Không thêm** bài DSA mới ngoài ROADMAP gốc

---

## 8. Verification

Sau khi áp dụng, kết quả đo được tại **cuối Tuần 4**:

```bash
# Kiểm tra số files mỗi bài (kỳ vọng 3, không phải 5)
ls coding/week-04/ | wc -l

# Chạy Recall Test đầu tiên (Thứ 6 Tuần 3)
# → Gõ lại 3Sum từ trí nhớ trong 15 phút
# → npm test → tất cả pass
# → ghi "// Recall: 2026-10-03 — PASS in 13m" vào file

# Regression test toàn bộ
npm test  # Kỳ vọng: tất cả test pass, không regression
```

---

## 9. Git Proposal

- **Branch:** `mod/roadmap-optimization-w3-w12`
- **Commit:** `mod(roadmap): optimize weeks 4-8 schedule — reduce density, add spaced repetition`

---

*Kế hoạch lập bởi Antigravity | 30/09/2026 | Status: Open — Chờ "OK"*
