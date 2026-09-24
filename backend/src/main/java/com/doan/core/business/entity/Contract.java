package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity Hợp đồng thuê phòng trọ
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "contracts")
public class Contract extends BaseEntity {

    @Column(name = "contract_code", nullable = false, unique = true, length = 50)
    private String contractCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representative_tenant_id")
    private Tenant representativeTenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "rent_price", nullable = false)
    private Long rentPrice;

    @Column(name = "deposit_amount", nullable = false)
    private Long depositAmount;

    @Column(name = "payment_cycle_day", nullable = false)
    @Builder.Default
    private Integer paymentCycleDay = 5;

    @Column(name = "initial_electric_index", nullable = false)
    @Builder.Default
    private Integer initialElectricIndex = 0;

    @Column(name = "initial_water_index", nullable = false)
    @Builder.Default
    private Integer initialWaterIndex = 0;

    @Column(name = "final_electric_index")
    private Integer finalElectricIndex;

    @Column(name = "final_water_index")
    private Integer finalWaterIndex;

    @Column(name = "deposit_refund_amount")
    private Long depositRefundAmount;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, EXPIRING_SOON, TERMINATED, CANCELLED

    @Column(name = "pdf_file_url", length = 500)
    private String pdfFileUrl;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 30)
    @Builder.Default
    private List<ContractService> contractServices = new ArrayList<>();

    @OneToMany(mappedBy = "contract")
    @org.hibernate.annotations.BatchSize(size = 30)
    @Builder.Default
    private List<Tenant> tenants = new ArrayList<>();
}
