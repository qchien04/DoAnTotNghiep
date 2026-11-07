package com.doan.core.business.entity;

import com.doan.core.business.enums.Gender;
import com.doan.core.business.enums.RoommateApplicationStatus;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20)
    private Gender gender;

    @Column(name = "is_smoking")
    @Builder.Default
    private Boolean isSmoking = false;

    @Column(name = "is_pet")
    @Builder.Default
    private Boolean isPet = false;

    // Điểm tương thích sinh hoạt tính tự động (UC14: 94%, 72%...)
    @Column(name = "compatibility_score")
    @Builder.Default
    private Integer compatibilityScore = 0;

    @Column(name = "lifestyle_vector", length = 255)
    private String lifestyleVector;

    @Column(name = "is_customized")
    @Builder.Default
    private Boolean isCustomized = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private RoommateApplicationStatus status = RoommateApplicationStatus.PENDING; // PENDING, APPROVED, REJECTED

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;
}
