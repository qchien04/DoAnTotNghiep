package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.service.UtilityServiceRequest;
import com.doan.core.business.dto.landlord.service.UtilityServiceResponse;
import com.doan.core.business.entity.User;
import com.doan.core.business.entity.UtilityService;
import com.doan.core.business.repository.ContractServiceRepository;
import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.repository.UtilityServiceRepository;
import com.doan.core.business.service.LandlordUtilityService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordUtilityServiceImpl implements LandlordUtilityService {

    private final UtilityServiceRepository utilityServiceRepository;
    private final ContractServiceRepository contractServiceRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UtilityServiceResponse> getServices(Long landlordId) {
        log.info("Lấy danh mục dịch vụ tiện ích cho chủ trọ id: {}", landlordId);
        List<UtilityService> services = utilityServiceRepository.findByLandlordId(landlordId);

        return services.stream()
                .map(UtilityServiceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UtilityServiceResponse getServiceById(Long landlordId, Long serviceId) {
        UtilityService service = utilityServiceRepository.findByIdAndLandlordId(serviceId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.SERVICE_NOT_FOUND));

        return UtilityServiceResponse.fromEntity(service);
    }

    @Override
    @Transactional
    public UtilityServiceResponse createService(Long landlordId, UtilityServiceRequest request) {
        log.info("Tạo mới dịch vụ: {} cho chủ trọ: {}", request.getName(), landlordId);

        validateServiceRequest(request);

        if (utilityServiceRepository.existsByLandlordIdAndName(landlordId, request.getName().trim())) {
            throw new BaseException(ErrorCode.SERVICE_ALREADY_EXISTS);
        }

        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        UtilityService service = UtilityService.builder()
                .landlord(landlord)
                .name(request.getName().trim())
                .category(request.getCategory() != null ? request.getCategory().trim() : "OTHER")
                .unit(request.getUnit() != null ? request.getUnit().trim() : "Lần")
                .unitPrice(request.getUnitPrice())
                .billingMethod(request.getBillingMethod())
                .scope(request.getScope() != null ? request.getScope().trim() : "ALL")
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        UtilityService saved = utilityServiceRepository.save(service);
        return UtilityServiceResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public UtilityServiceResponse updateService(Long landlordId, Long serviceId, UtilityServiceRequest request) {
        log.info("Cập nhật dịch vụ id: {} của chủ trọ: {}", serviceId, landlordId);

        validateServiceRequest(request);

        UtilityService service = utilityServiceRepository.findByIdAndLandlordId(serviceId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.SERVICE_NOT_FOUND));

        if (utilityServiceRepository.existsByLandlordIdAndNameAndIdNot(landlordId, request.getName().trim(), serviceId)) {
            throw new BaseException(ErrorCode.SERVICE_ALREADY_EXISTS);
        }

        service.setName(request.getName().trim());
        if (request.getCategory() != null) service.setCategory(request.getCategory().trim());
        if (request.getUnit() != null) service.setUnit(request.getUnit().trim());
        service.setUnitPrice(request.getUnitPrice());
        service.setBillingMethod(request.getBillingMethod());
        if (request.getScope() != null) {
            service.setScope(request.getScope().trim());
        }
        if (request.getIsActive() != null) {
            service.setIsActive(request.getIsActive());
        }

        UtilityService updated = utilityServiceRepository.save(service);
        return UtilityServiceResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteService(Long landlordId, Long serviceId) {
        log.info("Xóa dịch vụ id: {} của chủ trọ: {}", serviceId, landlordId);

        UtilityService service = utilityServiceRepository.findByIdAndLandlordId(serviceId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.SERVICE_NOT_FOUND));

        if (contractServiceRepository.existsByServiceId(serviceId)) {
            throw new BaseException(ErrorCode.SERVICE_IN_USE);
        }

        utilityServiceRepository.delete(service);
    }

    private void validateServiceRequest(UtilityServiceRequest request) {
        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Tên dịch vụ không được để trống");
        }
        if (request.getUnitPrice() == null || request.getUnitPrice() < 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Đơn giá dịch vụ không được là số âm");
        }
        if (request.getBillingMethod() == null) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Phương thức tính tiền không được để trống");
        }
    }
}
