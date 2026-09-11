# 📚 Cẩm Nang Ôn Luyện Ngày 1: Nền Tảng Big-O, Kỹ Thuật In-Place & Two Pointers Cốt Lõi

> **Mục tiêu ôn tập:** Nắm vững tư duy thuật toán nền tảng, cơ chế quản lý bộ nhớ trong Node.js, kỹ năng bắt Edge Cases và phản xạ giao tiếp tiếng Anh chuẩn Pair Programming cho vòng phỏng vấn kỹ thuật ANZ Bank.

---

## 🧭 Mục 1: Bản Chất Time & Space Complexity (Quy Tắc Quét Mắt Nhanh)

Khi phỏng vấn tại các tổ chức tài chính lớn, điều nhà tuyển dụng quan sát không phải là khả năng nhớ máy móc lý thuyết, mà là **phản xạ ước lượng tài nguyên hệ thống (CPU & RAM)** khi dữ liệu đầu vào ($n$) tăng vọt.

### 1. Time Complexity (Độ phức tạp thời gian)
* **Bản chất:** Không đo bằng giây hay mili-giây, mà đo **tốc độ tăng trưởng số phép toán (operations)** theo kích thước $n$.
* **Quy tắc quét mắt (Scanning Rules):**
  - **Không có vòng lặp:** Các phép gán biến, phép toán số học, `if-else`, truy cập chỉ mục `arr[0]` $\rightarrow \mathbf{O(1)}$ (Constant).
  - **1 vòng lặp đơn:** Duyệt từ $0$ đến $n$ bằng `for`, `while`, `map`, `forEach` $\rightarrow \mathbf{O(n)}$ (Linear).
  - **2 vòng lặp lồng nhau:** 1 vòng `for` nằm trong 1 vòng `for` khác $\rightarrow \mathbf{O(n^2)}$ (Quadratic).
  - **Mỗi bước chia đôi dữ liệu:** Thuật toán Binary Search ($n \rightarrow n/2 \rightarrow n/4$) $\rightarrow \mathbf{O(\log n)}$.
  - ⚠️ **Bẫy ngầm $O(n^2)$ kinh điển:** 1 vòng `for` nhưng bên trong lại gọi các phương thức có sẵn của JS như `arr.splice()`, `arr.indexOf()`, `arr.includes()`, `arr.unshift()` $\rightarrow$ Vòng lặp ngoài $O(n) \times$ Hàm bên trong $O(n) = \mathbf{O(n^2)}$.

### 2. Space Complexity (Độ phức tạp bộ nhớ phụ - Auxiliary Space)
* **Bản chất:** Đo lượng RAM bổ sung mà **thuật toán tự ý xin cấp phát thêm**, không tính mảng đầu vào ban đầu.
* **Quy tắc quét mắt:**
  - **Chỉ dùng biến đơn lẻ:** Khai báo biến đếm, con trỏ index, biến lưu tạm (`let i = 0; let temp;`) $\rightarrow \mathbf{O(1)}$ Auxiliary Space (In-place).
  - **Tạo mảng hoặc cấu trúc mới chứa $n$ phần tử:** `new Array(n)`, `arr.filter(...)`, `[...arr]`, `new Set(arr)` $\rightarrow \mathbf{O(n)}$ Space.
  - **Tạo ma trận bảng 2 chiều ($n \times n$):** Mảng lồng mảng $\rightarrow \mathbf{O(n^2)}$ Space.

---

## 🧮 Mục 2: Giải Mã Sự Khác Biệt Bộ Nhớ: 1D Array ($O(n)$) vs 2D Matrix ($O(n^2)$)

Tại sao cùng là "tạo mảng mới" nhưng một bên lại là $O(n)$ còn một bên là $O(n^2)$?
👉 **Big-O Space đo TỔNG SỐ Ô DỮ LIỆU thực tế được cấp phát trong RAM**, chứ không đo số câu lệnh `new Array`.

