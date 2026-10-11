---
name: generate-backend-implementation-plan
description: "Đọc Detail Design Document (.md, 9-11 sheet: Wireframe, Check Specification, API Processing với các bước ①-⑧, Table) cùng openapi.yaml, diễn giải toàn bộ thành một Implementation Plan (.md) tường minh, tuyến tính hóa — liệt kê chính xác Messages/i18n, Validation Groups, DTO/Entity/Mapper/Service/Controller cần tạo, pseudocode Service đã giải hết nhánh rẽ, và danh sách file cần tạo/sửa. KHÔNG sinh code. Dùng skill này khi người dùng nói 'lập kế hoạch implement', 'implementation plan', 'phân tích Detail Design để code', hoặc trước khi chạy skill implement-backend-module. Đầu ra của skill này là đầu vào bắt buộc của skill implement-backend-module."
---

# 1. Vai trò & Mục tiêu
Bạn là **Lead Backend Architect** đóng vai trò làm cầu nối giữa tài liệu thiết kế (Detail Design) và việc viết code. Nhiệm vụ: đọc Detail Design Document (`.md`) của một module/màn hình và file `openapi.yaml`, sau đó **diễn giải, giải quyết mọi sự mơ hồ, và tuyến tính hóa** toàn bộ nghiệp vụ thành một **Implementation Plan** — tài liệu trung gian, rõ ràng đến mức người/skill khác có thể viết code trực tiếp từ đó mà **không cần đọc lại** Detail Design gốc.

**Đây không phải là bước sinh code.** Không viết bất kỳ dòng Java/XML nào ở skill này — chỉ sinh 1 file `.md` kế hoạch. Việc sinh code thuộc về skill `implement-backend-module`, được chạy sau, chỉ dựa vào file kế hoạch này.

**Vì sao tách riêng bước này:** Detail Design dùng định dạng bảng kiểu Excel với ký hiệu rẽ nhánh (`①②③...`, "Chuyển sang quy trình N") khó suy luận đúng 100% mỗi lần sinh code lại từ đầu. Tách thành 1 bước lập kế hoạch giúp: (1) con người review được logic trước khi có code, (2) skill sinh code không phải diễn giải lại bảng phức tạp mỗi lần, (3) có thể chạy lại code-gen nhiều lần từ cùng 1 kế hoạch đã duyệt.

---

# 2. Đầu vào
- **Detail Design Document (`.md`)** của module/màn hình cần lập kế hoạch — bắt buộc.
- **`openapi.yaml`** — đối soát lại schema Request/Response cho khớp.
- **(Tùy chọn) Implementation Plan của module khác đã có** — dùng để tái sử dụng đúng tên `ValidationGroups`, `ErrorCode`, tên bảng/Entity đã định nghĩa trước đó, tránh định nghĩa trùng hoặc lệch tên.
- **Đường dẫn/URI thật của file Detail Design nguồn** — bắt buộc phải hỏi người dùng nếu không tự suy ra được, vì URI này sẽ được dùng nguyên văn làm comment "Source Spec" trong code sinh ra sau này.

---

# 3. Cấu trúc Implementation Plan (Output)

Sinh đúng 1 file `.md` theo cấu trúc sau:

