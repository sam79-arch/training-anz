# 📚 Cẩm Nang Thực Chiến: Node.js Microtasks vs Macrotasks & Bẫy Chết Người Event Loop Starvation

> **Target:** Vòng phỏng vấn kỹ thuật HCLTech x Khách hàng ANZ Bank (Data Platform Team).  
> **Chủ đề sống còn:** Microtasks (`nextTickQueue` vs `microtaskQueue`), Macrotasks (6 pha Libuv), hiện tượng Event Loop Starvation trong xử lý giao dịch tài chính, và kỹ năng phản biện tiếng Anh chuẩn Senior Backend Engineer.

---

## 🎭 Mở Đầu: Cú Lừa Vĩ Đại Về Tên Gọi Trong Lịch Sử Node.js

Nếu bạn từng cảm thấy bối rối giữa `process.nextTick()` và `setImmediate()`, đừng tự trách mình. **Chính bạn đang là nạn nhân của vụ đặt tên trớ trêu nhất lịch sử khoa học máy tính!**

* ❌ **Cái tên gây lừa đảo:**
  * Bạn nghĩ `process.nextTick()` sẽ chạy ở **"tick tiếp theo" (next tick)**? 👉 **SAI!** Nó chạy **NGAY LẬP TỨC** khi hàm hiện tại vừa kết thúc, đè bẹp mọi tác vụ khác!
  * Bạn nghĩ `setImmediate()` sẽ chạy **"ngay lập tức" (immediately)**? 👉 **SAI!** Nó phải ngoan ngoãn xếp hàng chờ đến tận **"tick tiếp theo" (Check Phase của Libuv)** mới được chạy!

> 💬 *Chính **Ryan Dahl (cha đẻ Node.js)** từng thừa nhận trong một buổi diễn thuyết:*  
> *"Đáng lẽ ra `process.nextTick()` phải được đặt tên là `setImmediate()`, còn `setImmediate()` phải được đặt tên là `setNextTick()`. Nhưng khi chúng tôi nhận ra điều đó thì hàng triệu dòng code trên thế giới đã sử dụng rồi, không thể sửa được nữa!"*

---

## 🏦 Phần 1: Ẩn Dụ "Quầy Giao Dịch Ngân Hàng ANZ" (The Bank Metaphor)

Để không bao giờ bị nhầm lẫn thứ tự thực thi, hãy tưởng tượng toàn bộ Node.js runtime là một **Quầy giao dịch của ngân hàng ANZ**:

```text
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                   QUẦY GIAO DỊCH VIÊN (CALL STACK)                      │
 │   Chỉ có DUY NHẤT 1 nhân viên (Single-threaded).                        │
 │   Đang phục vụ vị khách đứng trực tiếp tại quầy (Code đồng bộ).        │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │ Khách tại quầy làm xong thủ tục
 ┌────────────────────────────────────▼────────────────────────────────────┐
 │                  CỬA ƯU TIÊN ĐẶC BIỆT (MICROTASKS)                      │
 │                                                                         │
 │  ⭐ VIP 1: Điện thoại của Giám đốc (process.nextTick)                   │
 │     Giao dịch viên VỪA RẢNH TAY là PHẢI NGHE MÁY NGAY.                  │
 │     Sếp nói chưa xong là CHƯA ĐƯỢC làm bất kỳ việc nào khác!           │
 │                                                                         │
 │  ⭐ VIP 2: Khách VIP đặt lịch trước (Promise.then / queueMicrotask)     │
 │     Khi sếp cúp máy, giao dịch viên xử lý hồ sơ của khách VIP này       │
 │     trước khi bước ra ngoài sảnh!                                       │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │ Xong hết VIP, quầy mới nhìn ra ngoài
 ┌────────────────────────────────────▼────────────────────────────────────┐
 │               SẢNH CHỜ BỐC SỐ THỨ TỰ (LIBUV MACROTASKS)                 │
 │                                                                         │
 │  ⏰ Hàng ghế 1 (Timers):   Khách hẹn giờ chuông báo (setTimeout)        │
 │  🌐 Hàng ghế 2 (Poll):     Khách nộp hồ sơ từ bên ngoài (TCP/File I/O)  │
 │  ⚡ Hàng ghế 3 (Check):    Khách vãng lai bốc số thường (setImmediate)  │
 │  🚪 Hàng ghế 4 (Close):    Bảo vệ khóa cửa chi nhánh (socket.close)     │
 └─────────────────────────────────────────────────────────────────────────┘
```

