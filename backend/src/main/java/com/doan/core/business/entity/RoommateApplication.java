package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity Đơn xin gia nhập nhóm ở ghép (UC 14, UC 15)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "roommate_applications")
public class RoommateApplication extends BaseEntity {


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private RoommatePost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @Column(name = "intro_message", columnDefinition = "TEXT")
    private String introMessage;

    // Câu trả lời khảo sát lối sống của ứng viên (UC14)
    @Column(name = "gender", length = 20)
    private String gender; // MALE, FEMALE

    @Column(name = "sleep_time", length = 50)
    private String sleepTime; // Khoảng 23h30 - 6h30

    @Column(name = "is_smoking")
    @Builder.Default
    private Boolean isSmoking = false;

    @Column(name = "is_pet")
    @Builder.Default
    private Boolean isPet = false;

    @Column(name = "cooking_habit", length = 50)
    private String cookingHabit;

    @Column(name = "guest_habit", length = 50)
    private String guestHabit;

    // Điểm tương thích lối sống tính tự động (UC14: 94%, 72%...)
    @Column(name = "compatibility_score")
    @Builder.Default
    private Integer compatibilityScore = 85;

    @Column(name = "lifestyle_vector", length = 255)
    private String lifestyleVector;

    @Column(name = "is_customized")
    @Builder.Default
    private Boolean isCustomized = false;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;
}
