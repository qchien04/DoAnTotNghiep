# 🤖 AGENT GUIDELINES & PROJECT CONTEXT: STAYCONNECT
> **Dự án**: Hệ Thống Quản Lý Nhà Trọ Hỗ Trợ Ghép Người Ở Chung (StayConnect)  
> **Phạm vi**: Đồ Án Tốt Nghiệp Đại Học / Cao Đẳng  
> **Mục tiêu tài liệu**: Cung cấp toàn bộ ngữ cảnh hệ thống, kiến trúc, quy chuẩn code và các nguyên tắc cốt lõi để AI Coding Agents hỗ trợ phát triển chính xác, đồng bộ và tuân thủ tuyệt đối các chuẩn mực kỹ thuật của dự án.

---

## 📌 1. TỔNG QUAN DỰ ÁN & BÀI TOÁN NGHIỆP VỤ

StayConnect giải quyết 2 bài toán lớn trong cùng một nền tảng thống nhất:
1. **Quản lý vận hành nhà trọ toàn diện (Dành cho Chủ trọ - Landlord)**: Quản lý tòa nhà, phòng trọ, tiện ích dịch vụ, khách thuê, hợp đồng thuê phòng, chốt chỉ số điện/nước hàng tháng, tạo hóa đơn tự động kèm mã VietQR, thanh lý hợp đồng và tiếp nhận xử lý khiếu nại báo hỏng thiết bị.
2. **Tìm kiếm & Ghép phòng trọ thông minh bằng AI Vector (Dành cho Người thuê - Tenant)**: Tìm kiếm phòng theo bản đồ/khu vực/giá, đăng bài tìm bạn ở ghép, nộp đơn ứng tuyển ghép phòng, và đối chiếu mức độ hòa hợp giữa các cá nhân thông qua **Thuật toán Khảo sát Lối sống 15 chiều (15-Dimensional Lifestyle Vector) kết hợp 3 tiêu chí lọc cứng (Dealbreakers)**.

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

