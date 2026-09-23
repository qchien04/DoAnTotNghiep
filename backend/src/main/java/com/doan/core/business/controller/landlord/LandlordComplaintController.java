package com.doan.core.business.controller.landlord;

import com.doan.core.business.dto.landlord.complaint.ComplaintHandleRequest;
import com.doan.core.business.dto.landlord.complaint.ComplaintResponse;
import com.doan.core.business.service.LandlordComplaintService;
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
@RequestMapping("/api/v1/landlord/complaints")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
@Tag(name = "8. Chủ trọ - Khiếu nại & Báo hỏng (UC 27 - 28)", description = "Xem danh sách phản ánh báo hỏng và cập nhật tiến độ xử lý")
public class LandlordComplaintController {

    private final LandlordComplaintService complaintService;

    @GetMapping
    @Operation(summary = "UC 27: Xem danh sách khiếu nại của khách thuê", description = "Lấy danh sách các sự cố báo hỏng thiết bị, điện nước, an ninh kèm hình ảnh")
    public ResponseEntity<ResponseData<List<ComplaintResponse>>> getComplaints(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long buildingId,
            @RequestParam(required = false) String status) {
        List<ComplaintResponse> complaints = complaintService.getComplaints(principal.getId(), buildingId, status);
        return ResponseEntity.ok(ResponseData.success(complaints));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết khiếu nại", description = "Lấy thông tin chi tiết và lịch sử xử lý của khiếu nại")
    public ResponseEntity<ResponseData<ComplaintResponse>> getComplaintById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ComplaintResponse complaint = complaintService.getComplaintById(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success(complaint));
    }

    @PutMapping({"/{id}/handle", "/{id}/progress"})
    @Operation(summary = "UC 28: Xử lý và cập nhật tiến độ khiếu nại", description = "Chuyển trạng thái (PROCESSING, RESOLVED, REJECTED) và gửi thông báo phản hồi cho khách thuê")
    public ResponseEntity<ResponseData<ComplaintResponse>> handleComplaint(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ComplaintHandleRequest request) {
        ComplaintResponse updated = complaintService.handleComplaint(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Cập nhật tiến độ xử lý khiếu nại thành công!", updated));
    }
}
