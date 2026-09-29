# 🤖 AGENT GUIDELINES & PROJECT CONTEXT: STAYCONNECT
> **Dự án**: Hệ Thống Quản Lý Nhà Trọ Hỗ Trợ Ghép Người Ở Chung (StayConnect)  
> **Phạm vi**: Đồ Án Tốt Nghiệp Đại Học / Cao Đẳng  
> **Mục tiêu tài liệu**: Cung cấp toàn bộ ngữ cảnh hệ thống, kiến trúc, quy chuẩn code và các nguyên tắc cốt lõi để AI Coding Agents hỗ trợ phát triển chính xác, đồng bộ và tuân thủ tuyệt đối các chuẩn mực kỹ thuật của dự án.

---

## 📌 1. TỔNG QUAN DỰ ÁN & BÀI TOÁN NGHIỆP VỤ

StayConnect giải quyết 2 bài toán lớn trong cùng một nền tảng thống nhất:
1. **Quản lý vận hành nhà trọ toàn diện (Dành cho Chủ trọ - Landlord)**: Quản lý tòa nhà, phòng trọ, tiện ích dịch vụ, khách thuê, hợp đồng thuê phòng, chốt chỉ số điện/nước hàng tháng, tạo hóa đơn tự động kèm mã VietQR, thanh lý hợp đồng và tiếp nhận xử lý khiếu nại báo hỏng thiết bị.
2. **Tìm kiếm & Ghép phòng trọ thông minh bằng AI Vector (Dành cho Người thuê - Tenant)**: Tìm kiếm phòng theo bản đồ/khu vực/giá, đăng bài tìm bạn ở ghép, nộp đơn ứng tuyển ghép phòng, và đối chiếu mức độ hòa hợp giữa các cá nhân thông qua **Thuật toán Khảo sát Lối sống 8 chiều (Lifestyle Vector Matching)**.

### Các Đối Tượng Người Dùng (Actors)
- **`Guest` (Khách vãng lai)**: Tìm kiếm bài đăng, xem thông tin phòng/bán kính bản đồ, đăng ký tài khoản.
- **`User` (Người dùng cơ bản)**: Đăng nhập, đăng xuất, đổi mật khẩu, quản lý hồ sơ cá nhân và khảo sát lối sống gốc.
- **`Tenant` (Người thuê trọ - Kế thừa User)**: Tìm kiếm ở ghép, đăng tin tìm bạn ghép phòng, ứng tuyển vào phòng, liên kết phòng với chủ trọ, xem hợp đồng/hóa đơn, quét VietQR thanh toán, gửi khiếu nại báo hỏng.
- **`Landlord` (Chủ trọ - Kế thừa User)**: Quản lý tòa nhà, phòng, dịch vụ, hợp đồng, lập hóa đơn, xử lý sự cố, theo dõi doanh thu và công nợ.
- **`Admin` (Quản trị viên hệ thống)**: Quản lý tài khoản toàn sàn, quản lý Master Data (danh mục tiện ích & bộ câu hỏi tiêu chí lối sống), kiểm duyệt vi phạm và xem thống kê tổng thể.

---

## 🛠️ 2. TECH STACK & KIẾN TRÚC HỆ THỐNG

### Backend (Spring Boot 3)
- **Framework**: Spring Boot 3.4.3, Java 21 LTS.
- **Bảo mật & Xác thực**: Spring Security 6 + JJWT (0.12.6).
  - Kiến trúc JWT stateless claims-based: Định danh người dùng (`userId`, `username`, `email`, `role`, `fullName`) được giải mã trực tiếp trong token nạp vào `SecurityContextHolder`, không phụ thuộc session hay Redis.
- **Cơ sở dữ liệu**: H2 Database (In-Memory cho dev/demo) & PostgreSQL (Production).
- **Tài liệu API**: Springdoc OpenAPI 2.8.5 (Swagger UI tại `/swagger-ui.html`).
- **Chuẩn hóa phản hồi API**: Toàn bộ endpoint trả về cấu trúc `ResponseData<T>`:
  ```json
  {
    "code": "00",
    "message": "Thao tác thành công",
    "data": { ... },
    "serverTime": "2026-09-29T10:00:00Z"
  }
  ```
- **Xử lý Exception tập trung**: `GlobalExceptionHandler` bắt lỗi `BaseException(ErrorCode)` thống nhất mã lỗi và thông điệp tiếng Việt.

