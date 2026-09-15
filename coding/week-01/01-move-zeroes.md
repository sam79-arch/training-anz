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

Sử dụng hai con trỏ theo tư duy "Chuyển chỗ ngồi":
1. `writeIndex` (Con trỏ GHI): Vị trí ghế trống ở ĐẦU mảng, sẵn sàng đón phần tử khác 0 tiếp theo (bắt đầu từ 0).
2. `readIndex` (Con trỏ ĐỌC): Quét qua từng phần tử của mảng để tìm các phần tử khác 0.

Khi `nums[readIndex] !== 0`:
- Chuyển giá trị vào ghế đầu: `nums[writeIndex] = nums[readIndex]`.
- Nếu `readIndex !== writeIndex`, dọn chỗ cũ thành số 0: `nums[readIndex] = 0`.
- Tăng con trỏ ghi lên 1 nấc: `writeIndex++`.

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

## 4. Open Dialogue & English Scripting (Kịch bản nói to 6 bước - Thân thiện & Tự nhiên)

Luyện đọc to thành tiếng kịch bản này trong 15 phút mỗi sáng (phong cách đối thoại tự nhiên, câu ngắn, dễ nhớ):

### Bước 1: Clarify (Hỏi nhanh vài ý trước khi gõ)
> *"Before I start, let me confirm a few quick things:*  
> *Can the input be empty or null?*  
> *And should we keep the same order for the other numbers?*  
> *Got it! And I will modify the array directly without creating a new one, right?"*

### Bước 2: Brute-Force (Nêu cách đơn giản và điểm nghẽn)
> *"The simplest way is just creating a new array and filtering out the zeros. But that takes extra memory.*  
> *Another way is using `splice()`, but it's way too slow for large data because it shifts elements every time.*  
> *So neither is good for production."*

### Bước 3: Optimize (Chốt giải pháp ngắn gọn)
> *"So to make it fast and save memory, I'll use two pointers: `readIndex` to scan the array for non-zero numbers, and `writeIndex` to place them at the front."*

### Bước 4: Think Out Loud (Vừa gõ vừa thuyết minh câu ngắn)
> *"First, let's add a quick guard clause for invalid or small inputs.*  
> *Now, I initialize `writeIndex` at 0.*  
> *Let's loop through the array with `readIndex`.*  
> *Whenever we see a non-zero number, we write it to `nums[writeIndex]`, clear the old spot to 0, and advance `writeIndex`.*  
> *And finally, return the modified array."*

### Bước 5: Dry Run (Chạy thử bằng miệng với ví dụ ngắn)
> *"Let's trace with `[0, 1, 0, 3]` to make sure it works:*  
> *- At index 0: it's 0, so skip.*  
> *- At index 1: it's 1. We move 1 to writeIndex 0, and put 0 back. The array is now `[1, 0, 0, 3]`.*  
> *- At index 2: it's 0, skip.*  
> *- At index 3: it's 3. Move 3 into writeIndex 1. Now we get `[1, 3, 0, 0]`.*  
> *Looks good and clean!"*

### Bước 6: Conclusion (Chốt độ phức tạp súc tích)
> *"To wrap up:*  
> *Time complexity is O(n) because we only scan the array once.*  
> *Space complexity is O(1) because everything is done in-place."*

---

## 5. Pattern Synthesis (Đúc kết quy luật)
> 💡 **Core Rule:**  
> **"Khi cần tái sắp xếp hoặc lọc phần tử trong mảng tại chỗ (in-place) mà vẫn phải bảo toàn thứ tự ban đầu, luôn dùng một con trỏ ĐỌC (`readIndex`) và một con trỏ GHI (`writeIndex`)."**  
> *(Quy luật này là tiền đề trực tiếp để giải các bài Medium: Remove Duplicates from Sorted Array II, Container With Most Water, và 3Sum).*

