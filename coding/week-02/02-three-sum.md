# 📝 Hướng Dẫn Giải Thuật: 3Sum — Triplet Sum to Zero (Week 2 Day 2)

> **Mục tiêu phỏng vấn ANZ:** Làm chủ kỹ thuật Two Pointers kẹp hai đầu trên bài toán Medium kinh điển (#15), tối ưu độ phức tạp từ $O(n^3)$ xuống $O(n^2)$ time và $O(1)$ auxiliary space, xử lý hoàn hảo bẫy trùng lặp (Skip Duplicates) và tự tin thuyết trình bằng tiếng Anh chuẩn mực.

---

## 🧭 1. Tóm Tắt Đề Bài & Điểm Nghẽn Kỹ Thuật (The Bottleneck)

* **Đề bài:** Cho mảng số nguyên `nums`. Tìm tất cả các bộ ba `[nums[i], nums[j], nums[k]]` sao cho $i \ne j \ne k$ và $nums[i] + nums[j] + nums[k] = 0$. Kết quả không được chứa bất kỳ bộ ba trùng lặp nào.
* **Cách tiếp cận Brute-force ($O(n^3)$):**
  - Dùng 3 vòng lặp lồng nhau duyệt mọi tổ hợp $(i, j, k)$.
  - *Tại sao bị loại lập tức?* Với $n = 3,000$ (giới hạn LeetCode), $3,000^3 = 27 \times 10^9$ phép tính $\rightarrow$ Gây TLE (Time Limit Exceeded) ngay lập tức!
* **Cách tiếp cận Hash Map ($O(n^2)$ time, $O(n)$ space):**
  - Cố định 2 số, tìm số thứ 3 bằng Hash Map.
  - *Nhược điểm:* Việc loại bỏ các bộ ba trùng lặp bằng `Set` cực kỳ phức tạp, phải serialize mảng thành chuỗi `"-1,0,1"`, tốn nhiều RAM và làm chậm V8 Engine.
* **Giải pháp Tối Thượng: Sorting + Two Pointers ($O(n^2)$ time, $O(1)$ space):**
  - Sắp xếp mảng ban đầu trong $O(n \log n)$.
  - Cố định số thứ nhất $nums[i]$ trong vòng lặp ngoài $O(n)$.
  - Mảng phía sau $nums[i]$ đã được sắp xếp $\rightarrow$ Biến bài toán thành **Two Sum II (Day 3 Tuần 1)**!
  - Dùng 2 con trỏ `left` và `right` kẹp từ hai đầu vào giữa trong $O(n)$.
  - Tổng thời gian: $O(n \log n) + O(n \times n) = O(n^2)$.

---

## ⚡ 2. Bẫy Trùng Lặp (The Skip Duplicates Trap)

Đây là lý do **90% ứng viên thất bại** ở bài 3Sum:
Nếu mảng có các phần tử trùng nhau như `[-2, 0, 0, 2, 2]`, thuật toán Two Pointers thông thường sẽ tìm ra hai lần bộ ba `[-2, 0, 2]`.

### 🛡️ Chiến Lược 3 Tầng Nhảy Cóc (3-Tier Skip Strategy):
1. **Tầng 1 (Cho con trỏ ngoài `i`):**
   ```js
   if (i > 0 && sorted[i] === sorted[i - 1]) continue;
   ```
   *Lưu ý sống còn:* So sánh `sorted[i] === sorted[i - 1]`, KHÔNG so sánh `sorted[i] === sorted[i + 1]` vì sẽ bỏ sót trường hợp hợp lệ như `[-1, -1, 2]`.
2. **Tầng 2 (Cho con trỏ `left` khi tìm thấy tổng = 0):**
   ```js
   while (left < right && sorted[left] === sorted[left + 1]) left++;
   ```
3. **Tầng 3 (Cho con trỏ `right` khi tìm thấy tổng = 0):**
   ```js
   while (left < right && sorted[right] === sorted[right - 1]) right--;
   ```

---

## 🏦 3. Bối Cảnh Thực Tế Tại ANZ Bank: Tri-party Settlement

Trong hệ thống **General Ledger Reconciliation & Clearing House** tại ANZ:
* **Bối cảnh:** Các giao dịch tài chính nhiều bên (Tri-party Clearing) giữa 3 thực thể: Ngân hàng gửi (Originator), Ngân hàng trung gian (Intermediary), và Ngân hàng nhận (Beneficiary).
* **Bài toán Net-Zero Balancing:** Để quyết toán sổ cái cuối ngày mà không xảy ra sai lệch thanh khoản, tổng giá trị biến động ròng của 3 giao dịch đối ứng phải triệt tiêu lẫn nhau:
  $$\Delta \text{Balance}_A + \Delta \text{Balance}_B + \Delta \text{Balance}_C = 0$$
* Thuật toán 3Sum cho phép rà soát hàng chục nghìn bút toán trong vài mili-giây để phát hiện các cụm giao dịch cân bằng ròng.

---

## 🎙️ 4. Kịch Bản Tiếng Anh 6 Bước (ANZ Live Coding Script)

### Step 1: Clarify (Làm rõ yêu cầu)
> *"Before writing the code, I’d like to confirm a few assumptions. Can the input array contain duplicate numbers, negative numbers, or zeroes? Should the returned triplets be in any specific order, and is it strictly required that no duplicate triplets appear in the final output? Assuming standard signed integers and that triplets must be unique, I'll design a solution avoiding extra space."*

### Step 2: Brute-Force (Phân tích cách ngây thơ)
> *"The brute-force approach would use three nested loops to test every combination $(i, j, k)$. This takes $O(n^3)$ time complexity. With an array of 3,000 numbers, $O(n^3)$ requires billions of operations and will immediately trigger a Time Limit Exceeded error. Additionally, deduplicating triplets using a Hash Set requires string serialization, which consumes significant memory overhead."*

### Step 3: Optimize (Đề xuất giải pháp Two Pointers)
> *"We can optimize this to $O(n^2)$ by sorting the array first in $O(n \log n)$ time. Once the array is sorted, we fix the first element $nums[i]$ using an outer loop. The remaining problem becomes Two Sum II: finding two numbers in the sorted subarray to the right of $i$ that sum to $-nums[i]$.*
> 
> *We can use two pointers, `left` and `right`, scanning inward in $O(n)$ time. Crucially, we skip duplicate values for both $i$, `left`, and `right` directly by advancing the pointers, achieving $O(1)$ auxiliary space without using a Set."*

### Step 4: Think Out Loud (Thuyết minh trong khi gõ code)
> *"First, at line 1, I put our mandatory guard clause: if `nums` is null or has fewer than 3 elements, we return an empty array.*
> 
> *Next, I sort the numbers numerically using `(a, b) => a - b`. If the first element is greater than zero, we can immediately exit because the sum of three positive numbers can never be zero.*
> 
> *In the outer loop, if `i > 0` and `nums[i] === nums[i - 1]`, we `continue` to avoid duplicate first elements. Then we initialize `left = i + 1` and `right = n - 1`. While `left < right`, we compute `sum = nums[i] + nums[left] + nums[right]`. If `sum === 0`, we record the triplet, then increment `left` past any identical values, and decrement `right` past identical values. If `sum < 0`, we increment `left`; if `sum > 0`, we decrement `right`."*

### Step 5: Dry Run (Chạy thử từng dòng với ví dụ)
> *"Let's trace with `nums = [-1, 0, 1, 2, -1, -4]`:*
> *- Sorted: `[-4, -1, -1, 0, 1, 2]`.*
> *- `i = 0`, value is -4: Two pointers scan for sum = 4. Maximum sum is `(-4) + 1 + 2 = -1 < 0`. No triplets found.*
> *- `i = 1`, value is -1: We search for target 1. At `left = 2` (value -1) and `right = 5` (value 2): sum is $(-1) + (-1) + 2 = 0$! We record `[-1, -1, 2]`. Next pair `left = 3` (0) and `right = 4` (1): sum is $(-1) + 0 + 1 = 0$! We record `[-1, 0, 1]`.*
> *- `i = 2`, value is -1: Since `nums[2] === nums[1]`, the duplicate check skips this iteration cleanly.*
> *- The final output is `[[-1, -1, 2], [-1, 0, 1]]`, matching expected results."*

### Step 6: Conclusion (Kết luận độ phức tạp)
> *"In summary, the time complexity is $O(n^2)$ because sorting takes $O(n \log n)$ and the two-pointer sweep inside the outer loop takes $O(n \times n) = O(n^2)$. The auxiliary space complexity is $O(1)$ beyond the output list, as we perform in-place pointer manipulation without hash tables."*

---

## 🎨 5. Bảng Mô Phỏng Trực Quan Tương Tác (Interactive Visualizer)

> 🔗 **File mô phỏng độc lập (Lưu vĩnh viễn trong Repo):**  
> [`docs/visualizers/02-three-sum.html`](file:///home/samnguyen/projects/training-anz/docs/visualizers/02-three-sum.html)  
> *Bạn có thể click đúp vào file trên để mở trực tiếp trên trình duyệt (Chrome/Edge/Safari/Firefox) bất kỳ lúc nào để xem mô phỏng 3 con trỏ và bẫy trùng lặp từng bước.*

