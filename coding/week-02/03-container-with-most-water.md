# 📝 Hướng Dẫn Giải Thuật: Container With Most Water (Week 2 Day 3)

> **Mục tiêu phỏng vấn ANZ:** Làm chủ kỹ thuật Two Pointers kẹp hai đầu trên mảng không sắp xếp, chứng minh bất biến toán học loại trừ không gian nghiệm (Elimination of Suboptimal Search Space) để tối ưu từ $O(n^2)$ xuống $O(n)$ time và $O(1)$ space, tự tin thuyết trình bằng tiếng Anh chuẩn 6 bước.

---

## 🧭 1. Tóm Tắt Đề Bài & Điểm Nghẽn Kỹ Thuật (The Bottleneck)

* **Đề bài:** Cho mảng `height` gồm các số nguyên dương. Mỗi chỉ mục $i$ có thanh đứng cao `height[i]`. Tìm 2 thanh sao cho lượng nước giữ được giữa 2 thanh là lớn nhất.
* **Công thức toán học:**
  $$\text{Area}(L, R) = (R - L) \times \min(\text{height}[L], \text{height}[R])$$
* **Cách tiếp cận Brute-force ($O(n^2)$):**
  - Dùng 2 vòng lặp `for` lồng nhau kiểm tra mọi cặp $(L, R)$.
  - Với $n = 100,000$, số phép tính là $\frac{100,000 \times 99,999}{2} \approx 5 \times 10^9 \rightarrow$ **Gây TLE (Time Limit Exceeded) ngay lập tức!**
* **Tại sao không thể Sắp xếp (Sorting)?**
  - Ở bài 3Sum hay Two Sum II, ta sort mảng. Nhưng ở bài này, khoảng cách $R - L$ (chiều rộng) phụ thuộc vào **vị trí chỉ mục gốc ban đầu**. Sắp xếp mảng sẽ phá hủy khoảng cách $R - L$, làm sai hoàn toàn kết quả!
* **Giải pháp Tối Thượng: Two Pointers Kẹp Hai Đầu ($O(n)$ time, $O(1)$ space):**
  - Khởi tạo 2 con trỏ ở 2 biên: $L = 0$ và $R = n - 1$. Đây là lúc chiều rộng $R - L$ đạt cực đại.
  - Sau mỗi bước, chiều rộng bắt buộc phải giảm đi 1 đơn vị ($R - L - 1$).
  - **Quy tắc di chuyển:** Luôn dịch con trỏ ở **cột thấp hơn** vào trong:
    ```js
    if (height[L] < height[R]) L++;
    else R--;
    ```

---

## 🔬 2. Chứng Minh Bất Biến Toán Học (Mathematical Invariant Proof)

Một câu hỏi phỏng vấn phân loại Senior tại ANZ:
> *"Tại sao ta luôn dịch chuyển con trỏ ở cột thấp hơn mà không dịch cột cao hơn? Có bao giờ việc dịch cột thấp hơn khiến ta bỏ sót diện tích lớn hơn không?"*

### 💡 Lập luận phản chứng & Loại trừ không gian nghiệm:
Giả sử tại một bước bất kỳ, ta đang có 2 con trỏ $L$ và $R$ với $\text{height}[L] < \text{height}[R]$:
- Diện tích hiện tại là:
  $$\text{Area}(L, R) = (R - L) \times \text{height}[L]$$
