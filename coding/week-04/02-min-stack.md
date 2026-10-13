# 📘 Problem-Based Learning: Min Stack (LeetCode #155)

> **Tuần 4 — Day 3 (Thứ 4)**: Auxiliary State Stacks & $O(1)$ Retrieval  
> **Target**: Data Platform Team @ ANZ Bank  
> **Chuẩn hóa**: Tích hợp 3-file tinh gọn (Source, Unit Test, Cẩm nang PBL & Kịch bản tiếng Anh 6 bước).

---

## 1. 🏦 Business Scenario & Pain Point

Trong hệ thống xử lý giao dịch tài chính và cảnh báo rủi ro gian lận (Real-time Fraud & Risk Audit Pipeline) của ANZ Bank, các giao dịch tài chính trong một phiên làm việc (Session Audit Log) được lưu trữ theo cơ chế Ngăn xếp (LIFO). 

Hệ thống thanh toán bù trừ cần liên tục kiểm tra ngưỡng giá trị giao dịch nhỏ nhất hiện tại (`getMin()`) để đối soát với hạn mức tín dụng dự phòng (Emergency Liquidity Buffer).

### ⚠️ The Pitfalls (Bẫy thường gặp trong phỏng vấn)

1. **Bẫy Quét Tuyến Tính (Linear Scan $O(n)$)**:
   - Lưu trữ mảng thông thường. Mỗi khi gọi `getMin()`, duyệt qua $n$ phần tử `Math.min(...items)`.
   - **Hậu quả**: Chi phí $O(n)$ trên mỗi truy vấn `getMin()`. Khi phiên giao dịch có hàng chục nghìn thao tác, CPU sẽ bị nghẽn ở các vòng lặp quét mảng.
2. **Bẫy Biến Đơn Lưu Min (`minVal`)**:
   - Chỉ dùng một biến duy nhất `let minVal = Infinity`. Khi push giá trị nhỏ hơn thì cập nhật `minVal`.
   - **Hậu quả**: Khi gọi `pop()` trúng phần tử nhỏ nhất đó, ta **mất hoàn toàn lịch sử** của giá trị nhỏ thứ nhì trước đó, buộc phải duyệt lại toàn bộ stack để tìm min mới.
3. **Bẫy Trùng Lặp Phần Tử Nhỏ Nhất (Critical Duplicate Min Trap)**:
   - Dùng hai stack nhưng so sánh điều kiện ngặt `val < currentMin` thay vì `val <= currentMin`.
   - **Ví dụ**: Push chuỗi `[2, 0, 3, 0]`. `minStack` chỉ lưu `[2, 0]`. Khi `pop()` phần tử `0` ở đỉnh, `minStack` cũng pop `0`. Kết quả: `getMin()` trả về `2` thay vì `0` (vì vẫn còn một số `0` ở phía dưới)!

---

## 2. 💡 The Optimal Architecture: Two Parallel Stacks

### Kỹ thuật Hai Ngăn Xếp Song Song
Ta duy trì hai mảng:
1. `items`: Ngăn xếp chính lưu toàn bộ dữ liệu giao dịch theo thứ tự LIFO.
2. `minStack`: Ngăn xếp phụ chỉ lưu các giá trị kỷ lục nhỏ nhất (Monotonically Non-Increasing Stack).

```
   items              minStack
┌──────────┐        ┌──────────┐
│    0     │        │    0     │  <-- Đỉnh minStack (current min = 0)
├──────────┤        ├──────────┤
│    3     │        │    0     │  <-- Số 0 thứ nhất (bảo toàn duplicate)
├──────────┤        ├──────────┤
│    0     │        │    2     │
├──────────┤        └──────────┘
│    2     │
└──────────┘
```

### Invariant Bất Biến Cốt Lõi
- **Push rule**: `if (minStack.length === 0 || val <= minStack[top]) minStack.push(val);`
  - Bắt buộc dùng dấu `<=` để lưu trữ mọi giá trị min lặp lại.
- **Pop rule**: `if (popped === minStack[top]) minStack.pop();`
  - Chỉ pop khỏi `minStack` khi giá trị vừa rút ra bằng đúng giá trị min hiện tại.
- **GetMin rule**: `return minStack[top];`
  - Đọc trực tiếp phần tử đỉnh của `minStack` trong đúng $O(1)$ thời gian thực mà không quét mảng.

---

