# 🧭 Cẩm Nang Hash Table: Đổi Không Gian Lấy Thời Gian & V8 Internals (HCLTech x ANZ)

> **Mục tiêu phỏng vấn:** Nắm vững bản chất thuật toán Hash Map/Set, làm chủ sự đánh đổi Không gian - Thời gian (Space-Time Tradeoff), thấu hiểu kiến trúc V8 Engine bên dưới và tự tin trình bày ứng dụng trong hệ thống tài chính ANZ Bank bằng tiếng Anh chuẩn mực.

---

## 🗺️ 1. Bản Đồ Tư Duy: Two Pointers vs. Hash Table (Khi Nào Two Pointers Bị Loại?)

Một trong những câu hỏi bẫy kinh điển của giám khảo ANZ:
> *"Tại sao ở bài Two Sum II (Day 3) bạn dùng Two Pointers $O(1)$ space, nhưng sang bài Two Sum này (Day 5) bạn lại chấp nhận tốn $O(n)$ space cho Hash Table?"*

```text
                           BÀI TOÁN TÌM CẶP SỐ (PAIR SUM)
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
 MẢNG ĐÃ SẮP XẾP (Sorted)                                   MẢNG CHƯA SẮP XẾP (Unsorted)
        │                                                                 │
- Two Pointers (Left-Right Collision)                      - Yêu cầu trả về CHỈ MỤC GỐC (Original Indices)
- Time: O(n)                                                      │
- Space: O(1) TỐI ƯU                                       ┌──────┴──────────────────────────────┐
- Cơ chế: Cân bập bênh theo thứ tự                         ▼                                     ▼
  (Tăng left nếu thiếu, giảm right nếu thừa)        CỐ TÌNH SẮP XẾP                        HASH TABLE (MAP)
                                                    - Time: O(n log n)                    - Time: O(n) TỐI ƯU
                                                    - Đảo lộn chỉ mục gốc                 - Space: O(n)
                                                    - Cần tạo mảng phụ lưu index          - Giữ nguyên chỉ mục gốc
                                                    ❌ BỊ LOẠI                           ✅ ĐƯỢC CHỌN
```

### 🚦 Quy tắc phán quyết 3 giây:
1. **Mảng đã sorted** $\rightarrow$ Ưu tiên **Two Pointers** ($O(n)$ time, $O(1)$ auxiliary space).
2. **Mảng unsorted + yêu cầu chỉ mục ban đầu** $\rightarrow$ Bắt buộc **Hash Map** (Chấp nhận $O(n)$ space để giữ thời gian $O(n)$).

---

## ⚡ 2. Hai Pattern Kinh Điển Của Hash Table

### Pattern 1: One-Pass Hash Map với Tra cứu Phần bù (Complement Lookup)
* **Ý tưởng cốt lõi:** Thay vì 2 vòng lặp lồng nhau $O(n^2)$ hoặc duyệt 2 lượt (Two-Pass), ta duyệt mảng đúng **1 lượt duy nhất** (One-Pass).
* **Công thức toán học:**
  $$\text{complement} = \text{target} - \text{nums}[i]$$
* **Cơ chế lưu trữ:**
  - Key: Giá trị phần tử (`nums[i]`).
  - Value: Chỉ mục ban đầu (`i`).
* **Tại sao One-Pass giải quyết được phần tử trùng lặp (ví dụ `nums = [3, 3]`, `target = 6`)?**
  - Khi đứng ở số `3` đầu tiên (index 0): Map đang rỗng $\rightarrow$ chưa tìm thấy complement $\rightarrow$ ghi nhận `map.set(3, 0)`.
  - Khi đứng ở số `3` thứ hai (index 1): Complement là `6 - 3 = 3` đã có trong Map với index 0 $\rightarrow$ Trả về `[0, 1]` ngay lập tức! Không bao giờ bị ghi đè key.

```js
function twoSum(nums, target) {
  // Line 1: Mandatory Guard Clause
  if (!Array.isArray(nums) || nums.length < 2) return [];

  const numMap = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (numMap.has(complement)) {
      return [numMap.get(complement), i]; // O(1) lookup
    }

    numMap.set(nums[i], i);
  }

  return [];
}
```

---

### Pattern 2: Early-Exit Hash Set (Kiểm soát Trùng lặp & Idempotency)
* **Ý tưởng cốt lõi:** Kiểm tra sự tồn tại trong $O(1)$ và **ngắt sớm (Early-Exit)** ngay khi bắt gặp phần tử đầu tiên đã từng xuất hiện.
* **Độ phức tạp:**
  - Best-case: $O(1)$ khi duplicate nằm ngay ở 2 phần tử đầu.
  - Average / Worst-case: $O(n)$ time, $O(n)$ space.

```js
function containsDuplicate(nums) {
  // Line 1: Mandatory Guard Clause
  if (!Array.isArray(nums) || nums.length <= 1) return false;

  const seen = new Set();

  for (let i = 0; i < nums.length; i++) {
    if (seen.has(nums[i])) {
      return true; // Ngắt sớm ngay lập tức, không duyệt phần còn lại
    }
    seen.add(nums[i]);
  }

  return false;
}
```

---

## 🏦 3. Bối Cảnh Thực Tế Tại ANZ Bank (Data Platform & Payment Services)

Trong hệ thống xử lý giao dịch dữ liệu lớn của ANZ, Hash Table là vũ khí hàng đầu cho 2 bài toán sống còn:

