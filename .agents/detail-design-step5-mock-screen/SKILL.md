---
name: detail-design-step5-mockup
description: "Bước 5 (tùy chọn) của quy trình detail design. Đọc mục Screen Wireframe (3.1) trong 01_structure.md — Screen Layout Wireframe, List of Items — và sinh 1 file HTML tĩnh (05_mockup.html) mô phỏng trực quan giao diện màn hình, dùng dữ liệu mẫu hợp lý theo Initial Value/Description/Type của từng Item. Ghi vào thư mục làm việc, cập nhật 00_pipeline_status.md. Chỉ cần `01_structure.md` đã xong (Bước 1) — KHÔNG phụ thuộc Bước 2/3/4, có thể chạy bất cứ lúc nào sau Bước 1, kể cả song song với các bước khác. Dùng skill này khi người dùng muốn 'xem trước giao diện', 'demo HTML', 'mockup màn hình' cho màn đã/đang detail design."
---

# 1. Vai trò & Mục tiêu
Bạn là **Senior Business Analyst / Frontend Prototyper**. Đây là **Bước 5 (tùy chọn)** của quy trình chi tiết hóa 1 màn hình. Nhiệm vụ: dựa vào **Screen Wireframe** đã chốt ở Bước 1 (`01_structure.md`, mục 3.1), dựng 1 file **HTML tĩnh, tự chứa** (không cần build tool, không cần backend) để người dùng xem trước bố cục và luồng nhập/hiển thị thực tế của màn hình.

**Không làm ở bước này:**
- Không gọi API thật, không kết nối dữ liệu thật — mọi dữ liệu là **dữ liệu mẫu (mock)**.
- Không cần đúng pixel-perfect theo design system chính thức — mục tiêu là **đúng cấu trúc thông tin và luồng thao tác**, không phải bản UI cuối cùng.
- Không tự thêm Item/trường không có trong `01_structure.md`.

**Trước khi bắt đầu:**
1. Xác nhận `01_structure.md` đã tồn tại trong thư mục làm việc `docs/detail_design/Screen0X_<TenManHinh>/`; nếu chưa có, đề xuất chạy `detail-design-step1-structure` trước.
2. Đọc mục 3.1 (Screen wireframe): Screen Layout Wireframe, URL, Processing Overview, List of Items.
3. (Tùy chọn) Đọc mục 3.2 (Description of the process) để hiểu đúng thứ tự thao tác, dùng cho việc bố trí nút bấm/luồng chuyển trạng thái trên mockup (ví dụ nút "Save Draft" rồi "Approve").

---

# 2. Đầu vào
- `01_structure.md` trong thư mục làm việc — bắt buộc, đặc biệt mục 3.1.1 (Layout), 3.1.4 (List of Items).
- (Tùy chọn) `01_structure.md` mục 3.2 để suy ra nút hành động chính và trạng thái màn hình.
- (Tùy chọn) Yêu cầu riêng của người dùng về theme màu/độ rộng màn hình nếu có nêu ra — nếu không nêu, dùng mặc định trung tính (mục 3 bên dưới).

---

# 3. Output — ghi vào `05_mockup.html`
File HTML **1 file duy nhất**, tự chứa toàn bộ CSS (`<style>` trong `<head>`), không phụ thuộc file ngoài, không cần JS phức tạp — chỉ JS tối thiểu nếu cần mô phỏng tương tác đơn giản (toggle tab, mở modal, chuyển trạng thái nút).

## 3.1 Quy tắc dựng layout
- Map đúng theo `Screen Layout Wireframe` (3.1.1): `Dashboard` → dùng lưới card/số liệu tổng hợp ở trên, bảng chi tiết bên dưới; `List` → thanh filter/search trên cùng + bảng dữ liệu + phân trang; `Form` → nhóm field theo khối logic + nút Save/Cancel cuối trang; `Detail` → khối thông tin chỉ đọc + nút hành động (Edit/Approve/Back).
- Hiển thị `URL` (3.1.2) dạng thanh địa chỉ giả lập ở đầu mockup (ví dụ 1 thanh xám nhỏ ghi path) để người xem biết đang mô phỏng route nào.
- `Processing Overview` (3.1.3) hiển thị dưới dạng ghi chú nhỏ (comment/caption) phía trên mockup, không phải phần tử UI thật.

## 3.2 Quy tắc map List of Items → HTML control
Với mỗi dòng trong bảng List of Items (3.1.4), map theo cột `I/O` và `Types`:
| I/O | Cách thể hiện |
| :--- | :--- |
| `I` | Control nhập tương ứng `Types` (text/number → `<input>`; date → `<input type="date">`; select/enum → `<select>`; checkbox/boolean → `<input type="checkbox">`; textarea nếu mô tả dài) |
| `O` | Text tĩnh hoặc ô bảng, có `readonly`/style xám nhạt để phân biệt trực quan với `I` |
| `IO` | Control giống `I` nhưng có giá trị mẫu điền sẵn (mô phỏng "đã có dữ liệu, sửa được tại chỗ") |
| `-` | Phần tử tĩnh (label, heading, divider) — không có control |

