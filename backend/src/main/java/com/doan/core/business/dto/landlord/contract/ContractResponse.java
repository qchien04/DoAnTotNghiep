package com.doan.core.business.dto.landlord.contract;

import com.doan.core.business.dto.landlord.tenant.TenantResponse;
import com.doan.core.business.enums.BillingMethod;
import com.doan.core.business.entity.Building;
import com.doan.core.business.entity.Contract;
import com.doan.core.business.entity.ContractTenant;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.Tenant;
import com.doan.core.business.enums.ContractStatus;
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
        private Long roomId;
        private String roomName;
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
        private String tenantName;
        private String tenantPhone;
        private Long depositRefundAmount;
        private ContractStatus status;
        private String pdfFileUrl;
        private String termsAndConditions;
        private List<ContractServiceResponse> services;
        private List<TenantResponse> tenants;
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
                private BillingMethod billingMethod;
                private Integer lastIndex;
        }

        public static ContractResponse fromEntity(Contract contract) {
                if (contract == null)
                        return null;

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

                List<TenantResponse> tenantList = contract.getContractTenants() != null
                                ? contract.getContractTenants().stream()
                                                .map(TenantResponse::fromContractTenant)
                                                .collect(Collectors.toList())
                                : List.of();

                java.time.Period p = java.time.Period.between(contract.getStartDate(),
                                contract.getEndDate().plusDays(1));
                int months = Math.max(1, p.getYears() * 12 + p.getMonths());

                Room room = contract.getRoom();
                String rName = room.getName();
                Building building = room.getBuilding();
                String bName = building != null ? building.getName() : null;

                ContractTenant repCt = contract.getContractTenants() != null
                                ? contract.getContractTenants().stream()
                                                .filter(ct -> Boolean.TRUE.equals(ct.getIsRepresentative()))
                                                .findFirst()
                                                .orElse(null)
                                : null;
                Tenant repTenant = repCt != null ? repCt.getTenant() : null;
                Long repId = repTenant != null ? repTenant.getId() : null;
                String tName = repTenant != null ? repTenant.getFullName() : null;
                String tPhone = repTenant != null ? repTenant.getPhone() : null;

                return ContractResponse.builder()
                                .id(contract.getId())
                                .roomId(room.getId())
                                .roomName(rName)
                                .buildingName(bName)
                                .representativeTenantId(repId)
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
