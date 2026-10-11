---
name: auth-rbac-architect-initial-session
description: "Dựng hạ tầng phân quyền RBAC + xác thực Session (stateful, cookie-based) từ đầu cho một project mới: Database Schema, CustomUserDetails/CustomUserDetailsService, Spring Security Session Config, CSRF Protection, Auth Controller (login/logout/setup-admin), User Management Service (thêm người dùng tùy ý role, cơ chế bootstrap Admin lần đầu và phân quyền cho lần tạo tiếp theo), và base UI Guards cho Frontend. Dùng skill này khi bắt đầu một project mới cần đăng nhập bằng session/cookie truyền thống, hoặc khi người dùng nói 'setup auth', 'khởi tạo phân quyền', 'session login', 'cookie-based authentication', 'thêm user bootstrap admin'."
---

# 1. Vai trò & Mục tiêu
Bạn là **Security Architect**. Nhiệm vụ: dựng toàn bộ hạ tầng RBAC + xác thực Session (stateful, cookie-based) cho một project **chưa có** cơ chế đăng nhập/phân quyền nào. Đây là bước nền tảng — bao gồm cơ chế Bootstrap Admin lần đầu và quản lý người dùng với phân quyền chặt chẽ.

**Nguyên tắc cốt lõi: Deny by default.** Mặc định mọi resource bị từ chối truy cập trừ khi có rule cấp quyền rõ ràng. Không tự ý nới `permitAll()` để "cho dễ chạy thử".

**Kiểm tra trước khi bắt đầu:** Quét project xem đã tồn tại `SecurityConfig`, bảng `users`/`roles`, cấu hình session nào chưa. Nếu đã có, dừng lại và hỏi người dùng có muốn ghi đè hay chuyển sang skill `auth-rbac-architect-develop-session` để mở rộng thay vì dựng lại.

---

# 2. Điều kiện đầu vào
- Danh sách vai trò khởi tạo (mặc định nếu không có: `ROLE_ADMIN`/`ROLE_MANAGER`, `ROLE_STAFF`/`ROLE_USER`).
- Danh sách quyền hạn ban đầu (gồm các quyền cơ bản như `USER_CREATE`, `USER_READ`, `USER_UPDATE`, `USER_DELETE` và các quyền nghiệp vụ).
- Cơ chế ORM/Persistence của dự án: MyBatis (dùng `UserMapper` + XML) hoặc JPA (dùng `UserRepository`).
- Có triển khai nhiều instance backend (cần session dùng chung qua Redis/DB) hay chỉ 1 instance (session in-memory đủ dùng)?

---

# 3. Quy trình thực hiện

### Bước 1: Schema CSDL (Flyway Migration)
Tạo migration Flyway với các bảng:
- `users` (id, username, password_hash BCrypt, full_name, email, status, ...)
- `roles`, `permissions`, `user_roles`, `role_permissions`
- Seed dữ liệu ban đầu: Danh mục Roles (`ROLE_MANAGER`, `ROLE_STAFF`), Danh mục Permissions (`USER_CREATE`, `USER_READ`, ...), và liên kết `role_permissions`.
- **Lưu ý Seed Users:** Có thể để bảng `users` rỗng để dùng cơ chế Bootstrap Admin (Bước 4.3), hoặc seed sẵn 2 tài khoản mẫu (`manager`/`staff`) kèm hash BCrypt chuẩn.

### Bước 2: Tầng Người dùng & Quyền hạn (UserDetails & UserDetailsService)
1. `CustomUserDetails`:
   - Triển khai `UserDetails`, chứa đầy đủ metadata người dùng: `id`, `username`, `password` (hash), `fullName`, `email`, `status`, `roles` (Set<String>), `permissions` (Set<String>).
   - Nạp đồng thời cả **Role Codes** (ví dụ `ROLE_MANAGER`) và **Permission Codes** (ví dụ `USER_CREATE`, `PRODUCTION_PLAN_READ`) vào `Collection<? extends GrantedAuthority>` dưới dạng `SimpleGrantedAuthority`. Điều này giúp hỗ trợ cả `@PreAuthorize("hasAuthority('...')")` lẫn `@PreAuthorize("hasRole('...')")`.
   - Kiểm tra `isAccountNonLocked()` và `isEnabled()` dựa trên trường `status` (`ACTIVE` / `LOCKED`).
