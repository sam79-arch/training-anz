# 📚 Cẩm Nang Thực Chiến: Node.js Internals & 6 Pha Event Loop (HCLTech x ANZ)

> **Mục tiêu phỏng vấn:** Nắm vững kiến trúc đa luồng ngầm của Node.js, thứ tự ưu tiên các pha Event Loop, kỹ năng chống nghẽn luồng chính và phản xạ tiếng Anh chuẩn Senior Backend Engineer cho ANZ Bank.

---

### 📺 Video Tham Khảo Trực Quan (Must-Watch):
* 🏆 **[This is how the Node.js Event Loop really works](https://youtu.be/paI6J8my3Yw)** *(Software Developer Diaries)*:  
  👉 **Khuyên xem số 1**: Video chuẩn xác nhất mô tả đúng 100% kiến trúc Backend của Node.js: Call Stack, Libuv, Timer Queue, I/O Queue, SetImmediate Queue, NextTick Queue và Promise Queue.
* 🌐 **[JavaScript Event Loop & Asynchronous Programming](https://youtu.be/jzOy07fw2vY)** *(freeCodeCamp)*:  
  👉 **Xem để phân biệt**: Video mô tả Event Loop trên môi trường **Trình duyệt (Browser / Frontend Web APIs)**, giúp bạn không bị nhầm lẫn giữa Frontend và Backend.

---

## 🏛️ Phần 1: Kiến Trúc 3 Tầng (The 3-Layer Runtime)

Nhiều người nói *"Node.js là single-threaded"* nhưng thực tế: **Chỉ có đoạn code JavaScript của bạn chạy trên 1 luồng, còn cả hệ thống bên dưới là ĐA LUỒNG MẠNH MẼ.**

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                  JavaScript Code (User Space)               │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │              TẦNG 1: V8 ENGINE (Google C++)                 │
 │  - Main Thread: Chạy code đồng bộ (Call Stack)              │
 │  - Memory Heap: Cấp phát bộ nhớ, V8 Garbage Collector       │
 └──────────────────────────────┬──────────────────────────────┘
                                │ (Gặp I/O hoặc việc nặng)
 ┌──────────────────────────────▼──────────────────────────────┐
 │                  TẦNG 2: LIBUV (C++ Library)                │
 │  - Event Loop: Điều phối 6 pha và hàng đợi callback         │
 │  - Thread Pool: Mặc định 4 worker threads (UV_THREADPOOL_SIZE)│
 └──────────────┬───────────────────────────────┬──────────────┘
                │ (Network I/O)                 │ (File / Crypto / DNS)
 ┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
 │    TẦNG 3: OS KERNEL        │ │     LIBUV THREAD POOL       │
 │ - Linux: epoll              │ │ - 4 Worker Threads ngầm     │
 │ - macOS: kqueue             │ │ - fs.readFile / writeFile   │
 │ - Windows: IOCP             │ │ - crypto.pbkdf2 / scrypt    │
 │ (Xử lý hàng triệu TCP socket│ │ - zlib (nén/giải nén)       │
 │  mà KHÔNG tốn luồng nào!)   │ │ - dns.lookup                │
 └─────────────────────────────┘ └─────────────────────────────┘
```

### 💡 Bảng Phân Chia Công Việc: Đi Đâu? Làm Gì?
| Loại tác vụ | Ai xử lý dưới tầng C++? | Có ngốn Thread Pool không? |
|---|---|---|
| **Network I/O** (HTTP request, Database query, Webhook, TCP) | **OS Kernel** (`epoll` / `kqueue`) | ❌ **Không** (Non-blocking ở mức phần cứng OS) |
| **File I/O** (`fs.readFile`, `fs.writeFile`) | **Libuv Thread Pool** | ✅ **Có** (Chiếm 1 trong 4 worker threads) |
| **Mã hóa nặng** (`crypto.pbkdf2`, `bcrypt`) | **Libuv Thread Pool** | ✅ **Có** (Chiếm 1 trong 4 worker threads) |
| **Nén dữ liệu** (`zlib.gzip`) | **Libuv Thread Pool** | ✅ **Có** (Chiếm 1 trong 4 worker threads) |
| **DNS Resolution** (`dns.lookup`) | **Libuv Thread Pool** | ✅ **Có** (Vì dùng hàm `getaddrinfo` chặn luồng của OS) |

> 📌 **Điểm cộng Senior ANZ:** Biết tinh chỉnh biến môi trường `process.env.UV_THREADPOOL_SIZE = 8` (hoặc 16) trên máy chủ nhiều core để tăng tốc độ đọc ghi file và mã hóa dữ liệu theo lô (batch processing).

---

## 🎡 Phần 2: Vòng Tuần Hoàn 6 Pha Của Event Loop

Event Loop là một vòng lặp vô tận viết bằng C++ chạy theo chiều kim đồng hồ, gồm 6 pha tuần hoàn:

```text
       ┌────────────────────────────────┐
    ┌─>│      1. TIMERS PHASE           │ ⏰ setTimeout(), setInterval()
    │  └───────────────┬────────────────┘
    │  ┌───────────────┴────────────────┐
    │  │   2. PENDING CALLBACKS         │ 📥 I/O callbacks bị hoãn từ vòng trước
    │  └───────────────┬────────────────┘
    │  ┌───────────────┴────────────────┐
    │  │     3. IDLE / PREPARE          │ ⚙️ Dùng nội bộ cho Libuv (bỏ qua khi phỏng vấn)
    │  └───────────────┬────────────────┘
    │  ┌───────────────┴────────────────┐
    │  │        4. POLL PHASE           │ 🌐 Hứng I/O mới & chạy callback đọc file/mạng
    │  └───────────────┬────────────────┘
    │                  │  👉 Vừa đọc file xong thì nhảy ngay xuống Check Phase!
    │  ┌───────────────┴────────────────┐
    │  │        5. CHECK PHASE          │ ⚡ setImmediate() độc quyền tại đây!
    │  └───────────────┬────────────────┘
    │  ┌───────────────┴────────────────┐
    │  │    6. CLOSE CALLBACKS          │ 🚪 socket.on('close', ...)
    └──┴────────────────────────────────┘
```

### 🔍 Chi Tiết 4 Pha Quan Trọng Nhất:
1. **Timers Phase:**  
   Node.js kiểm tra cấu trúc Min-Heap để lấy ra các timer (`setTimeout`, `setInterval`) đã hết hạn (expired) và chạy callback của chúng.
2. **Poll Phase (Pha bận rộn nhất):**  
   - Tính toán xem cần ngủ (block) bao lâu để chờ I/O mới từ OS Kernel.
   - Chạy các callback I/O đã hoàn thành (ví dụ: dữ liệu đọc từ socket mạng hoặc disk đã về).
3. **Check Phase:**  
   - Dành riêng cho `setImmediate()`. Chạy ngay lập tức sau khi Poll Phase kết thúc.
4. **Close Callbacks:**  
   - Thực thi các callback dọn dẹp khi kết nối bị đóng đột ngột: `socket.on('close')`.

---

## ⚡ Phần 3: Phân Cấp Ưu Tiên (Execution Hierarchy)

Trước khi Event Loop chuyển từ pha này sang pha khác, có **2 hàng đợi VIP (Microtasks)** luôn được quyền **chen ngang**:

```text
CẤP 1 (Tối cao): Call Stack (Code đồng bộ chạy từ trên xuống dưới)
       │
       ▼
CẤP 2 (VIP 1): process.nextTick Queue
       │
       ▼
CẤP 3 (VIP 2): Promise Microtask Queue (Promise.then, async/await, queueMicrotask)
       │
       ▼
CẤP 4 (Bình dân): Event Loop 6 Pha (setTimeout, setImmediate, I/O callbacks)
```

### 🧠 Quy Tắc Vận Hành:
1. V8 Call Stack chạy sạch toàn bộ code đồng bộ.
2. Trước khi bước vào MỖI pha của Event Loop, V8 luôn quay lại kiểm tra và dọn sạch:
   - Toàn bộ `process.nextTick` trước.
   - Toàn bộ `Promise.then` sau.
3. Chỉ khi cả 2 hàng đợi Microtask này **rỗng hoàn toàn**, Event Loop mới được đi tiếp sang pha tiếp theo!

### 🚨 Bẫy Starvation (Làm đói Event Loop):
```javascript
function starve() {
  process.nextTick(starve); // Đệ quy liên tục
}
starve();
// Server bị "đóng băng" 100%, không nhận thêm bất kỳ request HTTP nào!
```
* **Tại sao?** Vì `nextTickQueue` không bao giờ rỗng, khiến Event Loop bị kẹt vĩnh viễn ở Cấp 2, không bao giờ bước chân được vào Pha Poll để nhận kết nối mạng mới!

---

## 🛡️ Phần 4: "Don't Block the Event Loop" (Bẫy Production & Cách Hóa Giải)

Vì JavaScript chỉ chạy trên 1 Main Thread duy nhất, nếu Main Thread bị chặn, **hàng nghìn khách hàng ngân hàng sẽ bị treo giao dịch cùng lúc**.

### ❌ 4 Thủ Phạm Gây Nghẽn & Cách Xử Lý:

| Thủ phạm | Ví dụ thực tế | Cách giải quyết chuẩn Backend |
|---|---|---|
| **1. Hàm đồng bộ I/O** | `fs.readFileSync()`, `crypto.pbkdf2Sync()` trong request handler | **Tuyệt đối cấm!** Luôn dùng bản bất đồng bộ: `fs.promises.readFile()`, `crypto.pbkdf2()` có callback hoặc `await`. |
| **2. Parse JSON dung lượng lớn** | `JSON.parse(hugePayload)` với file báo cáo giao dịch 200MB | Dùng kỹ thuật **Stream** và thư viện `stream-json` để parse từng chunk nhỏ, không nạp cả file vào RAM. |
| **3. Thuật toán CPU nặng** | Tính toán ma trận rủi ro, mã hóa ảnh | Đẩy sang **`worker_threads`** hoặc tạo một Microservice riêng bằng Go/Rust. |
| **4. Biểu thức Regex thảm họa (ReDoS)** | Regex lồng nhau `/(a+)+$/` gặp chuỗi độc hại | Dùng thư viện an toàn như `re2` hoặc giới hạn độ dài chuỗi kiểm tra. |

---

## 🗣️ Phần 5: Kịch Bản Tiếng Anh Phỏng Vấn ANZ (3 Câu Hỏi Đinh)

Luyện tập trả lời to, dứt khoát 3 câu hỏi này theo phong cách Senior Engineer:

### ❓ Câu 1: *"How does Node.js handle high concurrency despite being single-threaded?"*
> *"Node.js executes JavaScript code on a single main thread using the V8 engine. However, high concurrency is achieved because Node.js delegates asynchronous I/O operations to either the **OS Kernel** or the **Libuv Thread Pool**.*  
> *For network requests, it leverages kernel non-blocking mechanisms like `epoll` on Linux. For heavy operations like file system access and cryptography, it uses a pool of worker threads.*  
> *Once an operation finishes, the event loop picks up the callback and executes it on the main thread. This prevents thread-context switching overhead and minimizes memory usage."*

---

### ❓ Câu 2: *"What is the difference between setImmediate, setTimeout(fn, 0), and process.nextTick?"*
> *"The key difference lies in their execution priority:*  
> *1. **`process.nextTick`** is a microtask. It runs immediately after the current operation completes, before the event loop advances to any phase.*  
> *2. **`setTimeout(fn, 0)`** is processed in the **Timers phase** of the event loop after its threshold expires.*  
> *3. **`setImmediate`** runs in the **Check phase**, right after the **Poll phase**.*  
> *Crucially, inside an I/O cycle like `fs.readFile`, `setImmediate` will always execute before `setTimeout` because the event loop transitions directly from the Poll phase to the Check phase."*

---

### ❓ Câu 3: *"How do you prevent Event Loop blocking in a high-throughput Banking API?"*
> *"To ensure the event loop remains responsive, I follow three strict rules:*  
> *First, **never use synchronous I/O methods** like `fs.readFileSync` in request paths.*  
> *Second, for large data transformations such as massive transaction exports, I use **Node.js Streams** instead of loading entire datasets into memory.*  
> *Third, if CPU-bound computations are unavoidable—such as complex risk scoring—I offload them to **Worker Threads** or dedicated background worker services."*

---

## 🎯 Tóm Tắt Trong 1 Bảng Nhớ Nhanh

```text
┌─────────────────┬───────────────────┬──────────────────────────────────┐
│ CƠ CHẾ          │ VỊ TRÍ            │ MỤC ĐÍCH THỰC TẾ                 │
├─────────────────┼───────────────────┼──────────────────────────────────┤
│ Sync Code       │ V8 Call Stack     │ Chạy tức thời                    │
│ process.nextTick│ nextTickQueue     │ Việc khẩn cấp, chạy trước pha mới│
│ Promise.then    │ Microtask Queue   │ Kết quả async, chạy sau nextTick │
│ setTimeout      │ Timers Phase      │ Hẹn giờ chạy sau X mili-giây     │
│ setImmediate    │ Check Phase       │ Chạy ngay sau khi I/O hoàn thành │
│ fs / crypto     │ Thread Pool (4)   │ Tác vụ nặng đẩy xuống C++ worker │
│ HTTP / Socket   │ OS Kernel (epoll) │ Xử lý hàng vạn kết nối đồng thời │
└─────────────────┴───────────────────┴──────────────────────────────────┘
```

