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
    private String buildingCode;
    private String name;
    private String province;
    private String district;
    private String ward;
    private String addressDetail;
    private Integer numFloors;
    private String generalRules;
    private String commonAmenities;
    private java.util.List<String> amenities;
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

        java.util.List<String> amenitiesList = (building.getCommonAmenities() != null && !building.getCommonAmenities().isBlank())
                ? java.util.Arrays.stream(building.getCommonAmenities().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(java.util.stream.Collectors.toList())
                : java.util.List.of();

        return BuildingResponse.builder()
                .id(building.getId())
                .buildingCode(building.getBuildingCode())
                .name(building.getName())
                .province(building.getProvince())
                .district(building.getDistrict())
                .ward(building.getWard())
                .addressDetail(building.getAddressDetail())
                .numFloors(building.getNumFloors())
                .generalRules(building.getGeneralRules())
                .commonAmenities(building.getCommonAmenities())
                .amenities(amenitiesList)
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
