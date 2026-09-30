# 📝 Hướng Dẫn Giải Thuật: Reverse Linked List (Week 3 Day 3)

> **Mục tiêu phỏng vấn ANZ:** Làm chủ cấu trúc dữ liệu Danh sách liên kết đơn (Singly Linked List) trong môi trường JavaScript V8, kỹ thuật 3 con trỏ chạy trượt (`prev`, `curr`, `next`) đảo ngược in-place với $O(1)$ auxiliary space, triệt tiêu rủi ro tràn Call Stack so với đệ quy, và thuyết trình lưu loát kịch bản tiếng Anh 6 bước trong bối cảnh kiểm toán nhật ký giao dịch ngân hàng (Banking Audit Trail Reversal).

---

## 📚 1. Nền Tảng: Singly Linked List Trong JavaScript V8 Engine

Trước khi giải thuật toán đảo ngược, cần nắm vững 3 bản chất cốt lõi của Linked List trong môi trường Node.js:

### 1.1. Cấu trúc một Node trong JavaScript
Khác với C/C++ có con trỏ địa chỉ ô nhớ thô (`*ptr`), trong JavaScript:
- Linked List được cấu thành từ các đối tượng độc lập cấp phát trên **V8 Heap Memory**.
- Mỗi node chứa 2 thuộc tính: giá trị dữ liệu (`val`) và tham chiếu tới node tiếp theo (`next`).
```javascript
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;   // Dữ liệu nghiệp vụ (mã giao dịch, số tiền, id)
    this.next = next; // Tham chiếu trỏ tới đối tượng node tiếp theo
  }
}
```

### 1.2. So sánh Mảng (Array) vs Danh sách liên kết (Linked List)

| Tiêu chí | JavaScript Array (`[]`) | Singly Linked List | Ý nghĩa trong hệ thống ANZ Bank |
|---|---|---|---|
| **Bộ nhớ (Memory Layout)** | Liền kề (Contiguous Memory), tận dụng tốt CPU L1/L2 Cache Line | Phân tán trên Heap, kết nối qua object reference | Linked List không đòi hỏi khối RAM liên tục lớn |
| **Truy xuất ngẫu nhiên (Random Access)** | $O(1)$ qua chỉ mục `arr[i]` | $O(n)$ phải duyệt tuần tự từ `head` | Array phù hợp tra cứu; Linked List phù hợp xử lý luồng |
| **Chèn/Xóa ở đầu (Prepend / Delete Head)** | $O(n)$ do phải dịch chuyển (shift) toàn bộ mảng | **$O(1)$** chỉ cần cập nhật lại tham chiếu `head` | **Linked List vượt trội** trong Queue, Undo Log, Audit Trail |
| **Cấp phát bộ nhớ** | Tự động resize mảng (tốn chi phí copy khi mảng đầy) | Cấp phát động từng node độc lập | Không có chi phí dời mảng khi mở rộng |

### 1.3. Bẫy tư duy lớn nhất của JS Developer: Gán biến vs Đột biến thuộc tính
* **Gán lại biến (Variable Reassignment)**:
  `curr = prev;` $\rightarrow$ Chỉ thay đổi nhãn cục bộ `curr` trỏ sang đối tượng mà `prev` đang trỏ. **Cấu trúc liên kết trên Heap không hề bị thay đổi**.
* **Đột biến thuộc tính (Property Mutation)**:
  `curr.next = prev;` $\rightarrow$ **Thực sự cắt đứt mũi tên liên kết cũ** của node trên Heap và bẻ ngược nó trỏ về `prev`.

---

## 🧭 2. Tóm Tắt Đề Bài & Thách Thức Kỹ Thuật

### Reverse Linked List (LeetCode #206 - Easy)
* **Đề bài:** Cho `head` của một danh sách liên kết đơn. Hãy đảo ngược danh sách và trả về `head` mới của danh sách sau khi đảo ngược.
* **Ví dụ:**
  - Input: `1 -> 2 -> 3 -> 4 -> 5 -> null`
  - Output: `5 -> 4 -> 3 -> 2 -> 1 -> null`
* **Các cách tiếp cận thường gặp:**
  1. *Sao chép sang Mảng (Array Auxiliary):*
     - Duyệt danh sách, lưu toàn bộ giá trị vào mảng, sau đó duyệt ngược để tạo các node mới.
     - *Nhược điểm:* Tốn $O(n)$ bộ nhớ phụ, gây áp lực lên V8 Garbage Collection (GC allocation churn).
  2. *Đệ quy (Recursion):*
     - Gọi hàm đệ quy đến cuối danh sách rồi quay lui đảo mũi tên: `head.next.next = head; head.next = null;`.
     - *Nhược điểm chí mạng:* Mỗi tầng đệ quy đẩy 1 Stack Frame vào Call Stack của V8. Khi danh sách có 20,000 – 50,000 nodes, Node.js lập tức văng `RangeError: Maximum call stack size exceeded`.
  3. *3 Con trỏ In-place (Senior Choice):*
     - Dùng 3 con trỏ `prev`, `curr`, `next` chạy trượt tuyến tính trong 1 vòng lặp `while (curr !== null)`.
     - *Ưu điểm:* $O(n)$ time, $O(1)$ space, an toàn tuyệt đối với mọi kích thước danh sách.

