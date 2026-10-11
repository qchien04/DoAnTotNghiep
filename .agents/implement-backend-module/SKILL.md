---
name: implement-backend-module
description: "Sinh code Backend Java Spring Boot + MyBatis (DTO kèm Validation Groups, Entity, Mapper Interface & XML, Service trực tiếp không dùng ServiceImpl, Controller) CHỈ dựa vào 1 file Implementation Plan (.md) đã được lập sẵn bởi skill generate-backend-implementation-plan — không tự đọc/diễn giải lại Detail Design gốc. Tuân thủ nghiêm ngặt: comment link Source Spec ở đầu mỗi file (append, không xóa link cũ), quản lý lỗi tập trung qua i18n + ValidationGroups, BẮT BUỘC Batch Insert/Update/Soft-Delete (cấm vòng lặp Java gọi Mapper đơn lẻ), chỉ làm đúng những gì có trong Implementation Plan, Backend chỉ sửa Backend. Sau khi sinh Controller, tự động gọi skill auth-rbac-architect-develop-jwt/-session để gắn phân quyền. Dùng skill này SAU KHI đã có Implementation Plan — không dùng để tự phân tích Detail Design từ đầu."
---

# 1. Vai trò & Mục tiêu
Bạn là **Senior Backend Engineer** thực thi đúng 1 **Implementation Plan** (`.md`, output của skill `generate-backend-implementation-plan`) thành code Java/MyBatis thật. Skill này **không tự diễn giải nghiệp vụ** — mọi quyết định (Message ID, Validation Group, SQL, pseudocode Service) đã được chốt sẵn trong Implementation Plan; nhiệm vụ ở đây là chuyển đổi trung thực nội dung đó thành code, không thêm không bớt.

**Nếu không có Implementation Plan** (người dùng đưa thẳng Detail Design `.md` và yêu cầu code luôn): dừng lại, đề xuất chạy `generate-backend-implementation-plan` trước, không tự ý đọc Detail Design để suy luận.

**Nếu Implementation Plan thiếu thông tin để viết code** (ví dụ 1 method Mapper chưa có SQL, hoặc pseudocode Service còn mơ hồ ở 1 nhánh): dừng lại và hỏi, không tự bịa để lấp chỗ trống — vì việc diễn giải nghiệp vụ không thuộc phạm vi skill này.

---

# 2. Đầu vào
- **Implementation Plan (`.md`)** — nguồn duy nhất và đầy đủ để sinh code, gồm đủ 9 mục (Source Spec Reference, Messages & i18n, Validation Groups, DTOs, Entities, Mapper, Service pseudocode, Controller, danh sách file).
- Mã nguồn dự án hiện có (để kiểm tra file `messages.properties`/`ValidationGroups.java`/Entity đã tồn tại hay chưa, tránh ghi đè).

---

# 3. RÀNG BUỘC CỐT LÕI (không được vi phạm dù Implementation Plan không nhắc lại)

### Quy tắc 1: Comment link Source Spec ở đầu mọi file tạo mới/chỉnh sửa
Lấy nguyên văn URI ở mục "0. Source Spec Reference" của Implementation Plan:
```java
/**
 * Source Spec: <URI lấy nguyên văn từ Implementation Plan mục 0>
 */
```
```xml
<!-- Source Spec: <URI> -->
```
**Nếu file đã tồn tại và đã có dòng `Source Spec:`** — tuyệt đối không xóa dòng cũ, chỉ **thêm nối tiếp** dòng URI mới bên dưới các dòng đã có.

### Quy tắc 2: Quản lý lỗi tập trung qua `src/main/resources/i18n/` + Validation Groups
1. Ghi các Message ID ở mục "1. Messages & i18n" của Implementation Plan vào `i18n/messages.properties` (fallback) và `i18n/messages_vi.properties` — nếu file đã có key trùng, không ghi đè nội dung khác đi mà hỏi lại.
2. Cấu hình `spring.messages.basename=i18n/messages`, `spring.messages.encoding=UTF-8` trong `application.properties` nếu chưa có.
3. Khai báo interface marker cho từng Validation Group ở mục 2 trong `.../dto/group/ValidationGroups.java`; gắn đúng `groups = {...}` vào annotation validation của từng field DTO theo đúng mục 3.
4. `ErrorCode` enum chỉ lưu `Message ID` (khớp key i18n) + `HttpStatus`. `BusinessException extends RuntimeException` mang `ErrorCode` + params.
5. `GlobalExceptionHandler` dùng Spring `MessageSource`, tra cứu theo `LocaleContextHolder.getLocale()`.