2. `CustomUserDetailsService`:
   - Triển khai `UserDetailsService`, tiêm `UserMapper` (hoặc `UserRepository`) để tìm kiếm người dùng theo `username` kèm toàn bộ roles và permissions trong một câu truy vấn tối ưu.
   - Ném ngoại lệ `UsernameNotFoundException("Không tìm thấy người dùng: " + username)` nếu người dùng không tồn tại.
   - Trả về đối tượng `CustomUserDetails(user)` hoàn chỉnh — **tuyệt đối không hardcode role** hoặc dùng class `org.springframework.security.core.userdetails.User` mặc định làm mất metadata.

### Bước 3: Cấu hình Session-based Security & Phòng chống lỗi Redirect CORS
1. **Tránh lỗi 302 Redirect & CORS cho SPA Frontend:**
   - Tắt Form Login mặc định: `http.formLogin(form -> form.disable())` và `http.httpBasic(basic -> basic.disable())`.
   - Tùy biến `AuthenticationEntryPoint` để trả về JSON `401 Unauthorized` (DTO `ErrorResponse`), **tuyệt đối không để Spring Security redirect sang `/login`** gây lỗi CORS trên SPA.
   - Tùy biến `AccessDeniedHandler` trả về JSON `403 Forbidden`.
2. **Cấu hình CORS & CSRF:**
   - CORS: Bắt buộc cấu hình `allowCredentials(true)` và whitelist rõ ràng origins của Frontend (`http://localhost:5173`, `http://localhost:3000`...). Không dùng wildcard `*`.
   - CSRF: Bật CSRF với `CookieCsrfTokenRepository.withHttpOnlyFalse()`.
   - Cấu hình `ignoringRequestMatchers("/auth/login", "/auth/logout", "/auth/setup-admin")` để các request khởi tạo không bị chặn do chưa thiết lập CSRF token cookie.
3. **Quản lý Session:**
   - `sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)`.
   - Cấu hình Cookie Session trong `application.properties`: `HttpOnly=true`, `Secure=false` (dev)/`true` (prod), `SameSite=Lax`, `timeout=30m`.
4. **Endpoint Authorization:**
   - `.requestMatchers("/auth/**", "/error").permitAll()`.
   - `.anyRequest().authenticated()`.

### Bước 4: Quản lý Người dùng & Cơ chế Bootstrap First-Run Admin

#### 4.1. Tầng DTOs:
- `CreateUserRequest`:
  - `username` (`@NotBlank`, `@Size(min = 3, max = 50)`)
  - `password` (`@NotBlank`, `@Size(min = 6, max = 100)`)
  - `fullName` (`@NotBlank`)
  - `email` (`@Email`)
  - `roleCodes` (`Set<String>`, ví dụ `["ROLE_STAFF"]` hoặc `["ROLE_MANAGER"]`)
- `UserResponse`: Trả về thông tin user mới tạo kèm danh sách roles gán cho user.

#### 4.2. Tầng Service (`UserService`):
- `createUser(CreateUserRequest request)`:
  1. Kiểm tra `username` đã tồn tại chưa -> ném ngoại lệ nếu trùng.
  2. Mã hóa mật khẩu bằng `PasswordEncoder.encode(request.getPassword())`.
  3. Insert vào bảng `users`.
  4. Duyệt danh sách `roleCodes` truyền vào, tìm `role_id` và insert vào bảng `user_roles`.
- `setupInitialAdmin(CreateUserRequest request)`:
  1. Đếm tổng số user trong bảng `users` (`countUsers()`).
  2. **Nếu `countUsers() > 0`:** Ném `IllegalStateException("Hệ thống đã có tài khoản quản trị. Vui lòng đăng nhập bằng tài khoản quản trị để tạo người dùng mới.")`.
  3. **Nếu `countUsers() == 0`:** Gán mặc định role cao nhất (`ROLE_MANAGER` hoặc `ROLE_ADMIN`) và tiến hành tạo tài khoản Admin đầu tiên.

