---
name: auth-rbac-architect-initial-jwt
description: "Dựng hạ tầng phân quyền RBAC + xác thực JWT (stateless) từ đầu cho một project mới: Database Schema, CustomUserDetails/CustomUserDetailsService, JWT Token Provider/Filter, Spring Security Config, Auth Controller (login/refresh/logout/setup-admin), User Management Service (thêm người dùng tùy ý role, cơ chế bootstrap Admin lần đầu và phân quyền cho lần tạo tiếp theo), và base UI Guards cho Frontend. Dùng skill này khi bắt đầu một project mới cần đăng nhập bằng JWT/Bearer Token, hoặc khi người dùng nói 'setup auth', 'khởi tạo phân quyền', 'JWT login', 'stateless authentication', 'thêm user bootstrap admin'."
---

# 1. Vai trò & Mục tiêu
Bạn là **Security Architect**. Nhiệm vụ: dựng toàn bộ hạ tầng RBAC + xác thực JWT (stateless) cho một project **chưa có** cơ chế đăng nhập/phân quyền nào. Đây là bước nền tảng — bao gồm cơ chế Bootstrap Admin lần đầu và quản lý người dùng với phân quyền chặt chẽ.

**Nguyên tắc cốt lõi: Deny by default.** Mặc định mọi resource bị từ chối truy cập trừ khi có rule cấp quyền rõ ràng. Không tự ý nới `permitAll()` để "cho dễ chạy thử".

**Kiểm tra trước khi bắt đầu:** Quét project xem đã tồn tại `SecurityConfig`, bảng `users`/`roles`, hoặc thư viện JWT nào chưa. Nếu đã có, dừng lại và hỏi người dùng có muốn ghi đè hay chuyển sang skill `auth-rbac-architect-develop-jwt` để mở rộng thay vì dựng lại.

---

# 2. Điều kiện đầu vào
- Danh sách vai trò khởi tạo (mặc định nếu không có: `ROLE_ADMIN`/`ROLE_MANAGER`, `ROLE_STAFF`/`ROLE_USER`).
- Danh sách quyền hạn ban đầu (gồm các quyền cơ bản như `USER_CREATE`, `USER_READ`, `USER_UPDATE`, `USER_DELETE` và các quyền nghiệp vụ).
- Framework backend (mặc định giả định Spring Boot; nếu khác, hỏi lại trước khi sinh code).

---

# 3. Quy trình thực hiện

### Bước 1: Schema CSDL
Tạo migration Flyway với các bảng:
- `users` (id, username, password_hash BCrypt, full_name, email, status, ...)
- `roles`, `permissions`, `user_roles`, `role_permissions`
- `refresh_tokens` (id, user_id, token_hash, expires_at, revoked_at) — bắt buộc cho JWT có refresh flow.
- Seed dữ liệu ban đầu: Danh mục Roles (`ROLE_MANAGER`, `ROLE_STAFF`), Danh mục Permissions (`USER_CREATE`, `USER_READ`, ...), và liên kết `role_permissions`.

### Bước 2: Tầng Người dùng & Quyền hạn (UserDetails & UserDetailsService)
1. `CustomUserDetails`:
   - Triển khai `UserDetails`, chứa đầy đủ metadata người dùng: `id`, `username`, `password` (hash), `fullName`, `email`, `status`, `roles` (Set<String>), `permissions` (Set<String>).
   - Nạp đồng thời cả **Role Codes** (ví dụ `ROLE_MANAGER`) và **Permission Codes** (ví dụ `USER_CREATE`, `PRODUCTION_PLAN_READ`) vào `Collection<? extends GrantedAuthority>` dưới dạng `SimpleGrantedAuthority`.
   - Kiểm tra `isAccountNonLocked()` và `isEnabled()` dựa trên trường `status`.
2. `CustomUserDetailsService`:
   - Triển khai `UserDetailsService`, tiêm `UserMapper` hoặc `UserRepository` để tìm kiếm người dùng theo `username` kèm toàn bộ roles và permissions.
   - Ném ngoại lệ `UsernameNotFoundException` nếu người dùng không tồn tại.
   - Trả về đối tượng `CustomUserDetails(user)` hoàn chỉnh — **tuyệt đối không hardcode role** hoặc dùng class `org.springframework.security.core.userdetails.User` mặc định làm mất metadata.

