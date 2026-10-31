package com.doan.core.business.dto.landlord.building;

import com.doan.core.business.entity.Building;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết tòa nhà kèm thống kê số phòng")
public class BuildingResponse {

    private Long id;
    private String name;
    private String province;
    private String ward;
    private Integer provinceId;
    private Integer wardId;
    private String provinceName;
    private String wardName;
    private String addressDetail;
    private Integer numFloors;
    private String generalRules;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isActive;
    private LocalDateTime createdAt;

    @Schema(description = "Tổng số phòng của tòa nhà", example = "20")
    private Long totalRooms;

    @Schema(description = "Số phòng đang có khách thuê", example = "16")
    private Long occupiedRooms;

    @Schema(description = "Số phòng còn trống sẵn sàng cho thuê", example = "4")
    private Long availableRooms;

    public static BuildingResponse fromEntity(Building building, long totalRooms, long occupiedRooms, long availableRooms) {
        if (building == null) return null;

        String provName = building.getProvinceId() != null 
                ? com.doan.core.common.constant.VietnamLocationConstants.getProvinceName(building.getProvinceId())
                : building.getProvince();
        String wrdName = building.getWardId() != null
                ? com.doan.core.common.constant.VietnamLocationConstants.getWardName(building.getWardId())
                : building.getWard();

        return BuildingResponse.builder()
                .id(building.getId())
                .name(building.getName())
                .province(provName)
                .ward(wrdName)
                .provinceId(building.getProvinceId())
                .wardId(building.getWardId())
                .provinceName(provName)
                .wardName(wrdName)
                .addressDetail(building.getAddressDetail())
                .numFloors(building.getNumFloors())
                .generalRules(building.getGeneralRules())
                .latitude(building.getLatitude())
                .longitude(building.getLongitude())
                .isActive(building.getIsActive())
                .createdAt(building.getCreatedAt())
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .availableRooms(availableRooms)
                .build();
    }
}
