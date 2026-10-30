# 🤖 AGENT GUIDELINES & PROJECT CONTEXT: ROOMI
> **Dự án**: Hệ Thống Quản Lý Nhà Trọ & Hỗ Trợ Ghép Người Ở Chung Thông Minh (Roomi)  
> **Phạm vi**: Đồ Án Tốt Nghiệp Đại Học / Cao Đẳng  
> **Mục tiêu tài liệu**: Cung cấp toàn bộ ngữ cảnh hệ thống, kiến trúc micro-service/AI engine, quy chuẩn code và các nguyên tắc cốt lõi để AI Coding Agents hỗ trợ phát triển chính xác, đồng bộ và tuân thủ tuyệt đối các chuẩn mực kỹ thuật của dự án Roomi.

---

## 📌 1. TỔNG QUAN DỰ ÁN & BÀI TOÁN NGHIỆP VỤ

**Roomi** giải quyết 2 bài toán lớn trong cùng một nền tảng thống nhất:
1. **Quản lý vận hành nhà trọ toàn diện (Dành cho Chủ trọ - Landlord)**: Quản lý tòa nhà, phòng trọ, tiện ích dịch vụ, khách thuê, hợp đồng thuê phòng, chốt chỉ số điện/nước hàng tháng theo hình thức tính phí động, tạo hóa đơn tự động kèm mã VietQR, thanh lý hợp đồng và tiếp nhận xử lý khiếu nại báo hỏng thiết bị.
2. **Tìm kiếm & Ghép phòng trọ thông minh bằng AI Vector (Dành cho Người thuê - Tenant)**: Tìm kiếm phòng theo bản đồ/khu vực/giá, đăng bài tìm bạn ở ghép (có phòng sẵn hoặc chưa có phòng), nộp đơn ứng tuyển ghép phòng, và đối chiếu mức độ hòa hợp giữa các cá nhân thông qua **Thuật toán Khảo sát Lối sống 15 chiều (15-Dimensional Lifestyle Vector) kết hợp 3 tiêu chí lọc cứng (Dealbreakers)** được xử lý bởi AI Service (`stayconnect_ai_engine.py`).

### Các Đối Tượng Người Dùng (Actors)
- **`Guest` (Khách vãng lai)**: Tìm kiếm bài đăng, xem thông tin phòng/bán kính bản đồ, đăng ký tài khoản.
- **`User` (Người dùng cơ bản)**: Đăng nhập, đăng xuất, đổi mật khẩu, quản lý hồ sơ cá nhân và khảo sát lối sống gốc 15 chiều.
- **`Tenant` (Người thuê trọ - Kế thừa User)**: Tìm kiếm ở ghép, đăng tin tìm bạn ghép phòng, ứng tuyển vào phòng, liên kết phòng với chủ trọ, xem hợp đồng/hóa đơn, quét VietQR thanh toán, gửi khiếu nại báo hỏng.
- **`Landlord` (Chủ trọ - Kế thừa User)**: Quản lý tòa nhà, phòng, dịch vụ, hợp đồng, lập hóa đơn, xử lý sự cố, theo dõi doanh thu và công nợ.
- **`Admin` (Quản trị viên hệ thống)**: Quản lý tài khoản toàn sàn, quản lý Master Data, kiểm duyệt vi phạm và xem thống kê tổng thể.

### Bộ Nhận Diện Thương Hiệu (Brand Identity)
- **Tên thương hiệu**: **Roomi**
- **Logo Icon**: `frontend/public/logo-icon.png` (Biểu tượng ngôi nhà bo tròn đa sắc)
- **Logo Ngang (Brand Text)**: `frontend/public/logo-roomi.png` và component `<RoomiLogo />`
- **Màu sắc chủ đạo**:
  - Primary: `#4F46E5` (Indigo)
  - Secondary: `#059669` (Emerald)
  - AI Match Accent: `#8B5CF6` (Purple)

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
    "serverTime": "2026-10-30T00:00:00Z"
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

### AI Engine (Python Fast & Two-Sided Compatibility Engine)
- **Engine File**: `AI_Service/stayconnect_ai_engine.py`
- **Thuật toán**: Mô hình Hai Chiều Từng Câu (**Two-Sided Pairwise Acceptance Matching**) + Trung bình điều hòa (**Harmonic Mean**) + Hệ số phủ quyết (**Veto System**) + Lọc cứng tiên quyết (**Zero-Tolerance Dealbreakers**).

---

