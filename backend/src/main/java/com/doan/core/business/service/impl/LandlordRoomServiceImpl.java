package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.room.RoomRequest;
import com.doan.core.business.dto.landlord.room.RoomResponse;
import com.doan.core.business.entity.Building;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.RoomImage;
import com.doan.core.business.repository.BuildingRepository;
import com.doan.core.business.repository.ContractRepository;
import com.doan.core.business.repository.RoomRepository;
import com.doan.core.business.service.LandlordRoomService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordRoomServiceImpl implements LandlordRoomService {

    private final RoomRepository roomRepository;
    private final BuildingRepository buildingRepository;
    private final ContractRepository contractRepository;
    private final com.doan.core.business.repository.UtilityServiceRepository utilityServiceRepository;
    private final com.doan.core.business.repository.UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getRooms(Long landlordId, Long buildingId, Integer floor, String status) {
        String normalizedStatus = status;
        if ("RENTED".equalsIgnoreCase(status)) {
            normalizedStatus = "OCCUPIED";
        } else if ("MAINTENANCE".equalsIgnoreCase(status)) {
            normalizedStatus = "UNDER_MAINTENANCE";
        } else if ("DISABLED".equalsIgnoreCase(status)) {
            normalizedStatus = "STOPPED";
        }
        log.info("Lấy danh sách phòng cho chủ trọ id: {}, tòa: {}, tầng: {}, trạng thái: {}", landlordId, buildingId, floor, normalizedStatus);
        List<Room> rooms = roomRepository.filterRooms(landlordId, buildingId, floor, normalizedStatus);

        return rooms.stream()
                .map(RoomResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long landlordId, Long roomId) {
        Room room = roomRepository.findByIdAndBuildingLandlordId(roomId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        return RoomResponse.fromEntity(room);
    }

    @Override
    @Transactional
    public RoomResponse createRoom(Long landlordId, RoomRequest request) {
        log.info("Tạo mới phòng trọ: {} tại tòa: {} cho chủ trọ: {}", request.getName(), request.getBuildingId(), landlordId);

        Building building = null;
        String province = request.getProvince();
        String ward = request.getWard();
        String addressDetail = request.getAddressDetail();

        if (request.getBuildingId() != null) {
            building = buildingRepository.findByIdAndLandlordId(request.getBuildingId(), landlordId)
                    .orElseThrow(() -> new BaseException(ErrorCode.BUILDING_NOT_FOUND));

            if (roomRepository.existsByBuildingIdAndName(request.getBuildingId(), request.getName().trim())) {
                throw new BaseException(ErrorCode.ROOM_CODE_EXISTS);
            }

            // Tự động fill địa chỉ từ tòa nhà nếu phòng chưa có địa chỉ riêng
            if (province == null || province.isBlank()) {
                province = building.getProvince();
            }
            if (ward == null || ward.isBlank()) {
                ward = building.getWard();
            }
            if (addressDetail == null || addressDetail.isBlank()) {
                addressDetail = building.getAddressDetail();
            }
        } else {
            // Phòng trọ độc lập
            if (roomRepository.existsByBuildingIsNullAndLandlordIdAndName(landlordId, request.getName().trim())) {
                throw new BaseException(ErrorCode.ROOM_CODE_EXISTS);
            }
        }

        com.doan.core.business.entity.User landlord = userRepository.findById(landlordId)
                .orElse(building != null ? building.getLandlord() : null);

        String amenitiesStr = (request.getAmenities() != null && !request.getAmenities().isEmpty())
                ? String.join(", ", request.getAmenities())
                : null;

        List<com.doan.core.business.entity.UtilityService> services = new ArrayList<>();
        if (request.getServiceIds() != null && !request.getServiceIds().isEmpty()) {
            services = utilityServiceRepository.findAllByIdInAndLandlordId(request.getServiceIds(), landlordId);
        }

        java.math.BigDecimal lat = request.getLatitude();
        java.math.BigDecimal lng = request.getLongitude();
        if (building != null) {
            if (lat == null) {
                lat = building.getLatitude();
            }
            if (lng == null) {
                lng = building.getLongitude();
            }
        }

        Room room = Room.builder()
                .building(building)
                .landlord(landlord)
                .province(province)
                .ward(ward)
                .addressDetail(addressDetail)
                .name(request.getName().trim())
                .floor(request.getFloor() != null ? request.getFloor() : 1)
                .area(request.getArea())
                .listedPrice(request.getListedPrice())
                .standardDeposit(request.getStandardDeposit())
                .maxCapacity(request.getMaxCapacity())
                .currentOccupancy(0)
                .furnishingLevel(request.getFurnishingLevel() != null ? request.getFurnishingLevel() : "BASIC")
                .amenities(amenitiesStr)
                .services(services)
                .description(request.getDescription())
                .status("AVAILABLE")
                .latitude(lat)
                .longitude(lng)
                .isPublic(request.getIsPublic() == null || Boolean.TRUE.equals(request.getIsPublic()))
                .build();

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<RoomImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                images.add(RoomImage.builder()
                        .room(room)
                        .imageUrl(request.getImageUrls().get(i))
                        .displayOrder(i)
                        .build());
            }
            room.setImages(images);
        }

        Room saved = roomRepository.save(room);
        return RoomResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long landlordId, Long roomId, RoomRequest request) {
        log.info("Cập nhật phòng trọ id: {} của chủ trọ: {}", roomId, landlordId);

        Room room = roomRepository.findByIdAndBuildingLandlordId(roomId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        Building building = null;
        if (request.getBuildingId() != null) {
            building = buildingRepository.findByIdAndLandlordId(request.getBuildingId(), landlordId)
                    .orElseThrow(() -> new BaseException(ErrorCode.BUILDING_NOT_FOUND));

            if (roomRepository.existsByBuildingIdAndNameAndIdNot(request.getBuildingId(), request.getName().trim(), roomId)) {
                throw new BaseException(ErrorCode.ROOM_CODE_EXISTS);
            }
        } else {
            if (roomRepository.existsByBuildingIsNullAndLandlordIdAndNameAndIdNot(landlordId, request.getName().trim(), roomId)) {
                throw new BaseException(ErrorCode.ROOM_CODE_EXISTS);
            }
        }

        // Ngoại lệ: Phòng đang có hợp đồng hiệu lực thì không được chuyển sang trạng thái "AVAILABLE"
        if ("AVAILABLE".equalsIgnoreCase(request.getStatus()) && !"AVAILABLE".equalsIgnoreCase(room.getStatus())) {
            boolean hasActiveContract = contractRepository.existsByRoomIdAndStatus(roomId, "ACTIVE");
            if (hasActiveContract) {
                throw new BaseException(ErrorCode.ROOM_HAS_ACTIVE_CONTRACT);
            }
        }

        room.setBuilding(building);
        if (request.getProvince() != null && !request.getProvince().isBlank()) {
            room.setProvince(request.getProvince());
        } else if (building != null) {
            room.setProvince(building.getProvince());
        }

        if (request.getWard() != null && !request.getWard().isBlank()) {
            room.setWard(request.getWard());
        } else if (building != null) {
            room.setWard(building.getWard());
        }

        if (request.getAddressDetail() != null && !request.getAddressDetail().isBlank()) {
            room.setAddressDetail(request.getAddressDetail());
        } else if (building != null) {
            room.setAddressDetail(building.getAddressDetail());
        }

        room.setName(request.getName().trim());
        room.setFloor(request.getFloor() != null ? request.getFloor() : 1);
        room.setArea(request.getArea());
        room.setListedPrice(request.getListedPrice());
        room.setStandardDeposit(request.getStandardDeposit());
        room.setMaxCapacity(request.getMaxCapacity());
        if (request.getFurnishingLevel() != null) {
            room.setFurnishingLevel(request.getFurnishingLevel());
        }
        if (request.getAmenities() != null) {
            room.setAmenities(String.join(", ", request.getAmenities()));
        }
        if (request.getServiceIds() != null) {
            List<com.doan.core.business.entity.UtilityService> updatedServices = utilityServiceRepository.findAllByIdInAndLandlordId(request.getServiceIds(), landlordId);
            room.setServices(updatedServices);
        }
        room.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }
        if (request.getLatitude() != null) {
            room.setLatitude(request.getLatitude());
        } else if (building != null && room.getLatitude() == null) {
            room.setLatitude(building.getLatitude());
        }

        if (request.getLongitude() != null) {
            room.setLongitude(request.getLongitude());
        } else if (building != null && room.getLongitude() == null) {
            room.setLongitude(building.getLongitude());
        }

        if (request.getIsPublic() != null) {
            room.setIsPublic(request.getIsPublic());
        }

        if (request.getImageUrls() != null) {
            room.getImages().clear();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                room.getImages().add(RoomImage.builder()
                        .room(room)
                        .imageUrl(request.getImageUrls().get(i))
                        .displayOrder(i)
                        .build());
            }
        }

        Room updated = roomRepository.save(room);
        return RoomResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteRoom(Long landlordId, Long roomId) {
        log.info("Xóa phòng trọ id: {} của chủ trọ: {}", roomId, landlordId);

        Room room = roomRepository.findByIdAndBuildingLandlordId(roomId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        // Kiểm tra lịch sử hợp đồng
        boolean hasContracts = contractRepository.existsByRoomIdAndStatus(roomId, "ACTIVE");
        if (hasContracts || !contractRepository.findByRoomId(roomId).isEmpty()) {
            throw new BaseException(ErrorCode.ROOM_HAS_HISTORY);
        }

        roomRepository.delete(room);
    }
}
