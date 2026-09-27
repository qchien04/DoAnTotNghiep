package com.doan.core.business.dto.tenant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantContractHistoryResponse {

    private Long id;
    private String status; // ACTIVE, EXPIRING_SOON, TERMINATED, EXPIRED, CANCELLED
    private Boolean isCurrent;
    private Boolean isRepresentative;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyRent;
    private BigDecimal depositAmount;
    private BigDecimal depositRefundAmount;
    private String termsAndConditions;
    private String pdfFileUrl;

    // Room info
    private Long roomId;
    private String roomName;
    private String buildingName;
    private String buildingAddress;
    private Double roomArea;

    // Landlord info
    private String landlordName;
    private String landlordPhone;

    // Contract Services
    private List<TenantRoomResponse.ContractServiceDto> services;
}
