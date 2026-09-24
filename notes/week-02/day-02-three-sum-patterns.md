# 🧭 Cẩm Nang Chuyên Sâu: Two Pointers Kẹp Hai Đầu & Bẫy Xử Lý Duplicate (Week 2 Day 2)

> **Mục tiêu phỏng vấn ANZ:** Làm chủ kỹ thuật Two Pointers kẹp hai đầu (Two Pointers Inward Collision), giải mã bẫy sắp xếp số học trong JavaScript V8, và thấu suốt chiến lược nhảy cóc 3 tầng (3-Tier Skip Strategy) để loại bỏ trùng lặp triệt để trong $O(1)$ auxiliary space.

---

## 🗺️ 1. Bản Đồ Phân Loại Con Trỏ: Kẹp Hai Đầu vs. Cửa Sổ Trượt vs. Nhanh-Chậm

Trong các bài toán mảng, có 3 mô hình con trỏ chính thường gặp:

```text
                               PHÂN LOẠI MÔ HÌNH HAI CON TRỎ
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             ▼                               ▼                               ▼
    KẸP HAI ĐẦU (COLLISION)         CỬA SỔ TRƯỢT (SLIDING WINDOW)    CON TRỎ NHANH - CHẬM
    (Inward / Converging)           (Subarray / Substring)           (Fast & Slow Pointers)
             │                               │                               │
- Vị trí: Trái (0) và Phải (n-1)     - Cùng chiều (L cùng tiến với R) - Tốc độ bước nhảy khác nhau
- Điều kiện: MẢNG PHẢI ĐƯỢC SORT    - Mảng con liên tiếp (contiguous) - Phát hiện chu trình (Floyd)
- Hướng đi: Thu hẹp vào giữa         - Mở rộng / co hẹp khoảng [L, R]  - Ghi đè tại chỗ (Write Index)
- Bài toán: 3Sum, Two Sum II,        - Bài toán: Longest Substring,   - Bài toán: Move Zeroes,
  Container With Most Water           Min Size Subarray Sum             Remove Duplicates, Linked List
```

### 🚦 Khi nào chọn Kẹp Hai Đầu (Inward Collision)?
1. Bài toán yêu cầu tìm cặp / bộ ba phần tử thỏa mãn một tổng hoặc bất đẳng thức nhất định (ví dụ: $a + b + c = 0$ hoặc $a + b = \text{target}$).
2. Mảng có thể sắp xếp được mà không làm hỏng ngữ nghĩa bài toán (hoặc mảng đã được sắp xếp sẵn).
3. Đòi hỏi độ phức tạp bộ nhớ phụ trợ tối thiểu $O(1)$ (không dùng thêm `Set` hay `Map`).

---

## ⚠️ 2. Bẫy Sắp Xếp Số Học Trong JavaScript: `Array.prototype.sort()`

Trong phỏng vấn JavaScript/Node.js, đây là một câu hỏi bẫy cực kỳ phổ biến:
> *"Điều gì xảy ra nếu bạn gọi `nums.sort()` mà không truyền comparator?"*

```js
const numbers = [-1, 0, 1, 2, -1, -4, 10];
numbers.sort();
console.log(numbers);
// Output: [ -1, -1, -4, 0, 1, 10, 2 ]  <-- BỊ SAI THỨ TỰ!
```

### 🔍 Giải thích cơ chế V8 Engine:
- Theo đặc tả ECMAScript, hàm `sort()` mặc định chuyển đổi tất cả phần tử thành **chuỗi ký tự (UTF-16 code units)** rồi so sánh theo thứ tự từ điển (lexicographical order).
- Chuỗi `"-4"` đứng sau `"-1"` vì ký tự `'4'` có mã ASCII lớn hơn `'1'`. Tương tự, `"10"` đứng trước `"2"` vì ký tự `'1'` nhỏ hơn `'2'`.
- **Hậu quả:** Thuật toán Two Pointers hoàn toàn đổ vỡ vì mảng không được sắp xếp theo giá trị số học thực sự!

### ✅ Giải pháp bắt buộc:
```js
// Luôn luôn cung cấp numeric comparator:
nums.sort((a, b) => a - b);
```

---

## 🛡️ 3. Chiến Lược 3 Tầng Nhảy Cóc (3-Tier Skip Strategy) Triệt Tiêu Trùng Lặp

Trong bài toán 3Sum, đề bài nghiêm cấm kết quả chứa các bộ ba trùng lặp (No duplicate triplets).

