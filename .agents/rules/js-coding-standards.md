---
name: JS Coding Standards (training-anz)
description: >-
  Native JavaScript coding constraints for the training-anz project.
  Apply when the agent is editing, reviewing, or creating .js or .test.js files.
trigger: glob
glob: "**/*.js"
---

# Native JavaScript Coding Standards — training-anz

## 1. Runtime & Dependency Constraints

- **Native JavaScript Only**: Strictly zero external npm dependencies.
  Only native modules are permitted: `node:assert`, `node:crypto`, `node:fs`.
- **Test Runner**: Use `npm test` or direct `node <path>.test.js`.
  Do NOT install or invoke Jest, Mocha, Chai, Sinon, or Babel.

## 2. Test-First Discipline

- Always implement test cases in `*.test.js` BEFORE writing solutions in `*.js`.
- Every test case must cover: null input, empty array, single element,
  negative numbers, boundary limits, and the standard happy-path case.

## 3. Guard Clause at Line 1 (MANDATORY)

Every algorithm function MUST validate inputs at the very first line:

```js
// ✅ CORRECT — Guard clause at line 1
function twoSum(nums, target) {
  if (!Array.isArray(nums) || nums.length < 2) return [];
  // ... rest of logic
}
```

```js
// ❌ WRONG — Logic before guard clause
function twoSum(nums, target) {
  const map = new Map(); // Line 1 must be guard clause
  if (!nums) return [];
}
```

## 4. No In-Loop Array Mutations — O(n²) Trap

NEVER use `arr.splice()` or `arr.unshift()` inside a loop:

```js
// ❌ O(n²) trap
for (let i = 0; i < arr.length; i++) {
  arr.splice(i, 1); // degrades to O(n²)
}

// ✅ O(n) two-pointer or write-index pattern
let writeIdx = 0;
for (let i = 0; i < arr.length; i++) {
  if (arr[i] !== 0) arr[writeIdx++] = arr[i];
}
```

## 5. Safe Min/Max Initialization

Always initialize with actual array elements, never with `0`:

```js
// ❌ Breaks for arrays with all negative numbers
let max = 0;

// ✅ Safe initialization
let max = nums[0];
```

## 6. Prefer `new Map()` / `new Set()` Over Plain Objects

Use native `Map`/`Set` instead of `{}` for hash table patterns:

- Avoids V8 Prototype Pollution
- Avoids Hidden Class deoptimization from `delete obj[key]`
- O(1) average lookup, backed by C++ hash table

```js
// ❌ Avoid for hash table use cases
const seen = {};
seen[nums[i]] = i;

// ✅ Use native Map
const seen = new Map();
seen.set(nums[i], i);
```

## 7. 6-Step English Communication Framework

All algorithm documentation (`*.md`) MUST include the 6-step English interview script:

1. **Clarify** — inputs, bounds, edge cases
2. **Brute-Force** — explain O(n²) naive approach
3. **Optimize** — propose O(n) space-time trade-off
4. **Think Out Loud** — narrate logic while coding
5. **Dry Run** — trace line-by-line with an example
6. **Conclusion** — state final Time and Space Complexity

## 8. Interactive Algorithm Visualization (Generative UI)

Khi giải thích, minh họa hoặc hỗ trợ người học vượt qua các điểm nghẽn thuật toán phức tạp (Two Pointers, Sliding Window, Fast-Slow Pointers, Tree/Graph Traversal, Event Loop Phases):
- **Tạo Artifact HTML**: Tạo file HTML tự chứa (self-contained) trong thư mục artifact với Tailwind CSS và JavaScript điều khiển state machine (`steps = [...]`).
- **Quy chuẩn hiển thị tương phản cao (High Contrast Dark Theme)**:
  - Khung thẻ chính: `bg-[#1e293b] border-2 border-slate-600 rounded-2xl shadow-2xl text-slate-100`.
  - Con trỏ trực quan: Dùng các viền và hiệu ứng phát sáng (Glow effect) phân màu rõ rệt:
    - Con trỏ cố định (`i`): Màu xanh dương trời (`sky-400`).
    - Con trỏ trái (`Left` / `Slow`): Màu xanh ngọc (`emerald-400`).
    - Con trỏ phải (`Right` / `Fast`): Màu vàng hổ phách (`amber-400`).
  - Hộp tính toán & Giải thích: Thể hiện công thức toán học thời gian thực, lý do dịch chuyển con trỏ (Ví dụ: `Tổng âm -> Thiếu -> Tăng Left`), và cảnh báo bẫy trùng lặp (Skip Duplicates).
  - Điều khiển: Nút `Bước Trước`, `Bước Tiếp`, `Làm lại`.
- **Nhúng trực tiếp vào hội thoại**:
  ```html
  <agent-embed src="file:///<artifact_path>/visualizer.html"></agent-embed>
  ```
- **Lưu trữ vĩnh viễn trong Repository**:
  Bên cạnh file artifact nhúng vào chat, BẮT BUỘC lưu một bản sao độc lập tại `docs/visualizers/<id>-<tên-bài>.html` để commit vào Git, đồng thời gắn link trong file tài liệu giải thuật `*.md` để người học có thể mở offline trên bất kỳ trình duyệt nào (Chrome, Edge, Safari, Firefox).

