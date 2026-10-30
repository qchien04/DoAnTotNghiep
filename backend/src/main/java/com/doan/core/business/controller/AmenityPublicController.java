package com.doan.core.business.controller;

import com.doan.core.business.dto.amenity.AmenityResponse;
import com.doan.core.business.service.AmenityService;
import com.doan.core.common.data.ResponseData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/public/amenities", "/api/v1/public/amenities"})
@RequiredArgsConstructor
@Tag(name = "Tiện ích Phòng Trọ (Public)", description = "APIs danh mục tiện ích công khai cho người dùng tìm kiếm và chủ trọ chọn khi tạo phòng")
public class AmenityPublicController {

    private final AmenityService amenityService;

    @GetMapping
    @Operation(summary = "Lấy toàn bộ danh sách tiện ích phòng trọ chuẩn")
    public ResponseEntity<ResponseData<List<AmenityResponse>>> getAllAmenities() {
        List<AmenityResponse> list = amenityService.getAllAmenities();
        return ResponseEntity.ok(ResponseData.success(list));
    }
}
