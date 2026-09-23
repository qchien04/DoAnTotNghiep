package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.tenant.TenantLinkInviteRequest;
import com.doan.core.business.dto.landlord.tenant.TenantRequest;
import com.doan.core.business.dto.landlord.tenant.TenantResponse;
import com.doan.core.business.entity.*;
import com.doan.core.business.repository.*;
import com.doan.core.business.service.LandlordTenantService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordTenantServiceImpl implements LandlordTenantService {

    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final TenantLinkInvitationRepository invitationRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TenantResponse> searchTenants(Long landlordId, Long buildingId, Long roomId, String keyword) {
        log.info("Tìm kiếm khách thuê của chủ trọ id: {}, tòa: {}, phòng: {}, keyword: {}", landlordId, buildingId, roomId, keyword);
        List<Tenant> tenants;
        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            tenants = tenantRepository.searchTenantsWithPattern(landlordId, buildingId, roomId, pattern);
        } else {
            tenants = tenantRepository.filterTenants(landlordId, buildingId, roomId);
        }

        return tenants.stream()
                .map(TenantResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantById(Long landlordId, Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new BaseException(ErrorCode.TENANT_NOT_FOUND));

        validateTenantBelongsToLandlord(tenant, landlordId);

        return TenantResponse.fromEntity(tenant);
    }

    @Override
    @Transactional
    public TenantResponse addTenant(Long landlordId, TenantRequest request) {
        log.info("Thêm khách thuê: {} vào phòng: {} của chủ trọ: {}", request.getFullName(), request.getRoomId(), landlordId);

        Room room = roomRepository.findByIdAndBuildingLandlordId(request.getRoomId(), landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        if (tenantRepository.existsByIdCardNumberAndStatus(request.getIdCardNumber().trim(), "STAYING")) {
            throw new BaseException(ErrorCode.TENANT_ID_CARD_EXISTS);
        }

        String tenantCode = "KT" + (System.currentTimeMillis() % 1000000);

        Tenant tenant = Tenant.builder()
                .room(room)
                .tenantCode(tenantCode)
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .idCardNumber(request.getIdCardNumber().trim())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .hometown(request.getHometown())
                .idCardPhotoFront(request.getIdCardPhotoFront())
                .idCardPhotoBack(request.getIdCardPhotoBack())
                .isRepresentative(Boolean.TRUE.equals(request.getIsRepresentative()))
                .linkStatus("NOT_LINKED")
                .status("STAYING")
                .build();

        Tenant saved = tenantRepository.save(tenant);

        // Cập nhật số người ở hiện tại của phòng
        room.setCurrentOccupancy(room.getCurrentOccupancy() + 1);
        roomRepository.save(room);

        return TenantResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public TenantResponse updateTenant(Long landlordId, Long tenantId, TenantRequest request) {
        log.info("Cập nhật thông tin khách thuê id: {} của chủ trọ: {}", tenantId, landlordId);

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new BaseException(ErrorCode.TENANT_NOT_FOUND));

        validateTenantBelongsToLandlord(tenant, landlordId);

        tenant.setFullName(request.getFullName().trim());
        tenant.setPhone(request.getPhone().trim());
        tenant.setIdCardNumber(request.getIdCardNumber().trim());
        tenant.setGender(request.getGender());
        tenant.setDateOfBirth(request.getDateOfBirth());
        tenant.setHometown(request.getHometown());
        tenant.setIdCardPhotoFront(request.getIdCardPhotoFront());
        tenant.setIdCardPhotoBack(request.getIdCardPhotoBack());
        if (request.getIsRepresentative() != null) {
            tenant.setIsRepresentative(request.getIsRepresentative());
        }

        Tenant updated = tenantRepository.save(tenant);
        return TenantResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void removeTenant(Long landlordId, Long tenantId) {
        log.info("Chuyển khách thuê id: {} ra khỏi phòng của chủ trọ: {}", tenantId, landlordId);

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new BaseException(ErrorCode.TENANT_NOT_FOUND));

        validateTenantBelongsToLandlord(tenant, landlordId);

        // Ngoại lệ: Nếu khách là đại diện hợp đồng chính thì không được xóa trực tiếp
        if (Boolean.TRUE.equals(tenant.getIsRepresentative())) {
            throw new BaseException(ErrorCode.TENANT_IS_REPRESENTATIVE);
        }

        Room room = tenant.getRoom();
        if (room != null) {
            room.setCurrentOccupancy(Math.max(0, room.getCurrentOccupancy() - 1));
            roomRepository.save(room);
        }

        tenant.setStatus("LEFT");
        tenant.setRoom(null);
        tenantRepository.save(tenant);
    }

    @Override
    @Transactional
    public void inviteUserLink(Long landlordId, Long tenantId, TenantLinkInviteRequest request) {
        log.info("Mời liên kết tài khoản cho khách thuê id: {} với từ khóa: {}", tenantId, request.getSearchKeyword());

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new BaseException(ErrorCode.TENANT_NOT_FOUND));

        validateTenantBelongsToLandlord(tenant, landlordId);

        if ("LINKED".equalsIgnoreCase(tenant.getLinkStatus())) {
            throw new BaseException(ErrorCode.TENANT_ALREADY_LINKED);
        }

        String keyword = request.getSearchKeyword().trim();
        User targetUser = userRepository.findByPhone(keyword)
                .or(() -> userRepository.findByEmail(keyword))
                .or(() -> userRepository.findByUsername(keyword))
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        TenantLinkInvitation invitation = TenantLinkInvitation.builder()
                .tenant(tenant)
                .user(targetUser)
                .contract(tenant.getContract())
                .invitedBy(landlord)
                .status("PENDING")
                .build();
        invitationRepository.save(invitation);

        tenant.setLinkStatus("PENDING");
        tenantRepository.save(tenant);

        // Bắn thông báo đẩy cho user
        Notification notification = Notification.builder()
                .user(targetUser)
                .title("Lời mời liên kết phòng trọ từ chủ nhà " + landlord.getFullName())
                .content("Chủ trọ đã gửi lời mời xác nhận bạn đang thuê phòng " +
                        (tenant.getRoom() != null ? tenant.getRoom().getName() : "") +
                        ". Vui lòng xác nhận để xem hợp đồng và hóa đơn.")
                .notificationType("ROOM_LINK")
                .relatedEntityType("TENANT_INVITATION")
                .relatedEntityId(invitation.getId())
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    private void validateTenantBelongsToLandlord(Tenant tenant, Long landlordId) {
        if (tenant.getRoom() == null || tenant.getRoom().getBuilding() == null ||
                !tenant.getRoom().getBuilding().getLandlord().getId().equals(landlordId)) {
            throw new BaseException(ErrorCode.FORBIDDEN);
        }
    }
}
