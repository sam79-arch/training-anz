# 📘 Problem-Based Learning: Merge Two Sorted Lists (LeetCode #21)

> **Tuần 4 — Day 1 (Thứ 2)**: Linked List Splicing with Dummy Head Node  
> **Target**: Data Platform Team @ ANZ Bank  
> **Chuẩn hóa**: Tích hợp 3-file tinh gọn (Source, Unit Test, Cẩm nang PBL & Kịch bản tiếng Anh 6 bước).

---

## 1. 🏦 Business Scenario & Pain Point

Trong hệ thống xử lý giao dịch thời gian thực của ANZ Bank, hai kênh giao dịch độc lập:
1. **ATM Transaction Feed** (luồng giao dịch từ mạng lưới máy ATM)
2. **Digital Banking Feed** (luồng giao dịch từ Mobile App & Internet Banking)

Cả hai luồng dữ liệu đều đã được sắp xếp tăng dần theo thời gian (timestamp-sorted stream). Để ghi vào Sổ cái Sắp xếp Thời gian thực (Chronological Settlement Ledger), hệ thống cần hợp nhất hai danh sách này thành một chuỗi liên kết duy nhất.

### ⚠️ The Naive Pitfalls (Bẫy thường gặp trong phỏng vấn)
1. **Bẫy Array Conversion + QuickSort**:
   - Trích xuất toàn bộ dữ liệu ra mảng, gọi `Array.prototype.sort()` rồi tái tạo danh sách.
   - **Hậu quả**: Độ phức tạp tăng lên $O((n+m) \log(n+m))$ thời gian và $O(n+m)$ bộ nhớ phụ, làm tăng áp lực cho Garbage Collector (V8 Young Generation GC pauses).
2. **Bẫy Đệ quy (Recursion Call Stack Overflow)**:
   - Dùng đệ quy `mergeTwoLists(l1.next, l2)`.
   - **Hậu quả**: Chi phí $O(n+m)$ Call Stack frames. Khi danh sách vượt quá 10,000 nodes, Node.js sẽ ném exception `RangeError: Maximum call stack size exceeded`.
3. **Bẫy Khởi tạo Head lồng điều kiện rườm rà**:
   - Viết nhiều câu lệnh `if (l1.val < l2.val) head = l1; else head = l2;` kèm biến cờ hiệu để bắt đầu danh sách, dễ sinh bug `null pointer dereference`.

---

## 2. 💡 The Optimal Architecture: Dummy Head Node & In-Place Splicing

### Kỹ thuật cốt lõi: Dummy Head Node
- Tạo một node giả lập: `const dummy = new ListNode(0);`
- Dùng một con trỏ trượt `tail = dummy`.
- **Lợi ích**: Triệt tiêu toàn bộ logic rẽ nhánh khởi tạo node đầu tiên. Con trỏ `tail` luôn có một node hợp lệ phía trước để thực hiện `tail.next = ...`.
- Khi kết thúc, danh sách hợp nhất bắt đầu tại `dummy.next`.

### Invariant & Remainder Attachment trong $O(1)$
- Khi một trong hai danh sách đã duyệt hết (`p1 === null` hoặc `p2 === null`), danh sách còn lại chắc chắn chứa các phần tử lớn hơn và đã được sắp xếp sẵn.
- Ta chỉ cần một phép gán con trỏ duy nhất:
  ```javascript
  tail.next = p1 !== null ? p1 : p2;
  ```
  Phép gán này thực thi trong $O(1)$ mà không cần lặp qua các phần tử còn lại.

---

## 3. 🗣️ 6-Step English Communication Script (Phỏng Vấn ANZ)

### Step 1: Clarify (Làm rõ bài toán)
> *"To ensure I understand the requirements correctly, we are given the heads of two sorted singly linked lists, `list1` and `list2`. We need to merge them into a single sorted linked list and return its head.  
> Could either of the lists be empty or null? Are the node values restricted to integers, including negative numbers and duplicates? And is our goal to achieve $O(1)$ auxiliary space by splicing the existing nodes in-place rather than allocating new ones?"*

### Step 2: Brute-Force (Giải pháp sơ khởi & Hạn chế)
> *"A naive approach would be to dump all node values into an array, sort the array in $O((n+m) \log(n+m))$, and then construct a brand new linked list. However, this incurs unnecessary heap allocations and $O(n+m)$ auxiliary space.  
> Alternatively, a recursive approach has $O(n+m)$ time, but it consumes $O(n+m)$ stack frames, which introduces a severe call stack overflow risk in Node.js when dealing with large lists in production."*

