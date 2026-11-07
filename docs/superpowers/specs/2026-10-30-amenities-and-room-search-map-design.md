# BẢN THIẾT KẾ KỸ THUẬT (DESIGN SPEC)
# TÁCH BẢNG TIỆN ÍCH & TRANG TÌM PHÒNG TRỌ ĐA CHIỀU (ROOM SEARCH & SPATIAL MAP)

> **Dự án**: Roomi - Hệ thống Quản lý Nhà trọ & Ghép người ở cùng thông minh  
> **Ngày**: 2026-10-30  
> **Trạng thái**: Đã thống nhất thiết kế  

---

## 1. MỤC TIÊU & BỐI CẢNH

1. **Chuẩn hóa Tiện ích phòng trọ (Amenities Master Data)**:
   - Thay thế việc lưu chuỗi ký tự nối thô (`TEXT amenities = 'Điều hòa, Nóng lạnh...'`) trong bảng `rooms`.
   - Tạo bảng độc lập `amenities` gồm đúng các trường tối giản: `id`, `name`, `description`, `created_at`, `updated_at`.
   - Tạo bảng trung gian `room_amenities` (`room_id`, `amenity_id`).
   - Tiện ích do Quản trị viên (Admin) quản lý và chỉ định; Chủ trọ (Landlord) khi tạo/sửa phòng sẽ chọn từ danh mục tiện ích này.
   - Bảng `services` (dịch vụ tính tiền như điện, nước, internet, rác...) được giữ nguyên độc lập.

2. **Xây dựng Trang Tìm Phòng Trọ Đa Chiều (`/rooms`)**:
   - **Bên trái (Sidebar)**: Bộ lọc chuyên sâu (Giá thuê, Tiện ích lấy từ bảng `amenities`, Thuộc tính phòng) kèm **Bản đồ mini**.
   - Khi bấm vào bản đồ mini, mở **Modal Khoanh vùng (Draw Zone Modal)** với công cụ bút vẽ: Nhấn giữ và rê chuột trên bản đồ để tạo các vùng hình tròn (tâm và bán kính). Người dùng có thể khoanh nhiều vùng khác nhau.
   - Khi bấm Áp dụng, hệ thống gửi danh sách tọa độ/bán kính vùng khoanh về Backend để truy vấn trực tiếp trong Database (điều kiện `OR` giữa các vùng).
   - **Bên phải (Results)**: Cung cấp 2 chế độ hiển thị linh hoạt:
     - **Dạng Thẻ (Grid Cards)**: Hiển thị các thẻ phòng trọ hiện đại, tag tiện ích, giá nổi bật, phân trang server-side.
     - **Dạng Bản Đồ Lớn Tương Tác (Big Interactive Map - phong cách Airbnb/Zillow)**: Chiếm trọn khung nhìn, hiển thị mỗi phòng trọ dưới dạng huy hiệu giá tiền (Price Pill Marker), click vào hiển thị popup/card xem trước, đồng bộ với các vùng tròn đã khoanh.

---

## 2. KIẾN TRÚC DỮ LIỆU & BACKEND

### A. Cơ sở dữ liệu (PostgreSQL)

```sql
-- 1. Bảng danh mục tiện ích
CREATE TABLE IF NOT EXISTS amenities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng liên kết phòng trọ và tiện ích
CREATE TABLE IF NOT EXISTS room_amenities (
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    amenity_id BIGINT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS idx_room_amenities_room_id ON room_amenities(room_id);
CREATE INDEX IF NOT EXISTS idx_room_amenities_amenity_id ON room_amenities(amenity_id);
```

### B. Entity Java (Spring Boot 3)

1. **`Amenity.java`**:
   - Package: `com.doan.core.business.entity`
   - Kế thừa `BaseEntity` (có sẵn `createdAt`, `updatedAt`, `id` là `Long`).
   - Fields: `name` (String, nullable = false), `description` (String).

2. **Cập nhật `Room.java`**:
   - Loại bỏ `@Column(name = "amenities") private String amenities;`
   - Bổ sung:
     ```java
     @ManyToMany(fetch = FetchType.LAZY)
     @BatchSize(size = 30)
     @JoinTable(
         name = "room_amenities",
         joinColumns = @JoinColumn(name = "room_id"),
         inverseJoinColumns = @JoinColumn(name = "amenity_id")
     )
     @Builder.Default
     private List<Amenity> amenities = new ArrayList<>();
     ```

### C. Quản lý Tiện ích (Admin & Public APIs)

