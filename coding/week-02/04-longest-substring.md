# 📝 Hướng Dẫn Giải Thuật: Longest Substring Without Repeating Characters (Week 2 Day 4)

> **Mục tiêu phỏng vấn ANZ:** Làm chủ kỹ thuật **Cửa sổ trượt linh hoạt (Dynamic-size Sliding Window)** kết hợp **Hash Map** để tìm chuỗi con dài nhất không trùng lặp trong $O(n)$ time và $O(\min(m, n))$ auxiliary space, giải thích cơ chế tránh bẫy nhảy lùi con trỏ (Backward Jump Trap) và tự tin thuyết trình bằng tiếng Anh chuẩn 6 bước.

---

## 🧭 1. Tóm Tắt Đề Bài & Điểm Nghẽn Kỹ Thuật (The Bottleneck)

* **Đề bài:** Cho chuỗi ký tự `s`. Tìm độ dài lớn nhất của một chuỗi con liên tục (substring) mà trong đó không có ký tự nào bị lặp lại.
* **Ví dụ:**
  - `s = "abcabcbb"` $\rightarrow$ Độ dài = `3` (`"abc"`).
  - `s = "bbbbb"` $\rightarrow$ Độ dài = `1` (`"b"`).
  - `s = "pwwkew"` $\rightarrow$ Độ dài = `3` (`"wke"`, lưu ý `"pwke"` là subsequence chứ không phải substring).
* **Điểm nghẽn của cách Brute-force ($O(n^3)$ hoặc $O(n^2)$):**
  - Sinh tất cả các cặp chỉ mục $[i, j]$ có $O(n^2)$ chuỗi con. Với mỗi chuỗi con, kiểm tra trùng lặp tốn $O(n)$ $\rightarrow O(n^3)$.
  - Dù dùng Set kiểm tra trong lúc mở rộng chuỗi con, tổng số bước vẫn là $O(n^2)$. Với $n = 50,000$, số phép tính lên tới $1.25 \times 10^9 \rightarrow$ **Gây Time Limit Exceeded (TLE) ngay lập tức!**
* **Tại sao Cửa Sổ Trượt (Sliding Window) là tối ưu?**
  - Chuỗi con hợp lệ là một đoạn liên tục $[L, R]$.
  - Khi mở rộng $R$ sang phải, nếu gặp ký tự trùng lặp với một ký tự đã có trong cửa sổ, ta không cần phải reset $R$ về đầu hay xét lại từ đầu. Ta chỉ cần **co biên trái $L$** vượt qua vị trí xuất hiện trước đó của ký tự bị trùng.
  - Nhờ đó, cả $L$ và $R$ đều chỉ di chuyển tịnh tiến từ trái sang phải $\rightarrow$ Đạt độ phức tạp tuyến tính $O(n)$!

---

## 🔬 2. Bẫy Sống Còn: Nhảy Lùi Con Trỏ Trái (The Backward-Jump Trap)

Một câu hỏi phỏng vấn phân loại Senior tại ANZ:
> *"Tại sao ta phải dùng `left = Math.max(left, lastSeenIndex + 1)` thay vì chỉ gán `left = lastSeenIndex + 1`?"*

### 💡 Phân tích bẫy với chuỗi `"abba"`:
1. **Bước 1 ($R = 0$):** Ký tự `'a'`, `Map = { 'a': 0 }`, `L = 0`, cửa sổ `[0, 0]` (`"a"`), max = 1.
2. **Bước 2 ($R = 1$):** Ký tự `'b'`, `Map = { 'a': 0, 'b': 1 }`, `L = 0`, cửa sổ `[0, 1]` (`"ab"`), max = 2.
3. **Bước 3 ($R = 2$):** Ký tự `'b'` trùng lặp!
   - Ký tự `'b'` xuất hiện gần nhất tại index 1.
   - Biên trái dịch: $L = \text{lastSeen}('b') + 1 = 1 + 1 = 2$.
   - Cập nhật `Map = { 'a': 0, 'b': 2 }`, cửa sổ `[2, 2]` (`"b"`), max = 2.
4. **Bước 4 ($R = 3$):** Ký tự `'a'`!
   - Trong `Map`, ký tự `'a'` có chỉ mục cũ là $0$.
   - **Nếu ta gán ngây thơ:** $L = \text{lastSeen}('a') + 1 = 0 + 1 = 1$.
   - 💥 **LỖI NGHIÊM TRỌNG:** Con trỏ $L$ đang ở $2$ lại bị **nhảy lùi về 1**! Cửa sổ lúc này trở thành $[1, 3]$ là chuỗi `"bba"` chứa ký tự `'b'` bị lặp lại!
5. **Khắc phục triệt để bằng `Math.max`:**
   $$L = \max(L, \text{lastSeen}(\text{char}) + 1) = \max(2, 0 + 1) = 2$$
   $\implies$ Con trỏ $L$ giữ nguyên tại $2$, cửa sổ hợp lệ $[2, 3]$ là `"ba"`, độ dài 2.

