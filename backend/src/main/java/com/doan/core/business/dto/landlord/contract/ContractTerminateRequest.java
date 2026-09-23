package com.doan.core.business.dto.landlord.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu thanh lý hợp đồng và nghiệm thu trả phòng")
public class ContractTerminateRequest {

    @NotNull(message = "Chỉ số điện ngày trả không được để trống")
    @Schema(description = "Chỉ số điện chốt ngày bàn giao phòng", example = "1050")
    private Integer finalElectricIndex;

    @NotNull(message = "Chỉ số nước ngày trả không được để trống")
    @Schema(description = "Chỉ số nước chốt ngày bàn giao phòng", example = "68")
    private Integer finalWaterIndex;

    @Schema(description = "Tiền đền bù hư hỏng tài sản (nếu có)", example = "300000")
    private Long damageCost = 0L;

    @Schema(description = "Chi tiết biên bản kiểm kê hư hỏng thiết bị", example = "Sửa bản lề tủ 200k, mất thẻ từ 100k")
    private String damageNote;
}
