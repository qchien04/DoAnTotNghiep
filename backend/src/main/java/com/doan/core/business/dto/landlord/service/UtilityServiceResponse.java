package com.doan.core.business.dto.landlord.service;

import com.doan.core.business.entity.UtilityService;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết dịch vụ tiện ích")
public class UtilityServiceResponse {

    private Long id;
    private String serviceCode;
    private String name;
    private String category;
    private String unit;
    private Long unitPrice;
    private String billingMethod;
    private String scope;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static UtilityServiceResponse fromEntity(UtilityService service) {
        if (service == null) return null;
        return UtilityServiceResponse.builder()
                .id(service.getId())
                .serviceCode(service.getServiceCode())
                .name(service.getName())
                .category(service.getCategory())
                .unit(service.getUnit())
                .unitPrice(service.getUnitPrice())
                .billingMethod(service.getBillingMethod())
                .scope(service.getScope())
                .isActive(service.getIsActive())
                .createdAt(service.getCreatedAt())
                .build();
    }
}
