# Bài 03: Two Sum II - Input Array Is Sorted (Khớp Cặp Giao Dịch Đối Ứng)

- **Độ khó:** Medium-level Foundation (Nền tảng trực tiếp để giải bài Medium 3Sum)
- **LeetCode:** [#167 Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)
- **Pattern:** Hai con trỏ đối đầu (Left-Right Collision trên mảng đã sắp xếp)
- **Mục tiêu:** $O(n)$ Time Complexity | $O(1)$ Auxiliary Space Complexity

---

## 1. Problem Scenario (Bối cảnh thực tế Ngân hàng)

Trong hệ thống xử lý giao dịch thanh toán của ANZ (Payment & Clearing Engine):
Khi thực hiện đối soát cuối ngày (**End-of-Day Transaction Reconciliation**), hệ thống cần tìm 2 giao dịch có tổng giá trị bù trừ bằng đúng một khoản tiền chênh lệch $Target$ (ví dụ: một khoản ghi nợ và một khoản hoàn phí).

Danh sách các giao dịch được trích xuất từ cơ sở dữ liệu đã được sắp xếp tăng dần theo giá trị tiền tệ:
`numbers = [2, 7, 11, 15]`, `target = 9`.

**Ràng buộc ngặt nghèo của hệ thống ngân hàng:**
- Mảng dữ liệu đã được sắp xếp tăng dần (non-decreasing order).
- Phải tìm ra 2 vị trí theo quy ước **1-based index** (chỉ mục bắt đầu từ 1: `1 <= index1 < index2 <= numbers.length`).
- Không được dùng lại một phần tử 2 lần.
- **Tiêu chuẩn bộ nhớ khắt khe:** Hệ thống xử lý hàng trăm nghìn giao dịch mỗi batch, do đó **không được phép cấp phát thêm bộ nhớ RAM ($O(1)$ Extra Space)**.

---

## 2. Pain Point (Điểm nghẽn & So sánh 3 hướng tiếp cận)

### ❌ Cách 1: Brute-Force 2 vòng lặp lồng nhau ($O(n^2)$ Time)
```javascript
for (let i = 0; i < numbers.length; i++) {
  for (let j = i + 1; j < numbers.length; j++) {
    if (numbers[i] + numbers[j] === target) return [i + 1, j + 1];
  }
}
```
* **Hậu quả:** Với $n = 30,000$ giao dịch, số phép so sánh lên tới gần $450,000,000$ phép tính, gây Timeout (TLE) và làm nghẽn Event Loop của Node.js.

### ⚠️ Cách 2: Dùng Hash Map ($O(n)$ Time, $O(n)$ Space)
* **Ý tưởng:** Lưu các số đã duyệt vào một `Map()`. Khi duyệt đến `numbers[i]`, kiểm tra xem `target - numbers[i]` có trong Map không.
* **Đánh giá phỏng vấn:** Mặc dù đạt $O(n)$ thời gian, nhưng việc dùng Map sẽ ngốn thêm $O(n)$ bộ nhớ heap. Người phỏng vấn ANZ sẽ lập tức phản biện:  
  > *"The input array is already sorted. Can you solve this without using any extra memory?"*

---

## 3. Discovery & Coding: Two Pointers Kẹp Hai Đầu ($O(n)$ Time, $O(1)$ Space)

### 💡 Trực quan hóa cơ chế chuyển động:

Vì mảng **đã sắp xếp tăng dần**, giá trị nhỏ nhất nằm ở cực trái (`left = 0`) và giá trị lớn nhất nằm ở cực phải (`right = numbers.length - 1`):

```text
Mảng: [2,  7,  11,  15] | Target = 9
       L              R   -> sum = 2 + 15 = 17 > 9 (Tổng quá lớn! Cần số nhỏ hơn -> giảm R--)
       
       L       R          -> sum = 2 + 11 = 13 > 9 (Vẫn lớn hơn 9 -> giảm R--)
       
       L   R              -> sum = 2 + 7  = 9  === 9 (Khớp chính xác! Trả về [L+1, R+1] = [1, 2])
```

* **Quy tắc di chuyển bất biến:**
  1. `sum < target`: Vì `numbers[right]` đã là số lớn nhất trong khoảng xét, `numbers[left]` không thể kết hợp với bất kỳ số nào để đủ lớn $\rightarrow$ chắc chắn tăng `left++`.
  2. `sum > target`: Tương tự, `numbers[left]` là số nhỏ nhất, `numbers[right]` cộng với bất kỳ số nào cũng vượt quá $\rightarrow$ chắc chắn giảm `right--`.
  3. `sum === target`: Tìm thấy cặp duy nhất thỏa mãn $\rightarrow$ trả về `[left + 1, right + 1]`.

### Mã nguồn hoàn chỉnh:
```javascript
function twoSumSorted(numbers, target) {
  // 1. Guard clause
  if (!Array.isArray(numbers) || numbers.length < 2) {
    return [];
  }

  // 2. Hai con trỏ đối đầu
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    if (sum === target) {
      return [left + 1, right + 1]; // 1-indexed
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return [];
}
```

---

## 4. Open Dialogue & English Scripting (Kịch bản nói to 6 bước)

Luyện tập đọc to kịch bản tiếng Anh theo chuẩn 6 bước phản xạ phỏng vấn ANZ:

### Bước 1: Clarify (Làm rõ đề bài)
> *"Before diving in, I'd like to confirm a couple of constraints:*  
> *First, the array is guaranteed to be sorted in non-decreasing order, correct?*  
> *Second, the problem specifies a 1-based index, meaning we return `[index1 + 1, index2 + 1]`, and exactly one valid solution always exists.*  
> *Understood! I will implement an in-place solution with constant space."*

### Bước 2: Brute-Force (Nêu cách ngây thơ & điểm nghẽn)
> *"The brute-force solution would use nested loops to check all possible pairs. This takes O(n^2) time complexity, which is impractical for large transaction batches.*  
> *Another approach is using a Hash Map for O(n) time, but that requires O(n) auxiliary space, ignoring the sorted property of the input."*

### Bước 3: Optimize (Chốt thuật toán tối ưu)
> *"Since the array is already sorted, we can use the **Two Pointers (Left-Right Collision)** technique.*  
> *By placing one pointer at the beginning and one at the end, we can evaluate their sum and move inward deterministically in O(n) time and O(1) space."*

### Bước 4: Think Out Loud (Thuyết minh khi gõ code)
> *"First, I add a guard clause checking if the input is a valid array with at least two elements.*  
> *Next, I initialize two pointers: `left` at zero and `right` at `numbers.length - 1`.*  
> *Inside the `while (left < right)` loop, I compute `sum = numbers[left] + numbers[right]`.*  
> *If `sum` equals `target`, I return `[left + 1, right + 1]` according to the 1-based indexing rule.*  
> *If `sum` is less than `target`, we need a larger sum, so I increment `left`.*  
> *Otherwise, if `sum` is greater, I decrement `right` to reduce the total."*

### Bước 5: Dry Run (Chạy thử bằng miệng với ví dụ)
> *"Let's dry run with `numbers = [2, 7, 11, 15]` and `target = 9`:*  
> *- Initially, `left` points to 2 and `right` points to 15. The sum is 17, which is greater than 9. We decrement `right`.*  
> *- Now `right` points to 11. Sum is 2 + 11 = 13 > 9. We decrement `right` again.*  
> *- Now `right` points to 7. Sum is 2 + 7 = 9, which matches our target! We return `[1, 2]`. It works accurately."*

### Bước 6: Complexity Conclusion (Chốt độ phức tạp)
> *"For complexity:*  
> *- **Time Complexity:** O(n), because in each iteration at least one pointer moves inward, visiting each element at most once.*  
> *- **Auxiliary Space Complexity:** O(1), as we only use two pointer variables without any additional data structures."*

---

## 5. Pattern Synthesis: Bước Đệm Trực Tiếp Cho Bài Medium "3Sum"

Tại sao bài toán này lại là "bài Easy được yêu thích nhất" trong các kỳ thi kỹ thuật?

Bởi vì bài toán **3Sum (LeetCode #15)** thực chất chỉ là:
1. Sắp xếp mảng ban đầu: `nums.sort((a, b) => a - b)`.
2. Dùng 1 vòng lặp cố định phần tử thứ nhất: `nums[i]`.
3. Biến phần còn lại `nums[i + 1 ... n - 1]` thành chính bài toán **Two Sum II** này với `target = -nums[i]`!

```text
[3Sum] = 1 vòng for cố định nums[i]  +  Two Sum II trên phần còn lại
```
Nắm vững cách điều khiển 2 con trỏ hôm nay giúp bạn viết bài 3Sum chỉ trong vòng 10 phút mà không gặp bất kỳ lỗi lặp vô tận hay trùng lặp phần tử nào.