## 🧠 3. THUẬT TOÁN GHÉP ĐÔI AI VECTOR 15 CHIỀU & MULTI-SELECT BITMASK

Hệ thống mã hóa và tính điểm tương thích lối sống theo chuẩn mực tuyệt đối giữa Python AI Service (`stayconnect_ai_engine.py`), Java Spring Boot (`LifestyleVectorHelper.java`) và React Frontend (`LifestyleQuestionnaire.tsx`):

### A. Phân Loại 15 Câu Hỏi Lối Sống
1. **10 Câu hỏi chọn 1 (Single-select - `SINGLE`)**:
   - `clean`: Mức độ sạch sẽ, dọn dẹp
   - `guests`: Quy định dẫn bạn về phòng
   - `sleep`: Giờ giấc đi ngủ ban đêm
   - `chores`: Phân chia việc nhà & cọ rửa toilet
   - `wake`: Giờ thức dậy buổi sáng
   - `social`: Mức độ giao tiếp xã hội trong phòng
   - `space`: Ranh giới không gian riêng tư & đồ cá nhân
   - `money`: Cách chia sẻ chi phí sinh hoạt & điện nước
   - `cook`: Thói quen nấu ăn tại phòng
   - `aircon`: Thói quen sử dụng điều hòa & chịu lạnh
2. **5 Câu hỏi chọn nhiều (Multi-select - `MULTI`, Sets & Noise)**:
   - `noise_make`: Thói quen phát tiếng ồn (`["music", "game", "calls", "tv", "quiet"]`)
   - `noise_sense`: Độ nhạy cảm với tiếng ồn & giấc ngủ (`["light", "sound", "smell", "none"]`)
   - `work`: Hình thức làm việc & học tập (`["office", "remote", "night_shift", "student"]`)
   - `weekend`: Thói quen ngày cuối tuần (`["home", "outdoor", "party", "travel", "study"]`)
   - `interest`: Sở thích & đam mê (`["music", "movie", "gym", "reading", "gaming", "cooking", "travel", "tech"]`)
3. **3 Tiêu chuẩn lọc cứng tiên quyết (Dealbreakers Zero-Tolerance)**:
   - `GENDER`: Giới tính bản thân & yêu cầu giới tính bạn cùng phòng (`MALE_ONLY`, `FEMALE_ONLY`, `ANY`).
   - `SMOKING`: Phân tách rành mạch giữa **Đặc điểm** (`smokes`) và **Mức chấp nhận** (`rejects_smokers`).
   - `PET`: Phân tách rành mạch giữa **Đặc điểm** (`has_pet`) và **Mức chấp nhận** (`rejects_pets`).

### B. Quy Chuẩn Mã Hóa Vector Không Thất Thoát (Lossless Bitmask Encoding)
> [!IMPORTANT]
> - Chuỗi `lifestyle_vector` gồm 15 số thực phân tách bằng dấu phẩy, tương ứng 15 tiêu chí theo đúng thứ tự cố định `LifestyleConstants.java`.
> - **Đối với 10 câu `SINGLE`**: Giá trị float trong vector là số thứ tự `sortOrder` (1.0, 2.0, 3.0...).
> - **Đối với 5 câu `MULTI`**: Toàn bộ các lựa chọn đã chọn được nén thành số nguyên **Bitmask** dưới dạng float:
>   $$\text{bitmask} = \sum_{id \in \text{selected}} (1 \ll (\text{sortOrder}_i - 1))$$
>   *Ví dụ*: Chọn option 1 và 3 $\to 1 \ll 0 + 1 \ll 2 = 1 + 4 = 5.0$.  
> - Khi giải mã lại vector (trên BE `decodeVectorToAnswers` hoặc AI Service `_vector_to_answers`), dùng phép kiểm tra bit `(bitmask & (1 << (sortOrder - 1))) != 0` để phục hồi đầy đủ 100% các lựa chọn.
> - Điểm tương thích giữa 2 tập bitmask được tính theo chỉ số **Jaccard similarity** giữa 2 tập bit:
>   $$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

### C. Giao Diện Khảo Sát Hiện Đại (`LifestyleQuestionnaire.tsx`)
- Không sử dụng bảng table thô sơ.
- Hiển thị thanh tiến độ hoàn thành khảo sát trực quan kèm tỉ lệ phần trăm (`%`).
- Phân nhóm 4 tab danh mục: `Tất cả`, `Sinh hoạt chung`, `Giờ giấc & Giấc ngủ`, `Công việc & Sở thích`.
- Hỗ trợ rõ ràng giữa Radio tile (chọn 1) và Multi-select chip tags kèm bộ đếm số mục đã chọn (`đã chọn N`).
- Được tích hợp đồng bộ tại:
  - Hồ sơ cá nhân (`ProfilePage.tsx` tab Khảo sát)
  - Đăng bài tìm bạn ở ghép (`CreatePostModal.tsx` chế độ Tùy chỉnh khảo sát)
  - Đơn ứng tuyển ở ghép (`ApplyRoommateModal.tsx`)

