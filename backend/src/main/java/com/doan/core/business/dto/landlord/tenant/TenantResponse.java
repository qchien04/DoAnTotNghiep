package com.doan.core.business.dto.landlord.tenant;

import com.doan.core.business.entity.Contract;
import com.doan.core.business.entity.ContractTenant;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.Tenant;
import com.doan.core.business.enums.ContractStatus;
import com.doan.core.business.enums.Gender;
import com.doan.core.business.enums.TenantLinkStatus;
import com.doan.core.business.enums.TenantRoleInRoom;

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
    private Long roomId;
    private String roomName;
    private String buildingName;
    private Long contractId;
    private Long userId;
    private String userEmail;
    private String fullName;
    private String phone;
    private String idCardNumber;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String hometown;
    private String idCardPhotoFront;
    private String idCardPhotoBack;
    private Boolean isRepresentative;
    private TenantRoleInRoom roleInRoom;
    private String identityCard;
    private String birthDate;
    private TenantLinkStatus linkStatus;
    private LocalDateTime createdAt;

    public static TenantResponse fromEntity(Tenant tenant) {
        if (tenant == null)
            return null;

        ContractTenant activeCt = null;
        if (tenant.getContractTenants() != null) {
            activeCt = tenant.getContractTenants().stream()
                    .filter(ct -> ct.getContract() != null && ct.getContract().getStatus() == ContractStatus.ACTIVE)
                    .findFirst()
                    .orElse(null);
        }

        Long rId = null;
        String rName = null;
        String bName = null;
        Long cId = null;
        boolean isRep = false;

        if (activeCt != null) {
            isRep = Boolean.TRUE.equals(activeCt.getIsRepresentative());
            Contract contract = activeCt.getContract();
            Room room = contract.getRoom();
            cId = contract.getId();
            rId = room.getId();
            rName = room.getName();
            if (room.getBuilding() != null) {
                bName = room.getBuilding().getName();
            }
        }

        return TenantResponse.builder()
                .id(tenant.getId())
                .roomId(rId)
                .roomName(rName)
                .buildingName(bName)
                .contractId(cId)
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
                .roleInRoom(isRep ? TenantRoleInRoom.REPRESENTATIVE : TenantRoleInRoom.MEMBER)
                .linkStatus(tenant.getLinkStatus())
                .createdAt(tenant.getCreatedAt())
                .build();
    }

    public static TenantResponse fromContractTenant(ContractTenant ct) {
        if (ct == null || ct.getTenant() == null)
            return null;
        Tenant tenant = ct.getTenant();
        TenantResponse res = fromEntity(tenant);
        res.setIsRepresentative(Boolean.TRUE.equals(ct.getIsRepresentative()));
        res.setRoleInRoom(Boolean.TRUE.equals(ct.getIsRepresentative()) ? TenantRoleInRoom.REPRESENTATIVE
                : TenantRoleInRoom.MEMBER);
        if (ct.getContract() != null) {
            res.setContractId(ct.getContract().getId());
            if (ct.getContract().getRoom() != null) {
                res.setRoomId(ct.getContract().getRoom().getId());
                res.setRoomName(ct.getContract().getRoom().getName());
                if (ct.getContract().getRoom().getBuilding() != null) {
                    res.setBuildingName(ct.getContract().getRoom().getBuilding().getName());
                }
            }
        }
        return res;
    }
}
