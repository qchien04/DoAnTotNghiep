package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.contract.*;
import com.doan.core.business.enums.ContractStatus;
import com.doan.core.common.data.PageResponse;

public interface LandlordContractService {

    PageResponse<ContractResponse> getContracts(Long landlordId, Long buildingId, ContractStatus status, String keyword,
            int page, int size, String sortBy, String sortDirection);

    ContractResponse getContractById(Long landlordId, Long contractId);

    ContractResponse createContract(Long landlordId, ContractCreateRequest request);

    ContractResponse updateContract(Long landlordId, Long contractId, ContractUpdateRequest request);

    CheckoutCalculationResponse terminateContract(Long landlordId, Long contractId, ContractTerminateRequest request);
}