### Bước 3: Hạ tầng JWT & Security Config
1. `JwtTokenProvider`: sinh Access Token (thời hạn ngắn, mặc định 15 phút nếu không được chỉ định) và Refresh Token (thời hạn dài hơn, mặc định 7 ngày).
2. `JwtAuthenticationFilter`: đọc header `Authorization: Bearer <token>`, validate, nạp `Authentication` vào `SecurityContextHolder`.
3. `SecurityFilterChain`:
   - `sessionCreationPolicy(SessionCreationPolicy.STATELESS)`.
   - Tắt FormLogin và HttpBasic: `http.formLogin(form -> form.disable())`, `http.httpBasic(basic -> basic.disable())`.
   - Cấu hình `AuthenticationEntryPoint` trả về JSON `401 Unauthorized` (DTO `ErrorResponse`), không redirect sang HTML login.
   - Cấu hình `AccessDeniedHandler` trả về JSON `403 Forbidden`.
   - CSRF có thể tắt (`csrf.disable()`) vì kiến trúc JWT Stateless không dùng session/cookie.
   - CORS: Bật `allowCredentials(true)` và whitelist Frontend origins.
   - Endpoint: `/auth/login`, `/auth/refresh`, `/auth/setup-admin` → `permitAll()`; còn lại `authenticated()` theo rule role/permission cụ thể.
4. `AuthController`: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/setup-admin`.

### Bước 4: Quản lý Người dùng & Cơ chế Bootstrap First-Run Admin

#### 4.1. Tầng DTOs:
- `CreateUserRequest`: `username`, `password`, `fullName`, `email`, `roleCodes` (Set<String>).
- `UserResponse`: Thông tin người dùng kèm danh sách roles.

#### 4.2. Tầng Service (`UserService`):
- `createUser(CreateUserRequest request)`: Kiểm tra trùng lặp, mã hóa BCrypt, lưu User và danh sách Roles.
- `setupInitialAdmin(CreateUserRequest request)`:
  - Nếu `countUsers() > 0`: ném lỗi chặn khởi tạo lại.
  - Nếu `countUsers() == 0`: tạo tài khoản Admin đầu tiên với `ROLE_ADMIN` / `ROLE_MANAGER`.

#### 4.3. Tầng Controller:
- `POST /auth/setup-admin`: Bootstrap không cần token khi chưa có user nào trong hệ thống.
- `POST /v0/api/users`: Tạo user mới phân quyền tùy ý role, bảo vệ bởi `@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasAuthority('USER_CREATE')")`.

### Bước 5: Base UI Guards (Frontend)
1. Axios interceptor tự động gắn token và refresh token.
2. Base components `<ProtectedRoute requiredPermission="...">` và `<Can do="...">`.

---

# 4. Quy chuẩn Đầu ra Trọn bộ
1. Migration SQL (`V1__create_rbac_tables.sql`, `V2__create_refresh_tokens.sql`).
2. Entities: `User.java`, `Role.java`, `Permission.java`.
3. Security: `CustomUserDetails.java`, `CustomUserDetailsService.java`, `JwtTokenProvider.java`, `JwtAuthenticationFilter.java`, `SecurityConfig.java`.
4. Services: `UserService.java`.
5. Controllers: `AuthController.java` (kèm `/auth/setup-admin`), `UserController.java` (kèm `POST /v0/api/users`).
6. DTOs: `LoginRequest.java`, `CreateUserRequest.java`, `TokenResponse.java`, `RefreshTokenRequest.java`, `UserResponse.java`, `ErrorResponse.java`.
7. Frontend: `src/lib/axios.ts`, `AuthContext.tsx`, `ProtectedRoute.tsx`, `Can.tsx`, `LoginPage.tsx`.

---

# 5. Checklist Tự kiểm tra
- [ ] Endpoint `/auth/setup-admin` chỉ cho phép tạo Admin khi `countUsers() == 0`, tự động chặn khi đã có tài khoản.
- [ ] Endpoint `POST /v0/api/users` được bảo vệ bằng `@PreAuthorize("hasRole('ADMIN') or hasAuthority('USER_CREATE')")`.
- [ ] Mật khẩu luôn được mã hóa qua `PasswordEncoder.encode()`.
- [ ] Hỗ trợ gán tùy ý danh sách Roles (`roleCodes`).
- [ ] `CustomUserDetails` chứa đầy đủ metadata (`id`, `fullName`, `email`, `roles`, `permissions`).
- [ ] `CustomUserDetailsService` nạp động đầy đủ roles & permissions từ DB, không hardcode role.
- [ ] `AuthenticationEntryPoint` trả về JSON `401 Unauthorized`, không redirect sang form HTML.
