# 📘 Cẩm Nang Kỹ Thuật: Maximum Subarray / Kadane's Algorithm (LeetCode #53 - Medium)

> **Tuần 6 Day 3 (Thứ 4)**: **Bài LeetCode Medium DUY NHẤT của tuần** tuân thủ nghiêm ngặt Anti-Burnout Protocol.  
> **Target Role**: Senior Node.js Backend Engineer (ANZ Bank x HCLTech Vietnam).  
> **Độ phức tạp**: Thời gian $O(n)$ tuyến tính | Không gian phụ trợ $O(1)$.

---

## 🏦 1. Bối Cảnh Nghiệp Vụ Tại ANZ Bank (Banking Financial Analytics)

Trong phân hệ phân tích rủi ro và quản lý danh mục tài sản (Wealth Management & Risk Scoring) của ANZ:
- Một chuỗi số biến động biểu diễn lãi/lỗ ròng (Net Profit & Loss - PnL) từng ngày của khách hàng doanh nghiệp: `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`.
- Hệ thống cần xác định: **Khoảng thời gian liên tục nào mang lại tổng lợi nhuận ròng lớn nhất?**
- Nếu dùng 2 vòng lặp lồng nhau $O(n^2)$, thuật toán sẽ làm nghẽn Event Loop của Node.js khi xử lý hàng triệu bản ghi giao dịch. Giải thuật **Kadane** giải quyết bài toán trong đúng 1 lượt duyệt $O(n)$ với bộ nhớ $O(1)$.

---

## 🚨 2. Bẫy Sống Còn Tại ANZ (The Survival Trap)

### Bẫy Khởi Tạo `0` (Zero-Initialization Trap):
- Nếu bạn viết:
  ```javascript
  let currentSum = 0;
  let maxSum = 0; // ❌ BẪY CHẾT NGƯỜI KHI PHỎNG VẤN!
  ```
- Khi gặp ca kiểm thử mảng **toàn số âm** (thị trường sụt giảm liên tục): `nums = [-5, -1, -8, -3]`:
  - Kết quả đúng phải là `-1` (khoản lỗ nhỏ nhất).
  - Khởi tạo bằng `0` sẽ khiến hàm trả về `0`, điều này **hoàn toàn sai** vì số 0 không tồn tại trong mảng và đề bài yêu cầu mảng con không rỗng (non-empty subarray).
- **Quy tắc bất biến ANZ**: Luôn khởi tạo:
  ```javascript
  let currentSum = nums[0];
  let maxSum = nums[0]; // ✅ AN TOÀN VỚI MỌI GIÁ TRỊ ÂM
  ```

---

## 🧠 3. Nguyên Lý Quy Hoạch Động (DP Principle)

Tại mỗi vị trí `i`, ta đứng trước 2 lựa chọn:
1. **Bắt đầu một mảng con mới** tại chính `nums[i]`.
2. **Kéo dài mảng con trước đó**: `currentSum + nums[i]`.
$$\text{currentSum}[i] = \max(\text{nums}[i], \text{currentSum}[i-1] + \text{nums}[i])$$

Nếu `currentSum[i-1] < 0`, việc cộng dồn nó vào chỉ làm giảm giá trị của `nums[i]`, do đó ta loại bỏ mảng con cũ và bắt đầu mới từ `nums[i]`.

---

## 4. 🎙️ Kịch Bản Đối Thoại Tiếng Anh 6 Bước (ANZ Interview Script)

### Step 1: Clarify (Làm rõ yêu cầu & Biên dữ liệu)
> *"Before writing any code, I'd like to clarify the problem constraints. Can the array contain both positive and negative integers? Is the subarray required to be non-empty? For example, if all numbers are negative, should we return the largest negative number rather than zero? I will ensure line 1 guards against empty or invalid inputs."*

### Step 2: Brute-Force (Đề xuất giải pháp cơ bản & Điểm nghẽn)
> *"The naive approach is generating all possible subarrays using two nested loops and calculating their sums. This takes $O(n^2)$ time complexity and $O(1)$ space. For large banking transaction datasets, an $O(n^2)$ algorithm would block the Node.js event loop and lead to high request latency."*

### Step 3: Optimize (Tối ưu hóa với Kadane's Algorithm)
> *"We can optimize this to $O(n)$ linear time using Kadane's Algorithm. At each index, we decide whether to extend the previous subarray or start a new subarray beginning at the current element. This is an optimal single-pass dynamic programming approach requiring only $O(1)$ auxiliary space."*

### Step 4: Think Out Loud (Thuyết minh logic khi gõ code)
> *"I start with a guard clause checking for a valid non-empty array. Next, a critical invariant: I initialize both `currentSum` and `maxSum` to `nums[0]`, never zero, to safely handle arrays where all values are negative. I then iterate from index 1 to n-1. In each step, `currentSum = Math.max(nums[i], currentSum + nums[i])`, and `maxSum = Math.max(maxSum, currentSum)`. Finally, I return `maxSum`."*

### Step 5: Dry Run (Chạy từng dòng với ví dụ)
> *"Let's dry run with `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]`:*  
> *- Start: `currentSum = -2, maxSum = -2`.*  
> *- i = 1 (val: 1): `currentSum = max(1, -2+1) = 1`, `maxSum = 1`.*  
> *- i = 2 (val: -3): `currentSum = max(-3, 1-3) = -2`, `maxSum = 1`.*  
> *- i = 3 (val: 4): `currentSum = max(4, -2+4) = 4`, `maxSum = 4`.*  
> *- i = 4 (val: -1): `currentSum = max(-1, 4-1) = 3`, `maxSum = 4`.*  
> *- i = 5 (val: 2): `currentSum = max(2, 3+2) = 5`, `maxSum = 5`.*  
> *- i = 6 (val: 1): `currentSum = max(1, 5+1) = 6`, `maxSum = 6`.*  
> *- Remaining elements do not exceed 6. Output is 6, which is strictly correct."*

### Step 6: Conclusion (Chốt độ phức tạp)
> *"In conclusion, Kadane's algorithm executes in single-pass $O(n)$ time complexity with $O(1)$ auxiliary space. It strictly guarantees optimal performance for ANZ's transaction processing pipelines."*

