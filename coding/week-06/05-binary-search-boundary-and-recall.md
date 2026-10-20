# 📘 Cẩm Nang Kỹ Thuật: Binary Search Boundary Drill & Friday Recall (Week 6 Day 5)

> **Tuần 6 Day 5 (Thứ 6)**: Rèn luyện kỹ thuật tìm biên nhị phân (Lower Bound) kết hợp Spaced Repetition Recall 15m.  
> **Target Role**: Senior Node.js Backend Engineer (ANZ Bank x HCLTech Vietnam).  
> **Độ phức tạp**: Thời gian $O(\log n)$ | Không gian phụ trợ $O(1)$.

---

## 🔁 1. Friday Recall Test 15m: Best Time to Buy and Sell Stock (LeetCode #121)

Theo kỷ luật Spaced Repetition (chống quên lãng):
- 15 phút đầu phiên sáng Thứ 6 (05:00 - 05:15 AM) dành để gõ lại 1 bài toán cũ từ trí nhớ hoàn toàn không mở tài liệu tham khảo.
- Kết quả kiểm chứng: `// Recall: 2026-10-20 - PASS in 5m`.
- **Bất biến cốt lõi**:
  - Không vi phạm mũi tên thời gian (Time-arrow invariant: Không thể bán trước khi mua).
  - Duyệt 1 lượt $O(n)$, liên tục duy trì `minPrice = Math.min(minPrice, prices[i])` và `maxProfit = Math.max(maxProfit, prices[i] - minPrice)`.

---

## 🎯 2. Binary Search Template 2: Kỹ Thuật Tìm Biên (Boundary / Lower Bound)

Khác với Binary Search cơ bản (tìm chính xác giá trị `target`), bài toán **First Bad Version** đại diện cho dạng tìm kiếm biên trên một dãy giá trị boolean đơn điệu: `[False, False, ..., False, True, True, ...]`.

### Tại sao dùng `while (left < right)` và `right = mid`?

| Điểm khác biệt | Binary Search Cơ Bản (Exact Match) | Binary Search Tìm Biên (Lower Bound) |
|---|---|---|
| **Điều kiện vòng lặp** | `while (left <= right)` | `while (left < right)` |
| **Khi `predicate(mid) === true`** | Trả về `mid` ngay | `right = mid` (Giữ lại `mid` vì nó có thể là phần tử đầu tiên thỏa mãn) |
| **Khi `predicate(mid) === false`** | `left = mid + 1` | `left = mid + 1` (Loại bỏ `mid` vì chắc chắn không phải đáp án) |
| **Điểm kết thúc** | Trả về `-1` nếu không thấy | Vòng lặp dừng khi `left === right`, chỉ thẳng vào phần tử biên |

> ⚠️ **Bẫy sống còn**: Nếu bạn viết `right = mid - 1` khi `isBadVersion(mid)` là `true`, bạn có thể nhảy qua mất chính phiên bản lỗi đầu tiên và đưa ra kết quả sai lệch!

---

## 3. 🎙️ Kịch Bản Đối Thoại Tiếng Anh 6 Bước (ANZ Interview Script)

### Step 1: Clarify (Làm rõ yêu cầu & Biên dữ liệu)
> *"Before implementing, I'd like to clarify the inputs. Is the API `isBadVersion` guaranteed to be monotonic, meaning once a version is bad, all subsequent versions are bad? What are the bounds for $n$? And what should we return if no versions are bad? I'll ensure line 1 checks for valid inputs."*

### Step 2: Brute-Force (Đề xuất giải pháp tuần tự)
> *"The naive approach would be calling `isBadVersion` sequentially from 1 to n. The first version that returns true is our answer. This requires $O(n)$ API calls and $O(1)$ space. For large systems where $n$ is in the millions and API calls involve network round trips, $O(n)$ calls would cause severe latency."*

### Step 3: Optimize (Tối ưu hóa với Binary Search Lower Bound)
> *"Since the versions form a monotonic boolean sequence `[false, ..., false, true, ..., true]`, we can optimize this to $O(\log n)$ API calls using a binary search lower-bound template."*

### Step 4: Think Out Loud (Thuyết minh logic khi gõ code)
> *"I begin with a guard clause, including checking if version $n$ is bad—if not, no versions are bad so we can return early. I initialize `left = 1` and `right = n`. Inside `while (left < right)`, I compute `mid = left + Math.floor((right - left) / 2)`. If `isBadVersion(mid)` is true, the first bad version could be `mid` or to its left, so I set `right = mid`. If false, the bad version must be strictly to the right, so `left = mid + 1`. When `left === right`, the pointers have converged on the first bad version."*

### Step 5: Dry Run (Chạy từng dòng với ví dụ)
> *"Let's trace with $n = 5$ and bad version at 4: `[F, F, F, T, T]`.*  
> *- Initial: `left = 1, right = 5`.*  
> *- `mid = 3`: `isBadVersion(3) = false` $\rightarrow$ `left = 4`.*  
> *- `mid = 4`: `isBadVersion(4) = true` $\rightarrow$ `right = 4`.*  
> *- Loop ends because `left === right === 4`.*  
> *- Output: 4. Exactly 2 API calls for $n=5$, matching $\lceil \log_2 5 \rceil$."*

### Step 6: Conclusion (Chốt độ phức tạp)
> *"In conclusion, this approach guarantees $O(\log n)$ time complexity with minimal API calls ($\le \lceil \log_2 n \rceil + 1$) and $O(1)$ auxiliary space."*

