package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity Tòa nhà / Khu trọ
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "buildings")
public class Building extends BaseEntity {

    @Column(name = "building_code", nullable = false, unique = true, length = 20)
    private String buildingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "ward", length = 100)
    private String ward;

    @Column(name = "address_detail", nullable = false)
    private String addressDetail;

    @Column(name = "num_floors", nullable = false)
    @Builder.Default
    private Integer numFloors = 1;

    @Column(name = "general_rules", columnDefinition = "TEXT")
    private String generalRules;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "building", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Room> rooms = new ArrayList<>();
}
