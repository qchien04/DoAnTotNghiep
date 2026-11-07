package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Instant;

/**
 * Entity lưu thông tin người dùng trong hệ thống (Chủ trọ, Khách thuê, Admin)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User extends BaseEntity {


    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "phone", length = 20, unique = true)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "id_card_number", unique = true, length = 30)
    private String idCardNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "lifestyle_vector", length = 255)
    private String lifestyleVector;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    @Builder.Default
    private Role role = Role.ROLE_TENANT;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "locked_reason")
    private String lockedReason;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "id_card_verified", nullable = false)
    @Builder.Default
    private Boolean idCardVerified = false;

    @Column(name = "face_embedding", columnDefinition = "TEXT")
    private String faceEmbedding;

    @Column(name = "landlord_verified", nullable = false)
    @Builder.Default
    private Boolean landlordVerified = false;

    @Column(name = "landlord_verification_status", length = 30)
    @Builder.Default
    private String landlordVerificationStatus = "UNVERIFIED";

    @Column(name = "landlord_rejection_reason", length = 500)
    private String landlordRejectionReason;

    @Column(name = "landlord_verified_at")
    private java.time.LocalDateTime landlordVerifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_verified_by")
    private User landlordVerifiedBy;
}
