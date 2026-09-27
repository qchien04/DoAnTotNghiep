package com.doan.core.business.dto.tenant;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantRoomResponse {

    private boolean hasLinkedRoom;
    private boolean hasPendingInvitation;
    private RoomLinkInvitationDto invitation;
    private RoomDetailDto room;
    private ContractDetailDto contract;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomLinkInvitationDto {
        private String id;
        private String landlordName;
        private String landlordPhone;
        private String buildingName;
        private String roomName;
        private String address;
        private BigDecimal monthlyRent;
        private String roleInRoom; // REPRESENTATIVE, MEMBER
        private String inviteDate;
        private String status;     // PENDING, ACCEPTED, REJECTED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomDetailDto {
        private String id;
        private String name;
        private String buildingName;
        private String address;
        private BigDecimal monthlyRent;
        private BigDecimal deposit;
        private Double area;
        private List<String> amenities;
        private LandlordDetailDto landlord;
        private List<RoommateInfo> roommates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LandlordDetailDto {
        private String name;
        private String phone;
        private BankAccountDto bankAccount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BankAccountDto {
        private String bankName;
        private String accountNumber;
        private String accountHolder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractDetailDto {
        private String contractNumber;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal monthlyRent;
        private BigDecimal depositAmount;
        private List<ContractServiceDto> services;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractServiceDto {
        private String name;
        private BigDecimal price;
        private String unit;
        private Integer lastIndex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoommateInfo {
        private String name;
        private String role;
        private String phone;
        private String avatar;
    }
}
