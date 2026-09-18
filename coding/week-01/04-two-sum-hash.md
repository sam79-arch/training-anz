# 📚 Cẩm Nang PBL: Two Sum & Contains Duplicate (Hashing Space-Time Tradeoff)

> **Mục tiêu phỏng vấn:** Nắm vững triết lý **Space-Time Tradeoff** (đánh đổi $O(n)$ RAM để đạt tốc độ tối đa $O(1)$ Time), giải quyết triệt để bài toán **Idempotency Deduplication** (chống trừ tiền 2 lần khi mạng chập chờn) tại ANZ Bank, phân tích V8 Engine Internals giữa `Map` và Object `{}`, và tự tin đối thoại tiếng Anh chuẩn Senior Backend Engineer.

---

## 🏦 Phần 1: Tình Huống Ngân Hàng Thực Tế (Problem Scenario & Pain Point)

### 1. Kịch Bản Nghiệp Vụ: Cổng Thanh Toán Trực Tuyến ANZ
Hãy hình dung hệ thống xử lý giao dịch thanh toán của ANZ Bank trong đợt cao điểm Black Friday:
* Hàng chục nghìn yêu cầu thanh toán thẻ đổ về mỗi phút.
* **Sự cố mạng:** Người dùng bấm "Thanh Toán \$100" trên ứng dụng Mobile Banking. Do mạng 4G chập chờn, điện thoại không nhận được tín hiệu phản hồi ngay, người dùng sốt ruột **bấm nút thanh toán lần thứ hai**.
* **Hậu quả nếu không xử lý:** Tài khoản của khách hàng bị trừ \$200 (Double-charging) $\rightarrow$ Khách hàng bức xúc khiếu nại, ngân hàng bị phạt vi phạm quy chế tài chính.

---

### 2. Nỗi Đau Hiệu Năng: Tại Sao Brute-Force ($O(n^2)$) Là Tự Sát?
Để chống giao dịch gửi trùng, hệ thống cần kiểm tra xem `Idempotency Key` hoặc mã giao dịch này đã xuất hiện trong danh sách batch gần đây chưa:

* ❌ **Thuật toán Ngây Thơ (Brute-Force):** Dùng 2 vòng lặp lồng nhau hoặc hàm `indexOf()` / `includes()` trên mảng:
  ```javascript
  // THẢM HỌA: O(n^2) Time Complexity!
  function hasDuplicateNaive(transactions) {
    for (let i = 0; i < transactions.length; i++) {
      for (let j = i + 1; j < transactions.length; j++) {
        if (transactions[i] === transactions[j]) return true;
      }
    }
    return false;
  }
  ```
  * Với batch $n = 100,000$ giao dịch, số phép so sánh là $\frac{100,000^2}{2} = 5,000,000,000$ (5 tỷ phép tính)!
  * CPU của Node.js bị khóa cứng trong hàng chục giây, toàn bộ luồng xử lý bị nghẽn (Event Loop Starvation).

* ❌ **Tại sao không sort mảng rồi dùng Two Pointers?**
  * Trong bài Two Sum II (Day 3), mảng **đã được sort sẵn** nên ta tận dụng được 2 con trỏ $O(1)$ space.
  * Nhưng với mảng chưa sắp xếp:
    1. Chi phí sort mất tối thiểu $O(n \log n)$.
    2. Sort làm **đảo lộn chỉ mục ban đầu (`original index`)**. Muốn giữ lại index, ta phải tạo một mảng phụ gồm các cặp `[value, originalIndex]` $\rightarrow$ vừa tốn thêm $O(n)$ bộ nhớ, vừa chạy chậm hơn $O(n \log n)$!

👉 **Lối Thoát Duy Nhất: Triết Lý Space-Time Tradeoff**  
Thay vì tiết kiệm RAM, ta chấp nhận đầu tư $O(n)$ bộ nhớ (dùng Hash Map / Set) để đổi lấy **tốc độ tra cứu tức thời $O(1)$**!

---

## ⚡ Phần 2: Khám Phá Kỹ Thuật One-Pass Hash Table

Thay vì phải duyệt mảng 2 lần (lần 1 nạp hết vào Map, lần 2 mới tìm), kỹ thuật **One-Pass Hash Table** vừa duyệt vừa tra cứu phần bù (**Complement**) trong đúng 1 lượt chạy duy nhất!

### 🎬 Mô Phỏng Từng Bước (Visual Walkthrough):
Cho mảng `nums = [2, 7, 11, 15]`, `target = 9`:

```text
               Target = 9
               
     nums:  [ 2 ,  7 , 11 , 15 ]
              ▲
           Bước 1 (i=0, num=2):
           - Cần tìm complement = 9 - 2 = 7
           - Tra cứu trong Map: Có 7 chưa? -> CHƯA!
           - Lưu 2 vào Map: Map { 2 => 0 }
           
     nums:  [ 2 ,  7 , 11 , 15 ]
                   ▲
           Bước 2 (i=1, num=7):
           - Cần tìm complement = 9 - 7 = 2
           - Tra cứu trong Map: Có 2 chưa? -> CÓ RỒI! (tại index 0)
           - DỪNG NGAY LẬP TỨC!
           - Trả về kết quả: [Map.get(2), 1] = [0, 1].
```

#### 🌟 3 Ưu Điểm Tuyệt Đối Của One-Pass:
1. **Duyệt mảng đúng 1 lần:** Không cần chờ duyệt hết mảng mới tìm ra kết quả.
2. **Tự nhiên loại trừ chính nó:** Không bao giờ bị bẫy tự cộng với chính mình (ví dụ: `nums = [3, 2, 4], target = 6`, khi duyệt đến số 3 đầu tiên, Map chưa hề có số 3 nên không bị trả về `[0, 0]`).
3. **Bộ nhớ tối ưu:** Trong trường hợp lý tưởng (như cặp số nằm ở đầu mảng), Map chỉ cần lưu 1 phần tử là xong!

---

## 🧠 Phần 3: Bóc Tách V8 Engine: `new Map()` vs Plain Object `{}` Trong Node.js

Một câu hỏi phỏng vấn Senior "đắt giá" tại ANZ Bank:  
> *"Tại sao trong các hệ thống High-Throughput xử lý dữ liệu tài chính, bạn nên dùng `new Map()` và `new Set()` thay vì plain Object `{}`?"*

```text
 ┌─────────────────────────────────────────────────────────────┐
 │               BẢNG SO SÁNH CHUYÊN SÂU DƯỚI TẦNG V8          │
 └─────────────────────────────────────────────────────────────┘
```

| Tiêu chí so sánh | Plain JavaScript Object `{}` | Native `new Map()` |
|---|---|---|
| **1. Nguy cơ Bảo mật (Prototype Pollution)** | 🔴 **Nguy hiểm cao**: Object kế thừa từ `Object.prototype`. Nếu hacker truyền key như `"__proto__"`, `"toString"`, `"valueOf"`, hàm `obj[key]` sẽ trả về function có sẵn, gây lỗi logic hoặc lỗ hổng Remote Code Execution. | 🟢 **An toàn 100%**: `Map` là cấu trúc độc lập, không có prototype keys mặc định. |
| **2. Kiểu dữ liệu của Key** | Chỉ chấp nhận `String` hoặc `Symbol`. Nếu đưa số vào: `obj[2]` bị ép kiểu ngầm thành `obj["2"]`. | Chấp nhận **mọi kiểu dữ liệu**: Number, Object, Buffer, Function. |
| **3. Hiệu năng V8 Engine (Hidden Classes)** | V8 tối ưu Object bằng **Hidden Classes (Shapes)**. Khi liên tục thêm/xóa key động (`delete obj[k]`), V8 bị ép rơi vào **Dictionary Mode (Deoptimization)**, khiến tốc độ sụt giảm nghiêm trọng! | Được tối ưu bằng **Hash Table chuyên biệt bằng C++ ngầm**, thiết kế tối ưu riêng cho việc liên tục `set()`, `get()`, `delete()` trong $O(1)$. |
| **4. Đo kích thước dữ liệu (Size)** | Muốn biết số phần tử phải gọi `Object.keys(obj).length` $\rightarrow$ Tốn $O(n)$ thời gian và cấp phát thêm một mảng chuỗi vào Heap! | Có sẵn thuộc tính `map.size` đọc trực tiếp trong **$O(1)$ time**. |
| **5. Thứ tự duyệt phần tử (Iteration Order)** | Phức tạp: Khóa số được xếp trước tăng dần, khóa chuỗi xếp theo thứ tự thêm vào. | **Bảo toàn 100% thứ tự chèn (Insertion Order)** từ đầu đến cuối. |