---

## 🚨 4. QUY TẮC PHÁT TRIỂN BẮT BUỘC DÀNH CHO AGENT

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
> **TUYỆT ĐỐI KHÔNG DÙNG TAILWIND MÀU FIX CỨNG (bg-white, text-slate-800...)!**  
> Việc dùng các class tĩnh như `bg-white`, `bg-slate-50`, `text-slate-800`, `border-slate-200`, `bg-blue-600`... sẽ làm hỏng hoàn toàn khả năng chuyển đổi giữa **6 Theme Bảng Màu** và **Chế Độ Tối (Midnight Dark)**!

#### ✅ Bảng Quy Đổi Sang Semantic Tokens Bắt Buộc:
- **Nền toàn trang web**: Dùng **`bg-stay-bg`** (hoặc `bg-stay-bg-app`).
- **Nền Card / Modal / Container / Dropdown**: Dùng **`bg-stay-card-bg`**.
- **Nền phụ thẻ con bên trong Card**: Dùng **`bg-stay-bg-app`** (kết hợp `dark:bg-slate-800/60`).
- **Màu chữ chính / Tiêu đề**: Dùng **`text-stay-text`**.
- **Màu chữ phụ / Mô tả / Subtitle**: Dùng **`text-stay-text-secondary`**.
- **Mã định danh / Placeholder / Chú thích nhỏ**: Dùng **`text-stay-text-muted`**.
- **Đường viền chính (Card, Input, Table)**: Dùng **`border-stay-border`** (kết hợp `dark:border-slate-700`).
- **Đường kẻ phân cách / Viền nhẹ**: Dùng **`border-stay-border-subtle`**.
- **Nút bấm chính / Active (CTA)**: Dùng **`bg-stay-primary hover:bg-stay-primary-hover text-white`**.
- **Nền dịu của Brand (Tag, Pill khi chọn)**: Dùng **`bg-stay-primary-subtle text-stay-primary border border-stay-primary/20`**.
- **Chữ điểm nhấn / Icon nổi bật**: Dùng **`text-stay-primary`**.
- **Trạng thái Xác thực & Ghép đôi**: Dùng **`bg-stay-match`**, **`bg-stay-secondary`**, **`bg-stay-match-subtle`**.

### 4. Quy Tắc Sắp Xếp & Lọc Dữ Liệu Tại Database (STRICT DATABASE SORTING & FILTERING RULE)
> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG SORT VÀ FILTER TRÊN BỘ NHỚ ỨNG DỤNG (APP MEMORY)!**  
> Mọi thao tác sắp xếp (sort by, sort direction) và lọc danh sách (keyword, status, period...):
> - **BẮT BUỘC** phải được thực hiện trực tiếp dưới Database thông qua Spring Data JPA `org.springframework.data.domain.Sort` và các mệnh đề `WHERE` trong query JPQL/SQL của Repository.
> - **CẤM TUYỆT ĐỐI**: Cấm lấy danh sách thô từ DB lên rồi dùng Java Stream `.filter()` hay `.sort(comparator)` trong Application Service. Việc này làm tê liệt index của DB, lãng phí RAM máy chủ và gây xung đột nghiêm trọng khi phân trang dữ liệu!

