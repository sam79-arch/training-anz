# 📚 Kiến Trúc Node.js Internals & Event Loop

> **Mục tiêu:** Hiểu rõ bản chất luồng thực thi của Node.js (Call Stack, Libuv, Microtasks, Macrotasks), phân biệt cơ chế xử lý I/O và tự tin giải thích thứ tự chạy code khi phỏng vấn backend.

---

### 📺 Video Tham Khảo Khuyên Xem:
* 🏆 **[This is how the Node.js Event Loop really works](https://youtu.be/paI6J8my3Yw)** *(Software Developer Diaries)* — Video chuẩn xác nhất về kiến trúc Event Loop của Node.js: Call Stack, Libuv, 4 Task Queues và 2 Microtask Queues.
* 🌐 **[JavaScript Event Loop & Asynchronous Programming](https://youtu.be/jzOy07fw2vY)** *(freeCodeCamp)* — Video về Event Loop trên Trình duyệt (Browser), xem để phân biệt sự khác nhau giữa môi trường Frontend và Backend.

---

## 🏛️ Phần 1: Kiến Trúc 3 Tầng Của Node.js Runtime

Khi chạy một ứng dụng Node.js, hệ thống bao gồm 3 thành phần chính phối hợp với nhau:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                JavaScript Code (User Space)                 │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │               TẦNG 1: V8 ENGINE (Google C++)                │
 │  - Call Stack: Ngăn xếp chạy code đồng bộ (LIFO)            │
 │  - Memory Heap: Cấp phát vùng nhớ cho biến, object          │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Gặp tác vụ bất đồng bộ / I/O
 ┌──────────────────────────────▼──────────────────────────────┐
 │                 TẦNG 2: LIBUV (C++ Engine)                  │
 │  - Event Loop: Điều phối vòng lặp và các hàng đợi callback  │
 │  - Thread Pool: Mặc định 4 worker threads chạy tác vụ nặng  │
 └──────────────┬───────────────────────────────┬──────────────┘
                │ (Network I/O)                 │ (File / Crypto / DNS)
 ┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
 │    TẦNG 3: OS KERNEL        │ │     LIBUV THREAD POOL       │
 │ - Linux: epoll              │ │ - 4 Worker threads ngầm     │
 │ - macOS: kqueue             │ │ - fs.readFile / writeFile   │
 │ - Windows: IOCP             │ │ - crypto.pbkdf2, bcrypt     │
 │ (Xử lý kết nối mạng socket  │ │ - zlib (nén dữ liệu)        │
 │  bất đồng bộ, không tốn     │ │ - dns.lookup                │
 │  worker thread nào)         │ │                             │
 └─────────────────────────────┘ └─────────────────────────────┘
```

### 💡 Nguyên lý hoạt động:
1. **Code JavaScript chỉ chạy trên 1 luồng duy nhất (Single-threaded):** V8 Engine xử lý code đồng bộ trên **Call Stack**.
2. **Xử lý bất đồng bộ nhờ C++ (Libuv & OS Kernel):**
   * **Network I/O (HTTP, TCP Socket, Database query):** Được giao trực tiếp cho **OS Kernel** (`epoll` trên Linux). Hệ điều hành theo dõi các socket mạng và báo lại khi có dữ liệu, **không tiêu tốn thread nào trong Node.js**.
   * **File I/O, Mã hóa (Crypto), Nén (Zlib), DNS:** Do hệ điều hành không hỗ trợ hoàn toàn cơ chế bất đồng bộ cho file, Libuv phân bổ các tác vụ này cho **Thread Pool** (mặc định 4 worker threads ngầm) để không làm đứng luồng chính.

### Bảng phân chia tác vụ trong Node.js:
| Loại tác vụ | Thành phần xử lý | Có chiếm Thread Pool không? |
|---|---|---|
| HTTP Request / API call / WebSocket | **OS Kernel** (`epoll` / `kqueue`) | ❌ Không |
| Database Query (TCP connection) | **OS Kernel** (`epoll` / `kqueue`) | ❌ Không |
| `fs.readFile`, `fs.writeFile` | **Libuv Thread Pool** | ✅ Có (1 worker thread) |
| `crypto.pbkdf2`, `bcrypt.hash` | **Libuv Thread Pool** | ✅ Có (1 worker thread) |
| `zlib.gzip`, `zlib.deflate` | **Libuv Thread Pool** | ✅ Có (1 worker thread) |
| `dns.lookup` | **Libuv Thread Pool** | ✅ Có (do dùng hàm chặn `getaddrinfo`) |

---

## 🎡 Phần 2: Vòng Lặp Event Loop & 4 Hàng Đợi Macrotask

Trong JavaScript, các tác vụ bất đồng bộ thông thường được gọi chung là **Macrotasks** (hoặc Task Queue). 

* **Ở Trình duyệt:** Tất cả Macrotasks gom chung vào 1 hàng đợi duy nhất.
* **Ở Node.js:** Libuv chia Macrotask thành **4 hàng đợi chuyên biệt (Task Queues)** và duyệt qua chúng theo chiều kim đồng hồ:

```text
                       ┌────────────────────────┐
                    ┌─>│    1. TIMER QUEUE      │ ⏰ setTimeout(), setInterval()
                    │  └───────────┬────────────┘
                    │              │
                    │  ┌───────────▼────────────┐
                    │  │     2. I/O QUEUE       │ 📥 Callback đọc file, kết nối mạng
                    │  └───────────┬────────────┘
                    │              │
                    │  ┌───────────▼────────────┐
                    │  │    3. CHECK QUEUE      │ ⚡ setImmediate()
                    │  └───────────┬────────────┘
                    │              │
                    │  ┌───────────▼────────────┐
                    │  │    4. CLOSE QUEUE      │ 🚪 socket.on('close')
                    └──┴────────────────────────┘
```

### Chi tiết 4 hàng đợi:
1. **Timer Queue:** Chứa callback của `setTimeout()` và `setInterval()` sau khi thời gian hẹn giờ đã hết hạn.
2. **I/O Queue:** Chứa callback của các tác vụ I/O đã hoàn tất (ví dụ: đã đọc xong file từ ổ cứng, đã nhận được phản hồi từ mạng).
3. **Check Queue:** Dành riêng cho callback của `setImmediate()`. Hàng đợi này luôn chạy **ngay sau** I/O Queue.
4. **Close Queue:** Chứa các callback dọn dẹp khi kết nối hoặc luồng dữ liệu bị đóng (ví dụ: `socket.on('close', ...)`).

*(Lưu ý: Tài liệu chính thức của Node.js nhắc đến 6 pha, trong đó có pha Idle/Prepare dùng cho nội bộ Libuv và Pending Callbacks dùng cho lỗi hệ thống từ vòng trước. Về mặt lập trình ứng dụng, 4 hàng đợi trên là những gì code tương tác trực tiếp).*

---

## ⚡ Phần 3: 2 Hàng Đợi Ưu Tiên Microtasks

Bên cạnh 4 hàng đợi Macrotask kể trên, Node.js có **2 hàng đợi Microtask** với quyền **ưu tiên cao hơn**:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │ CẤP 1 (Tối cao): V8 Call Stack (Code đồng bộ chạy ngay)    │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Khi Call Stack rỗng
 ┌──────────────────────────────▼──────────────────────────────┐
 │ CẤP 2: nextTickQueue (process.nextTick)                     │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Khi nextTickQueue đã rỗng
 ┌──────────────────────────────▼──────────────────────────────┐
 │ CẤP 3: promiseQueue (Promise.then, catch, async/await)      │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Khi cả 2 Microtask Queues đều rỗng
 ┌──────────────────────────────▼──────────────────────────────┐
 │ CẤP 4: Macrotask Queues (Timer → I/O → Check → Close)       │
 └─────────────────────────────────────────────────────────────┘
```

### 🧠 Cơ chế xen kẽ (Interleaving Rule):
1. Code đồng bộ trên **Call Stack** luôn chạy trước tiên cho đến khi ngăn xếp trống hoàn toàn.
2. Trước khi bước vào bất kỳ hàng đợi Macrotask nào, hoặc **sau khi hoàn thành mỗi callback**, Node.js luôn quay lại dọn sạch:
   - Toàn bộ callback trong `nextTickQueue`.
   - Tiếp theo là toàn bộ callback trong `promiseQueue`.
3. Chỉ khi cả 2 hàng đợi Microtask đều **rỗng**, Event Loop mới lấy callback tiếp theo từ Macrotask Queue.

### 🚨 Bẫy Starvation (Làm nghẽn Event Loop do Microtask):
```javascript
function recursiveTick() {
  process.nextTick(recursiveTick);
}
recursiveTick();
```
* **Hậu quả:** `nextTickQueue` liên tục được nạp mới và không bao giờ rỗng. Event Loop bị giữ chân vĩnh viễn ở Cấp 2, không thể bước sang I/O Queue để nhận request mới. Server bị "đóng băng" hoàn toàn.

---

## 🧪 Phần 4: 3 Bài Tập Truy Vết Code Thực Tế (Tracing Exercises)

---

### 📝 Bài Tập 1: Thứ Tự Cơ Bản Giữa Sync, Microtasks và Macrotasks

#### Đoạn code:
```javascript
console.log('1 - Sync Start');

setTimeout(() => {
  console.log('2 - setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('3 - Promise');
});

process.nextTick(() => {
  console.log('4 - nextTick');
});

console.log('5 - Sync End');
```

#### Bảng chuyển đổi trạng thái (State Transition):

| Bước | Lệnh chạy | Call Stack | nextTickQueue | promiseQueue | Timer Queue | Console In Ra |
|:---:|---|---|---|---|---|---|
| **1** | `console.log('1')` | Đang chạy | Rỗng | Rỗng | Rỗng | `1 - Sync Start` |
| **2** | `setTimeout(..., 0)` | Đăng ký timer | Rỗng | Rỗng | `[cb2]` | *(chưa in)* |
| **3** | `Promise.then(...)` | Đăng ký microtask | Rỗng | `[cb3]` | `[cb2]` | *(chưa in)* |
| **4** | `process.nextTick(...)` | Đăng ký microtask | `[cb4]` | `[cb3]` | `[cb2]` | *(chưa in)* |
| **5** | `console.log('5')` | Đang chạy | `[cb4]` | `[cb3]` | `[cb2]` | `5 - Sync End` |
| **6** | Xả `nextTickQueue` | Chạy `cb4` | Rỗng | `[cb3]` | `[cb2]` | `4 - nextTick` |
| **7** | Xả `promiseQueue` | Chạy `cb3` | Rỗng | Rỗng | `[cb2]` | `3 - Promise` |
| **8** | Event Loop vào Timer | Chạy `cb2` | Rỗng | Rỗng | Rỗng | `2 - setTimeout` |

#### 🎯 Kết quả in ra Console:
```text
1 - Sync Start
5 - Sync End
4 - nextTick
3 - Promise
2 - setTimeout
```

---

### 📝 Bài Tập 2: `setTimeout(fn, 0)` vs `setImmediate(fn)`

#### Trường hợp 1: Chạy ở phạm vi toàn cục (Top-level scope)
```javascript
setTimeout(() => {
  console.log('setTimeout');
}, 0);

setImmediate(() => {
  console.log('setImmediate');
});
```
* **Kết quả:** **Không cố định (Non-deterministic)**. Có lần `setTimeout` in trước, có lần `setImmediate` in trước.
* **Nguyên nhân:**
  * Tham số `0` trong `setTimeout(fn, 0)` được Node.js/V8 quy định tối thiểu là `1ms`.
  * Khi Node.js khởi động tiến trình, nếu việc tải mã nguồn mất **dưới 1ms**, khi Event Loop bước vào Timer Queue thì mốc 1ms **chưa trôi qua** $\rightarrow$ Timer bỏ qua, Event Loop đi tiếp sang Check Queue và chạy `setImmediate` trước.
  * Nếu quá trình tải mã nguồn mất **trên 1ms**, timer đã hết hạn $\rightarrow$ `setTimeout` chạy trước.

#### Trường hợp 2: Chạy bên trong một I/O Callback
```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('setTimeout');
  }, 0);

  setImmediate(() => {
    console.log('setImmediate');
  });
});
```
* **Kết quả:** **Luôn luôn 100% cố định (Deterministic)**:
  ```text
  setImmediate
  setTimeout
  ```
* **Nguyên nhân:**
  * Callback của `fs.readFile` đang được thực thi tại **I/O Queue**.
  * Sau khi I/O Queue xử lý xong, pha kế tiếp ngay sau đó theo chiều kim đồng hồ là **Check Queue** (nơi chứa `setImmediate`).
  * Vì vậy, `setImmediate` luôn được lấy ra chạy ngay lập tức. Sau đó Event Loop mới đi qua Close Queue và quay trở lại Timer Queue ở vòng lặp kế tiếp để chạy `setTimeout`.

---

### 📝 Bài Tập 3: Callbacks Lồng Nhau & Cơ Chế Xen Kẽ (Interleaving)

#### Đoạn code:
```javascript
setTimeout(() => {
  console.log('Timer 1');
  process.nextTick(() => {
    console.log('nextTick trong Timer 1');
  });
}, 0);

setTimeout(() => {
  console.log('Timer 2');
}, 0);

setImmediate(() => {
  console.log('Immediate 1');
  Promise.resolve().then(() => {
    console.log('Promise trong Immediate 1');
  });
});
```

#### Phân tích luồng chạy:
1. Event Loop vào **Timer Queue**, lấy callback đầu tiên ra chạy $\rightarrow$ In: `Timer 1`.
2. Trong lúc `Timer 1` chạy, nó đăng ký một `process.nextTick`.
3. **Quy tắc xen kẽ (từ Node.js 11+):** Ngay khi một callback trong Macrotask hoàn tất, Node.js kiểm tra và xả sạch Microtask Queue ngay lập tức trước khi chạy callback tiếp theo $\rightarrow$ In: `nextTick trong Timer 1`.
4. Event Loop tiếp tục chạy callback thứ hai trong Timer Queue $\rightarrow$ In: `Timer 2`.
5. Chuyển sang **Check Queue**, chạy callback `setImmediate` $\rightarrow$ In: `Immediate 1`.
6. Ngay sau khi `Immediate 1` chạy xong, Microtask `promiseQueue` được xả sạch $\rightarrow$ In: `Promise trong Immediate 1`.

#### 🎯 Kết quả in ra Console:
```text
Timer 1
nextTick trong Timer 1
Timer 2
Immediate 1
Promise trong Immediate 1
```

---

## 🧵 Phần 5: Libuv Thread Pool & Thực Nghiệm Đa Luồng

Mặc định biến môi trường `UV_THREADPOOL_SIZE` là **4**. Điều này có nghĩa là Libuv có sẵn 4 worker threads chạy ngầm.

### Đoạn code thực nghiệm (từ file test `03-event-loop-phases.test.js`):
```javascript
const crypto = require('crypto');
const start = Date.now();

for (let i = 0; i < 4; i++) {
  crypto.pbkdf2('secret', 'salt', 100000, 512, 'sha512', () => {
    console.log(`Tác vụ ${i + 1} hoàn thành sau: ${Date.now() - start}ms`);
  });
}
```

* **Hiện tượng:** Cả 4 tác vụ đều hoàn tất cùng thời điểm (khoảng 50ms - 80ms) thay vì phải chờ nối đuôi nhau mất 200ms - 300ms.
* **Giải thích:** Libuv phân chia đồng thời 4 tác vụ cho 4 worker threads riêng biệt.
* Nếu tăng lên 8 tác vụ với pool size mặc định là 4: 4 tác vụ đầu hoàn tất ở mốc ~60ms, và 4 tác vụ sau phải xếp hàng chờ và hoàn tất ở mốc ~120ms.

---

## 🛡️ Phần 6: "Don't Block the Event Loop" (4 Lỗi Thường Gặp & Cách Khắc Phục)

Vì JavaScript chạy trên 1 luồng chính duy nhất, nếu luồng này bị nghẽn thì toàn bộ các request khác gửi tới server sẽ bị treo.

| Lỗi phổ biến | Tác hại | Giải pháp kỹ thuật |
|---|---|---|
| **1. Dùng hàm I/O đồng bộ** (`fs.readFileSync`) trong route xử lý API | Chặn đứng Call Stack, không ai request được trong lúc đọc đĩa | Luôn dùng API bất đồng bộ: `await fs.promises.readFile()` |
| **2. Parse dữ liệu JSON lớn** (`JSON.parse` file 200MB) | Chiếm giữ Call Stack vài giây để duyệt cây JSON | Sử dụng **Stream** kết hợp thư viện stream parser (ví dụ: `stream-json`) |
| **3. Tính toán nặng CPU** (xử lý ảnh, mã hóa dữ liệu lớn) | Làm đơ Event Loop, request bị timeout (504) | Đẩy tác vụ sang **`worker_threads`** hoặc dịch vụ nền riêng |
| **4. Biểu thức Regex không tối ưu (ReDoS)** | Thuật toán regex bị lặp đệ quy quay lui khi gặp chuỗi độc hại | Dùng thư viện regex an toàn (`re2`) hoặc giới hạn độ dài input trước khi kiểm tra |

---

## 🗣️ Phần 7: Kịch Bản Trả Lời Phỏng Vấn Bằng Tiếng Anh

Dưới đây là 3 câu hỏi phỏng vấn thường gặp ở vị trí Backend Engineer kèm câu trả lời ngắn gọn, chuẩn xác:

---

### ❓ Question 1: *"How does Node.js handle high concurrency despite being single-threaded?"*
> *"Node.js executes JavaScript on a single thread using the V8 engine. However, high concurrency is achieved by delegating asynchronous tasks to **Libuv** and the **OS Kernel**.*  
> *For network I/O, it relies on non-blocking OS mechanisms such as **`epoll` on Linux**, allowing thousands of socket connections without dedicating a thread per connection.*  
> *For operations that cannot be handled non-blockingly by the kernel—such as file system access and cryptographic computations—Libuv delegates them to a **Thread Pool** of background workers.*  
> *Once an operation finishes, its callback is placed into the Event Loop to run on the main thread."*

---

### ❓ Question 2: *"What is the difference between process.nextTick, Promise.then, and setTimeout?"*
> *"The primary difference is their execution priority within the runtime:*  
> *1. **`process.nextTick`** is a microtask with the highest priority. It runs immediately after the current operation finishes, before any other phase.*  
> *2. **`Promise.then`** is also a microtask, but it is processed right after the `nextTick` queue is completely drained.*  
> *3. **`setTimeout`** is a macrotask scheduled in the **Timer phase** of the Event Loop, running only after its minimum threshold has elapsed.*  
> *In summary: Synchronous code runs first, then `nextTick`, then Promises, and finally the Event Loop task queues."*

---

### ❓ Question 3: *"How do you prevent blocking the Event Loop in production?"*
> *"To keep the main thread responsive, I adhere to four practical guidelines:*  
> *First, **never use synchronous I/O APIs** like `fs.readFileSync` in HTTP request handlers.*  
> *Second, for processing large payloads or exports, use **Node.js Streams** instead of loading entire datasets into memory with `JSON.parse`.*  
> *Third, offload CPU-intensive tasks, such as heavy data transformation or encryption, to **Worker Threads**.*  
> *Finally, validate input length to protect regular expressions against **ReDoS** vulnerabilities."*

---

## 🎯 Phần 8: Bảng Cheat-Sheet Tóm Tắt Nhanh

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     THỨ TỰ THỰC THI (Từ trên xuống dưới)                │
├──────────────────────┬───────────────────┬──────────────────────────────┤
│ CƠ CHẾ               │ VỊ TRÍ XỬ LÝ      │ ĐẶC ĐIỂM & ĐỘ ƯU TIÊN        │
├──────────────────────┼───────────────────┼──────────────────────────────┤
│ Code đồng bộ         │ V8 Call Stack     │ Chạy ngay lập tức            │
├──────────────────────┴───────────────────┴──────────────────────────────┤
│ 👑 MICROTASKS (Dọn sạch sau mỗi tác vụ, trước khi đổi pha)               │
├──────────────────────┬───────────────────┬──────────────────────────────┤
│ • process.nextTick   │ nextTickQueue     │ Ưu tiên 1: Chạy trước hết    │
│ • Promise.then/await │ promiseQueue      │ Ưu tiên 2: Chạy sau nextTick │
├──────────────────────┴───────────────────┴──────────────────────────────┤
│ 🎟️ MACROTASKS (4 Hàng đợi tuần hoàn của Libuv Event Loop)              │
├──────────────────────┬───────────────────┬──────────────────────────────┤
│ 1. setTimeout        │ Timer Queue       │ Chạy khi timer hết hạn       │
│ 2. fs / network cb   │ I/O Queue         │ Hứng kết quả I/O hoàn thành  │
│ 3. setImmediate      │ Check Queue       │ Chạy ngay sau I/O Queue      │
│ 4. socket.on('close')│ Close Queue       │ Dọn dẹp tài nguyên kết thúc  │
├──────────────────────┴───────────────────┴──────────────────────────────┤
│ ⚙️ TẦNG HẠ TẦNG C++                                                      │
├──────────────────────┬───────────────────┬──────────────────────────────┤
│ • Network / TCP / DB │ OS Kernel (epoll) │ Không tốn worker thread      │
│ • fs / crypto / dns  │ Libuv Thread Pool │ 4 worker threads chạy ngầm   │
└──────────────────────┴───────────────────┴──────────────────────────────┘

📌 Quy tắc nhớ nhanh:
   Sync Code → process.nextTick → Promise.then → Timer → I/O → setImmediate → Close
```
