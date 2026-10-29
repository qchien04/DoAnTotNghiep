package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.building.BuildingRequest;
import com.doan.core.business.dto.landlord.building.BuildingResponse;
import com.doan.core.common.data.PageResponse;

public interface LandlordBuildingService {

    PageResponse<BuildingResponse> getBuildings(Long landlordId, String keyword, int page, int size, String sortBy,
            String sortDirection);

    BuildingResponse getBuildingById(Long landlordId, Long buildingId);

    BuildingResponse createBuilding(Long landlordId, BuildingRequest request);

    BuildingResponse updateBuilding(Long landlordId, Long buildingId, BuildingRequest request);

    void deleteBuilding(Long landlordId, Long buildingId);
}
