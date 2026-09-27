package com.doan.core.business.controller.tenant;

import com.doan.core.business.dto.tenant.TenantInvoiceResponse;
import com.doan.core.business.dto.tenant.TenantRoomResponse;
import com.doan.core.business.dto.tenant.VietQRPaymentResponse;
import com.doan.core.business.service.TenantRoomService;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tenant")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("isAuthenticated()")
@Tag(name = "12. Người thuê - Phòng trọ & Hóa đơn VietQR (UC 16 - 17)", description = "Liên kết phòng trọ, xem hợp đồng, tra cứu hóa đơn và thanh toán VietQR")
public class TenantRoomController {

    private final TenantRoomService tenantRoomService;

    @GetMapping("/my-room")
    @Operation(summary = "UC 16: Xem thông tin phòng trọ của tôi", description = "Lấy chi tiết phòng đang thuê, hợp đồng hiện tại và danh sách bạn cùng phòng")
    public ResponseEntity<ResponseData<TenantRoomResponse>> getMyRoomDetails(
            @AuthenticationPrincipal UserPrincipal principal) {
        TenantRoomResponse response = tenantRoomService.getMyRoomDetails(principal.getId());
        return ResponseEntity.ok(ResponseData.success(response));
    }

    @GetMapping({"/my-contracts", "/contracts"})
    @Operation(summary = "Xem lịch sử hợp đồng thuê phòng của tôi", description = "Lấy danh sách các hợp đồng hiện tại và hợp đồng trước đó")
    public ResponseEntity<ResponseData<List<com.doan.core.business.dto.tenant.TenantContractHistoryResponse>>> getMyContracts(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<com.doan.core.business.dto.tenant.TenantContractHistoryResponse> list = tenantRoomService.getMyContracts(principal.getId());
        return ResponseEntity.ok(ResponseData.success(list));
    }

    @PostMapping("/room-links/{id}/accept")
    @Operation(summary = "UC 16: Chấp nhận lời mời liên kết phòng", description = "Xác nhận liên kết tài khoản với phòng trọ và hợp đồng thuê")
    public ResponseEntity<ResponseData<Void>> acceptRoomLink(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        tenantRoomService.acceptRoomLink(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Đã chấp nhận liên kết phòng thành công!", null));
    }

    @PostMapping("/room-links/{id}/reject")
    @Operation(summary = "UC 16: Từ chối lời mời liên kết phòng", description = "Hủy lời mời liên kết kèm lý do")
    public ResponseEntity<ResponseData<Void>> rejectRoomLink(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "Tôi không thuê phòng này") String reason) {
        tenantRoomService.rejectRoomLink(principal.getId(), id, reason);
        return ResponseEntity.ok(ResponseData.success("Đã từ chối lời mời liên kết phòng!", null));
    }

    @GetMapping({"/my-invoices", "/my-bills"})
    @Operation(summary = "UC 17: Xem danh sách hóa đơn tiền phòng", description = "Lịch sử hóa đơn điện nước hàng tháng và trạng thái thanh toán")
    public ResponseEntity<ResponseData<List<TenantInvoiceResponse>>> getMyInvoices(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TenantInvoiceResponse> list = tenantRoomService.getMyInvoices(principal.getId());
        return ResponseEntity.ok(ResponseData.success(list));
    }

    @GetMapping({"/my-invoices/{id}/qr-payment", "/my-bills/{id}/qr-payment"})
    @Operation(summary = "UC 17: Lấy dữ liệu VietQR thanh toán", description = "Tạo mã QR thanh toán ngân hàng tự động kèm số tiền và cú pháp chuyển khoản")
    public ResponseEntity<ResponseData<VietQRPaymentResponse>> getVietQRInfo(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        VietQRPaymentResponse response = tenantRoomService.getVietQRInfo(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success(response));
    }

    @PostMapping({"/my-invoices/{id}/confirm-paid", "/my-bills/{id}/pay-completed"})
    @Operation(summary = "UC 17: Xác nhận đã chuyển khoản", description = "Gửi thông báo nhắc chủ nhà kiểm tra tài khoản và gạch nợ")
    public ResponseEntity<ResponseData<Void>> confirmTransferred(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        tenantRoomService.confirmTransferred(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Đã ghi nhận thông báo chuyển khoản, đang chờ chủ trọ duyệt!", null));
    }
}
