package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity Hóa đơn tiền phòng hàng tháng
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "invoices")
public class Invoice extends BaseEntity {


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "billing_period", nullable = false, length = 20)
    private String billingPeriod; // Ví dụ: "10/2026"

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "room_price", nullable = false)
    private Long roomPrice;

    @Column(name = "services_amount", nullable = false)
    @Builder.Default
    private Long servicesAmount = 0L;

    @Column(name = "other_amount", nullable = false)
    @Builder.Default
    private Long otherAmount = 0L;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Column(name = "paid_amount", nullable = false)
    @Builder.Default
    private Long paidAmount = 0L;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "UNPAID"; // UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED

    @Column(name = "payment_method", length = 30)
    private String paymentMethod; // CASH, BANK_TRANSFER, VIETQR

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "payment_note", columnDefinition = "TEXT")
    private String paymentNote;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 30)
    @Builder.Default
    private List<InvoiceItem> items = new ArrayList<>();
}
