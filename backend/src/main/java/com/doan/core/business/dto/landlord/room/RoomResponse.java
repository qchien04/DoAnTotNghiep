package com.doan.core.business.dto.landlord.room;

import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.RoomImage;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết phòng trọ")
public class RoomResponse {

    private Long id;
    private Long buildingId;
    private String buildingName;
    private String buildingCode;
    private String roomCode;
    private String name;
    private Integer floor;
    private BigDecimal area;
    private Long listedPrice;
    private Long standardDeposit;
    private Integer maxCapacity;
    private Integer currentOccupancy;
    private String furnishingLevel;
    private List<String> amenities;
    private List<Long> serviceIds;
    private List<com.doan.core.business.dto.landlord.service.UtilityServiceResponse> services;
    private String description;
    private String status;
    private List<String> imageUrls;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime createdAt;

    public static RoomResponse fromEntity(Room room) {
        if (room == null) return null;

        List<String> images = room.getImages() != null
                ? room.getImages().stream().map(RoomImage::getImageUrl).collect(Collectors.toList())
                : List.of();

        List<String> amenityList = (room.getAmenities() != null && !room.getAmenities().isBlank())
                ? java.util.Arrays.stream(room.getAmenities().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList())
                : List.of();

        List<Long> sIds = room.getServices() != null
                ? room.getServices().stream().map(com.doan.core.business.entity.UtilityService::getId).collect(Collectors.toList())
                : List.of();

        List<com.doan.core.business.dto.landlord.service.UtilityServiceResponse> serviceResponses = room.getServices() != null
                ? room.getServices().stream().map(com.doan.core.business.dto.landlord.service.UtilityServiceResponse::fromEntity).collect(Collectors.toList())
                : List.of();

        return RoomResponse.builder()
                .id(room.getId())
                .buildingId(room.getBuilding() != null ? room.getBuilding().getId() : null)
                .buildingName(room.getBuilding() != null ? room.getBuilding().getName() : null)
                .buildingCode(room.getBuilding() != null ? room.getBuilding().getBuildingCode() : null)
                .roomCode(room.getRoomCode())
                .name(room.getName())
                .floor(room.getFloor())
                .area(room.getArea())
                .listedPrice(room.getListedPrice())
                .standardDeposit(room.getStandardDeposit())
                .maxCapacity(room.getMaxCapacity())
                .currentOccupancy(room.getCurrentOccupancy())
                .furnishingLevel(room.getFurnishingLevel())
                .amenities(amenityList)
                .serviceIds(sIds)
                .services(serviceResponses)
                .description(room.getDescription())
                .status(room.getStatus())
                .imageUrls(images)
                .latitude(room.getLatitude())
                .longitude(room.getLongitude())
                .createdAt(room.getCreatedAt())
                .build();
    }
}