### 5. Quy Tắc Phân Trang Server-Side & PageResponse<T> (STRICT SERVER-SIDE PAGINATION RULE)
> [!CAUTION]
> **TOÀN BỘ API DANH SÁCH/TÌM KIẾM PHẢI TRẢ VỀ `ResponseData<PageResponse<T>>`, TUYỆT ĐỐI KHÔNG DÙNG `any` HOẶC TRẢ VỀ MẢNG THÔ KHÔNG PHÂN TRANG!**
>
> 1. **Backend (Spring Boot 3)**:
>    - Endpoint nhận tham số phân trang & sắp xếp: `int page` (default 0), `int size` (default 10), `String sortBy`, `String sortDirection` qua `Pageable pageable = PageRequest.of(page, size, sort)`.
>    - Controller trả về: `ResponseData<PageResponse<T>>` với `PageResponse.from(pageResult)`.
>    - Repository: Thực thi `Page<T>` với truy vấn JPQL/SQL trực tiếp dưới database. Khi có `JOIN FETCH`, **bắt buộc** phải khai báo `countQuery` riêng biệt (dùng `JOIN` và `COUNT(DISTINCT ...)`) để Hibernate 6 tính tổng số bản ghi chính xác.
> 2. **Frontend (React + TypeScript)**:
>    - Định dạng chuẩn trong `src/shared/types/api.ts`: `interface PageResponse<T>` gồm `items: T[]`, `page: number`, `size: number`, `totalElements: number`, `totalPages: number`, `last: boolean`.
>    - Service method: **CẤM TUYỆT ĐỐI** viết `apiClient.get<ResponseData<any>>` hoặc `Promise<ResponseData<any>>`. Phải khai báo tường minh `Promise<ResponseData<PageResponse<T>>>`.
>    - Hook TanStack Query: Trích xuất duy nhất `pageInfo: query.data` để UI component tự chủ động lấy danh sách item (`pageInfo?.items ?? []`), số trang (`pageInfo?.totalPages`), trang hiện tại (`pageInfo?.page`), và tổng số bản ghi (`pageInfo?.totalElements`).
>    - Table Components: Ant Design `<Table>` phải nhận cấu hình phân trang động từ `pageInfo`:
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

### 6. Quy Tắc Đồng Bộ Enum Chuẩn & Cấm Chắp Vá Alias (STRICT NO-PATCHWORK ENUM RULE)
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
>    - **`ContractStatus`**: `ACTIVE`, `TERMINATED`.
>    - **`ComplaintStatus`**: `PENDING`, `PROCESSING`, `RESOLVED`, `REJECTED` (CẤM dùng `NEW`).
>    - **`ComplaintSeverity`**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
>    - **`RoommatePostStatus`**: `OPEN`, `COMPLETED`, `CLOSED`.
>    - **`RoommatePostType`**: `HAS_ROOM`, `SEARCHING_ROOM`.
>    - **`GenderPreference`**: `ANY`, `MALE_ONLY`, `FEMALE_ONLY`.

### 7. Quy Tắc Tách Rời Custom Hooks & Xử Lý Lỗi Mutation (STRICT HOOKS RULE)
> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG GỘP NHIỀU QUERY VÀ MUTATION VÀO CHUNG MỘT HOOK!**
>
> 1. **Tách biệt rõ ràng Query và Mutation**:
>    - Mỗi hook query chỉ gọi 1 API tương ứng. Luôn trả về cấu trúc chuẩn: `{ pageInfo, isLoading, isError, error, refetch }` (hoặc `{ data, ... }`).
> 2. **Cấu trúc chuẩn của Mutation Hook**:
>    - Mỗi thao tác tạo/sửa/xóa tách thành 1 mutation hook độc lập.
>    - Trả về cấu trúc rõ ràng: `{ mutateAsyncFn, isPending }`.
>    - **BẮT BUỘC** đính kèm callback `onError` hiển thị thông điệp lỗi tiếng Việt qua `message.error(...)` từ backend:
>      ```ts
>      const createMutation = useMutation({
>        mutationFn: (dto) => service.createItem(dto),
>        onSuccess: () => {
>          queryClient.invalidateQueries({ queryKey: keys.items() });
>        },
>        onError: (err: any) => {
>          message.error(err?.response?.data?.message || err?.message || 'Không thể thực hiện thao tác');
>        },
>      });
>      ```

---

## ⚡ 5. LỆNH KIỂM TRA & XÁC MINH BẮT BUỘC

Trước khi kết thúc bất kỳ lượt làm việc nào hoặc tuyên bố tính năng hoàn tất, Agent **BẮT BUỘC** phải chạy xác minh và đạt kết quả không lỗi:

```powershell
# 1. Kiểm tra Backend (phải báo BUILD SUCCESS 0 lỗi)
cd "E:\DoAnTotNgiep\backend"
mvn test-compile

# 2. Kiểm tra Frontend (phải hoàn thành build không lỗi TypeScript)
cd "E:\DoAnTotNgiep\frontend"
npm run build

# 3. Kiểm tra Python AI Service Engine
cd "E:\DoAnTotNgiep\AI_Service"
python -c "import stayconnect_ai_engine; print('Engine syntax OK')"
```

---
*Tài liệu này được cập nhật chính thức cho toàn bộ dự án Roomi.*
