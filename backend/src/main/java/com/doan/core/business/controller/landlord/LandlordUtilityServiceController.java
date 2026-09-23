package com.doan.core.business.controller.landlord;

import com.doan.core.business.dto.landlord.service.UtilityServiceRequest;
import com.doan.core.business.dto.landlord.service.UtilityServiceResponse;
import com.doan.core.business.service.LandlordUtilityService;
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
@RequestMapping("/api/v1/landlord/services")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
@Tag(name = "4. Chủ trọ - Cấu hình Dịch vụ Tiện ích (UC 09 - 12)", description = "Xem bảng giá, thêm mới, sửa đơn giá, xóa dịch vụ tiện ích")
public class LandlordUtilityServiceController {

    private final LandlordUtilityService utilityService;

    @GetMapping
    @Operation(summary = "UC 09: Xem danh mục dịch vụ tiện ích", description = "Lấy danh sách các dịch vụ đang cung cấp (Điện, nước, internet, rác, xe...)")
    public ResponseEntity<ResponseData<List<UtilityServiceResponse>>> getServices(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<UtilityServiceResponse> list = utilityService.getServices(principal.getId());
        return ResponseEntity.ok(ResponseData.success(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết dịch vụ tiện ích", description = "Lấy thông tin chi tiết một dịch vụ tiện ích theo ID")
    public ResponseEntity<ResponseData<UtilityServiceResponse>> getServiceById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        UtilityServiceResponse response = utilityService.getServiceById(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success(response));
    }

    @PostMapping
    @Operation(summary = "UC 10: Thêm mới dịch vụ tiện ích", description = "Tạo mới dịch vụ tiện ích kèm hình thức tính cước và đơn giá")
    public ResponseEntity<ResponseData<UtilityServiceResponse>> createService(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UtilityServiceRequest request) {
        UtilityServiceResponse created = utilityService.createService(principal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Lưu dịch vụ thành công!", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "UC 11: Cập nhật dịch vụ tiện ích", description = "Điều chỉnh đơn giá và thông tin dịch vụ")
    public ResponseEntity<ResponseData<UtilityServiceResponse>> updateService(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UtilityServiceRequest request) {
        UtilityServiceResponse updated = utilityService.updateService(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Cập nhật đơn giá dịch vụ thành công!", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "UC 12: Xóa dịch vụ tiện ích", description = "Xóa dịch vụ khỏi danh mục nếu chưa bị ràng buộc trong hợp đồng")
    public ResponseEntity<ResponseData<Void>> deleteService(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        utilityService.deleteService(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Đã xóa dịch vụ thành công!", null));
    }
}
