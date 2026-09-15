# 📚 Node.js Event Loop — Giải Thích Từ Dễ Đến Khó (HCLTech x ANZ)

> **Mục tiêu:** Sau khi đọc xong tài liệu này, bạn có thể giải thích Event Loop bằng ví dụ đời thường **trước**, rồi mới dùng thuật ngữ kỹ thuật khi cần. Đây là cách trả lời phỏng vấn ANZ gây ấn tượng nhất với Senior Architect.

---

### 📺 Xem Video Trước Khi Đọc (Hiệu Quả Hơn Nhiều):
* 🏆 **[This is how the Node.js Event Loop really works](https://youtu.be/paI6J8my3Yw)** *(Software Developer Diaries)* — Video chuẩn nhất, có animation minh họa từng bước.
* 🌐 **[JavaScript Event Loop & Asynchronous Programming](https://youtu.be/jzOy07fw2vY)** *(freeCodeCamp)* — Video về Browser (Frontend), xem để không bị nhầm lẫn.

---

## 🏦 Phần 1: Bức Tranh Tổng Thể — Node.js Như Một Quầy Giao Dịch Ngân Hàng

### Hình dung trước:

Tưởng tượng một **quầy giao dịch ngân hàng ANZ** vào giờ cao điểm:

```
                    ┌──────────────────────────────────┐
                    │   KHÁCH HÀNG (JavaScript Code)   │
                    └──────────────┬───────────────────┘
                                   │ đến quầy
                    ┌──────────────▼───────────────────┐
                    │  🧑‍💼 GIAO DỊCH VIÊN DUY NHẤT     │  ← V8 Engine (Main Thread)
                    │  (Chỉ làm 1 việc tại 1 thời điểm)│    Call Stack = tờ giấy "việc đang làm"
                    └──────┬────────────────────┬───────┘
                           │                    │
           Cần photo giấy  │                    │ Cần gọi điện
           tờ / mã hóa tài │                    │ cho ngân hàng đối tác
           liệu nặng       │                    │
          ┌────────────────▼──┐      ┌──────────▼────────────────┐
          │ 👨‍👩‍👦 NHÓM HỖ TRỢ    │      │  ☎️ ĐƯỜNG HOTLINE TRỰC TIẾP │
          │ PHÍA SAU (4 người) │      │  (OS Kernel: epoll/kqueue)  │
          │ = Libuv Thread Pool│      │  Không cần người trực!      │
          └────────────────────┘      └────────────────────────────┘
```

### 3 điểm cốt lõi từ hình trên:

**① Giao dịch viên chỉ có 1 người** — Đây là JavaScript Main Thread. Mọi code `.js` của bạn chạy trên người này. Nếu bạn bắt họ đi photocopy tự tay → cả hàng dài khách đứng chờ!

**② Nhóm hỗ trợ phía sau có 4 người** — Đây là **Libuv Thread Pool** (mặc định 4 worker threads). Giao dịch viên sẽ chuyển việc nặng cho họ: đọc/ghi file, mã hóa, nén dữ liệu. Khi xong, họ đặt kết quả vào hộp thư để giao dịch viên lấy sau.

**③ Đường hotline OS Kernel không cần người trực** — Khi cần gọi đến ngân hàng đối tác qua mạng (HTTP request, kết nối Database, TCP socket), Node.js sử dụng cơ chế `epoll` (Linux) / `kqueue` (macOS) của hệ điều hành. Kernel tự thông báo khi có phản hồi về, **không cần chiếm người nào trong nhóm hỗ trợ cả**.

### Ánh xạ kỹ thuật:
| Hình ảnh quầy ngân hàng | Thuật ngữ kỹ thuật | Ghi chú |
|---|---|---|
| Giao dịch viên duy nhất | **V8 Engine / Main Thread** | Chạy toàn bộ code `.js` của bạn |
| Tờ giấy "việc đang làm" | **Call Stack** | Stack LIFO — hàm nào gọi sau thì xong trước |
| Nhóm hỗ trợ 4 người phía sau | **Libuv Thread Pool** | File I/O, Crypto, Zlib, DNS |
| Đường hotline OS (không cần người trực) | **OS Kernel (`epoll` / `kqueue`)** | Network I/O, TCP Socket, Database connections |
| Hộp thư kết quả từ nhóm hỗ trợ | **Task Queues (Event Loop)** | Nơi callback chờ được thực thi |

> 📌 **Câu trả lời phỏng vấn kinh điển:** *"Node.js is single-threaded for JavaScript execution, but the underlying C++ runtime managed by Libuv is multi-threaded. Network I/O goes through the non-blocking OS kernel, while heavy operations like file access and cryptography use a background thread pool."*

---

## 📬 Phần 2: Phe Vé Thường (Macrotasks) — 4 Hộp Thư Inbox Của Event Loop

### 💡 Cả 4 hộp này cùng chung một cái tên lớn: MACROTASK QUEUE
*(hay còn gọi là **Task Queue** hoặc **Callback Queue**)*

Trong thế giới JavaScript, toàn bộ các tác vụ bất đồng bộ thực ra chỉ chia làm **2 phe lớn**:
* 👑 **Phe VIP (Microtasks):** `process.nextTick`, `Promise.then` — luôn được ưu tiên chen ngang phục vụ trước (xem chi tiết ở Phần 3).
* 🎟️ **Phe Vé Thường (Macrotasks):** Tất cả những tác vụ còn lại (`setTimeout`, `setImmediate`, đọc file, nhận data mạng...).

> 🔄 **Khác biệt quan trọng giữa Trình duyệt và Node.js:**
> * **Ở Trình duyệt (Browser):** Gom tất cả các tác vụ Macrotask vào **đúng 1 hàng đợi duy nhất** (`Macrotask Queue`).
> * **Ở Node.js (Backend / Libuv):** Để điều phối hiệu quả, Libuv **chia nhỏ Macrotask thành 4 hộp thư chuyên biệt** tuần hoàn theo chiều kim đồng hồ:

### Hình dung trước:

Sau khi nhóm hỗ trợ xong việc, họ **không đến tay giao dịch viên ngay** — họ bỏ kết quả vào **4 hộp thư Macrotask riêng** trên bàn làm việc. Giao dịch viên sẽ xử lý hộp thư theo **thứ tự cố định, từ trái sang phải, lặp đi lặp lại**:

```
  ┌──────────────────────────────────────────────────────────┐
  │              BÀN LÀM VIỆC CỦA GIAO DỊCH VIÊN            │
  │                                                          │
  │  ┌───────────┐  ┌───────────┐  ┌──────────┐  ┌────────┐ │
  │  │ 📬 HỘP 1  │→ │ 📬 HỘP 2  │→ │ 📬 HỘP 3 │→ │📬 HỘP 4│ │
  │  │  TIMER    │  │   I/O     │  │  CHECK   │  │ CLOSE  │ │
  │  │           │  │           │  │(setImm.) │  │        │ │
  │  └───────────┘  └───────────┘  └──────────┘  └────────┘ │
  │       ↑_______________________________________________↵   │
  │                      (vòng lặp liên tục)                 │
  └──────────────────────────────────────────────────────────┘
```

Mỗi vòng, giao dịch viên lần lượt kiểm tra từng hộp, xử lý hết rồi chuyển sang hộp tiếp theo.

### Chi tiết 4 hộp thư:

**📬 Hộp 1 — TIMER QUEUE** *(chuông hẹn giờ)*  
Chứa các callback của `setTimeout()` và `setInterval()`. Giống như cái chuông hẹn giờ trên bàn — khi chuông reo (timer hết hạn), giao dịch viên mới mở hộp này ra làm.

**📬 Hộp 2 — I/O QUEUE** *(tài liệu từ phòng hồ sơ gửi lên)*  
Khi nhóm hỗ trợ đọc file xong hoặc có phản hồi mạng về, họ bỏ kết quả vào đây. Callback của `fs.readFile()`, `http.request()`, v.v. đều chờ ở hộp này.

**📬 Hộp 3 — CHECK QUEUE** *(ghi chú dán "làm ngay khi xong hộp 2")*  
Dành riêng cho `setImmediate()`. Đây là hộp đặc biệt luôn được kiểm tra **ngay sau** Hộp 2 (I/O Queue). Rất hữu ích khi bạn muốn chạy code "ngay sau khi I/O xong" mà không cần chờ đến vòng lặp tiếp theo.

**📬 Hộp 4 — CLOSE QUEUE** *(thủ tục đóng file)*  
Chứa các callback dọn dẹp khi kết nối bị đóng: `socket.on('close')`, `stream.on('close')`. Giống như thủ tục ký giấy đóng hồ sơ trước khi kết thúc ca làm việc.

> ℹ️ **Tài liệu chính thức Node.js nói "6 pha"** — 2 pha còn lại (*Idle/Prepare* và *Pending Callbacks*) là cơ chế nội bộ của Libuv, developer không tương tác trực tiếp. 4 hộp trên là những gì code của bạn thực sự chạy qua.

---

## 👑 Phần 3: 2 Cửa VIP — Microtask Queues Không Bao Giờ Xếp Hàng

### Hình dung trước:

Bên cạnh 4 hộp thư bình thường, quầy ngân hàng ANZ có **2 cửa VIP đặc biệt** không bao giờ phải xếp hàng:

```
                     BÀN GIAO DỊCH VIÊN
                            │
         ┌──────────────────┤
         │                  │
  ┌──────▼──────┐           │
  │ 🚨 CỬA VIP 1│           │
  │  Giám đốc   │ ← process.nextTick()
  │  chi nhánh  │   "Dừng ngay! Tôi cần duyệt thứ này trước"
  └──────┬──────┘           │
         │ (GĐ ra rồi)      │
  ┌──────▼──────┐           │
  │ ⭐ CỬA VIP 2│           │
  │  Khách VIP  │ ← Promise.then() / async-await
  │  Platinum   │   "Không xếp hàng hộp thư thường đâu nhé"
  └──────┬──────┘           │
         │ (VIP ra rồi)     │
         └──────────────────┘
                │
                ▼
      Mới xử lý 4 hộp thư bình thường
      (Timer → I/O → Check → Close)
```

### Quy tắc VIP (quan trọng nhất cần nhớ!):

> **Sau MỖI tác vụ hoàn thành** — dù là tác vụ từ hộp nào — giao dịch viên đều phải **kiểm tra và xử lý hết cửa VIP 1, rồi VIP 2** trước khi lấy tác vụ tiếp theo!

Cụ thể theo 3 bước:
1. ✅ Code đồng bộ trên Call Stack chạy xong.
2. 🚨 Dọn sạch **toàn bộ** `nextTickQueue` (cửa VIP 1 — `process.nextTick`).
3. ⭐ Dọn sạch **toàn bộ** `promiseQueue` (cửa VIP 2 — `Promise.then`, `async/await`).
4. 📬 **Mới được** lấy 1 tác vụ tiếp theo từ 4 hộp thư bình thường.

### ⚠️ Bẫy Starvation — Khi Giám Đốc Không Bao Giờ Ra:

```javascript
// ❌ ĐỪNG BAO GIỜ LÀM THẾ NÀY trong production:
function giamdocKhongBaoGioRa() {
  process.nextTick(giamdocKhongBaoGioRa); // GĐ gọi thêm GĐ mãi mãi
}
giamdocKhongBaoGioRa();

// Hậu quả: Server đứng hình 100%!
// Hộp I/O không bao giờ được mở → khách hàng ngân hàng không giao dịch được!
```

**Tại sao?** Cửa VIP 1 (`nextTickQueue`) không bao giờ rỗng → giao dịch viên mãi mắc kẹt ở đó → 4 hộp thư bình thường không bao giờ được xử lý → mọi kết nối mạng đứng chết.

---

## 🧪 Phần 4: 3 Bài Tập Thực Hành — Đọc Code Như Giao Dịch Viên

Hãy luyện kỹ năng "truy vết" — đọc code và đoán ra console sẽ in gì theo thứ tự nào.

---

### 📝 Bài 1: Phân Loại Tác Vụ Vào Đúng Hộp

```javascript
console.log('A - Sync Start');          // ← đây là gì?

setTimeout(() => {
  console.log('B - setTimeout');        // ← vào hộp nào?
}, 0);

Promise.resolve().then(() => {
  console.log('C - Promise');           // ← vào đâu?
});

process.nextTick(() => {
  console.log('D - nextTick');          // ← vào đâu?
});

console.log('E - Sync End');            // ← đây là gì?
```

#### Phân tích theo hình ảnh quầy ngân hàng:

Khi code chạy, giao dịch viên xử lý từng dòng theo thứ tự từ trên xuống:

| Bước | Giao dịch viên làm gì | In ra |
|---|---|---|
| 1 | Thấy `console.log('A')` → làm ngay (code đồng bộ) | **A - Sync Start** |
| 2 | Thấy `setTimeout` → đặt chuông hẹn giờ, bỏ callback vào 📬 Hộp 1 | *(chưa in)* |
| 3 | Thấy `Promise.then` → gửi callback lên ⭐ Cửa VIP 2 | *(chưa in)* |
| 4 | Thấy `process.nextTick` → gửi callback lên 🚨 Cửa VIP 1 | *(chưa in)* |
| 5 | Thấy `console.log('E')` → làm ngay (code đồng bộ) | **E - Sync End** |
| 6 | Hết việc trên bàn! Kiểm tra cửa VIP 1 trước → thấy `D` → làm | **D - nextTick** |
| 7 | VIP 1 rỗng → kiểm tra VIP 2 → thấy `C` → làm | **C - Promise** |
| 8 | Cả 2 VIP rỗng → mở 📬 Hộp 1 (Timer) → thấy `B` → làm | **B - setTimeout** |

#### 🎯 Kết quả console:
```
A - Sync Start
E - Sync End
D - nextTick
C - Promise
B - setTimeout
```

---

### 📝 Bài 2: setTimeout(0) vs setImmediate — Câu Hỏi Bẫy Kinh Điển

#### Kịch bản A: Đặt ở ngoài cùng (top-level)

```javascript
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));
```

**Kết quả: NGẪU NHIÊN** — Có lúc `setTimeout` trước, có lúc `setImmediate` trước!

**Tại sao lại ngẫu nhiên?**

Hãy nghĩ thế này: Bạn vừa đặt chuông hẹn giờ **1 giây** (tức `setTimeout 0ms` thực chất bị hệ điều hành làm tròn thành tối thiểu **1ms**).

Câu hỏi là: Khi giao dịch viên bắt đầu mở 📬 Hộp 1 (Timer), **chuông đã reo chưa?**
- Nếu chương trình khởi động nhanh < 1ms → Chuông **chưa reo** → Hộp 1 bỏ qua → Nhảy sang 📬 Hộp 3 (Check) → **`setImmediate` chạy trước**.
- Nếu khởi động chậm > 1ms → Chuông **đã reo** → 📬 Hộp 1 có việc → **`setTimeout` chạy trước**.

#### Kịch bản B: Đặt BÊN TRONG I/O callback (đọc file)

```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
  // Chúng ta đang trong 📬 Hộp 2 (I/O Queue) lúc này!
  setTimeout(() => console.log('setTimeout'), 0);
  setImmediate(() => console.log('setImmediate'));
});
```

**Kết quả: LUÔN LUÔN `setImmediate` trước — 100% tất định!**

**Tại sao lại chắc chắn?**

Callback của `fs.readFile` đang chạy ở 📬 **Hộp 2 (I/O Queue)**. Sau khi Hộp 2 xong, giao dịch viên đi đâu tiếp theo?

```
→ Hộp 2 (I/O) xong
→ Kiểm tra VIP (không có gì)
→ Hộp 3 (CHECK / setImmediate) ← setImmediate chạy ở đây!
→ Hộp 4 (Close)
→ Vòng mới: Hộp 1 (Timer) ← setTimeout chạy ở đây, vòng sau!
```

`setImmediate` **luôn thắng** khi đặt trong I/O callback, vì nó ở hộp ngay sau!

> 🎯 **Tip phỏng vấn:** Câu trả lời chuẩn là: *"Outside an I/O cycle, the order is non-deterministic due to timer resolution. But inside an I/O callback, `setImmediate` always wins because the Event Loop goes directly from I/O to the Check phase."*

---

### 📝 Bài 3: Quy Tắc Xen Kẽ — VIP Được Phục Vụ Sau Mỗi Tác Vụ

```javascript
setTimeout(() => {
  console.log('Timer 1');               // Hộp 1, tác vụ đầu tiên
  process.nextTick(() => {
    console.log('NextTick in Timer 1'); // VIP 1 được đăng ký trong lúc làm Hộp 1
  });
}, 0);

setTimeout(() => {
  console.log('Timer 2');               // Hộp 1, tác vụ thứ hai
}, 0);

setImmediate(() => {
  console.log('Immediate 1');           // Hộp 3
  Promise.resolve().then(() => {
    console.log('Promise in Immediate'); // VIP 2 trong lúc làm Hộp 3
  });
});
```

**Quy tắc quan trọng từ Node.js v11+:**  
> Sau khi xử lý **mỗi callback đơn lẻ** trong bất kỳ hộp nào, giao dịch viên phải **ghé qua 2 cửa VIP** trước khi lấy callback tiếp theo — kể cả khi cả 2 callback đều cùng hộp!

#### Truy vết từng bước:

| Bước | Hành động | In ra |
|---|---|---|
| 1 | Mở 📬 Hộp 1, lấy `Timer 1` chạy | **Timer 1** |
| 2 | `Timer 1` xong → thấy nextTick mới đăng ký → ghé VIP 1 | **NextTick in Timer 1** |
| 3 | VIP xong → quay lại Hộp 1, lấy `Timer 2` chạy | **Timer 2** |
| 4 | `Timer 2` xong → VIP rỗng → qua 📬 Hộp 3, lấy `Immediate 1` | **Immediate 1** |
| 5 | `Immediate 1` xong → thấy Promise mới → ghé VIP 2 | **Promise in Immediate** |

#### 🎯 Kết quả console:
```
Timer 1
NextTick in Timer 1
Timer 2
Immediate 1
Promise in Immediate
```

---

## 🧵 Phần 5: Khi Nào Dùng Nhóm Hỗ Trợ? Khi Nào Gọi Hotline?

### Hình dung lại:

Giao dịch viên có **2 cách để không phải tự làm việc nặng:**
- 🤙 **Gọi hotline OS** (nhanh, không tốn người): cho các tác vụ mạng như HTTP, TCP, Database connections.
- 👨‍👩‍👦 **Giao việc cho nhóm hỗ trợ** (dùng 1 trong 4 người): cho các tác vụ đọc/ghi file, mã hóa, nén dữ liệu.

### Bảng phân việc:

| Loại tác vụ | Ai xử lý? | Tốn worker thread không? |
|---|---|---|
| HTTP request, Database query, TCP socket | **OS Kernel** (`epoll`/`kqueue`) | ❌ Không — kernel báo lại khi có data |
| `fs.readFile`, `fs.writeFile` | **Thread Pool** | ✅ Chiếm 1 người trong nhóm 4 |
| `crypto.pbkdf2`, `bcrypt` (mã hóa) | **Thread Pool** | ✅ Chiếm 1 người |
| `zlib.gzip` (nén file) | **Thread Pool** | ✅ Chiếm 1 người |
| `dns.lookup` (phân giải tên miền) | **Thread Pool** | ✅ Chiếm 1 người |

### Thực nghiệm — 4 người nhóm hỗ trợ chạy song song:

```javascript
const crypto = require('crypto');
const start = Date.now();

// Đẩy 4 tác vụ mã hóa xuống Thread Pool cùng lúc:
for (let i = 0; i < 4; i++) {
  crypto.pbkdf2('secret', 'salt', 100000, 512, 'sha512', () => {
    console.log(`Task ${i + 1} xong sau: ${Date.now() - start}ms`);
  });
}
// Kết quả thực tế: Cả 4 hoàn thành gần cùng lúc (~70ms)
// Nếu chạy tuần tự: phải mất ~280ms!
```

> 📌 **Tip nâng cao:** Trên server nhiều CPU (như AWS EC2 c5.4xlarge), bạn có thể tăng `UV_THREADPOOL_SIZE = 16` trong `process.env` để xử lý nhiều tác vụ file/crypto song song hơn cho batch processing dữ liệu ngân hàng.

---

## 🛡️ Phần 6: "Don't Block the Event Loop" — 4 Lỗi Gây Sập Hệ Thống Ngân Hàng

### Hình dung:

> **Giao dịch viên bị chiếm hết thời gian = toàn bộ hàng khách đứng chờ.**  
> Trong Node.js, nếu Main Thread bị block, **mọi request HTTP đến đều không được xử lý** → timeout → khách hàng mất tiền, ngân hàng mất uy tín.

### 4 Thủ Phạm & Cách Xử Lý:

**❌ Thủ phạm 1: Giao dịch viên tự đi photocopy (Sync I/O)**
```javascript
// SAI — Giao dịch viên tự làm, block cả hàng:
const data = fs.readFileSync('transactions.csv'); // ❌

// ĐÚNG — Giao cho nhóm hỗ trợ, giao dịch viên tiếp tục phục vụ:
const data = await fs.promises.readFile('transactions.csv'); // ✅
```

**❌ Thủ phạm 2: Mở cả tủ hồ sơ 500MB lên bàn một lúc (JSON khổng lồ)**
```javascript
// SAI — Nạp nguyên 500MB vào RAM, parse mất 10 giây:
const report = JSON.parse(fs.readFileSync('annual-report.json')); // ❌

// ĐÚNG — Đọc từng tờ một (stream):
const stream = fs.createReadStream('annual-report.json').pipe(StreamJson.parser()); // ✅
```

**❌ Thủ phạm 3: Giao dịch viên tự tính điểm tín dụng cho 10,000 khách (CPU nặng)**
```javascript
// SAI — Block Main Thread hàng chục giây:
const score = calculateCreditScore(hugeDataset); // ❌

// ĐÚNG — Giao cho Worker Thread riêng:
const { Worker } = require('worker_threads');
new Worker('./credit-scoring-worker.js', { workerData: hugeDataset }); // ✅
```

**❌ Thủ phạm 4: Regex bẫy — hacker gửi chuỗi làm server tê liệt (ReDoS)**
```javascript
// SAI — Regex có thể bị khai thác để chạy mãi mãi:
const isMalicious = /^(a+)+$/.test(userInput); // ❌ ReDoS vulnerability

// ĐÚNG — Dùng thư viện an toàn hoặc giới hạn độ dài:
const RE2 = require('re2');
const safeRegex = new RE2(/^(a+)+$/);
if (userInput.length < 1000) safeRegex.test(userInput); // ✅
```

---

## 🗣️ Phần 7: Kịch Bản Tiếng Anh Phỏng Vấn ANZ — 3 Câu Hỏi Kinh Điển

> **Mẹo:** Mở đầu mỗi câu bằng hình ảnh ngân hàng, sau đó chuyển sang thuật ngữ kỹ thuật. Nghe tự nhiên và gây ấn tượng mạnh với interviewer hơn là đọc thuộc lòng định nghĩa.

---

### ❓ Câu 1: *"How does Node.js handle high concurrency if it's single-threaded?"*

> *"Great question. Think of Node.js like a bank counter with a single teller, but a very smart one. The teller never does heavy work themselves — they delegate.*
>
> *Technically: JavaScript runs on a single V8 main thread. But Node.js delegates I/O to the operating system kernel via non-blocking mechanisms like `epoll` on Linux, which can monitor thousands of connections without consuming any threads. For CPU-heavy operations like file access or cryptography, it uses a **Libuv thread pool** of 4 worker threads by default.*
>
> *So concurrency isn't achieved through multiple JS threads, but through smart delegation to the OS and background workers. The event loop then picks up results and executes callbacks on the main thread when they're ready."*

---

### ❓ Câu 2: *"What's the difference between setTimeout(fn, 0), setImmediate, and process.nextTick?"*

> *"Three different 'inbox priorities' in the event loop:*
>
> *`process.nextTick` has the highest priority — it's like the branch manager walking in. The teller stops whatever they're doing and handles it immediately, before moving to the next task in any queue.*
>
> *`Promise.then` (and async/await) is second priority — like a VIP Platinum customer. Gets served before the regular queues, but after nextTick.*
>
> *`setTimeout(fn, 0)` goes into the Timer Queue and only runs when the OS timer fires — minimum ~1ms, not truly 'zero'.*
>
> *`setImmediate` goes into the Check Queue, which runs right after the I/O Queue. So inside an I/O callback like `fs.readFile`, `setImmediate` is guaranteed to run before `setTimeout(fn, 0)` because the event loop goes directly from I/O to Check phase, not back to the Timer phase."*

---

### ❓ Câu 3: *"How do you prevent event loop blocking in a high-throughput banking API?"*

> *"I follow four non-negotiables in production banking systems:*
>
> *First, **zero synchronous I/O** in any request path. `fs.readFileSync`, `crypto.pbkdf2Sync` — completely forbidden. Everything is async/await or callback-based.*
>
> *Second, for large data operations like transaction exports or statement generation, I use **Node.js Streams with backpressure**. Never load a 500MB file into memory with `JSON.parse`.*
>
> *Third, any CPU-intensive computation — risk scoring, bulk encryption — gets offloaded to **Worker Threads** or an isolated microservice, keeping the main thread free for incoming requests.*
>
> *Fourth, I audit all regular expressions for **ReDoS vulnerabilities** using tools like `safe-regex`, and enforce input length limits before any regex validation runs."*

---

## 🎯 Phần 8: Cheat-Sheet — Nhìn Là Nhớ Ngay

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXECUTION PRIORITY (Top = Chạy Trước)              │
├──────────────────────┬───────────────────┬──────────────────────────────┤
│ CƠ CHẾ               │ HÌNH ẢNH          │ KHI NÀO CHẠY                │
├──────────────────────┼───────────────────┼──────────────────────────────┤
│ [ĐỒNG BỘ] Sync Code  │ Việc trên bàn     │ Ngay lập tức                 │
├──────────────────────┴───────────────────┴──────────────────────────────┤
│ 👑 PHE VIP (MICROTASKS) — Chen ngang dọn sạch sau mỗi tác vụ            │
├──────────────────────┬───────────────────┬──────────────────────────────┤
│ • process.nextTick   │ 🚨 Giám đốc vào   │ Ưu tiên 1: Chạy trước hết    │
│ • Promise.then/await │ ⭐ Khách VIP       │ Ưu tiên 2: Sau nextTick      │
├──────────────────────┴───────────────────┴──────────────────────────────┤
│ 🎟️ PHE VÉ THƯỜNG (MACROTASKS) — 4 Hộp thư luân phiên của Event Loop     │
├──────────────────────┬───────────────────┬──────────────────────────────┤
│ • setTimeout         │ ⏰ Chuông hẹn giờ  │ 📬 Hộp 1: Khi timer hết hạn │
│ • fs / http callbacks│ 📨 Thư từ hỗ trợ  │ 📬 Hộp 2: Khi I/O xong      │
│ • setImmediate       │ 📌 Ghi chú dán     │ 📬 Hộp 3: Ngay sau Hộp 2    │
│ • socket.on('close') │ 📁 Đóng hồ sơ     │ 📬 Hộp 4: Dọn dẹp cuối vòng │
├──────────────────────┴───────────────────┴──────────────────────────────┤
│ ⚙️ TẦNG HẠ TẦNG C++ (LIBUV & OS KERNEL)                                  │
├──────────────────────┬───────────────────┬──────────────────────────────┤
│ • Network / TCP / DB │ ☎️ Hotline OS      │ Non-blocking, kernel báo về  │
│ • fs / crypto / dns  │ 👨‍👩‍👦 Nhóm hỗ trợ  │ Thread Pool (mặc định 4)     │
└──────────────────────┴───────────────────┴──────────────────────────────┘

📌 Bộ nhớ nhanh:
   Sync → nextTick → Promise → Timer → I/O → setImmediate → Close
   (Giám đốc → VIP Platinum → Chuông hẹn giờ → Hồ sơ đến → Ghi chú → Đóng file)
```
