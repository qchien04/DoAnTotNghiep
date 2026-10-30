package com.doan.core.business.entity;

import com.doan.core.business.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.BatchSize;

/**
 * Entity Phòng trọ
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rooms")
public class Room extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = true)
    private Building building;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = true)
    private User landlord;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "ward", length = 100)
    private String ward;

    @Column(name = "address_detail", columnDefinition = "TEXT")
    private String addressDetail;

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

    @ManyToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 30)
    @JoinTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"), inverseJoinColumns = @JoinColumn(name = "amenity_id"))
    @Builder.Default
    private List<Amenity> amenities = new ArrayList<>();

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private RoomStatus status = RoomStatus.AVAILABLE; // AVAILABLE, OCCUPIED, UNDER_MAINTENANCE, STOPPED

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "is_public", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    @Builder.Default
    private Boolean isPublic = true;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 30)
    @Builder.Default
    private List<RoomImage> images = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 30)
    @JoinTable(name = "room_services", joinColumns = @JoinColumn(name = "room_id"), inverseJoinColumns = @JoinColumn(name = "service_id"))
    @Builder.Default
    private List<UtilityService> services = new ArrayList<>();
}
