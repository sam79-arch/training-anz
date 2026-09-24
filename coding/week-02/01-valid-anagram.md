# 📝 Hướng Dẫn Giải Thuật: Valid Anagram & Group Anagrams (Week 2 Day 1)

> **Mục tiêu phỏng vấn ANZ:** Làm chủ kỹ thuật Frequency Hashing (băm theo tần suất), nâng cấp từ bài Easy (#242) lên bài Medium (#49), và tự tin thuyết trình bằng tiếng Anh với tư duy tối ưu $O(N \cdot K)$ thay vì sorting $O(N \cdot K \log K)$.

---

## 🧭 1. Tóm Tắt Đề Bài & Thách Thức Kỹ Thuật

### Bài 1: Valid Anagram (LeetCode #242)
* **Đề bài:** Cho 2 chuỗi `s` và `t`. Xác định `t` có phải là đảo chữ (anagram) của `s` không.
* **Cách tiếp cận ngây thơ (Naive):** Sắp xếp cả 2 chuỗi (`s.split('').sort().join('')`) rồi so sánh bằng nhau.
  - *Nhược điểm:* Tốn $O(n \log n)$ thời gian và cấp phát thêm bộ nhớ phụ cho mảng ký tự.
* **Cách tối ưu:** Dùng mảng cố định 26 ký tự tiếng Anh (`new Array(26).fill(0)`). Tăng biến đếm với `s` và giảm biến đếm với `t`. Nếu kết thúc mảng toàn số 0 $\rightarrow$ `true`.
  - *Ưu điểm:* $O(n)$ thời gian, $O(1)$ không gian bộ nhớ (chỉ 26 integers).

### Bài 2: Group Anagrams (LeetCode #49 - Medium)
* **Đề bài:** Cho một mảng `strs`, hãy gom nhóm các chuỗi là anagram của nhau vào từng mảng con.
* **Cách tiếp cận thường gặp:** Với mỗi chuỗi, sort các ký tự theo bảng chữ cái để làm Key (vd: `"eat"` $\rightarrow$ `"aet"`).
  - *Nhược điểm:* Với mỗi chuỗi độ dài $K$, sort tốn $O(K \log K)$. Tổng thời gian là $O(N \cdot K \log K)$.
* **Cách tiếp cận Senior ANZ (Data Platform):** Dùng **Frequency Signature Key** dạng `#1#0#2...#0` (đếm số lần xuất hiện của 26 chữ cái).
  - *Ưu điểm vượt trội:* Tạo key chỉ tốn $O(K)$ tuyến tính. Tổng thời gian giảm xuống $O(N \cdot K)$.

---

## 🏦 2. Bối Cảnh Thực Tế Tại ANZ Bank

Trong hệ thống **ANZ Data Platform & Fraud Detection**:
1. **Transaction Pattern Signature Grouping (Gom nhóm định dạng giao dịch):**
   - Các giao dịch tài chính bất thường từ cùng một nguồn thường có cùng tập hợp các trường dữ liệu hoặc chữ ký ký tự bị xáo trộn vị trí.
   - Thuật toán gom nhóm theo tần suất giúp hệ thống gom hàng triệu bản ghi nhật ký (logs) có cùng "chữ ký bất biến" vào cùng một cụm phân tích trong thời gian thực.
2. **Payload Sanitization & Normalization (Chuẩn hóa dữ liệu):**
   - Trước khi đưa vào pipeline Kafka, hệ thống cần kiểm tra tính tương đương của các payload giao dịch mà không tốn chi phí CPU cho việc sắp xếp chuỗi nặng nề.

---

## 📊 3. Bảng So Sánh Độ Phức Tạp (Complexity Analysis)

| Thuật toán | Time Complexity | Auxiliary Space | Nhận xét từ Giám khảo ANZ |
|---|---|---|---|
| **Valid Anagram (Sort approach)** | $O(n \log n)$ | $O(n)$ | Tốn tài nguyên CPU, không tối ưu cho chuỗi dài. |
| **Valid Anagram (Frequency Array)** | **$O(n)$** | **$O(1)$** | Tối ưu tuyệt đối. Mảng 26 số nguyên nằm trọn trong L1 CPU Cache. |
| **Group Anagrams (Sorted Key)** | $O(N \cdot K \log K)$ | $O(N \cdot K)$ | Đạt yêu cầu cơ bản, nhưng chưa thể hiện tư duy Senior. |
| **Group Anagrams (Frequency Key)** | **$O(N \cdot K)$** | **$O(N \cdot K)$** | **Chuẩn Senior Data Platform**. Tiết kiệm hàng tỷ phép so sánh khi $K$ lớn. |

---

## 🎙️ 4. Kịch Bản Tiếng Anh 6 Bước (ANZ Live Coding Script)

### Step 1: Clarify (Làm rõ yêu cầu)
> *"Before writing any code, I’d like to clarify the inputs. Are both strings guaranteed to contain only lowercase English letters from 'a' to 'z'? What should we return if the strings have different lengths, or if the input array is empty? Assuming standard lowercase letters, I can optimize the space complexity to $O(1)$."*

### Step 2: Brute-Force (Phân tích cách ngây thơ)
> *"The intuitive way to solve both problems is sorting the characters. For Valid Anagram, sorting both strings takes $O(n \log n)$ time and $O(n)$ space. For Group Anagrams, sorting each string to use as a hash map key results in $O(N \cdot K \log K)$ time, where $N$ is the number of strings and $K$ is the maximum string length. In a high-throughput financial data platform, sorting millions of strings introduces unnecessary CPU overhead."*

### Step 3: Optimize (Đề xuất giải pháp tối ưu)
> *"We can eliminate the logarithmic factor completely by using **Frequency Counting**. For Valid Anagram, we can use a fixed-size integer array of length 26. We increment counts for characters in `s` and decrement for `t`. If all 26 buckets return zero, they are anagrams—achieving $O(n)$ linear time and $O(1)$ auxiliary space.*
> 
> *For Group Anagrams, instead of sorting, we generate a 26-element frequency signature delimited by hashes, such as `#1#0#2...#0`. This signature generation takes $O(K)$ time per string, reducing total time complexity to $O(N \cdot K)$."*

### Step 4: Think Out Loud (Thuyết minh trong khi gõ code)
> *"First, at line 1, I establish our mandatory guard clause: if either input is not a string, or if their lengths differ, we return false immediately. This gives us an instant $O(1)$ early exit.*
> 
> *Next, I allocate an integer array of size 26 initialized with zeroes. In a single pass, I update the character frequencies for both strings by subtracting 97, which is the ASCII code for 'a'. Finally, I iterate through the 26 buckets—if any value is non-zero, I return false. Otherwise, return true."*

### Step 5: Dry Run (Chạy thử từng dòng với ví dụ)
> *"Let's trace with `s = 'rat'` and `t = 'car'`:*
> *- Lengths are both 3. Guard clause passes.*
> *- `i = 0`: `s[0] = 'r'`, count['r'] becomes 1. `t[0] = 'c'`, count['c'] becomes -1.*
> *- `i = 1`: `s[1] = 'a'`, count['a'] becomes 1. `t[1] = 'a'`, count['a'] decrements back to 0.*
> *- `i = 2`: `s[2] = 't'`, count['t'] becomes 1. `t[2] = 'r'`, count['r'] decrements from 1 to 0.*
> *- When inspecting the array: bucket for 'c' is -1, bucket for 't' is 1. Since they are not zero, the function returns false. The trace matches expectations."*

### Step 6: Conclusion (Kết luận độ phức tạp)
> *"To conclude, `isAnagram` achieves $O(n)$ time complexity and $O(1)$ auxiliary space because the alphabet size is constant at 26. `groupAnagrams` runs in $O(N \cdot K)$ time complexity and $O(N \cdot K)$ space to store the grouped strings. This linear approach avoids sorting bottlenecks and leverages Node.js V8 array access efficiently."*

---

## 🎨 5. Bảng Mô Phỏng Trực Quan Tương Tác (Interactive Visualizer)

> 🔗 **File mô phỏng độc lập (Lưu vĩnh viễn trong Repo):**  
> [`docs/visualizers/w2-01-valid-anagram.html`](file:///home/samnguyen/projects/training-anz/docs/visualizers/w2-01-valid-anagram.html)  
> *Bạn có thể click đúp vào file trên để mở trực tiếp trên trình duyệt (Chrome/Edge/Safari/Firefox) bất kỳ lúc nào để xem mô phỏng mảng đếm tần suất 26 chữ cái (Array Bucket).*


