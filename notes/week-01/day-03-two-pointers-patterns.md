# 🧭 Cẩm Nang Phân Biệt & Áp Dụng 2 Biến Thể Two Pointers (HCLTech x ANZ)

> **Mục tiêu phỏng vấn:** Nhận diện ngay biến thể Two Pointers phù hợp chỉ sau 3 giây đọc đề bài, giải thích lý do lựa chọn một cách logic và tự tin bằng tiếng Anh chuẩn Senior Backend Engineer.

---

## 🗺️ 1. Bản Đồ Tư Duy: Hai Nhánh Của Kỹ Thuật Two Pointers

Trong các bài toán mảng và chuỗi, toàn bộ kỹ thuật **Two Pointers (Hai con trỏ)** chỉ chia thành đúng **2 biến thể kinh điển**:

```text
                                KỸ THUẬT TWO POINTERS
                                          │
            ┌─────────────────────────────┴─────────────────────────────┐
            ▼                                                           ▼
     BIẾN THỂ 1: ĐỐI ĐẦU NHAU                                  BIẾN THỂ 2: CÙNG CHIỀU NHAU
(Left-Right Collision / Hai đầu mảng)                       (Fast & Slow / Read & Write)
     [ L --->             <--- R ]                                [ S, F --->      ]
            │                                                           │
   - Xuất phát: 2 cực biên đối diện                           - Xuất phát: Cùng từ đầu mảng (index 0)
   - Di chuyển: Thu hẹp khoảng cách vào giữa                  - Di chuyển: Cùng tiến về cuối mảng
   - Bản chất: Cân đo đong đếm / Bù trừ                       - Bản chất: Dọn dẹp in-place / Cửa sổ trượt
            │                                                           │
   • Valid Palindrome (#125)                                  • Move Zeroes (#283)
   • Two Sum II - Sorted (#167)                               • Remove Duplicates (#26)
   • 3Sum (#15)                                               • Longest Substring (Sliding Window)
   • Container With Most Water (#11)                          • Linked List Cycle (Tortoise & Hare)
```

---

## 🚦 2. Bảng Tín Hiệu Phán Quyết 3 Giây (Signal Matrix)

Khi đọc đề bài trong phòng phỏng vấn, hãy quét nhanh các từ khóa tín hiệu để chọn ngay biến thể:

| Tiêu chí | Biến thể 1: HAI ĐẦU KẸP VÀO `[ L ---> <--- R ]` | Biến thể 2: CÙNG CHIỀU `[ Slow, Fast ---> ]` |
|---|---|---|
| **Từ khóa tín hiệu trong đề bài** | • **"Sorted"** (Mảng đã sắp xếp)<br>• **"Palindrome"** / Đối xứng<br>• Tìm **Cặp số / Bộ ba** (Pair / Triplet) có tổng/tích thỏa mãn | • **"In-place"** dồn mảng / xóa phần tử<br>• **"Subarray"** (Mảng con liên tiếp)<br>• **"Substring"** (Chuỗi con liên tiếp) |
| **Vị trí khởi tạo con trỏ** | `left = 0`, `right = length - 1` | `slow = 0`, `fast = 0` (hoặc `writeIndex`, `readIndex`) |
| **Điều kiện dừng** | `while (left < right)` (hai con trỏ va chạm nhau) | `while (fast < length)` (con trỏ nhanh chạm cuối mảng) |
| **Bản chất tư duy** | **Cân bập bênh (Bù trừ):** Phối hợp giữa phần tử nhỏ nhất và phần tử lớn nhất để tiến dần đến mục tiêu. | **Thám thính & Giữ chỗ:** 1 con trỏ chạy trước dò tìm phần tử hợp lệ, 1 con trỏ chạy sau để ghi đè. |

---

## 🧠 3. Hai Câu Hỏi Tự Vấn (Decision Tree)

Khi vừa đọc xong đề bài, tự hỏi bản thân 2 câu hỏi sau để đưa ra quyết định chính xác 100%:

