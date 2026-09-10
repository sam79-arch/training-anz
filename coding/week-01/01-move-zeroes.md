# Bài 01: Move Zeroes (Dồn các số 0 về cuối)

- **Độ khó:** Easy (Cốt lõi cho cụm bài Two Pointers)
- **LeetCode:** [#283 Move Zeroes](https://leetcode.com/problems/move-zeroes/)
- **Pattern:** Hai con trỏ Đọc/Ghi tại chỗ (In-place Read/Write Pointers)
- **Mục tiêu:** $O(n)$ Time Complexity | $O(1)$ Auxiliary Space Complexity

---

## 1. Problem Scenario (Bối cảnh thực tế Ngân hàng)
Trong hệ thống Data Platform xử lý giao dịch theo lô (batch processing) của ANZ:
Bạn nhận được một danh sách chứa mã trạng thái hoặc giá trị tiền tệ của hàng triệu bản ghi giao dịch (`nums`). Trong đó, giá trị `0` đại diện cho các bản ghi "chưa xác thực / tạm giữ" (pending/unprocessed) cần được dồn về cuối batch để ưu tiên xử lý tức thời các giao dịch hợp lệ trước.

**Ràng buộc ngặt nghèo:**
- Phải giữ nguyên **thứ tự tương đối** của các giao dịch hợp lệ (không được xáo trộn).
- Phải thực hiện **in-place** (trên chính mảng bộ nhớ ban đầu), không được cấp phát thêm một mảng phụ để tránh gây tràn RAM khi batch có dung lượng lớn.

---

## 2. Pain Point (Điểm nghẽn & Bẫy hiệu năng)

### Bẫy 1: Dùng `filter()` hoặc tạo mảng mới (Không đạt yêu cầu in-place)
```javascript
// Tốn O(n) thêm bộ nhớ
const nonZeroes = nums.filter(x => x !== 0);
const zeroes = new Array(nums.length - nonZeroes.length).fill(0);
return [...nonZeroes, ...zeroes];
```
*Hậu quả:* Người phỏng vấn ANZ sẽ loại ngay vì vi phạm yêu cầu $O(1)$ auxiliary space.

### Bẫy 2: Dùng `arr.splice()` trong vòng lặp (Bẫy $O(n^2)$ kinh điển)
```javascript
// Bẫy O(n^2) rất phổ biến trong phỏng vấn JS
for (let i = 0; i < nums.length; i++) {
  if (nums[i] === 0) {
    nums.splice(i, 1); // splice tốn O(n) để dồn các phần tử phía sau lên
    nums.push(0);
  }
}
```
*Hậu quả:* Nếu mảng có 100,000 phần tử toàn số 0, số phép toán lên tới $10^{10}$, gây timeout ngay lập tức trên HackerRank.

---

## 3. Discovery & Coding (Giải pháp Hai Con Trỏ $O(n)$ Time, $O(1)$ Space)

Sử dụng hai con trỏ:
1. `writeIndex`: Đại diện cho vị trí trống tiếp theo cần ghi giá trị khác 0 (bắt đầu từ 0).
2. `readIndex`: Duyệt từ đầu đến cuối mảng để tìm các phần tử khác 0.

Khi `nums[readIndex] !== 0`:
- Ghi giá trị vào `nums[writeIndex]`.
- Nếu `readIndex !== writeIndex`, đặt `nums[readIndex] = 0`.
- Tăng `writeIndex++`.

```javascript
function moveZeroes(nums) {
  // Guard clause
  if (!nums || !Array.isArray(nums) || nums.length <= 1) return nums;

  let writeIndex = 0;

  for (let readIndex = 0; readIndex < nums.length; readIndex++) {
    if (nums[readIndex] !== 0) {
      if (readIndex !== writeIndex) {
        nums[writeIndex] = nums[readIndex];
        nums[readIndex] = 0;
      }
      writeIndex++;
    }
  }

  return nums;
}
```

---

## 4. Open Dialogue & English Scripting (Kịch bản nói to 6 bước)

Luyện đọc to thành tiếng kịch bản này trong 15 phút mỗi sáng:

### Bước 1: Clarify (Hỏi làm rõ đề)
> *"Before jumping into the implementation, I'd like to clarify a few requirements:*
> *Can the input array be empty or null?*
> *Are the non-zero elements guaranteed to maintain their relative order?*
> *And is it strictly required to perform this in-place with O(1) auxiliary space?"*

### Bước 2: Brute-Force & Bottleneck (Nêu cách thô & chỉ ra điểm nghẽn)
> *"A naive approach would be creating a new array, filtering all non-zero elements, and appending zeroes at the end. However, that consumes O(n) auxiliary memory.*
> *Another naive approach in JavaScript is using `array.splice()` inside a loop, but `splice()` takes O(n) time per deletion, resulting in an O(n^2) overall time complexity, which is not scalable for large datasets."*

### Bước 3: Optimize (Đề xuất tối ưu)
> *"To achieve both O(n) time and O(1) space, I will use the Two Pointers technique: a Read Pointer and a Write Pointer."*

### Bước 4: Think Out Loud (Vừa gõ vừa thuyết minh)
> *"First, I add a guard clause to handle null, undefined, or arrays with 1 element.*
> *Next, I initialize `writeIndex` at 0. Then, I iterate through the array using `readIndex`.*
> *Whenever `nums[readIndex]` is non-zero, if `readIndex` is different from `writeIndex`, I assign the non-zero value to `nums[writeIndex]` and set `nums[readIndex]` to 0.*
> *Then, I advance `writeIndex`."*

### Bước 5: Dry Run (Chạy thử bằng miệng với ví dụ cụ thể)
> *"Let's trace this logic with an example: `[0, 1, 0, 3, 12]`.*
> - *At index 0: value is 0. We skip.*
> - *At index 1: value is 1. `readIndex` is 1, `writeIndex` is 0. We write 1 to index 0 and 0 to index 1. The array becomes `[1, 0, 0, 3, 12]`, and `writeIndex` moves to 1.*
> - *At index 2: value is 0. We skip.*
> - *At index 3: value is 3. We move 3 to index 1 and put 0 at index 3. The array is `[1, 3, 0, 0, 12]`, `writeIndex` is 2.*
> - *At index 4: value is 12. We move 12 to index 2 and put 0 at index 4. The final array is `[1, 3, 12, 0, 0]`."*

### Bước 6: Conclusion (Chốt độ phức tạp)
> *"In conclusion, the time complexity is O(n) because we iterate through the array once in a single pass.*
> *The space complexity is O(1) because all modifications are done strictly in-place without allocating additional memory."*

---

## 5. Pattern Synthesis (Đúc kết quy luật)
> 💡 **Core Rule:**  
> **"Khi cần tái sắp xếp hoặc lọc phần tử trong mảng tại chỗ (in-place) mà vẫn phải bảo toàn thứ tự ban đầu, luôn dùng một con trỏ ĐỌC (`readIndex`) và một con trỏ GHI (`writeIndex`)."**  
> *(Quy luật này là tiền đề trực tiếp để giải các bài Medium: Remove Duplicates from Sorted Array II, Container With Most Water, và 3Sum).*

