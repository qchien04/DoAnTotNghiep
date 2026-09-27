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
    private String province;
    private String ward;
    private String addressDetail;
    private String fullAddress;
    private List<String> imageUrls;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isPublic;
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

        String prov = room.getProvince() != null ? room.getProvince() : (room.getBuilding() != null ? room.getBuilding().getProvince() : null);
        String wrd = room.getWard() != null ? room.getWard() : (room.getBuilding() != null ? room.getBuilding().getWard() : null);
        String addr = room.getAddressDetail() != null ? room.getAddressDetail() : (room.getBuilding() != null ? room.getBuilding().getAddressDetail() : null);

        StringBuilder sb = new StringBuilder();
        if (addr != null && !addr.isBlank()) sb.append(addr);
        if (wrd != null && !wrd.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(wrd);
        }
        if (prov != null && !prov.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(prov);
        }

        java.math.BigDecimal lat = room.getLatitude() != null ? room.getLatitude() : (room.getBuilding() != null ? room.getBuilding().getLatitude() : null);
        java.math.BigDecimal lng = room.getLongitude() != null ? room.getLongitude() : (room.getBuilding() != null ? room.getBuilding().getLongitude() : null);

        return RoomResponse.builder()
                .id(room.getId())
                .buildingId(room.getBuilding() != null ? room.getBuilding().getId() : null)
                .buildingName(room.getBuilding() != null ? room.getBuilding().getName() : null)
                .province(prov)
                .ward(wrd)
                .addressDetail(addr)
                .fullAddress(sb.toString())
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
                .latitude(lat)
                .longitude(lng)
                .isPublic(room.getIsPublic() != null ? room.getIsPublic() : true)
                .createdAt(room.getCreatedAt())
                .build();
    }
}