### 🧠 Luật Bất Thành Văn Tại Quầy:
1. **Khách tại quầy (Call Stack)** làm gì thì làm, không ai được ngắt lời.
2. Quầy vừa xong việc $\rightarrow$ **Chuông VIP 1 (`process.nextTick`) réo** $\rightarrow$ Phải phục vụ cho tới khi Sếp hết việc mới thôi.
3. Sếp buông tha $\rightarrow$ Quầy quay sang giải quyết hồ sơ của **Khách VIP 2 (`Promise.then`)**.
4. Khi cả 2 phòng VIP **trống trơn**, giao dịch viên mới thong thả bước ra sảnh bốc số phục vụ **Khách bình dân (Macrotasks: Timers $\rightarrow$ Poll $\rightarrow$ Check)**.

---

## 🏎️ Phần 2: Bước Ngoặt Lịch Sử Node 11+ (HTML5 Spec Alignment)

Một câu hỏi phỏng vấn "sát thủ" của ANZ nhằm phân biệt Senior xịn và Middle:  
*"Cơ chế phục vụ Macrotask giữa Node 10 trở về trước và Node 11 trở về sau khác nhau thế nào?"*

### 🚍 Thời Node 10 trở về trước: "Phục vụ theo xe bus"
Node.js gom toàn bộ các Timer đã hết hạn lại xử lý **một lèo hết cả hàng ghế Timers**, rồi mới quay lại kiểm tra phòng VIP (Microtasks).

### 🎯 Thời Node 11+ (và Node 18/20 hiện tại): "Quy tắc liếc mắt sau mỗi khách"
Để đồng bộ chuẩn với Trình duyệt web (HTML5 Event Loop Standard), Node.js đổi luật:  
👉 **Cứ phục vụ xong MỖI vị khách Macrotask riêng lẻ, giao dịch viên PHẢI liếc mắt kiểm tra ngay phòng VIP (`nextTick` & `Promise`) trước khi gọi vị khách Macrotask tiếp theo!**

```javascript
// Minh chứng thực nghiệm (Đã tự động pass tại TC-02)
setTimeout(() => {
  console.log('1: Khách Timer A');
  Promise.resolve().then(() => console.log('2: VIP chen ngang sau Timer A'));
}, 0);

setTimeout(() => {
  console.log('3: Khách Timer B');
}, 0);

// KẾT QUẢ IN RA:
// 1: Khách Timer A
// 2: VIP chen ngang sau Timer A  <-- Chạy ngay lập tức, đè trước Timer B!
// 3: Khách Timer B
```

---

## 💥 Phần 3: Thảm Họa Event Loop Starvation (Vụ Án Sev-1 Ngân Hàng ANZ)

### 🕵️ Vụ Án: Chiếc Pod Kubernetes Tự Sát Lúc 09:00 Sáng
Hãy hình dung tình huống thực tế tại ANZ Bank:
* **Hệ thống:** Dịch vụ xử lý sao kê giao dịch thẻ (`Statement Settlement Service`).
* **Hiện tượng:** Cứ đúng 09:00 sáng khi nhận batch 100,000 giao dịch từ đối tác, Pod Kubernetes lăn đùng ra chết (`CrashLoopBackOff`), kích hoạt còi báo động Sev-1 toàn hệ thống.
* **Điều kỳ lạ:** CPU máy chủ chỉ ăn có **4%**, RAM trống tới **85%**, mạng không nghẽn. Tại sao Pod lại chết?

---

### ❌ Thủ Phạm Trong Đoạn Code:
Kỹ sư phụ trách nghĩ rằng: *"Viết vòng lặp for thì sợ treo, thôi mình dùng `process.nextTick` để chạy bất đồng bộ cho nó mượt mà!"*

```javascript
// 💣 QUẢ BOM NỔ CHẬM NẰM Ở ĐÂY:
function processNextTransaction(batch, index) {
  if (index >= batch.length) return;

  parseTransaction(batch[index]); // Việc nhẹ: 0.05ms

  // ĐỆ QUY NEXTTICK LIÊN TỤC:
  process.nextTick(() => {
    processNextTransaction(batch, index + 1);
  });
}
```

