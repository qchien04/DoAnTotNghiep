# Chuẩn Hóa Tiện Ích Phòng Trọ Bằng Bitmask & Danh Mục Địa Chính 2 Cấp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đổi toàn bộ cơ chế quản lý tiện ích phòng trọ sang Bitmask 16-bit cố định trong code và chuẩn hóa địa chính 2 cấp (Tỉnh/TP và Phường/Xã) bằng số nguyên cố định, loại bỏ sự phụ thuộc vào database động và quản trị của Admin.

**Architecture:** 
- 16 tiện ích phòng trọ được gán vị trí bit từ $0 \to 15$, lưu trữ trong database dưới dạng số nguyên `amenities_mask INT`. Tìm kiếm phòng theo tiện ích bằng phép toán bitwise `BITAND(r.amenities_mask, :queryMask) = :queryMask`.
- Toàn bộ 63 Tỉnh/TP và Xã/Phường được số hóa cố định bằng mã số nguyên `provinceId` và `wardId`. Trong DB `rooms` và `buildings` chỉ lưu mã số nguyên; Backend và Frontend tra cứu tên từ bộ hằng số tĩnh để hiển thị.
- Chủ trọ chọn Tỉnh và Xã qua 2 dropdown phụ thuộc (cascading Select) và chọn tiện ích bằng chip tags. Admin không còn cần quản lý tiện ích hay địa giới.

**Tech Stack:** Spring Boot 3, Java 21, Spring Data JPA / H2 / PostgreSQL, React 19, TypeScript, Ant Design 5/6, Tailwind CSS v4.

