# Thiết Kế Kỹ Thuật: Chuẩn Hóa Tiện Ích Phòng Trọ Bằng Bitmask & Danh Mục Địa Chính 2 Cấp (Tỉnh - Xã)

- **Ngày tạo**: 31/10/2026
- **Trạng thái**: Đã phê duyệt (Approved)
- **Tác giả**: Roomi Engineering Team

---

## 1. Bối Cảnh & Mục Tiêu

Hệ thống quản lý phòng trọ hiện tại đang lưu trữ tiện ích phòng trọ (`amenities`) qua bảng quan hệ nhiều-nhiều (`room_amenities`) phụ thuộc vào bảng `amenities` được quản lý động bởi Admin. Đồng thời, địa chỉ Tỉnh/Thành phố (`province`) và Phường/Xã (`ward`) đang được lưu dưới dạng chuỗi tự do (`VARCHAR`), dẫn đến:
1. Khi chủ trọ nhập tay địa chỉ tự do, chuỗi dễ bị sai lệch chính tả, định dạng không thống nhất, gây khó khăn cho việc lọc và tìm kiếm phòng trọ chính xác.
2. Quản lý tiện ích trong cơ sở dữ liệu làm tăng các câu truy vấn JOIN phức tạp khi tìm kiếm phòng thỏa mãn nhiều tiện ích đồng thời.
3. Admin phải quản trị thủ công các bảng Master Data không cần thiết.

### Mục Tiêu Đạt Được:
- **Chuẩn hóa 16 tiện ích phòng trọ bằng mã hóa Bitmask 16-bit** cố định trong code, lưu trữ trong DB dưới dạng số nguyên (`INT`). Lọc phòng thỏa mãn nhiều tiện ích bằng phép toán bitwise `(r.amenities_mask & :queryMask) = :queryMask` nhanh và tối ưu.
- **Chuẩn hóa địa giới hành chính 2 cấp (Tỉnh/Thành phố và Phường/Xã)** với bảng mã số nguyên cố định theo chuẩn Tổng cục Thống kê (GSO). Trong Database chỉ lưu `province_id INT` và `ward_id INT`.
- **Nâng cấp trải nghiệm người dùng**: Chủ trọ khi tạo/sửa phòng hoặc tòa nhà chỉ cần chọn từ danh sách thả xuống (cascading dropdown: Tỉnh $\to$ Xã) và chọn tiện ích bằng chip tags.
- **Loại bỏ sự phụ thuộc vào Admin**: Bỏ tính năng CRUD tiện ích và địa giới hành chính của Admin.

---

## 2. Thiết Kế Chi Tiết

### 2.1. Chuẩn Hóa 16 Tiện Ích Phòng Trọ (16-bit Bitmask)

#### Danh sách 16 tiện ích chuẩn và ánh xạ bit:
| Bit Index ($i$) | Giá Trị Bit ($1 \ll i$) | Mã Định Danh (Key) | Tên Tiện Ích Tiếng Việt | Icon Gợi Ý |
|---|---|---|---|---|
| 0 | 1 | `AIR_CONDITIONER` | Điều hòa | Wind |
| 1 | 2 | `WATER_HEATER` | Nóng lạnh | Flame |
| 2 | 4 | `REFRIGERATOR` | Tủ lạnh | Refrigerator |
| 3 | 8 | `WASHING_MACHINE` | Máy giặt | WashingMachine |
| 4 | 16 | `BED_MATTRESS` | Giường nệm | Bed |
| 5 | 32 | `WARDROBE` | Tủ quần áo | DoorClosed |
| 6 | 64 | `KITCHEN` | Kệ bếp / Bếp nấu | ChefHat |
| 7 | 128 | `BALCONY_WINDOW` | Ban công / Cửa sổ | Sun |
| 8 | 256 | `PRIVATE_BATHROOM` | Vệ sinh khép kín | Bath |
| 9 | 512 | `WIFI` | Wi-Fi tốc độ cao | Wifi |
| 10 | 1024 | `PARKING` | Chỗ để xe | Bike |
| 11 | 2048 | `ELEVATOR` | Thang máy | ArrowUpDown |
| 12 | 4096 | `FINGERPRINT_LOCK` | Khóa vân tay / Camera | ShieldCheck |
| 13 | 8192 | `NO_CURFEW` | Giờ giấc tự do | Clock |
| 14 | 16384 | `PET_FRIENDLY` | Cho nuôi thú cưng | PawPrint |
| 15 | 32768 | `MEZZANINE` | Gác xép | Layers |

#### Thuật toán Mã hóa & Giải mã (Bitmask Logic):
- **Mã hóa (Encode)**:
  $$\text{amenitiesMask} = \sum_{i \in \text{selected}} (1 \ll i)$$
  *Ví dụ*: Chọn Điều hòa (bit 0), Nóng lạnh (bit 1), Giường nệm (bit 4) $\to 1 + 2 + 16 = 19$.
- **Giải mã (Decode)**:
  Kiểm tra tiện ích thứ $i$ có được kích hoạt hay không: `(mask & (1 << i)) != 0`.
- **Truy vấn tìm kiếm (Bitwise Matching)**:
  Khi khách tìm phòng yêu cầu cả Điều hòa (1) và Nóng lạnh (2) $\to \text{queryMask} = 3$:
  $$\text{BITAND}(r.\text{amenities\_mask}, \text{queryMask}) = \text{queryMask}$$

---

