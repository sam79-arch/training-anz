# 📚 Cẩm Nang Kiến Trúc: Distributed Lock Redlock Consensus & Fencing Tokens

> **Tuần 6 Day 4 (Thứ 5)**: Chuyên đề kiến trúc Database & Redis Caching nâng cao (TUYỆT ĐỐI CẤM GIẢI LEETCODE).  
> **Target Role**: Senior Node.js Backend Engineer (ANZ Bank x HCLTech Vietnam).  
> **Chủ đề**: Giải thuật Redlock trên 5 node độc lập, Phân tích Clock Drift, Tranh luận Martin Kleppmann vs Antirez và Cơ chế Fencing Token bảo vệ giao dịch tài chính.

---

## 🏛️ 1. Tại Sao 1 Node Redis Khóa Phân Tán Là Chưa Đủ?

Trong Tuần 5 Day 4, chúng ta đã xây dựng Distributed Lock trên 1 instance Redis bằng lệnh `SET resource_name my_random_value NX PX 30000`.
Tuy nhiên, trong môi trường Production ngân hàng:
- Nếu Redis Master bị crash trước khi kịp đồng bộ key khóa sang Redis Replica (do cơ chế bất đồng bộ Asynchronous Replication), Replica được thăng cấp lên Master mới sẽ **KHÔNG CÓ KHÓA**.
- Worker khác có thể chiếm được khóa cho cùng một tài nguyên $\rightarrow$ Vi phạm nghiêm trọng tính loại trừ tương hỗ (**Mutual Exclusion Violation**), dẫn tới trừ tiền 2 lần (Double Withdrawal).

Để giải quyết triệt để vấn đề này, tác giả Redis (Salvatore Sanfilippo) đề xuất giải thuật **Redlock**.

---

## ⚙️ 2. Nguyên Lý Giải Thuật Redlock (5 Independent Masters)

Redlock sử dụng $N$ instance Redis hoàn toàn độc lập (thường là $N = 5$, không dùng replication giữa các node này để tránh độ trễ đồng bộ).

### 5 Bước Thực Thi:
1. **Lấy timestamp bắt đầu $T_1$**.
2. **Cố gắng chiếm khóa tuần tự trên toàn bộ $N=5$ instances** bằng cùng một cặp `(key, value)` và timeout nhỏ (ví dụ 5-50ms) cho mỗi node để tránh bị treo khi có node chết.
3. **Tính toán thời gian tiêu tốn**: $T_{\text{elapsed}} = T_2 - T_1$.
4. **Tính toán thời gian hiệu lực còn lại (Validity Time)**:
   $$\text{Validity Time} = \text{TTL} - T_{\text{elapsed}} - \text{Clock Drift}$$
   *(Trong đó Clock Drift thường lấy $1\% \times \text{TTL} + 2\text{ms}$)*.
5. **Phán quyết kết quả**:
   - Nếu chiếm thành công trên **đa số node** ($\ge \lfloor N/2 \rfloor + 1 = 3/5$ nodes) **VÀ** $\text{Validity Time} > 0$: **Khóa thành công**.
   - Ngược lại: **Khóa thất bại**. Client bắt buộc phải gửi lệnh giải phóng (`release`) trên **toàn bộ 5 nodes** ngay lập tức để hoàn nguyên (Rollback).

---

## ⚔️ 3. Tranh Luận Kinh Điển: Martin Kleppmann vs Salvatore Sanfilippo (Antirez)

Năm 2016, nhà khoa học máy tính Martin Kleppmann (tác giả cuốn sách *Designing Data-Intensive Applications*) đã công bố bài phân tích chỉ ra lỗ hổng của Redlock:

### Luận điểm của Martin Kleppmann:
1. **Bẫy GC Pause / Process Pause**:
   - Client 1 chiếm được khóa với TTL 10 giây.
   - Ngay sau đó, Node.js runtime của Client 1 bị dừng đột ngột (Stop-the-World Garbage Collection hoặc VM live migration) trong 15 giây.
   - Khóa trên 5 node Redis hết hạn.
   - Client 2 chiếm khóa mới và bắt đầu ghi dữ liệu vào Database.
   - Client 1 tỉnh dậy sau GC pause, tưởng rằng mình vẫn giữ khóa và gửi lệnh ghi đè xuống Database $\rightarrow$ **Dữ liệu bị hủy hoại (Data Corruption)**.
2. **Vấn đề đồng hồ vật lý (System Clock Jump)**: NTP time sync có thể nhảy lùi hoặc nhảy tiến làm khóa hết hạn sớm hơn dự kiến.

### Giải pháp triệt để: Fencing Token (Chiếc vé lũy tiến)
Martin Kleppmann chỉ ra rằng: **Distributed Lock không thể tự mình đảm bảo an toàn nếu tầng lưu trữ (Database / Storage Engine) không hỗ trợ kiểm tra Fencing Token.**
- Mỗi lần cấp khóa, Redlock trả về một `fencingToken` tự tăng đơn điệu ($1, 2, 3, \dots$).
- Khi ghi dữ liệu xuống Database:
  ```sql
  UPDATE accounts 
  SET balance = balance - 100, last_fencing_token = 34 
  WHERE account_id = 'ACC-001' AND last_fencing_token < 34;
  ```
- Nếu Client 1 thức dậy mang `fencingToken = 33` gửi xuống DB, truy vấn sẽ bị từ chối ngay lập tức vì Database đã nhìn thấy token 34 từ Client 2!

---

## 🎙️ 4. Phản Biện Phỏng Vấn Tiếng Anh (ANZ Senior Defense)

### ❓ Question: *"Is Redlock safe enough for financial transaction consistency in a Banking core?"*
> *"Redlock provides robust distributed mutual exclusion against single-node crashes by requiring quorum consensus across 5 independent Redis instances. However, as Martin Kleppmann pointed out, distributed locks rely on asynchronous timing assumptions that cannot protect against client-side GC pauses or network delays.*  
> *Therefore, in ANZ's core banking architecture, Redlock is used as an efficiency optimization to prevent redundant concurrent processing, but correctness and data integrity are ultimately enforced by monotonic Fencing Tokens and Database ACID transactions with optimistic locking (`version` / `token` checks) at the persistence layer."*

