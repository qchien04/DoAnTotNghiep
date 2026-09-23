package com.doan.core.business.controller.landlord;

import com.doan.core.business.dto.landlord.building.BuildingRequest;
import com.doan.core.business.dto.landlord.building.BuildingResponse;
import com.doan.core.business.service.LandlordBuildingService;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/landlord/buildings")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
@Tag(name = "2. Chủ trọ - Quản lý Tòa nhà (UC 01 - 04)", description = "Danh sách, thêm mới, sửa, xóa tòa nhà và thống kê số phòng")
public class LandlordBuildingController {

    private final LandlordBuildingService buildingService;

    @GetMapping
    @Operation(summary = "UC 01: Xem danh sách tòa nhà / khu trọ", description = "Lấy danh sách các tòa nhà kèm số lượng phòng trống/đang ở và tìm kiếm")
    public ResponseEntity<ResponseData<List<BuildingResponse>>> getBuildings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search) {
        String query = (keyword != null && !keyword.isBlank()) ? keyword : search;
        List<BuildingResponse> buildings = buildingService.getBuildings(principal.getId(), query);
        return ResponseEntity.ok(ResponseData.success(buildings));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết tòa nhà", description = "Lấy thông tin chi tiết một tòa nhà theo ID")
    public ResponseEntity<ResponseData<BuildingResponse>> getBuildingById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        BuildingResponse building = buildingService.getBuildingById(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success(building));
    }

    @PostMapping
    @Operation(summary = "UC 02: Thêm mới tòa nhà / khu trọ", description = "Tạo mới tòa nhà mới với các thông tin địa chỉ, tiện ích, số tầng")
    public ResponseEntity<ResponseData<BuildingResponse>> createBuilding(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BuildingRequest request) {
        BuildingResponse created = buildingService.createBuilding(principal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Thêm mới tòa nhà thành công!", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "UC 03: Cập nhật thông tin tòa nhà", description = "Sửa thông tin tòa nhà (tên, tiện ích chung, quy định, địa chỉ)")
    public ResponseEntity<ResponseData<BuildingResponse>> updateBuilding(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody BuildingRequest request) {
        BuildingResponse updated = buildingService.updateBuilding(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Cập nhật thông tin tòa nhà thành công!", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "UC 04: Xóa tòa nhà", description = "Xóa tòa nhà khỏi hệ thống nếu không còn phòng đang có khách thuê")
    public ResponseEntity<ResponseData<Void>> deleteBuilding(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        buildingService.deleteBuilding(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Xóa tòa nhà thành công!", null));
    }
}