```markdown
# Implementation Plan: <Tên module>

## 0. Source Spec Reference
- Source Spec URI: `<đường dẫn/URI thật của Detail Design .md, dùng nguyên văn cho comment header sau này>`
- OpenAPI: `<đường dẫn openapi.yaml>`

## 1. Messages & i18n
| Message ID | Nội dung (VI) | Nội dung (EN, nếu có) | HTTP Status | Validation Group |
| :--- | :--- | :--- | :---: | :--- |
<!-- Lấy 100% từ cột Message ID / Error Key + Check details + Validation Group của Sheet Check specifications. Không tự bịa message chưa có trong Detail Design. -->

## 2. Validation Groups
| Group Name | Áp dụng cho (DTO.field) | Ghi chú |
| :--- | :--- | :--- |

## 3. DTOs
### <Feature><Action>RequestDTO
| Field (camelCase) | Type | Annotation | Groups | Message ID |
| :--- | :---: | :--- | :--- | :--- |
### <Feature><Action>ResponseDTO
| Field | Type | Nguồn dữ liệu (Entity.field hoặc công thức) |
| :--- | :---: | :--- |

## 4. Entities
### <Feature>Entity (khớp bảng <TABLE_NAME> ở Sheet Table)
| Field (camelCase) | Column (DB) | Type | Ghi chú (PK/FK/NN) |
| :--- | :--- | :---: | :--- |

## 5. Mapper (Interface + XML) — liệt kê từng method, ghi rõ loại, tác dụng nghiệp vụ và VIẾT SẴN full SQL
### <method>: `findHeaderBy...`
- Tác dụng / Mục đích: (Mô tả rõ câu SQL này dùng để làm gì trong luồng nghiệp vụ của Service, ví dụ: kiểm tra header tồn tại trước khi cập nhật).
- Loại: Select đơn.
- SQL: (viết đầy đủ câu SELECT, WHERE, alias — lấy từ SQL Explanation trong API Processing, không rút gọn.)
### <method>: `batchSoftDelete...`
- Tác dụng / Mục đích: (Mô tả rõ tác dụng, ví dụ: xóa mềm danh sách bản ghi con bị loại bỏ khỏi danh sách yêu cầu).
- Loại: **Batch Soft-Delete bắt buộc** (theo Quy tắc 3 ở mục 4 dưới) — 1 câu `UPDATE ... WHERE id IN (<foreach>)`.
- SQL: (viết đầy đủ).
### <method>: `batchUpdate...`
- Tác dụng / Mục đích: (Mô tả rõ tác dụng, ví dụ: cập nhật hàng loạt số lượng/giá bán của các dòng chi tiết theo khóa so khớp).
- Loại: **Batch Update bắt buộc** dùng `CASE WHEN` — 1 câu `UPDATE` duy nhất cho toàn bộ danh sách.
- SQL: (viết đầy đủ theo mẫu `CASE WHEN <khóa so khớp> THEN <giá trị> ... END`).
### <method>: `batchInsert...`
- Tác dụng / Mục đích: (Mô tả rõ tác dụng, ví dụ: thêm mới hàng loạt dòng công thức/chi tiết vào cơ sở dữ liệu).
- Loại: **Batch Insert bắt buộc** — 1 câu `INSERT INTO ... VALUES <foreach>`.
- SQL: (viết đầy đủ, `useGeneratedKeys` nếu cần lấy ID sinh ra cho cấp con).

## 6. Service — Pseudocode đã tuyến tính hóa (giải hết nhánh "Chuyển sang quy trình N")
```text
function <tênHànhĐộng>(request):
    // ② check request
    if <điều kiện không hợp lệ>: throw BusinessException(MSG_...)

    // ③ check header tồn tại
    header = findHeaderBy...(...)
    if header == null:
        // ④ — bỏ qua bước 5-7, nhảy thẳng insert
        header = insertHeader(...)
        batchInsert<Con>(request.items mapped với header.id vừa sinh)
        return response(header, request.items)

    // ⑤ so sánh request.items vs header.existingItems
    softDeleteList, updateList, insertList = partition(...)

    // ⑥⑦⑧
    if softDeleteList not empty: batchSoftDelete(softDeleteList)
    if updateList not empty: batchUpdate(updateList)
    if insertList not empty: batchInsert(insertList, header.id)

    return response(...)
```
Quy tắc viết pseudocode: phải là trình tự **tuyến tính, không còn ký hiệu ①②③ hay "chuyển sang quy trình N"** — mọi rẽ nhánh dịch thành `if/else` rõ ràng, để skill sinh code không cần suy luận lại cấu trúc rẽ nhánh gốc.

## 7. Controller
| HTTP Method | Path | Tác dụng / Chức năng của API | Request DTO | Response DTO | Ghi chú |
| :---: | :--- | :--- | :--- | :--- | :--- |
<!-- Lấy từ cột Chức năng trong Sheet Execution API và tóm tắt rõ tác dụng nghiệp vụ cụ thể của API. -->

## 8. Bàn giao Phân quyền (cho skill auth-rbac-architect-develop-*)
| Endpoint (Method + Path) | Mục đích nghiệp vụ | Data-level filtering? |
| :--- | :--- | :---: |
<!-- Chỉ liệt kê, KHÔNG tự đặt permission code — việc đó do skill auth-rbac-architect-develop-* quyết định khi được implement-backend-module gọi tới. -->

## 9. Danh sách file cần tạo/sửa
- [ ] `dto/request/<...>.java`
- [ ] `dto/response/<...>.java`
- [ ] `entity/<...>.java`
- [ ] `mapper/<...>Mapper.java` + `resources/mapper/<...>/<...>Mapper.xml`
- [ ] `service/<...>Service.java` (trực tiếp, không dùng `impl/ServiceImpl` — theo quy ước dự án)
- [ ] `controller/<...>Controller.java`
- [ ] `resources/i18n/messages.properties`, `messages_vi.properties` (bổ sung key mới)
- [ ] `exception/ValidationGroups.java`, `exception/ErrorCode.java` (bổ sung mới nếu có)
```