---

## 🏦 3. Bối Cảnh Thực Tế Tại ANZ Bank: Sliding Session Token Validation

Trong hệ thống **Real-Time Payment Processing & API Gateway** tại ANZ:
* **Bối cảnh:** Khi người dùng gửi một chuỗi liên tục các Request Payload mang theo Transaction Signature / Client Nonce. Để ngăn chặn tấn công phát lại (Replay Attacks) và đánh cắp phiên (Session Hijacking), API Gateway kiểm tra tính độc nhất của chuỗi signature trong một cửa sổ trượt.
* **Yêu cầu:** Tìm chuỗi các giao dịch liên tiếp dài nhất mà không có bất kỳ Nonce hoặc Device Fingerprint nào bị lặp lại.
* **Tác động hiệu năng:** Nếu dùng duyệt lồng nhau $O(n^2)$, API Gateway sẽ nghẽn luồng xử lý I/O của Node.js, gây sụt giảm TPS (Transactions Per Second) và tăng độ trễ mạng. Thuật toán Single-Pass Sliding Window $O(n)$ xử lý 50,000 transaction events chỉ trong chưa đầy **5 mili-giây**!

---

## 🎙️ 4. Kịch Bản Tiếng Anh 6 Bước (ANZ Live Coding Script)

### Step 1: Clarify (Làm rõ yêu cầu)
> *"Before implementing, I'd like to clarify the constraints. Can the input string be null, undefined, or empty? Does the string contain only English alphabets, or can it include digits, spaces, and special symbols? Can we assume standard ASCII characters? In our case, handling arbitrary ASCII characters including whitespaces with an optimal sliding window approach is ideal."*

### Step 2: Brute-Force (Phân tích cách ngây thơ)
> *"A brute-force approach would generate all possible substrings using two nested loops and check each substring for duplicates using a Set. Generating all substrings takes O(n^2), and verifying each takes O(n), resulting in an O(n^3) time complexity. For an input of 50,000 characters, this results in over a billion operations, which immediately causes a Time Limit Exceeded error."*

### Step 3: Optimize (Đề xuất giải pháp tối ưu)
> *"To optimize to O(n) time, we can use the Dynamic Sliding Window pattern with two pointers: left and right. Instead of moving the left pointer step-by-step and removing characters from a Set (which takes 2n operations), we store each character's most recent index in a native Hash Map. When a duplicate character is encountered, the left pointer jumps directly past the previous occurrence: `left = Math.max(left, charMap.get(char) + 1)`. The `Math.max` ensures the left pointer never moves backward."*

### Step 4: Think Out Loud (Thuyết minh khi viết mã)
> *"I'll start with a guard clause on line 1 to check if `s` is valid and return 0 for non-strings. If the length is less than or equal to 1, I return `s.length` immediately.  
> Next, I initialize `maxLength = 0`, `left = 0`, and a `charIndexMap = new Map()`.  
> In the loop, `right` iterates from 0 to `s.length - 1`. If the character exists in our map, we update `left` using `Math.max` with `lastSeen + 1`.  
> Then we update the map with the current index `right`, calculate the current window length as `right - left + 1`, and update `maxLength` accordingly."*

### Step 5: Dry Run (Chạy thử từng bước)
> *"Let's trace `s = 'abba'`.  
> - At index 0 ('a'): map stores 'a' -> 0, window is [0, 0], length = 1.  
> - At index 1 ('b'): map stores 'b' -> 1, window is [0, 1], length = 2.  
> - At index 2 ('b'): duplicate 'b' detected! last seen at 1. `left = Math.max(0, 1 + 1) = 2`. Map updates 'b' -> 2, window is [2, 2], length = 1.  
> - At index 3 ('a'): 'a' is in map at 0. `left = Math.max(2, 0 + 1) = 2`. The left pointer stays at 2 and avoids jumping back! Window is [2, 3], length = 2.  
> The maximum length found is 2, which is correct."*

### Step 6: Conclusion (Chốt độ phức tạp)
> *"The time complexity is strictly O(n) because the right pointer traverses the string exactly once in a single pass, and each lookup/update in the Map takes O(1) time. The auxiliary space complexity is O(min(m, n)), where m is the size of the character set (at most 128 for standard ASCII) and n is the length of the string."*

---

## 🖥️ 5. Trực Quan Hóa Tương Tác (Generative UI)

Để rèn luyện tư duy quan sát biên cửa sổ trượt $L$ và $R$ dãn nở và co cụm theo thời gian thực:
- Mở bộ mô phỏng trực tiếp tại: **[`docs/visualizers/w2-04-longest-substring.html`](file:///home/samnguyen/projects/training-anz/docs/visualizers/w2-04-longest-substring.html)**.

