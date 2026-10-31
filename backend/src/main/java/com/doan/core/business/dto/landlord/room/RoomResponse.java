package com.doan.core.business.dto.landlord.room;

import com.doan.core.business.dto.amenity.AmenityResponse;
import com.doan.core.business.dto.landlord.service.UtilityServiceResponse;
import com.doan.core.business.entity.Amenity;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.RoomImage;
import com.doan.core.business.enums.RoomStatus;

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
        private List<AmenityResponse> amenityDetails;
        private List<Long> serviceIds;
        private List<UtilityServiceResponse> services;
        private String description;
        private RoomStatus status;
        private Integer provinceId;
        private Integer wardId;
        private Integer amenitiesMask;
        private String addressDetail;
        private String coverImageUrl;
        private List<String> imageUrls;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Boolean isPublic;
        private String landlordName;
        private String landlordPhone;
        private LocalDateTime createdAt;

        public static RoomResponse fromEntity(Room room) {
                if (room == null)
                        return null;

                List<String> images = room.getImages() != null
                                ? room.getImages().stream().map(RoomImage::getImageUrl).collect(Collectors.toList())
                                : List.of();

                String cover = room.getCoverImageUrl();
                if ((cover == null || cover.isBlank()) && !images.isEmpty()) {
                        cover = images.get(0);
                }
                if (images.isEmpty() && cover != null && !cover.isBlank()) {
                        images = List.of(cover);
                }

                final Integer mask = room.getAmenitiesMask() != null ? room.getAmenitiesMask() : 0;
                List<String> amenityList = com.doan.core.common.constant.RoomAmenityConstants.decode(mask);

                List<AmenityResponse> amenityDetails = com.doan.core.common.constant.RoomAmenityConstants.ALL_AMENITIES.stream()
                                .filter(a -> (mask & a.bitValue()) != 0)
                                .map(a -> AmenityResponse.builder()
                                                .id((long) (a.bitIndex() + 1))
                                                .name(a.name())
                                                .description(a.key())
                                                .build())
                                .collect(Collectors.toList());

                List<Long> sIds = room.getServices() != null
                                ? room.getServices().stream().map(com.doan.core.business.entity.UtilityService::getId)
                                                .collect(Collectors.toList())
                                : List.of();

                List<com.doan.core.business.dto.landlord.service.UtilityServiceResponse> serviceResponses = room
                                .getServices() != null
                                                ? room.getServices().stream()
                                                                .map(com.doan.core.business.dto.landlord.service.UtilityServiceResponse::fromEntity)
                                                                .collect(Collectors.toList())
                                                : List.of();

                Integer provId = room.getProvinceId() != null ? room.getProvinceId()
                                : (room.getBuilding() != null ? room.getBuilding().getProvinceId() : null);
                Integer wrdId = room.getWardId() != null ? room.getWardId()
                                : (room.getBuilding() != null ? room.getBuilding().getWardId() : null);

                String addr = room.getAddressDetail() != null ? room.getAddressDetail()
                                : (room.getBuilding() != null ? room.getBuilding().getAddressDetail() : null);

                java.math.BigDecimal lat = room.getLatitude() != null ? room.getLatitude()
                                : (room.getBuilding() != null ? room.getBuilding().getLatitude() : null);
                java.math.BigDecimal lng = room.getLongitude() != null ? room.getLongitude()
                                : (room.getBuilding() != null ? room.getBuilding().getLongitude() : null);

                String landlordName = null;
                String landlordPhone = null;
                if (room.getBuilding() != null && room.getBuilding().getLandlord() != null) {
                        landlordName = room.getBuilding().getLandlord().getFullName();
                        landlordPhone = room.getBuilding().getLandlord().getPhone();
                }

                return RoomResponse.builder()
                                .id(room.getId())
                                .buildingId(room.getBuilding() != null ? room.getBuilding().getId() : null)
                                .buildingName(room.getBuilding() != null ? room.getBuilding().getName() : null)
                                .provinceId(provId)
                                .wardId(wrdId)
                                .amenitiesMask(mask)
                                .addressDetail(addr)
                                .name(room.getName())
                                .floor(room.getFloor())
                                .area(room.getArea())
                                .listedPrice(room.getListedPrice())
                                .standardDeposit(room.getStandardDeposit())
                                .maxCapacity(room.getMaxCapacity())
                                .currentOccupancy(room.getCurrentOccupancy())
                                .furnishingLevel(room.getFurnishingLevel())
                                .amenities(amenityList)
                                .amenityDetails(amenityDetails)
                                .serviceIds(sIds)
                                .services(serviceResponses)
                                .description(room.getDescription())
                                .status(room.getStatus())
                                .coverImageUrl(cover)
                                .imageUrls(images)
                                .latitude(lat)
                                .longitude(lng)
                                .isPublic(room.getIsPublic())
                                .landlordName(landlordName)
                                .landlordPhone(landlordPhone)
                                .createdAt(room.getCreatedAt())
                                .build();
        }
}