Quy tắc bổ sung:
- `Required` = có → thêm dấu `*` đỏ cạnh label và thuộc tính `required`.
- `Value (min/max)` / `Number of digits` có giới hạn → set `min`/`max`/`step` tương ứng trên `<input>` nếu là number/date.
- **Item dạng lưới/grid** (nhiều dòng Item con đại diện các cột của 1 bảng, ví dụ 7 cột theo ngày trong tuần): dựng thành 1 bảng HTML `<table>` thật, header lấy từ `Item Name` của từng cột, có ít nhất 2-3 dòng dữ liệu mẫu.
- Dữ liệu mẫu: sinh giá trị **hợp lý, khớp Type/Description/Initial Value** đã khai — ví dụ Item `O` có Description "Lấy từ trường TOTAL_AMOUNT" → điền số tiền mẫu hợp lý, không điền `0`/`N/A` vô nghĩa. Không bịa dữ liệu trái ràng buộc `Value (min/max)` đã khai.
- `No` trong bảng gốc chỉ dùng để đối chiếu thứ tự — không hiển thị lại số `No` trên mockup trừ khi bản chất Item đó là 1 cột số thứ tự trong bảng dữ liệu.

## 3.3 Nút hành động
- Suy ra danh sách nút bấm chính từ `Processing Overview` (3.1.3) và/hoặc mỗi mục lớn (P1, P2...) trong Description of the process (3.2) nếu đã đọc — mỗi hành động gọi API kiểu Write/Upsert ứng với 1 nút rõ ràng (ví dụ "Lưu nháp", "Duyệt").
- Nút bấm có thể gắn `onclick` JS đơn giản để mô phỏng phản hồi (ví dụ hiện toast "Đã lưu (mock)") — không gọi API thật, không `fetch`.

## 3.4 Style mặc định (nếu người dùng không yêu cầu riêng)
- Layout responsive cơ bản, max-width khung nội dung khoảng `1100px`, căn giữa.
- Font hệ thống (`-apple-system, Segoe UI, sans-serif`), màu trung tính (nền trắng/xám nhạt, chữ đen/xám đậm, 1 màu nhấn duy nhất cho nút primary).
- Bảng dữ liệu có viền nhẹ, hàng chẵn/lẻ xen màu để dễ đọc.
- Field bắt buộc và field lỗi (nếu mô phỏng trạng thái lỗi mẫu) dùng màu đỏ nhất quán.
- Không dùng framework/CDN ngoài — toàn bộ CSS viết tay trong `<style>` để file mở được offline, không phụ thuộc mạng.

---

# 4. Cập nhật `00_pipeline_status.md`
Thêm/cập nhật dòng trạng thái (không phá vỡ format các dòng khác):
```markdown
- Bước 5 (Mockup HTML): ✅ Xong — `05_mockup.html`
```
Nếu dòng "Bước 5" chưa tồn tại trong file trạng thái (vì được tạo trước khi có Bước 5), thêm mới dòng này ngay dưới dòng "Bước 4 (Finalize)".

---

# 5. Kết thúc — hướng dẫn bước tiếp theo
- Nhắc người dùng đây là bước **tùy chọn**, độc lập với Bước 2/3/4 — không bắt buộc phải xong Bước 5 mới được chạy `detail-design-step4-finalize`.
- Nếu Đặc tả sơ bộ/Bước 1 sau đó có chỉnh sửa Wireframe, nhắc người dùng có thể gọi lại `detail-design-step5-mockup` để dựng lại mockup cho khớp.

---

# 6. Quy tắc Dừng lại Hỏi Người Dùng
1. `01_structure.md` chưa tồn tại hoặc mục 3.1 (Screen wireframe) còn thiếu dữ liệu — không tự bịa layout/Item.
2. `Screen Layout Wireframe` không đủ rõ để chọn kiểu bố cục (Dashboard/List/Form/Detail) — hỏi thay vì đoán.
3. Item có `Description`/`Value (min/max)` mâu thuẫn nhau khiến không sinh được dữ liệu mẫu hợp lý.

---

# 7. Checklist Tự kiểm tra
- [ ] Mọi dòng trong List of Items (3.1.4) đều xuất hiện trên mockup, đúng loại control theo `I/O`.
- [ ] Item `Required` có dấu `*` và thuộc tính bắt buộc.
- [ ] Item dạng lưới/grid được dựng thành bảng thật, không gộp.
- [ ] Dữ liệu mẫu hợp lý, khớp Type/Description/Value (min/max), không bịa vô nghĩa.
- [ ] File HTML tự chứa (CSS trong `<style>`, không phụ thuộc CDN/file ngoài), mở offline được.
- [ ] Đã cập nhật dòng "Bước 5" trong `00_pipeline_status.md`.
- [ ] Đã nhắc rõ đây là bước tùy chọn, không chặn Bước 4.