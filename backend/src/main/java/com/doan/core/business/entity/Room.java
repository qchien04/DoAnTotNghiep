package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity Phòng trọ
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rooms", uniqueConstraints = {
        @UniqueConstraint(name = "uk_rooms_building_code", columnNames = {"building_id", "room_code"})
})
public class Room extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(name = "room_code", nullable = false, length = 20)
    private String roomCode;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "floor", nullable = false)
    @Builder.Default
    private Integer floor = 1;

    @Column(name = "area", precision = 6, scale = 2, nullable = false)
    private BigDecimal area;

    @Column(name = "listed_price", nullable = false)
    private Long listedPrice;

    @Column(name = "standard_deposit", nullable = false)
    private Long standardDeposit;

    @Column(name = "max_capacity", nullable = false)
    @Builder.Default
    private Integer maxCapacity = 2;

    @Column(name = "current_occupancy", nullable = false)
    @Builder.Default
    private Integer currentOccupancy = 0;

    @Column(name = "furnishing_level", length = 50)
    @Builder.Default
    private String furnishingLevel = "BASIC";

    @Column(name = "amenities", columnDefinition = "TEXT")
    private String amenities;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, OCCUPIED, UNDER_MAINTENANCE, STOPPED

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RoomImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "room")
    @Builder.Default
    private List<Tenant> tenants = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "room_services",
        joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    @Builder.Default
    private List<UtilityService> services = new ArrayList<>();
}
