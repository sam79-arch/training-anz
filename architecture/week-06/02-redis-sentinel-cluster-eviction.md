# 📚 Cẩm Nang Kiến Trúc: Redis Advanced & High Availability (Sentinel, Cluster & Eviction)

> **Tuần 6 Day 2 (Thứ 3)**: Chuyên đề kiến trúc Database & Redis Caching nâng cao (TUYỆT ĐỐI CẤM GIẢI LEETCODE).  
> **Target Role**: Senior Node.js Backend Engineer (ANZ Bank x HCLTech Vietnam).  
> **Chủ đề**: Redis Sentinel Quorum Failover, Redis Cluster Sharding (CRC16 16,384 Slots) & Memory Eviction (LRU/LFU).

---

## 🏛️ 1. Tổng Quan Kiến Trúc High Availability (HA) Tại ANZ Bank

Trong hệ thống xử lý giao dịch thanh toán trực tuyến (Real-time Payments) tại ANZ:
- Một node Redis duy nhất là **Single Point of Failure (SPOF)**.
- Khi dung lượng dữ liệu hoặc số lượng truy vấn vượt quá giới hạn của 1 máy chủ vật lý, hệ thống cần mở rộng theo 2 chiều:
  1. **Độ sẵn sàng cao (High Availability)**: Sử dụng cụm **Redis Sentinel** giám sát tự động chuyển vùng dự phòng (Failover) khi Master gặp sự cố.
  2. **Mở rộng quy mô (Horizontal Scalability)**: Sử dụng **Redis Cluster** để phân mảnh (Sharding) dữ liệu qua 16,384 Hash Slots.

---

## ⚙️ 2. Redis Cluster Sharding: 16,384 Hash Slots & Kỹ Thuật Hash Tag

### Tại sao Redis Cluster dùng 16,384 Slots mà không phải 65,536 ($2^{16}$)?
1. **Heartbeat Packet Overhead**:
   - Các node trong cluster liên tục trao đổi gói tin Ping/Pong qua giao thức Gossip Protocol.
   - Để truyền tải trạng thái của các slot, Redis sử dụng Bitmap:
     - Với 16,384 slots ($16\text{K}$): Cần $16384 / 8 = 2\text{ KB}$ bộ nhớ trong mỗi gói heartbeat.
     - Với 65,536 slots ($64\text{K}$): Cần $65536 / 8 = 8\text{ KB}$ bộ nhớ, gây lãng phí băng thông mạng nội bộ nghiêm trọng khi cụm có hàng chục node.
2. **Quy mô thực tế**: Các cụm Redis khuyến nghị không vượt quá 1,000 Master nodes, do đó 16,384 slots là con số tối ưu giữa phân bổ đồng đều và tối ưu hóa băng thông mạng.

### Kỹ thuật Hash Tag `{...}`:
- Mặc định, Redis băm toàn bộ key: `slot = CRC16(key) % 16384`.
- Hai key `user:101:profile` và `user:101:orders` có thể rơi vào 2 shard khác nhau. Khi chạy lệnh Multi-key như `MGET` hoặc Transaction, Redis Cluster sẽ báo lỗi `CROSSSLOT Keys in request don't hash to the same slot`.
- **Giải pháp**: Dùng Hash Tag `{...}`. Redis chỉ tính CRC16 cho chuỗi bên trong `{}`:
  - `{user:101}:profile` $\rightarrow$ hash `user:101`
  - `{user:101}:orders` $\rightarrow$ hash `user:101`
  - Kết quả: Cả 2 key cùng nằm trên 1 slot và 1 master node duy nhất, cho phép thực thi atomic multi-key an toàn.

---

## 🛡️ 3. Redis Sentinel: Quorum Consensus & Automatic Failover

### Quy trình 3 bước xử lý lỗi của Sentinel:
1. **Subjective Down (`+sdown`)**: Một node Sentinel gửi lệnh `PING` mà không nhận được phản hồi sau khoảng thời gian `down-after-milliseconds` $\rightarrow$ Sentinel này tự đánh dấu Master bị lỗi chủ quan.
2. **Objective Down (`+odown`)**: Sentinel gửi truy vấn đến các Sentinel khác (`SENTINEL is-master-down-by-addr`). Nếu số lượng Sentinel đồng thuận $\ge \text{Quorum}$ (ví dụ $2/3$ nodes) $\rightarrow$ Master chính thức bị coi là chết khách quan.
3. **Failover Execution**:
   - Bầu chọn 1 Sentinel làm Leader (theo giải thuật Raft cơ bản).
   - Leader Sentinel chọn Replica tốt nhất (dựa trên: Priority $\rightarrow$ Replication Offset lớn nhất $\rightarrow$ Node ID nhỏ nhất).
   - Gửi lệnh `SLAVEOF NO ONE` thăng cấp Replica lên Master mới.
   - Cấu hình lại các Replica còn lại theo Master mới (`SLAVEOF new_master_ip new_master_port`).

---

## 🗑️ 4. Chính Sách Giải Phóng Bộ Nhớ (Memory Eviction Policies)

Khi dung lượng RAM đạt ngưỡng `maxmemory`:
1. **LRU (Least Recently Used)**: Loại bỏ các key lâu nhất không được đọc/ghi. Phù hợp cho dữ liệu truy cập theo xu hướng thời gian (Hot Data vs Cold Data).
2. **LFU (Least Frequently Used)**: Loại bỏ các key có tần suất truy cập thấp nhất trong một cửa sổ thời gian. Phù hợp cho việc giữ lại các khóa cốt lõi (ví dụ cấu hình hệ thống, tỷ giá hối đoái liên ngân hàng) ngay cả khi vừa có một đợt quét cache đột xuất (Scan pollution).

---

## 🎙️ 5. Phản Biện Phỏng Vấn Kỹ Thuật (ANZ Technical Defense)

### ❓ Question 1: *"How does Redis Sentinel prevent Split-Brain during network partition?"*
> *"In a network partition where the Master is isolated with a minority of Sentinels, the majority partition (containing $\ge \text{Quorum}$ Sentinels) will elect a new Master. To prevent the old Master from continuing to accept writes and creating a split-brain condition with lost data, we configure `min-replicas-to-write 1` and `min-replicas-max-lag 10`. If the old Master cannot acknowledge at least 1 healthy replica within 10 seconds, it stops accepting write requests, ensuring strong consistency."*

### ❓ Question 2: *"Why would you use Hash Tags in Redis Cluster for banking microservices?"*
> *"In ANZ payment workflows, transferring funds between accounts or managing a customer's portfolio requires atomic multi-key operations. Redis Cluster inherently rejects cross-slot operations. By using Hash Tags such as `{account:123}:balance` and `{account:123}:ledger`, we force all sub-keys of that account to hash into the exact same CRC16 slot, enabling atomic Lua scripts and multi-key transactions while still maintaining horizontal scalability across hundreds of shards."*

