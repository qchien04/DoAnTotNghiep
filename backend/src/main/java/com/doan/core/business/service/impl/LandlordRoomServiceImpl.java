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
        log.info("Tạo mới phòng trọ: {} tại tòa: {} cho chủ trọ: {}", request.getRoomCode(), request.getBuildingId(), landlordId);

        Building building = buildingRepository.findByIdAndLandlordId(request.getBuildingId(), landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.BUILDING_NOT_FOUND));

        if (roomRepository.existsByBuildingIdAndRoomCode(request.getBuildingId(), request.getRoomCode().trim())) {
            throw new BaseException(ErrorCode.ROOM_CODE_EXISTS);
        }

        String amenitiesStr = (request.getAmenities() != null && !request.getAmenities().isEmpty())
                ? String.join(", ", request.getAmenities())
                : null;

        List<com.doan.core.business.entity.UtilityService> services = new ArrayList<>();
        if (request.getServiceIds() != null && !request.getServiceIds().isEmpty()) {
            services = utilityServiceRepository.findAllByIdInAndLandlordId(request.getServiceIds(), landlordId);
        }

        Room room = Room.builder()
                .building(building)
                .roomCode(request.getRoomCode().trim())
                .name(request.getName().trim())
                .floor(request.getFloor())
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
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
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

        if (roomRepository.existsByBuildingIdAndRoomCodeAndIdNot(room.getBuilding().getId(), request.getRoomCode().trim(), roomId)) {
            throw new BaseException(ErrorCode.ROOM_CODE_EXISTS);
        }

        // Ngoại lệ: Phòng đang có hợp đồng hiệu lực thì không được chuyển sang trạng thái "AVAILABLE"
        if ("AVAILABLE".equalsIgnoreCase(request.getStatus()) && !"AVAILABLE".equalsIgnoreCase(room.getStatus())) {
            boolean hasActiveContract = contractRepository.existsByRoomIdAndStatus(roomId, "ACTIVE");
            if (hasActiveContract) {
                throw new BaseException(ErrorCode.ROOM_HAS_ACTIVE_CONTRACT);
            }
        }

        room.setRoomCode(request.getRoomCode().trim());
        room.setName(request.getName().trim());
        room.setFloor(request.getFloor());
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
        room.setLatitude(request.getLatitude());
        room.setLongitude(request.getLongitude());

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
