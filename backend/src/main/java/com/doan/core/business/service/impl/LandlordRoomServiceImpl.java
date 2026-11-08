package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.room.RoomImageUploadResponse;
import com.doan.core.business.dto.landlord.room.RoomRequest;
import com.doan.core.business.dto.landlord.room.RoomResponse;
import com.doan.core.business.dto.kyc.StoredFileInfo;
import com.doan.core.business.dto.room.RoomRiskEvaluationResult;
import com.doan.core.business.entity.Building;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.RoomImage;
import com.doan.core.business.entity.User;
import com.doan.core.business.entity.UtilityService;
import com.doan.core.business.enums.ContractStatus;
import com.doan.core.business.enums.RoomStatus;
import com.doan.core.business.repository.BuildingRepository;
import com.doan.core.business.repository.ContractRepository;
import com.doan.core.business.repository.RoomImageRepository;
import com.doan.core.business.repository.RoomRepository;
import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.repository.UtilityServiceRepository;
import com.doan.core.business.service.LandlordRoomService;
import com.doan.core.business.service.RoomRiskScoringService;
import com.doan.core.business.service.SecureStorageService;
import com.doan.core.common.constant.VietnamLocationConstants;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import com.doan.core.common.util.ImageHashUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordRoomServiceImpl implements LandlordRoomService {

    private final RoomRepository roomRepository;
    private final BuildingRepository buildingRepository;
    private final ContractRepository contractRepository;
    private final UtilityServiceRepository utilityServiceRepository;
    private final UserRepository userRepository;
    private final RoomImageRepository roomImageRepository;
    private final RoomRiskScoringService roomRiskScoringService;
    private final SecureStorageService secureStorageService;
    private final ObjectMapper objectMapper;
    private final com.doan.core.business.service.RoomAuditLogService roomAuditLogService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoomResponse> getRooms(Long landlordId, Long buildingId, Integer floor, RoomStatus status,
            String keyword, int page, int size, String sortBy, String sortDirection) {
        String kw = (keyword != null && !keyword.trim().isBlank()) ? keyword.trim() : null;

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        String sortProperty = switch (sortBy != null ? sortBy.toLowerCase() : "id") {
            case "name" -> "name";
            case "listedprice", "price" -> "listedPrice";
            case "area" -> "area";
            case "floor" -> "floor";
            case "status" -> "status";
            default -> "id";
        };
        Sort sort = Sort.by(direction, sortProperty);

        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        log.info("Lấy danh sách phòng cho chủ trọ id: {}, tòa: {}, tầng: {}, trạng thái: {}, keyword: {}, pageable: {}",
                landlordId, buildingId, floor, status, kw, pageable);
        Page<Room> rooms = roomRepository.filterRooms(landlordId, buildingId, floor, status, kw, pageable);

        Page<RoomResponse> dtoPage = rooms.map(RoomResponse::fromEntity);
        return PageResponse.from(dtoPage);
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
        log.info("Tạo mới phòng trọ: {} tại tòa: {} cho chủ trọ: {}", request.getName(), request.getBuildingId(),
                landlordId);

        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Tên phòng không được để trống");
        }
        if (request.getListedPrice() == null || request.getListedPrice() <= 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Giá thuê phòng phải lớn hơn 0");
        }
        if (request.getStandardDeposit() != null && request.getStandardDeposit() < 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Tiền cọc phòng không được là số âm");
        }
        if (request.getMaxCapacity() != null && request.getMaxCapacity() <= 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Sức chứa tối đa của phòng phải lớn hơn 0");
        }
        if (request.getArea() != null && request.getArea().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Diện tích phòng phải lớn hơn 0");
        }

        com.doan.core.business.entity.User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Building building = null;
        String addressDetail = request.getAddressDetail();
        Integer provinceId = request.getProvinceId();
        Integer wardId = request.getWardId();

        if (request.getBuildingId() != null) {
            building = buildingRepository.findByIdAndLandlordId(request.getBuildingId(), landlordId)
                    .orElseThrow(() -> new BaseException(ErrorCode.BUILDING_NOT_FOUND));

            if (roomRepository.existsByBuildingIdAndName(request.getBuildingId(), request.getName().trim())) {
                throw new BaseException(ErrorCode.ROOM_CODE_EXISTS);
            }

            // Tự động fill địa chỉ từ tòa nhà nếu phòng chưa có địa chỉ riêng
            if (addressDetail == null || addressDetail.isBlank()) {
                addressDetail = building.getAddressDetail();
            }
            if (provinceId == null) {
                provinceId = building.getProvinceId();
            }
            if (wardId == null) {
                wardId = building.getWardId();
            }
        } else {
            // Phòng trọ độc lập
            if (roomRepository.existsByBuildingIsNullAndLandlordIdAndName(landlordId, request.getName().trim())) {
                throw new BaseException(ErrorCode.ROOM_CODE_EXISTS);
            }
        }

        VietnamLocationConstants.validateLocation(provinceId, wardId);

        int amenitiesMask = 0;
        if (request.getAmenitiesMask() != null) {
            amenitiesMask = request.getAmenitiesMask();
        } else if (request.getAmenities() != null && !request.getAmenities().isEmpty()) {
            amenitiesMask = com.doan.core.common.constant.RoomAmenityConstants.encode(request.getAmenities());
        }

        List<UtilityService> services = new ArrayList<>();
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

        // Đánh giá điểm rủi ro tin đăng phòng trọ (Rule-based risk score & đối soát dHash trộm ảnh)
        RoomRiskEvaluationResult riskResult = roomRiskScoringService.evaluateRoomRisk(landlordId, null, request);

        String riskDetailsJson = null;
        try {
            riskDetailsJson = objectMapper.writeValueAsString(riskResult);
        } catch (Exception e) {
            log.error("Không thể tuần tự hóa kết quả đánh giá rủi ro", e);
        }

        String cover = request.getCoverImageUrl();
        if ((cover == null || cover.isBlank()) && request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            cover = request.getImageUrls().get(0);
        }

        Room room = Room.builder()
                .building(building)
                .landlord(landlord)
                .provinceId(provinceId)
                .wardId(wardId)
                .amenitiesMask(amenitiesMask)
                .addressDetail(addressDetail)
                .name(request.getName().trim())
                .floor(request.getFloor() != null ? request.getFloor() : 1)
                .area(request.getArea())
                .listedPrice(request.getListedPrice())
                .standardDeposit(request.getStandardDeposit())
                .electricityPrice(request.getElectricityPrice())
                .waterPrice(request.getWaterPrice())
                .riskScore(riskResult.getTotalRiskScore())
                .riskEvaluationDetails(riskDetailsJson)
                .moderationStatus(riskResult.getModerationAction())
                .moderationReason(riskResult.getModerationReason())
                .maxCapacity(request.getMaxCapacity())
                .currentOccupancy(0)
                .furnishingLevel(request.getFurnishingLevel() != null ? request.getFurnishingLevel() : "BASIC")
                .services(services)
                .description(request.getDescription())
                .status(riskResult.getRoomStatus())
                .coverImageUrl(cover)
                .latitude(lat)
                .longitude(lng)
                .isPublic(riskResult.isPublic())
                .build();

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<RoomImage> images = new ArrayList<>();
            List<String> urls = request.getImageUrls();
            List<String> hashes = request.getImageHashes();

            for (int i = 0; i < urls.size(); i++) {
                String imgUrl = urls.get(i);
                String hash = (hashes != null && i < hashes.size()) ? hashes.get(i) : null;
                String fileKey = null;
                String storagePath = null;

                if (imgUrl.contains("/rooms/images/file/")) {
                    int start = imgUrl.indexOf("/rooms/images/file/") + "/rooms/images/file/".length();
                    int end = imgUrl.indexOf("/watermarked", start);
                    if (end > start) {
                        fileKey = imgUrl.substring(start, end);
                        storagePath = "rooms/" + fileKey + ".jpg";
                    }
                }

                images.add(RoomImage.builder()
                        .room(room)
                        .imageUrl(imgUrl)
                        .displayOrder(i)
                        .imageHash(hash)
                        .fileKey(fileKey)
                        .storagePath(storagePath)
                        .build());
            }
            room.setImages(images);
        }

        Room saved = roomRepository.save(room);

        // Ghi Audit Log khởi tạo tin đăng
        String createSummary = String.format("Khởi tạo phòng %s: Giá thuê %s đ, Điện %s đ, Nước %s đ, Cọc %s đ (%d ảnh)",
                saved.getName(), saved.getListedPrice(), saved.getElectricityPrice(), saved.getWaterPrice(), saved.getStandardDeposit(),
                request.getImageUrls() != null ? request.getImageUrls().size() : 0);
        roomAuditLogService.logAction(
                saved,
                landlord,
                "CREATED",
                null,
                saved.getStatus() != null ? saved.getStatus().name() : null,
                null,
                saved.getModerationStatus(),
                saved.getRiskScore(),
                saved.getModerationReason(),
                createSummary,
                riskDetailsJson
        );

        // Trường hợp phát hiện trộm ảnh chủ trọ khác: Khóa tin B ngay lập tức và ném lỗi 403 Forbidden
        if (riskResult.isHasStolenImages()) {
            log.warn("KHÓA TIN ĐĂNG B DO TRỘM ẢNH: RoomId={}, LandlordId={}", saved.getId(), landlordId);
            throw new BaseException(ErrorCode.ROOM_STOLEN_IMAGES_DETECTED, riskResult.getModerationReason());
        }

        // Trường hợp điểm rủi ro quá cao (> 60 điểm): Từ chối duyệt và thông báo lỗi
        if (riskResult.getTotalRiskScore() > 60) {
            log.warn("TỪ CHỐI TIN ĐĂNG DO ĐIỂM RỦI RO CAO: RoomId={}, Score={}", saved.getId(), riskResult.getTotalRiskScore());
            throw new BaseException(ErrorCode.ROOM_CONTENT_RISK_REJECTED, riskResult.getModerationReason());
        }

        return RoomResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long landlordId, Long roomId, RoomRequest request) {
        log.info("Cập nhật phòng trọ id: {} của chủ trọ: {}", roomId, landlordId);

        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Tên phòng không được để trống");
        }
        if (request.getListedPrice() != null && request.getListedPrice() <= 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Giá thuê phòng phải lớn hơn 0");
        }
        if (request.getStandardDeposit() != null && request.getStandardDeposit() < 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Tiền cọc phòng không được là số âm");
        }
        if (request.getMaxCapacity() != null && request.getMaxCapacity() <= 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Sức chứa tối đa của phòng phải lớn hơn 0");
        }
        if (request.getArea() != null && request.getArea().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Diện tích phòng phải lớn hơn 0");
        }

        Room room = roomRepository.findByIdAndBuildingLandlordId(roomId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        String oldStatus = room.getStatus() != null ? room.getStatus().name() : null;
        String oldModStatus = room.getModerationStatus();
        Long oldPrice = room.getListedPrice();
        String oldName = room.getName();

        // Kiểm tra nếu phòng bị khóa do trộm ảnh vi phạm bản quyền
        if ("LOCKED_STOLEN_IMAGES".equalsIgnoreCase(room.getModerationStatus())) {
            log.warn("Chủ trọ ID [{}] cố gắng chỉnh sửa phòng bị khóa vi phạm bản quyền ID [{}]", landlordId, roomId);
            throw new BaseException(ErrorCode.ROOM_LOCKED_MODERATION,
                    "Phòng trọ này đang bị khóa do vi phạm sao chép ảnh của chủ trọ khác. Vui lòng liên hệ Quản trị viên để được hỗ trợ.");
        }

        // Đánh giá lại rủi ro khi cập nhật thông tin phòng
        RoomRiskEvaluationResult riskResult = roomRiskScoringService.evaluateRoomRisk(landlordId, roomId, request);
        String riskDetailsJson = null;
        try {
            riskDetailsJson = objectMapper.writeValueAsString(riskResult);
        } catch (Exception e) {
            log.error("Không thể tuần tự hóa kết quả đánh giá rủi ro", e);
        }

        Building building = null;
        if (request.getBuildingId() != null) {
            building = buildingRepository.findByIdAndLandlordId(request.getBuildingId(), landlordId)
                    .orElseThrow(() -> new BaseException(ErrorCode.BUILDING_NOT_FOUND));

            if (roomRepository.existsByBuildingIdAndNameAndIdNot(request.getBuildingId(), request.getName().trim(),
                    roomId)) {
                throw new BaseException(ErrorCode.ROOM_CODE_EXISTS);
            }
        } else {
            if (roomRepository.existsByBuildingIsNullAndLandlordIdAndNameAndIdNot(landlordId, request.getName().trim(),
                    roomId)) {
                throw new BaseException(ErrorCode.ROOM_CODE_EXISTS);
            }
        }

        RoomStatus newStatus = request.getStatus();

        // Ngoại lệ: Phòng đang có hợp đồng hiệu lực thì không được chuyển sang trạng
        // thái "AVAILABLE"
        if (newStatus == RoomStatus.AVAILABLE && room.getStatus() != RoomStatus.AVAILABLE) {
            boolean hasActiveContract = contractRepository.existsByRoomIdAndStatus(roomId, ContractStatus.ACTIVE);
            if (hasActiveContract) {
                throw new BaseException(ErrorCode.ROOM_HAS_ACTIVE_CONTRACT);
            }
        }

        room.setBuilding(building);

        Integer provinceId = request.getProvinceId();
        Integer wardId = request.getWardId();
        if (building != null) {
            if (provinceId == null) {
                provinceId = building.getProvinceId();
            }
            if (wardId == null) {
                wardId = building.getWardId();
            }
        }

        Integer targetProvinceId = provinceId != null ? provinceId : room.getProvinceId();
        Integer targetWardId = wardId != null ? wardId : room.getWardId();
        VietnamLocationConstants.validateLocation(targetProvinceId, targetWardId);

        if (provinceId != null) {
            room.setProvinceId(provinceId);
        }
        if (wardId != null) {
            room.setWardId(wardId);
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
        room.setElectricityPrice(request.getElectricityPrice());
        room.setWaterPrice(request.getWaterPrice());
        room.setRiskScore(riskResult.getTotalRiskScore());
        room.setRiskEvaluationDetails(riskDetailsJson);
        room.setModerationStatus(riskResult.getModerationAction());
        room.setModerationReason(riskResult.getModerationReason());
        room.setMaxCapacity(request.getMaxCapacity());
        if (request.getFurnishingLevel() != null) {
            room.setFurnishingLevel(request.getFurnishingLevel());
        }

        if (request.getAmenitiesMask() != null) {
            room.setAmenitiesMask(request.getAmenitiesMask());
        } else if (request.getAmenities() != null && !request.getAmenities().isEmpty()) {
            room.setAmenitiesMask(com.doan.core.common.constant.RoomAmenityConstants.encode(request.getAmenities()));
        }

        if (request.getServiceIds() != null) {
            List<UtilityService> updatedServices = utilityServiceRepository
                    .findAllByIdInAndLandlordId(request.getServiceIds(), landlordId);
            room.setServices(updatedServices);
        }
        room.setDescription(request.getDescription());
        if (riskResult.getRoomStatus() != null) {
            room.setStatus(riskResult.getRoomStatus());
        } else if (newStatus != null) {
            room.setStatus(newStatus);
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

        room.setIsPublic(riskResult.isPublic());

        String updatedCover = request.getCoverImageUrl();
        if ((updatedCover == null || updatedCover.isBlank()) && request.getImageUrls() != null
                && !request.getImageUrls().isEmpty()) {
            updatedCover = request.getImageUrls().get(0);
        }
        if (updatedCover != null) {
            room.setCoverImageUrl(updatedCover);
        }

        if (request.getImageUrls() != null) {
            room.getImages().clear();
            List<String> urls = request.getImageUrls();
            List<String> hashes = request.getImageHashes();

            for (int i = 0; i < urls.size(); i++) {
                String imgUrl = urls.get(i);
                String hash = (hashes != null && i < hashes.size()) ? hashes.get(i) : null;
                String fileKey = null;
                String storagePath = null;

                if (imgUrl.contains("/rooms/images/file/")) {
                    int start = imgUrl.indexOf("/rooms/images/file/") + "/rooms/images/file/".length();
                    int end = imgUrl.indexOf("/watermarked", start);
                    if (end > start) {
                        fileKey = imgUrl.substring(start, end);
                        storagePath = "rooms/" + fileKey + ".jpg";
                    }
                }

                room.getImages().add(RoomImage.builder()
                        .room(room)
                        .imageUrl(imgUrl)
                        .displayOrder(i)
                        .imageHash(hash)
                        .fileKey(fileKey)
                        .storagePath(storagePath)
                        .build());
            }
        }

        Room updated = roomRepository.save(room);

        // Ghi Audit Log cập nhật tin đăng
        com.doan.core.business.entity.User actor = userRepository.findById(landlordId).orElse(null);
        String updateSummary = String.format("Chỉnh sửa phòng %s (Giá cũ: %s đ -> Mới: %s đ, Điện: %s đ, Nước: %s đ, Cọc: %s đ)",
                oldName, oldPrice, updated.getListedPrice(), updated.getElectricityPrice(), updated.getWaterPrice(), updated.getStandardDeposit());
        if (actor != null) {
            roomAuditLogService.logAction(
                    updated,
                    actor,
                    "UPDATED",
                    oldStatus,
                    updated.getStatus() != null ? updated.getStatus().name() : null,
                    oldModStatus,
                    updated.getModerationStatus(),
                    updated.getRiskScore(),
                    updated.getModerationReason(),
                    updateSummary,
                    riskDetailsJson
            );
        }

        // Trường hợp phát hiện trộm ảnh chủ trọ khác: Khóa tin B ngay lập tức và ném lỗi 403 Forbidden
        if (riskResult.isHasStolenImages()) {
            log.warn("CẬP NHẬT: KHÓA TIN ĐĂNG B DO TRỘM ẢNH: RoomId={}, LandlordId={}", updated.getId(), landlordId);
            throw new BaseException(ErrorCode.ROOM_STOLEN_IMAGES_DETECTED, riskResult.getModerationReason());
        }

        // Trường hợp điểm rủi ro quá cao (> 60 điểm): Từ chối duyệt và thông báo lỗi
        if (riskResult.getTotalRiskScore() > 60) {
            log.warn("CẬP NHẬT: TỪ CHỐI TIN ĐĂNG DO ĐIỂM RỦI RO CAO: RoomId={}, Score={}", updated.getId(), riskResult.getTotalRiskScore());
            throw new BaseException(ErrorCode.ROOM_CONTENT_RISK_REJECTED, riskResult.getModerationReason());
        }

        return RoomResponse.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomImageUploadResponse> uploadRoomImages(Long landlordId, MultipartFile[] files) {
        log.info("Xử lý tải lên {} ảnh phòng trọ cho chủ trọ ID: {}", files != null ? files.length : 0, landlordId);

        if (files == null || files.length == 0) {
            throw new BaseException(ErrorCode.FILE_EMPTY, "Vui lòng chọn ít nhất một hình ảnh để tải lên");
        }

        List<RoomImageUploadResponse> results = new ArrayList<>();
        List<RoomImage> otherLandlordImages = roomImageRepository.findImagesOfOtherLandlords(landlordId);

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            // 1. Tính mã băm dHash (Difference Hash) 64-bit
            String dHash = null;
            try (InputStream is = file.getInputStream()) {
                dHash = ImageHashUtil.computeDHash(is);
            } catch (IOException e) {
                log.error("Không thể đọc tệp để tính dHash: {}", file.getOriginalFilename(), e);
            }

            // 2. Lưu trữ file an toàn vào private secure storage
            StoredFileInfo fileInfo = secureStorageService.storeSecureFile(file, "rooms");

            // 3. Đối soát dHash chống trộm ảnh của các chủ trọ khác
            boolean isDuplicate = false;
            String warningMsg = null;
            if (dHash != null) {
                for (RoomImage otherImg : otherLandlordImages) {
                    if (otherImg.getImageHash() == null) continue;
                    int distance = ImageHashUtil.calculateHammingDistance(dHash, otherImg.getImageHash());
                    if (distance <= ImageHashUtil.DUPLICATE_HAMMING_THRESHOLD) {
                        isDuplicate = true;
                        String owner = (otherImg.getRoom() != null && otherImg.getRoom().getLandlord() != null)
                                ? otherImg.getRoom().getLandlord().getFullName() : "Chủ trọ khác";
                        warningMsg = String.format("CẢNH BÁO: Hình ảnh trùng khớp với tin của %s (Hamming: %d). Nếu đăng tin, bài sẽ bị khóa do vi phạm bản quyền!",
                                owner, distance);
                        log.warn("Upload ảnh trùng lặp: file={}, hash={}, duplicateWithImgId={}",
                                file.getOriginalFilename(), dHash, otherImg.getId());
                        break;
                    }
                }
            }

            String watermarkedUrl = "/api/v1/public/rooms/images/file/" + fileInfo.getFileKey() + "/watermarked";

            results.add(RoomImageUploadResponse.builder()
                    .fileKey(fileInfo.getFileKey())
                    .originalFilename(fileInfo.getOriginalFilename())
                    .storagePath(fileInfo.getStoragePath())
                    .watermarkedUrl(watermarkedUrl)
                    .imageHash(dHash)
                    .duplicateWithOtherLandlord(isDuplicate)
                    .duplicateWarningMessage(warningMsg)
                    .build());
        }

        return results;
    }

    @Override
    @Transactional
    public void deleteRoom(Long landlordId, Long roomId) {
        log.info("Xóa phòng trọ id: {} của chủ trọ: {}", roomId, landlordId);

        Room room = roomRepository.findByIdAndBuildingLandlordId(roomId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        // Kiểm tra lịch sử hợp đồng
        boolean hasContracts = contractRepository.existsByRoomIdAndStatus(roomId, ContractStatus.ACTIVE);
        if (hasContracts || !contractRepository.findByRoomId(roomId).isEmpty()) {
            throw new BaseException(ErrorCode.ROOM_HAS_HISTORY);
        }

        roomRepository.delete(room);
    }
}