### ❓ Câu hỏi 1: *"Đề bài có tính chất ĐỐI XỨNG hoặc mảng ĐÃ SẮP XẾP không?"*
* 👉 **NẾU CÓ $\rightarrow$ CHỌN BIẾN THỂ 1 (HAI ĐẦU KẸP VÀO):**
  * **Tại sao?** Vì mảng đã sắp xếp thì phần tử nhỏ nhất ở cực trái, phần tử lớn nhất ở cực phải. Bạn có cơ sở toán học vững chắc để loại trừ:
    * Nếu tổng đang thiếu (`sum < target`) $\rightarrow$ chắc chắn tăng `left++`.
    * Nếu tổng đang thừa (`sum > target`) $\rightarrow$ chắc chắn giảm `right--`.
  * **Ví dụ thực tế:** [Two Sum II](file:///home/samnguyen/projects/training-anz/coding/week-01/03-two-sum-sorted.md), [Valid Palindrome](file:///home/samnguyen/projects/training-anz/coding/week-01/02-valid-palindrome.md), 3Sum.

### ❓ Câu hỏi 2: *"Đề bài có yêu cầu DỌN DẸP / GHI ĐÈ in-place hoặc theo dõi ĐOẠN LIÊN TIẾP không?"*
* 👉 **NẾU CÓ $\rightarrow$ CHỌN BIẾN THỂ 2 (CÙNG CHIỀU NHAU):**
  * **Tại sao?** Vì bạn cần quét qua toàn bộ dữ liệu một lượt, lọc ra các phần tử thỏa mãn và dồn về đầu mảng mà không được cấp phát mảng phụ.
  * **Ví dụ thực tế:** [Move Zeroes](file:///home/samnguyen/projects/training-anz/coding/week-01/01-move-zeroes.md), Remove Duplicates from Sorted Array.

---

## 🔬 4. Phân Tích Thực Chiến Với Các Bài Toán ANZ Hay Ra

### Trường Hợp A: "Container With Most Water" (LeetCode #11)
* **Đề bài:** Cho mảng độ cao các cột, tìm 2 cột tạo thành bể chứa được nhiều nước nhất.
* **Tín hiệu:** Bể chứa nước tạo bởi 2 vách. Muốn diện tích đáy rộng nhất thì phải bắt đầu từ 2 vách xa nhau nhất ở 2 đầu!
* **Chọn:** **Hai đầu kẹp vào** (`left = 0`, `right = n - 1`). Cột nào thấp hơn thì chắc chắn không thể tạo thành bể lớn hơn nữa $\rightarrow$ loại bỏ cột thấp hơn bằng cách dịch con trỏ của cột đó vào trong.

### Trường Hợp B: "Remove Duplicates from Sorted Array" (LeetCode #26)
* **Đề bài:** Cho mảng đã sắp xếp, xóa các phần tử trùng lặp in-place sao cho mỗi số chỉ xuất hiện 1 lần.
* **Tín hiệu:** Có chữ **"in-place"**, **"xóa / dọn dẹp"**.
* **Chọn:** **Cùng chiều** (`writeIndex = 1`, `readIndex = 1`). `readIndex` quét tìm số mới khác số trước đó, tìm thấy thì ghi đè vào `numbers[writeIndex]` rồi tăng `writeIndex++`.

### Trường Hợp C: "3Sum" (LeetCode #15)
* **Đề bài:** Tìm tất cả các bộ 3 số `[a, b, c]` có tổng bằng `0`.
* **Tín hiệu:** Cần tìm bộ 3 số thỏa mãn tổng $\rightarrow$ Sắp xếp mảng trước, sau đó với mỗi `nums[i]`, bài toán trở thành tìm cặp 2 số có tổng bằng `-nums[i]`.
* **Chọn:** **Hai đầu kẹp vào** chạy trên đoạn `nums[i + 1 ... n - 1]`.

---

## 🗣️ 5. Kịch Bản Tiếng Anh Mở Đầu Ghi Điểm Với ANZ Interviewer

Khi bắt đầu giải thích hướng tiếp cận, hãy dùng mẫu câu sau để thể hiện tư duy thiết kế giải thuật:

### Khi chọn Biến Thể Hai Đầu Kẹp Vào (Left-Right Collision):
> *"Since the array is sorted (or has symmetric properties), this problem naturally maps to the **Left-Right Collision variant of Two Pointers**.  
> I will place one pointer at index 0 and another at the end of the array. This allows us to evaluate the balance between the minimum and maximum values and move inward deterministically in O(n) time and O(1) space."*

### Khi chọn Biến Thể Cùng Chiều (Fast & Slow / Read-Write):
> *"Because we need to modify the array in-place without auxiliary memory, this problem is a textbook use case for the **Same-Direction Two Pointers pattern (Fast and Slow pointers)**.  
> The fast pointer will scan through the array to detect valid elements, while the slow pointer maintains the boundary of our compacted in-place result."*
