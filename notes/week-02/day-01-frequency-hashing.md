# 🧭 Cẩm Nang Chuyên Sâu: Frequency Hashing & Array Buckets (Week 2 Day 1)

> **Mục tiêu phỏng vấn:** Nắm vững bản chất kỹ thuật băm theo tần suất (Frequency Hashing), phân biệt khi nào dùng mảng tĩnh 26 phần tử (Array Bucket) thay vì Hash Map, và làm chủ thiết kế Key chữ ký để đạt độ phức tạp tuyến tính $O(N \cdot K)$.

---

## 🗺️ 1. Bản Đồ Quyết Định: Array Bucket vs. Hash Map

Một câu hỏi phỏng vấn phân loại Senior tại ANZ Bank:
> *"Tại sao ở bài Valid Anagram ta dùng mảng cố định 26 phần tử, trong khi sang Group Anagrams ta lại kết hợp cả mảng 26 phần tử và `new Map()`?"*

```text
                           BÀI TOÁN ĐẾM TẦN SUẤT KÝ TỰ
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
  TẬP KÝ TỰ CỐ ĐỊNH / HỮU HẠN                               TẬP KÝ TỰ MỞ RỘNG / BẤT KỲ
  (vd: bảng chữ cái tiếng Anh 'a'-'z')                     (vd: Unicode, số lớn, chuỗi tự do)
             │                                                     │
- Cấu trúc: MẢNG TĨNH 26 PHẦN TỬ                          - Cấu trúc: HASH MAP (`new Map()`)
- Memory: O(1) Auxiliary Space                            - Memory: O(u) (u = số ký tự unique)
- Cơ chế: Offset mã ASCII (`char - 97`)                   - Cơ chế: Hash function + Buckets
- V8 Engine: PACKED_SMI_ELEMENTS                          - V8 Engine: C++ Hash Table
  (Nằm trọn trong L1 CPU Cache)                             (Có overhead tính hash và con trỏ)
- Bài toán: Valid Anagram (#242)                          - Bài toán: First Unique Character
```

### 🚦 Quy tắc vàng:
- Nếu tập khóa (keys) là bảng chữ cái tiếng Anh cố định (26 chữ cái) $\rightarrow$ **BẮT BUỘC dùng mảng tĩnh 26 phần tử**. Dùng `new Map()` trong bài này sẽ bị giám khảo trừ điểm vì tốn bộ nhớ không đáng có.
- Nếu cần gom nhóm nhiều phần tử theo chữ ký $\rightarrow$ **Dùng mảng 26 phần tử để TẠO KEY**, rồi dùng `new Map()` để **LƯU TRỮ CÁC NHÓM**.

---

## 🔑 2. Nghệ Thuật Thiết Kế Key Trong Group Anagrams (Tránh Bẫy $O(K \log K)$)

Trong bài toán gom nhóm Anagrams, hai chuỗi là anagram của nhau khi và chỉ khi chúng có cùng chữ ký. Có 2 cách tạo key:

### Cách 1: Sắp xếp chuỗi (Sorting Key) — Cách làm của Junior
```js
// Với mỗi chuỗi dài K:
const key = str.split('').sort().join(''); // Tốn O(K log K)
```
- **Hạn chế:** Với mảng $N = 100,000$ chuỗi, mỗi chuỗi dài $K = 1,000$ ký tự, việc sort tiêu tốn hàng trăm triệu chu kỳ CPU không cần thiết.

### Cách 2: Chữ ký tần suất (Frequency Signature Key) — Chuẩn Senior ANZ
```js
// Đếm tần suất 26 ký tự trong O(K):
const counts = new Array(26).fill(0);
for (let i = 0; i < str.length; i++) {
  counts[str.charCodeAt(i) - 97]++;
}
// Nối thành chữ ký phân cách bằng '#'
const key = '#' + counts.join('#'); // Tốn O(K + 26) = O(K)
```

> ⚠️ **CÂU HỎI BẪY PHỎNG VẤN:** *"Tại sao phải nối các số đếm bằng dấu phân cách `#` mà không ghép thẳng thành chuỗi `counts.join('')`?"*
> 
> 👉 **Trả lời:** Nếu không có dấu phân cách:
> - Chuỗi A có: 1 chữ 'a', 1 chữ 'b' $\rightarrow$ ghép thành `"11"`.
> - Chuỗi B có: 11 chữ 'a', 0 chữ 'b' $\rightarrow$ cũng ghép thành `"11"`.
> $\rightarrow$ Hai chuỗi hoàn toàn khác nhau bị trùng Key! Dấu phân cách `#` (Delimiter) bảo đảm **tính duy nhất toán học (Uniqueness)** của chữ ký.

---

## 🔬 3. V8 Engine Internals: Tại Sao Mảng Tĩnh 26 Lại Siêu Tốc?

Trong môi trường Node.js tốc độ cao:
1. **CPU L1 Cache Line:** Một mảng 26 số nguyên 32-bit chỉ chiếm $26 \times 4 = 104 \text{ bytes}$. Dung lượng này nằm trọn trong 2 Cache Lines (thường là 64 bytes/line) của CPU hiện đại. Mọi phép đọc/ghi `counts[i]++` diễn ra gần như tức thì trong **1 clock cycle**.
2. **V8 Elements Kinds:** Khi bạn tạo `new Array(26).fill(0)`, V8 cấp phát dưới dạng **`PACKED_SMI_ELEMENTS`** (Packed Small Integers). Đây là định dạng mảng nhanh nhất trong V8 vì không có con trỏ trung gian và không có lỗ hổng bộ nhớ (no holes).

---

## 🏦 4. Bối Cảnh Thực Tế Tại ANZ Bank: Transaction Pattern Matching

Trong kiến trúc **Fraud Detection & Real-time Stream Analytics**:
* **Bối cảnh:** Kẻ gian thực hiện các giao dịch rửa tiền (Money Laundering) bằng cách xáo trộn thứ tự các tham số chuyển tiền hoặc phân đoạn tài khoản để vượt qua bộ lọc Regex thông thường.
* **Giải pháp:** Hệ thống tạo "chữ ký tần suất giao dịch" (Transaction Signature). Bất kể thứ tự các metadata field bị xáo trộn ra sao, thuật toán Frequency Hashing sẽ phát hiện và gom nhóm chúng về cùng một cụm vi phạm trong thời gian thực tuyến tính $O(N \cdot K)$ mà không cần sắp xếp.