### Step 3: Optimize (Giải pháp tối ưu)
> *"We can optimize this to $O(n+m)$ time and strictly $O(1)$ auxiliary space using an iterative two-pointer technique with a **Dummy Head Node**.  
> The dummy node acts as an anchor, completely eliminating edge-case logic for initializing the new head. We compare the current nodes of both lists, attach the smaller node to our `tail.next`, and advance that pointer. Once one list is exhausted, we attach the remainder of the other list in $O(1)$ time."*

### Step 4: Think Out Loud (Thuyết minh trong khi viết mã)
> 1. *"First, line 1 is our guard clause: if either list is null or falsy, we immediately return the other list."*  
> 2. *"Next, I initialize `dummy = new ListNode(0)` and set `tail = dummy`. I also assign two pointers `p1 = list1` and `p2 = list2`."*  
> 3. *"Now, while both `p1` and `p2` are non-null: if `p1.val <= p2.val`, we set `tail.next = p1` and advance `p1`. Otherwise, `tail.next = p2` and advance `p2`. Then advance `tail = tail.next`."*  
> 4. *"After the loop, at least one list is empty. We link the remaining elements in $O(1)$ via `tail.next = p1 !== null ? p1 : p2`."*  
> 5. *"Finally, we return `dummy.next`, which is the true head of our merged list."*

### Step 5: Dry Run (Chạy thử từng dòng với ví dụ)
> *"Let's trace this with `list1 = [1, 2, 4]` and `list2 = [1, 3, 4]`:  
> - Initially: `dummy(0)`, `tail` at `dummy`, `p1=1`, `p2=1`.  
> - Iteration 1: `p1.val (1) <= p2.val (1)` $\rightarrow$ `tail.next = p1(1)`, `p1` moves to `2`, `tail` at `1`.  
> - Iteration 2: `p1.val (2) > p2.val (1)` $\rightarrow$ `tail.next = p2(1)`, `p2` moves to `3`, `tail` at `1`.  
> - Iteration 3: `p1.val (2) <= p2.val (3)` $\rightarrow$ `tail.next = p1(2)`, `p1` moves to `4`, `tail` at `2`.  
> - Iteration 4: `p1.val (4) > p2.val (3)` $\rightarrow$ `tail.next = p2(3)`, `p2` moves to `4`, `tail` at `3`.  
> - Iteration 5: `p1.val (4) <= p2.val (4)` $\rightarrow$ `tail.next = p1(4)`, `p1` becomes `null`, `tail` at `4`.  
> - Loop terminates because `p1` is `null`.  
> - Remainder: `tail.next = p2(4)`.  
> - Final list starting from `dummy.next`: `1 -> 1 -> 2 -> 3 -> 4 -> 4`. The logic is fully verified."*

### Step 6: Conclusion (Kết luận độ phức tạp)
> *"The time complexity is $O(n + m)$, where $n$ and $m$ are the lengths of the two lists, because each node is visited exactly once.  
> The auxiliary space complexity is $O(1)$ because we only allocate a single dummy node and rewire existing pointer references in-place without recursion."*

---

## 4. 🧩 Pattern Synthesis: The Dummy Head Node Idiom

Kỹ thuật **Dummy Head Node** là "vũ khí số 1" cho mọi bài toán Linked List mà đầu danh sách có thể thay đổi:

| Bài toán | Vấn đề nếu không có Dummy | Cách Dummy giải quyết |
|---|---|---|
| **Merge Two Sorted Lists** | Phải so sánh node đầu để gán biến `head` | `dummy.next` tự động giữ `head` của danh sách nhỏ hơn |
| **Remove Nth Node From End** | Nếu node cần xóa chính là `head` ban đầu | `dummy.next = head`, con trỏ luôn trỏ trước node cần xóa 1 bước |
| **Partition List** | Cần tách thành 2 danh sách `< x` và `>= x` | Dùng 2 Dummy nodes (`lessDummy`, `greaterDummy`), sau đó nối lại |
| **Reverse Linked List II** | Đảo một đoạn ở giữa danh sách | `dummy` neo giữ điểm bắt đầu, tránh null pointer khi đảo từ index 1 |

---

## 5. 🔬 Verification Commands

```bash
# Chạy bộ unit test riêng của bài toán (8 test cases)
node coding/week-04/01-merge-two-sorted-lists.test.js

# Hoặc qua npm script
npm run test:w4-01
```