### ❌ Sai lầm phổ biến của Junior: Dùng `Set` để lọc trùng
```js
// Cách làm anti-pattern:
const set = new Set();
// Tìm thấy [a, b, c] -> set.add(`${a},${b},${c}`)
// Sau đó map ngược từ Set string về mảng
```
- **Hậu quả:** Tốn $O(n^2)$ bộ nhớ phụ trợ để lưu chuỗi, phát sinh chi phí serialize / parse chuỗi, và liên tục kích hoạt bộ gom rác (Garbage Collector) của V8.

### ✅ Chuẩn Senior ANZ: Nhảy cóc con trỏ tại chỗ trong $O(1)$ Space

```text
Mảng đã sắp xếp: [-2,  0,  0,  2,  2]
                   ▲   ▲       ▲
                   │   │       │
                   i  left   right
```

#### Tầng 1: Nhảy cóc con trỏ ngoài `i`
```js
if (i > 0 && sorted[i] === sorted[i - 1]) continue;
```
> ⚠️ **BẪY TƯ DUY:** Tại sao là `sorted[i] === sorted[i - 1]` mà KHÔNG ĐƯỢC LÀ `sorted[i] === sorted[i + 1]`?
> - Nếu ta so sánh với số phía sau (`i + 1`): Khi gặp `[-1, -1, 2]`, ngay tại số `-1` đầu tiên ta đã bỏ qua nó, khiến ta **bỏ sót hoàn toàn** bộ ba hợp lệ `[-1, -1, 2]`!
> - So sánh với số phía trước (`i - 1`): Đảm bảo số hiện tại chỉ bị bỏ qua nếu nó lặp lại giá trị của số **đã được xử lý trọn vẹn ở vòng lặp trước đó**.

#### Tầng 2 & 3: Nhảy cóc hai con trỏ trong `left` và `right` sau khi tìm thấy tổng bằng 0
```js
// Khi sorted[i] + sorted[left] + sorted[right] === 0:
result.push([sorted[i], sorted[left], sorted[right]]);

// Nhảy cóc tất cả phần tử trùng với sorted[left]
while (left < right && sorted[left] === sorted[left + 1]) left++;

// Nhảy cóc tất cả phần tử trùng với sorted[right]
while (left < right && sorted[right] === sorted[right - 1]) right--;

// Thu hẹp cả hai đầu để tìm kiếm cặp số tiếp theo
left++;
right--;
```

---

## ⚡ 4. Tối Ưu Hóa V8 & Điều Kiện Ngắt Sớm (Early-Exit Invariant)

Nhờ đặc tính của mảng đã sắp xếp tăng dần ($A_0 \le A_1 \le \dots \le A_{n-1}$):

1. **Ngắt toàn bộ ($O(1)$ Best Case):**
   ```js
   if (sorted[0] > 0) return [];
   ```
   Nếu phần tử nhỏ nhất lớn hơn 0, toàn bộ mảng là các số dương. Tổng của 3 số dương bất kỳ luôn $> 0$, không bao giờ bằng 0.

2. **Ngắt vòng lặp ngoài:**
   ```js
   for (let i = 0; i < n - 2; i++) {
     if (sorted[i] > 0) break; // Tất cả các số phía sau đều > 0, không thể cộng lại thành 0
     // ...
   }
   ```

3. **Bảo toàn tính bất biến (Immutability):**
   - Không đột biến trực tiếp mảng `nums` của caller:
     ```js
     const sorted = [...nums].sort((a, b) => a - b);
     ```
   - Điều này tuân thủ nguyên lý Functional Programming, tránh gây side-effect không mong muốn cho luồng nghiệp vụ khác đang sử dụng mảng gốc.

---

## 🏦 5. Ứng Dụng Ngân Hàng Thực Tế: Tri-party Settlement Balancing

Trong hệ thống xử lý giao dịch liên ngân hàng tại ANZ:
- **Net-Zero Settlement:** Ba giao dịch đối ứng (Debit / Credit / Fee Clearing) giữa 3 tài khoản phải có tổng độ lệch bằng 0:
  $$T_1 + T_2 + T_3 = 0$$
- Nếu áp dụng thuật toán vét cạn $O(n^3)$ cho 10,000 giao dịch cuối ngày, hệ thống sẽ mất hàng giờ và gây tắc nghẽn batch job.
- Với thuật toán Sorting + Two Pointers $O(n^2)$, hệ thống xử lý 10,000 giao dịch trong vòng chưa đầy **1.2 giây** với mức tiêu thụ RAM tối thiểu.