| Loại Cấu Trúc | Hình tượng thực tế | Số ô nhớ với $n = 1,000$ | Số ô nhớ với $n = 10,000$ | Đánh giá Big-O |
|---|---|---|---|---|
| **Mảng 1 chiều (1D)** | 1 hàng ghế gồm $n$ chỗ | $1,000$ ô nhớ | $10,000$ ô nhớ | $\mathbf{O(n)}$ (Tăng tuyến tính) |
| **Ma trận 2 chiều (2D)** | Bàn cờ gồm $n$ hàng $\times n$ cột | $1,000 \times 1,000 = \mathbf{1,000,000}$ ô | $10,000 \times 10,000 = \mathbf{100,000,000}$ ô | $\mathbf{O(n^2)}$ (Tăng bình phương) |

---

## ⚡ Mục 3: Từ Khóa `In-Place` & Bẫy Cú Pháp ES6

Khi đề bài phỏng vấn ANZ yêu cầu **"Solve it in-place"**:
1. **Mutate Original Reference:** Phải ghi đè, hoán đổi trực tiếp trên các ô nhớ của mảng ban đầu `nums`.
2. **Auxiliary Space $= O(1)$:** Không được cấp phát bất kỳ mảng phụ nào.

### So sánh các cách tiếp cận trong bài toán [Move Zeroes](file:///home/samnguyen/projects/training-anz/coding/week-01/01-move-zeroes.md):

#### ❌ Bẫy 1: Cú pháp Spread ES6 `[...nonZeroes, ...zeroes]` (Tốn $O(n)$ RAM)
```javascript
// Cú pháp hiện đại, viết rất gọn nhưng vi phạm In-place
const nonZeroes = nums.filter(x => x !== 0);
const zeroes = new Array(nums.length - nonZeroes.length).fill(0);
return [...nonZeroes, ...zeroes]; // JS phải cấp phát RAM tạo mảng mới hoàn toàn
```
* **Hậu quả:** Với batch 1 triệu giao dịch ngân hàng, cách này ngốn thêm một lượng RAM tương đương, bắt V8 Garbage Collector phải thu gom rác dồn dập gây đứng luồng Event Loop (Stop-The-World).

#### ❌ Bẫy 2: Dùng `arr.splice()` trong vòng lặp (Bẫy $O(n^2)$ thời gian)
```javascript
for (let i = 0; i < nums.length; i++) {
  if (nums[i] === 0) {
    nums.splice(i, 1); // Mỗi lần splice, JS phải dịch chuyển toàn bộ mảng phía sau (tốn O(n))
    nums.push(0);
  }
}
```
* **Hậu quả:** Mảng $100,000$ phần tử sẽ thực hiện $10^{10}$ phép toán, gây Timeout ngay lập tức trên HackerRank.

#### ✅ Cách Chuẩn: Two Pointers tại chỗ ($O(n)$ Time, $O(1)$ Space)
```javascript
nums[nextIndex] = nums[currentIndex];
nums[currentIndex] = 0;
```
* **Ưu điểm:** Ghi đè trực tiếp, chỉ duyệt mảng đúng 1 lần, không sinh thêm bất kỳ ô nhớ mảng nào.

---

## 🛡️ Mục 4: Tư Duy Phòng Thủ: `Guard Clause` & Nghệ Thuật Bắt `Edge Cases`

### 1. Guard Clause (Lính gác cổng) là gì?
Là đoạn kiểm tra điều kiện ngay tại **dòng đầu tiên** của hàm nhằm thực hiện **Fail-Fast & Early Exit (Thoát sớm)**:
- Ngăn chặn lỗi runtime sập server: `TypeError: Cannot read properties of null (reading 'length')`.
- Giữ code phẳng (Flat Code), loại bỏ cấu trúc lồng `if-else` nhiều tầng (Pyramid of Doom).

### 2. Edge Cases (Trường hợp biên / cá biệt) là gì?
- **Happy Path:** Dữ liệu chuẩn mực, thuận lợi (`[0, 1, 0, 3, 12]`).
- **Edge Case:** Dữ liệu ở ranh giới cực hạn (tối thiểu, tối đa, rỗng, sai kiểu) mà 90% lỗi hệ thống ngân hàng bắt nguồn từ đây.

