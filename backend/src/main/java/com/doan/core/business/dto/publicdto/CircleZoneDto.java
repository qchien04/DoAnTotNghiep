package com.doan.core.business.dto.publicdto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Vùng khoanh tìm kiếm hình tròn theo tọa độ")
public class CircleZoneDto {

    @Schema(description = "Vĩ độ tâm vòng tròn", example = "21.028511")
    private Double latitude;

    @Schema(description = "Kinh độ tâm vòng tròn", example = "105.854444")
    private Double longitude;

    @Schema(description = "Bán kính tính bằng mét", example = "1500.0")
    private Double radiusInMeters;
}
