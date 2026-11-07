package com.doan.core.business.dto.landlord.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Bảng quyết toán tài chính hoàn cọc thanh lý hợp đồng")
public class CheckoutCalculationResponse {

    @Schema(description = "Tiền cọc giữ ban đầu", example = "3500000")
    private Long initialDeposit;

    @Schema(description = "Tổng chi phí dịch vụ công tơ cuối kỳ", example = "155000")
    private Long totalUtilityCost;

    @Schema(description = "Chi tiết quyết toán từng dịch vụ công tơ (METER_INDEX)")
    private List<ServiceSettlementItem> settlements;

    @Schema(description = "Tiền đền bù hư hại tài sản", example = "300000")
    private Long damageCost;

    @Schema(description = "Ghi chú hư hại", example = "Sửa tủ + Thẻ từ")
    private String damageNote;

    @Schema(description = "Số tiền thực tế hoàn trả khách (nếu âm nghĩa là khách phải nộp thêm)", example = "3045000")
    private Long netRefundAmount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceSettlementItem {
        private Long contractServiceId;
        private String serviceName;
        private String unit;
        private Integer startIndex;
        private Integer endIndex;
        private Integer consumed;
        private Long unitPrice;
        private Long amount;
    }
}
