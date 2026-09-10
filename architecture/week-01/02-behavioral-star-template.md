# Kịch Bản Phỏng Vấn Hành Vi STAR (ANZ Behavioral Mastery)

> **Thời lượng:** 15 phút mở đầu Stage 1 của vòng phỏng vấn kỹ thuật ANZ.  
> **Mục tiêu:** Tạo ấn tượng mạnh mẽ về tư duy kỹ sư trưởng thành (Senior Mindset), khả năng hợp tác (Team Player), kỹ năng xử lý khủng hoảng và giao tiếp tiếng Anh tự tin.

---

## 🌟 Mô hình STAR chuẩn mực

- **S - Situation (Bối cảnh):** Mô tả ngắn gọn hoàn cảnh, dự án và thách thức gặp phải (15-20% thời lượng).
- **T - Task (Nhiệm vụ):** Mục tiêu cụ thể mà bạn có trách nhiệm phải hoàn thành (10-15% thời lượng).
- **A - Action (Hành động):** Bạn đã làm những gì? Hãy dùng ngôi xưng **"I"** thay vì "we" để làm nổi bật đóng góp cá nhân (50% thời lượng).
- **R - Result (Kết quả):** Kết quả có số liệu đo lường cụ thể (Metrics) và bài học rút ra (20% thời lượng).

---

## Câu chuyện 1: Bất đồng quan điểm kỹ thuật (Technical Disagreement)

### Tình huống:
Lựa chọn giữa việc dùng polling định kỳ hay triển khai Redis Pub/Sub / WebSocket để cập nhật trạng thái giao dịch ngân hàng theo thời gian thực. Đồng nghiệp muốn giữ REST polling để code nhanh, nhưng bạn nhận thấy điều này sẽ làm quá tải database server khi lượng người dùng tăng cao.

### Kịch bản tiếng Anh chuẩn:
> **Situation:**  
> *"In my previous project at the fintech backend team, we were designing a real-time transaction status notification feature. A senior colleague suggested using short REST polling to meet a tight deadline, while I was concerned that thousands of concurrent clients polling every 2 seconds would exhaust our database connection pool."*
> 
> **Task:**  
> *"My goal was to convince the team to adopt a more scalable architecture using Redis Pub/Sub and WebSockets without stalling the project timeline or creating team friction."*
> 
> **Action:**  
> *"Instead of having an emotional debate, I took a data-driven approach. Over the weekend, I built a lightweight benchmark simulating 10,000 concurrent active users. The benchmark showed that REST polling pushed CPU usage to 85% and caused database connection timeouts, whereas the Redis Pub/Sub approach maintained CPU utilization under 20% with sub-100ms latency. I scheduled a 30-minute sync, presented the metrics calmly, and offered to write the reusable WebSocket abstraction layer myself to save team delivery time."*
> 
> **Result:**  
> *"The lead engineer and my colleague immediately supported the Redis approach after seeing the hard data. We launched on time with zero production bottlenecks during peak marketing campaigns, and my abstraction module became a shared standard across the department."*

---

## Câu chuyện 2: Xử lý sự cố nghiêm trọng Production (Severity-1 Incident)

### Tình huống:
Sau đợt release định kỳ, dịch vụ thanh toán gặp lỗi rò rỉ bộ nhớ (Memory Leak) khiến container Node.js liên tục bị OOM (Out Of Memory) kill, làm gián đoạn giao dịch của khách hàng.

### Kịch bản tiếng Anh chuẩn:
> **Situation:**  
> *"During an evening release, our core payment service started throwing 502 Bad Gateway errors. The Kubernetes cluster was constantly restarting our Node.js pods due to Out-Of-Memory (OOM) kills, impacting hundreds of customer transactions."*
> 
> **Task:**  
> *"As the on-call engineer, my immediate responsibility was to restore system stability first, prevent financial discrepancies, and identify the root cause."*
> 
> **Action:**  
> *"I followed a calm, 3-step incident protocol:*  
> *1. **Mitigate immediately:** Rather than trying to debug live on production, I initiated an immediate rollback to the previous stable release artifact within 5 minutes, bringing service availability back to 100%.*  
> *2. **Audit data:** I verified the database ledger and payment queue to ensure no double-charge occurred during pod crashes.*  
> *3. **Root Cause Analysis (RCA):** In the staging environment, I captured a Node.js heap snapshot using Chrome DevTools. I discovered an unhandled event listener on a global event emitter inside a newly added batch processing loop, which prevented garbage collection of transaction payload buffers."*
> 
> **Result:**  
> *"I patched the memory leak by properly removing listeners and added automated leak regression tests into our CI pipeline. I also conducted a blameless post-mortem with the team, establishing new monitoring alerts on Node.js heap memory growth."*

---

## Câu chuyện 3: Đàm phán tiến độ vs Nợ kỹ thuật (Tight Deadline vs Tech Debt)

### Tình huống:
Product Owner yêu cầu ra mắt tính năng xuất báo cáo giao dịch hàng quý trong 1 tuần, nhưng hạ tầng hiện tại chưa hỗ trợ stream dữ liệu lớn.

### Kịch bản tiếng Anh chuẩn:
> **Situation:**  
> *"Our Product Owner requested a quarterly transaction export feature for business accounts within one week to close an important enterprise client. However, our current database query loaded entire datasets directly into memory, which would crash the server for accounts with millions of records."*
> 
> **Task:**  
> *"I needed to balance the urgent business deadline with long-term system stability, avoiding technical debt that could cause a future outage."*
> 
> **Action:**  
> *"I scheduled a brief trade-off meeting with the PO. Instead of rejecting the deadline, I proposed a phase-one MVP: We would export data in batches of 30 days using Node.js Streams with backpressure piped directly to AWS S3 as an asynchronous download link, rather than synchronous direct HTTP downloads. I explained that this eliminated server memory spikes while still solving 90% of the client's urgent reporting need on time."*
> 
> **Result:**  
> *"The PO happily agreed to the phased release. We shipped the async streaming exporter in 5 days with zero impact on core banking throughput, and completed the automated multi-quarter aggregation in the following sprint with clean, maintainable architecture."*

