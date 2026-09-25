# AGENT SHARED STATE & HANDOFF LEDGER

## 🚦 TRẠNG THÁI HIỆN TẠI (Current State)

- **Task Type**: `New Request` → **Tuần 2 Day 4: Longest Substring Without Repeating Characters (Issue #25 - Đã hoàn thành Phase 2)**
- **Status**: `In Processing`
- **Task:** Triển khai bài 04 Tuần 2: Longest Substring Without Repeating Characters (#3 Medium) bằng Sliding Window kết hợp Hash Map/Set; phân tích thời gian O(n) và không gian O(min(m, n)); bối cảnh ANZ Sliding Session Token / Rate Limiter. 8/8 unit test cases PASS; 74/74 regression test cases PASS 100%. Đã tạo Generative UI visualizer tại `docs/visualizers/w2-04-longest-substring.html`.
- **Phase:** Phase 2: Implementation & Code Review (Đã hoàn tất code, test, docs, visualizer; sẵn sàng trình bày DIFF Preview).
- **Handoff:** `WEEK_02_DAY_04_IMPLEMENTED_AWAITING_REVIEW`.
- **Branch:** `feature/week-02-day-04-longest-substring`.

## 🎯 4-POINT MANDATORY HANDOFF CHECKLIST

1. **Location:** `coding/week-02/04-longest-substring.{js,test.js,md}`, `notes/week-02/day-04-sliding-window-patterns.md`, `docs/plans/week-02-day-04-longest-substring.md`, `docs/visualizers/w2-04-longest-substring.html`, `package.json`, `README.md`.
2. **Completed vs pending:**
   - **Completed:** 8/8 unit test cases pass; `lengthOfLongestSubstring(s)` hoàn chỉnh với Guard clause tại dòng 1 và Single-Pass Sliding Window; kịch bản tiếng Anh 6 bước; cẩm nang chuyên sâu bẫy nhảy lùi `abba`; script `test:w2-04`; visualizer HTML tương tác; cập nhật `README.md`, `_ACTIVE.md`; 74/74 regression test cases PASS 100%.
   - **Pending:** Trình bày DIFF Preview, chờ "OK" lần 2 từ User để thực hiện Phase 3 (Git commit & push).
3. **Exact next step:** Trình bày DIFF Preview và Implementation Checklist đã hoàn thành, chờ từ khóa "OK" từ User để thực hiện commit và push lên nhánh `feature/week-02-day-04-longest-substring`.
4. **Gotchas & Constraints:**
   - Kỹ thuật Cửa sổ trượt (Sliding Window): Dùng `left` và `right` pointers. Khi gặp ký tự đã tồn tại trong cửa sổ, nhảy `left = Math.max(left, lastSeenIndex + 1)` thay vì dịch từng bước để đạt $O(n)$ tối ưu.
   - Bắt buộc Guard clause tại dòng 1: bắt chuỗi null, undefined, invalid type; chuỗi rỗng trả về 0, chuỗi 1 ký tự trả về 1.
   - Đã tạo Generative UI Visualizer lưu vào `docs/visualizers/w2-04-longest-substring.html`.

## 📅 NHẬT KÝ TÍCH LŨY TRONG NGÀY (Daily In-Progress Ledger)

*(Đã tổng kết và làm sạch vào Trạng Thái Hiện Tại)*

## 📜 LỊCH SỬ BÀN GIAO (Rolling Handoff History)

- **2026-09-24:** `WEEK_02_DAY_03_COMPLETED` - Hoàn thành Container With Most Water (#11 Medium) bằng Two Pointers kẹp hai đầu, bổ sung trọn bộ visualizer HTML Tuần 1-2 (8/8 TCs, PR #30 merged, close #24).
- **2026-09-24:** `WEEK_02_DAY_02_COMPLETED` - Hoàn thành 3Sum bằng Two Pointers và 3-tier skip duplicate, cập nhật quy chuẩn Generative UI (8/8 TCs, PR #29 merged, close #23).
- **2026-09-23:** `WEEK_02_DAY_01_COMPLETED` - Hoàn thành Valid Anagram & Group Anagrams bằng Frequency Hashing (10/10 TCs, PR #28 merged, close #22).
- **2026-09-22:** `PILOT_WEEK_100_PERCENT_COMPLETED` - Hoàn tất Day 6 STAR Story 1 & Pilot Retrospective, khép lại 100% tuần thử nghiệm (PR #21 merged, close #14).
- **2026-09-18:** `PILOT_DAY_05_AND_AGENT_CONFIG_COMPLETED` - Hoàn thành giải thuật Two Sum & Contains Duplicate (12/12 TCs, PR #20 merged, close #13).