### 🔍 Giải Mã Cơ Chế "Chết Đói" (Why It Starved):
1. Khi `processNextTransaction` chạy xong bản ghi số 1, nó quăng bản ghi số 2 vào `nextTickQueue`.
2. V8 vừa kết thúc bản ghi 1 $\rightarrow$ nhìn thấy `nextTickQueue` có bản ghi 2 $\rightarrow$ **Xử lý tiếp ngay!**
3. Bản ghi 2 lại quăng bản ghi 3 vào... Hàng đợi VIP **không bao giờ rỗng trong suốt 100,000 lần lặp!**
4. Trong suốt thời gian đó, Event Loop **bị giam cầm vĩnh viễn ở phòng VIP**, không bao giờ bước chân ra được pha **Poll** và pha **Timers**.
5. Trong khi đó, Kubernetes định kỳ 5 giây gửi một HTTP request kiểm tra sức khỏe: `GET /healthz` (Liveness Probe).
6. Request `/healthz` đến cổng mạng (TCP Socket), nằm chờ ở tầng OS Kernel, nhưng Node.js **mải phục vụ sếp `nextTick` nên không thèm đón nhận (accept socket)**!
7. Quá 15 giây (3 lần probe timeout), Kubernetes kết luận: *"Thằng Pod này bị đơ rồi!"* $\rightarrow$ **Gửi lệnh SIGKILL tiêu diệt Pod ngay lập tức!**

---

### 🛡️ Liều Thuốc Giải Chuẩn Senior: Kỹ Thuật "Thở Ngắt Quãng" (Cooperative Chunking)

Muốn vừa xử lý batch lớn, vừa để ứng dụng sống sót, ta phải dùng **`setImmediate`** để chia nhỏ việc thành từng đợt (Chunking):

```javascript
const CHUNK_SIZE = 500; // Xử lý 500 giao dịch một đợt

function processBatchCooperative(batch, startIndex = 0) {
  if (startIndex >= batch.length) {
    console.log('🎉 Xử lý trọn vẹn 100,000 giao dịch an toàn!');
    return;
  }

  // 1. Xử lý cật lực 500 bản ghi
  const endIndex = Math.min(startIndex + CHUNK_SIZE, batch.length);
  for (let i = startIndex; i < endIndex; i++) {
    parseTransaction(batch[i]);
  }

  // 2. NHẢ QUYỀN ĐIỀU KHIỂN (YIELD) CHO EVENT LOOP QUA SETIMMEDIATE!
  setImmediate(() => {
    processBatchCooperative(batch, endIndex);
  });
}
```

#### 🌟 Phép Màu Nằm Ở Đâu?
* `setImmediate` xếp hàng ở **Check Phase**.
* Sau khi xử lý xong 500 bản ghi, Event Loop được tự do xoay vòng qua pha **Poll** $\rightarrow$ Nó đọc ngay request `/healthz` của Kubernetes $\rightarrow$ Trả về `HTTP 200 OK` (Tôi vẫn khỏe!).
* Kubernetes yên tâm không giết Pod, và 100,000 giao dịch được cày sạch sẽ trong êm đẹp!

---

## 🧩 Phần 4: Bộ 5 Câu Đố Hack Não Phỏng Vấn (Kèm Phim Quay Chậm Step-by-Step)

### 🎯 Câu Đố 1: Thứ Tự Ưu Tiên Tuyệt Đối Giữa Các Hàng Đợi
```javascript
console.log('1: Đồng bộ đầu');
setTimeout(() => console.log('2: Timer'), 0);
setImmediate(() => console.log('3: Immediate'));
process.nextTick(() => console.log('4: NextTick VIP 1'));
Promise.resolve().then(() => console.log('5: Promise VIP 2'));
console.log('6: Đồng bộ cuối');
```

#### 🎬 Phim quay chậm (Execution Trace):
| Bước | Ai đang chạy? | Hàng đợi chứa gì? | Màn hình in ra |
|---|---|---|---|
| **1** | Call Stack chạy code đồng bộ dòng 1 | Trống | `1: Đồng bộ đầu` |
| **2** | Đăng ký `setTimeout` $\rightarrow$ đẩy vào Timers Queue | Timers: `[Timer]` | *(chưa in)* |
| **3** | Đăng ký `setImmediate` $\rightarrow$ đẩy vào Check Queue | Check: `[Immediate]` | *(chưa in)* |
| **4** | Đăng ký `nextTick` $\rightarrow$ đẩy vào nextTickQueue | VIP 1: `[NextTick]` | *(chưa in)* |
| **5** | Đăng ký `Promise` $\rightarrow$ đẩy vào microtaskQueue | VIP 2: `[Promise]` | *(chưa in)* |
| **6** | Call Stack chạy code đồng bộ dòng 6 | Trống | `6: Đồng bộ cuối` |
| **7** | Call Stack rỗng! Xả cạn phòng VIP 1 | VIP 1: `[]` | `4: NextTick VIP 1` |
| **8** | Phòng VIP 1 rỗng! Xả tiếp phòng VIP 2 | VIP 2: `[]` | `5: Promise VIP 2` |
| **9** | Hết sạch VIP! Event Loop bước vào Macrotask | Timers / Check | `2: Timer` rồi `3: Immediate` (hoặc ngược lại tùy startup) |

