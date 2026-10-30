package com.doan.core.business.dto.landlord.invoice;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Yêu cầu chỉnh sửa chỉ số hoặc chi phí hóa đơn chưa thanh toán")
public class InvoiceUpdateRequest {

    @Schema(description = "Hạn nộp tiền", example = "2026-11-05")
    private LocalDate dueDate;

    @Valid
    @Schema(description = "Danh sách chi tiết các khoản mục hóa đơn cập nhật")
    private List<CreateInvoiceRequest.InvoiceItemRequest> items;

    @Valid
    @Schema(description = "Danh sách các khoản phụ thu & giảm trừ cập nhật")
    private List<CreateInvoiceRequest.InvoiceAdjustmentRequest> adjustments;
}
