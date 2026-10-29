package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.building.BuildingRequest;
import com.doan.core.business.dto.landlord.building.BuildingResponse;
import com.doan.core.business.entity.Building;
import com.doan.core.business.enums.RoomStatus;
import com.doan.core.business.entity.User;
import com.doan.core.business.repository.BuildingRepository;
import com.doan.core.business.repository.RoomRepository;
import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.service.LandlordBuildingService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordBuildingServiceImpl implements LandlordBuildingService {

    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BuildingResponse> getBuildings(Long landlordId, String keyword, int page, int size,
            String sortBy, String sortDirection) {
        log.info("Lấy danh sách tòa nhà cho chủ trọ id: {}, từ khóa: {}", landlordId, keyword);
        String kw = (keyword != null && !keyword.trim().isBlank()) ? keyword.trim() : null;

        org.springframework.data.domain.Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? org.springframework.data.domain.Sort.Direction.ASC
                : org.springframework.data.domain.Sort.Direction.DESC;
        String sortProperty = switch (sortBy != null ? sortBy.toLowerCase() : "id") {
            case "name" -> "name";
            case "numfloors" -> "numFloors";
            case "createdat" -> "createdAt";
            default -> "id";
        };
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(direction, sortProperty);

        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Page<Building> buildingsPage = buildingRepository.filterBuildings(landlordId, kw, pageable);

        // Tối ưu N+1: Lấy số liệu phòng của tất cả tòa nhà trong 1 truy vấn duy nhất
        List<Object[]> statsList = buildingRepository.getBuildingRoomStats(landlordId);
        Map<Long, long[]> statsMap = new HashMap<>();
        for (Object[] row : statsList) {
            Long bId = (Long) row[0];
            long total = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            long occupied = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            long available = row[3] != null ? ((Number) row[3]).longValue() : 0L;
            statsMap.put(bId, new long[] { total, occupied, available });
        }

        Page<BuildingResponse> dtoPage = buildingsPage.map(b -> {
            long[] stats = statsMap.getOrDefault(b.getId(), new long[] { 0L, 0L, 0L });
            return BuildingResponse.fromEntity(b, stats[0], stats[1], stats[2]);
        });

        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public BuildingResponse getBuildingById(Long landlordId, Long buildingId) {
        Building building = buildingRepository.findByIdAndLandlordId(buildingId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.BUILDING_NOT_FOUND));

        return mapToResponse(building);
    }

    @Override
    @Transactional
    public BuildingResponse createBuilding(Long landlordId, BuildingRequest request) {
        log.info("Tạo mới tòa nhà tên: {} cho chủ trọ id: {}", request.getName(), landlordId);

        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Tên tòa nhà không được để trống");
        }
        if (request.getAddressDetail() == null || request.getAddressDetail().trim().isBlank()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Địa chỉ chi tiết không được để trống");
        }
        if (request.getNumFloors() != null && request.getNumFloors() <= 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Số tầng tòa nhà phải lớn hơn 0");
        }

        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Building building = Building.builder()
                .landlord(landlord)
                .name(request.getName().trim())
                .province(request.getProvince())
                .ward(request.getWard())
                .addressDetail(request.getAddressDetail().trim())
                .numFloors(request.getNumFloors())
                .generalRules(request.getGeneralRules())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isActive(true)
                .build();

        Building saved = buildingRepository.save(building);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BuildingResponse updateBuilding(Long landlordId, Long buildingId, BuildingRequest request) {
        log.info("Cập nhật tòa nhà id: {} cho chủ trọ id: {}", buildingId, landlordId);

        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Tên tòa nhà không được để trống");
        }
        if (request.getAddressDetail() == null || request.getAddressDetail().trim().isBlank()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Địa chỉ chi tiết không được để trống");
        }
        if (request.getNumFloors() != null && request.getNumFloors() <= 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Số tầng tòa nhà phải lớn hơn 0");
        }

        Building building = buildingRepository.findByIdAndLandlordId(buildingId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.BUILDING_NOT_FOUND));

        building.setName(request.getName().trim());
        building.setProvince(request.getProvince());
        building.setWard(request.getWard());
        building.setAddressDetail(request.getAddressDetail().trim());
        building.setNumFloors(request.getNumFloors());
        building.setGeneralRules(request.getGeneralRules());
        if (request.getLatitude() != null) {
            building.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            building.setLongitude(request.getLongitude());
        }

        Building updated = buildingRepository.save(building);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteBuilding(Long landlordId, Long buildingId) {
        log.info("Xóa tòa nhà id: {} của chủ trọ: {}", buildingId, landlordId);

        Building building = buildingRepository.findByIdAndLandlordId(buildingId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.BUILDING_NOT_FOUND));

        // Kiểm tra xem tòa nhà có phòng đang có khách thuê hay không
        long occupiedCount = roomRepository.countByBuildingIdAndStatus(buildingId, RoomStatus.OCCUPIED);
        if (occupiedCount > 0) {
            throw new BaseException(ErrorCode.BUILDING_HAS_ACTIVE_ROOMS);
        }

        buildingRepository.delete(building);
    }

    private BuildingResponse mapToResponse(Building building) {
        long totalRooms = roomRepository.countByBuildingId(building.getId());
        long occupiedRooms = roomRepository.countByBuildingIdAndStatus(building.getId(), RoomStatus.OCCUPIED);
        long availableRooms = roomRepository.countByBuildingIdAndStatus(building.getId(), RoomStatus.AVAILABLE);

        return BuildingResponse.fromEntity(building, totalRooms, occupiedRooms, availableRooms);
    }
}
