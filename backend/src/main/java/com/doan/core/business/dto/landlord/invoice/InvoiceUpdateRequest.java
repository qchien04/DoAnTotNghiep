package com.doan.core.business.dto.landlord.invoice;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Yêu cầu chỉnh sửa chỉ số hoặc chi phí hóa đơn chưa thanh toán")
public class InvoiceUpdateRequest {

    @Schema(description = "Hạn nộp tiền", example = "2026-11-05")
    private LocalDate dueDate;

    @Schema(description = "Chỉ số điện điều chỉnh", example = "1535")
    private Integer currentElectricIndex;

    @Schema(description = "Chỉ số nước điều chỉnh", example = "92")
    private Integer currentWaterIndex;

    @Schema(description = "Chi phí phát sinh khác", example = "0")
    private Long otherAmount;

    @Schema(description = "Ghi chú chi phí khác")
    private String otherNote;

    @Schema(description = "Danh sách chi tiết các khoản mục hóa đơn cập nhật")
    private List<MeterReadingInvoiceRequest.InvoiceItemRequest> items;
}
