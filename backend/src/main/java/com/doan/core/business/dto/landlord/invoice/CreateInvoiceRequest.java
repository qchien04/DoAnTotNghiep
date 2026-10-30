package com.doan.core.business.dto.landlord.invoice;

import com.doan.core.business.enums.AdjustmentType;
import com.doan.core.business.enums.BillingMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Schema(description = "Yêu cầu lập hóa đơn tiền phòng & ghi nhận chi phí theo hợp đồng")
public class CreateInvoiceRequest {

    @NotNull(message = "ID hợp đồng thuê không được để trống")
    @Schema(description = "ID hợp đồng thuê phòng", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long contractId;

    @NotBlank(message = "Kỳ cước không được để trống")
    @Schema(description = "Kỳ cước thu tiền (Tháng/Năm)", example = "10/2026")
    private String billingPeriod;

    @Schema(description = "Hạn nộp tiền phòng (nếu để trống mặc định sau 10 ngày)", example = "2026-11-05")
    private LocalDate dueDate;

    @Schema(description = "Lưu dưới dạng bản nháp (DRAFT) chưa gửi cho người thuê", example = "false")
    private Boolean isDraft;

    @Valid
    @Schema(description = "Danh sách chi tiết các khoản mục dịch vụ trong hóa đơn (Invoice Items)")
    private List<InvoiceItemRequest> items;

    @Valid
    @Schema(description = "Danh sách các khoản phụ thu & giảm trừ phát sinh (Adjustments)")
    private List<InvoiceAdjustmentRequest> adjustments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Thông tin chỉ số mới hoặc số lượng sử dụng của dịch vụ hợp đồng")
    public static class InvoiceItemRequest {
        @NotNull(message = "ID dịch vụ hợp đồng không được để trống")
        @Schema(description = "ID dịch vụ tiện ích trong hợp đồng", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        private Long contractServiceId;

        @Schema(description = "Chỉ số mới (chỉ áp dụng cho dịch vụ tính theo công tơ METER_INDEX)", example = "150")
        private Integer currentIndex;

        @PositiveOrZero(message = "Số lượng không được là số âm")
        @Schema(description = "Số lượng sử dụng (SL)", example = "1")
        private Integer quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Yêu cầu khoản phụ thu hoặc giảm trừ phát sinh")
    public static class InvoiceAdjustmentRequest {
        @NotNull(message = "Loại khoản phát sinh không được để trống")
        @Schema(description = "Loại: SURCHARGE (Phụ thu) hoặc DISCOUNT (Giảm trừ)", example = "SURCHARGE", requiredMode = Schema.RequiredMode.REQUIRED)
        private AdjustmentType type;

        @NotBlank(message = "Lý do / tên khoản phát sinh không được để trống")
        @Schema(description = "Lý do / tên khoản phát sinh", example = "Phí dọn vệ sinh phát sinh", requiredMode = Schema.RequiredMode.REQUIRED)
        private String reason;

        @PositiveOrZero(message = "Số lượng không được là số âm")
        @Schema(description = "Số lượng", example = "1")
        private Integer quantity;

        @PositiveOrZero(message = "Đơn giá không được là số âm")
        @Schema(description = "Đơn giá", example = "50000")
        private Long unitPrice;

        @Schema(description = "Thành tiền", example = "50000")
        private Long amount;

        public Long getAmount() {
            if (amount != null) return amount;
            if (unitPrice != null) {
                int q = quantity != null ? quantity : 1;
                return unitPrice * q;
            }
            return 0L;
        }

        @Schema(description = "Đơn vị tính", example = "lần")
        private String unit;

        @Schema(description = "Ghi chú", example = "Dọn rác đột xuất")
        private String note;
    }
}
