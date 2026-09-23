package com.doan.core.business.controller.landlord;

import com.doan.core.business.dto.landlord.invoice.*;
import com.doan.core.business.service.LandlordInvoiceService;
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
@RequestMapping("/api/v1/landlord/invoices")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
@Tag(name = "7. Chủ trọ - Quản lý Hóa đơn & Thu tiền (UC 22 - 26)", description = "Xem hóa đơn, ghi chỉ số điện nước, điều chỉnh, hủy và xác nhận thanh toán")
public class LandlordInvoiceController {

    private final LandlordInvoiceService invoiceService;

    @GetMapping
    @Operation(summary = "UC 22: Xem danh sách hóa đơn tháng", description = "Lấy danh sách hóa đơn theo kỳ cước, tòa nhà hoặc trạng thái (UNPAID, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED)")
    public ResponseEntity<ResponseData<List<InvoiceResponse>>> getInvoices(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long buildingId,
            @RequestParam(required = false) String billingPeriod,
            @RequestParam(required = false) String status) {
        List<InvoiceResponse> invoices = invoiceService.getInvoices(principal.getId(), buildingId, billingPeriod, status);
        return ResponseEntity.ok(ResponseData.success(invoices));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết hóa đơn", description = "Lấy chi tiết bảng chiết tính tiền phòng, điện nước và dịch vụ")
    public ResponseEntity<ResponseData<InvoiceResponse>> getInvoiceById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        InvoiceResponse invoice = invoiceService.getInvoiceById(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success(invoice));
    }

    @PostMapping({"", "/meter-reading"})
    @Operation(summary = "UC 23: Ghi chỉ số công tơ và phát hành hóa đơn mới", description = "Nhập chỉ số điện nước mới, tự động tính tiền phòng + điện + nước + dịch vụ và xuất hóa đơn")
    public ResponseEntity<ResponseData<InvoiceResponse>> createInvoice(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MeterReadingInvoiceRequest request) {
        InvoiceResponse created = invoiceService.createInvoice(principal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Phát hành hóa đơn thành công!", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "UC 24: Cập nhật điều chỉnh hóa đơn", description = "Chỉnh sửa chỉ số điện nước hoặc phụ thu của hóa đơn chưa thanh toán")
    public ResponseEntity<ResponseData<InvoiceResponse>> updateInvoice(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody InvoiceUpdateRequest request) {
        InvoiceResponse updated = invoiceService.updateInvoice(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Cập nhật hóa đơn thành công!", updated));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "UC 25: Hủy hóa đơn", description = "Hủy hóa đơn lập sai kèm lý do hủy")
    public ResponseEntity<ResponseData<InvoiceResponse>> cancelInvoice(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody InvoiceCancelRequest request) {
        InvoiceResponse cancelled = invoiceService.cancelInvoice(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Hủy hóa đơn thành công!", cancelled));
    }

    @PostMapping({"/{id}/payment", "/{id}/confirm-payment"})
    @Operation(summary = "UC 26: Xác nhận thanh toán hóa đơn", description = "Ghi nhận thu tiền mặt / chuyển khoản / VietQR và gạch nợ hóa đơn")
    public ResponseEntity<ResponseData<InvoiceResponse>> confirmPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody InvoicePaymentRequest request) {
        InvoiceResponse paid = invoiceService.confirmPayment(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Xác nhận thanh toán thành công!", paid));
    }
}
