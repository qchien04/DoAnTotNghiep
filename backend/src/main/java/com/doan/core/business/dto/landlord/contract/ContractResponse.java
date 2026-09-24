package com.doan.core.business.dto.landlord.contract;

import com.doan.core.business.entity.Contract;
import com.doan.core.business.entity.ContractService;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết hợp đồng thuê phòng")
public class ContractResponse {

    private Long id;
    private String contractCode;
    private Long roomId;
    private String roomCode;
    private String buildingName;
    private Long representativeTenantId;
    private String representativeTenantName;
    private String representativeTenantPhone;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long rentPrice;
    private Long monthlyRent;
    private Long depositAmount;
    private Integer paymentCycleDay;
    private Integer durationMonths;
    private String contractNumber;
    private String roomName;
    private String tenantName;
    private String tenantPhone;
    private Integer initialElectricIndex;
    private Integer initialWaterIndex;
    private Integer finalElectricIndex;
    private Integer finalWaterIndex;
    private Long depositRefundAmount;
    private String status;
    private String pdfFileUrl;
    private String termsAndConditions;
    private List<ContractServiceResponse> services;
    private List<com.doan.core.business.dto.landlord.tenant.TenantResponse> tenants;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractServiceResponse {
        private Long id;
        private Long serviceId;
        private String serviceName;
        private String unit;
        private Long appliedUnitPrice;
        private String billingMethod;
        private Integer lastIndex;
    }

    public static ContractResponse fromEntity(Contract contract) {
        if (contract == null) return null;

        List<ContractServiceResponse> sList = contract.getContractServices() != null
                ? contract.getContractServices().stream().map(cs -> ContractServiceResponse.builder()
                .id(cs.getId())
                .serviceId(cs.getService() != null ? cs.getService().getId() : null)
                .serviceName(cs.getServiceName())
                .unit(cs.getUnit())
                .appliedUnitPrice(cs.getAppliedUnitPrice())
                .billingMethod(cs.getBillingMethod())
                .lastIndex(cs.getLastIndex())
                .build()).collect(Collectors.toList())
                : List.of();

        List<com.doan.core.business.dto.landlord.tenant.TenantResponse> tenantList = contract.getTenants() != null
                ? contract.getTenants().stream().map(com.doan.core.business.dto.landlord.tenant.TenantResponse::fromEntity).collect(Collectors.toList())
                : List.of();

        int months = 12;
        if (contract.getStartDate() != null && contract.getEndDate() != null) {
            java.time.Period p = java.time.Period.between(contract.getStartDate(), contract.getEndDate().plusDays(1));
            months = p.getYears() * 12 + p.getMonths();
            if (months <= 0) months = 1;
        }

        String rCode = contract.getRoom() != null ? contract.getRoom().getRoomCode() : null;
        String tName = contract.getRepresentativeTenant() != null ? contract.getRepresentativeTenant().getFullName() : null;
        String tPhone = contract.getRepresentativeTenant() != null ? contract.getRepresentativeTenant().getPhone() : null;

        return ContractResponse.builder()
                .id(contract.getId())
                .contractCode(contract.getContractCode())
                .contractNumber(contract.getContractCode())
                .roomId(contract.getRoom() != null ? contract.getRoom().getId() : null)
                .roomCode(rCode)
                .roomName(rCode)
                .buildingName(contract.getRoom() != null && contract.getRoom().getBuilding() != null ? contract.getRoom().getBuilding().getName() : null)
                .representativeTenantId(contract.getRepresentativeTenant() != null ? contract.getRepresentativeTenant().getId() : null)
                .representativeTenantName(tName)
                .tenantName(tName)
                .representativeTenantPhone(tPhone)
                .tenantPhone(tPhone)
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .durationMonths(months)
                .rentPrice(contract.getRentPrice())
                .monthlyRent(contract.getRentPrice())
                .depositAmount(contract.getDepositAmount())
                .paymentCycleDay(contract.getPaymentCycleDay())
                .initialElectricIndex(contract.getInitialElectricIndex())
                .initialWaterIndex(contract.getInitialWaterIndex())
                .finalElectricIndex(contract.getFinalElectricIndex())
                .finalWaterIndex(contract.getFinalWaterIndex())
                .depositRefundAmount(contract.getDepositRefundAmount())
                .status(contract.getStatus())
                .pdfFileUrl(contract.getPdfFileUrl())
                .termsAndConditions(contract.getTermsAndConditions())
                .services(sList)
                .tenants(tenantList)
                .createdAt(contract.getCreatedAt())
                .build();
    }
}