**Spec:** [docs/superpowers/specs/2026-10-31-room-amenities-bitmask-vietnam-locations-design.md](file:///E:/DoAnTotNgiep/docs/superpowers/specs/2026-10-31-room-amenities-bitmask-vietnam-locations-design.md)

## Global Constraints

- Không dùng class Tailwind màu fix cứng (tuân thủ theme semantic tokens: `bg-stay-card-bg`, `text-stay-text`, `border-stay-border`...).
- Phân trang & sắp xếp dữ liệu phải diễn ra trực tiếp dưới Database (không lọc trên RAM).
- Toàn bộ 16 tiện ích có thứ tự bit cố định không thay đổi.
- Không phát sinh lỗi TypeScript (`npm run build`) và biên dịch Java (`mvn test-compile`).

## Review Focus

1. Giá trị `amenitiesMask = 0` hoặc `null` không làm lỗi câu truy vấn bitwise khi tìm kiếm phòng.
2. Phòng thuộc Tòa nhà tự động kế thừa `provinceId` và `wardId` từ Tòa nhà nếu không truyền riêng.
3. Khi người dùng thay đổi Tỉnh trong dropdown, giá trị Phường/Xã đã chọn trước đó phải được tự động reset.
4. Quá trình giải mã bitmask (`decode`) phải xử lý an toàn mọi số nguyên từ $0 \to 65535$.
5. Tra cứu tên Tỉnh/Xã với ID không tồn tại phải trả về chuỗi fallback rỗng hoặc `—`, không được văng Exception/crash UI.

---

### Task 1: Định Nghĩa Hằng Số Tiện Ích & Bitmask Logic (Backend & Frontend)

**Files:**
- Create: `backend/src/main/java/com/doan/core/common/constant/RoomAmenityConstants.java`
- Create: `backend/src/test/java/com/doan/core/common/constant/RoomAmenityConstantsTest.java`
- Create: `frontend/src/shared/constants/roomAmenities.ts`

**Interfaces:**
- Produces: 
  - Backend: `RoomAmenityConstants.encode(List<String> names): int`, `RoomAmenityConstants.decode(int mask): List<String>`, `RoomAmenityConstants.ALL_AMENITIES`.
  - Frontend: `AMENITY_LIST`, `encodeAmenitiesMask(names: string[]): number`, `decodeAmenitiesMask(mask: number): string[]`.

- [x] **Step 1: Viết Unit Test cho `RoomAmenityConstants` ở Backend**

```java
package com.doan.core.common.constant;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class RoomAmenityConstantsTest {
    @Test
    void testEncodeAndDecode() {
        List<String> selected = List.of("Điều hòa", "Nóng lạnh", "Giường nệm");
        int mask = RoomAmenityConstants.encode(selected);
        assertEquals(1 + 2 + 16, mask); // Bit 0, 1, 4 = 19

        List<String> decoded = RoomAmenityConstants.decode(mask);
        assertEquals(3, decoded.size());
        assertTrue(decoded.contains("Điều hòa"));
        assertTrue(decoded.contains("Nóng lạnh"));
        assertTrue(decoded.contains("Giường nệm"));
    }

    @Test
    void testBoundaryValues() {
        assertEquals(0, RoomAmenityConstants.encode(null));
        assertEquals(0, RoomAmenityConstants.encode(List.of()));
        assertTrue(RoomAmenityConstants.decode(0).isEmpty());
        assertEquals(16, RoomAmenityConstants.decode(65535).size());
    }
}
```

- [x] **Step 2: Chạy test để xác nhận test thất bại**

Run: `mvn test -Dtest=RoomAmenityConstantsTest`
Expected: FAIL (class not found)

- [x] **Step 3: Cài đặt `RoomAmenityConstants.java` ở Backend**

Tạo enum/record 16 tiện ích (bit 0 đến 15) và các hàm `encode`, `decode`, `getAllAmenities()`.

- [x] **Step 4: Chạy test để xác nhận test PASS**

Run: `mvn test -Dtest=RoomAmenityConstantsTest`
Expected: BUILD SUCCESS, 2 tests run, 0 failures.

- [x] **Step 5: Cài đặt `frontend/src/shared/constants/roomAmenities.ts` ở Frontend**

Xuất danh sách `AMENITY_LIST` gồm 16 item (id, bitIndex, label, icon) và các hàm `encodeAmenitiesMask`, `decodeAmenitiesMask`.

- [x] **Step 6: Commit Task 1**

```powershell
git add backend/src/main/java/com/doan/core/common/constant/RoomAmenityConstants.java backend/src/test/java/com/doan/core/common/constant/RoomAmenityConstantsTest.java frontend/src/shared/constants/roomAmenities.ts; git commit -m "feat(amenities): add 16-bit room amenities bitmask constants and helpers"
```

---

### Task 2: Dữ Liệu Địa Giới Hành Chính 2 Cấp (Tỉnh - Xã) (Backend & Frontend)

**Files:**
- Create: `backend/src/main/java/com/doan/core/common/constant/VietnamLocationConstants.java`
- Create: `frontend/src/shared/constants/vietnamLocations.ts`

**Interfaces:**
- Produces:
  - Backend: `VietnamLocationConstants.getProvinceName(Integer id): String`, `VietnamLocationConstants.getWardName(Integer id): String`, `VietnamLocationConstants.formatAddress(String detail, Integer wardId, Integer provinceId): String`.
  - Frontend: `VIETNAM_PROVINCES`, `VIETNAM_WARDS`, `getProvinces()`, `getWardsByProvinceId(provinceId: number)`, `getProvinceName(id?: number): string`, `getWardName(id?: number): string`.

- [x] **Step 1: Tạo bộ dữ liệu địa giới 63 Tỉnh/TP và Xã/Phường ở Frontend (`vietnamLocations.ts`)**

Định nghĩa interface `Province` (`id: number`, `name: string`, `code: string`), `Ward` (`id: number`, `provinceId: number`, `name: string`), và danh sách 63 tỉnh/thành phố chuẩn Tổng cục Thống kê kèm các phường/xã của các tỉnh/thành phố.

- [x] **Step 2: Tạo bộ dữ liệu tra cứu địa giới ở Backend (`VietnamLocationConstants.java`)**

Tạo cấu trúc lưu trữ `Map<Integer, String> PROVINCES`, `Map<Integer, String> WARDS`, và các hàm tiện ích tra cứu `getProvinceName`, `getWardName`, `formatAddress`.

- [x] **Step 3: Kiểm tra biên dịch**

Run: `mvn test-compile`
Expected: BUILD SUCCESS

- [x] **Step 4: Commit Task 2**

```powershell
git add backend/src/main/java/com/doan/core/common/constant/VietnamLocationConstants.java frontend/src/shared/constants/vietnamLocations.ts; git commit -m "feat(location): add 2-level vietnam administrative locations constants and helpers"
```

---

### Task 3: Cập Nhật Database Schema, Entity & DTOs

**Files:**
- Modify: `backend/src/main/resources/db/migration/V1__init_database_schema.sql`
- Modify: `backend/src/main/java/com/doan/core/business/entity/Room.java`
- Modify: `backend/src/main/java/com/doan/core/business/entity/Building.java`
- Modify: `backend/src/main/java/com/doan/core/business/dto/landlord/room/RoomRequest.java`
- Modify: `backend/src/main/java/com/doan/core/business/dto/landlord/room/RoomResponse.java`
- Modify: `backend/src/main/java/com/doan/core/business/dto/landlord/building/BuildingRequest.java`
- Modify: `backend/src/main/java/com/doan/core/business/dto/landlord/building/BuildingResponse.java`
- Modify: `backend/src/main/java/com/doan/core/business/dto/publicdto/PublicRoomSearchRequest.java`
- Modify: `frontend/src/shared/types/landlord.ts`

**Interfaces:**
- `Room`: thêm `amenitiesMask`, `provinceId`, `wardId`.
- `Building`: thêm `provinceId`, `wardId`.
- `RoomResponse`: trả về `amenitiesMask`, `amenities`, `provinceId`, `wardId`, `provinceName`, `wardName`, `fullAddress`.

- [x] **Step 1: Cập nhật `Room.java` và `Building.java`**

Thêm các trường `amenitiesMask` (`Column(name = "amenities_mask")`), `provinceId` (`Column(name = "province_id")`), `wardId` (`Column(name = "ward_id")`).

- [x] **Step 2: Cập nhật Request & Response DTOs**

Bổ sung các trường `amenitiesMask`, `provinceId`, `wardId` vào Request DTOs.
Trong `RoomResponse.fromEntity`:
- Đọc `amenitiesMask` từ `room.getAmenitiesMask()`.
- Giải mã `amenities` bằng `RoomAmenityConstants.decode(amenitiesMask)`.
- Tra cứu `provinceName` và `wardName` bằng `VietnamLocationConstants`.
- Tạo chuỗi `fullAddress` tự động.

- [x] **Step 3: Cập nhật TypeScript types trong `frontend/src/shared/types/landlord.ts`**

Bổ sung `amenitiesMask?: number;`, `provinceId?: number;`, `wardId?: number;`, `provinceName?: string;`, `wardName?: string;` vào các interface `Room`, `Building`, `CreateRoomDto`, `CreateBuildingDto`, `RoomFilterParams`.

- [x] **Step 4: Kiểm tra biên dịch Backend**

Run: `mvn test-compile`
Expected: BUILD SUCCESS

- [x] **Step 5: Commit Task 3**

```powershell
git add backend/ frontend/src/shared/types/landlord.ts; git commit -m "refactor(schema): update Room and Building entities and DTOs with bitmask and location IDs"
```

---

### Task 4: Cập Nhật Repository Bitwise Query & Service Logic

**Files:**
- Modify: `backend/src/main/java/com/doan/core/business/service/impl/LandlordRoomServiceImpl.java`
- Modify: `backend/src/main/java/com/doan/core/business/service/impl/LandlordBuildingServiceImpl.java`
- Modify: `backend/src/main/java/com/doan/core/business/repository/impl/RoomRepositoryImpl.java`

- [x] **Step 1: Cập nhật `LandlordBuildingServiceImpl.java`**

Khi tạo/sửa tòa nhà: lưu `provinceId` và `wardId`.

- [x] **Step 2: Cập nhật `LandlordRoomServiceImpl.java`**

Khi tạo/sửa phòng trọ:
- Lưu `amenitiesMask` (nếu request truyền `amenitiesMask` hoặc mảng `amenities`, mã hóa tự động).
- Nếu phòng thuộc tòa nhà và không truyền `provinceId`/`wardId`, kế thừa tự động từ tòa nhà.
- Lưu `provinceId` và `wardId`.

- [x] **Step 3: Cập nhật `RoomRepositoryImpl.java` cho tìm kiếm bitwise & địa giới**

Thêm điều kiện:
- Lọc theo `provinceId`: kiểm tra `(r.provinceId = :provinceId OR (r.provinceId IS NULL AND b.provinceId = :provinceId))`.
- Lọc theo `wardId`: kiểm tra `(r.wardId = :wardId OR (r.wardId IS NULL AND b.wardId = :wardId))`.
- Lọc theo `amenitiesMask`: kiểm tra bitwise `FUNCTION('BITAND', r.amenitiesMask, :amenitiesMask) = :amenitiesMask` khi `amenitiesMask > 0`.

- [x] **Step 4: Kiểm tra biên dịch Backend**

Run: `mvn test-compile`
Expected: BUILD SUCCESS

- [x] **Step 5: Commit Task 4**

```powershell
git add backend/src/main/java/com/doan/core/business/; git commit -m "feat(service): implement bitwise amenities filter and location ID mapping in room service"
```

---

### Task 5: Cập Nhật UI Form Thêm/Sửa & Modal Chi Tiết

**Files:**
- Modify: `frontend/src/features/landlord/pages/buildings/components/BuildingFormModal.tsx`
- Modify: `frontend/src/features/landlord/pages/rooms/components/RoomFormModal.tsx`
- Modify: `frontend/src/features/landlord/pages/rooms/components/RoomDetailModal.tsx`
- Modify: `frontend/src/features/landlord/pages/rooms/components/RoomFilter.tsx`

- [x] **Step 1: Nâng cấp `BuildingFormModal.tsx`**

- Thay ô nhập Tỉnh/TP và Xã thành 2 dropdown `<Select>`:
  - Dropdown Tỉnh/Thành phố (`provinceId`): hiển thị 63 Tỉnh/TP, có tìm kiếm.
  - Dropdown Phường/Xã (`wardId`): tự động lọc các xã thuộc tỉnh đã chọn. Reset xã khi đổi tỉnh.

- [x] **Step 2: Nâng cấp `RoomFormModal.tsx`**

- Địa chỉ: Chọn Tỉnh và Xã từ dropdown; tự động kế thừa và vô hiệu hóa nếu phòng thuộc Tòa nhà.
- Tiện ích phòng trọ: Hiển thị lưới 16 Chip Tags / Checkboxes từ `AMENITY_LIST` thay vì thẻ input tag cũ. Người dùng click để bật/tắt tiện ích. Khi submit, mã hóa thành `amenitiesMask`.

- [x] **Step 3: Nâng cấp `RoomDetailModal.tsx`**

- Hiển thị tiện ích phòng trọ được giải mã từ `amenitiesMask` (hoặc mảng `amenities`).
- Hiển thị Tỉnh và Phường/Xã bằng tên tiếng Việt từ helper.

- [x] **Step 4: Nâng cấp `RoomFilter.tsx`**

- Cho phép lọc theo Tỉnh, Xã, và Tiện ích yêu cầu.

- [x] **Step 5: Kiểm tra build Frontend**

Run: `npm run build`
Expected: Thành công 0 lỗi TypeScript.

- [x] **Step 6: Commit Task 5**

```powershell
git add frontend/src/features/landlord/pages/; git commit -m "feat(ui): update building/room forms with cascading location selects and bitmask amenities chips"
```

---

### Task 6: Dọn Dẹp Route & Menu Quản Trị Admin

**Files:**
- Modify: `frontend/src/routes/AppRoutes.tsx`
- Modify: `frontend/src/shared/layouts/AdminLayout.tsx`

- [x] **Step 1: Ẩn/gỡ bỏ menu "Quản lý Tiện ích" và "Master Data" địa chỉ trong `AdminLayout.tsx`**

Xóa mục menu `Quản lý Tiện ích` (`/admin/amenities`) vì tiện ích đã được mã hóa cố định trong code.

- [x] **Step 2: Cập nhật route trong `AppRoutes.tsx`**

Chuyển hướng hoặc loại bỏ các route không còn dùng.

- [x] **Step 3: Kiểm tra build Frontend**

Run: `npm run build`
Expected: Thành công 0 lỗi.

- [x] **Step 4: Commit Task 6**

```powershell
git add frontend/src/routes/AppRoutes.tsx frontend/src/shared/layouts/AdminLayout.tsx; git commit -m "refactor(admin): remove dynamic amenities and master data management from admin portal"
```

---

### Task 7: Xác Minh Hoàn Tất Toàn Bộ Hệ Thống

- [x] **Step 1: Kiểm tra build Frontend**

Run: `npm run build` ở thư mục `frontend`
Expected: BUILD SUCCESS, 0 lỗi TypeScript.

- [x] **Step 2: Kiểm tra biên dịch Backend**

Run: `mvn test-compile` ở thư mục `backend`
Expected: BUILD SUCCESS.

- [x] **Step 3: Kiểm tra Python AI Service**

Run: `python -c "import stayconnect_ai_engine; print('Engine syntax OK')"`
Expected: `Engine syntax OK`.
