---
name: detail-design-step2-api-processing
description: "Bước 2/4 của quy trình detail design. Làm chi tiết API Processing (Business Flow, Data Response Definition, SQL Explanation) cho MỘT API cụ thể đã được liệt kê ở 01_structure.md (Bước 1) — theo Mẫu A (Retrieve) cho API GET hoặc Mẫu B (Write/Upsert) cho API POST/PUT lưu danh sách. Ghi kết quả vào file 02_api_processing riêng cho API đó, cập nhật 00_pipeline_status.md, và nhắc gọi lại skill này cho API tiếp theo hoặc chuyển sang Bước 3. Gọi skill này 1 LẦN CHO MỖI API — nếu màn có N API, cần gọi N lần, mỗi lần chỉ định rõ 1 API."
---

# 1. Vai trò & Mục tiêu
Bạn là **Senior Business Analyst / System Architect**. Đây là **Bước 2/4**, được gọi **riêng cho từng API một**. Nhiệm vụ: đọc `01_structure.md` (Bước 1) + Đặc tả sơ bộ, làm chi tiết đầy đủ API Processing cho **đúng 1 API** được chỉ định (business flow, Data Response Definition, SQL Explanation).

**Trước khi bắt đầu:**
1. Đọc `01_structure.md` trong thư mục làm việc để lấy đúng field/tên bảng đã chốt ở Bước 1 — không tự đặt tên khác.
2. Xác định rõ đang làm API nào trong danh sách ở `00_pipeline_status.md`; nếu người dùng không chỉ rõ và còn nhiều API chưa làm, hỏi làm API nào trước.
3. Xác định **loại luồng**: `GET` → **Mẫu A — Retrieve**; `POST`/`PUT` lưu danh sách/lưới có thể thêm-sửa-xóa dòng → **Mẫu B — Write/Upsert**.

---

# 2. Output — ghi vào `02_api_processing_<TenAPI>.md`

### Mẫu A — Retrieve (cho API `GET`)
```markdown
## Sheet: API Processing (<Tên API>)

### 1. Business Flow Diagram
*(Xem sơ đồ luồng nghiệp vụ API <tên>)*

### 2. Explanation of Business Flow

#### ① Call the method "UserAuthenticationCheck"
- **Parameters:** User authentication token
- **Return Value:** Authentication flag
  - **1.1 Thông tin khách hàng nhập vào không tồn tại (Authentication flag = false):**
    - 1.1.1 Đặt lỗi là "Tài khoản hoặc mật khẩu không chính xác"
    - 1.1.2 Đặt `401` làm mã trạng thái trả về
  - **1.2 User authentication token đã hết hạn:**
    - 1.2.1 Đặt lỗi là "User authentication token hết hạn"
    - 1.2.2 Đặt `401` làm mã trạng thái trả về
  - **1.3 Trong các trường hợp khác (bình thường):**
    - Chuyển sang quy trình tiếp theo

#### ② Check Request
- **Arguments:** Tham chiếu bảng tham số từ `01_structure.md` (Execution API)
  - **2.1.1 Khi tham số không hợp lệ:** Đặt lỗi + `400`.
  - **2.1.2 Khi hợp lệ:** Chuyển sang bước truy xuất dữ liệu.

#### ③ Retrieve <mô tả dữ liệu cần lấy>
- **3.1 Không có dữ liệu:** `200`, kết thúc bình thường.
- **3.2 Lỗi:** "Có lỗi khi truy xuất dữ liệu", `500`.
- **3.3 Có dữ liệu:**

##### 3.3.1 Data Response Definition
| Physical Name | Logical Name | Type | Table Physical Name | Table Logical Name | Physical name of the item | Item logical name |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
- ID object gốc: đặt tên mô tả đầy đủ ngữ cảnh (ví dụ `approvedWeeklyProductionPlanID`). ID phần tử trong mảng lồng: chỉ cần `id`.
- Nhiều bước Retrieve (③④...) → mỗi bước có Data Response Definition + SQL riêng.

##### 3.3.2 SQL Explanation
\`\`\`sql
SELECT (refer to the physical names of the above items)
FROM <BẢNG_CHÍNH> <alias>
JOIN <bảng_khác> <alias> ON <điều kiện join>
\`\`\`

**WHERE:**
| SEARCH | operator | Parameter | AND/OR | trim | Necessary | Notes |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- |

**Sắp xếp:** cố định → `**SORT:** \`ORDER BY <clause>\`` (không bảng); động → bảng `Sort column | Parameter | Group column | Notes`. Grid/pivot sort theo ngày → `ORDER BY <AGG>(CASE WHEN <cột_ngày>=sortDay THEN <cột_giá_trị> ELSE 0 END) sortCondition`.

**Phân trang:** LIMIT/OFFSET (số hoặc param, `-` nếu không áp dụng).

