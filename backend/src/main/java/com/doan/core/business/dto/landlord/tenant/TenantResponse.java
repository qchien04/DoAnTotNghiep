package com.doan.core.business.dto.landlord.tenant;

import com.doan.core.business.entity.Tenant;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết khách thuê phòng")
public class TenantResponse {

    private Long id;
    private String tenantCode;
    private Long roomId;
    private String roomCode;
    private String buildingName;
    private Long contractId;
    private Long userId;
    private String userEmail;
    private String fullName;
    private String phone;
    private String idCardNumber;
    private String gender;
    private LocalDate dateOfBirth;
    private String hometown;
    private String idCardPhotoFront;
    private String idCardPhotoBack;
    private Boolean isRepresentative;
    private String linkStatus;
    private String status;
    private LocalDateTime createdAt;

    public static TenantResponse fromEntity(Tenant tenant) {
        if (tenant == null) return null;

        String rCode = tenant.getRoom() != null ? tenant.getRoom().getRoomCode() : null;
        String bName = (tenant.getRoom() != null && tenant.getRoom().getBuilding() != null)
                ? tenant.getRoom().getBuilding().getName()
                : null;

        return TenantResponse.builder()
                .id(tenant.getId())
                .tenantCode(tenant.getTenantCode())
                .roomId(tenant.getRoom() != null ? tenant.getRoom().getId() : null)
                .roomCode(rCode)
                .buildingName(bName)
                .contractId(tenant.getContract() != null ? tenant.getContract().getId() : null)
                .userId(tenant.getUser() != null ? tenant.getUser().getId() : null)
                .userEmail(tenant.getUser() != null ? tenant.getUser().getEmail() : null)
                .fullName(tenant.getFullName())
                .phone(tenant.getPhone())
                .idCardNumber(tenant.getIdCardNumber())
                .gender(tenant.getGender())
                .dateOfBirth(tenant.getDateOfBirth())
                .hometown(tenant.getHometown())
                .idCardPhotoFront(tenant.getIdCardPhotoFront())
                .idCardPhotoBack(tenant.getIdCardPhotoBack())
                .isRepresentative(tenant.getIsRepresentative())
                .linkStatus(tenant.getLinkStatus())
                .status(tenant.getStatus())
                .createdAt(tenant.getCreatedAt())
                .build();
    }
}
