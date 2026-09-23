package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Entity Khách thuê phòng trọ
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tenants")
public class Tenant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "tenant_code", length = 20, unique = true)
    private String tenantCode;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "id_card_number", nullable = false, length = 20)
    private String idCardNumber;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "hometown", length = 150)
    private String hometown;

    @Column(name = "id_card_photo_front", length = 500)
    private String idCardPhotoFront;

    @Column(name = "id_card_photo_back", length = 500)
    private String idCardPhotoBack;

    @Column(name = "is_representative", nullable = false)
    @Builder.Default
    private Boolean isRepresentative = false;

    @Column(name = "link_status", nullable = false, length = 30)
    @Builder.Default
    private String linkStatus = "NOT_LINKED"; // NOT_LINKED, PENDING, LINKED

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "STAYING"; // STAYING, LEFT
}