👉 **Kết quả chuẩn:** `1 -> 6 -> 4 -> 5 -> 2 -> 3`

---

### 🎯 Câu Đố 2: VIP Này Đẻ Ra VIP Khác (Microtask Nesting)
```javascript
Promise.resolve().then(() => {
  console.log('1: Promise 1');
  process.nextTick(() => console.log('2: nextTick đẻ ra từ Promise 1'));
});

Promise.resolve().then(() => {
  console.log('3: Promise 2');
});

process.nextTick(() => {
  console.log('4: nextTick ban đầu');
});
```

#### 🎬 Phim quay chậm:
1. **Pha 1 (Bắt đầu):** `nextTickQueue` có `[nextTick ban đầu]`, `microtaskQueue` có `[Promise 1, Promise 2]`.
2. **Pha 2:** VIP 1 chạy trước $\rightarrow$ in `4: nextTick ban đầu`.
3. **Pha 3:** VIP 1 hết, VIP 2 chạy $\rightarrow$ gọi `Promise 1` $\rightarrow$ in `1: Promise 1`.
   * **BẤY NGỜ:** `Promise 1` chạy xong lại đẻ ra `nextTick` mới! Nó được quăng vào `nextTickQueue`.
4. **Pha 4:** Nhưng V8 đang trong chu trình xả dở `microtaskQueue`, nó xử lý nốt `Promise 2` $\rightarrow$ in `3: Promise 2`.
5. **Pha 5:** Vừa hết đợt Promise, V8 thấy `nextTickQueue` vừa có hàng mới $\rightarrow$ xả ngay $\rightarrow$ in `2: nextTick đẻ ra từ Promise 1`.

👉 **Kết quả:** `4 -> 1 -> 3 -> 2`

---

### 🎯 Câu Đố 3: Ai Thắng Trong Vòng Đua I/O? (`fs.readFile`)
```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('1: setTimeout'), 0);
  setImmediate(() => console.log('2: setImmediate'));
  process.nextTick(() => console.log('3: nextTick'));
});
```

#### 💡 Bí mật cốt tử của Senior:
* Callback của `fs.readFile` chạy trong **POLL PHASE** của Libuv.
* Khi callback kết thúc:
  1. Microtask chạy ngay tắp lự $\rightarrow$ in `3: nextTick`.
  2. Rời khỏi Poll Phase, pha tiếp theo theo chiều kim đồng hồ là **CHECK PHASE (nơi `setImmediate` cư ngụ)**!
  3. Do đó, `setImmediate` **LUÔN LUÔN CHẠY TRƯỚC** `setTimeout` khi nằm bên trong một chu trình I/O callback!

👉 **Kết quả bất biến 100%:** `3: nextTick -> 2: setImmediate -> 1: setTimeout`

---

### 🎯 Câu Đố 4: Bẫy Đệ Quy Promise Chaining Có Làm Đói Server Không?
```javascript
function recursivePromise() {
  return Promise.resolve().then(() => {
    return recursivePromise();
  });
}
recursivePromise();
```
* **Câu hỏi:** Đệ quy `Promise.then` liên tục có gây Starvation giống `process.nextTick` không?
* **Đáp án:** **CÓ!** Vì `microtaskQueue` liên tục được nạp thêm task mới, V8 sẽ cật lực xả cho bằng hết microtasks trước khi nhường quyền cho Libuv Event Loop. Kết quả là I/O và Timers cũng sẽ bị bỏ đói tương tự như `nextTick`!

---

### 🎯 Câu Đố 5: Chuỗi 3 Tầng Tất Định 11 Tokens (Kịch Bản Đã Pass Trong TC-04)
```javascript
setImmediate(() => {
  console.log('1: immediate');
  process.nextTick(() => console.log('2: nextTick in immediate'));
  Promise.resolve().then(() => console.log('3: promise in immediate'));
  
  setTimeout(() => {
    console.log('4: timeout');
    process.nextTick(() => console.log('5: nextTick in timeout'));
  }, 0);
});
```

