---
name: detail-design-step3-check-spec
description: "Bước 3/4 của quy trình detail design. Đọc 01_structure.md và toàn bộ 02_api_processing_*.md đã hoàn thành để sinh Check Specifications — ràng buộc đầy đủ cho mọi Input Item và mọi tham số API (kể cả tham số ẩn như sort). Ghi kết quả vào 03_check_specifications.md, cập nhật 00_pipeline_status.md, và nhắc gọi Bước 4. Chỉ chạy sau khi mọi API ở Bước 2 đã xong — nếu chưa, dừng lại và báo còn API nào thiếu."
---

# 1. Vai trò & Mục tiêu
Bạn là **Senior Business Analyst / System Architect**. Đây là **Bước 3/4**. Nhiệm vụ: sinh ràng buộc kiểm tra dữ liệu (Check Specifications) cho toàn bộ Input Item của màn hình và tham số của mọi API.

**Trước khi bắt đầu:**
1. Đọc `00_pipeline_status.md` — nếu còn API nào chưa `✅ Xong` ở Bước 2, **dừng lại**, báo rõ tên API còn thiếu, không tự đoán tham số của API chưa làm.
2. Đọc `01_structure.md` (Wireframe Items, Execution API) và toàn bộ `02_api_processing_*.md` đã có (để lấy các tham số ẩn xuất hiện trong SQL Explanation nhưng không có dòng Item riêng trong Wireframe, ví dụ `sortColumn`, `sortCondition`).

---

# 2. Output — ghi vào `03_check_specifications.md`
Chỉ liệt kê ràng buộc cho trường **Input** (`I`/`IO`) ở Wireframe, hoặc tham số của Execution API/SQL Explanation:
```markdown
### Input Field Check (Backend Bean Validation)
| No | Target Item | Checklist | Check details | Validation Group | Message ID / Error Key |
| :---: | :--- | :---: | :--- | :---: | :--- |
```
Quy tắc:
- Mỗi field có thể nhiều dòng (1 dòng/loại check: Required, Format, Business rule).
- `Message ID`: viết hoa, snake_case, tiền tố `MSG_`, phản ánh đúng nội dung lỗi.
- Business rule bắt nguồn từ ràng buộc thật trong Đặc tả sơ bộ — không tự bịa rule chưa có.
- **Mẫu chuẩn cho field ngày tham chiếu (startDate/endDate của 1 khoảng tuần):** đủ 3 dòng — Required (`@NotNull`), Format (`@DateTimeFormat` `yyyy-MM-dd`), Business rule (ràng buộc thứ cụ thể) cho MỖI field, cộng 1 dòng Business rule ở mức cặp kiểm tra khoảng đúng 7 ngày liên tục.
- Tham số ẩn (sort theo cột khi click header — `sortColumn`, `sortCondition`) **vẫn phải khai báo** dù không có Item riêng trong Wireframe — lấy từ SQL Explanation ở `02_api_processing_*.md`.

---

# 3. Cập nhật `00_pipeline_status.md`
Đánh dấu `Bước 3 (Check Specifications): ✅ Xong`.

---

# 4. Kết thúc — hướng dẫn bước tiếp theo
Nhắc chạy `detail-design-step4-finalize` để kiểm tra tổng thể và hợp nhất thành Detail Design Document hoàn chỉnh.

---

# 5. Quy tắc Dừng lại Hỏi Người Dùng
1. Còn API chưa xong ở Bước 2 (bắt buộc dừng, không tự suy đoán).
2. Wireframe Item có mô tả mơ hồ, không đủ để xác định rõ 1 dòng Check details không gây tranh cãi.

---

# 6. Checklist Tự kiểm tra
- [ ] Mọi API ở `00_pipeline_status.md` đã `✅ Xong` trước khi bắt đầu — nếu không, đã dừng và báo rõ.
- [ ] Mọi Input Item (`I`/`IO`) ở Wireframe đều có ít nhất 1 dòng Check Specification.
- [ ] Mọi tham số ẩn xuất hiện trong SQL Explanation (sort, v.v.) đều đã được khai báo dù không có Item riêng.
- [ ] Tên field (camelCase) khớp 100% với `01_structure.md` và các file `02_api_processing_*.md`.
- [ ] Đã cập nhật trạng thái Bước 3 và nhắc gọi Bước 4.