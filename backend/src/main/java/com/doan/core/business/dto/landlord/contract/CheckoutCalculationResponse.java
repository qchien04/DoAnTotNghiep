package com.doan.core.business.dto.landlord.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Bảng quyết toán tài chính hoàn cọc thanh lý hợp đồng")
public class CheckoutCalculationResponse {

    @Schema(description = "Tiền cọc giữ ban đầu", example = "3500000")
    private Long initialDeposit;

    @Schema(description = "Số điện tiêu thụ ngày cuối", example = "25")
    private Integer electricConsumed;

    @Schema(description = "Tiền điện ngày cuối", example = "95000")
    private Long electricAmount;

    @Schema(description = "Số khối nước tiêu thụ ngày cuối", example = "2")
    private Integer waterConsumed;

    @Schema(description = "Tiền nước ngày cuối", example = "60000")
    private Long waterAmount;

    @Schema(description = "Tổng chi phí điện nước cuối kỳ", example = "155000")
    private Long totalUtilityCost;

    @Schema(description = "Tiền đền bù hư hại tài sản", example = "300000")
    private Long damageCost;

    @Schema(description = "Ghi chú hư hại", example = "Sửa tủ + Thẻ từ")
    private String damageNote;

    @Schema(description = "Số tiền thực tế hoàn trả khách (nếu âm nghĩa là khách phải nộp thêm)", example = "3045000")
    private Long netRefundAmount;
}
