# Week 5 - Day 5: Binary Search Standard Template & Friday Recall Test 15m

> **Focus:** HCLTech x ANZ Bank Technical Interview Prep  
> **Topic 1:** Friday Recall Test — Move Zeroes (LeetCode #283 - Spaced Repetition)  
> **Topic 2:** Binary Search Standard Template (LeetCode #704 - Easy)  
> **Target Complexity:** $O(\log n)$ Time, $O(1)$ Auxiliary Space  

---

## 1. Friday 15-Minute Recall Test (Spaced Repetition)

### Log Ghi Nhận Kết Quả
- **Ngày thực hiện:** `2026-10-16` (Thứ 6, Sáng 05:00 - 05:15 AM)
- **Bài toán:** Move Zeroes (LeetCode #283 - In-place Read/Write Two Pointers)
- **Kết quả:** `PASS in 8m` (Gõ lại hoàn toàn từ trí nhớ trên màn hình trắng)
- **Header xác thực:** `// Recall: [2026-10-16] - PASS in 8m`
- **Core Invariant**: Hai con trỏ đọc (`readIdx`) và ghi (`writeIdx`) $O(n)$ in-place mà không dùng `splice()` hay `unshift()`.

---

## 2. Binary Search Standard Template (LeetCode #704)

### Bối Cảnh Phỏng Vấn Kỹ Thuật ANZ Bank
Binary Search là thuật toán nền tảng xuất hiện dày đặc trong các bài phỏng vấn HackerRank của ANZ Bank (từ tìm kiếm vị trí chèn, tìm kiếm mảng xoay vòng, đến bài toán tối ưu khoảng giá trị Capacity/Koko Eating Bananas).
- Rất nhiều ứng viên bị trượt do **3 bẫy kinh điển**:
  1. **Bẫy tràn số nguyên (Integer Overflow)**: Viết `mid = Math.floor((left + right) / 2)`. Nếu `left + right > 2^{31} - 1`, số sẽ bị tràn hoặc mất độ chính xác. $\rightarrow$ Bắt buộc dùng: `mid = left + Math.floor((right - left) / 2)`.
  2. **Bẫy điều kiện vòng lặp (Loop Condition)**: Dùng `left < right` thay vì `left <= right`, dẫn đến bỏ sót trường hợp mảng 1 phần tử hoặc khi con trỏ thu hẹp về cùng 1 vị trí.
  3. **Bẫy dịch con trỏ (Infinite Loop Trap)**: Viết `left = mid` hoặc `right = mid` khiến vòng lặp chạy vô tận khi `left` và `right` kề cận. $\rightarrow$ Bắt buộc dùng: `left = mid + 1` và `right = mid - 1`.

---

## 3. Structured 6-Step English Communication Script

### Step 1: Clarify
> *"Let me clarify the input specifications and edge cases:*
> - *Is the input array guaranteed to be sorted in ascending order? Yes.*
> - *Are all elements unique? Standard LeetCode 704 assumes distinct elements.*
> - *What should we return if the target does not exist? We return -1.*
> - *Can the array contain negative numbers or zero? Yes, any 32-bit signed integer."*

### Step 2: Brute-Force
> *"A linear scan from index 0 to $n-1$ would take $O(n)$ time. For 100,000 transaction IDs or ledger timestamps, that performs up to 100,000 comparisons. Since the array is already sorted, linear search wastes the inherent ordering structure."*

### Step 3: Optimize
> *"Because the array is sorted, we can apply Binary Search to achieve $O(\log n)$ time complexity.*  
> *We maintain two search boundaries, `left` at 0 and `right` at $n - 1$. In each iteration, we examine the midpoint element. If the midpoint matches the target, we return its index. If the midpoint is strictly smaller than the target, we know the target must reside in the right half, so we discard the left half by setting `left = mid + 1`. Otherwise, we discard the right half with `right = mid - 1`."*

### Step 4: Think Out Loud
> *"I'll begin with a line 1 guard clause: `if (!Array.isArray(nums) || nums.length === 0 || typeof target !== 'number') return -1;`.*  
> *I initialize `left = 0` and `right = nums.length - 1`.*  
> *I use the inclusive condition `while (left <= right)` so single-element arrays and boundary convergence are correctly processed.*  
> *To prevent integer overflow, I compute the midpoint using: `const mid = left + Math.floor((right - left) / 2);`.*  
> *If `nums[mid] === target`, return `mid`. If `nums[mid] < target`, `left = mid + 1`. Else, `right = mid - 1`.*  
> *If the loop terminates without finding the target, return -1."*

### Step 5: Dry Run
> *"Let's trace with `nums = [-1, 0, 3, 5, 9, 12]`, `target = 9`.*
> - *Initial: `left = 0`, `right = 5`.*
> - *Iteration 1: `mid = 0 + Math.floor(5/2) = 2`. `nums[2] = 3 < 9`. Update `left = 3`.*
> - *Iteration 2: `left = 3`, `right = 5`. `mid = 3 + Math.floor(2/2) = 4`. `nums[4] = 9 === target`. Match! Return index 4.*
> - *Dry run confirms exact logarithmic execution in 2 iterations."*

### Step 6: Conclusion
> *"In conclusion:*
> - *Time Complexity: $O(\log n)$, as the search space is divided by 2 at each step ($\log_2(100,000) \approx 17$ comparisons).*
> - *Space Complexity: Strictly $O(1)$ auxiliary space as we only use two pointer indices and a midpoint scalar.*
> - *All overflow and boundary invariants are mathematically guarded."*

---

## 4. Complexity & Stress Test Comparison

| Input Size ($n$) | Linear Search $O(n)$ | Binary Search $O(\log n)$ | Speedup Factor |
|---|---|---|---|
| **1,000** | 1,000 ops | $\approx 10$ ops | **100x** |
| **100,000** | 100,000 ops | $\approx 17$ ops | **5,882x (0.007ms)** |
| **1,000,000,000** | $10^9$ ops (Timeout) | $\approx 30$ ops | **33,333,333x** |

