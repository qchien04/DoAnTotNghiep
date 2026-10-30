package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity bảng trung gian Hợp đồng - Khách thuê
 * Quản lý vai trò đại diện hợp đồng (isRepresentative)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "contract_tenants", uniqueConstraints = {
    @UniqueConstraint(name = "uq_contract_tenant", columnNames = {"contract_id", "tenant_id"})
})
public class ContractTenant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "is_representative", nullable = false)
    @Builder.Default
    private Boolean isRepresentative = false;
}
