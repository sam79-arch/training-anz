---
name: Weekly Curriculum Balance (training-anz)
description: >-
  Mandatory rules for planning weekly schedules, milestones, and daily tasks.
  Enforces a 50/50 balance between DSA Coding and System Design/Backend Internals,
  prevents algorithm fatigue, and limits LeetCode Medium cognitive load.
trigger: glob
glob: "{docs/plans/**,ROADMAP.md,README.md,docs/AGENT_STATE.md}"
---

# ⚖️ Weekly Curriculum Balance & Anti-Burnout Protocol

Mọi Agent khi lập kế hoạch (Phase 1 Planning), đề xuất bài học tiếp theo, hoặc tái cấu trúc Roadmap trong repository `training-anz` **BẮT BUỘC TUÂN THỦ** 4 quy tắc bất biến sau:

## 1. Quy Tắc Xen Kẽ Ngày (Alternating Schedule Invariant)
Tuyệt đối không xếp 2 ngày liên tiếp cùng học DSA/LeetCode:
- **Thứ 2, Thứ 4, Thứ 6 (3 ngày/tuần)**: **DSA Live Coding & English Scripting** (Tối đa 45-60 phút).
- **Thứ 3, Thứ 5 (2 ngày/tuần)**: **System Design, Database Optimization & Node.js Internals** (TUYỆT ĐỐI CẤM GIẢI LEETCODE để não bộ chuyển đổi sang tư duy kiến trúc).
- **Thứ 7 (1 ngày/tuần)**: **Behavioral STAR Story** (45 phút luyện phản xạ giao tiếp tiếng Anh về sự cố, xung đột kỹ thuật).
- **Chủ Nhật**: **Nghỉ ngơi hoàn toàn** để phục hồi năng lượng.

## 2. Giới Hạn Tải Nhận Thức Bài Medium (Cognitive Load Budgeting)
- **Tối đa 1 bài Medium mỗi tuần**: Một tuần chỉ được phép có tối đa 1 bài LeetCode Medium. Các ngày DSA còn lại phải là bài Easy hoặc bài biến thể nhẹ nhàng (dưới 20 dòng code).
- **Khuyến khích Tuần 0-Medium (Tuần 100% Easy)**: Các tuần củng cố nền tảng cấu trúc dữ liệu (như Stack, Linked List cơ bản) hoàn toàn có thể là tuần 100% Easy để dồn trọn vẹn năng lượng cho các ngày System Design & Database Internals.
- **Hàng rào đầu tuần (Early-Week Gate)**: Ngày Thứ 2 mở đầu tuần mới **TUYỆT ĐỐI CẤM GIẢI BÀI MEDIUM**. Thứ 2 luôn là bài Easy cơ bản để khởi động tuần nhẹ nhàng, xây dựng sự tự tin và nhịp sinh học 05:00 AM.
- **Tuyệt đối cấm xếp 2 bài Medium liền kề**: Không bao giờ lên kế hoạch 2 bài Medium trong cùng một đợt học mà không có ít nhất 2 ngày nghỉ/chuyển đổi chủ đề kiến trúc ở giữa.

## 3. Cân Bằng Trọng Số Phỏng Vấn ANZ (ANZ Interview Realism)
- Phỏng vấn ANZ Bank gồm 2 phiên: **Session 1 (Behavioral + 1 bài Coding HackerRank)** và **Session 2 (System Design phân tán)**.
- Phải đảm bảo thời lượng ôn tập phân bổ đều:
  - 30% cho Thuật toán DSA (rèn phản xạ 6 bước tiếng Anh, không học vẹt).
  - 50% cho Kiến trúc hệ thống & Backend Internals (Node.js Streams, Libuv, B+Tree Indexing, ACID, Redis Cache, Kafka).
  - 20% cho Phỏng vấn hành vi văn hóa (STAR Stories).

## 4. Kỷ Luật 60 Phút Mỗi Sáng (The 60-Minute Morning Gate)
- Nội dung của mỗi buổi sáng (05:00 - 06:00 AM) phải được thiết kế tinh gọn để người học có thể nắm vững và hoàn thành trọn vẹn trong đúng 60 phút.
- **Quy tắc 1 bài duy nhất mỗi buổi sáng (Single-Problem Invariant)**: Tuyệt đối cấm gộp 2 bài toán (ví dụ 1 bài Easy và 1 bài biến thể/Medium) vào chung 1 buổi sáng. Một buổi sáng DSA chỉ được giải DUY NHẤT 1 bài toán để đảm bảo trọn vẹn quy trình 5 bước PBL (Problem, Pain Point, Solution, Test Native Assert, English Script 6 bước, Generative UI Stepper).
- Nếu một bài tập đòi hỏi chứng minh toán học quá phức tạp hoặc vượt quá 60 phút, Agent phải chia nhỏ bài học thành 2 buổi (Part 1: Intuition & Brute-force; Part 2: Optimization & Invariant Proof).

