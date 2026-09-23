package com.doan.core.business.dto.landlord.invoice;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu hủy hóa đơn lập sai")
public class InvoiceCancelRequest {

    @NotBlank(message = "Lý do hủy hóa đơn không được để trống")
    @Schema(description = "Lý do hủy hóa đơn", example = "Lập nhầm chỉ số cho phòng khác")
    private String cancelReason;
}