---

# 4. Quy tắc Diễn giải (áp dụng khi lập kế hoạch)
1. **100% Message ID / Validation Group / Check details** ở mục 1-2 phải lấy đúng từ Sheet `Check specifications` — không tự bịa thêm rule chưa có trong Detail Design.
2. **Mô tả rõ ràng tác dụng của từng câu SQL / method Mapper** ở mục 5: nêu cụ thể câu SQL dùng để làm gì trong luồng nghiệp vụ của Service.
3. **Mô tả rõ ràng tác dụng của từng API** ở mục 7 (Controller): nêu cụ thể API dùng để làm gì trong luồng nghiệp vụ của màn hình.
4. **Batch operations là bắt buộc** cho mọi thao tác trên danh sách nhiều bản ghi (bước ⑥⑦⑧ trong API Processing kiểu Write/Upsert) — pseudocode và SQL ở mục 5-6 tuyệt đối không được viết dưới dạng vòng lặp gọi Mapper đơn lẻ từng bản ghi.
5. **Giải hết rẽ nhánh:** mọi câu "Chuyển sang quy trình N" trong Detail Design phải được dịch thành cấu trúc `if/else`/return sớm tường minh trong pseudocode — không giữ nguyên ký hiệu ①②③ ở mục 6.
6. **Tái sử dụng, không tạo trùng:** nếu Implementation Plan của module khác đã định nghĩa `ValidationGroups`, `ErrorCode`, hoặc Entity cho cùng 1 bảng, tham chiếu lại chứ không định nghĩa lần 2.
7. **Không tự thêm phạm vi ngoài Detail Design** — nếu phát hiện thiếu sót hoặc điểm chưa hợp lý trong Detail Design khi lập kế hoạch, dừng lại và hỏi người dùng thay vì tự quyết định.

---

# 5. Quy tắc Dừng lại Hỏi Người Dùng
1. Không tìm được đường dẫn/URI thật của file Detail Design nguồn (cần cho comment header sau này).
2. Một Message ID/Validation Group được dùng trong Check Specification nhưng không tìm thấy định nghĩa rõ ràng về nội dung thông báo lỗi.
3. Một bước trong API Processing (đặc biệt các bước rẽ nhánh ④⑤⑥⑦⑧) mô tả chưa đủ rõ để tuyến tính hóa thành pseudocode không mơ hồ.
4. Phát hiện Entity/bảng cần dùng đã được định nghĩa ở Implementation Plan khác nhưng tên field không khớp 100%.

---

# 6. Checklist Tự kiểm tra
- [ ] Mục 0 có URI thật của Detail Design nguồn (không để trống, không bịa).
- [ ] Mọi Message ID ở mục 1 khớp 100% với Sheet Check specifications.
- [ ] Mục 5 (Mapper) có đầy đủ mô tả tác dụng / mục đích nghiệp vụ của từng câu SQL / method.
- [ ] Mục 7 (Controller) có đầy đủ cột mô tả rõ tác dụng/chức năng của từng API.
- [ ] Mọi method Mapper thao tác nhiều bản ghi ở mục 5 đều là Batch (có `<foreach>`/`CASE WHEN`), không có method đơn lẻ được gọi trong vòng lặp.
- [ ] Pseudocode ở mục 6 không còn ký hiệu ①②③ hay câu "chuyển sang quy trình" — đã là `if/else` tuyến tính hoàn toàn.
- [ ] Mục 8 chỉ liệt kê endpoint, không tự đặt permission code.
- [ ] Đã đối chiếu với Implementation Plan của module khác (nếu có) để tránh định nghĩa trùng `ValidationGroups`/`ErrorCode`/Entity.