---

## 🏦 3. Bối Cảnh Thực Tế Tại ANZ Bank

Trong kiến trúc **Data Platform & Core Transaction Ledger** của ANZ:

1. **Banking Audit Trail Reversal (Đảo ngược nhật ký kiểm toán):**
   - Các bản ghi giao dịch (Journal Entries) được ghi nhận tuần tự theo thời gian phát sinh dưới dạng chuỗi liên kết đơn nhằm đảm bảo tính toàn vẹn (Append-only / Immutable sequence).
   - Khi chuyên viên kiểm toán hoặc hệ thống rà soát gian lận (Fraud Detection) cần báo cáo đối soát theo thứ tự đảo ngược thời gian (Reverse Chronological Report: giao dịch mới nhất được phân tích trước), hệ thống cần đảo ngược chuỗi liên kết này.
2. **Compensating Transaction Replay (Hồi quy giao dịch bù trừ):**
   - Trong mô hình phân tán Saga Pattern, khi một chuỗi giao dịch chuyển tiền nhiều bước thất bại ở bước cuối, hệ thống phải thực hiện các giao dịch bù trừ theo thứ tự đảo ngược chính xác từ bước mới nhất về bước đầu tiên.
3. **Triệt tiêu nguy cơ Call Stack Overflow trong Production:**
   - Trong các đợt quyết toán cuối ngày (End-Of-Day Batch Settlement), một chuỗi giao dịch liên quan có thể lên tới hàng chục nghìn bản ghi. Giải thuật lặp (iterative) $O(1)$ auxiliary space đảm bảo tiến trình worker Node.js không bao giờ bị sập do tràn bộ nhớ ngăn xếp.

---

## 📊 4. Bảng So Sánh Độ Phức Tạp (Complexity Analysis)

| Thuật toán | Time Complexity | Auxiliary Space | Call Stack Safety | Nhận xét từ Giám khảo ANZ |
|---|---|---|---|---|
| **Array Copying & Rebuilding** | $O(n)$ | $O(n)$ | An toàn | Không tối ưu bộ nhớ. Tạo rác trên Heap khiến V8 GC phải dừng tiến trình để dọn dẹp (Stop-the-world GC pause). |
| **Đệ quy (Recursion)** | $O(n)$ | $O(n)$ stack | ❌ **Rất nguy hiểm** | Văng `RangeError` khi danh sách vượt quá giới hạn Call Stack (~10,000 frames). |
| **3 Con trỏ In-Place (Lặp)** | **$O(n)$** | **$O(1)$** | ✅ **Tuyệt đối an toàn** | **Chuẩn Senior**. Tái sử dụng 100% node có sẵn, không cấp phát thêm bộ nhớ, tốc độ xử lý dưới 1ms cho 50,000 nodes. |

---

## 🎙️ 5. Kịch Bản Tiếng Anh 6 Bước (ANZ Live Coding Script)

### Step 1: Clarify (Làm rõ yêu cầu)
> *"Before jumping into the implementation, I'd like to clarify the problem constraints. Can the input list be empty (`null`), or contain only a single node? What types of values do the nodes store, and do we need to preserve node instances or is modifying the original list in-place expected? Assuming standard singly linked list nodes where in-place reversal with $O(1)$ auxiliary space is desired, I'll proceed with the iterative three-pointer technique."*

### Step 2: Brute-Force (Phân tích cách ngây thơ)
> *"A naive approach would be traversing the linked list, pushing all node values into an array, and then iterating backwards to construct a brand-new linked list or overwrite the node values. While this operates in $O(n)$ time, it consumes $O(n)$ auxiliary memory and causes unnecessary heap allocations. In a high-throughput financial system, excessive allocations trigger V8 garbage collection pauses, which degrades latency. Therefore, we should aim for an in-place modification."*

