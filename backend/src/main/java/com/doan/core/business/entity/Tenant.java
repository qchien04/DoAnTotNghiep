package com.doan.core.business.entity;

import com.doan.core.business.enums.Gender;
import com.doan.core.business.enums.TenantLinkStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.BatchSize;

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
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 30)
    @Builder.Default
    private List<ContractTenant> contractTenants = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "id_card_number", nullable = false, length = 20)
    private String idCardNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20)
    private Gender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "hometown", length = 150)
    private String hometown;

    @Column(name = "id_card_photo_front", length = 500)
    private String idCardPhotoFront;

    @Column(name = "id_card_photo_back", length = 500)
    private String idCardPhotoBack;

    @Enumerated(EnumType.STRING)
    @Column(name = "link_status", nullable = false, length = 30)
    @Builder.Default
    private TenantLinkStatus linkStatus = TenantLinkStatus.NOT_LINKED; // NOT_LINKED, PENDING, LINKED
}
