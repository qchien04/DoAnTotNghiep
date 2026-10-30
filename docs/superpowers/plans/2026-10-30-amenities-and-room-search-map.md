# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)
# TÁCH BẢNG TIỆN ÍCH & TRANG TÌM PHÒNG TRỌ ĐA CHIỀU (ROOM SEARCH & SPATIAL MAP)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tách bảng tiện ích `amenities` (Master Data) và bảng trung gian `room_amenities`, tích hợp vào form tạo phòng của Chủ trọ và xây dựng trang Tìm phòng trọ đa chiều `/rooms` với sidebar khoanh vùng bán kính bút vẽ và chuyển đổi linh hoạt giữa Grid Cards và Big Interactive Map.

**Architecture:** 
1. Database & JPA Entity: Tạo bảng `amenities` (`id`, `name`, `description`, `created_at`, `updated_at`) và bảng nối `room_amenities`, cập nhật quan hệ `@ManyToMany` trong `Room.java`.
2. Spatial Haversine Query: Viết truy vấn lọc phòng trọ công khai theo giá, tiện ích và danh sách các vùng tròn `zones` (tâm tọa độ + bán kính theo mét) với điều kiện `OR` trực tiếp tại Database.
3. Frontend React 19: Xây dựng `DrawZoneModal` hỗ trợ dí chuột kéo vẽ vòng tròn bán kính động, tái cấu trúc `RoomSearchPage.tsx` chia 2 cột: Sidebar mini-map bộ lọc và bên phải chuyển đổi giữa Grid Cards và Big Map View với Price Pill Markers.

**Tech Stack:** Spring Boot 3.4.3, Java 21, PostgreSQL, JPA/Hibernate, React 19, TypeScript, Leaflet / React-Leaflet, Tailwind CSS v4, Ant Design 5, Zustand, TanStack React Query v5.