- **Bước cuối:** Retrieve cuối cùng → "Đặt `200`... trả về danh sách dữ liệu."; Retrieve trung gian → mô tả rõ hành động chuyển tiếp (ví dụ gán lại `startDate`/`endDate` rồi chuyển bước kế).
```

### Mẫu B — Write/Upsert (cho API `POST`/`PUT` lưu danh sách/lưới)
```markdown
#### ① UserAuthenticationCheck — giống Mẫu A.
#### ② Check Request — giống Mẫu A, lỗi 400 phản ánh đúng business rule ghi dữ liệu.

#### ③ Check <Tên bảng cha>
- 3.1 Không có dữ liệu → Chuyển sang Quy trình ④.
- 3.2 Lỗi → `500`.
- 3.3 Có dữ liệu → Data Response Definition + SQL (SELECT, lấy cả cha + danh sách con hiện có, dùng diff ở ⑤) → "Chuyển sang quy trình ⑤".

#### ④ Insert new <TÊN_BẢNG_CHA> Record (chỉ chạy khi ③ không có dữ liệu)
- 4.1 lỗi → `500`.
- 4.2 Data Response Definition (ID vừa sinh + cột cấp cha) + SQL INSERT:
  | COLUMN | VALUES | NOTE |
  | :--- | :--- | :---: |
- Kết thúc: "Chuyển sang quy trình ⑧" (bỏ qua ⑤⑥⑦).

#### ⑤ Compare <request> with <dữ liệu bước ③> (thuần diff, KHÔNG SQL)
- Chia thành: `softDelete<Entity>s[]` (có trong DB, mất trong request), `update<Entity>s[]` (có ở cả 2), `insert<Entity>s[]` (mới trong request).

#### ⑥ Soft-delete <Entity>
- SQL UPDATE cho MỖI cấp bảng con liên quan, `SET DELETED_AT = NOW()`, `WHERE <FK_ID> IN softDelete<Entity>s[].id`. → "Chuyển sang quy trình ⑦".

#### ⑦ Update <Entity>
- SQL UPDATE set cột dữ liệu thực, WHERE theo ID từ `update<Entity>s[]`. Kết thúc bằng `200` nếu là bước cuối, hoặc "Chuyển sang quy trình ⑧".

#### ⑧ Insert <Entity>
- SQL INSERT, cha trước con sau nếu lồng nhau (NOTE: "lấy từ response sau khi Insert `<BẢNG_CHA>` Record"). Kết thúc: "Đặt `200`... trả về danh sách dữ liệu."
```
Quy tắc riêng Mẫu B:
- Số bước ①-⑧ không chạy tuần tự cố định — dùng "Chuyển sang quy trình N" tường minh mỗi khi rẽ nhánh.
- Tên mảng diff: `softDelete<Entity>s[]`, `update<Entity>s[]`, `insert<Entity>s[]`.
- Entity nhiều cấp lồng (tuần→ngày): ⑥⑦⑧ phải xử lý đủ từng cấp (2 câu SQL liên tiếp).
- 1 nút bấm gọi nhiều API tuần tự (Draft rồi Approved): mỗi API là 1 lần gọi Bước 2 riêng, không gộp.

Quy tắc chung cả 2 mẫu:
- ①② luôn xuất hiện y hệt, trừ khi Đặc tả sơ bộ nói rõ API public.
- WHERE/SQL dùng đúng alias đã khai ở SELECT.
- `DELETED_AT IS NULL` (hoặc tương đương) cho mọi bảng soft-delete.
- Điều kiện version hiệu lực: xác định rõ mốc `NOW()` hay theo tuần tham chiếu — hỏi nếu không rõ, không mặc định `NOW()`.

---

# 3. Cập nhật `00_pipeline_status.md`
Đánh dấu API vừa làm thành `✅ Xong` trong bảng danh sách API.

---

# 4. Kết thúc — hướng dẫn bước tiếp theo
- Nếu còn API chưa làm ở `00_pipeline_status.md`: liệt kê tên API tiếp theo, nhắc gọi lại `detail-design-step2-api-processing` cho API đó.
- Nếu đã xong hết API: nhắc chạy `detail-design-step3-check-spec`.

---

# 5. Quy tắc Dừng lại Hỏi Người Dùng
1. Không rõ nên làm API nào tiếp theo (còn nhiều API chưa làm, người dùng không chỉ định).
2. Điều kiện lọc "hiệu lực" mơ hồ giữa `NOW()` và tuần tham chiếu.
3. Mô tả trong Đặc tả sơ bộ chưa đủ rõ để viết 1 bước rẽ nhánh không mơ hồ (đặc biệt ④⑤⑥⑦⑧ ở Mẫu B).

---

# 6. Checklist Tự kiểm tra
- [ ] Field name khớp 100% với `01_structure.md`.
- [ ] Đủ bước ①② chuẩn; nếu Mẫu B, đủ cả ③④⑤⑥⑦⑧ với "Chuyển sang quy trình N" tường minh ở mọi rẽ nhánh.
- [ ] Entity nhiều cấp lồng đã xử lý đủ từng cấp ở ⑥⑦⑧.
- [ ] Đã cập nhật đúng dòng API trong `00_pipeline_status.md`.
- [ ] Đã in rõ hướng dẫn bước tiếp theo (API kế hoặc Bước 3).