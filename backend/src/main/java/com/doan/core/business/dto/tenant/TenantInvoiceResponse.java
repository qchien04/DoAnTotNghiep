package com.doan.core.business.dto.tenant;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantInvoiceResponse {

    private Long id;
    private String billingMonth;
    private String roomName;
    private String buildingName;

    private Integer electricityUsage;
    private Integer waterUsage;

    private BigDecimal roomRent;
    private BigDecimal electricityAmount;
    private BigDecimal waterAmount;
    private BigDecimal serviceAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;

    private LocalDate dueDate;
    private String status; // PENDING, PAID, OVERDUE

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
