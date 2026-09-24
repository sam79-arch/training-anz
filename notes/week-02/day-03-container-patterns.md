# 🧭 Cẩm Nang Chuyên Sâu: Two Pointers Kẹp Hai Đầu Trên Mảng Không Sắp Xếp (Week 2 Day 3)

> **Mục tiêu phỏng vấn ANZ:** Hiểu thấu đáo sự khác biệt giữa Two Pointers trên mảng đã sắp xếp (Sorted) và mảng giữ nguyên vị trí (Unsorted), làm chủ kỹ thuật chứng minh loại trừ không gian nghiệm (Search Space Elimination), và áp dụng vào bài toán tối ưu đệm thanh khoản ngân hàng.

---

## 🗺️ 1. Bản Đồ So Sánh: Two Pointers Có Sort vs. Không Sort

Một câu hỏi phỏng vấn phân loại rất tinh tế tại ANZ:
> *"Tại sao ở bài Two Sum II và 3Sum ta bắt buộc phải Sort mảng, còn sang Container With Most Water ta tuyệt đối KHÔNG ĐƯỢC Sort?"*

```text
                           MÔ HÌNH HAI CON TRỎ KẸP HAI ĐẦU (COLLISION)
                                                │
             ┌──────────────────────────────────┴──────────────────────────────────┐
             ▼                                                                     ▼
    DỰA TRÊN GIÁ TRỊ (VALUE-DRIVEN)                                     DỰA TRÊN KHOẢNG CÁCH (INDEX-DRIVEN)
    (Two Sum II, 3Sum, 4Sum)                                            (Container With Most Water, Trapping Rain)
             │                                                                     │
- Bản chất: Tìm các số có TỔNG bằng Target                          - Bản chất: Tìm DIỆN TÍCH = Chiều cao × Chiều rộng
- Chiều rộng: Không quan trọng                                      - Chiều rộng: (R - L) phụ thuộc vị trí gốc của mảng
- Sắp xếp: BẮT BUỘC SORT để tạo tính đơn điệu (Monotonicity)        - Sắp xếp: TUYỆT ĐỐI CẤM SORT vì sẽ phá hủy khoảng cách
- Di chuyển: Dựa vào Tổng > Target hay < Target                     - Di chuyển: Dựa vào việc Cột nào thấp hơn (Bottleneck)
```

---

## 📐 2. Chứng Minh Toán Học: Kỹ Thuật Loại Trừ Không Gian Tìm Kiếm

Trong phỏng vấn Senior, giám khảo thường hỏi: *"Làm sao bạn chứng minh được việc dịch cột thấp hơn không bỏ sót cặp có diện tích lớn hơn?"*

### Ma trận không gian nghiệm $N \times N$:
Xét mảng $N$ phần tử, tổng số cặp $(L, R)$ có thể ghép là $\frac{N(N - 1)}{2}$.

```text
       R=1   R=2   R=3   ...   R=n-1
L=0     x     x     x           [BẮT ĐẦU TẠI ĐÂY]
L=1           x     x           ...
L=2                 x           ...
```

1. **Khởi điểm:** Ta bắt đầu tại cặp $(L = 0, R = n - 1)$ có **chiều rộng lớn nhất có thể** ($W = n - 1$).
2. **Xét trường hợp:** Giả sử $height[L] < height[R]$.
   - Mọi cặp $(L, R')$ với $R' < R$ đều có:
     $$\text{Width}(L, R') < \text{Width}(L, R)$$
     $$\text{Height}(L, R') = \min(height[L], height[R']) \le height[L]$$
   - Suy ra:
     $$\text{Area}(L, R') = \text{Width}(L, R') \times \text{Height}(L, R') < \text{Width}(L, R) \times height[L] = \text{Area}(L, R)$$
3. **Loại trừ cả một hàng:**
   - Điều này chứng minh rằng **toàn bộ các cặp $(L, 0), (L, 1), \dots, (L, R - 1)$ đều chắc chắn kém hơn cặp $(L, R)$**.
   - Ta gạch bỏ toàn bộ hàng $L$ ra khỏi ma trận tìm kiếm chỉ bằng **một phép dịch $L++$**!
4. **Độ phức tạp tuyến tính:** Mỗi lần dịch chuyển, ta loại bỏ được một hàng hoặc một cột trong ma trận. Sau đúng $N - 1$ bước, toàn bộ không gian nghiệm đã được rà soát đầy đủ $\implies O(n)$ time!

---

## ⚡ 3. Các Tình Huống Biên Cần Lưu Ý (Edge Cases)

### Trường hợp 1: Hai cột có chiều cao bằng nhau ($height[L] === height[R]$)
- Khi hai cột bằng nhau, dịch bên nào cũng đúng vì:
  - Nếu giữ nguyên $L$, thử mọi $R' < R$ thì chiều rộng giảm, chiều cao $\le height[L] \implies$ không thể tăng diện tích.
  - Tương tự với $R$.
- Trong thực tế, bạn có thể dịch `L++` hoặc `R--` (hoặc đồng thời `L++; R--;`). Cả hai cách đều bảo đảm tính chính xác 100%.

### Trường hợp 2: Mảng có 2 cột cao chọc trời ở giữa, nhưng 2 đầu thấp
- Ví dụ: `[1, 1000, 1000, 1]`
- Bắt đầu: $L = 0 (1), R = 3 (1) \rightarrow \text{Area} = 1 \times 3 = 3$.
- Dịch $L \rightarrow 1 (1000)$: $L = 1 (1000), R = 3 (1) \rightarrow \text{Area} = 1 \times 2 = 2$.
- Dịch $R \rightarrow 2 (1000)$: $L = 1 (1000), R = 2 (1000) \rightarrow \text{Area} = 1000 \times 1 = 1000$!
- Hai con trỏ kẹp dần vào trong bảo đảm **không bao giờ bị bỏ qua các đỉnh cao ở giữa**.

---

## 🏦 4. Bối Cảnh Thực Tế Tại ANZ Bank: Liquidity Buffer & Stress Testing

Trong quản trị rủi ro thanh khoản ngân hàng (APRA Prudential Standard APS 210):
- **Intraday Liquidity Buffer:** Ngân hàng phải duy trì một lượng tài sản lưu động chất lượng cao (HQLA) để đáp ứng các lệnh chuyển khoản RTGS (Real-Time Gross Settlement) vào các khung giờ cao điểm.
- Thuật toán Container With Most Water được sử dụng trong các kịch bản kiểm tra sức chịu tải (Stress Testing): Tìm khoảng thời gian có tích số giữa *độ dài thời gian duy trì* và *mức công suất dự phòng thấp nhất* là lớn nhất để quy hoạch dòng tiền đối ứng tối ưu.

