# 🧭 Cẩm Nang Chuyên Sâu: Kỹ Thuật Cửa Sổ Trượt (Sliding Window Patterns)

> **Mục tiêu phỏng vấn ANZ:** Nắm vững phân loại các biến thể Sliding Window (Cố định vs Linh hoạt), phân tích sự khác biệt giữa kỹ thuật co từng bước bằng Set ($2n$ ops) và nhảy tức thời bằng Map ($n$ ops), chứng minh bất biến chống bẫy nhảy lùi con trỏ (Backward Jump), và áp dụng vào bài toán giám sát luồng giao dịch ngân hàng thời gian thực.

---

## 🗺️ 1. Bản Đồ Phân Loại: Sliding Window Taxonomy

Trong các câu hỏi về Mảng con (Subarray) hoặc Chuỗi con (Substring) tại ANZ Bank:

```text
                               KỸ THUẬT CỬA SỔ TRƯỢT (SLIDING WINDOW)
                                                 │
              ┌──────────────────────────────────┴──────────────────────────────────┐
              ▼                                                                     ▼
      CỬA SỔ CỐ ĐỊNH (FIXED SIZE)                                         CỬA SỔ LINH HOẠT (DYNAMIC SIZE)
   (Max Sum Subarray of size K,                                       (Longest Substring Without Repeating Chars,
    Moving Average in Financial Stream)                                Minimum Window Substring, Max Consecutive Ones)
              │                                                                     │
- Kích thước cửa sổ: Cố định là K                                      - Kích thước cửa sổ: Biến thiên liên tục [L, R]
- Di chuyển: Cả 2 biên cùng tiến 1 bước:                               - Di chuyển:
  + Thêm phần tử mới tại R: add(arr[R])                                  + Mở rộng: R luôn tiến sang phải để nạp dữ liệu
  + Bỏ phần tử cũ tại L: remove(arr[L])                                  + Co cụm: L tiến sang phải khi vi phạm điều kiện
  + L++, R++                                                             + Ghi nhận: Cập nhật max/min khi cửa sổ hợp lệ
```

---

## ⚖️ 2. So Sánh Hai Chiến Lược Triển Khai: Set vs. Map

Một câu hỏi phỏng vấn phân loại Middle vs. Senior tại ANZ:
> *"Tại sao giải pháp dùng Hash Map nhảy tức thời lại được đánh giá cao hơn giải pháp dùng Set co từng bước?"*

| Tiêu chí | Tiếp cận 1: Co từng bước với `Set` | Tiếp cận 2: Nhảy tức thời với `Map` (Senior) |
|---|---|---|
| **Cấu trúc lưu trữ** | `Set<char>` lưu các ký tự đang có trong cửa sổ | `Map<char, index>` lưu chỉ mục xuất hiện gần nhất |
| **Cơ chế khi trùng lặp** | Vòng lặp `while (set.has(char)) { set.delete(s[L]); L++; }` | Bước nhảy $O(1)$: `L = Math.max(L, map.get(char) + 1)` |
| **Số lần duyệt phần tử** | Mỗi phần tử bị duyệt tối đa 2 lần (bởi $R$ rồi bởi $L$) $\rightarrow 2n$ ops | Mỗi phần tử chỉ được duyệt qua đúng **1 lần** bởi $R \rightarrow n$ ops |
| **Độ phức tạp thời gian** | $O(2n) = O(n)$ | **$O(n)$ Single-Pass** (Giảm 50% số chu kỳ CPU) |
| **Khả năng mở rộng** | Khi cửa sổ lớn (vài nghìn phần tử trùng ở đầu), vòng `while` xóa lắt nhắt gây chậm | Nhảy cóc trực tiếp, không phụ thuộc vào độ rộng cửa sổ |

---

## 🔬 3. Chứng Minh Toán Học: Bất Biến Chống Bẫy Nhảy Lùi (Backward Jump Invariant)

Xét chuỗi $s$, tại bước $R$, ký tự hiện tại là $c = s[R]$.  
Giả sử $c$ đã từng xuất hiện trước đó tại chỉ mục $p = \text{map.get}(c)$.

### Câu hỏi: Khi nào chỉ mục $p$ thực sự nằm trong cửa sổ hiện tại?
- Cửa sổ hiện tại có biên trái là $L$.
- Ký tự $c$ chỉ thực sự gây trùng lặp **nếu và chỉ nếu** $p \ge L$.
- Nếu $p < L$, điều đó có nghĩa là ký tự $c$ này thuộc về một phân đoạn trong quá khứ đã bị loại bỏ khỏi cửa sổ từ các bước trước đó!

### Công thức cập nhật:
$$L_{\text{mới}} = \max(L_{\text{hiện tại}}, p + 1)$$

### Bằng chứng phản ví dụ nếu thiếu `Math.max`:
Xét chuỗi `s = "abba"`:
1. $R = 0$ (`'a'`): $L = 0$, $\text{map} = \{ a: 0 \}$
2. $R = 1$ (`'b'`): $L = 0$, $\text{map} = \{ a: 0, b: 1 \}$
3. $R = 2$ (`'b'`): trùng `'b'` tại $p = 1 \ge 0 \implies L = 1 + 1 = 2$. Cửa sổ `[2, 2] = "b"`. $\text{map} = \{ a: 0, b: 2 \}$.
4. $R = 3$ (`'a'`): gặp lại `'a'` với $p = 0$.
   - Nếu gán $L = p + 1 = 0 + 1 = 1$: $L$ nhảy từ $2$ lùi về $1$ $\implies$ Cửa sổ thành `[1, 3] = "bba"` (Sai vì chứa 2 chữ `'b'`).
   - Với `Math.max(2, 0 + 1)`: $L$ giữ nguyên tại $2 \implies$ Cửa sổ là `[2, 3] = "ba"` (Đúng).

---

## 🏦 4. Ứng Dụng Trong Hệ Thống Phân Tán Tại ANZ Bank

Trong hạ tầng **ANZ Real-time Data Platform**:

1. **Sliding Window Rate Limiter:**
   - Giới hạn số lượng request từ một Client ID trong cửa sổ trượt 60 giây.
   - Thay vì chia Fixed Window (dễ bị bão hòa gấp đôi ở ranh giới 2 phút), Sliding Log Window lưu timestamp các request và dịch biên trái để purge các request quá hạn.
2. **Streaming Transaction Anomaly Detection (Kafka Streams):**
   - Giám sát luồng thẻ tín dụng: Phát hiện xem trong vòng 10 giao dịch gần nhất của cùng một thẻ có phát sinh từ 2 quốc gia cách xa nhau về địa lý hay không (Impossible Travel Fraud Detection).
3. **Sliding Buffer Memory Efficiency:**
   - Trong Node.js Streams, duy trì một sliding buffer giúp giải phóng bộ nhớ (Garbage Collection) đều đặn theo từng khối dữ liệu, tránh tình trạng Memory Leak khi xử lý file giao dịch hàng gigabyte.

