package com.doan.core.business.service.impl;

import com.doan.core.business.dto.amenity.AmenityResponse;
import com.doan.core.business.dto.amenity.CreateAmenityRequest;
import com.doan.core.business.entity.Amenity;
import com.doan.core.business.repository.AmenityRepository;
import com.doan.core.business.service.AmenityService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;

    @jakarta.annotation.PostConstruct
    @Transactional
    public void initDefaultAmenitiesIfEmpty() {
        try {
            if (amenityRepository.count() == 0) {
                log.info("Khởi tạo 16 tiện ích chuẩn vào bảng amenities...");
                for (com.doan.core.common.constant.RoomAmenityConstants.AmenityItem item : com.doan.core.common.constant.RoomAmenityConstants.ALL_AMENITIES) {
                    amenityRepository.save(Amenity.builder()
                            .name(item.name())
                            .description(item.key())
                            .build());
                }
                log.info("Đã khởi tạo thành công {} tiện ích chuẩn.", com.doan.core.common.constant.RoomAmenityConstants.ALL_AMENITIES.size());
            }
        } catch (Exception e) {
            log.warn("Không thể tự động khởi tạo tiện ích chuẩn: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AmenityResponse> getAmenities(String keyword, int page, int size, String sortBy, String sortDirection) {
        String kw = (keyword != null && !keyword.trim().isBlank()) ? keyword.trim() : null;
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = (sortBy != null && !sortBy.isBlank()) ? sortBy : "name";
        Pageable pageable = PageRequest.of(Math.max(0, page), size > 0 ? size : 10, Sort.by(direction, sortProperty));

        Page<Amenity> amenityPage = amenityRepository.searchAmenities(kw, pageable);
        return PageResponse.from(amenityPage.map(AmenityResponse::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AmenityResponse> getAllAmenities() {
        return amenityRepository.findAllByOrderByNameAsc().stream()
                .map(AmenityResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AmenityResponse getAmenityById(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy tiện ích với ID: " + id));
        return AmenityResponse.fromEntity(amenity);
    }

    @Override
    @Transactional
    public AmenityResponse createAmenity(CreateAmenityRequest request) {
        String name = request.getName().trim();
        if (amenityRepository.existsByNameIgnoreCase(name)) {
            throw new BaseException(ErrorCode.CONFLICT, "Tiện ích với tên '" + name + "' đã tồn tại");
        }
        Amenity amenity = Amenity.builder()
                .name(name)
                .description(request.getDescription())
                .build();
        return AmenityResponse.fromEntity(amenityRepository.save(amenity));
    }

    @Override
    @Transactional
    public AmenityResponse updateAmenity(Long id, CreateAmenityRequest request) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy tiện ích với ID: " + id));
        String newName = request.getName().trim();
        if (!amenity.getName().equalsIgnoreCase(newName) && amenityRepository.existsByNameIgnoreCase(newName)) {
            throw new BaseException(ErrorCode.CONFLICT, "Tiện ích với tên '" + newName + "' đã tồn tại");
        }
        amenity.setName(newName);
        amenity.setDescription(request.getDescription());
        return AmenityResponse.fromEntity(amenityRepository.save(amenity));
    }

    @Override
    @Transactional
    public void deleteAmenity(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy tiện ích với ID: " + id));
        amenityRepository.delete(amenity);
    }
}
