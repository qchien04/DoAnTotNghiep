package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity Dịch vụ tiện ích (Điện, Nước, Wifi, Rác, Gửi xe...)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "services")
public class UtilityService extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @Column(name = "service_code", length = 20)
    private String serviceCode;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "category", nullable = false, length = 50)
    private String category; // ELECTRICITY, WATER, INTERNET, CLEANING, PARKING, OTHER

    @Column(name = "unit", nullable = false, length = 30)
    private String unit; // kWh, m3, Phòng/Tháng, Người/Tháng, Xe/Tháng

    @Column(name = "unit_price", nullable = false)
    private Long unitPrice;

    @Column(name = "billing_method", nullable = false, length = 50)
    private String billingMethod; // METER_INDEX, FIXED_PER_ROOM, FIXED_PER_PERSON, FIXED_PER_UNIT

    @Column(name = "scope", length = 50)
    @Builder.Default
    private String scope = "ALL";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
