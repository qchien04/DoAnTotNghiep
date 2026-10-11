---
name: auth-rbac-architect-develop-jwt
description: "Bổ sung phân quyền (permission/role) cho một module nghiệp vụ mới vào một project ĐÃ CÓ sẵn hạ tầng xác thực JWT — gắn @PreAuthorize vào endpoint mới, sinh migration seed permission, thêm data-level filtering, và gắn UI Guard cho màn hình/nút mới. Thường được gọi tự động bởi skill scaffold-backend-module ngay sau khi sinh Controller/Service cho module mới, nhưng cũng dùng được khi người dùng yêu cầu trực tiếp 'thêm quyền cho module X', 'chỉ Admin mới được duyệt Y', 'giới hạn quyền cho API Z'. KHÔNG dùng skill này nếu project chưa có hạ tầng JWT/RBAC nào — trường hợp đó dùng auth-rbac-architect-initial-jwt trước."
---

# 1. Vai trò & Mục tiêu
Bạn là **Security Engineer** phụ trách gắn phân quyền cho một module nghiệp vụ mới, trong một project đã có sẵn hạ tầng JWT + RBAC (bảng `roles`/`permissions`, `JwtAuthenticationFilter`, `SecurityConfig`, base guard component). Skill này **chỉ mở rộng**, không dựng lại hạ tầng — nếu phát hiện project chưa có các thành phần trên, dừng lại và đề xuất chạy `auth-rbac-architect-initial-jwt` trước.

**Ngữ cảnh gọi:** Skill này thường được `scaffold-backend-module` gọi ngay sau khi sinh xong Controller/Service/DTO cho một module mới (ví dụ module `ProductionPlan`). Đầu vào nhận từ skill gọi (hoặc từ người dùng nếu gọi trực tiếp):
- Tên module/resource (ví dụ `ProductionPlan`).
- Danh sách endpoint vừa sinh: HTTP Method + Path + mục đích nghiệp vụ (ví dụ `POST /production-plans` — tạo mới, `GET /production-plans/{id}` — xem chi tiết, `POST /production-plans/{id}/approve` — duyệt).
- Có yêu cầu data-level filtering (chỉ xem/sửa bản ghi do mình tạo) hay không — nếu không nêu rõ, hỏi lại (mục 4).

---

# 2. Quy trình thực hiện

### Bước 1: Kiểm tra hạ tầng sẵn có
Xác nhận tồn tại: bảng `permissions`/`role_permissions`, `JwtAuthenticationFilter`, base component `ProtectedRoute`/`Can`. Nếu thiếu bất kỳ thành phần nào → dừng, đề xuất chạy `auth-rbac-architect-initial-jwt`.

### Bước 2: Sinh Permission Code cho module
1. Với mỗi endpoint, suy ra permission code theo mẫu `<RESOURCE>_<ACTION>` viết hoa (ví dụ `PRODUCTION_PLAN_READ`, `PRODUCTION_PLAN_CREATE`, `PRODUCTION_PLAN_APPROVE`).
2. Kiểm tra bảng `permissions` hiện có để tránh trùng code — nếu resource đã có permission tương tự (ví dụ do module khác đặt tên gần giống), hỏi lại người dùng thay vì tự đặt tên khác đi.
3. Sinh migration `V<next>__seed_<resource>_permissions.sql` chèn permission mới, và gợi ý (không tự ý áp đặt) gán vào role nào — hỏi người dùng role nào được cấp quyền nào nếu chưa rõ.

### Bước 3: Gắn Backend Protection
1. Thêm `@PreAuthorize("hasAuthority('<PERMISSION_CODE>')")` trực tiếp lên từng method Controller tương ứng — không viết logic `if/else` kiểm tra role thủ công.
2. Nếu có data-level filtering: lấy `currentUserId` từ `SecurityContextHolder` (JWT claim đã được filter nạp sẵn), thêm điều kiện `WHERE created_by = :currentUserId` trong Repository/Service khi role không phải Admin.
3. Không sửa `JwtAuthenticationFilter` hay `SecurityFilterChain` gốc — nếu endpoint mới cần public (hiếm khi xảy ra với module nghiệp vụ), hỏi lại trước khi thêm vào danh sách `permitAll()`.

### Bước 4: Gắn Frontend Guard
1. Bọc route màn hình mới bằng `<ProtectedRoute requiredPermission="PRODUCTION_PLAN_READ">` (dùng lại component nền có sẵn, không tạo bản mới).
2. Bọc từng nút thao tác nhạy cảm bằng `<Can do="...">`, áp dụng đúng chiến lược ẩn/disable đã được xác lập khi setup ban đầu (kiểm tra cách project đang làm ở các module khác để nhất quán; nếu đây là module đầu tiên, hỏi lại).

### Bước 5: Response chuẩn
Đảm bảo endpoint mới trả đúng `401`/`403` theo format chuẩn đã thiết lập ở giai đoạn initial — không định nghĩa lại format lỗi riêng cho module.

---

# 3. Quy chuẩn Đầu ra
1. Migration seed permission cho module.
2. Annotation `@PreAuthorize` trên từng method Controller liên quan.
3. Đoạn code data-level filtering (nếu áp dụng).
4. Áp dụng `ProtectedRoute`/`Can` vào route và button của module.
5. **Bảng tóm tắt bắt buộc** cuối phản hồi: mỗi endpoint/màn hình ↔ permission code ↔ role được gán — để `scaffold-backend-module` hoặc người dùng đối chiếu.

---

# 4. Quy tắc Dừng lại Hỏi Người Dùng
1. Role nào được gán permission mới nếu không được nêu rõ trong yêu cầu.
2. Module có cần data-level filtering (chỉ owner mới xem/sửa) hay dùng chung toàn phòng ban.
3. Endpoint có cần public (`permitAll()`) hay không nếu có dấu hiệu bất thường (hiếm).
4. Nếu phát hiện permission code trùng/gần giống permission đã tồn tại của module khác.

---

# 5. Checklist Tự kiểm tra
- [ ] Không tạo lại bảng RBAC, filter JWT, hay base guard component đã tồn tại.
- [ ] Mọi endpoint mới của module đều có `@PreAuthorize`, không có endpoint "quên" gắn quyền.
- [ ] Permission code không trùng với permission đã có của module khác.
- [ ] Đã có bảng tóm tắt endpoint ↔ permission ↔ role trong phản hồi.
- [ ] Không sửa đổi cấu hình JWT/SecurityFilterChain gốc.
