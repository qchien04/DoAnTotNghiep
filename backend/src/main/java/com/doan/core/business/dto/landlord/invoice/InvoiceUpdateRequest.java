package com.doan.core.business.dto.landlord.invoice;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Yêu cầu chỉnh sửa chỉ số hoặc chi phí hóa đơn chưa thanh toán")
public class InvoiceUpdateRequest {

    @Schema(description = "Hạn nộp tiền", example = "2026-11-05")
    private LocalDate dueDate;

    @NotNull(message = "Chỉ số điện mới không được để trống")
    @Schema(description = "Chỉ số điện điều chỉnh", example = "1535")
    private Integer currentElectricIndex;

    @NotNull(message = "Chỉ số nước mới không được để trống")
    @Schema(description = "Chỉ số nước điều chỉnh", example = "92")
    private Integer currentWaterIndex;

    @Schema(description = "Chi phí phát sinh khác", example = "0")
    private Long otherAmount;

    @Schema(description = "Ghi chú chi phí khác")
    private String otherNote;
}