### Step 3: Optimize (Đề xuất giải pháp tối ưu)
> *"We can achieve an optimal in-place solution with $O(n)$ time complexity and $O(1)$ auxiliary space using the **iterative sliding three-pointer pattern**:
> - We maintain two primary pointers: `prev` initialized to `null`, and `curr` initialized to `head`.
> - Inside a linear loop `while (curr !== null)`, before altering any link, we must temporarily preserve `curr.next` in a temporary reference `next`. Otherwise, breaking the link would cause us to lose the entire remainder of the list.
> - We reverse the direction by pointing `curr.next = prev`.
> - Then, we advance `prev = curr` and `curr = next`.
> - Once `curr` becomes `null`, `prev` will be pointing to the new head of the reversed list.
> Unlike recursion, this iterative approach uses zero call stack frames, making it resilient against stack overflow on arbitrarily large transaction chains."*

### Step 4: Think Out Loud (Thuyết minh trong khi gõ code)
> *"First, at line 1, I establish a guard clause: if `!head` or `!head.next`, the list has 0 or 1 node, so it's already reversed; I immediately return `head` in $O(1)$ time.
> Next, I initialize `prev = null` and `curr = head`.
> Now, I enter the while loop with the condition `while (curr !== null)`.
> Step 1: `const next = curr.next;` — safely caching the upcoming node.
> Step 2: `curr.next = prev;` — reversing the pointer in-place.
> Step 3: `prev = curr;` — shifting the `prev` pointer forward.
> Step 4: `curr = next;` — advancing `curr` to continue the traversal.
> Finally, after the loop terminates, `prev` points to the last processed node, which is our new head. I return `prev`."*

### Step 5: Dry Run (Chạy thử từng bước)
> *"Let's trace this step-by-step with `1 -> 2 -> 3 -> null`:
> - Guard clause: `head` has next, proceed.
> - Init: `prev = null`, `curr = Node(1)`.
> - **Iteration 1**:
>   - `next = Node(2)`.
>   - `curr.next = null` (`Node(1)` now points to `null`).
>   - `prev = Node(1)`, `curr = Node(2)`.
> - **Iteration 2**:
>   - `next = Node(3)`.
>   - `curr.next = Node(1)` (`Node(2)` points to `Node(1)`).
>   - `prev = Node(2)`, `curr = Node(3)`.
> - **Iteration 3**:
>   - `next = null`.
>   - `curr.next = Node(2)` (`Node(3)` points to `Node(2)`).
>   - `prev = Node(3)`, `curr = null`.
> - Loop terminates because `curr === null`.
> - Return `prev`, which is `Node(3) -> Node(2) -> Node(1) -> null`. The list is successfully reversed."*

### Step 6: Conclusion (Tổng kết độ phức tạp)
> *"To conclude:
> - **Time Complexity:** $O(n)$, where $n$ is the number of nodes in the list. We traverse each node exactly once.
> - **Space Complexity:** $O(1)$ auxiliary space. We only use three reference variables (`prev`, `curr`, `next`) and mutate the list strictly in-place.
> - **Robustness:** Complete call-stack safety with zero risk of stack overflow."*

---

## ⚠️ 6. Bẫy Thường Gặp & Điểm Cần Chú Ý Khi Phỏng Vấn

1. **Bẫy làm mất liên kết (Pointer Loss Trap):**
   - Sai lầm phổ biến nhất của ứng viên là viết `curr.next = prev` trước khi lưu `next = curr.next`. Ngay khi ghi đè `curr.next`, toàn bộ phần danh sách phía sau bị mất liên lạc vĩnh viễn và bị V8 GC thu hồi.
2. **Bẫy quên cập nhật đuôi thành `null` (Dangling Cycle):**
   - Node đầu tiên ban đầu (`head`) phải trỏ về `null` để trở thành đuôi (tail) mới của danh sách. Việc khởi tạo `prev = null` đảm bảo ngay ở vòng lặp đầu tiên, `curr.next = null` tự động hoàn tất điều này.
3. **Bẫy danh sách rỗng và 1 node:**
   - Luôn đặt Guard Clause dòng 1: `if (!head || !head.next) return head;`. Xử lý ngay $O(1)$ cho danh sách rỗng hoặc danh sách chỉ có 1 phần tử.
4. **Bẫy đệ quy khi gặp dữ liệu lớn:**
   - Nếu người phỏng vấn ANZ hỏi: *"Can you write this recursively?"*, hãy trả lời: *"Yes, recursion is mathematically elegant, but in a production banking environment, it risks Call Stack Overflow for large lists. The iterative approach is preferred for reliability."*

---

## 🎨 7. Minh Họa Trực Quan (Interactive Generative UI)

Để trực quan hóa cơ chế đảo chiều mũi tên của 3 con trỏ `prev`, `curr`, `next`, mở công cụ mô phỏng tương tác tại:
👉 **[Interactive Stepper: Reverse Linked List](file:///home/samnguyen/projects/training-anz/docs/visualizers/w3-03-reverse-linked-list.html)**

