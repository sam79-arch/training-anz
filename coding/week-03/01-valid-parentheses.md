# 📝 Hướng Dẫn Giải Thuật: Valid Parentheses (Week 3 Day 1)

> **Mục tiêu phỏng vấn ANZ:** Làm chủ cấu trúc dữ liệu Ngăn xếp (Stack - LIFO), kỹ thuật ánh xạ ngoặc bằng `Map`, cơ chế Guard Clause early exit trong $O(1)$, và tự tin thuyết trình bằng tiếng Anh theo kịch bản 6 bước trong bối cảnh tiền kiểm định gói tin giao dịch tài chính ISO 20022.

---

## 🧭 1. Tóm Tắt Đề Bài & Thách Thức Kỹ Thuật

### Valid Parentheses (LeetCode #20 - Easy)
* **Đề bài:** Cho một chuỗi `s` chỉ chứa các ký tự `'('`, `')'`, `'{'`, `'}'`, `'['` và `']'`. Xác định xem chuỗi đầu vào có hợp lệ hay không.
* **Điều kiện hợp lệ:**
  1. Các ngoặc mở phải được đóng bởi cùng loại ngoặc (`'('` đóng với `')'`, `'{'` đóng với `'}'`, `'['` đóng với `']'`).
  2. Các ngoặc mở phải được đóng theo đúng thứ tự (LIFO - Last In First Out).
  3. Mỗi ngoặc đóng phải có một ngoặc mở tương ứng đã xuất hiện trước đó.
* **Cách tiếp cận ngây thơ (Naive / Brute-Force):**
  - Liên tục tìm và thay thế chuỗi con `"()"`, `"{}"`, `"[]"` bằng chuỗi rỗng `""` bằng `s.replace()` cho đến khi không còn cặp ngoặc nào.
  - *Nhược điểm chí mạng:* Mỗi lần `replace()` duyệt lại chuỗi và tạo string mới, độ phức tạp thời gian lên tới $O(n^2)$. Trên chuỗi 100,000 ký tự sẽ gây lag hoặc timeout.
* **Cách tiếp cận tối ưu (Senior Data Platform):**
  - Sử dụng mảng JavaScript thuần làm **Stack (LIFO)**.
  - Sử dụng `Map` ánh xạ ngoặc đóng sang ngoặc mở tương ứng: `')' -> '('`, `'}' -> '{'`, `']' -> '['`.
  - Thiết lập **Guard Clause**: Nếu độ dài chuỗi lẻ (`s.length % 2 !== 0`), kết luận ngay `false` trong $O(1)$.
  - Duyệt tuyến tính qua chuỗi đúng một lần: gặp ngoặc mở thì `push()`, gặp ngoặc đóng thì `pop()` so sánh.
  - *Ưu điểm vượt trội:* Tuyến tính $O(n)$ thời gian, $O(n)$ không gian bộ nhớ.

---

## 🏦 2. Bối Cảnh Thực Tế Tại ANZ Bank

Trong kiến trúc **ANZ Core Banking & Financial Messaging Platform**:

1. **Payload Syntax Pre-Validation (Tiền kiểm định bản tin ISO 20022 / SWIFT MX):**
   - Các gói tin giao dịch thanh toán liên ngân hàng thường được bọc trong các cấu trúc thẻ lồng nhau (XML tags hoặc JSON nested objects).
   - Nếu gói tin bị cắt cụt (truncated payload) hoặc sai thứ tự đóng mở (ví dụ thẻ `<Document>` đóng trước thẻ `<GrpHdr>`), việc chuyển tiếp trực tiếp vào bộ parser chuyên dụng (như XML DOM Parser hay JSON.parse) sẽ tốn rất nhiều chu kỳ CPU và có nguy cơ gây Crash Worker Process.
   - Một hàm kiểm tra ngoặc/thẻ siêu nhẹ $O(n)$ đóng vai trò là "chốt chặn đầu nguồn" (API Gateway Gatekeeper), loại bỏ 100% các payload hỏng chỉ trong vài mili-giây.

2. **Early Exit for Odd-Length Payloads ($O(1)$ Rejection):**
   - Trong giao dịch tài chính, việc từ chối sớm (Fail-Fast) là nguyên tắc sống còn để bảo vệ hệ thống trước các đợt tấn công DoS hoặc traffic spike. Kiểm tra `s.length % 2 !== 0` giúp loại bỏ ngay lập tức 50% các payload lỗi mà không tốn bất kỳ chu kỳ CPU nào để duyệt chuỗi.

---

## 📊 3. Bảng So Sánh Độ Phức Tạp (Complexity Analysis)

| Thuật toán | Time Complexity | Auxiliary Space | Nhận xét từ Giám khảo ANZ |
|---|---|---|---|
| **String Replacement (`replace` loop)** | $O(n^2)$ | $O(n)$ | Kém hiệu quả. Liên tục cấp phát lại vùng nhớ string trong heap của V8 engine. |
| **Stack LIFO + Guard Clause (Tối ưu)** | **$O(n)$** | **$O(n)$** | **Chuẩn Senior**. 1 lần duyệt tuyến tính, sử dụng cấu trúc dữ liệu LIFO kinh điển, tối ưu $O(1)$ cho chuỗi độ dài lẻ. |

---

