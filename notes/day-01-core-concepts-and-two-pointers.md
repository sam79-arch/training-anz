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

## 🎯 Mục 5: Kỹ Thuật Clean Two Pointers (`writeIndex` & `readIndex`) — Tư Duy "Chuyển Chỗ Ngồi"

Trong các bài toán dồn mảng tại chỗ (In-place Compaction), cặp tên biến chuẩn mực nhất trong hệ thống Backend là **`writeIndex`** và **`readIndex`**:

* **`readIndex` (Người đi tìm):** Quét qua từng ô trong mảng để tìm các phần tử hợp lệ (khác 0).
* **`writeIndex` (Ghế trống ở đầu):** Đứng canh tại vị trí ghế đầu tiên sẵn sàng đón người tiếp theo dời về.

```javascript
let writeIndex = 0;

for (let readIndex = 0; readIndex < nums.length; readIndex++) {
  // Khi tìm thấy đứa KHÁC 0:
  if (nums[readIndex] !== 0) {
    // Chỉ chuyển khi chưa ngồi đúng chỗ (tránh redundant write):
    if (readIndex !== writeIndex) {
      nums[writeIndex] = nums[readIndex]; // Chuyển đứa khác 0 về ghế đầu
      nums[readIndex] = 0;               // Ghế cũ bỏ lại biến thành số 0
    }
    writeIndex++; // Ghế đầu đã có người ngồi, tiến lên 1 ghế tiếp theo
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
> *"First, let's add a quick guard clause for invalid or small inputs.*  
> *Now, I initialize `writeIndex` at 0.*  
> *Let's loop through the array with `readIndex`.*  
> *Whenever we see a non-zero number, we write it to `writeIndex`, clear the old spot, and advance `writeIndex`.*  
> *And finally, return the modified array."*

### Bước 5: Dry Run (Chạy thử bằng miệng với ví dụ ngắn gọn)
> *"Let's test with `[0, 1, 0, 3]` to make sure it works:*  
> *- At index 0: it's 0, so skip.*  
> *- At index 1: it's 1. We move 1 to writeIndex 0, and put 0 back. The array is now `[1, 0, 0, 3]`.*  
> *- At index 2: it's 0, skip.*  
> *- At index 3: it's 3. Put 3 into writeIndex 1. Now we get `[1, 3, 0, 0]`.*  
> *Looks good and clean!"*

### Bước 6: Conclusion (Chốt độ phức tạp súc tích)
> *"To wrap up:*  
> *Time complexity is **O(n)** because we only scan the array once.*  
> *Space complexity is **O(1)** because everything is done in-place."*

---

## 🧭 Mục 7: Giải Mã "Mật Mã" Ràng Buộc (Constraints) Trong Đề Phỏng Vấn

Khi đọc đề bài trên LeetCode/HackerRank, các dòng ký hiệu toán học thực chất là "tín hiệu ngầm" báo trước những gì bạn cần làm trong code:

| Ký hiệu trong đề | Ý nghĩa đời thường | Bạn cần làm gì trong code? |
|---|---|---|
| `nums.length >= 0` | Mảng có thể rỗng `[]` hoặc `null` | Viết **Guard Clause** ở dòng 1 để không bị lỗi crash server (`TypeError: Cannot read properties of null`). |
| `nums.length <= 10^5` | Mảng có thể dài tới **100,000 phần tử** | **Tín hiệu hiệu năng**: Bắt buộc giải bằng $O(n)$, cấm dùng $O(n^2)$ (như vòng lặp lồng nhau hoặc `splice` trong loop) kẻo bị Time Limit Exceeded (TLE). |
| `-2^31 <= nums[i]` | Giá trị phần tử có thể là **số âm** | Khi lọc số khác 0, bắt buộc viết `nums[i] !== 0`, **không được viết `nums[i] > 0`** kẻo bỏ sót số âm. |
| `nums[i] <= 2^31 - 1` | Khoảng 2.1 tỷ (chuẩn số nguyên 32-bit `int32`) | Dữ liệu là số nguyên thông thường, không lo tràn số trong JavaScript (hỗ trợ an toàn tới $2^{53}-1$). |

---

## ⚡ Mục 8: So Sánh 2 Biến Thể Two Pointers Cốt Lõi (Cùng Chiều vs Đối Đầu)

| Đặc điểm | Loại 1: Cùng Chiều Đọc/Ghi (Move Zeroes) | Loại 2: Đối Đầu 2 Đầu (Valid Palindrome) |
|---|---|---|
| **Mục đích** | Gom, lọc hoặc sắp xếp lại mảng tại chỗ (Compaction / Partitioning) | So sánh tính đối xứng hoặc tìm cặp giá trị hai đầu |
| **Tên con trỏ** | `readIndex` & `writeIndex` | `left` & `right` |
| **Hướng di chuyển** | Cùng tiến về phía trước ($0 \rightarrow n-1$) | Đi ngược chiều nhau từ 2 đầu tiến về giữa |
| **Vòng lặp tối ưu** | Dùng **`for`** (vì `readIndex` tăng đều mỗi vòng 1 bước) | Dùng **`while (left < right)`** (vì bước nhảy co giãn linh hoạt khi gặp rác) |
| **Điều kiện dừng** | Duyệt hết độ dài mảng | Hai con trỏ chạm hoặc vượt qua nhau (`left >= right`) |

---

## 🔍 Mục 9: Nghệ Thuật Kiểm Tra Chữ/Số (Alphanumeric) Siêu Sạch Trong JavaScript

Nhiều ứng viên lúng túng khi cần lọc bỏ ký tự đặc biệt vì sợ phải nhớ bảng mã ASCII hoặc viết Regex phức tạp. Trong JavaScript, có 3 cách xử lý:

### 1. ❌ Cách 1: Nhớ bảng mã ASCII (`48-57`, `65-90`, `97-122`)
* Nhược điểm: Quá áp lực trong phòng phỏng vấn, không ai rảnh nhớ từng con số cụ thể.

### 2. ⚠️ Cách 2: Dùng Regex `/[a-zA-Z0-9]/i.test(char)`
* Ưu điểm: Ngắn gọn.
* Nhược điểm: Regex engine có chi phí khởi tạo (overhead).

### 3. 🏆 Cách 3: So sánh trực tiếp theo thứ tự từ điển (Khuyên dùng)
JavaScript cho phép so sánh chữ cái và chữ số trực tiếp bằng toán tử `>=` và `<=` y hệt số học:
```javascript
function isAlphanumeric(char) {
  const c = char.toLowerCase();
  return (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9');
}
```
* **Đọc như văn xuôi:** `"Nếu c nằm từ 'a' đến 'z' HOẶC từ '0' đến '9' thì trả về true"`.
* **Ưu điểm tuyệt đối:** Không cần nhớ mã số, không cần regex, tốc độ $O(1)$, người phỏng vấn nhìn vào hiểu ngay.

---

## 🧮 Mục 10: Quy Tắc Vàng Big-O: "Nối Tiếp là CỘNG, Lồng Nhau mới là NHÂN"

Một bẫy nhận thức kinh điển là cho rằng mọi chuỗi hàm dài đều là $O(n^2)$. Hãy phân biệt rõ:

### 1. Thao tác Lồng Nhau (NHÂN: $n \times n = O(n^2)$)
```javascript
for (let i = 0; i < nums.length; i++) { // n lần
  nums.splice(i, 1);                    // mỗi lần tốn n bước dịch mảng
}
```
👉 Hàm tốn $O(n)$ nằm **BÊN TRONG** vòng lặp $O(n)$ $\rightarrow$ Bắt buộc phải **NHÂN**: $n \times n = \mathbf{O(n^2)}$.

### 2. Thao tác Nối Tiếp (CỘNG: $n + n + n = O(n)$)
```javascript
s.split('').reverse().join('');
```
1. `split('')`: Duyệt $n$ ký tự để tạo mảng $\rightarrow$ Mất $n$ bước.
2. `reverse()`: Lật ngược mảng $n$ phần tử $\rightarrow$ Mất $n/2 \approx n$ bước.
3. `join('')`: Duyệt $n$ phần tử để ghép thành chuỗi $\rightarrow$ Mất $n$ bước.
👉 Các hàm chạy **TUẦN TỰ** nối đuôi nhau $\rightarrow$ Phép **CỘNG**:
$$\text{Time} = n + n + n = 3n \rightarrow \mathbf{O(n)}$$

### 3. Vậy tại sao `split('').reverse().join('')` vẫn bị cấm trong Backend ANZ?
Dù độ phức tạp toán học là $O(n)$, nhưng:
* **Tốn $O(n)$ bộ nhớ RAM phụ:** Cấp phát thêm 1 mảng tạm + 1 chuỗi tạm khổng lồ trong heap.
* **Stop-The-World:** Hàng triệu bản ghi làm V8 Garbage Collector quá tải, gây đứng hình Event Loop.
* **Không có Early Exit:** Dù ký tự đầu và cuối khác nhau, nó vẫn cặm cụi đảo ngược cả chuỗi $100,000$ ký tự rồi mới biết sai, trong khi Two Pointers phát hiện sai ở bước đầu tiên là `return false` ngay lập tức!