### Frontend (React 19 + TypeScript + Vite)
- **Framework**: React 19 (TypeScript) + Vite 6.
- **CSS & UI Framework**: Tailwind CSS v4 + Ant Design 5/6.
- **Hệ thống Theme Sáng / Tối (Dynamic Theme System)**:
  - Dự án tích hợp `useThemeStore` và `THEME_PRESETS` gồm 6 bảng màu (Figma Classic, Ocean Breeze, Emerald Garden, Sunset Warm, Royal Purple, và **Midnight Dark**).
  - Tích hợp `AntdProvider` chuyển đổi thuật toán `antdTheme.darkAlgorithm` khi bật chế độ tối.
- **State Management & Data Fetching**: Zustand (`useAuthStore`, `useThemeStore`) + TanStack React Query v5.
- **Routing**: React Router DOM v7 (Public Routes & `ProtectedRoute`).
- **Bản đồ**: Leaflet / React-Leaflet + Tile Server tích hợp.

---

## 📐 3. BẢNG MÃ CƠ SỞ DỮ LIỆU & QUAN HỆ CỐT LÕI

Hệ thống gồm 18 bảng chuẩn hóa trong [schema.sql](file:///e:/%C4%90%E1%BB%93%20%C3%A1n%20t%E1%BB%91t%20nghi%E1%BB%87p/backend/src/main/resources/schema.sql):

1. **`users`**: Tài khoản hệ thống, trường `lifestyle_vector VARCHAR(255)`, `role`, `status`.
2. **`buildings`**: Tòa nhà / Dãy trọ thuộc sở hữu của chủ trọ (`landlord_id`).
3. **`rooms`**: Phòng trọ thuộc tòa nhà, giá thuê, diện tích, trạng thái (`AVAILABLE`, `RENTED`, `MAINTENANCE`).
4. **`room_images`**: Hình ảnh phòng trọ thực tế.
5. **`services`**: Dịch vụ tiện ích (Điện, nước, internet, rác...) do chủ trọ cấu hình đơn giá và cách tính.
6. **`room_services`**: Dịch vụ áp dụng riêng cho từng phòng.
7. **`tenants`**: Khách thuê đang ở phòng (`is_representative`, `user_id` liên kết).
8. **`contracts`**: Hợp đồng thuê phòng (`ACTIVE`, `EXPIRING_SOON`, `TERMINATED`), tiền cọc, ngày bắt đầu/kết thúc.
9. **`contract_services`**: Danh sách dịch vụ chốt trong hợp đồng.
10. **`invoices`**: Hóa đơn tiền trọ tháng (`DRAFT`, `PENDING_PAYMENT`, `PAID`, `OVERDUE`).
11. **`invoice_items`**: Chi tiết tiền phòng, điện nước (chỉ số cũ/mới), dịch vụ cố định trong hóa đơn.
12. **`complaints`**: Khiếu nại báo hỏng thiết bị (`PENDING`, `PROCESSING`, `RESOLVED`, `REJECTED`).
13. **`lifestyle_questions`**: Danh mục câu hỏi khảo sát lối sống do Admin tạo (`q_type`: `SINGLE` hoặc `MULTI`, trọng số `weight`, `is_hard`).
14. **`lifestyle_options`**: Các lựa chọn đáp án tương ứng với từng câu hỏi, kèm giá trị số học chuẩn hóa `value` $[0.000, 1.000]$.
15. **`user_lifestyle_answers`**: Câu trả lời khảo sát lối sống gốc của người dùng (Khóa chính: `user_id, question_id, option_id`).
16. **`roommate_posts`**: Bài đăng tìm người ở ghép (`HAS_ROOM` hoặc `SEARCHING_ROOM`), kèm `lifestyle_vector`.
17. **`roommate_post_lifestyle_answers`**: Khảo sát lối sống riêng cho bài đăng (tách biệt khỏi hồ sơ gốc).
18. **`roommate_applications`**: Đơn xin gia nhập nhóm ở ghép, điểm tương thích `compatibility_score`, cờ `is_customized`.
19. **`roommate_application_lifestyle_answers`**: Câu trả lời khảo sát tinh chỉnh riêng của ứng viên khi gửi đơn.

---

## 🧠 4. THUẬT TOÁN VECTOR LỐI SỐNG AI & MATCHING MATCHPERCENTAGE

### A. Cấu trúc Vector Lối Sống
- Vector được biểu diễn dưới dạng chuỗi số phân tách bằng dấu phẩy, ví dụ:
  `"0.000,0.500,0.000,0.000,1.000,1.000,0.500,0.500"`
- Mỗi phần tử đại diện cho 1 tiêu chí sinh hoạt chuẩn hóa từ $0.000$ đến $1.000$:
  1. `GENDER`: Giới tính ($0.0$ Nam, $1.0$ Nữ, $0.5$ Linh hoạt).
  2. `SLEEP_TIME`: Giờ ngủ ($0.0$ Trước 23h, $0.5$ 23h-24h, $1.0$ Sau 24h).
  3. `SMOKING`: Hút thuốc ($0.0$ Không thuốc, $0.5$ Thỉnh thoảng, $1.0$ Thường xuyên) - *Tiêu chí cứng*.
  4. `PET`: Nuôi thú cưng ($0.0$ Không, $0.5$ Yêu thích, $1.0$ Đang nuôi).
  5. `COOKING`: Tần suất nấu ăn ($0.0$ Hiếm khi, $0.5$ Thỉnh thoảng, $1.0$ Hàng ngày).
  6. `CLEANLINESS`: Ngăn nắp sạch sẽ ($0.0$ Thoải mái, $0.5$ Định kỳ, $1.0$ Rất sạch).
  7. `GUEST`: Dẫn bạn về phòng ($0.0$ Không, $0.5$ Cuối tuần/Báo trước, $1.0$ Thoải mái).
  8. `PERSONALITY`: Tính cách ($0.0$ Hướng nội, $0.5$ Cân bằng, $1.0$ Hướng ngoại).

### B. Quy tắc Tính Toán
- **Câu hỏi `SINGLE`**: Lấy trực tiếp `option.value`.
- **Câu hỏi `MULTI`**: Nếu người dùng chọn $N$ đáp án, giá trị đại diện là trung bình cộng:
  $$\text{Value} = \frac{\sum \text{option.value}}{N}$$
- **Độ tương thích (Compatibility Score $0\% - 100\%$)**:
  $$\text{Score} = \left( 1 - \frac{\sum (|A_i - B_i| \times \text{weight}_i)}{\sum \text{weight}_i} \right) \times 100$$
- **Ràng buộc tiêu chí cứng (`isHard`)**: Nếu vi phạm tiêu chí cứng (ví dụ: người hút thuốc ghép với người không khói thuốc có chênh lệch $\ge 0.8$), điểm tương thích bị chặn trần tối đa $50\%$.

### C. Luồng Nghiệp Vụ Clone & Tinh Chỉnh (Customization)
- Hồ sơ gốc tại `/profile` lưu câu trả lời vào `user_lifestyle_answers`.
- Khi người dùng đăng tin hoặc nộp đơn ứng tuyển:
  - Hệ thống tự động **sao chép (clone)** toàn bộ câu trả lời từ hồ sơ gốc.
  - Người dùng có quyền **tinh chỉnh (customize)** đáp án cho từng bài đăng/đơn ứng tuyển mà **không ảnh hưởng** đến hồ sơ gốc.
  - Cờ `is_customized` đánh dấu đơn đăng ký đã được điều chỉnh phù hợp với chủ phòng.

---

## 🚨 5. QUY TẮC PHÁT TRIỂN BẮT BUỘC DÀNH CHO AGENT

### 1. Thích Ứng Giao Diện Sáng / Tối & Bảng Màu Động (CRITICAL STRICT RULE)
> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG DÙNG TAILWIND MÀU LINH TINH & KHÔNG FIX CỨNG MÃ MÀU!**  
> Việc dùng các class tĩnh như `bg-white`, `bg-slate-50`, `text-slate-800`, `border-slate-200`, `bg-blue-600`, `bg-indigo-50`... sẽ làm hỏng hoàn toàn khả năng chuyển đổi giữa **6 Theme Bảng Màu** và **Chế Độ Tối (Midnight Dark)**!

#### 🚫 Bảng Class Cấm Tuyệt Đối (Forbidden Classes)
- **CẤM fix cứng nền**: `bg-white`, `bg-slate-50`, `bg-gray-50`, `bg-gray-100` ➡️ Phá vỡ Dark mode làm card bị trắng toát.
- **CẤM fix cứng chữ**: `text-slate-800`, `text-slate-900`, `text-gray-900`, `text-black` ➡️ Chữ bị tàng hình/chìm trên nền tối.
- **CẤM fix cứng viền**: `border-slate-200`, `border-gray-200` ➡️ Đường viền phát sáng chói lóa trên nền tối.
- **CẤM fix cứng màu Brand**: `bg-blue-600`, `bg-indigo-600`, `text-blue-600`, `bg-indigo-50` ➡️ Phá vỡ tính năng đổi combo màu khi chọn Sunset Warm (Cam), Royal Purple (Tím), Ocean Breeze (Xanh ngọc).

#### ✅ Bảng Quy Đổi Sang Semantic Tokens Bắt Buộc (Mandatory Semantic Mapping)
- **Nền toàn trang web**: Dùng **`bg-stay-bg`** (hoặc `bg-stay-bg-app`).
- **Nền Card / Modal / Container / Dropdown**: Dùng **`bg-stay-card-bg`**.
- **Nền phụ thẻ con bên trong Card**: Dùng **`bg-stay-bg-app`** (kết hợp `dark:bg-slate-800/60`).
- **Màu chữ chính / Họ tên / Tiêu đề**: Dùng **`text-stay-text`**.
- **Màu chữ phụ / Mô tả / Subtitle**: Dùng **`text-stay-text-secondary`**.
- **Mã định danh / Placeholder / Chú thích nhỏ**: Dùng **`text-stay-text-muted`**.
- **Đường viền chính (Card, Input, Table)**: Dùng **`border-stay-border`** (kết hợp `dark:border-slate-700`).
- **Đường kẻ phân cách / Viền nhẹ**: Dùng **`border-stay-border-subtle`**.
- **Nút bấm chính / Điểm nhấn Active (CTA)**: Dùng **`bg-stay-primary hover:bg-stay-primary-hover text-white`**.
- **Nền dịu của Brand (Tag, Pill khi chọn)**: Dùng **`bg-stay-primary-subtle text-stay-primary border border-stay-primary/20`**.
- **Chữ điểm nhấn / Icon nổi bật**: Dùng **`text-stay-primary`**.
- **Trạng thái Xác thực & Ghép đôi**: Dùng **`bg-stay-match`**, **`bg-stay-secondary`**, **`bg-stay-match-subtle`**.

*Chi tiết quy chuẩn và ví dụ code mẫu xem tại: [frontend-theme-rules.md](file:///.agents/rules/frontend-theme-rules.md).*

### 2. Chuẩn Hóa Cấu Trúc Backend
- **Endpoint naming**: Tuân thủ chuẩn RESTful `/api/v1/{module}/{resource}`.
  - Public URLs phải khai báo trong `SecurityConstants.PUBLIC_URLS`.
  - Endpoint yêu cầu đăng nhập phải có `@PreAuthorize("isAuthenticated()")` hoặc kiểm tra Role.
- **DTOs**: Luôn tách biệt Request DTO và Response DTO, sử dụng Lombok `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`.
- **Database migration**: Mọi thay đổi bảng hoặc cột phải được cập nhật đồng bộ trong cả 2 file:
  - [schema.sql](file:///e:/%C4%90%E1%BB%93%20%C3%A1n%20t%E1%BB%91t%20nghi%E1%BB%87p/backend/src/main/resources/schema.sql) (Định nghĩa cấu trúc DDL).
  - [data.sql](file:///e:/%C4%90%E1%BB%93%20%C3%A1n%20t%E1%BB%91t%20nghi%E1%BB%87p/backend/src/main/resources/data.sql) (Dữ liệu mẫu seed data ban đầu).

### 3. Chuẩn Hóa Frontend
- **Quản lý State**:
  - Dữ liệu người dùng & token: Lưu trong `useAuthStore` (LocalStorage sync).
  - Bảng màu: Lưu trong `useThemeStore`.
  - Dữ liệu server: Sử dụng React Query (`useQuery`, `useMutation`), tái sử dụng queryKeys có sẵn.
- **Xử lý biểu mẫu & câu hỏi**:
  - Đối với câu hỏi lối sống, luôn hỗ trợ cả 2 dạng `qType === 'SINGLE'` (chọn 1, radio) và `qType === 'MULTI'` (chọn nhiều, checkbox).

---

## ⚡ 6. LỆNH KIỂM TRA & XÁC MINH NHANH

Trước khi bàn giao bất kỳ tính năng hoặc sửa lỗi nào, Agent **BẮT BUỘC** phải chạy kiểm tra biên dịch cả 2 phía:

```powershell
# 1. Kiểm tra Backend (phải báo BUILD SUCCESS 0 lỗi)
cd "e:\Đồ án tốt nghiệp\backend"
mvn test-compile

# 2. Kiểm tra Frontend (phải hoàn thành build không lỗi TypeScript)
cd "e:\Đồ án tốt nghiệp\frontend"
npm run build
```

---
*Tài liệu này được tạo tự động để định hướng và duy trì tính nhất quán cho toàn bộ quá trình phát triển dự án StayConnect.*