> 📌 **Lời khuyên Senior ANZ:**  
> Khi xây dựng Cache, Deduplication Set, hoặc bộ đếm tần suất trong Node.js, **luôn luôn dùng `new Map()` và `new Set()`**. Chỉ dùng plain Object `{}` khi định nghĩa cấu trúc dữ liệu tĩnh (Data Transfer Object / DTO).

---

## 🎙️ Phần 4: Kịch Bản Phỏng Vấn Tiếng Anh Chuẩn 6 Bước (ANZ Intermediate B1-B2)

Khi phỏng vấn tại ANZ, kỹ năng quan trọng nhất là giải thích được **vì sao bạn chọn đánh đổi RAM lấy CPU**. Dưới đây là khung đối thoại chuẩn 6 bước:

---

### Step 1: Clarify (Làm rõ đề bài)
> *"Before diving into the implementation, I'd like to clarify a few constraints:  
> 1. Is the input array guaranteed to have exactly one valid solution, or could there be no solution at all?  
> 2. Can elements be negative or zero?  
> 3. And most importantly, can we use the same element twice?"*

---

### Step 2: Brute-Force & Pain Point (Nêu cách ngây thơ & chỉ ra điểm nghẽn)
> *"The naive approach is to use nested loops, checking every possible pair.  
> However, that takes **$O(n^2)$ time complexity**. In a high-throughput banking system processing hundreds of thousands of transactions, an $O(n^2)$ algorithm would block the single-threaded event loop and degrade system responsiveness."*

---

### Step 3: Optimize & Space-Time Tradeoff (Đề xuất tối ưu Hashing)
> *"To optimize this, I apply the **Space-Time Tradeoff principle**.  
> Instead of sorting the array—which takes $O(n \log n)$ time and loses the original indices—I will use a **One-Pass Hash Map**.  
> By trading **$O(n)$ auxiliary space**, we achieve an optimal **$O(n)$ linear time complexity**, resolving each lookup in average $O(1)$ time."*

---

### Step 4: Think Out Loud (Vừa code vừa thuyết minh)
> *"First, I add a **guard clause at line 1** to safely handle null, undefined, or arrays with fewer than two elements.  
> Next, I instantiate a native `new Map()` to store the numbers we've seen so far as keys and their original indices as values.  
> Inside the loop, for each number, I calculate its complement: `target minus nums[i]`.  
> If the map already contains this complement, we immediately return the pair of indices. Otherwise, we record the current number into the map and continue."*

---

### Step 5: Dry Run (Chạy thử bằng miệng với ví dụ cụ thể)
> *"Let's trace this with an example: `nums = [3, 2, 4]`, and `target = 6`.  
> - At index 0, value is 3. Complement is 6 - 3 = 3. The map is currently empty, so we store `{ 3: 0 }`. Notice that this prevents using the same index 0 twice!  
> - At index 1, value is 2. Complement is 6 - 2 = 4. 4 is not in the map, so we store `{ 2: 1 }`.  
> - At index 2, value is 4. Complement is 6 - 4 = 2. 2 is found in the map at index 1!  
> We immediately return `[1, 2]`, which matches the target sum `2 + 4 = 6`."*

---

### Step 6: Conclusion (Chốt độ phức tạp)
> *"In conclusion:  
> - **Time Complexity:** $O(n)$ because we traverse the list containing $n$ elements only once, and hash table lookups take $O(1)$ average time.  
> - **Auxiliary Space Complexity:** $O(n)$ as the map stores at most $n$ elements in the worst case."*

---

## 🚀 Phần 5: Bài Toán Biến Thể ANZ Mở Rộng (Next Steps)

Khi bạn giải xong Two Sum trong vòng 10 phút, người phỏng vấn ANZ thường sẽ nâng cấp bài toán:

1. **Biến thể 1: 3Sum (LeetCode #15):**  
   * Đề bài: Tìm tất cả các bộ 3 số `a + b + c = 0` không trùng lặp.
   * Cách giải: Sort mảng trước $\rightarrow$ Cố định số thứ nhất bằng vòng lặp ngoài $\rightarrow$ Dùng **Two Pointers đối đầu (Day 3)** ở bên trong để giải quyết bài toán Two Sum còn lại. Độ phức tạp: $O(n^2)$.
2. **Biến thể 2: Subarray Sum Equals K (LeetCode #560):**  
   * Đề bài: Tìm số lượng mảng con liên tiếp có tổng bằng $K$.
   * Cách giải: Kết hợp **Prefix Sum + Hash Map đếm tần suất** để đạt độ phức tạp $O(n)$.

