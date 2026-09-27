package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Entity Chi tiết từng khoản mục trong hóa đơn
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "invoice_items")
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_service_id")
    private ContractService contractService;

    @Column(name = "item_type", nullable = false, length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'SERVICE'")
    @Builder.Default
    private String itemType = "SERVICE";

    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;

    @Column(name = "previous_index")
    private Integer previousIndex;

    @Column(name = "current_index")
    private Integer currentIndex;

    @Column(name = "quantity", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "unit_price", nullable = false)
    private Long unitPrice;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "note")
    private String note;
}
