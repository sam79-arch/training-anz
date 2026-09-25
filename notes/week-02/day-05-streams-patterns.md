# 🧭 Cẩm Nang Chuyên Sâu: Node.js Streams & Production Resiliency (Week 2 Day 5)

> **Mục tiêu phỏng vấn ANZ:** Nắm vững cơ chế cấp phát bộ nhớ của V8 đối với Buffer và Streams, làm chủ kỹ thuật điều tra và xử lý sự cố sập Pod Kubernetes do lỗi OOMKilled (Exit Code 137), và thiết lập checklist thiết kế luồng xử lý dữ liệu chuẩn Enterprise Banking.

---

## 🗺️ 1. So Sánh Toàn Diện: Buffer In-Memory vs. Streaming Pipeline

Một câu hỏi phỏng vấn phân loại Senior Backend tại ANZ:
> *"Tại sao trong một số trường hợp, xử lý bằng Streams thậm chí còn cho tốc độ phản hồi (Time-to-First-Byte - TTFB) nhanh hơn nhiều so với việc nạp toàn bộ file vào bộ nhớ?"*

| Tiêu chí | Tiếp cận In-Memory (`fs.readFile`) | Tiếp cận Streaming (`fs.createReadStream` + `pipeline`) |
|---|---|---|
| **Thời gian bắt đầu xử lý (TTFB)** | **Chậm**: Phải đợi toàn bộ file 2GB nạp xong vào RAM mới bắt đầu xử lý bản ghi đầu tiên. | **Gần như tức thời**: Bản ghi đầu tiên được xử lý ngay khi chunk 64KB đầu tiên được đọc từ đĩa. |
| **Mức tiêu thụ bộ nhớ (RAM)** | $O(N)$ — Tỷ lệ thuận với kích thước file. File 5GB cần $> 5\text{GB}$ RAM $\rightarrow$ Crash chắc chắn. | **$O(1)$ Không đổi**: Luôn dao động trong khoảng $20\text{MB} - 30\text{MB}$ bất kể file 100MB hay 100GB. |
| **Tác động lên V8 Garbage Collection** | Gây áp lực nặng nề lên Old Generation Space. Mark-Compact GC chạy liên tục gây **Stop-the-World pauses**. | Các buffer chunk thuộc Young Generation (Scavenge GC) được thu hồi liên tục cực nhanh trong vài micro-giây. |
| **Rủi ro sập hệ thống (Blast Radius)** | Một file lớn đột biến có thể làm sập toàn bộ Pod, kéo theo lỗi cascade trên các request khác. | Hệ thống tự động điều tiết lưu lượng qua Backpressure, Pod hoạt động ổn định và bền bỉ. |

---

## 🔬 2. Cơ Chế Nội Tại V8: `highWaterMark` Là Soft Limit hay Hard Limit?

Một câu hỏi phỏng vấn bẫy kỹ sư giàu kinh nghiệm:
> *"Nếu `writable.write()` trả về `false`, tiến trình Node.js có lập tức từ chối nhận thêm dữ liệu hay nó vẫn tiếp tục ghi vào RAM?"*

### 💡 Câu trả lời phân tích sâu:
- `highWaterMark` **KHÔNG PHẢI là Hard Limit (giới hạn cứng)**. Node.js không tự động ném ra ngoại lệ (throw error) hay drop dữ liệu khi vượt ngưỡng này.
- `highWaterMark` là một **Soft Limit (ngưỡng cảnh báo mềm)**:
  - Khi tổng kích thước dữ liệu trong hàng đợi nội tại (internal buffer queue) vượt qua `highWaterMark`, hàm `writable.write()` sẽ trả về giá trị boolean: `false`.
  - **Nếu lập trình viên phớt lờ giá trị `false` này và tiếp tục gọi `write()` liên tục**, Node.js vẫn miễn cưỡng cấp phát thêm bộ nhớ và nhét dữ liệu vào buffer queue!
  - Kết quả: Bộ nhớ tiếp tục phình to cho đến khi kiệt quệ RAM và sập tiến trình.
- **Bất biến kỹ thuật:** Backpressure là một **cơ chế hợp tác tự nguyện (Cooperative Protocol)** giữa Producer và Consumer. Người lập trình bắt buộc phải kiểm tra `if (write() === false)` để gọi `readable.pause()`, hoặc ủy thác toàn bộ cho `stream.pipeline()` xử lý tự động.

---

## 🚨 3. Phân Tích Sự Cố Production: Điều Tra K8s Pod OOMKilled (Exit Code 137)

Trong môi trường triển khai Kubernetes của ANZ Banking:

```text
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Warning  OOMKilled  2m (x3 over 10m)   kubelet            Pod memory limit exceeded: 512Mi. Container killed.
  Normal   Killing    2m                 kubelet            Stopping container anz-payment-ingestion
```

### Các bước điều tra Root-Cause (RCA) chuẩn Senior:
1. **Kiểm tra mã thoát (Exit Code):**
   $$\text{Exit Code } 137 = 128 + 9 \ (\text{SIGKILL do Linux OOM-Killer gửi đến})$$
2. **Kiểm tra đồ thị Pod Memory Metrics (Prometheus / Grafana):**
   - Nếu đồ thị RAM leo dốc thẳng đứng (Sawtooth pattern nhưng đỉnh vượt 512Mi) vào đúng thời điểm chạy CronJob EOD batch: **100% là do đọc file lớn thiếu Backpressure**.
3. **Phân tích Coredump / Heap Snapshot:**
   - Sử dụng `--max-old-space-size=512` kết hợp `clinic.js heapprofiler`.
   - Tìm kiếm các đối tượng `Buffer` hoặc chuỗi string khổng lồ giữ tham chiếu trong Closure của hàm `fs.readFile`.

---

## 📋 4. Production Checklist Khi Thiết Kế Streaming Service Tại ANZ

- [x] **Luôn dùng `stream.pipeline()`:** Tuyệt đối cấm dùng `.pipe()` thuần túy trong mã nguồn Production vì nguy cơ rò rỉ file descriptors khi có lỗi.
- [x] **Cấu hình `highWaterMark` phù hợp:**
  - File I/O thông thường: 64KB (mặc định).
  - Tệp siêu lớn qua mạng băng thông cao: 256KB - 512KB.
  - Xử lý object (`objectMode: true`): 16 đến 64 objects.
- [x] **Luôn bọc Error Handler:** Đảm bảo luồng có cơ chế retry hoặc chuyển bản ghi lỗi vào Dead Letter Queue (DLQ) trên Kafka.
- [x] **Giám sát thời gian thực:** Cắm metric `process.memoryUsage().heapUsed` vào Prometheus gauge để phát hiện sớm các điểm nghẽn bộ nhớ.