1. **Controller & Service**:
   - `AdminAmenityController` (`/api/v1/admin/amenities`):
     - `GET /`: Danh sách tiện ích có phân trang và tìm kiếm theo tên (`PageResponse<AmenityResponse>`).
     - `POST /`: Thêm tiện ích mới (`name`, `description`).
     - `PUT /{id}`: Sửa tên/mô tả tiện ích.
     - `DELETE /{id}`: Xóa tiện ích.
   - `PublicAmenityController` (`/api/v1/public/amenities`):
     - `GET /`: Lấy toàn bộ danh sách tiện ích (`List<AmenityResponse>`) phục vụ bộ lọc tìm kiếm và form chủ trọ.

### D. Truy Vấn Tìm Kiếm Phòng Trọ Kèm Khoanh Vùng Bán Kính

1. **DTO `PublicRoomSearchRequest`**:
   - `keyword`: Tìm theo tên phòng, địa chỉ.
   - `province`, `district`: Lọc theo khu vực hành chính.
   - `minPrice`, `maxPrice`: Khoảng giá thuê (Long).
   - `minArea`, `maxArea`: Khoảng diện tích (BigDecimal).
   - `amenityIds`: Danh sách `Long` các tiện ích cần lọc.
   - `zones`: Danh sách `CircleZoneDto`:
     - `latitude`: `Double` (tâm vĩ độ)
     - `longitude`: `Double` (tâm kinh độ)
     - `radiusInMeters`: `Double` (bán kính theo mét)
   - `page`: `int` (mặc định 0), `size`: `int` (mặc định 12), `sortBy`: `String`, `sortDirection`: `String`.

2. **Truy vấn Database (Repository Native / JPQL)**:
   - Tuân thủ Quy tắc 4 AGENTS.md (Lọc & Sắp xếp trực tiếp dưới Database, không duyệt trên bộ nhớ):
   - Điều kiện cơ sở: `r.status = 'AVAILABLE' AND r.is_public = true`
   - Điều kiện tiện ích: `(:amenityCount = 0 OR r.id IN (SELECT ra.room_id FROM room_amenities ra WHERE ra.amenity_id IN :amenityIds GROUP BY ra.room_id HAVING COUNT(DISTINCT ra.amenity_id) = :amenityCount))`
   - Điều kiện khoanh vùng (Spatial Circular Zones):
     Duyệt qua danh sách `zones` $[Z_1, Z_2, ...]$ và kết hợp bằng toán tử `OR`:
     ```sql
     (6371000 * 2 * ASIN(SQRT(
         POWER(SIN(RADIANS(r.latitude - :lat1) / 2), 2) +
         COS(RADIANS(:lat1)) * COS(RADIANS(r.latitude)) *
         POWER(SIN(RADIANS(r.longitude - :lng1) / 2), 2)
     )) <= :radius1)
     OR
     (6371000 * 2 * ASIN(SQRT(
         POWER(SIN(RADIANS(r.latitude - :lat2) / 2), 2) +
         COS(RADIANS(:lat2)) * COS(RADIANS(r.latitude)) *
         POWER(SIN(RADIANS(r.longitude - :lng2) / 2), 2)
     )) <= :radius2)
     ```
   - Trả về `ResponseData<PageResponse<RoomResponse>>`.

---

## 3. THIẾT KẾ GIAO DIỆN FRONTEND (REACT 19 + TAILWIND V4 + ANTD)

### A. Tích hợp Semantic Theme Tokens (Quy tắc 3 AGENTS.md)
- Nền tổng thể: `bg-stay-bg`
- Nền Card, Sidebar, Modal: `bg-stay-card-bg`
- Chữ chính, phụ: `text-stay-text`, `text-stay-text-secondary`, `text-stay-text-muted`
- Nút CTA / Active / Pin giá: `bg-stay-primary text-white hover:bg-stay-primary-hover`
- Đường viền: `border-stay-border`

### B. Cấu trúc Trang Tìm Phòng Trọ (`RoomSearchPage.tsx`)

1. **Header**:
   - Thanh tìm kiếm từ khóa, đếm số lượng kết quả (`Tìm thấy N phòng trọ phù hợp`).
   - Nút chuyển chế độ hiển thị:
     - 🔲 **Thẻ danh sách (Grid Cards View)**
     - 🗺️ **Bản đồ lớn tương tác (Big Map View)**

