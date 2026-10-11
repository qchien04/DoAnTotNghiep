---
name: detail-design-step4-finalize
description: "Bước 4/4 (bước cuối bắt buộc) của quy trình detail design. Kiểm tra 00_pipeline_status.md xem đã hoàn thành đủ Bước 1, mọi API ở Bước 2, và Bước 3 chưa (Bước 5 - mockup HTML - là tùy chọn, KHÔNG nằm trong điều kiện hoàn thành). Nếu chưa đủ, liệt kê rõ phần còn thiếu và dừng lại — không tự bịa để lấp. Nếu đã đủ, đối chiếu chéo tính nhất quán giữa 01_structure.md, các 02_api_processing_*.md, và 03_check_specifications.md, rồi hợp nhất thành 1 file Detail Design Document hoàn chỉnh (đủ 9 phần: Revision History, Screen Wireframe, Check Specifications, Description of the Process, Execution API, API Processing, Table, Supplement, Tổng kết)."
---

# 1. Vai trò & Mục tiêu
Bạn là **Senior Business Analyst / System Architect**. Đây là **Bước 4/4 — bước cuối bắt buộc** (Bước 5 - mockup HTML - là bước tùy chọn tách biệt, không ảnh hưởng đến bước này). Nhiệm vụ: (1) xác minh toàn bộ pipeline bắt buộc đã hoàn thành, (2) đối chiếu chéo tính nhất quán giữa các file trung gian đã làm riêng lẻ ở 3 bước trước (rủi ro lớn nhất khi tách bước là field/tên bảng bị lệch nhau giữa các lần gọi khác nhau), (3) hợp nhất thành 1 file Detail Design Document hoàn chỉnh.

---

# 2. Bước kiểm tra hoàn thành (bắt buộc trước khi hợp nhất)
Đọc `00_pipeline_status.md`:
- Bước 1 (Structure) phải `✅ Xong`.
- **Mọi** API trong danh sách phải `✅ Xong` ở cột Bước 2.
- Bước 3 (Check Specifications) phải `✅ Xong`.
- **Bước 5 (Mockup HTML) KHÔNG cần kiểm tra** — đây là bước tùy chọn, độc lập, dù `✅ Xong` hay `⬜ Chưa làm` đều không ảnh hưởng đến việc hợp nhất ở Bước 4.

**Nếu bất kỳ mục bắt buộc nào chưa xong:** dừng lại ngay, liệt kê rõ ràng phần còn thiếu (ví dụ "API 'Save Draft' chưa có `02_api_processing_SaveDraft.md`"), và hướng dẫn người dùng chạy đúng skill bước còn thiếu. Không tự sinh nội dung thay cho bước chưa làm.

---

# 3. Đối chiếu chéo tính nhất quán (Cross-check)
Trước khi hợp nhất, kiểm tra:
1. **Tên field (camelCase)** nhất quán xuyên suốt `01_structure.md` (Wireframe + Execution API) ↔ mọi `02_api_processing_*.md` (Data Response Definition, SQL) ↔ `03_check_specifications.md`. Nếu phát hiện lệch tên cho cùng 1 khái niệm (ví dụ `startDate` ở file này nhưng `weekStartDate` ở file khác), **không tự ý chọn 1 bên** — nêu rõ chỗ lệch và hỏi người dùng muốn dùng tên nào, rồi sửa thống nhất trước khi hợp nhất.
2. **Tên bảng/cột CSDL** nhất quán giữa `01_structure.md` (Table) và các `02_api_processing_*.md` (SQL Explanation, Data Response Definition).
3. Mọi field `O` trong Wireframe (`01_structure.md`) đều truy được ngược về đúng 1 dòng trong Data Response Definition của đúng 1 API.
4. Mọi API ở Execution API (`01_structure.md`) có đúng 1 file `02_api_processing_*.md` tương ứng, và ngược lại — không thừa, không thiếu.
5. Mọi bảng có soft-delete có điều kiện `IS NULL`/khoảng ngày tương ứng được dùng nhất quán trong mọi SQL liên quan.
6. Số bước "Truy xuất dữ liệu" ở Description of the Process (`01_structure.md`) khớp đúng số bước Retrieve (③④...) trong `02_api_processing_*.md` tương ứng.

Nếu phát hiện bất nhất không tự giải quyết được rõ ràng, hỏi người dùng — không tự chọn 1 phương án rồi hợp nhất im lặng.

---

