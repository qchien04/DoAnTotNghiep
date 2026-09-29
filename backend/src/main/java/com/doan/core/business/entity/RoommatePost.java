package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Entity Bài đăng tìm người ở ghép (UC 11 - UC 13)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "roommate_posts")
public class RoommatePost extends BaseEntity {


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "title", nullable = false, length = 250)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "post_type", nullable = false, length = 30)
    private String postType; // HAS_ROOM, SEARCHING_ROOM

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room; // Nullable nếu chưa có phòng

    @Column(name = "area_name", length = 250)
    private String areaName;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "city", length = 100)
    @Builder.Default
    private String city = "Hà Nội";

    @Column(name = "share_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal sharePrice; // Chi phí chia sẻ / người / tháng

    @Column(name = "total_room_price", precision = 12, scale = 2)
    private BigDecimal totalRoomPrice;

    @Column(name = "needed_roommates", nullable = false)
    @Builder.Default
    private Integer neededRoommates = 1;

    @Column(name = "current_roommates", nullable = false)
    @Builder.Default
    private Integer currentRoommates = 1;

    // Vị trí bản đồ (Dành cho UC13 - tìm theo bán kính)
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "radius_km")
    private Double radiusKm;

    // Tiêu chí lối sống (UC11, UC12, UC13)
    @Column(name = "gender_preference", length = 20)
    @Builder.Default
    private String genderPreference = "ANY"; // MALE, FEMALE, ANY

    @Column(name = "sleep_time", length = 50)
    @Builder.Default
    private String sleepTime = "BEFORE_24H"; // BEFORE_23H, BEFORE_24H, AFTER_24H

    @Column(name = "is_no_smoking")
    @Builder.Default
    private Boolean isNoSmoking = true;

    @Column(name = "is_pet_friendly")
    @Builder.Default
    private Boolean isPetFriendly = false;

    @Column(name = "cooking_frequency", length = 50)
    @Builder.Default
    private String cookingFrequency = "DAILY"; // DAILY, SOMETIMES, RARELY

    @Column(name = "cleanliness_level", length = 50)
    @Builder.Default
    private String cleanlinessLevel = "VERY_CLEAN";

    @Column(name = "guest_allowed", length = 50)
    @Builder.Default
    private String guestAllowed = "WEEKENDS_ONLY";

    @Column(name = "lifestyle_vector", length = 255)
    private String lifestyleVector;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "OPEN"; // OPEN, COMPLETED, CLOSED
}
