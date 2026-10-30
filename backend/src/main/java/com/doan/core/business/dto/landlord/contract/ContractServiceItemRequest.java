package com.doan.core.business.dto.landlord.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dịch vụ tiện ích áp dụng trong hợp đồng kèm chỉ số ban đầu")
public class ContractServiceItemRequest {

    @NotNull(message = "ID dịch vụ không được để trống")
    @Schema(description = "ID dịch vụ tiện ích của chủ trọ", example = "1")
    private Long serviceId;

    @Min(value = 0, message = "Chỉ số bàn giao ban đầu không được là số âm")
    @Builder.Default
    @Schema(description = "Chỉ số bàn giao ban đầu cho dịch vụ tính theo đồng hồ (kWh, m3)", example = "0")
    private Integer initialIndex = 0;
}
