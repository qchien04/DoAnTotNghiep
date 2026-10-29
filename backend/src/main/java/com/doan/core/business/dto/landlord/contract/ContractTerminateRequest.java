package com.doan.core.business.dto.landlord.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Schema(description = "Yêu cầu thanh lý hợp đồng và nghiệm thu trả phòng")
public class ContractTerminateRequest {

    @Schema(description = "Danh sách chỉ số công tơ chốt cuối kỳ cho các dịch vụ METER_INDEX")
    private List<MeterReadingItem> meterReadings;

    @Schema(description = "Tiền đền bù hư hỏng tài sản (nếu có)", example = "300000")
    private Long damageCost = 0L;

    @Schema(description = "Chi tiết biên bản kiểm kê hư hỏng thiết bị", example = "Sửa bản lề tủ 200k, mất thẻ từ 100k")
    private String damageNote;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeterReadingItem {
        @Schema(description = "ID dịch vụ hợp đồng (contract_services.id)", example = "1")
        private Long contractServiceId;

        @Schema(description = "Chỉ số chốt ngày trả phòng", example = "1050")
        private Integer finalIndex;
    }
}
