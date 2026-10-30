package com.doan.core.business.dto.landlord.invoice;

import com.doan.core.business.entity.Building;
import com.doan.core.business.entity.Contract;
import com.doan.core.business.entity.ContractTenant;
import com.doan.core.business.entity.Invoice;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.Tenant;
import com.doan.core.business.enums.InvoiceItemType;
import com.doan.core.business.enums.InvoiceStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
        private Long contractId;
        private Long roomId;
        private String roomName;
        private String buildingName;
        private String representativeTenantName;
        private String representativeTenantPhone;
        private String billingPeriod;
        private LocalDate dueDate;
        private Long roomPrice;
        private Long servicesAmount;
        private Long totalAmount;
        private Long paidAmount;
        private Long remainingAmount;
        private InvoiceStatus status;
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
                private Long contractServiceId;
                private InvoiceItemType itemType;
                private String itemName;
                private Integer previousIndex;
                private Integer currentIndex;
                private Integer quantity;
                private Long unitPrice;
                private Long amount;
                private String note;
        }

        public static InvoiceResponse fromEntity(Invoice invoice) {
                if (invoice == null)
                        return null;

                List<InvoiceItemResponse> itemList = invoice.getItems() != null
                                ? invoice.getItems().stream().map(item -> InvoiceItemResponse.builder()
                                                .id(item.getId())
                                                .contractServiceId(item.getContractService() != null
                                                                ? item.getContractService().getId()
                                                                : null)
                                                .itemType(item.getItemType())
                                                .itemName(item.getItemName())
                                                .previousIndex(item.getPreviousIndex())
                                                .currentIndex(item.getCurrentIndex())
                                                .quantity(item.getQuantity())
                                                .unitPrice(item.getUnitPrice())
                                                .amount(item.getAmount())
                                                .note(item.getNote())
                                                .build()).collect(Collectors.toList())
                                : List.of();

                Contract contract = invoice.getContract();
                Room room = contract.getRoom();
                Building building = room.getBuilding();

                Long rId = room.getId();
                String rName = room.getName();
                String bName = building != null ? building.getName() : null;
                ContractTenant repCt = (contract != null && contract.getContractTenants() != null)
                                ? contract.getContractTenants().stream()
                                                .filter(ct -> Boolean.TRUE.equals(ct.getIsRepresentative()))
                                                .findFirst()
                                                .orElse(null)
                                : null;
                Tenant repTenant = repCt != null ? repCt.getTenant() : null;
                String repName = repTenant != null ? repTenant.getFullName() : null;
                String repPhone = repTenant != null ? repTenant.getPhone() : null;

                long remaining = Math.max(0, invoice.getTotalAmount() - invoice.getPaidAmount());

                return InvoiceResponse.builder()
                                .id(invoice.getId())
                                .contractId(contract.getId())
                                .roomId(rId)
                                .roomName(rName)
                                .buildingName(bName)
                                .representativeTenantName(repName)
                                .representativeTenantPhone(repPhone)
                                .billingPeriod(invoice.getBillingPeriod())
                                .dueDate(invoice.getDueDate())
                                .roomPrice(invoice.getRoomPrice())
                                .servicesAmount(invoice.getServicesAmount())
                                .totalAmount(invoice.getTotalAmount())
                                .paidAmount(invoice.getPaidAmount())
                                .remainingAmount(remaining)
                                .status(invoice.getStatus())
                                .paymentMethod(invoice.getPaymentMethod())
                                .paidAt(invoice.getPaidAt())
                                .cancelReason(invoice.getCancelReason())
                                .items(itemList)
                                .createdAt(invoice.getCreatedAt())
                                .build();
        }
}
