package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.contract.*;

import java.util.List;

public interface LandlordContractService {

    List<ContractResponse> getContracts(Long landlordId, Long buildingId, String status);

    ContractResponse getContractById(Long landlordId, Long contractId);

    ContractResponse createContract(Long landlordId, ContractCreateRequest request);

    ContractResponse updateContract(Long landlordId, Long contractId, ContractUpdateRequest request);

    CheckoutCalculationResponse terminateContract(Long landlordId, Long contractId, ContractTerminateRequest request);
}
