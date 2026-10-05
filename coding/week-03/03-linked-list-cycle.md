# Linked List Cycle (LeetCode #141 - Easy)

> **Topic:** Two Pointers / Floyd's Cycle Detection (Tortoise and Hare)  
> **Milestone:** Phase 1B (Week 3 Day 5 - In-place O(1) Space Mastery)  
> **Target:** HCLTech x ANZ Bank (Data Platform Team)  
> **Interactive Visualizer:** [Mở công cụ trực quan hóa Rùa & Thỏ](../../docs/visualizers/w3-05-linked-list-cycle.html)

---

## 1. Problem Scenario (Bối Cảnh Thực Tế Ngân Hàng)

Trong hệ thống xử lý luồng sự kiện phân tán (Data Pipeline & Graph Routing) của ngân hàng ANZ, các tài khoản và giao dịch định tuyến qua đồ thị hoặc danh sách liên kết các node dịch vụ (Microservices Message Forwarding).
Nếu một cấu hình định tuyến sai (Routing Loop) dẫn đến việc thông điệp bị chuyển tiếp lòng vòng vô tận (`Node A -> Node B -> Node C -> Node A`):
- CPU và bộ nhớ của worker thread bị vắt kiệt (Event Loop Starvation).
- Đơn hàng / giao dịch bị nghẽn (Timeout, Memory Leak).

Yêu cầu: Viết một hàm `hasCycle(head)` kiểm tra danh sách liên kết có chứa chu trình khép kín hay không với yêu cầu khắt khe: **Strictly $O(1)$ auxiliary space**, tuyệt đối không cấp phát thêm bộ nhớ phụ thuộc vào độ dài danh sách và không làm thay đổi (mutate) cấu trúc node ban đầu.

---

## 2. Pain Point $O(n)$ Space & Bẫy Hiệu Năng

### ❌ Cách tiếp cận ngây thơ 1: Hash Set (Lãng phí RAM)
- Duyệt qua từng node, lưu tham chiếu node vào `new Set()`. Nếu gặp lại một node đã có trong Set $\rightarrow$ Có chu trình.
- **Pain Point**: Tốn $O(n)$ bộ nhớ phụ trợ. Trên luồng dữ liệu 1,000,000 sự kiện, việc cấp phát Set chứa 1 triệu con trỏ 64-bit gây áp lực rác lớn lên V8 Garbage Collector, kích hoạt Major GC Pause làm đơ luồng xử lý.

### ❌ Cách tiếp cận ngây thơ 2: Đánh dấu cờ (Object Mutation Trap)
- Gán cờ trực tiếp vào node: `node.visited = true`.
- **Pain Point**: Vi phạm nguyên tắc bất biến (Immutability). Gây ô nhiễm V8 Hidden Classes (deoptimization) và làm hỏng luồng dữ liệu của các tiến trình đọc đồng thời khác.

---

## 3. Giải Pháp Tối Ưu: Thuật Toán Con Trỏ Rùa & Thỏ (Floyd's Tortoise and Hare)

Sử dụng 2 con trỏ cùng xuất phát từ `head`:
- **Con trỏ Chậm (Slow / Tortoise)**: Mỗi bước nhảy 1 node (`slow = slow.next`).
- **Con trỏ Nhanh (Fast / Hare)**: Mỗi bước nhảy 2 nodes (`fast = fast.next.next`).

```
Khởi đầu:
   Head -> [ 3 ] -> [ 2 ] -> [ 0 ] -> [ -4 ]
             ▲                          │
             └──────────────────────────┘
   slow = [3], fast = [3]

Bước 1: slow = [2], fast = [0]
Bước 2: slow = [0], fast = [2]  (fast đuổi theo slow trong vòng lặp)
Bước 3: slow = [-4], fast = [-4] --> slow === fast! (BẮT ĐƯỢC CHU TRÌNH)
```