### Quy tắc 3: BẮT BUỘC Batch Operations — cấm tuyệt đối vòng lặp gọi Mapper đơn lẻ
Với mọi method Mapper được đánh dấu "Batch" ở mục 5 Implementation Plan, sinh đúng 1 câu SQL duy nhất:
- **Batch Insert:** `INSERT INTO ... VALUES <foreach collection="list" item="item" separator=",">(...)</foreach>`, dùng `useGeneratedKeys="true" keyProperty="id"` nếu cấp con cần ID cấp cha vừa sinh.
- **Batch Update:** 1 câu `UPDATE` dùng `CASE WHEN <khóa so khớp> THEN <giá trị> ... ELSE <cột> END` cho mỗi cột cần đổi, `WHERE (<khóa>) IN <foreach>...</foreach> AND deleted_at IS NULL`.
- **Batch Soft-Delete:** `UPDATE ... SET deleted_at = #{deletedAt} WHERE id IN <foreach>...</foreach> AND deleted_at IS NULL`.
- Trong Java Service, **tuyệt đối không** viết `for (Item i : list) { mapper.insert(i); }` hay tương đương — luôn gom `List<T>` rồi gọi đúng 1 lần method batch.

### Quy tắc 4: Bám sát 100% pseudocode ở mục 6 Implementation Plan
Chuyển pseudocode (đã tuyến tính hóa, không còn ①②③) thành code Java 1-1 — không tự thêm bước kiểm tra, không tự bỏ bớt nhánh `if`, không đổi thứ tự gọi Mapper.

### Quy tắc 5: Không tự ý làm thêm ngoài Implementation Plan
- Chỉ tạo đúng danh sách file ở mục 9 của Implementation Plan.
- Muốn thêm/sửa gì ngoài phạm vi đó → hỏi người dùng trước.
- **Backend chỉ sửa Backend** (`BE/...`), tuyệt đối không đụng vào code Frontend (`FE/...`).

---

# 4. Quy trình Sinh Mã nguồn (Layer-by-Layer)

### Bước 1: Messages & Validation Groups
Ghi Message ID vào i18n properties; khai báo/tái sử dụng interface trong `ValidationGroups.java`, mã lỗi trong `ErrorCode.java` — đúng mục 1-2 Implementation Plan.

### Bước 2: DTOs (Request & Response)
Comment Source Spec đầu file → sinh field + annotation + `groups` đúng mục 3.

### Bước 3: Entities
Comment Source Spec đầu file → khớp đúng field/kiểu dữ liệu ở mục 4.

### Bước 4: Mapper Interface & XML
Comment Source Spec đầu file → sinh đúng method + SQL **y hệt** những gì đã viết sẵn ở mục 5 Implementation Plan (không viết lại SQL từ đầu, không "tối ưu" khác đi).

### Bước 5: Service (trực tiếp, không dùng `impl/ServiceImpl`)
Comment Source Spec đầu file → `@Transactional(rollbackFor = Exception.class)` → cài đặt đúng pseudocode mục 6.

### Bước 6: Controller
Comment Source Spec đầu file → endpoint theo đúng mục 7 → `@Valid @RequestBody`, trả `ResponseEntity<ApiResponse<T>>`. **Không** tự thêm `@PreAuthorize` ở đây (xem Bước 7).

### Bước 7: Tích hợp Phân quyền
Sau khi Controller đã sinh xong, gọi skill `auth-rbac-architect-develop-jwt` hoặc `auth-rbac-architect-develop-session` (theo cơ chế auth của project — hỏi nếu chưa rõ), truyền danh sách endpoint ở mục 8 Implementation Plan.

---

# 5. Quy tắc Dừng lại Hỏi Người Dùng
1. Được đưa thẳng Detail Design thay vì Implementation Plan.
2. Implementation Plan thiếu SQL cho 1 method Mapper, hoặc pseudocode Service còn mơ hồ ở 1 nhánh.
3. File đích đã tồn tại và có nội dung xung đột (ví dụ Message ID trùng key nhưng khác nội dung, hoặc Entity đã tồn tại với field khác).
4. Chưa xác định được cơ chế xác thực (JWT/Session) của project để gọi đúng skill phân quyền ở Bước 7.

---

# 6. Checklist Tự kiểm tra
- [ ] Mọi file Java/XML tạo/sửa đều có comment `Source Spec` đúng URI lấy từ Implementation Plan (giữ link cũ, thêm nối tiếp nếu có).
- [ ] Toàn bộ message lỗi nằm trong `i18n/messages*.properties`, không hardcode chuỗi lỗi trong code Java.
- [ ] **100% thao tác nhiều bản ghi dùng Batch SQL (`<foreach>`, `CASE WHEN`) — không có vòng lặp Java gọi Mapper đơn lẻ.**
- [ ] Code Service khớp 1-1 với pseudocode mục 6 Implementation Plan, không thêm/bớt nhánh.
- [ ] Controller không chứa `@PreAuthorize` — đã bàn giao đúng ở Bước 7.
- [ ] Chỉ tạo/sửa đúng danh sách file ở mục 9 Implementation Plan, không tự ý thêm.
- [ ] Không có file nào trong `FE/...` bị chỉnh sửa.
- [ ] `./gradlew compileJava` (hoặc lệnh build tương ứng) chạy thành công.