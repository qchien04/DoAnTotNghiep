package com.doan.core.business.controller.landlord;

import com.doan.core.business.dto.landlord.tenant.TenantLinkInviteRequest;
import com.doan.core.business.dto.landlord.tenant.TenantRequest;
import com.doan.core.business.dto.landlord.tenant.TenantResponse;
import com.doan.core.business.service.LandlordTenantService;
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
@RequestMapping("/api/v1/landlord/tenants")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
@Tag(name = "5. Chủ trọ - Quản lý Khách thuê (UC 13 - 17)", description = "Xem danh sách khách thuê, thêm vào phòng, sửa thông tin, rời phòng, mời liên kết tài khoản")
public class LandlordTenantController {

    private final LandlordTenantService tenantService;

    @GetMapping
    @Operation(summary = "UC 13: Xem danh sách khách đang thuê phòng", description = "Lấy danh sách khách thuê tại các phòng, lọc theo tòa/phòng và tìm kiếm theo họ tên/SĐT/CCCD")
    public ResponseEntity<ResponseData<List<TenantResponse>>> getTenants(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long buildingId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) String keyword) {
        List<TenantResponse> tenants = tenantService.searchTenants(principal.getId(), buildingId, roomId, keyword);
        return ResponseEntity.ok(ResponseData.success(tenants));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết hồ sơ khách thuê", description = "Lấy thông tin chi tiết một khách thuê theo ID")
    public ResponseEntity<ResponseData<TenantResponse>> getTenantById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        TenantResponse tenant = tenantService.getTenantById(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success(tenant));
    }

    @PostMapping
    @Operation(summary = "UC 14: Thêm khách thuê vào phòng", description = "Tạo mới hồ sơ khách thuê và gán vào đúng phòng trọ")
    public ResponseEntity<ResponseData<TenantResponse>> addTenant(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TenantRequest request) {
        TenantResponse created = tenantService.addTenant(principal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Thêm khách thuê thành công!", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "UC 15: Cập nhật thông tin khách thuê", description = "Sửa đổi thông tin cá nhân, CCCD, ảnh hoặc số điện thoại của khách")
    public ResponseEntity<ResponseData<TenantResponse>> updateTenant(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TenantRequest request) {
        TenantResponse updated = tenantService.updateTenant(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Cập nhật thông tin khách thuê thành công!", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "UC 16: Xóa hoặc chuyển khách thuê ra khỏi phòng", description = "Gỡ khách thuê khỏi phòng (yêu cầu khách không phải đại diện hợp đồng)")
    public ResponseEntity<ResponseData<Void>> removeTenant(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        tenantService.removeTenant(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Đã chuyển khách thuê ra khỏi phòng thành công!", null));
    }

    @PostMapping("/{id}/invite-link")
    @Operation(summary = "UC 17: Mời liên kết tài khoản khách thuê", description = "Tìm kiếm tài khoản người dùng theo SĐT/Email và gửi lời mời kết nối tài khoản")
    public ResponseEntity<ResponseData<Void>> inviteUserLink(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TenantLinkInviteRequest request) {
        tenantService.inviteUserLink(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Đã gửi lời mời liên kết tài khoản thành công!", null));
    }
}
