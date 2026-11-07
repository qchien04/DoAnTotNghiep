package com.doan.core.business.dto.landlord.verification;

import com.doan.core.business.entity.LandlordVerification;
import com.doan.core.business.entity.LandlordVerificationStatus;
import com.doan.core.business.entity.LandlordVerificationType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Chi tiết hồ sơ xác minh quyền chủ trọ")
public class LandlordVerificationResponse {

    private Long id;
    private Long userId;
    private String landlordName;
    private String landlordEmail;
    private String landlordPhone;
    private String landlordAvatarUrl;

    private LandlordVerificationType verificationType;
    private String verificationTypeDisplay;

    private String propertyAddress;
    private String documentNumber;
    private String notes;

    private LandlordVerificationStatus status;
    private String rejectionReason;

    private LocalDateTime verifiedAt;
    private String verifiedByName;

    private List<LandlordVerificationDocumentResponse> documents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LandlordVerificationResponse fromEntity(LandlordVerification verification, String baseUrl) {
        if (verification == null) return null;

        String typeDisplay = verification.getVerificationType() == LandlordVerificationType.OWNERSHIP_CERTIFICATE
                ? "Giấy tờ sở hữu nhà/đất (Sổ đỏ / Sổ hồng)"
                : "Hợp đồng ủy quyền quản lý / cho thuê";

        List<LandlordVerificationDocumentResponse> docs = verification.getDocuments() != null
                ? verification.getDocuments().stream()
                        .map(doc -> LandlordVerificationDocumentResponse.fromEntity(doc, baseUrl))
                        .collect(Collectors.toList())
                : List.of();

        return LandlordVerificationResponse.builder()
                .id(verification.getId())
                .userId(verification.getUser() != null ? verification.getUser().getId() : null)
                .landlordName(verification.getUser() != null ? verification.getUser().getFullName() : null)
                .landlordEmail(verification.getUser() != null ? verification.getUser().getEmail() : null)
                .landlordPhone(verification.getUser() != null ? verification.getUser().getPhone() : null)
                .landlordAvatarUrl(verification.getUser() != null ? verification.getUser().getAvatarUrl() : null)
                .verificationType(verification.getVerificationType())
                .verificationTypeDisplay(typeDisplay)
                .propertyAddress(verification.getPropertyAddress())
                .documentNumber(verification.getDocumentNumber())
                .notes(verification.getNotes())
                .status(verification.getStatus())
                .rejectionReason(verification.getRejectionReason())
                .verifiedAt(verification.getVerifiedAt())
                .verifiedByName(verification.getVerifiedBy() != null ? verification.getVerifiedBy().getFullName() : null)
                .documents(docs)
                .createdAt(verification.getCreatedAt())
                .updatedAt(verification.getUpdatedAt())
                .build();
    }
}

