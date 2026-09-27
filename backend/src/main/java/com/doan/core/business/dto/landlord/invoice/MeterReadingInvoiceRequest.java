package com.doan.core.business.dto.landlord.invoice;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Schema(description = "Yêu cầu lập hóa đơn tiền phòng & ghi nhận các khoản mục chi phí")
public class MeterReadingInvoiceRequest {

    @Schema(description = "ID hợp đồng thuê (tùy chọn nếu đã truyền roomId)", example = "1")
    private Long contractId;

    @Schema(description = "ID phòng thuê (nếu không truyền contractId hệ thống sẽ tự tìm hợp đồng đang thuê của phòng này)", example = "1")
    private Long roomId;

    @NotBlank(message = "Kỳ cước không được để trống")
    @Schema(description = "Kỳ cước thu tiền (Tháng/Năm)", example = "10/2026")
    private String billingPeriod;

    @Schema(description = "Hạn nộp tiền phòng (nếu để trống mặc định sau 10 ngày)", example = "2026-11-05")
    private LocalDate dueDate;

    @Schema(description = "Chi phí phát sinh khác (nếu có)", example = "0")
    private Long otherAmount = 0L;

    @Schema(description = "Ghi chú chi phí phát sinh", example = "Phụ thu vệ sinh hành lang đột xuất")
    private String otherNote;

    @Schema(description = "Lưu dưới dạng bản nháp (DRAFT) chưa gửi cho người thuê", example = "false")
    private Boolean isDraft;

    @Schema(description = "Danh sách chi tiết các khoản mục dịch vụ trong hóa đơn (Invoice Items)")
    private List<InvoiceItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceItemRequest {
        private Long contractServiceId;
        private String itemType; // ROOM_RENT, SERVICE, SURCHARGE, DISCOUNT
        private String itemName;
        private String billingMethod;
        private Integer previousIndex;
        private Integer currentIndex;
        private BigDecimal quantity;
        private Long unitPrice;
        private Long amount;
        private String note;
    }
}