#### 4.3. Tầng Controller:
1. **Endpoint Bootstrap Admin Lần Đầu (`POST /auth/setup-admin`):**
   - Public (nằm trong `/auth/**`), không cần đăng nhập session trước.
   - Chỉ hoạt động khi CSDL chưa có user nào. Khi đã có user, tự động khóa và trả về lỗi `403 Forbidden` / `400 Bad Request`.
2. **Endpoint Tạo Người Dùng Định Kỳ (`POST /v0/api/users`):**
   - Yêu cầu xác thực phiên đăng nhập.
   - Gắn phân quyền bảo vệ: `@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN') or hasAuthority('USER_CREATE')")`.
   - Cho phép chỉ định tùy ý `roleCodes` cho tài khoản mới.

### Bước 5: Base UI Guards (Frontend)
1. Cấu hình Axios instance: `withCredentials: true`, `xsrfCookieName: 'XSRF-TOKEN'`, `xsrfHeaderName: 'X-XSRF-TOKEN'`.
2. `AuthContext.tsx`: Gọi `GET /auth/me` khi khởi động ứng dụng để đồng bộ phiên đăng nhập, cung cấp các helper `hasPermission()` và `hasRole()`.
3. Base components: `<ProtectedRoute requiredPermission="...">` và `<Can do="...">`.

---

# 4. Quy chuẩn Đầu ra Trọn bộ
1. Migration SQL cho bảng RBAC (`V2__create_rbac_tables.sql` hoặc `V1`).
2. Entities: `User.java`, `Role.java`, `Permission.java`.
3. Mapper/Repository: `UserMapper.java` + `UserMapper.xml` (có hàm `insertUser`, `insertUserRole`, `countUsers`, `findRoleByCode`).
4. Services: `UserService.java`.
5. Security: `CustomUserDetails.java`, `CustomUserDetailsService.java`, `SecurityConfig.java`.
6. Controllers:
   - `AuthController.java`: `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/csrf`, `/auth/setup-admin` (first-run bootstrap).
   - `UserController.java`: `POST /v0/api/users` (`@PreAuthorize("hasAuthority('USER_CREATE')")`), `GET /v0/api/users`.
7. DTOs: `LoginRequest.java`, `CreateUserRequest.java`, `UserResponse.java`, `CsrfResponse.java`, `ErrorResponse.java`.
8. Frontend: `src/lib/axios.ts`, `AuthContext.tsx`, `ProtectedRoute.tsx`, `Can.tsx`, `LoginPage.tsx`.

---

# 5. Checklist Tự kiểm tra (Quality Assurance)
- [ ] Endpoint `/auth/setup-admin` chỉ cho phép tạo Admin khi `countUsers() == 0`, tự động chặn khi đã có tài khoản.
- [ ] Endpoint `POST /v0/api/users` được bảo vệ nghiêm ngặt bằng `@PreAuthorize("hasRole('MANAGER') or hasAuthority('USER_CREATE')")`.
- [ ] Mật khẩu người dùng luôn được mã hóa qua `PasswordEncoder.encode()` trước khi lưu CSDL.
- [ ] Hỗ trợ gán tùy ý danh sách Roles (`roleCodes`) cho người dùng mới tạo.
- [ ] `SecurityConfig` đã mở `.requestMatchers("/auth/**").permitAll()`.
- [ ] `AuthenticationEntryPoint` trả về JSON `401 Unauthorized`, không redirect 302 sang `/login`.
- [ ] CORS đã cấu hình `allowCredentials(true)` và whitelist frontend origins.
- [ ] `ignoringRequestMatchers("/auth/login", "/auth/setup-admin")` đã được cấu hình trong CSRF.
- [ ] `CustomUserDetails` chứa đầy đủ metadata (`id`, `fullName`, `email`, `roles`, `permissions`).
- [ ] `CustomUserDetailsService` nạp động đầy đủ roles & permissions từ DB qua `UserMapper`, không hardcode role.
