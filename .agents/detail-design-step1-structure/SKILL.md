---
name: detail-design-step1-structure
description: "Bước 1/4 (bắt buộc) của quy trình detail design. Đọc Đặc tả sơ bộ (.md), xác định màn hình cần lấy dữ liệu gì và thực hiện thao tác gì, từ đó sinh Screen Wireframe (List of Items), Description of the Process, Execution API (danh sách endpoint), và Table (định nghĩa CSDL mới cần thiết) cho MỘT màn hình. Ghi kết quả vào file 01_structure.md trong thư mục làm việc, cập nhật 00_pipeline_status.md với danh sách API cần làm ở Bước 2, và hướng dẫn người dùng gọi các bước tiếp theo (Bước 2/3/4 bắt buộc, Bước 5 mockup HTML tùy chọn). Dùng skill này khi được detail-design-master bàn giao, hoặc khi người dùng muốn (làm lại) riêng Bước 1 của 1 màn đã có thư mục làm việc."
---

# 1. Vai trò & Mục tiêu
Bạn là **Senior Business Analyst / System Architect**. Đây là **Bước 1/4** của quy trình chi tiết hóa 1 màn hình. Nhiệm vụ: đọc Đặc tả sơ bộ, xác định **màn hình cần hiển thị/nhập những gì** và **cần thực hiện thao tác gì** (tương ứng bao nhiêu API), từ đó sinh ra 4 phần: Screen Wireframe, Description of the Process, Execution API, và Table (CSDL mới cần thiết).

**Không làm ở bước này:** API Processing chi tiết (SQL, business flow ①-⑧ — thuộc Bước 2), Check Specifications chi tiết (thuộc Bước 3), Mockup HTML (thuộc Bước 5 tùy chọn).

**Trước khi bắt đầu:**
1. Xác nhận thư mục làm việc `docs/detail_design/Screen0X_<TenManHinh>/` đã tồn tại (do `detail-design-master` tạo); nếu chưa có, đề xuất chạy `detail-design-master` trước.
2. Tìm các Detail Design đã hoàn thiện của màn hình khác trong cùng hệ thống (nếu có) — bắt buộc đối chiếu để **tái sử dụng đúng tên bảng, tên cột, tên field API** đã định nghĩa trước đó cho cùng 1 khái niệm nghiệp vụ. Không đặt tên khác cho cùng 1 entity đã tồn tại.

---

# 2. Đầu vào
- **Đặc tả sơ bộ (`.md`):** mục Entities (2.x) và mục màn hình cần làm (3.x), cùng quy tắc chung (Version, soft-delete...).
- **Tên/số thứ tự màn hình** cần làm.
- **(Tùy chọn) Detail Design hoàn thiện của màn khác** — nguồn tái sử dụng tên bảng/field.

---

# 3. Output — ghi vào `01_structure.md`

## 3.1 Screen wireframe
Gồm 4 mục con:
1. **Screen Layout Wireframe** — mô tả ngắn bố cục tổng thể (Dashboard/List/Form/Detail).
2. **URL** — path frontend, suy ra từ mục màn hình trong Đặc tả sơ bộ.
3. **Processing Overview** — tóm tắt 1-2 gạch đầu dòng hành động chính.
4. **List of Items**:
```markdown
| No | Item Name | Types | Initial Value | Number of digits (min/max) | Value (min/max) | Editing Specification | I/O | Required | Description |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
```
Quy tắc suy luận cột:
- `No` đánh số liên tục xuyên suốt toàn bảng (không reset theo khối con).
- `I/O`: `I` = input người dùng nhập, `O` = hiển thị từ hệ thống, `IO` = vừa hiển thị vừa sửa tại chỗ, `-` = phần tử tĩnh không mang dữ liệu.
- Item `O` lấy từ CSDL: `Description` ghi rõ **"Lấy từ trường `<COLUMN>` trong bảng `<TABLE>`"** — khớp 100% với mục Table (3.4) và Data Response Definition sẽ làm ở Bước 2.
- Item tính toán: `Description` nêu công thức bằng lời, khớp Đặc tả sơ bộ.
- `Number of digits (min/max)`: số chữ số **thập phân** (decimal scale), `-` nếu không áp dụng.
- `Value (min/max)`: khoảng **giá trị** hợp lệ, `-` nếu không giới hạn.
- **Bảng dữ liệu dạng lưới/grid:** liệt kê **từng cột như 1 dòng Item riêng** — không gộp thành 1 dòng "bảng dữ liệu". Nếu có cả tổng hợp tuần lẫn chi tiết ngày (grid 7 cột), phải có đủ 2 nhóm item.

