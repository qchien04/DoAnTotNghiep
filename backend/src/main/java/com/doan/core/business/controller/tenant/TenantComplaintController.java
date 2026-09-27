package com.doan.core.business.controller.tenant;

import com.doan.core.business.dto.tenant.RateComplaintRequest;
import com.doan.core.business.dto.tenant.TenantComplaintRequest;
import com.doan.core.business.dto.tenant.TenantComplaintResponse;
import com.doan.core.business.service.TenantComplaintService;
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
@RequestMapping("/api/v1/tenant/complaints")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("isAuthenticated()")
@Tag(name = "13. Người thuê - Khiếu nại & Báo hỏng (UC 18)", description = "Gửi phản ánh sự cố điện nước, điều hòa tới chủ nhà và đánh giá chất lượng thợ sửa")
public class TenantComplaintController {

    private final TenantComplaintService complaintService;

    @GetMapping
    @Operation(summary = "UC 18: Xem danh sách khiếu nại của tôi", description = "Lịch sử các phản ánh sự cố và tiến độ xử lý từ chủ trọ")
    public ResponseEntity<ResponseData<List<TenantComplaintResponse>>> getMyComplaints(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TenantComplaintResponse> list = complaintService.getMyComplaints(principal.getId());
        return ResponseEntity.ok(ResponseData.success(list));
    }

    @PostMapping
    @Operation(summary = "UC 18: Tạo khiếu nại / Báo hỏng mới", description = "Gửi sự cố thiết bị kèm phân loại, mức độ khẩn cấp, mô tả và ảnh hiện trạng")
    public ResponseEntity<ResponseData<TenantComplaintResponse>> createComplaint(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TenantComplaintRequest request) {
        TenantComplaintResponse response = complaintService.createComplaint(principal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Gửi phản ánh sự cố thành công!", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết khiếu nại", description = "Lấy chi tiết phản ánh sự cố và ghi chú từ chủ trọ")
    public ResponseEntity<ResponseData<TenantComplaintResponse>> getComplaintById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        TenantComplaintResponse response = complaintService.getComplaintById(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success(response));
    }

    @PostMapping("/{id}/rate")
    @Operation(summary = "UC 18: Đánh giá chất lượng sửa chữa", description = "Đánh giá 1-5 sao và nhận xét sau khi thợ khắc phục xong sự cố")
    public ResponseEntity<ResponseData<Void>> rateComplaint(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody RateComplaintRequest request) {
        complaintService.rateComplaint(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Đánh giá chất lượng sửa chữa thành công!", null));
    }
}