2. **Cột Trái (Sidebar Bộ Lọc - 340px)**:
   - **Mini Map Widget**:
     - Hiển thị bản đồ mini khu vực Hà Nội.
     - Nút "Khoanh vùng tìm kiếm" ✏️ mở `DrawZoneModal`.
     - Nếu đã có vùng khoanh: Vẽ các vòng tròn trên bản đồ mini + Tag "Đang lọc N vùng khoanh" + Nút "Xóa vùng".
   - **Lọc khoảng giá**:
     - Slider 2 đầu (Min - Max) + Nút chọn nhanh (< 3tr, 3 - 5tr, 5 - 8tr, > 8tr).
   - **Lọc tiện ích**:
     - Danh sách chip tags lấy từ API `GET /api/v1/public/amenities`.
     - Chọn nhiều tiện ích, có badge hiển thị số tiện ích đã chọn.
   - **Lọc diện tích & Khu vực**:
     - Các nút chọn diện tích (< 20m², 20-30m², 30-45m², > 45m²), Dropdown Quận/Huyện.
   - Nút "Đặt lại bộ lọc".

3. **Cột Phải (Khu Vực Kết Quả)**:
   - **Chế độ Grid Cards**:
     - Hiển thị lưới thẻ phòng trọ (ảnh bìa, huy hiệu trạng thái, tiêu đề, địa chỉ, diện tích, giá nổi bật, danh sách tag tiện ích dạng pills).
     - Phân trang Ant Design kết nối API `PageResponse`.
   - **Chế độ Big Interactive Map (Airbnb Style)**:
     - Bản đồ Leaflet phủ toàn bộ không gian còn lại.
     - Mỗi phòng trọ là 1 **Marker Huy Hiệu Giá Tiền** (Badge Marker bo tròn, ví dụ: `3.5 tr`, `4.2 tr`).
     - Render các vòng tròn khoanh vùng với màu tím bán trong suốt (`rgba(139, 92, 246, 0.2)`).
     - Click vào marker: Hiển thị Floating Preview Card góc bản đồ hoặc popup sang trọng gồm ảnh, tên, giá, tiện ích và nút "Xem chi tiết".

### C. Modal Khoanh Vùng Bằng Chuột (`DrawZoneModal.tsx`)

- Bản đồ khổ lớn (Leaflet Map).
- **Thanh công cụ nổi (Floating Control)**:
  - ✏️ **Bút vẽ (Draw Tool)**: Click để kích hoạt chế độ vẽ (con trỏ chuột đổi thành crosshair).
  - 🔄 **Hoàn tác (Undo)**: Xóa vòng tròn vừa vẽ gần nhất.
  - 🗑️ **Xóa hết (Clear All)**: Xóa toàn bộ các vùng đã khoanh.
  - 📍 **Vị trí của tôi (Locate Me)**: Bay về tọa độ hiện tại của người dùng.
- **Thao tác dí chuột kéo tạo hình tròn**:
  - `mousedown`: Lấy tọa độ tâm $(lat_0, lng_0)$.
  - `mousemove`: Tính khoảng cách từ tâm đến con trỏ chuột theo mét và render vòng tròn động kéo dài theo chuột kèm tooltip hiển thị bán kính (ví dụ: `850m`, `1.2km`).
  - `mouseup`: Chốt bán kính $R$, thêm vào danh sách `zones`.
  - Người dùng có thể lặp lại thao tác nhiều lần để khoanh nhiều vùng khác nhau.
- Nút "Hủy" và "Áp dụng vùng chọn": Chuyển danh sách `zones` vào bộ lọc và tự động refetch API.

### D. Cập Nhật Form Tạo/Sửa Phòng Của Chủ Trọ (`RoomFormModal.tsx`)
- Đọc danh sách tiện ích từ API `GET /api/v1/public/amenities`.
- Thay thế ô nhập tags thô bằng `<Select mode="multiple">` hoặc Tag Checkboxes.
- Gửi `amenityIds: Long[]` lên backend khi lưu phòng.

---

## 4. KẾ HOẠCH KIỂM THỬ & XÁC MINH (VERIFICATION)

1. **Backend**:
   - Viết test case cho `AdminAmenityService` và `PublicRoomSearch` với lọc vòng tròn tọa độ.
   - Chạy `mvn clean test` (phải BUILD SUCCESS 0 lỗi).
2. **Frontend**:
   - Kiểm tra build không lỗi TypeScript: `npm run build`.
   - Thử nghiệm giao diện cả chế độ Sáng và Tối (Midnight Dark).
3. **AI Service Engine**:
   - `python -c "import stayconnect_ai_engine; print('Engine syntax OK')"`.