Hệ thống gồm 14 bảng chuẩn hóa trong [schema.sql](file:///e:/DoAnTotNgiep/backend/src/main/resources/schema.sql):

1. **`users`**: Tài khoản hệ thống, trường `lifestyle_vector VARCHAR(255)`, `role`, `status`.
2. **`buildings`**: Tòa nhà / Dãy trọ thuộc sở hữu của chủ trọ (`landlord_id`).
3. **`rooms`**: Phòng trọ thuộc tòa nhà, giá thuê, diện tích, trạng thái (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).
4. **`room_images`**: Hình ảnh phòng trọ thực tế.
5. **`services`**: Dịch vụ tiện ích (Điện, nước, internet, rác...) do chủ trọ cấu hình đơn giá và cách tính (`billing_method`: `METER_INDEX`, `FIXED_PER_ROOM`, `FIXED_PER_PERSON`, `FIXED_PER_UNIT`).
6. **`room_services`**: Dịch vụ áp dụng riêng cho từng phòng.
7. **`tenants`**: Khách thuê đang ở phòng (`is_representative`, `user_id` liên kết).
8. **`contracts`**: Hợp đồng thuê phòng (`ACTIVE`, `EXPIRING_SOON`, `TERMINATED`), tiền cọc, ngày bắt đầu/kết thúc.
9. **`contract_services`**: Danh sách dịch vụ chốt trong hợp đồng (kèm `billing_method`, `applied_unit_price`, `last_index`).
10. **`invoices`**: Hóa đơn tiền trọ tháng (`DRAFT`, `PENDING_PAYMENT`, `PAID`, `OVERDUE`).
11. **`invoice_items`**: Chi tiết tiền phòng, điện nước (chỉ số cũ/mới), dịch vụ cố định/theo đầu người trong hóa đơn.
12. **`complaints`**: Khiếu nại báo hỏng thiết bị (`PENDING`, `PROCESSING`, `RESOLVED`, `REJECTED`).
13. **`roommate_posts`**: Bài đăng tìm người ở ghép (`HAS_ROOM` hoặc `SEARCHING_ROOM`), kèm `lifestyle_vector VARCHAR(255)`.
14. **`roommate_applications`**: Đơn xin gia nhập nhóm ở ghép, điểm tương thích `compatibility_score`, kèm `lifestyle_vector VARCHAR(255)`.

*(Lưu ý: Bộ câu hỏi & lựa chọn khảo sát lối sống 15 chiều được chuẩn hóa cố định vĩnh viễn trong code BE tại `LifestyleConstants.java`, hoàn toàn loại bỏ các bảng thừa `lifestyle_questions`, `lifestyle_options`, `user_lifestyle_answers`, `roommate_post_lifestyle_answers`, `roommate_application_lifestyle_answers`. Toàn bộ vector lối sống được chuẩn hóa và lưu trực tiếp trong trường `lifestyle_vector` dưới dạng chuỗi số thực phân tách bằng dấu phẩy).*

---

## 🧠 4. THUẬT TOÁN GHÉP ĐÔI BẠN Ở GHÉP HAI CHIỀU (PAIRWISE COMPATIBILITY MATCHING)

Hệ thống sử dụng mô hình **Hai Chiều Từng Câu (Two-Sided Pairwise Acceptance)** hoàn toàn minh bạch, công bằng và có khả năng giải thích cao (KHÔNG dùng K-Means, KHÔNG dùng PCA):

### A. Giai đoạn 1: Lọc cứng điều kiện tiên quyết (Dealbreakers Zero-Tolerance)
- `GENDER`: Giới tính bản thân & yêu cầu giới tính bạn cùng phòng (`MALE_ONLY`, `FEMALE_ONLY`, `ANY`).
- `SMOKING`: Phân tách rành mạch giữa **Đặc điểm** (`smokes`) và **Mức chấp nhận** (`rejects_smokers`). Chỉ kích hoạt loại trừ khi một bên hút thuốc VÀ bên kia chủ động đặt luật cấm hút thuốc.
- `PET`: Phân tách rành mạch giữa **Đặc điểm** (`has_pet`) và **Mức chấp nhận** (`rejects_pets` / dị ứng lông động vật).
*Quy tắc*: Nếu vi phạm, ứng viên bị loại khỏi danh sách gợi ý hoặc kẹp trần tối đa $50.0\%$, không bao giờ được bù trừ bằng điểm số khác.

### B. Giai đoạn 2: Ma trận chấp nhận hai chiều & Trung bình điều hòa (Harmonic Mean)
- Khảo sát 15 tiêu chí đời sống thực tế:
  1. `clean`: Mức độ sạch sẽ, dọn dẹp
  2. `guests`: Quy định dẫn bạn về phòng
  3. `sleep`: Giờ giấc đi ngủ ban đêm
  4. `chores`: Phân chia việc nhà & cọ rửa toilet
  5. `noise_make`: Thói quen phát tiếng ồn (loa ngoài, game đêm, gọi điện)
  6. `noise_sense`: Độ nhạy cảm với tiếng ồn & giấc ngủ
  7. `wake`: Giờ thức dậy buổi sáng
  8. `work`: Hình thức làm việc & học tập (remote, ca đêm, sinh viên)
  9. `social`: Mức độ giao tiếp xã hội trong phòng
  10. `space`: Ranh giới không gian riêng tư & đồ cá nhân
  11. `weekend`: Thói quen ngày cuối tuần
  12. `money`: Cách chia sẻ chi phí sinh hoạt & điện nước
  13. `cook`: Thói quen nấu ăn tại phòng
  14. `aircon`: Thói quen sử dụng điều hòa & chịu lạnh
  15. `interest`: Sở thích cá nhân & hoạt động giải trí

- **Ma trận chấp nhận bất đối xứng $MATRICES[q][a][b]$**:
  - Hàng $a$: Người đánh giá; Cột $b$: Bạn cùng phòng.
  - Phản ánh đúng thực tế: Người rất sạch sẽ chịu ức chế nặng với người bừa bộn ($0.15$), trong khi người bừa bộn thấy bình thường với người sạch ($0.75$).
- **Trung bình điều hòa (Harmonic Mean)**:
  $$hmean(x, y) = \frac{2xy}{x + y}$$
  - **Bên chịu thiệt quyết định**: Nếu một người bị ức chế nặng ($x = 0.15, y = 0.75$), điểm kéo tụt về $25.0\%$ chứ không bị trung bình cộng làm lu mờ ($(15 + 75)/2 = 45\%$).

### C. Giai đoạn 3: Xung đột có hướng & Cơ chế Phủ quyết (Veto System)
- **Xung đột có hướng (Directional Conflict)**: Tương tác giữa người phát tiếng ồn/mùi nấu ăn với người nhạy cảm thính giác/khứu giác.
- **Cơ chế Veto**:
  - Các câu hỏi sống còn: `sleep`, `clean`, `guests`, `conflict`, `aircon`.
  - Nếu $\ge 2$ tiêu chí bị xung đột nặng ($s \le 0.25$) $\to$ Kẹp trần điểm tổng thể $\le 30.0\%$.
  - Nếu $1$ tiêu chí bị xung đột cực nặng ($s \le 0.20$) $\to$ Kẹp trần điểm tổng thể $\le 45.0\%$.
- **Xử lý khuyết thiếu (Zero Fake Similarity)**: Câu bỏ trống bị BỎ QUA, tuyệt đối không điền $0.5$ tạo điểm giả. Báo cáo riêng độ phủ dữ liệu `coverage`.
- **Ghép phòng đông người (Group Soft-Min $p = -3.0$)**:
  $$S_{\text{room}} = \left( \frac{1}{M} \sum_{m=1}^M s_m^{-3} \right)^{-1/3}$$
  Nghiêng hẳn về người khó hòa nhập nhất trong phòng để bảo vệ hòa khí chung.

---

## 🚨 5. QUY TẮC PHÁT TRIỂN BẮT BUỘC DÀNH CHO AGENT

### 1. Quy Tắc Tạo Hợp Đồng & Quản Lý Dịch Vụ (CRITICAL CONTRACT RULE)
> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG TỰ Ý LẤY DỊCH VỤ TỪ PHÒNG ĐƯA VÀO HỢP ĐỒNG!**  
> Khi tạo hợp đồng (`LandlordContractServiceImpl.createContract`):
> - **Chỉ thêm** các dịch vụ được chủ trọ chỉ định rõ ràng trong `request.getServices()` (kèm đơn giá áp dụng, chỉ số ban đầu `initialIndex`, phương thức `billingMethod`).
> - **CẤM** fallback tự lấy danh sách dịch vụ từ phòng (`room.getServices()`) hoặc tự động add toàn bộ dịch vụ phòng vào hợp đồng khi request không có dịch vụ. Nếu chủ trọ không chọn dịch vụ nào, hợp đồng được tạo với danh sách dịch vụ rỗng.

### 2. Quy Tắc Tính Tiền & Quyết Toán Hợp Đồng Theo `billingMethod` (STRICT BILLING RULE)
> [!IMPORTANT]
> Mọi dịch vụ tiện ích trong hợp đồng (`ContractService`) đều có trường `billingMethod` quy định hình thức tính phí:
> - **`METER_INDEX`**: Tính theo chỉ số công tơ (`(chỉ số mới - chỉ số cũ) * đơn giá`). Chỉ dịch vụ này mới có chỉ số `lastIndex`, `currentIndex`, `previousIndex` và cần nhập chỉ số chốt ngày trả phòng.
> - **`FIXED_PER_ROOM`**: Phí cố định theo phòng (số lượng = 1, thành tiền = đơn giá).
> - **`FIXED_PER_PERSON`**: Phí cố định theo đầu người (số lượng = số khách đang ở trong phòng `currentOccupancy`, thành tiền = `occupancy * đơn giá`).
> - **`FIXED_PER_UNIT`**: Phí tính theo số lượng đơn vị sử dụng đăng ký (số lượng * đơn giá).
>
> 🚫 **CẤM TUYỆT ĐỐI**:
> - CẤM dùng chuỗi ký tự thô (như `.contains("điện")`, `.contains("nước")`, `.includes('điện')`, `.includes('nước')`) để quyết định cách tính tiền hoặc để lọc lấy dịch vụ công tơ.
> - CẤM tạo các trường thừa hardcode riêng cho điện/nước (như `electricityUsage`, `waterUsage`, `electricityAmount`, `waterAmount`, `finalElectricIndex`, `finalWaterIndex`...). Toàn bộ hóa đơn và quyết toán thanh lý phải truyền và trả về danh sách động theo từng dịch vụ (`meterReadings`, `settlements`, `items`).
> - Khi thanh lý hợp đồng (`terminateContract`), danh sách chỉ số chốt phải nhận động qua mảng `meterReadings` tương ứng với các dịch vụ có `billingMethod === 'METER_INDEX'`, không bao giờ giả định phòng chỉ có điện và nước.

### 3. Thích Ứng Giao Diện Sáng / Tối & Bảng Màu Động (CRITICAL THEME RULE)
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

### 4. Quy Tắc Sắp Xếp & Lọc Dữ Liệu Tại Database (STRICT DATABASE SORTING & FILTERING RULE)
> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG SORT VÀ FILTER TRÊN BỘ NHỚ ỨNG DỤNG (APP MEMORY)!**  
> Mọi thao tác sắp xếp (sort by, sort direction) và lọc danh sách (keyword, status, period...):
> - **BẮT BUỘC** phải được thực hiện trực tiếp dưới Database thông qua Spring Data JPA `org.springframework.data.domain.Sort` và các mệnh đề `WHERE` trong query JPQL/SQL của Repository.
> - **CẤM TUYỆT ĐỐI**: Cấm lấy danh sách thô từ DB lên rồi dùng Java Stream `.filter()` hay `.sort(comparator)` trong Application Service. Việc này làm tê liệt index của DB, lãng phí RAM máy chủ và gây xung đột nghiêm trọng khi phân trang dữ liệu!

### 5. Chuẩn Hóa Cấu Trúc Backend
- **Endpoint naming**: Tuân thủ chuẩn RESTful `/api/v1/{module}/{resource}`.
  - Public URLs phải khai báo trong `SecurityConstants.PUBLIC_URLS`.
  - Endpoint yêu cầu đăng nhập phải có `@PreAuthorize("isAuthenticated()")` hoặc kiểm tra Role.
- **DTOs**: Luôn tách biệt Request DTO và Response DTO, sử dụng Lombok `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`.
- **Database migration**: Mọi thay đổi bảng hoặc cột phải được cập nhật đồng bộ trong cả 2 file:
  - [schema.sql](file:///e:/DoAnTotNgiep/backend/src/main/resources/schema.sql) (Định nghĩa cấu trúc DDL).
  - [data.sql](file:///e:/DoAnTotNgiep/backend/src/main/resources/data.sql) (Dữ liệu mẫu seed data ban đầu).

### 6. Chuẩn Hóa Frontend & Xử Lý Lỗi TanStack Query Hook (CRITICAL HOOK ERROR HANDLING RULE)
- **Quản lý State**:
  - Dữ liệu người dùng & token: Lưu trong `useAuthStore` (LocalStorage sync).
  - Bảng màu: Lưu trong `useThemeStore`.
  - Dữ liệu server: Sử dụng TanStack React Query v5 (`useQuery`, `useMutation`), tái sử dụng queryKeys có sẵn.
- **Xử lý lỗi Mutation trong Custom Hooks (BẮT BUỘC)**:
  > [!IMPORTANT]
  > **VIẾT `onError` CHO TỪNG HÀM/MUTATION TRONG `src/shared/hooks/`, KHÔNG ĐỂ Ở `QueryProvider.tsx`!**  
  > Mỗi mutation hook (`useMutation`) trong thư mục `@/shared/hooks/` phải có callback `onError` riêng biệt để bắt lỗi từ Backend và hiển thị Toast thông báo cho người dùng qua Ant Design `message.error(...)`:
  > ```ts
  > const createMutation = useMutation({
  >   mutationFn: (dto) => service.createItem(dto),
  >   onSuccess: () => {
  >     queryClient.invalidateQueries({ queryKey: keys.items() });
  >   },
  >   onError: (err: any) => {
  >     message.error(err?.response?.data?.message || err?.message || 'Không thể thực hiện thao tác');
  >   },
  > });
  > ```
  > Điều này đảm bảo khi UI gọi `mutate()` hoặc `mutateAsync()`, bất kỳ lỗi nào (400, 404, 500...) cũng đều lập tức hiển thị thông điệp tiếng Việt chính xác từ Backend lên giao diện.
- **Xử lý biểu mẫu & câu hỏi**:
  - Đối với câu hỏi lối sống, luôn hỗ trợ cả 2 dạng `qType === 'SINGLE'` (chọn 1, radio) và `qType === 'MULTI'` (chọn nhiều, checkbox).

### 7. Quy Tắc Phân Trang Server-Side & PageResponse<T> (STRICT SERVER-SIDE PAGINATION RULE)
> [!CAUTION]
> **TOÀN BỘ API DANH SÁCH/TÌM KIẾM PHẢI TRẢ VỀ `ResponseData<PageResponse<T>>`, TUYỆT ĐỐI KHÔNG DÙNG `any` HOẶC TRẢ VỀ MẢNG THÔ KHÔNG PHÂN TRANG!**
>
> 1. **Backend (Spring Boot 3)**:
>    - Endpoint nhận tham số phân trang & sắp xếp: `int page` (default 0), `int size` (default 10), `String sortBy`, `String sortDirection` qua `Pageable pageable = PageRequest.of(page, size, sort)`.
>    - Controller trả về: `ResponseData<PageResponse<T>>` với `PageResponse.from(pageResult)`.
>    - Repository: Thực thi `Page<T>` với truy vấn JPQL/SQL trực tiếp dưới database. Khi có `JOIN FETCH`, **bắt buộc** phải khai báo `countQuery` riêng biệt (dùng `JOIN` và `COUNT(DISTINCT ...)`) để Hibernate 6 tính tổng số bản ghi chính xác.
> 2. **Frontend (React + TypeScript)**:
>    - Định dạng chuẩn trong `src/shared/types/api.ts`: `interface PageResponse<T>` gồm `items: T[]`, `page: number`, `size: number`, `totalElements: number`, `totalPages: number`, `last: boolean`.
>    - Service method: **CẤM TUYỆT ĐỐI** viết `apiClient.get<ResponseData<any>>` hoặc `Promise<ResponseData<any>>`. Phải khai báo tường minh `Promise<ResponseData<PageResponse<T>>>` và `apiClient.get<ResponseData<PageResponse<T>>>`.
>    - Hook TanStack Query: Trích xuất duy nhất `pageInfo: query.data` để UI component tự chủ động lấy danh sách item (`pageInfo?.items ?? []`), số trang (`pageInfo?.totalPages`), trang hiện tại (`pageInfo?.page`), và tổng số bản ghi (`pageInfo?.totalElements`). Tuyệt đối không return trùng lặp cả `items` và `pageInfo` trong hook.
>    - Table Components (BẮT BUỘC): Mọi Table component (như `BillTable`, `ContractTable`, `TenantTable`, `RoomTable`, `BuildingTable`, `ComplaintTable`...) BẮT BUỘC nhận `pageInfo?: PageResponse<T>` và callback `onPageChange?: (page: number, size: number) => void`. TUYỆT ĐỐI CẤM unpack truyền mảng thô `items` vào Table rồi fix cứng `pagination={{ pageSize: 10 }}` (làm mất toàn bộ thông tin phân trang server). Ant Design `<Table>` phải nhận:
>      ```tsx
>      pagination={{
>        current: (pageInfo?.page ?? 0) + 1,
>        pageSize: pageInfo?.size ?? 10,
>        total: pageInfo?.totalElements ?? 0,
>        showSizeChanger: true,
>        pageSizeOptions: ['10', '20', '50'],
>        showTotal: (total) => `Tổng ${total} bản ghi`,
>        onChange: (page, pageSize) => onPageChange?.(page - 1, pageSize),
>      }}
>      ```

### 8. Quy Tắc Đồng Bộ Enum Chuẩn & Cấm Chắp Vá Alias (STRICT NO-PATCHWORK ENUM RULE)
> [!CAUTION]
> **ĐỒNG BỘ 100% ENUM GIỮA BE, FE VÀ DB. CẤM TUYỆT ĐỐI CÁC ĐOẠN CODE CHẮP VÁ ALIAS!**
>
> 1. **Cấm chắp vá alias**:
>    - Tuyệt đối KHÔNG viết các đoạn mã chắp vá như:
>      `if (st === 'RENTED') st = 'OCCUPIED';`
>      `if (st === 'PENDING') st = 'UNPAID';`
>      `if ("InvoiceStatus".equals(typeName)) if ("PENDING".equals(value)) value = "UNPAID";`
>    - Tuyệt đối KHÔNG tạo các hàm normalize chắp vá thừa thãi (`normalizeRoom`, `normalizeBuilding`, `normalizeGenderPref`, `normalizeRoommatePost`...). DTO từ Backend trả về phải khớp trực tiếp với Interface Frontend.
> 2. **Bảng Enum chuẩn duy nhất (Single Source of Truth từ `schema.sql`)**:
>    - **`RoomStatus`**: `AVAILABLE`, `OCCUPIED`, `UNDER_MAINTENANCE`, `STOPPED` (CẤM dùng `RENTED`, `MAINTENANCE`, `DISABLED`).
>    - **`InvoiceStatus` / `BillStatus`**: `DRAFT`, `UNPAID`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED` (CẤM dùng `PENDING` hay `PARTIAL` cho hóa đơn).
>    - **`ContractStatus`**: `ACTIVE`, `EXPIRING_SOON`, `TERMINATED`.
>    - **`ComplaintStatus`**: `PENDING`, `PROCESSING`, `RESOLVED`, `REJECTED` (CẤM dùng `NEW`).
>    - **`ComplaintSeverity`**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
>    - **`RoommatePostStatus`**: `OPEN`, `COMPLETED`, `CLOSED`.
>    - **`RoommatePostType`**: `HAS_ROOM`, `SEARCHING_ROOM`.
>    - **`GenderPreference`**: `ANY`, `MALE_ONLY`, `FEMALE_ONLY`.
> 3. **Xử lý tại Spring MVC Converter**:
>    - `CaseInsensitiveEnumConverterFactory` chỉ làm nhiệm vụ trim khoảng trắng, chuyển chữ hoa (case-insensitive) và chuyển `"ALL"` hoặc chuỗi rỗng thành `null`. Không chứa logic ánh xạ alias thủ công.

### 9. Quy Tắc Tách Rời Custom Hooks Chuyên Biệt (STRICT SINGLE-RESPONSIBILITY HOOKS RULE)
> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG GỘP NHIỀU QUERY VÀ MUTATION VÀO CHUNG MỘT HOOK!**
>
> 1. **Tách biệt rõ ràng Query và Mutation**:
>    - CẤM gộp nhiều queries độc lập hoặc gộp query kèm mutation vào chung một hook (ví dụ: gộp fetch chi tiết phòng, fetch danh sách hợp đồng và các hàm mutation `acceptLink`/`rejectLink` vào chung 1 hook `useMyRoom`). Việc này khiến mọi màn hình chỉ cần 1 chức năng nhỏ cũng bị ép kích hoạt toàn bộ các queries còn lại, gây lãng phí băng thông và re-render liên tục.
> 2. **Cấu trúc chuẩn của Query Hook**:
>    - Mỗi hook query nhận tham số riêng biệt (`params?: FilterParams`) và chỉ gọi 1 API tương ứng.
>    - Luôn trả về cấu trúc chuẩn: `{ pageInfo, isLoading, isError, error, refetch }` (hoặc `{ data, isLoading, isError, error, refetch }` đối với single resource / non-paginated data). Component khi sử dụng sẽ lấy mảng item qua `pageInfo?.items ?? []`.
> 3. **Cấu trúc chuẩn của Mutation Hook**:
>    - Mỗi thao tác tạo/sửa/xóa/phê duyệt tách thành 1 mutation hook độc lập (ví dụ: `useCreateRoom()`, `useUpdateRoom()`, `useDeleteRoom()`, `useAcceptRoomLink()`, `useConfirmPayment()`).
>    - Trả về cấu trúc rõ ràng: `{ mutateAsyncFn, isPending }`.
>    - Luôn đính kèm callback `onError` hiển thị thông điệp lỗi tiếng Việt qua `message.error(...)` từ backend.

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
*Tài liệu này được cập nhật để định hướng và duy trì tính nhất quán cho toàn bộ quá trình phát triển dự án StayConnect.*
