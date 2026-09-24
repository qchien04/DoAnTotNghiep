package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.building.BuildingRequest;
import com.doan.core.business.dto.landlord.building.BuildingResponse;
import com.doan.core.business.entity.Building;
import com.doan.core.business.entity.User;
import com.doan.core.business.repository.BuildingRepository;
import com.doan.core.business.repository.RoomRepository;
import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.service.LandlordBuildingService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordBuildingServiceImpl implements LandlordBuildingService {

    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BuildingResponse> getBuildings(Long landlordId, String keyword) {
        log.info("Lấy danh sách tòa nhà cho chủ trọ id: {}, từ khóa: {}", landlordId, keyword);
        List<Building> buildings;
        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            buildings = buildingRepository.searchBuildings(landlordId, pattern);
        } else {
            buildings = buildingRepository.findByLandlordId(landlordId);
        }

        // Tối ưu N+1: Lấy số liệu phòng của tất cả tòa nhà trong 1 truy vấn duy nhất
        List<Object[]> statsList = buildingRepository.getBuildingRoomStats(landlordId);
        Map<Long, long[]> statsMap = new HashMap<>();
        for (Object[] row : statsList) {
            Long bId = (Long) row[0];
            long total = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            long occupied = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            long available = row[3] != null ? ((Number) row[3]).longValue() : 0L;
            statsMap.put(bId, new long[]{total, occupied, available});
        }

        return buildings.stream()
                .map(b -> {
                    long[] stats = statsMap.getOrDefault(b.getId(), new long[]{0L, 0L, 0L});
                    return BuildingResponse.fromEntity(b, stats[0], stats[1], stats[2]);
                })
                .collect(Collectors.toList());
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
        String code = request.getBuildingCode();
        if (code == null || code.isBlank()) {
            code = "TN" + (System.currentTimeMillis() % 10000);
        } else {
            code = code.trim();
        }

        if (buildingRepository.existsByBuildingCode(code)) {
            code = code + "-" + (System.currentTimeMillis() % 1000);
        }

        log.info("Tạo mới tòa nhà mã: {} cho chủ trọ id: {}", code, landlordId);

        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Building building = Building.builder()
                .buildingCode(code)
                .landlord(landlord)
                .name(request.getName().trim())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .addressDetail(request.getAddressDetail().trim())
                .numFloors(request.getNumFloors())
                .generalRules(request.getGeneralRules())
                .isActive(true)
                .build();

        Building saved = buildingRepository.save(building);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BuildingResponse updateBuilding(Long landlordId, Long buildingId, BuildingRequest request) {
        log.info("Cập nhật tòa nhà id: {} cho chủ trọ id: {}", buildingId, landlordId);

        Building building = buildingRepository.findByIdAndLandlordId(buildingId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.BUILDING_NOT_FOUND));

        if (buildingRepository.existsByBuildingCodeAndIdNot(request.getBuildingCode().trim(), buildingId)) {
            throw new BaseException(ErrorCode.BUILDING_CODE_EXISTS);
        }

        building.setBuildingCode(request.getBuildingCode().trim());
        building.setName(request.getName().trim());
        building.setProvince(request.getProvince());
        building.setDistrict(request.getDistrict());
        building.setWard(request.getWard());
        building.setAddressDetail(request.getAddressDetail().trim());
        building.setNumFloors(request.getNumFloors());
        building.setGeneralRules(request.getGeneralRules());

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
        long occupiedCount = roomRepository.countByBuildingIdAndStatus(buildingId, "OCCUPIED");
        if (occupiedCount > 0) {
            throw new BaseException(ErrorCode.BUILDING_HAS_ACTIVE_ROOMS);
        }

        buildingRepository.delete(building);
    }

    private BuildingResponse mapToResponse(Building building) {
        long totalRooms = roomRepository.countByBuildingId(building.getId());
        long occupiedRooms = roomRepository.countByBuildingIdAndStatus(building.getId(), "OCCUPIED");
        long availableRooms = roomRepository.countByBuildingIdAndStatus(building.getId(), "AVAILABLE");

        return BuildingResponse.fromEntity(building, totalRooms, occupiedRooms, availableRooms);
    }
}
