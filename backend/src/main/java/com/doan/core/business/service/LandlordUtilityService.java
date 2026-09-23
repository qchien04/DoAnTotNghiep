package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.service.UtilityServiceRequest;
import com.doan.core.business.dto.landlord.service.UtilityServiceResponse;

import java.util.List;

public interface LandlordUtilityService {

    List<UtilityServiceResponse> getServices(Long landlordId);

    UtilityServiceResponse getServiceById(Long landlordId, Long serviceId);

    UtilityServiceResponse createService(Long landlordId, UtilityServiceRequest request);

    UtilityServiceResponse updateService(Long landlordId, Long serviceId, UtilityServiceRequest request);

    void deleteService(Long landlordId, Long serviceId);
}
