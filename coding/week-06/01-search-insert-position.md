# 📘 Cẩm Nang Kỹ Thuật: Search Insert Position (LeetCode #35 - Easy)

> **Tuần 6 Day 1 (Thứ 2)**: Early-Week Easy Gate khởi động tuần nhẹ nhàng theo Anti-Burnout Protocol.  
> **Target Role**: Senior Node.js Backend Engineer (ANZ Bank x HCLTech Vietnam).  
> **Độ phức tạp**: Thời gian $O(\log n)$ | Không gian phụ trợ $O(1)$.

---

## 1. Bối Cảnh Nghiệp Vụ Tại ANZ Bank (Banking Context)

Trong hệ thống thanh toán và quản lý sổ cái ANZ (Payment & General Ledger Engine):
- **Sổ cái tài chính (Audit Log / Transaction Ledger)** lưu trữ các giao dịch đã sắp xếp theo thứ tự `timestamp` hoặc mã định danh tuần tự `transaction_id`.
- Khi một giao dịch mới đến chậm do độ trễ mạng (out-of-order latency), hệ thống cần:
  1. Nếu giao dịch đã tồn tại (`id` trùng lặp): Trả về chỉ mục để xử lý cập nhật hoặc kiểm tra Idempotency.
  2. Nếu giao dịch chưa tồn tại: Xác định vị trí chèn chính xác để duy trì mảng đã sắp xếp mà không cần chạy lại hàm `sort()` tốn $O(n \log n)$.

---

## 2. Phân Tích Thuật Toán & Bất Biến Tìm Kiếm (Binary Search Invariant)

### Tại sao con trỏ `left` luôn là vị trí chèn chuẩn xác?

Xét vòng lặp nhị phân `while (left <= right)`:
1. **Trường hợp tìm thấy**: `nums[mid] === target` $\rightarrow$ trả về `mid` ngay lập tức.
2. **Trường hợp không tìm thấy**:
   - Khi vòng lặp kết thúc, điều kiện dừng xảy ra khi `left > right` (cụ thể là `left = right + 1`).
   - Tại mọi thời điểm:
     - Tất cả phần tử nằm trước `left` (chỉ mục `< left`) đều có giá trị `< target`.
     - Tất cả phần tử nằm sau `right` (chỉ mục `> right`) đều có giá trị `> target`.
   - Do đó, khi `left > right`, khoảng trống giữa chúng chính là vị trí `left`. Chèn `target` tại chỉ mục `left` sẽ duy trì tính đơn điệu tăng dần của mảng.

```text
Ví dụ: nums = [1, 3, 5, 6], target = 2

Bước 1: left = 0, right = 3, mid = 1 (nums[1] = 3 > 2) -> right = 0
Bước 2: left = 0, right = 0, mid = 0 (nums[0] = 1 < 2) -> left = 1
Kết thúc: left = 1, right = 0 (left > right) -> Trả về left = 1.
```

---

## 3. Mã Nguồn Chuẩn Node.js (Production Code)

```javascript
/**
 * Complexity: Time O(log n) | Auxiliary Space O(1)
 */
function searchInsert(nums, target) {
  // Line 1: Mandatory Guard Clause
  if (!Array.isArray(nums) || nums.length === 0 || typeof target !== 'number') {
    return 0;
  }

  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    // Invariant: Tránh tràn số nguyên 32-bit (integer overflow)
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return left;
}
```

---

## 4. 🎙️ Kịch Bản Đối Thoại Tiếng Anh 6 Bước (ANZ Interview Script)

### Step 1: Clarify (Làm rõ yêu cầu & Biên dữ liệu)
> *"Before implementing the solution, I'd like to clarify the inputs. Is the array guaranteed to be sorted in ascending order with distinct values? How should we handle boundary cases, such as an empty array or a target smaller than the minimum element? I'll ensure line 1 handles these guards safely."*

### Step 2: Brute-Force (Đề xuất giải pháp tuyến tính & Điểm nghẽn)
> *"The naive approach is a linear scan iterating from index 0 to n-1. If we find an element greater than or equal to target, we return that index. If we reach the end, we return n. This takes $O(n)$ time complexity and $O(1)$ space. However, for large audit log datasets with millions of transactions, a linear scan would introduce unnecessary event loop latency."*

### Step 3: Optimize (Tối ưu hóa với Binary Search)
> *"Since the input array is already sorted and contains distinct values, we can leverage Binary Search. By dividing the search space in half at each iteration, we achieve logarithmic time complexity $O(\log n)$ with $O(1)$ auxiliary space."*

### Step 4: Think Out Loud (Thuyết minh logic khi gõ code)
> *"I begin with a guard clause checking for a valid non-empty array and valid numeric target. Then I initialize `left = 0` and `right = nums.length - 1`. Inside the `while (left <= right)` loop, I compute `mid` using `left + Math.floor((right - left) / 2)` to eliminate integer overflow risk. If `nums[mid] === target`, we return `mid`. If `nums[mid] < target`, the target must reside in the right half, so `left = mid + 1`. Otherwise, `right = mid - 1`. When the loop terminates with `left > right`, `left` is mathematically guaranteed to be the exact insertion index."*

### Step 5: Dry Run (Chạy từng dòng với ca kiểm thử)
> *"Let's dry run with `nums = [1, 3, 5, 6]` and `target = 2`:*  
> *- Initial: `left = 0, right = 3`.*  
> *- Iteration 1: `mid = 1`, `nums[1] = 3 > 2` $\rightarrow$ `right = 0`.*  
> *- Iteration 2: `left = 0, right = 0`, `mid = 0`, `nums[0] = 1 < 2` $\rightarrow$ `left = 1`.*  
> *- Loop terminates since `left (1) > right (0)`.*  
> *- Return `left = 1`. This accurately matches the expected index."*

### Step 6: Conclusion (Chốt độ phức tạp)
> *"In conclusion, this approach achieves an optimal Time Complexity of $O(\log n)$ and an Auxiliary Space Complexity of $O(1)$, strictly meeting ANZ's sub-millisecond execution standard."*

---

## 5. Tổng Kết Phản Xạ & Bẫy Thường Gặp (Pattern Synthesis)

- **Bẫy 1: Điều kiện dừng `left <= right` hay `left < right`?**
  - Nếu dùng `left <= right`, khi không tìm thấy phần tử thì `left` luôn dừng ở đúng vị trí chèn.
  - Nếu dùng `left < right`, bạn phải viết thêm code xử lý biên sau vòng lặp, dễ phát sinh lỗi Off-by-one.
- **Bẫy 2: Phép tính `mid`**: Luôn dùng `left + Math.floor((right - left) / 2)`.