## 3. 🗣️ 6-Step English Communication Script (Phỏng Vấn ANZ)

### Step 1: Clarify
> *"We need to design a stack that supports `push`, `pop`, `top`, and retrieving the minimum element `getMin` — all in $O(1)$ time complexity.  
> Could the stack receive negative numbers and duplicate values? What should be returned if `pop()`, `top()`, or `getMin()` is called on an empty stack? And are we permitted to trade auxiliary space for optimal $O(1)$ time?"*

### Step 2: Brute-Force
> *"A naive approach uses a single standard stack. Each time `getMin()` is called, we scan all $n$ elements using `Math.min()`. While this consumes $O(1)$ auxiliary space, it degrades `getMin()` to $O(n)$ time complexity, which is unacceptable for real-time audit streaming.  
> Alternatively, keeping a single variable `minVal` fails because once that minimum is popped, we cannot recover the previous minimum without a full linear rescan."*

### Step 3: Optimize
> *"We achieve strictly $O(1)$ time for all operations by maintaining **Two Parallel Stacks**: a primary `items` stack and an auxiliary `minStack`.  
> The `minStack` acts as a historical snapshot of minimums. Whenever a new value is less than or equal to the current minimum, we push it onto `minStack`. When popping, if the removed item matches the current minimum, we pop from `minStack` as well. This guarantees $O(1)$ retrieval with $O(n)$ worst-case auxiliary space."*

### Step 4: Think Out Loud
> 1. *"First, we initialize `this.items = []` and `this.minStack = []` in the constructor."*  
> 2. *"In `push(val)`, line 1 validates that the input is a valid number. We push `val` into `this.items`. If `this.minStack` is empty or `val <= currentMin`, we push `val` into `this.minStack`. Notice the less-than-or-equal check is vital to handle duplicate minimums."*  
> 3. *"In `pop()`, if the stack is empty, we return undefined. We pop `popped = this.items.pop()`. If `popped` matches the top of `this.minStack`, we pop from `this.minStack` as well."*  
> 4. *"In `top()` and `getMin()`, we return the last element of `this.items` and `this.minStack` respectively in strictly $O(1)$ time."*

### Step 5: Dry Run
> *"Let's trace with `push(-2) -> push(0) -> push(-3)`:  
> - `push(-2)`: `items=[-2]`, `minStack=[-2]`.  
> - `push(0)`: `0 > -2`, so `items=[-2, 0]`, `minStack=[-2]`.  
> - `push(-3)`: `-3 <= -2`, so `items=[-2, 0, -3]`, `minStack=[-2, -3]`.  
> - `getMin()` returns `-3`.  
> - `pop()` removes `-3`. Since `-3 === minStack.top`, `-3` is popped from `minStack`.  
> - `top()` returns `0`.  
> - `getMin()` returns `-2`.  
> All operations match expected behavior in $O(1)$ time."*

### Step 6: Conclusion
> *"The time complexity is strictly $O(1)$ for all operations (`push`, `pop`, `top`, `getMin`).  
> The auxiliary space complexity is $O(n)$, where in the worst-case (a strictly decreasing sequence), every element is tracked in `minStack`."*

---

## 4. 🧩 Comparison: Two Stacks vs Single Stack with Pairs

| Tiêu chí | Two Parallel Stacks (Đang áp dụng) | Single Stack of Pairs (`{ val, min }`) | Single Stack với Offset Encoding (`2*val - min`) |
|---|---|---|---|
| **Memory Footprint** | Rất nhẹ: `minStack` chỉ lưu phần tử $\le$ min hiện tại | Tốn bộ nhớ: mỗi node đều lưu 1 object V8 `{ val, min }` | $O(1)$ space, nhưng có nguy cơ Integer Overflow trong JS |
| **Garbage Collection** | Tối ưu, mảng số nguyên phẳng (Smi Array trong V8) | Áp lực GC cao do tạo nhiều Object nhỏ | Tối ưu nhưng code khó đọc, dễ sinh bug |
| **Khả năng bảo trì** | Rõ ràng, dễ giải thích trong phỏng vấn | Dễ hiểu | Khó chứng minh toán học trong 15 phút phỏng vấn |

---

## 5. 🔬 Verification Commands

```bash
# Chạy bộ unit test riêng của Min Stack (8 test cases)
node coding/week-04/02-min-stack.test.js

# Hoặc qua npm script
npm run test:w4-03
```