## 3.2 Description of the process
Với mỗi hành động chính của người dùng, viết 1 khối:
```markdown
### Processing Description: <Tên hành động> (P<n>)

1. Gọi API để <mục đích>:
   - **1.1 Kiểm tra ràng buộc nghiệp vụ:** <mô tả> Nếu không đạt -> Hiển thị lỗi và Dừng xử lý.
   - **1.2 Truy xuất dữ liệu:** <mô tả>.
   - **1.3 Xử lý phản hồi:** 400/401/403/404/500 -> hiển thị lỗi; thành công -> trả dữ liệu.
2. (Lặp lại cho API tiếp theo)
N. Tính toán/hiển thị kết quả cuối (nếu có logic tính phía client).
N+1. Kết thúc.
```
- Mỗi API ứng với đúng 1 mục lớn (1, 2, 3...), khớp 1-1 với danh sách Execution API (3.3).
- API kiểu Write/Upsert (nút Save/Approve): mô tả khái quát cụm bước ("2.1 Kiểm tra tham số", "2.2 Kiểm tra bản ghi cha tồn tại", "2.3 Tạo mới nếu chưa có", "2.4 So sánh insert/update/soft-delete", "2.5 Lưu DB", "2.6 Xử lý phản hồi") — chi tiết đầy đủ ①-⑧ sẽ làm ở Bước 2.
- Thao tác chỉ ở client (không gọi API): viết ngắn gọn, không cần cấu trúc 1.1/1.2/1.3.

## 3.3 Execution API
Với mỗi API cần thiết để phục vụ mục 3.2:
```markdown
### <n>. API <Tên chức năng>
- **URL:** `<path REST>`
- **Chức năng:** <tên ngắn>
- **HTTP Method:** `<GET/POST/PUT/DELETE>`

| Physical Name | Logical Name | Type | Required | Set Source | Value/Editing Specifications |
| :--- | :--- | :---: | :---: | :--- | :---: |
```
- Field khớp tuyệt đối tên với Wireframe Item liên quan.
- API `POST`/`PUT` nhận payload lồng nhau: khai đủ `parentArray[]`, `parentArray[].field`, `parentArray[].childArray[].field` — không rút gọn.
- Đặt tên API rõ ràng, dùng làm tên file `02_api_processing_<TenAPI>.md` ở Bước 2 (ví dụ tên API "Get Approved" → file `02_api_processing_GetApproved.md`).

## 3.4 Table
Với mỗi bảng CSDL cần thiết mà **chưa có Detail Design nào định nghĩa trước đó**:
```markdown
### <n>. <TABLE_NAME> (<tên bảng tiếng Việt>)
| No. | Column | Column Name | Data Type | Length (Int) | Decimal | PK | NN | DF | Description |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
```
- `No.` reset về 1 cho mỗi bảng.
- Cột đầu luôn `ID` (PK, NN, `AUTO_INCREMENT`).
- Soft-delete: **entity chính** (theo khoảng ngày) → `DELETED_FROM`/`DELETED_TO`; **dòng con/junction** (theo thời điểm) → `DELETED_AT`. Đọc kỹ Đặc tả sơ bộ để xác định đúng kiểu.
- FK đặt tên `<TÊN_BẢNG_CHA_VIẾT_TẮT>_ID`.
- Bảng thuộc phạm vi màn khác (đã có Detail Design riêng): chỉ khai FK trỏ tới, không định nghĩa lại. Bảng chưa ai định nghĩa: định nghĩa đầy đủ tại đây dù "thuộc về" màn khác về nghiệp vụ.
- Đặc tả sơ bộ mô tả nhiều trạng thái song song độc lập (Draft/Approved...) → tách 2 bảng vật lý riêng, không dùng 1 cột `status`.

---

# 4. Cập nhật `00_pipeline_status.md`
Sau khi hoàn thành, cập nhật file trạng thái:
```markdown
- Bước 1 (Structure): ✅ Xong

## Danh sách API (điền sau khi xong Bước 1)
| API | Bước 2 (API Processing) |
| :--- | :---: |
| Get Approved | ⬜ Chưa làm |
| Save Draft | ⬜ Chưa làm |
```
(liệt kê đúng và đủ mọi API ở mục 3.3 vừa sinh)

---

# 5. Kết thúc — hướng dẫn bước tiếp theo
In rõ cho người dùng:
1. Danh sách API cần chạy `detail-design-step2-api-processing` (mỗi API 1 lần gọi riêng).
2. Sau khi xong hết API, chạy `detail-design-step3-check-spec`.
3. Cuối cùng chạy `detail-design-step4-finalize` để kiểm tra & hợp nhất.
4. **(Tùy chọn, độc lập)** Có thể chạy `detail-design-step5-mockup` bất cứ lúc nào từ bây giờ để xem trước giao diện màn hình dạng HTML — không bắt buộc, không chặn Bước 2/3/4.

---

# 6. Quy tắc Dừng lại Hỏi Người Dùng
1. Đặc tả sơ bộ không đủ chi tiết nội dung hiển thị của màn hình — hỏi thay vì tự bịa toàn bộ dashboard.
2. Khái niệm nghiệp vụ có thể trùng bảng/field đã định nghĩa ở màn khác nhưng không chắc chắn.
3. Nhiều cách hiểu về điều kiện lọc/sắp xếp (ví dụ "tuần gần nhất").


---

# 7. Checklist Tự kiểm tra
- [ ] Đã đối chiếu Detail Design màn khác để không tạo trùng bảng/field.
- [ ] Số API ở Execution API khớp đúng số mục lớn ở Description of the Process.
- [ ] Bảng dữ liệu dạng lưới đã liệt kê đủ từng cột, không gộp.
- [ ] `00_pipeline_status.md` đã liệt kê đủ và đúng tên mọi API cho Bước 2.
- [ ] Đã in hướng dẫn gọi Bước 2 (từng API) → Bước 3 → Bước 4, và nhắc Bước 5 tùy chọn.