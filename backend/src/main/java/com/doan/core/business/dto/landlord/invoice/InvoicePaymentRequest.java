package com.doan.core.business.dto.landlord.invoice;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu xác nhận thu tiền hóa đơn")
public class InvoicePaymentRequest {

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @Min(value = 1, message = "Số tiền thanh toán phải lớn hơn 0")
    @Schema(description = "Số tiền khách thực tế thanh toán", example = "4707000")
    private Long paymentAmount;

    @Schema(description = "Hình thức thanh toán (CASH, BANK_TRANSFER, VIETQR)", example = "BANK_TRANSFER")
    private String paymentMethod = "BANK_TRANSFER";

    @Schema(description = "Ghi chú thanh toán", example = "Đã nhận chuyển khoản qua MB Bank")
    private String paymentNote;
}