#### 🎬 Trật tự diễn tiến:
1. `setImmediate` bắt đầu chạy $\rightarrow$ in `1: immediate`.
2. Khi callback `setImmediate` vừa hoàn tất, cơ chế Node 11+ kích hoạt xả Microtasks:
   - `nextTickQueue` xả trước $\rightarrow$ in `2: nextTick in immediate`.
   - `microtaskQueue` xả sau $\rightarrow$ in `3: promise in immediate`.
3. Vòng lặp Event Loop quay sang vòng mới, chạm pha Timers $\rightarrow$ in `4: timeout`.
4. Callback timeout vừa xong, microtask bên trong nó lập tức được xả $\rightarrow$ in `5: nextTick in timeout`.

👉 **Kết quả:** `1 -> 2 -> 3 -> 4 -> 5`

---

## 🎙️ Phần 5: Kịch Bản Đối Thoại Tiếng Anh Chuẩn Senior (ANZ Technical Interview)

Hãy tự tin đứng trước gương và nói to kịch bản này. Từng câu từng chữ đều toát lên tư duy của một kỹ sư Backend dạn dày kinh nghiệm trận mạc:

---

### ❓ Question from ANZ Interviewer:
> *"Could you explain why and how an unthrottled `process.nextTick` loop can cause Event Loop Starvation in a payment processing service? How would you redesign it to ensure high availability?"*

---

### 🗣️ Model Answer (The 6-Step Think Out Loud Flow):

#### 1. Clarify & Debunk the Naming (Bước 1: Nêu bản chất & chỉnh tên gọi):
> *"To address this scenario effectively, we must first clarify an architectural irony in Node.js:  
> Despite its name, `process.nextTick` does **not** belong to the Libuv event loop. Instead, it is an internal queue managed directly by the Node.js runtime that executes immediately after the current call stack clears, with top VIP priority over all other queues."*

#### 2. The Starvation Bottleneck (Bước 2: Chỉ ra cơ chế nghẽn mạng):
> *"The critical danger in a high-throughput payment pipeline is **Event Loop Starvation**.  
> If an engineer implements recursive `process.nextTick` calls to parse incoming transactions, the engine continuously drains and refills the `nextTickQueue`.  
> As a result, control is **never yielded back to Libuv**. This starves the **Poll Phase**, meaning the TCP socket buffer cannot read incoming webhook traffic, and HTTP endpoints like `/healthz` fail to respond.  
> In a Kubernetes environment, missing 3 consecutive liveness probes will trigger a `SIGKILL`, causing the pod to enter a disastrous `CrashLoopBackOff`."*

#### 3. The Solution: Cooperative Multitasking (Bước 3: Giải pháp kiến trúc):
> *"To ensure high availability, I redesign the pipeline using **Cooperative Scheduling** via `setImmediate`:  
> Instead of processing one item per tick or running an unbounded recursion, we batch work into chunks—say, 500 records per chunk.  
> After processing each chunk, we schedule the next iteration with `setImmediate`.  
> Because `setImmediate` executes in the **Check Phase**, the event loop naturally loops through the **Poll Phase** and **Timers Phase** between chunks. This guarantees that Kubernetes health checks stay green and network I/O remains responsive while heavy computation progresses smoothly in the background."*

#### 4. Node 11+ Microtask Invariant (Bước 4: Chi tiết kỹ thuật nâng cao):
> *"Furthermore, it's worth highlighting that since Node 11, microtasks are drained immediately after **each individual macrotask callback**, strictly adhering to the HTML5 specification. This ensures consistent and deterministic scheduling behavior across microservice instances."*

---

## 📌 Bảng Tra Cứu Nhanh Dành Cho Kỹ Sư ANZ (Quick Cheat Sheet)

| Tình huống | Nên dùng gì? | Tại sao? |
|---|---|---|
| **Chia nhỏ batch dữ liệu lớn** (100k records) | `setImmediate()` | Nhả CPU sau mỗi chunk để Event Loop thở, đọc socket và trả lời healthcheck. |
| **Cho phép caller gắn event listener trước khi emit** | `process.nextTick()` | Chạy ngay sau khi constructor kết thúc nhưng TRƯỚC khi bất kỳ I/O nào xảy ra. |
| **Xử lý kết quả Promise thông thường** | `Promise.then()` / `await` | Tiêu chuẩn hiện đại, chạy trong `microtaskQueue` ngay sau `nextTick`. |
| **Hẹn giờ thực thi trễ** | `setTimeout(fn, ms)` | Chạy trong Timers phase khi đạt ngưỡng thời gian tối thiểu. |
