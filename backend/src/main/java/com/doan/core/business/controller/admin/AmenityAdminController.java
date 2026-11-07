package com.doan.core.business.controller.admin;

import com.doan.core.business.dto.amenity.AmenityResponse;
import com.doan.core.business.dto.amenity.CreateAmenityRequest;
import com.doan.core.business.service.AmenityService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.data.ResponseData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/admin/amenities", "/api/v1/admin/amenities"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "16. Quản trị viên - Quản lý Tiện ích Phòng Trọ", description = "CRUD danh mục tiện ích phòng trọ chuẩn hóa toàn hệ thống")
public class AmenityAdminController {

    private final AmenityService amenityService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tiện ích có phân trang và tìm kiếm theo từ khóa")
    public ResponseEntity<ResponseData<PageResponse<AmenityResponse>>> getAmenities(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        PageResponse<AmenityResponse> result = amenityService.getAmenities(keyword, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(ResponseData.success(result));
    }

    @PostMapping
    @Operation(summary = "Tạo tiện ích phòng trọ mới")
    public ResponseEntity<ResponseData<AmenityResponse>> createAmenity(@Valid @RequestBody CreateAmenityRequest request) {
        AmenityResponse created = amenityService.createAmenity(request);
        return ResponseEntity.ok(ResponseData.success("Tạo tiện ích mới thành công", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật tiện ích phòng trọ")
    public ResponseEntity<ResponseData<AmenityResponse>> updateAmenity(
            @PathVariable Long id,
            @Valid @RequestBody CreateAmenityRequest request) {
        AmenityResponse updated = amenityService.updateAmenity(id, request);
        return ResponseEntity.ok(ResponseData.success("Cập nhật tiện ích thành công", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa tiện ích phòng trọ")
    public ResponseEntity<ResponseData<Void>> deleteAmenity(@PathVariable Long id) {
        amenityService.deleteAmenity(id);
        return ResponseEntity.ok(ResponseData.success("Xóa tiện ích thành công", null));
    }
}
