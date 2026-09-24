# Bài 02: Valid Palindrome (Chuỗi đối xứng)

- **Độ khó:** Easy (Cốt lõi cho dạng Two Pointers Đối Đầu)
- **LeetCode:** [#125 Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
- **Pattern:** Hai con trỏ đối đầu (Left-Right Collision)
- **Mục tiêu:** $O(n)$ Time Complexity | $O(1)$ Auxiliary Space Complexity

---

## 1. Problem Scenario (Bối cảnh thực tế Ngân hàng)
Trong luồng xử lý Transaction Stream của ANZ:
Mỗi giao dịch ngân hàng trước khi được ghi vào Ledger phân tán đều đi kèm một chuỗi kiểm tra toàn vẹn (**Checksum / Transaction Hash**). Một số thuật toán nén và xác thực bảo mật tài chính yêu cầu kiểm tra tính đối xứng (palindrome) của các chuỗi hash có độ dài hàng trăm nghìn ký tự.

**Ràng buộc ngặt nghèo của hệ thống tài chính:**
- Không phân biệt chữ hoa, chữ thường.
- Bỏ qua toàn bộ các ký tự không phải chữ và số (dấu gạch ngang, dấu hai chấm, khoảng trắng, dấu phẩy).
- **Tuyệt đối không được tạo chuỗi mới hay mảng đảo ngược trong bộ nhớ RAM** vì hàng triệu giao dịch mỗi giây sẽ làm sập bộ thu gom rác (V8 Garbage Collector) của Node.js.

---

## 2. Pain Point (Điểm nghẽn & Bẫy hiệu năng)

### ❌ Bẫy 1: Dùng Regex toàn cục và chuỗi đảo ngược (Cực kỳ tốn RAM)
```javascript
function isPalindromeNaive(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversed = cleaned.split('').reverse().join('');
  return cleaned === reversed;
}
```
* **Hậu quả phỏng vấn ANZ:**
  1. `replace(...)`: Tạo ra 1 chuỗi mới trong heap.
  2. `split('')`: Cấp phát 1 mảng mới gồm $n$ phần tử.
  3. `reverse()` & `join('')`: Tạo thêm 1 mảng đảo ngược và 1 chuỗi mới.
  👉 **Tốn tới $3 \times O(n)$ dung lượng RAM phụ!** Khi gặp chuỗi checksum $100,000$ ký tự, V8 Engine phải kích hoạt Stop-The-World Garbage Collection, làm đóng băng toàn bộ Event Loop của Node.js.

---

## 3. Discovery & Coding (Giải pháp Hai Con Trỏ Đối Đầu $O(n)$ Time, $O(1)$ Space)

Sử dụng hai con trỏ di chuyển ngược chiều nhau từ 2 đầu:
1. `left`: Bắt đầu từ đầu chuỗi (`0`), tăng dần về phía phải.
2. `right`: Bắt đầu từ cuối chuỗi (`s.length - 1`), giảm dần về phía trái.

Ở mỗi bước:
- Nếu `s[left]` không phải chữ/số $\rightarrow$ tăng `left++`.
- Nếu `s[right]` không phải chữ/số $\rightarrow$ giảm `right--`.
- Khi cả hai đều là ký tự hợp lệ: So sánh không phân biệt hoa thường. Nếu khác nhau $\rightarrow$ `return false` (Fail-Fast).
- Nếu giống nhau $\rightarrow$ thu hẹp khoảng cách: `left++`, `right--`.

```javascript
function isAlphanumeric(char) {
  const c = char.toLowerCase();
  return (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9');
}

function isPalindrome(s) {
  if (typeof s !== 'string') return false;
  if (s.length <= 1) return true;

  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    while (left < right && !isAlphanumeric(s[left])) left++;
    while (left < right && !isAlphanumeric(s[right])) right--;

    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}
```

---

## 4. Open Dialogue & English Scripting (Kịch bản nói to 6 bước)

Luyện tập đọc to thành tiếng theo khung chuẩn ANZ:

### Bước 1: Clarify (Làm rõ yêu cầu)
> *"Before implementing, let me clarify a few points:*  
> *Should we consider case sensitivity, or are 'A' and 'a' treated as equal?*  
> *And how should we handle non-alphanumeric characters like punctuation and whitespace?*  
> *Got it! So we ignore special characters, treat it case-insensitively, and solve it in-place without creating extra strings."*

### Bước 2: Brute-Force (Nêu cách đơn giản và chỉ ra điểm nghẽn)
> *"The naive approach is to use a regular expression to strip special characters, and then reverse the string using `split().reverse().join()`.  
> However, this creates multiple new strings and arrays in the heap, requiring O(n) auxiliary memory. In a high-throughput banking system, this puts unnecessary pressure on the V8 garbage collector."*

### Bước 3: Optimize (Chốt giải pháp tối ưu)
> *"To achieve O(1) auxiliary space, I will use Two Pointers: `left` starting from the beginning and `right` starting from the end. They will move inward toward each other."*

### Bước 4: Think Out Loud (Thuyết minh trong khi gõ code)
> *"First, I add a guard clause for input validation.*  
> *Next, I implement an `isAlphanumeric` helper using ASCII character codes to avoid regex allocation overhead.*  
> *Then, I initialize `left` at 0 and `right` at the last index.*  
> *In the while loop, we skip any non-alphanumeric characters.*  
> *When both pointers land on valid characters, we compare their lowercase values. If they don't match, we return false immediately.*  
> *Otherwise, we increment `left` and decrement `right` until they meet."*

### Bước 5: Dry Run (Chạy thử bằng miệng)
> *"Let's trace with a simple example: `'Was it a car or a cat I saw?'`*  
> *- `left` starts at 'W', `right` starts at '?' (special char, so right moves to 'w').*  
> *- Compare 'w' and 'w': they match!*  
> *- Move inward and repeat. Every pair matches until the pointers cross.*  
> *- The function returns true as expected."*

### Bước 6: Conclusion (Chốt độ phức tạp)
> *"To conclude:*  
> *- **Time Complexity:** O(n), since each character is visited at most twice.*  
> *- **Auxiliary Space Complexity:** O(1), because we only store two pointer indices and use zero heap allocations."*

---

## 5. Pattern Synthesis (Đúc kết quy luật)
> 💡 **Core Rule:**  
> **"Dạng bài Two Pointers Đối Đầu (Left-Right Collision) luôn được áp dụng khi cần so sánh tính đối xứng hoặc tìm cặp giá trị ở hai đầu mảng/chuỗi. Luôn dùng mã ASCII thay vì Regex để giữ trọn vẹn $O(1)$ Space."**  
> *(Đây là bước đệm trực tiếp để giải bài Medium tiếp theo trong Week 1: Two Sum II trên mảng đã sắp xếp).*

---

## 🎨 6. Bảng Mô Phỏng Trực Quan Tương Tác (Interactive Visualizer)

> 🔗 **File mô phỏng độc lập (Lưu vĩnh viễn trong Repo):**  
> [`docs/visualizers/w1-02-valid-palindrome.html`](file:///home/samnguyen/projects/training-anz/docs/visualizers/w1-02-valid-palindrome.html)  
> *Bạn có thể click đúp vào file trên để mở trực tiếp trên trình duyệt (Chrome/Edge/Safari/Firefox) bất kỳ lúc nào để xem mô phỏng 2 con trỏ kẹp hai đầu và bỏ qua ký tự đặc biệt.*


