---
name: Mandatory PR/MR Handoff Protocol
description: >-
  Enforces that after completing Phase 3 (Git commit & push), the agent MUST
  always provide the standardized PR/MR Title and Markdown Body message for GitHub/GitLab.
trigger: always_on
---

# 🚀 Mandatory PR / MR Handoff Protocol

Mọi Agent sau khi hoàn tất các lệnh Git Commit và Push lên feature branch ở **Phase 3 (Git & Push)** **BẮT BUỘC** phải đính kèm đầy đủ 2 khối nội dung sau trong thông điệp bàn giao cho User:

### 1. 🏷️ Tiêu đề Pull Request (PR Title)
Đúng chuẩn commit convention và đóng Issue:
```text
<type>(<scope>): <short-description> (close #<issue-number>)
```

### 2. 📝 Nội dung Pull Request (PR Body Message)
Khối Markdown chuẩn hóa gồm 3 phần chính (`Summary`, `Verification`, `Context`):

````markdown
## 📌 Summary
- **Why**: [Vấn đề kỹ thuật / nghiệp vụ cần giải quyết, nguyên nhân gốc rễ và Issue liên quan]
- **What**: 
  - [Các hàm, class, module và thay đổi kiến trúc chính đã triển khai]
  - [Giải thuật / Invariant / Xử lý edge cases đặc biệt]
  - [Bộ unit test native node:assert bao phủ các kịch bản]
  - [Tài liệu lý thuyết, cẩm nang notes và Generative UI visualizer nếu có]
- **Impact**: [Độ phức tạp Time/Space, đo lường RAM/CPU, cải thiện hiệu năng]

## 🔍 Verification
1. [Lệnh chạy unit test riêng của bài / module]
2. [Lệnh chạy regression test toàn hệ thống: `npm test` với số lượng test cases pass 100%]

## 🛠️ Context
- **Task Type**: [1 trong 16 Standard Task Types]
- **Related Plan**: [Đường dẫn file plan tương ứng]
- **Target Branch**: `main`
- **Closes**: #[Issue Number]
````

> ⚠️ **Quy tắc bất biến**: Tuyệt đối không dừng lại ở việc chỉ cung cấp link tạo PR. Khối Title & Body phải luôn được in ra sẵn sàng để User chỉ cần bấm nút Copy và dán thẳng vào GitHub/GitLab.
