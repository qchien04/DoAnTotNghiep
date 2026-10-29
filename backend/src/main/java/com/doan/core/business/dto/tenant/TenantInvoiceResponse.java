package com.doan.core.business.dto.tenant;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.doan.core.business.enums.InvoiceStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantInvoiceResponse {

    private Long id;
    private String billingMonth;
    private String roomName;
    private String buildingName;

    private BigDecimal roomRent;
    private BigDecimal serviceAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;

    private LocalDate dueDate;
    private InvoiceStatus status;

    private List<InvoiceItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceItemDto {
        private String serviceName;
        private Double quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalAmount;
    }
}
