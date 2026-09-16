# HỆ THỐNG ĐỒ ÁN TỐT NGHIỆP (MONO-SERVICE CORE)

Hệ thống mẫu (Base Project) hoàn chỉnh phục vụ cho Đồ án tốt nghiệp đại học / cao đẳng, được kế thừa và tinh gọn từ chuẩn kiến trúc thực tế của Viettel (`auth-service` và `merchant-cms`).

---

## 📌 Công Nghệ Sử Dụng

### 1. Backend
- **Framework**: Spring Boot 3.4.3
- **Ngôn ngữ**: Java 21 LTS
- **Bảo mật**: Spring Security 6 + JJWT 0.12.6
  - **Cơ chế JWT**: Toàn bộ thông tin định danh (`userId`, `username`, `email`, `role`, `fullName`) được mã hóa trực tiếp trong **Payload/Claims**. Bộ lọc `JwtAuthenticationFilter` giải mã trực tiếp từ token để nạp `UserPrincipal` vào `SecurityContextHolder` mà **không cần Redis hay Kafka**.
- **Cơ sở dữ liệu**: H2 Database (In-Memory sẵn sàng chạy ngay) & hỗ trợ chuyển đổi PostgreSQL chỉ với 1 cấu hình trong `application.yml`.
- **Tài liệu API**: Springdoc OpenAPI 2.8.5 (Swagger UI tương tác trực quan).
- **Chuẩn hóa API**: Cấu trúc phản hồi `ResponseData<T>` thống nhất (`code`, `message`, `data`, `serverTime`, `service`).

### 2. Frontend
- **Framework**: React 19 (TypeScript) + Vite
- **CSS / Styling**: Tailwind CSS v4 (Giao diện hiện đại, responsive, hỗ trợ bảng biểu và thẻ chỉ số thống kê)
- **State Management**: Zustand (`useAuthStore`)
- **Routing**: React Router DOM v7 (Public Routes & Protected Routes)
- **HTTP Client**: Axios Client với Request & Response Interceptors (tự động đính kèm `Authorization: Bearer <token>` và tự động bắt lỗi `401 Unauthorized`).
- **Icons**: Lucide React

---

## 🗂️ Cấu Trúc Thư Mục Dự Án

```
E:\Đồ án tốt nghiệp\
├── backend/                               # Mã nguồn Backend (Spring Boot 3)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/doan/core/
│       │   ├── CoreApplication.java       # Main entry point
│       │   ├── common/                    # Các thành phần cốt lõi (tương tự aitcorp.net.base)
│       │   │   ├── config/                # Spring Security 6, CORS, Swagger OpenAPI
│       │   │   ├── constant/              # Hằng số token, header, public urls
│       │   │   ├── data/                  # ResponseData<T>, PageResponse<T>, PagingRequest
│       │   │   ├── exception/             # ErrorCode, BaseException, GlobalExceptionHandler
│       │   │   └── security/              # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal
│       │   └── business/                  # Nghiệp vụ dự án (tương tự aitcorp.net.business)
│       │       ├── controller/            # AuthController, UserController, HomeController
│       │       ├── dto/                   # LoginRequest, RegisterRequest, AuthResponse, UserDto
│       │       ├── entity/                # BaseEntity, User, Role
│       │       ├── repository/            # UserRepository
│       │       └── service/               # AuthService, UserService và các lớp Impl
│       └── resources/
│           └── application.yml            # Cấu hình cổng 8080, datasource, jwt secret
│
├── frontend/                              # Mã nguồn Frontend (React 19 + Vite)
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── configs/                       # env.ts (API endpoint, storage keys)
│       ├── features/                      # Các màn hình chức năng (tương tự merchant-cms)
│       │   ├── home/pages/HomePage.tsx    # Trang chủ đồ án (Banner, Stats, Shortcuts)
│       │   ├── auth/pages/LoginPage.tsx   # Đăng nhập (có nút điền nhanh tài khoản test)
│       │   ├── auth/pages/RegisterPage.tsx# Đăng ký tài khoản
│       │   └── user/pages/UserListPage.tsx# Quản lý người dùng (Protected Table)
│       ├── routes/                        # AppRoutes.tsx, ProtectedRoute.tsx
│       ├── shared/                        # Thành phần dùng chung
│       │   ├── components/                # Header, Sidebar, Footer, LoadingSpinner
│       │   ├── layouts/                   # MainLayout.tsx, AuthLayout.tsx
│       │   ├── services/                  # api.ts (Axios Interceptors), authService.ts
│       │   ├── types/                     # api.ts, auth.ts
│       │   └── utils/                     # token.ts (LocalStorage helpers)
│       ├── stores/                        # useAuthStore.ts (Zustand)
│       ├── styles/                        # index.css (Tailwind CSS)
│       ├── App.tsx
│       └── main.tsx
```

---

## 🚀 Hướng Dẫn Chạy Ứng Dụng

### Bước 1: Khởi động Backend (Spring Boot)
Mở một cửa sổ Terminal (PowerShell hoặc CMD):
```powershell
cd "E:\Đồ án tốt nghiệp\backend"
mvn spring-boot:run
```
- Máy chủ sẽ khởi động tại: `http://localhost:8080`
- Xem tài liệu Swagger API: `http://localhost:8080/swagger-ui.html`
- Xem cơ sở dữ liệu H2 Console: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:graduation_db`
  - Username: `sa` (Password để trống)

### Bước 2: Khởi động Frontend (ReactJS)
Mở cửa sổ Terminal thứ hai:
```powershell
cd "E:\Đồ án tốt nghiệp\frontend"
npm run dev
```
- Truy cập giao diện tại: `http://localhost:3000`

---

## 🔑 Tài Khoản Mặc Định Sẵn Có

Hệ thống đã cấu hình `DataInitializer` tự động khởi tạo 2 tài khoản mẫu khi ứng dụng khởi chạy lần đầu:

| Tên Đăng Nhập | Mật Khẩu | Họ và Tên | Vai Trò |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | Quản Trị Viên Hệ Thống | `ROLE_ADMIN` |
| **`student`** | `123456` | Nguyễn Văn Sinh Viên | `ROLE_STUDENT` |

*(Tại màn hình Đăng nhập đã có sẵn nút bấm điền nhanh tài khoản giúp thuận tiện demo khi báo cáo đồ án).*