- Nếu ta **giữ nguyên cột thấp $L$** và thử ghép nó với bất kỳ cột nào khác nằm bên trong $R' < R$:
  - Chiều rộng mới: $R' - L < R - L$ (chắc chắn giảm).
  - Chiều cao mới: $\min(\text{height}[L], \text{height}[R']) \le \text{height}[L]$ (chiều cao tối đa vẫn bị chặn bởi $L$, không thể nào vượt quá $\text{height}[L]$).
  - $\implies \text{Area}(L, R') < \text{Area}(L, R)$.
- **Kết luận toán học:** Mọi cặp hình chữ nhật có chứa cột $L$ và các cột bên trong $R'$ đều **chắc chắn có diện tích nhỏ hơn** $\text{Area}(L, R)$ hiện tại. Do đó, ta có thể **loại bỏ hoàn toàn cột $L$** ra khỏi không gian tìm kiếm mà không sợ mất nghiệm tối ưu! Ta yên tâm tăng $L++$.

---

## 🏦 3. Bối Cảnh Thực Tế Tại ANZ Bank: Liquidity Buffer Maximization

Trong kiến trúc **Treasury & Intraday Liquidity Management** tại ANZ:
* **Bối cảnh:** Trong một ngày làm việc, tại các mốc thời gian $t_i$, ngân hàng duy trì các mức dung lượng đệm thanh khoản khả dụng $C[t_i]$ (Intraday Liquidity Buffer Capacity).
* **Bài toán:** Để đối phó với đợt thanh toán bù trừ liên ngân hàng đột biến (High-value Clearing Spike) mà không bị phạt thiếu vốn từ Ngân hàng Dự trữ (Reserve Bank of Australia / ANZ Central Bank), hệ thống cần tìm cửa sổ thời gian $(t_L, t_R)$ có khoảng thời gian duy trì dài nhất $(t_R - t_L)$ nhân với mức đệm an toàn tối thiểu $\min(C_L, C_R)$ đạt giá trị lớn nhất:
  $$\text{Max Capacity Window} = (t_R - t_L) \times \min(C[t_L], C[t_R])$$
* Thuật toán Two Pointers cho phép rà soát hàng trăm nghìn mốc dữ liệu thanh khoản theo thời gian thực trong chưa đầy 2 mili-giây.

---

## 🎙️ 4. Kịch Bản Tiếng Anh 6 Bước (ANZ Live Coding Script)

### Step 1: Clarify (Làm rõ yêu cầu)
> *"Before implementing, I'd like to clarify a few requirements. Can the height array be null, empty, or contain fewer than 2 elements? Are the heights always non-negative integers? Can the lines slant, or does water always hold horizontally based on the shorter line? Assuming standard non-negative heights with at least 2 vertical lines, I'll design an optimal solution."*

### Step 2: Brute-Force (Phân tích cách ngây thơ)
> *"The brute-force solution would evaluate every possible pair of lines using two nested loops and calculate the water area for each pair. This requires $O(n^2)$ time complexity. With an array of 100,000 elements, $O(n^2)$ takes around 5 billion operations, which will instantly cause a Time Limit Exceeded error in production."*

### Step 3: Optimize (Đề xuất Two Pointers kẹp hai đầu)
> *"We can optimize this to $O(n)$ time and $O(1)$ space using a two-pointer inward converging approach. We cannot sort the array because the horizontal distance $R - L$ depends on the original indices.*
> 
> *We initialize the left pointer at index 0 and the right pointer at $n - 1$, maximizing the width initially. The water container's height is always constrained by the shorter line — the bottleneck. As we move inward, width decreases. To have any chance of finding a larger area, we must find a taller line. Therefore, we greedily advance the pointer pointing to the shorter line."*

### Step 4: Think Out Loud (Thuyết minh trong khi gõ code)
> *"First, at line 1, I put our mandatory guard clause: if `height` is not an array or has fewer than 2 elements, we return 0.*
> 
> *Next, I initialize `left = 0`, `right = height.length - 1`, and `maxWater = 0`.*
> 
> *Inside the while loop `left < right`: I calculate `width = right - left` and determine the limiting height `minHeight = Math.min(height[left], height[right])`. The current area is `width * minHeight`. If it exceeds `maxWater`, I update `maxWater`.*
> 
> *Then, if `height[left] < height[right]`, I increment `left++` because moving `right` cannot possibly increase the area limited by `height[left]`. Otherwise, I decrement `right--`."*

### Step 5: Dry Run (Chạy thử từng dòng với ví dụ)
> *"Let's trace with `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]` ($n = 9$):*
> *- Start: $L = 0$ (height 1), $R = 8$ (height 7). $\text{width} = 8$, $\text{area} = \min(1, 7) \times 8 = 8$. `maxWater = 8`. Since $1 < 7$, increment $L \rightarrow 1$.*
> *- $L = 1$ (height 8), $R = 8$ (height 7). $\text{width} = 7$, $\text{area} = \min(8, 7) \times 7 = 49$. `maxWater = 49`. Since $8 > 7$, decrement $R \rightarrow 7$.*
> *- $L = 1$ (height 8), $R = 7$ (height 3). $\text{width} = 6$, $\text{area} = 3 \times 6 = 18$. Decrement $R \rightarrow 6$.*
> *- Continuing inward, no remaining pair exceeds 49.*
> *- Final return is 49, matching expected output."*

### Step 6: Conclusion (Kết luận độ phức tạp)
> *"In conclusion, the time complexity is $O(n)$ because each step moves either the left or right pointer inward by one, visiting each element at most once. The auxiliary space complexity is $O(1)$ since we only maintain a few primitive index variables in-place."*

---

## 🎨 5. Bảng Mô Phỏng Trực Quan Tương Tác (Interactive Visualizer)

> 🔗 **File mô phỏng độc lập (Lưu vĩnh viễn trong Repo):**  
> [`docs/visualizers/03-container-with-most-water.html`](file:///home/samnguyen/projects/training-anz/docs/visualizers/03-container-with-most-water.html)  
> *Bạn có thể click đúp vào file trên để mở trực tiếp trên trình duyệt (Chrome/Edge/Safari/Firefox) bất kỳ lúc nào để xem mô phỏng 2 con trỏ kẹp hai đầu và mực nước biến đổi từng bước.*