## 🎙️ 4. Kịch Bản Tiếng Anh 6 Bước (ANZ Live Coding Script)

### Step 1: Clarify (Làm rõ yêu cầu)
> *"Before diving into the code, I'd like to clarify the problem constraints. Does the input string contain only the six bracket characters, or could there be whitespace or alphanumeric characters inside? Also, how should we treat an empty string? Assuming standard bracket strings where empty is considered valid, and any invalid type should safely return false, I'll proceed with an in-place Stack-based approach."*

### Step 2: Brute-Force (Phân tích cách ngây thơ)
> *"A naive approach would be repeatedly scanning the string and replacing adjacent matching pairs like `()`, `{}`, and `[]` with an empty string until no more pairs can be found. If the resulting string is empty, it's valid. However, since string replacement creates new strings and scans repeatedly, this takes $O(n^2)$ time. For high-volume financial transaction payloads with thousands of tokens, $O(n^2)$ would degrade throughput and cause CPU spikes."*

### Step 3: Optimize (Đề xuất giải pháp tối ưu)
> *"We can achieve optimal $O(n)$ linear time using a **Stack (LIFO)** data structure.
> First, we apply an early exit guard clause: if the string length is odd, it is mathematically impossible to form complete pairs, so we return `false` in $O(1)$ time immediately.
> Next, we use a hash map to map each closing bracket to its corresponding opening bracket: `')' -> '('`, `'}' -> '{'`, and `']' -> '['`.
> As we iterate through the characters, if we encounter an opening bracket, we push it onto the stack. If we encounter a closing bracket, we pop the top element from the stack and verify whether it matches. If the stack is empty or the brackets don't match, we return `false`. Finally, the string is valid if and only if the stack is completely empty."*

### Step 4: Think Out Loud (Thuyết minh trong khi gõ code)
> *"I'll write the guard clause at line 1 to check input validity and handle odd lengths in $O(1)$.
> Then, I initialize the matching map with `')'`, `'}'`, and `']'`.
> Now, I iterate through the string with a standard loop. For each character, if `matchingPairs.has(char)`, it's a closing bracket. I pop the top element and compare it. If `top !== matchingPairs.get(char)`, I immediately return `false`.
> Otherwise, it's an opening bracket, so I push it onto `stack`.
> At the end of the loop, I return `stack.length === 0` to ensure no unclosed brackets remain."*

### Step 5: Dry Run (Chạy thử từng bước)
> *"Let's trace this with an example `s = '{[]}'`:
> - Length is 4 (even), passes guard clause.
> - Char 0: `{` is opening, push onto stack -> `stack = ['{']`.
> - Char 1: `[` is opening, push onto stack -> `stack = ['{', '[']`.
> - Char 2: `]` is closing. Top is popped -> `[`. It matches map `']'` -> `[`. Stack now `['{']`.
> - Char 3: `}` is closing. Top is popped -> `{`. It matches map `'}'` -> `{`. Stack now empty.
> - Loop finishes. `stack.length === 0` is `true`. Result is valid."*

### Step 6: Conclusion (Tổng kết độ phức tạp)
> *"In summary, the time complexity is $O(n)$ because we iterate through the string of length $n$ exactly once, performing $O(1)$ push, pop, and map lookup operations per character.
> The auxiliary space complexity is $O(n)$ in the worst case where all characters are opening brackets (e.g. `(((((`), requiring $n$ elements in the stack. This is the optimal time-space trade-off for syntax validation."*

---

## ⚠️ 5. Bẫy Thường Gặp & Điểm Cần Chú Ý Khi Phỏng Vấn

1. **Bẫy độ dài lẻ (Odd Length):**
   - Ứng viên thường quên kiểm tra `s.length % 2 !== 0` ở đầu hàm. Chỉ 1 dòng guard clause này thể hiện tư duy tối ưu hóa hiệu năng $O(1)$ của Senior Engineer.
2. **Bẫy đóng khi Stack rỗng (Empty Stack Pop):**
   - Khi gặp chuỗi bắt đầu bằng ngoặc đóng như `"]"`, `stack.pop()` sẽ trả về `undefined`. Khi so sánh `undefined !== '['`, hàm trả về `false` chính xác mà không bị crash.
3. **Bẫy sót ngoặc mở (Unclosed Open Brackets):**
   - Với chuỗi `"(()"`, sau khi duyệt xong, stack vẫn còn `['(']`. Do đó, dòng cuối cùng BẮT BUỘC là `return stack.length === 0` chứ không được trả về `true` tự do.
4. **Sử dụng `Map` thay vì `Object` thuần:**
   - Dùng `new Map([ ... ])` tuân thủ chuẩn Clean Code của repository, tránh Prototype Pollution và tối ưu lookup tốc độ cao trên V8 engine.

---

## 🎨 6. Minh Họa Trực Quan (Interactive Generative UI)

Để quan sát từng bước hoạt động của Stack (Push, Pop, Top Match, Guard Clause Exit), hãy mở mô hình trực quan tương tác tại:
👉 [docs/visualizers/w3-01-valid-parentheses.html](file:///home/samnguyen/projects/training-anz/docs/visualizers/w3-01-valid-parentheses.html)
*(Hỗ trợ giao diện High Contrast Dark Theme, State Machine Stepper, hiển thị Stack theo chiều dọc và giải thích logic thời gian thực).*