### 1. Offsetting Transactions (Đối soát cân bằng sổ cái tài chính)
* **Bối cảnh:** Mỗi ngày hệ thống nhận hàng triệu giao dịch Ghi Nợ (Debit) và Ghi Có (Credit). Cuối ngày, hệ thống Reconciliation cần tìm các cặp giao dịch bù trừ nhau để quyết toán sổ cái (General Ledger Balance).
* **Ứng dụng Two Sum:** Tìm cặp giao dịch $(T_A, T_B)$ sao cho tổng giá trị bằng đúng số tiền bù trừ target trong thời gian thực tuyến tính $O(n)$.

### 2. Idempotency Key / Request Deduplication (Chống trừ tiền 2 lần)
* **Bối cảnh:** Trong kiến trúc Microservices & Distributed Payments, mạng chập chờn khiến client gửi retry 2 lần cho cùng một yêu cầu thanh toán (Double Payment Request).
* **Ứng dụng Contains Duplicate:** Mỗi request mang một `Idempotency-Key` (UUID). Hệ thống kiểm tra trong Redis/In-memory Set:
  - Nếu key đã tồn tại $\rightarrow$ Chặn ngay lập tức (Early-Exit), trả về kết quả cũ mà không thực hiện lệnh trừ tiền lần hai.

---

## ⚙️ 4. V8 Engine Internals: Tại Sao Dùng `new Map()` / `new Set()` Thay Vì `{}`?

Một câu hỏi phỏng vấn phân loại ứng viên Senior Node.js:
> *"Tại sao không dùng Plain Object `{}` làm bảng băm cho tiện mà phải dùng `new Map()`?"*

| Tiêu chí | `new Map()` / `new Set()` | Plain Object `{}` |
|---|---|---|
| **Bảo mật (Security)** | Tuyệt đối an toàn. Không có thuộc tính thừa kế. | ⚠️ Nguy cơ **Prototype Pollution** (bị tấn công qua `__proto__`, `toString`, `valueOf`). |
| **Kiểu dữ liệu của Key** | Chấp nhận **MỌI kiểu**: Object, Symbol, BigInt, Number, Function. | Chỉ chấp nhận **String** hoặc **Symbol**. Số `1` và chuỗi `"1"` bị coi là cùng một key. |
| **Cơ chế bộ nhớ V8** | Cấu trúc bảng băm C++ chuyên dụng (Buckets, Hash table với Open Addressing). | Dựa trên **Hidden Class (Shape)**. Việc thêm/xóa dynamic keys (`delete obj[k]`) làm vỡ Inline Cache, ép V8 rơi vào **Dictionary Mode** (deoptimization). |
| **Hiệu năng Thêm/Xóa liên tục** | Được tối ưu hóa cho thao tác chèn/xóa với tần suất cao ($O(1)$). | Kém hiệu quả khi số lượng thuộc tính biến động liên tục. |
| **Kích thước (Size)** | Có sẵn thuộc tính `map.size` truy xuất trong $O(1)$. | Phải gọi `Object.keys(obj).length` tốn $O(n)$ thời gian. |

---

## 🎙️ 5. Kịch Bản Tiếng Anh 6 Bước Chuẩn Phỏng Vấn ANZ

### Step 1: Clarify
> *"Before jumping into the solution, I'd like to clarify a few requirements. Are the inputs guaranteed to be valid integers, and can the array be unsorted? Also, do we need to return the original 0-based indices, and is there guaranteed to be exactly one valid solution?"*

### Step 2: Brute-Force
> *"The naive approach would be using two nested loops to check every possible pair $(i, j)$. This would take $O(n^2)$ time complexity and $O(1)$ space. However, for large transaction datasets at ANZ, an $O(n^2)$ solution would cause significant event loop latency and is unacceptable."*

### Step 3: Optimize (Space-Time Tradeoff)
> *"Since the array is unsorted and we must preserve the original indices, sorting the array would take $O(n \log n)$ and scramble the indices. Instead, we can make a space-time tradeoff by utilizing a Hash Map. By trading $O(n)$ memory, we can reduce the time complexity from $O(n^2)$ down to $O(n)$ linear time in a single pass."*

### Step 4: Think Out Loud
> *"I start with a guard clause at line 1 to validate that `nums` is a valid array with at least two elements. Then, I initialize a native `new Map()`. As I iterate through each element, I calculate the `complement = target - nums[i]`. If the map already contains this complement, I return the complement's index along with the current index. Otherwise, I store the current value and index into the map for subsequent lookups."*

### Step 5: Dry Run
> *"Let's dry run with `nums = [3, 2, 4]` and `target = 6`:*
> *- At index 0, value is 3. Complement is $6 - 3 = 3$. Map is empty. We store `(3: 0)`.*
> *- At index 1, value is 2. Complement is $6 - 2 = 4$. Not in map. We store `(2: 1)`.*
> *- At index 2, value is 4. Complement is $6 - 4 = 2$. Map has key 2 at index 1!*
> *- We immediately return `[1, 2]`. The dry run confirms correctness."*

### Step 6: Conclusion
> *"In conclusion, this one-pass approach achieves $O(n)$ time complexity because Map lookups and insertions take $O(1)$ on average. The auxiliary space complexity is $O(n)$ to store up to $n$ elements in the worst case. Using JavaScript native `Map` also avoids prototype pollution and hidden class deoptimization in the V8 engine."*