### 2.2. Danh Mục Địa Giới Hành Chính 2 Cấp (Tỉnh/TP & Phường/Xã)

#### Quy Chuẩn Cấu Trúc Dữ Liệu:
- **Tỉnh/Thành phố (`Province`)**:
  - `id`: Mã số nguyên chuẩn (VD: Hà Nội = 1, TP.HCM = 79, Đà Nẵng = 48...).
  - `name`: Tên tiếng Việt (VD: "Thành phố Hà Nội", "Thành phố Hồ Chí Minh"...).
- **Phường/Xã (`Ward`)**:
  - `id`: Mã số nguyên duy nhất đại diện cho phường/xã.
  - `provinceId`: Mã tỉnh/thành phố trực thuộc.
  - `name`: Tên tiếng Việt của phường/xã (VD: "Phường Dịch Vọng Hậu", "Phường Bến Nghé"...).

#### Lưu trữ và Phục vụ Dữ liệu:
- **Frontend**: File `frontend/src/shared/constants/vietnamLocations.ts` chứa danh sách các tỉnh thành và danh sách xã/phường kèm hàm tìm kiếm `getProvinceById`, `getWardById`, `getWardsByProvinceId`.
- **Backend**: File `backend/src/main/java/com/doan/core/common/constant/VietnamLocationConstants.java` chứa dữ liệu mapping tĩnh `provinceId -> name`, `wardId -> name` để tự động bổ sung `provinceName`, `wardName`, `fullAddress` trong các DTO trả về.
- **Database**:
  - Bảng `rooms`: Thêm `province_id INT`, `ward_id INT`, `amenities_mask INT DEFAULT 0`.
  - Bảng `buildings`: Thêm `province_id INT`, `ward_id INT`.
  - Không cần lưu các cột chuỗi `province`, `ward` trong DB nữa; DTO tự động ánh xạ từ hằng số code.

---

### 2.3. Thay Đổi Ở Backend (Spring Boot 3)

1. **Entity `Room`**:
   - Thêm `Integer amenitiesMask;`
   - Thêm `Integer provinceId;`
   - Thêm `Integer wardId;`
   - Bỏ quan hệ ManyToMany `amenities` (hoặc đánh dấu `@Deprecated`).
2. **Entity `Building`**:
   - Thêm `Integer provinceId;`
   - Thêm `Integer wardId;`
3. **DTOs (`RoomRequest`, `RoomResponse`, `BuildingRequest`, `BuildingResponse`, `PublicRoomSearchRequest`)**:
   - Nhận/trả về `amenitiesMask`, `amenities` (danh sách tên đã giải mã), `provinceId`, `wardId`, `provinceName`, `wardName`, `fullAddress`.
4. **Repository (`RoomRepositoryImpl`)**:
   - Thêm điều kiện lọc theo `province_id`, `ward_id`.
   - Thêm điều kiện lọc theo bitmask `BITAND(r.amenities_mask, :amenitiesMask) = :amenitiesMask`.
5. **Constants**:
   - `RoomAmenityConstants.java`: Danh sách 16 tiện ích, hàm `encode`, `decode`.
   - `VietnamLocationConstants.java`: Tra cứu Tỉnh/Xã.

---

### 2.4. Thay Đổi Ở Frontend (React + TypeScript)

1. **Constants & Helpers**:
   - `src/shared/constants/roomAmenities.ts`: 16 tiện ích, nhãn tiếng Việt, icon, hàm `encodeAmenitiesMask(names)`, `decodeAmenitiesMask(mask)`.
   - `src/shared/constants/vietnamLocations.ts`: 63 tỉnh/thành phố và toàn bộ xã/phường tương ứng.
2. **Components Form**:
   - `BuildingFormModal.tsx`:
     - Select Tỉnh/TP $\to$ Select Phường/Xã (lọc theo Tỉnh đã chọn).
   - `RoomFormModal.tsx`:
     - Select Tỉnh/TP và Phường/Xã (tự động điền nếu phòng thuộc Tòa nhà, hoặc cho phép chọn nếu phòng độc lập).
     - Tiện ích: Hiển thị 16 checkbox/chip tags đẹp mắt, gọn gàng thay cho ô select tags cũ.
3. **Components Hiển Thị & Lọc**:
   - `RoomDetailModal.tsx`: Hiển thị danh sách tiện ích giải mã từ bitmask, hiển thị Tỉnh và Xã từ helper.
   - `RoomTable.tsx`: Cột tiện ích và địa chỉ hiển thị chính xác.
   - `RoomFilter.tsx`: Bộ lọc Tỉnh/Xã và Tiện ích.
4. **Trang Admin (`AppRoutes.tsx`, Layout)**:
   - Ẩn/loại bỏ menu Quản lý Tiện ích (`/admin/amenities`) và Master Data địa chỉ.

---

## 3. Kế Hoạch Kiểm Thử & Xác Minh

1. **Unit/Integration Test**:
   - `testEncodeDecodeAmenities`: Kiểm tra bitmask $0 \to 65535$ bảo toàn dữ liệu 100%.
   - `testLocationMapping`: Kiểm tra tra cứu tên tỉnh/xã theo ID hợp lệ.
2. **Build Verification**:
   - Frontend: `npm run build` không lỗi TypeScript.
   - Backend: `mvn test-compile` đạt `BUILD SUCCESS`.
   - AI Engine: `python -c "import stayconnect_ai_engine; print('Engine syntax OK')"` thành công.
