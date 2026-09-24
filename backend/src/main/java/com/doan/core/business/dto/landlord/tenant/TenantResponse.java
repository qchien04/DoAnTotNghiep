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
    private String roomName;
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
    private String roleInRoom;
    private String identityCard;
    private String birthDate;
    private String linkStatus;
    private String status;
    private LocalDateTime createdAt;

    public static TenantResponse fromEntity(Tenant tenant) {
        if (tenant == null) return null;

        String rCode = tenant.getRoom() != null ? tenant.getRoom().getRoomCode() : null;
        String bName = (tenant.getRoom() != null && tenant.getRoom().getBuilding() != null)
                ? tenant.getRoom().getBuilding().getName()
                : null;

        boolean isRep = Boolean.TRUE.equals(tenant.getIsRepresentative());
        if (!isRep && tenant.getContract() != null && tenant.getContract().getRepresentativeTenant() != null) {
            isRep = tenant.getId().equals(tenant.getContract().getRepresentativeTenant().getId());
        }

        return TenantResponse.builder()
                .id(tenant.getId())
                .tenantCode(tenant.getTenantCode())
                .roomId(tenant.getRoom() != null ? tenant.getRoom().getId() : null)
                .roomCode(rCode)
                .roomName(rCode)
                .buildingName(bName)
                .contractId(tenant.getContract() != null ? tenant.getContract().getId() : null)
                .userId(tenant.getUser() != null ? tenant.getUser().getId() : null)
                .userEmail(tenant.getUser() != null ? tenant.getUser().getEmail() : null)
                .fullName(tenant.getFullName())
                .phone(tenant.getPhone())
                .idCardNumber(tenant.getIdCardNumber())
                .identityCard(tenant.getIdCardNumber())
                .gender(tenant.getGender())
                .dateOfBirth(tenant.getDateOfBirth())
                .birthDate(tenant.getDateOfBirth() != null ? tenant.getDateOfBirth().toString() : null)
                .hometown(tenant.getHometown())
                .idCardPhotoFront(tenant.getIdCardPhotoFront())
                .idCardPhotoBack(tenant.getIdCardPhotoBack())
                .isRepresentative(isRep)
                .roleInRoom(isRep ? "REPRESENTATIVE" : "MEMBER")
                .linkStatus(tenant.getLinkStatus())
                .status(tenant.getStatus())
                .createdAt(tenant.getCreatedAt())
                .build();
    }
}
