package com.doan.core.business.service;

import com.doan.core.business.dto.amenity.AmenityResponse;
import com.doan.core.business.dto.amenity.CreateAmenityRequest;
import com.doan.core.common.data.PageResponse;

import java.util.List;

public interface AmenityService {

    PageResponse<AmenityResponse> getAmenities(String keyword, int page, int size, String sortBy, String sortDirection);

    List<AmenityResponse> getAllAmenities();

    AmenityResponse getAmenityById(Long id);

    AmenityResponse createAmenity(CreateAmenityRequest request);

    AmenityResponse updateAmenity(Long id, CreateAmenityRequest request);

    void deleteAmenity(Long id);
}