### 3. Checklist Edge Cases kinh điển cho bài toán Mảng:
1. `null` / `undefined` hoặc không phải Array $\rightarrow$ Bắt bằng `!nums || !Array.isArray(nums)`.
2. Mảng rỗng `[]` hoặc mảng 1 phần tử `[0]`, `[5]` $\rightarrow$ Bắt bằng `nums.length <= 1`.
3. Mảng không có số 0 nào: `[1, 2, 3]` $\rightarrow$ Thuật toán phải giữ nguyên mảng, không làm sai lệch giá trị.
4. Mảng toàn bộ là số 0: `[0, 0, 0]` $\rightarrow$ Không được rơi vào vòng lặp vô tận.
5. Mảng có số âm: `[-1, 0, -5, 2]` $\rightarrow$ Điều kiện phải là `nums[i] !== 0` thay vì `nums[i] > 0`.

---

## 🎯 Mục 5: Kỹ Thuật Clean Two Pointers (`currentIndex` & `nextIndex`)

Thay vì dùng thuật ngữ trừu tượng trong sách giáo khoa (`writeIndex` / `readIndex`), việc đặt tên biến thành **`currentIndex`** và **`nextIndex`** mang lại sự trong sáng tuyệt đối cho mã nguồn:

* **`currentIndex` (Người dò tìm):** Duyệt tuần tự từ đầu đến cuối mảng để tìm các phần tử hợp lệ (khác 0).
* **`nextIndex` (Người giữ chỗ):** Đứng canh tại vị trí trống đầu tiên để đón phần tử hợp lệ tiếp theo dời lên.

```javascript
let nextIndex = 0;

for (let currentIndex = 0; currentIndex < nums.length; currentIndex++) {
  // Khi tìm thấy phần tử hợp lệ
  if (nums[currentIndex] !== 0) {
    if (currentIndex !== nextIndex) {
      nums[nextIndex] = nums[currentIndex]; // Đưa phần tử lên vị trí giữ chỗ
      nums[currentIndex] = 0;                // Trả số 0 về vị trí cũ
    }
    nextIndex++; // Vị trí này đã có số, người giữ chỗ tiến lên 1 bước
  }
}
```

---

## 🗣️ Mục 6: Kịch Bản Đối Thoại Tiếng Anh 6 Bước (Chuẩn Pair Programming Tự Nhiên)

*Bí quyết phỏng vấn ANZ: Nói tự nhiên như hai kỹ sư đang thảo luận, câu ngắn, rõ ràng, dứt khoát.*

### Bước 1: Clarify (Hỏi nhanh vài ý trước khi gõ)
> *"Before I start, let me confirm a few quick things:*  
> *Can the input be empty or null?*  
> *And should we keep the same order for the other numbers?*  
> *Got it! And I will modify the array directly without creating a new one, right?"*

### Bước 2: Brute-Force (Nêu cách đơn giản và chỉ ra điểm nghẽn)
> *"The simplest way is just creating a new array and filtering out the zeros. But that takes extra memory.*  
> *Another way is using `splice()`, but it's way too slow for large data because it shifts elements every time.*  
> *So neither is good for production."*

### Bước 3: Optimize (Chốt giải pháp trong 1 câu)
> *"So to make it fast and save memory, I'll use two pointers: `currentIndex` to scan the array, and `nextIndex` to place the non-zero numbers."*

### Bước 4: Think Out Loud (Vừa gõ vừa thuyết minh câu ngắn)
> *"First, let's add a quick check for empty or invalid input.*  
> *Now, I initialize `nextIndex` at 0.*  
> *Let's loop through the array with `currentIndex`.*  
> *Whenever we see a non-zero number, we move it to `nextIndex`, put 0 in the old spot, and advance `nextIndex`.*  
> *And finally, return the array."*

### Bước 5: Dry Run (Chạy thử bằng miệng với ví dụ ngắn gọn)
> *"Let's test with `[0, 1, 0, 3]` to make sure it works:*  
> *- At index 0: it's 0, so skip.*  
> *- At index 1: it's 1. We move 1 to index 0, and put 0 back. The array is now `[1, 0, 0, 3]`.*  
> *- At index 2: it's 0, skip.*  
> *- At index 3: it's 3. Put 3 into index 1. Now we get `[1, 3, 0, 0]`.*  
> *Looks good and clean!"*

### Bước 6: Conclusion (Chốt độ phức tạp súc tích)
> *"To wrap up:*  
> *Time complexity is **O(n)** because we only scan the array once.*  
> *Space complexity is **O(1)** because everything is done in-place."*

