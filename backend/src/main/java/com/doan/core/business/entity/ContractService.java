package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entity Dịch vụ thỏa thuận áp dụng cho Hợp đồng
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "contract_services")
public class ContractService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private UtilityService service;

    @Column(name = "service_name", nullable = false, length = 100)
    private String serviceName;

    @Column(name = "unit", nullable = false, length = 30)
    private String unit;

    @Column(name = "applied_unit_price", nullable = false)
    private Long appliedUnitPrice;

    @Column(name = "billing_method", nullable = false, length = 50)
    private String billingMethod;

    @Column(name = "last_index", nullable = false)
    @Builder.Default
    private Integer lastIndex = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