**Spec:** [2026-10-30-amenities-and-room-search-map-design.md](file:///E:/DoAnTotNgiep/docs/superpowers/specs/2026-10-30-amenities-and-room-search-map-design.md)

## Global Constraints
- Bảng `amenities` chỉ chứa đúng các cột: `id`, `name`, `description`, `created_at`, `updated_at`.
- Tuyệt đối không dùng chuỗi nối tiện ích (`amenities text`); toàn bộ quan hệ qua `room_amenities(room_id, amenity_id)`.
- Giữ nguyên độc lập bảng `services` (dịch vụ tính tiền như điện, nước...).
- Tuân thủ Quy tắc 3 AGENTS.md: Sử dụng Semantic Tokens (`bg-stay-bg`, `bg-stay-card-bg`, `text-stay-text`, `border-stay-border`, `bg-stay-primary`...).
- Tuân thủ Quy tắc 4 AGENTS.md: Lọc và sắp xếp trực tiếp dưới Database qua JPQL/SQL.
- Tuân thủ Quy tắc 5 AGENTS.md: Endpoint danh sách trả về `ResponseData<PageResponse<T>>`.

## Review Focus
- Trường hợp phòng không có tọa độ (`latitude` hoặc `longitude` null): Không được gây lỗi tính toán trong công thức khoảng cách Haversine.
- Trường hợp `zones` rỗng hoặc người dùng không khoanh vùng: Query phải bỏ qua điều kiện vùng tròn và trả về danh sách phòng theo các bộ lọc khác bình thường.
- Trường hợp người dùng xóa hết các vòng tròn trong Modal: Bộ lọc phải xóa `zones` và hiển thị lại toàn bộ phòng.
- Đồng bộ tiện ích phòng: Khi chủ trọ chọn tiện ích trong form, backend phải lưu chính xác vào `room_amenities` và trả về đúng danh sách `AmenityResponse`.
- Giao diện Big Map View: Không bị tràn vỡ layout hoặc mất marker khi resize hoặc chuyển đổi chế độ xem.

---

### Task 1: Database Migration & Entity Amenity

**Files:**
- Create: `backend/src/main/java/com/doan/core/business/entity/Amenity.java`
- Create: `backend/src/main/java/com/doan/core/business/repository/AmenityRepository.java`
- Modify: `backend/src/main/java/com/doan/core/business/entity/Room.java:70-73,99-104`
- Modify: `backend/src/main/resources/db/migration/V1__init_database_schema.sql`
- Create: Migration runner script / test migration in PostgreSQL

**Interfaces:**
- Produces: `Amenity` entity, `AmenityRepository`, `room.getAmenities()` returns `List<Amenity>`.

- [ ] **Step 1: Viết migration script tạo bảng `amenities` và `room_amenities`**
  Tạo bảng `amenities` (`id`, `name`, `description`, `created_at`, `updated_at`), bảng `room_amenities` (`room_id`, `amenity_id`), và nạp 16 tiện ích khởi tạo: Điều hòa, Bình nóng lạnh, Tủ lạnh, Máy giặt, Giường nệm, Tủ quần áo, Bếp riêng, Ban công, Thang máy, Khóa vân tay, Chỗ để xe, Wifi, Gác xép, Giờ giấc tự do, Không chung chủ, Bảo vệ 24/7.

- [ ] **Step 2: Thực thi migration trực tiếp lên PostgreSQL `rental_room_management`**
  Chạy JDBC migration hoặc script SQL cập nhật database đang chạy trên máy cục bộ để đồng bộ schema.

- [ ] **Step 3: Tạo Entity `Amenity.java` & `AmenityRepository.java`**
  Tạo `Amenity` kế thừa `BaseEntity` với `name` (unique, not null) và `description`. Tạo `AmenityRepository extends JpaRepository<Amenity, Long>`.

- [ ] **Step 4: Cập nhật Entity `Room.java`**
  Thay thế trường `String amenities` bằng quan hệ `@ManyToMany` qua bảng `room_amenities`.

- [ ] **Step 5: Kiểm tra biên dịch & Hibernate validate**
  Run: `mvn test -Dtest=CoreApplicationTests#contextLoads`
  Expected: BUILD SUCCESS (Hibernate `ddl-auto: validate` vượt qua 100%).

- [ ] **Step 6: Commit**
  ```bash
  git add backend/src/main/java/com/doan/core/business/entity/ backend/src/main/java/com/doan/core/business/repository/AmenityRepository.java backend/src/main/resources/db/migration/
  git commit -m "feat(db): create amenities and room_amenities tables and entity mappings"
  ```

---

### Task 2: Backend Amenity Management & Landlord Room Integration

**Files:**
- Create: `backend/src/main/java/com/doan/core/business/dto/amenity/AmenityResponse.java`
- Create: `backend/src/main/java/com/doan/core/business/dto/amenity/CreateAmenityRequest.java`
- Create: `backend/src/main/java/com/doan/core/business/service/AdminAmenityService.java`
- Create: `backend/src/main/java/com/doan/core/business/service/impl/AdminAmenityServiceImpl.java`
- Create: `backend/src/main/java/com/doan/core/business/controller/admin/AdminAmenityController.java`
- Create: `backend/src/main/java/com/doan/core/business/controller/PublicAmenityController.java`
- Modify: `backend/src/main/java/com/doan/core/business/dto/landlord/room/RoomRequest.java`
- Modify: `backend/src/main/java/com/doan/core/business/dto/landlord/room/RoomResponse.java`
- Modify: `backend/src/main/java/com/doan/core/business/service/impl/LandlordRoomServiceImpl.java`

**Interfaces:**
- Consumes: `AmenityRepository`, `Amenity`, `Room`
- Produces: 
  - `GET /api/v1/public/amenities` -> `ResponseData<List<AmenityResponse>>`
  - `GET /api/v1/admin/amenities` -> `ResponseData<PageResponse<AmenityResponse>>`
  - `POST /api/v1/admin/amenities` -> `ResponseData<AmenityResponse>`
  - `DELETE /api/v1/admin/amenities/{id}` -> `ResponseData<Void>`
  - `RoomRequest.amenityIds`: `List<Long>`
  - `RoomResponse.amenities`: `List<AmenityResponse>`

- [ ] **Step 1: Tạo các DTOs cho Amenity**
  Tạo `AmenityResponse`, `CreateAmenityRequest` (validation `@NotBlank String name`).

- [ ] **Step 2: Xây dựng `AdminAmenityService` & `AdminAmenityController`**
  Hỗ trợ lấy danh sách phân trang (kèm tìm kiếm từ khóa), thêm mới, cập nhật, xóa tiện ích.

- [ ] **Step 3: Xây dựng `PublicAmenityController`**
  Endpoint `GET /api/v1/public/amenities` trả về toàn bộ danh sách tiện ích sắp xếp theo tên để phục vụ bộ lọc tìm kiếm và form chủ trọ.

- [ ] **Step 4: Cập nhật `RoomRequest`, `RoomResponse` và `LandlordRoomServiceImpl`**
  - Trong `RoomRequest`: Thêm `List<Long> amenityIds = new ArrayList<>()`.
  - Trong `RoomResponse`: Trả về `List<AmenityResponse> amenities`.
  - Trong `LandlordRoomServiceImpl.createRoom` và `updateRoom`: Lấy danh sách `Amenity` theo `amenityIds` từ `amenityRepository.findAllById(amenityIds)` và gán vào `room.setAmenities(...)`.

- [ ] **Step 5: Kiểm tra biên dịch backend**
  Run: `mvn test-compile`
  Expected: BUILD SUCCESS.

- [ ] **Step 6: Commit**
  ```bash
  git add backend/src/main/java/com/doan/core/business/
  git commit -m "feat(amenities): add admin and public amenity endpoints and landlord room integration"
  ```

---

### Task 3: Backend Spatial Circular Room Search API

**Files:**
- Create: `backend/src/main/java/com/doan/core/business/dto/room/CircleZoneDto.java`
- Create: `backend/src/main/java/com/doan/core/business/dto/room/PublicRoomSearchRequest.java`
- Modify: `backend/src/main/java/com/doan/core/business/repository/RoomRepository.java`
- Modify: `backend/src/main/java/com/doan/core/business/service/impl/PublicRoomServiceImpl.java` (hoặc trong `HomeController.java`)
- Modify: `backend/src/main/java/com/doan/core/business/controller/HomeController.java`
- Test: `backend/src/test/java/com/doan/core/CoreApplicationTests.java`

**Interfaces:**
- Produces: `POST /api/v1/home/rooms/search` -> `ResponseData<PageResponse<RoomResponse>>`
  Nhận body: `PublicRoomSearchRequest(keyword, province, district, minPrice, maxPrice, minArea, maxArea, amenityIds, zones, page, size, sortBy, sortDirection)`

- [ ] **Step 1: Tạo DTOs `CircleZoneDto` và `PublicRoomSearchRequest`**
  - `CircleZoneDto`: `Double latitude`, `Double longitude`, `Double radiusInMeters`.
  - `PublicRoomSearchRequest`: Đầy đủ các trường lọc và phân trang.

- [ ] **Step 2: Viết Native/JPQL query trong `RoomRepository`**
  Xây dựng truy vấn tìm kiếm kết hợp các bộ lọc giá, diện tích, từ khóa, tiện ích và danh sách các vùng tròn `zones`:
  Dùng công thức Haversine cho từng vùng `zones` với toán tử `OR`.
  Xử lý an toàn: `r.latitude IS NOT NULL AND r.longitude IS NOT NULL` khi có zones.

- [ ] **Step 3: Tạo Endpoint `POST /api/v1/home/rooms/search` trong `HomeController`**
  Trả về `ResponseData<PageResponse<RoomResponse>>`.

- [ ] **Step 4: Viết unit test trong `CoreApplicationTests`**
  Viết test case gọi API tìm kiếm với danh sách vùng tròn `zones` và danh sách `amenityIds`.

- [ ] **Step 5: Chạy test xác minh**
  Run: `mvn test -Dtest=CoreApplicationTests`
  Expected: BUILD SUCCESS, tất cả các test case đều pass.

- [ ] **Step 6: Commit**
  ```bash
  git add backend/src/main/java/com/doan/core/business/ backend/src/test/
  git commit -m "feat(search): implement public room search with spatial circular zones"
  ```

---

### Task 4: Frontend Amenity Service & Landlord Form Update

**Files:**
- Create: `frontend/src/shared/services/amenityService.ts`
- Create: `frontend/src/shared/types/amenity.ts`
- Modify: `frontend/src/shared/types/landlord.ts`
- Modify: `frontend/src/features/landlord/pages/rooms/components/RoomFormModal.tsx`

**Interfaces:**
- Produces: `amenityService.getPublicAmenities(): Promise<ResponseData<AmenityItem[]>>`
- Consumes: Backend `/api/v1/public/amenities`

- [ ] **Step 1: Tạo `amenity.ts` và `amenityService.ts`**
  Khai báo interface `AmenityItem(id, name, description)` và các hàm gọi API `/api/v1/public/amenities`.

- [ ] **Step 2: Cập nhật types trong `landlord.ts`**
  Trong `CreateRoomDto`: `amenityIds?: number[]`.
  Trong `Room`: `amenities?: AmenityItem[] | string[]`.

- [ ] **Step 3: Cập nhật `RoomFormModal.tsx`**
  Tải danh sách tiện ích qua `amenityService.getPublicAmenities()`.
  Thay thế ô `Select mode="tags"` bằng `<Select mode="multiple">` với danh sách tiện ích từ API.
  Khi submit form: Gửi `amenityIds: values.amenityIds`.
  Khi mở sửa phòng: Khởi tạo `amenityIds: editingRoom.amenities?.map(a => typeof a === 'object' ? a.id : ...)` tương thích mượt mà.

- [ ] **Step 4: Kiểm tra build TypeScript**
  Run: `npm run build` trong `frontend`
  Expected: Không có lỗi type.

- [ ] **Step 5: Commit**
  ```bash
  git add frontend/src/shared/services/amenityService.ts frontend/src/shared/types/ frontend/src/features/landlord/
  git commit -m "feat(fe): integrate amenity master data into landlord room modal"
  ```

---

### Task 5: Frontend DrawZoneModal (Drag-to-Circle Drawing Tool)

**Files:**
- Create: `frontend/src/features/room/components/DrawZoneModal.tsx`
- Create: `frontend/src/features/room/types/roomSearch.ts`

**Interfaces:**
- Produces: `<DrawZoneModal open={open} initialZones={zones} onCancel={...} onApply={(zones: CircleZone[]) => void} />`
- `CircleZone`: `{ id: string; latitude: number; longitude: number; radiusInMeters: number }`

- [ ] **Step 1: Định nghĩa type `CircleZone` và helper tính khoảng cách**
  Viết helper tính khoảng cách giữa 2 điểm tọa độ `(lat1, lng1)` và `(lat2, lng2)` theo mét (Haversine) phục vụ hiển thị bán kính theo thời gian thực.

- [ ] **Step 2: Xây dựng Component `DrawZoneModal.tsx` với Leaflet**
  - Khung Modal toàn màn hình / kích thước lớn (90vw, 85vh).
  - Khởi tạo Leaflet Map với tâm Hà Nội.
  - Floating Toolbar trên bản đồ:
    - ✏️ Nút Bút vẽ (Pen Tool Toggle): Bật/tắt chế độ vẽ, đổi con trỏ chuột.
    - 🔄 Hoàn tác (Undo): Xóa vòng tròn vừa vẽ gần nhất.
    - 🗑️ Xóa toàn bộ (Clear All).
    - 📍 Vị trí hiện tại (Locate Me).
  - Tương tác dí chuột kéo vẽ (Drag-to-Circle):
    - `mousedown`: Lấy tâm `(lat, lng)`.
    - `mousemove`: Cập nhật bán kính động theo khoảng cách chuột, render `L.circle` tạm thời kèm tooltip bán kính (ví dụ: "850 m", "1.2 km").
    - `mouseup`: Chốt bán kính, sinh `id` ngẫu nhiên và lưu vào mảng `zones`.
  - Hiển thị danh sách các vòng tròn đã khoanh với màu sắc tím/indigo bán trong suốt (`fillColor: '#8B5CF6'`).
  - Chân Modal: Hiển thị số lượng vùng đã khoanh + Nút "Hủy" và "Áp dụng vùng chọn".

- [ ] **Step 3: Kiểm tra component độc lập và build**
  Run: `npm run build` trong `frontend`.

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/features/room/components/DrawZoneModal.tsx frontend/src/features/room/types/
  git commit -m "feat(fe): build DrawZoneModal with drag-to-circle spatial drawing"
  ```

---

### Task 6: Frontend RoomSearchPage Redesign (Sidebar & Dual Views)

**Files:**
- Modify: `frontend/src/features/room/pages/RoomSearchPage.tsx`
- Create: `frontend/src/features/room/components/RoomBigMap.tsx`
- Create: `frontend/src/features/room/components/RoomCard.tsx`
- Create: `frontend/src/features/room/components/RoomFilterSidebar.tsx`

**Interfaces:**
- Consumes: `DrawZoneModal`, `amenityService`, `authService` / `roomSearchService`
- Produces: Hoàn thiện trang `/rooms` chuẩn Semantic Tokens với 2 cột:
  - Cột trái: Sidebar bộ lọc + Mini Map khoanh vùng
  - Cột phải: Toggle chuyển đổi Grid Cards 🔲 và Big Map View 🗺️

- [ ] **Step 1: Tách nhỏ các Component con theo SRP**
  - `RoomFilterSidebar.tsx`: Chứa Mini Map widget (preview các vòng tròn + nút mở `DrawZoneModal`), bộ lọc khoảng giá (slider + chip presets), tiện ích (chips từ API), diện tích, quận/huyện.
  - `RoomCard.tsx`: Thẻ phòng trọ hiện đại, hiển thị ảnh cover, badge giá tốt/mới, giá nổi bật, tag tiện ích, chủ trọ, nút xem chi tiết.
  - `RoomBigMap.tsx`: Bản đồ lớn chiếm trọn không gian, hiển thị marker huy hiệu giá tiền (Price Pill Marker - ví dụ: `4.2 tr`), render các vòng tròn `zones` đang lọc, click vào marker hiển thị popup preview sang trọng.

- [ ] **Step 2: Tái cấu trúc `RoomSearchPage.tsx`**
  - Tích hợp gọi API tìm kiếm backend `POST /api/v1/home/rooms/search` kết nối với các state bộ lọc: keyword, price, area, amenityIds, zones, page, size.
  - Quản lý view mode: `grid` hoặc `map`.
  - Tích hợp chuẩn Semantic Tokens (`bg-stay-bg`, `bg-stay-card-bg`, `text-stay-text`...).
  - Phân trang Ant Design kết nối API `PageResponse`.

- [ ] **Step 3: Kiểm tra build TypeScript**
  Run: `npm run build` trong `frontend`
  Expected: 0 lỗi.

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/features/room/
  git commit -m "feat(fe): redesign RoomSearchPage with filter sidebar and dual grid/big-map views"
  ```

---

### Task 7: End-to-End Verification & Final Polish

**Files:**
- Test files & Code review

- [ ] **Step 1: Kiểm tra Backend với Maven**
  Run: `mvn clean test` trong `E:\DoAnTotNgiep\backend`
  Expected: BUILD SUCCESS 0 lỗi.

- [ ] **Step 2: Kiểm tra Frontend với Vite**
  Run: `npm run build` trong `E:\DoAnTotNgiep\frontend`
  Expected: 0 lỗi compile.

- [ ] **Step 3: Kiểm tra Python AI Engine**
  Run: `python -c "import stayconnect_ai_engine; print('Engine syntax OK')"` trong `E:\DoAnTotNgiep\AI_Service`
  Expected: `Engine syntax OK`.

- [ ] **Step 4: Commit và tổng kết**
  ```bash
  git add .
  git commit -m "chore: complete amenities master data and advanced room search page"
  ```
