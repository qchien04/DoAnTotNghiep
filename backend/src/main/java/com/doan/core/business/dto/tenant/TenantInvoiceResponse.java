package com.doan.core.business.dto.tenant;

import lombok.*;

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

    private Long roomRent;
    private Long serviceAmount;
    private Long totalAmount;
    private Long paidAmount;
    private Long remainingAmount;

    private LocalDate dueDate;
    private InvoiceStatus status;

    private List<InvoiceItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceItemDto {
        private String serviceName;
        private Integer quantity;
        private Long unitPrice;
        private Long totalAmount;
    }
}
