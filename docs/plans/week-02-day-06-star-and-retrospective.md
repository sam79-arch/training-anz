# Kế hoạch Kỹ thuật: Day 6 — Behavioral STAR Story 2 & Week 2 Retrospective

## 1. Objective & Metadata

- **Task Type**: `Documentation`
- **Status**: `In Processing`
- **Target Branch**: `main`
- **Feature Branch**: `docs/week-02-day-06-star-retrospective`
- **Commit Message**: `docs(behavioral): implement star story 2 and week 2 retrospective (close #27)`

Kế hoạch này giải quyết việc bù tiến độ cho ngày Thứ Bảy tuần trước (Week 2 Day 6). Nội dung tập trung vào hoàn thiện kỹ năng phỏng vấn hành vi tại ANZ Bank với **STAR Story 2 (Severity-1 Production Outage: K8s OOMKilled, Missing Backpressure, Hotfix & RCA)** và lập báo cáo **Week 2 Retrospective** tổng kết toàn diện 5 chủ đề DSA & Node.js Internals của Tuần 2, khép lại trọn vẹn 100% mục tiêu của Milestone 1.

---

## 📌 2. Executive & Business Summary (Tóm tắt Nghiệp vụ)

- **Business / Problem Title**: 
  > Luyện phỏng vấn hành vi STAR Story 2 (Sự cố nghiêm trọng Production Sev-1 / RCA) & Báo cáo tổng kết Tuần 2 (Week 2 Retrospective).

- **Why / Problem Statement**:
  > Tiến độ ngày Thứ Bảy (2026-09-26) của Tuần 2 bị trễ. Trong quy trình phỏng vấn kỹ thuật của ANZ Bank (Stage 1), 15 phút mở đầu là phần Behavioral phỏng vấn về khả năng xử lý khủng hoảng sự cố Production (Sev-1 incident). Ứng viên cần kịch bản chuẩn Senior, tập trung vào số liệu định lượng, quy trình ứng phó khẩn cấp, bảo vệ toàn vẹn dữ liệu tài chính (Zero Financial Loss) và tư duy điều tra tận gốc (RCA).

- **What / Solution**:
  > - Biên soạn cẩm nang STAR Story 2 (`notes/week-02/day-06-behavioral-star-story-2.md`) với kịch bản 3–4 phút tiếng Anh chuẩn chỉnh, phân tách rõ S-T-A-R, sử dụng Power Verbs, đi kèm 3 câu hỏi Follow-up chuyên sâu từ hội đồng ANZ.
  > - Tình huống thực chiến: Sự cố Event Loop Starvation & Memory Exhaustion do thiếu Backpressure trong đợt quyết toán cuối tháng, khiến Pod K8s bị OOMKilled (`CrashLoopBackOff`).
  > - Biên soạn báo cáo tổng kết Tuần 2 (`notes/week-02/day-06-week-2-retrospective.md`) tổng kết 5 bài học kỹ thuật, phân tích độ phức tạp, và đánh giá tính tuân thủ quy tắc Curriculum Balance.
  > - Cập nhật Dashboard `README.md`, registry `docs/plans/_ACTIVE.md`, và ledger `docs/AGENT_STATE.md`.

- **Impact**:
  > Ứng viên tự tin làm chủ kịch bản Sev-1 Incident trong 15 phút mở đầu Stage 1; khép lại 100% mục tiêu của Tuần 2 (80/80 test cases PASS), sẵn sàng chuyển tiếp sang Tuần 3 (RDBMS Indexing, B+Tree, ACID & Stack/Linked List).

- **How to Verify**:
  > Rà soát nội dung tài liệu kịch bản STAR và báo cáo Retrospective; chạy toàn bộ test runner native `npm test` xác nhận 80/80 assertions PASS 100%.

---

## 3. Affected Files

| Thao tác | Đường dẫn file | Mục đích |
|---|---|---|
| **[NEW]** | `notes/week-02/day-06-behavioral-star-story-2.md` | Cẩm nang STAR Story 2 (Sev-1 Outage & RCA) & 3 câu hỏi Follow-up tiếng Anh |
| **[NEW]** | `notes/week-02/day-06-week-2-retrospective.md` | Báo cáo tổng kết toàn diện Tuần 2 (5 bài DSA & Internals) |
| **[NEW]** | `docs/plans/week-02-day-06-star-and-retrospective.md` | Kế hoạch kỹ thuật lưu trữ theo chuẩn `PLAN_STANDARD.md` |
| **[MODIFY]** | `README.md` | Đánh dấu hoàn tất Day 6 Tuần 2 `[x]` và gắn link tài liệu |
| **[MODIFY]** | `docs/plans/_ACTIVE.md` | Cập nhật danh mục Active Plans / Closed Plans |
| **[MODIFY]** | `docs/AGENT_STATE.md` | Cập nhật trạng thái handoff hoàn thành Tuần 2 |

---

## 4. Implementation Checklist

- [x] Tạo nhánh làm việc: Tạo feature branch `docs/week-02-day-06-star-retrospective`.
- [x] Tài liệu STAR Story 2: Tạo `notes/week-02/day-06-behavioral-star-story-2.md` (Bối cảnh K8s OOMKilled, S-T-A-R Script 3-4 phút, sơ đồ lỗi vs khắc phục, bảng chỉ số P99/RAM/Lag, 3 câu hỏi follow-up).
- [x] Báo cáo Week 2 Retrospective: Tạo `notes/week-02/day-06-week-2-retrospective.md` (Scorecard, Day-by-day review 5 ngày, Guardrails củng cố, Roadmap Tuần 3).
- [x] Kế hoạch kỹ thuật lưu trữ: Tạo `docs/plans/week-02-day-06-star-and-retrospective.md`.
- [x] Cập nhật Dashboard: Sửa `README.md` tick hoàn thành Day 6 `[x]` và cập nhật link tài liệu.
- [x] Cập nhật Registry: Sửa `docs/plans/_ACTIVE.md` ghi nhận plan Day 5 và Day 6.
- [x] Cập nhật Handoff Ledger: Sửa `docs/AGENT_STATE.md` ghi nhận hoàn thành Tuần 2.
- [x] Kiểm thử hồi quy: Chạy `npm test` xác nhận toàn bộ 80/80 test cases PASS 100%.

---

## 5. Out of Scope

- Không viết lại hoặc sửa đổi logic code giải thuật của các ngày Day 1 - Day 5 đã pass.
- Không cài đặt thêm bất kỳ thư viện npm bên ngoài nào (giữ nguyên tiêu chuẩn zero-dependency).
- Chưa triển khai các bài tập của Tuần 3 (sẽ thực hiện trong issue tiếp theo).

---

## 6. Edge Cases & Error Handling

| Tình huống | Cách xử lý |
|---|---|
| Xung đột nhánh giữa Day 5 và Day 6 | Nhánh Day 6 được phân nhánh từ commit `252a4de` để bảo đảm kế thừa toàn bộ thay đổi của Day 5. |
| Sai lệch số lượng assertions | Chạy trực tiếp `npm test` để kiểm chứng con số 80 test cases thực tế. |

---

## 7. Git Info

```
Branch:               docs/week-02-day-06-star-retrospective
Target Branch:        main
Commit message:       docs(behavioral): implement star story 2 and week 2 retrospective (close #27)
GitHub PR Labels:     documentation
```

---

## 8. Verification Command

```bash
npm test
```
Toàn bộ 80 test cases trên toàn bộ các test suites phải hoàn tất thành công 100% với exit code 0.