# 4. Hợp nhất thành Detail Design Document hoàn chỉnh
Sau khi cross-check đạt, ghép nội dung theo đúng cấu trúc 9 phần, xuất ra `DetailDesign_Screen0X_<TenManHinh>.md`:

```markdown
# Đặc tả Thiết kế Chi tiết (Detail Design Document) - Screen 0X: <Tên màn hình>

## 📋 Thông tin chung (Overview)
- **Tổng số Sheet:** N sheets
- **Danh sách các Sheet:** (liệt kê đủ)

## Sheet: Revision History
### 1. Thông tin tài liệu
| Title | Subtitle | Date of Creation | Updated | Acknowledge | Review | Main Person in charge | Creator |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| Detail Design Document | Screen 0X - <Tên màn hình> | <ngày hôm nay> | - | - | - | - | - |
### 2. Lịch sử chỉnh sửa
| Revision Date | Reviser | Edition | Revision Details | Date of approval | Approver |
| :---: | :--- | :---: | :--- | :---: | :--- |
| <ngày hôm nay> | - | 1 | New Creation | - | - |

## Sheet: Screen wireframe
<!-- Lấy nguyên từ 01_structure.md mục 3.1 -->

## Sheet: Check specifications
<!-- Lấy nguyên từ 03_check_specifications.md (sau khi đã sửa theo cross-check) -->

## Sheet: Description of the process
<!-- Lấy nguyên từ 01_structure.md mục 3.2 -->

## Sheet: Execution API
<!-- Lấy nguyên từ 01_structure.md mục 3.3 -->

## Sheet: API Processing (<Tên API 1>)
<!-- Lấy nguyên từ 02_api_processing_<API1>.md (sau khi đã sửa theo cross-check) -->

## Sheet: API Processing (<Tên API 2>)
<!-- Lặp lại cho từng API -->

## Sheet: Table
<!-- Lấy nguyên từ 01_structure.md mục 3.4 -->

## Sheet: Supplement
<!-- Lặp lại block "Thông tin tài liệu" như Revision History -->

## 📌 Tổng kết & Nhận định nhanh
1. **Phạm vi chức năng màn hình:** <1-2 câu>.
2. **Các API cốt lõi:** liệt kê `<METHOD> <path>`: <mục đích>.
3. **Cơ chế CSDL liên quan:** liệt kê tên các bảng chính.
```

Nếu `05_mockup.html` (Bước 5) đã tồn tại trong thư mục làm việc, có thể ghi thêm 1 dòng tham chiếu ngắn trong mục "📋 Thông tin chung" (ví dụ "Mockup HTML tham khảo: `05_mockup.html`") — không bắt buộc, không copy nội dung HTML vào file Markdown này.

---

# 5. Cập nhật `00_pipeline_status.md`
Đánh dấu toàn bộ pipeline bắt buộc `✅ Hoàn thành` và ghi đường dẫn file Detail Design cuối cùng. Không đụng vào dòng trạng thái của Bước 5.

---

# 6. Quy tắc Dừng lại Hỏi Người Dùng
1. Bất kỳ bước **bắt buộc** nào trong pipeline (1/2/3) chưa `✅ Xong` — dừng ngay, không hợp nhất một phần.
2. Phát hiện bất nhất tên field/bảng giữa các file trung gian mà không có cách giải quyết rõ ràng.
3. Số lượng Sheet API Processing không khớp số API trong Execution API.

---

# 7. Checklist Tự kiểm tra (đầy đủ, tổng hợp từ cả pipeline bắt buộc)
- [ ] Đã xác nhận đủ ✅ ở Bước 1/2 (mọi API)/3 trước khi hợp nhất (Bước 5 không cần kiểm tra).
- [ ] Không còn bất nhất tên field/bảng giữa các file trung gian sau cross-check.
- [ ] Mọi field `O` trong Wireframe truy được về đúng 1 dòng Data Response Definition.
- [ ] Mọi API ở Execution API có đúng 1 Sheet API Processing tương ứng, và ngược lại.
- [ ] Mọi bảng soft-delete dùng đúng loại cột (`DELETED_AT` vs `DELETED_FROM`/`DELETED_TO`) nhất quán trong Table và SQL.
- [ ] Số bước "Truy xuất dữ liệu" ở Description of the Process khớp số bước Retrieve trong API Processing tương ứng.
- [ ] File Detail Design cuối cùng có đủ 9 phần theo đúng thứ tự chuẩn.
- [ ] Đã cập nhật `00_pipeline_status.md` là hoàn thành (phần bắt buộc).