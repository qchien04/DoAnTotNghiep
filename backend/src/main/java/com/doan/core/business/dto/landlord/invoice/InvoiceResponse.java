package com.doan.core.business.dto.landlord.invoice;

import com.doan.core.business.entity.Invoice;
import com.doan.core.business.entity.InvoiceItem;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết hóa đơn tiền phòng")
public class InvoiceResponse {

    private Long id;
    private String invoiceCode;
    private Long contractId;
    private String contractCode;
    private Long roomId;
    private String roomCode;
    private String buildingName;
    private String representativeTenantName;
    private String representativeTenantPhone;
    private String billingPeriod;
    private LocalDate dueDate;
    private Long roomPrice;
    private Long servicesAmount;
    private Long otherAmount;
    private Long totalAmount;
    private Long paidAmount;
    private Long remainingAmount;
    private Integer previousElectricIndex;
    private Integer currentElectricIndex;
    private Integer electricConsumed;
    private Integer previousWaterIndex;
    private Integer currentWaterIndex;
    private Integer waterConsumed;
    private String status;
    private String paymentMethod;
    private Instant paidAt;
    private String cancelReason;
    private List<InvoiceItemResponse> items;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceItemResponse {
        private Long id;
        private String itemName;
        private BigDecimal quantity;
        private Long unitPrice;
        private Long amount;
        private String note;
    }

    public static InvoiceResponse fromEntity(Invoice invoice) {
        if (invoice == null) return null;

        List<InvoiceItemResponse> itemList = invoice.getItems() != null
                ? invoice.getItems().stream().map(item -> InvoiceItemResponse.builder()
                .id(item.getId())
                .itemName(item.getItemName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .amount(item.getAmount())
                .note(item.getNote())
                .build()).collect(Collectors.toList())
                : List.of();

        String cCode = invoice.getContract() != null ? invoice.getContract().getContractCode() : null;
        Long rId = (invoice.getContract() != null && invoice.getContract().getRoom() != null)
                ? invoice.getContract().getRoom().getId() : null;
        String rCode = (invoice.getContract() != null && invoice.getContract().getRoom() != null)
                ? invoice.getContract().getRoom().getRoomCode() : null;
        String bName = (invoice.getContract() != null && invoice.getContract().getRoom() != null && invoice.getContract().getRoom().getBuilding() != null)
                ? invoice.getContract().getRoom().getBuilding().getName() : null;

        String repName = (invoice.getContract() != null && invoice.getContract().getRepresentativeTenant() != null)
                ? invoice.getContract().getRepresentativeTenant().getFullName() : null;
        String repPhone = (invoice.getContract() != null && invoice.getContract().getRepresentativeTenant() != null)
                ? invoice.getContract().getRepresentativeTenant().getPhone() : null;

        int eConsumed = 0;
        if (invoice.getCurrentElectricIndex() != null && invoice.getPreviousElectricIndex() != null) {
            eConsumed = Math.max(0, invoice.getCurrentElectricIndex() - invoice.getPreviousElectricIndex());
        }

        int wConsumed = 0;
        if (invoice.getCurrentWaterIndex() != null && invoice.getPreviousWaterIndex() != null) {
            wConsumed = Math.max(0, invoice.getCurrentWaterIndex() - invoice.getPreviousWaterIndex());
        }

        long remaining = Math.max(0, invoice.getTotalAmount() - (invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0L));

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceCode(invoice.getInvoiceCode())
                .contractId(invoice.getContract() != null ? invoice.getContract().getId() : null)
                .contractCode(cCode)
                .roomId(rId)
                .roomCode(rCode)
                .buildingName(bName)
                .representativeTenantName(repName)
                .representativeTenantPhone(repPhone)
                .billingPeriod(invoice.getBillingPeriod())
                .dueDate(invoice.getDueDate())
                .roomPrice(invoice.getRoomPrice())
                .servicesAmount(invoice.getServicesAmount())
                .otherAmount(invoice.getOtherAmount())
                .totalAmount(invoice.getTotalAmount())
                .paidAmount(invoice.getPaidAmount())
                .remainingAmount(remaining)
                .previousElectricIndex(invoice.getPreviousElectricIndex())
                .currentElectricIndex(invoice.getCurrentElectricIndex())
                .electricConsumed(eConsumed)
                .previousWaterIndex(invoice.getPreviousWaterIndex())
                .currentWaterIndex(invoice.getCurrentWaterIndex())
                .waterConsumed(wConsumed)
                .status(invoice.getStatus())
                .paymentMethod(invoice.getPaymentMethod())
                .paidAt(invoice.getPaidAt())
                .cancelReason(invoice.getCancelReason())
                .items(itemList)
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}
