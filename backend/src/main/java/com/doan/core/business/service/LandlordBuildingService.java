package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.building.BuildingRequest;
import com.doan.core.business.dto.landlord.building.BuildingResponse;

import java.util.List;

public interface LandlordBuildingService {

    List<BuildingResponse> getBuildings(Long landlordId, String keyword);

    BuildingResponse getBuildingById(Long landlordId, Long buildingId);

    BuildingResponse createBuilding(Long landlordId, BuildingRequest request);

    BuildingResponse updateBuilding(Long landlordId, Long buildingId, BuildingRequest request);

    void deleteBuilding(Long landlordId, Long buildingId);
}