### 📐 Chứng Minh Toán Học: Tại Sao Rùa và Thỏ Chắc Chắn Gặp Nhau?
1. Giả sử danh sách có phần chu trình khép kín độ dài $C$ nodes.
2. Khi con trỏ `slow` bước vào đầu chu trình, con trỏ `fast` đã ở đâu đó bên trong chu trình. Giả sử khoảng cách đuổi theo từ `slow` đến `fast` theo chiều kim đồng hồ là $d$ nodes ($0 \le d < C$).
3. Sau mỗi bước lặp:
   - `slow` tiến 1 bước: $+1$.
   - `fast` tiến 2 bước: $+2$.
   - Khoảng cách giữa `fast` và `slow` thay đổi: $(d + 2) - 1 = d + 1$ (tức là khoảng cách `fast` đuổi theo `slow` giảm đi đúng 1 đơn vị mỗi vòng: $C - (d + 1)$).
4. Vì khoảng cách giảm đều đặn **1 node sau mỗi nhịp lặp**, khoảng cách chắc chắn phải về $0$ trong tối đa $C$ bước lặp. Con trỏ `fast` không thể "nhảy cóc" qua mặt `slow`!
- **Độ phức tạp thời gian (Time Complexity)**: $O(n)$ với $n$ là tổng số nodes.
- **Độ phức tạp không gian (Auxiliary Space)**: $O(1)$ — chỉ dùng đúng 2 biến con trỏ.

---

## 4. Kịch Bản Đối Thoại Tiếng Anh Chuẩn 6 Bước (ANZ Interview Script)

### Step 1: Clarify
> *"Can the linked list be empty or contain only a single node? Can we modify the original node structure by adding a visited flag, or must the input list remain strictly immutable?"*

### Step 2: Brute-Force
> *"The naive approach uses a `Set` to store visited node references. If we encounter a node already present in the Set, a cycle exists. However, this takes $O(n)$ auxiliary space, which can easily trigger V8 Garbage Collection pauses when processing millions of transaction nodes."*

### Step 3: Optimize
> *"To achieve $O(1)$ auxiliary space without any node mutation, I will use Floyd's Tortoise and Hare algorithm with two pointers moving at different speeds: slow moves one step while fast moves two steps."*

### Step 4: Think Out Loud
> *"First, line 1 is a guard clause: if `head` is null or `head.next` is null, no cycle is possible, so I return `false` immediately. Next, I initialize both `slow` and `fast` pointers at `head`. In the `while` loop, I must verify both `fast` and `fast.next` are not null before dereferencing `fast.next.next` to avoid a `TypeError`. If `slow === fast`, the hare has caught up with the tortoise, proving the existence of a loop."*

### Step 5: Dry Run
> *"Let's trace with `[3, 2, 0, -4]` where `-4` points back to `2`. At step 1, slow is at `2`, fast is at `0`. At step 2, slow is at `0`, fast loops back to `2`. At step 3, slow reaches `-4`, and fast jumps two steps from `2` to `-4`. Since `slow === fast`, we return `true`."*

### Step 6: Conclusion
> *"The time complexity is $O(n)$ because fast travels at most $2n$ steps before meeting slow or hitting the tail. The auxiliary space complexity is strictly $O(1)$ as we only maintain two local pointer references."*

---

## 5. Spaced Repetition: Friday Recall Test (15 Phút)

> **Kỷ luật thứ 6:** 15 phút đầu phiên sáng (05:00 - 05:15 AM), hãy mở một màn hình trống (Notepad hoặc trình soạn thảo thô không có auto-complete), gõ lại thuật toán này hoàn toàn từ trí nhớ:
> 1. Dòng 1: Guard Clause kiểm tra `!head || !head.next`.
> 2. Khởi tạo `let slow = head, fast = head;`.
> 3. Vòng lặp `while (fast && fast.next)`.
> 4. Kiểm tra điều kiện `slow === fast`.
> 5. Chạy `npm test` và ghi lại: `// Recall: [YYYY-MM-DD] - PASS in Xm`.

---

## 6. Pattern Synthesis

```text
CONCURRENT / LINKED LIST CYCLE PATTERN:
- Single pointer with Set   -> O(n) space (Rejected in High-throughput banking)
- Slow & Fast Two Pointers  -> O(1) space, O(n) time (Floyd's Invariant)
- Speed differential (2 - 1 = 1) guarantees collision within cycle length C.
```
