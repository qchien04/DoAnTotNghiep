package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.tenant.TenantLinkInviteRequest;
import com.doan.core.business.dto.landlord.tenant.TenantRequest;
import com.doan.core.business.dto.landlord.tenant.TenantResponse;
import com.doan.core.business.entity.*;
import com.doan.core.business.enums.*;
import com.doan.core.business.repository.*;
import com.doan.core.business.service.LandlordTenantService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordTenantServiceImpl implements LandlordTenantService {

    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final TenantLinkInvitationRepository invitationRepository;
    private final NotificationRepository notificationRepository;
    private final ContractTenantRepository contractTenantRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TenantResponse> searchTenants(Long landlordId, Long buildingId, Long roomId, String keyword,
            int page, int size, String sortBy, String sortDirection) {
        log.info("Tìm kiếm khách thuê của chủ trọ id: {}, tòa: {}, phòng: {}, keyword: {}", landlordId, buildingId,
                roomId, keyword);
        String kw = (keyword != null && !keyword.trim().isBlank()) ? keyword.trim() : null;

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        String sortProperty = switch (sortBy != null ? sortBy.toLowerCase() : "id") {
            case "fullname" -> "fullName";
            case "phone" -> "phone";
            case "startdate" -> "startDate";
            case "status" -> "status";
            default -> "id";
        };
        Sort sort = Sort.by(direction, sortProperty);

        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Page<Tenant> tenantsPage = tenantRepository.filterTenants(landlordId, buildingId, roomId, kw, pageable);
        Page<TenantResponse> dtoPage = tenantsPage.map(TenantResponse::fromEntity);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantById(Long landlordId, Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new BaseException(ErrorCode.TENANT_NOT_FOUND));

        return TenantResponse.fromEntity(tenant);
    }

    @Override
    @Transactional
    public TenantResponse addTenant(Long landlordId, TenantRequest request) {
        log.info("Thêm khách thuê: {} cho chủ trọ: {}", request.getFullName(), landlordId);

        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        if (tenantRepository.existsActiveByLandlordIdAndIdCardNumber(landlordId, request.getIdCardNumber().trim())) {
            throw new BaseException(ErrorCode.TENANT_ID_CARD_EXISTS);
        }

        Tenant tenant = Tenant.builder()
                .landlord(landlord)
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .idCardNumber(request.getIdCardNumber().trim())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .hometown(request.getHometown())
                .idCardPhotoFront(request.getIdCardPhotoFront())
                .idCardPhotoBack(request.getIdCardPhotoBack())
                .linkStatus(TenantLinkStatus.NOT_LINKED)
                .build();

        Tenant saved = tenantRepository.save(tenant);
        return TenantResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public TenantResponse updateTenant(Long landlordId, Long tenantId, TenantRequest request) {
        log.info("Cập nhật thông tin khách thuê id: {} của chủ trọ: {}", tenantId, landlordId);

        Tenant tenant = tenantRepository.findByIdAndLandlordId(tenantId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.TENANT_NOT_FOUND));

        if (request.getIdCardNumber() != null
                && !request.getIdCardNumber().trim().equalsIgnoreCase(tenant.getIdCardNumber())) {
            if (tenantRepository.existsActiveByLandlordIdAndIdCardNumberAndIdNot(landlordId,
                    request.getIdCardNumber().trim(), tenantId)) {
                throw new BaseException(ErrorCode.TENANT_ID_CARD_EXISTS);
            }
        }

        tenant.setFullName(request.getFullName().trim());
        tenant.setPhone(request.getPhone().trim());
        tenant.setIdCardNumber(request.getIdCardNumber().trim());
        if (request.getGender() != null) {
            tenant.setGender(request.getGender());
        }
        tenant.setDateOfBirth(request.getDateOfBirth());
        tenant.setHometown(request.getHometown());
        tenant.setIdCardPhotoFront(request.getIdCardPhotoFront());
        tenant.setIdCardPhotoBack(request.getIdCardPhotoBack());

        Optional<ContractTenant> activeCtOpt = contractTenantRepository.findActiveByTenantId(tenantId);
        if (activeCtOpt.isPresent()) {
            ContractTenant ct = activeCtOpt.get();
            if (request.getIsRepresentative() != null) {
                ct.setIsRepresentative(request.getIsRepresentative());
                contractTenantRepository.save(ct);
            } else if (request.getRoleInRoom() != null) {
                ct.setIsRepresentative(request.getRoleInRoom() == TenantRoleInRoom.REPRESENTATIVE);
                contractTenantRepository.save(ct);
            }
        }

        Tenant updated = tenantRepository.save(tenant);
        return TenantResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void removeTenant(Long landlordId, Long tenantId) {
        log.info("Chuyển khách thuê id: {} ra khỏi phòng của chủ trọ: {}", tenantId, landlordId);

        tenantRepository.findByIdAndLandlordId(tenantId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.TENANT_NOT_FOUND));

        Optional<ContractTenant> activeCtOpt = contractTenantRepository.findActiveByTenantId(tenantId);
        if (activeCtOpt.isPresent()) {
            ContractTenant ct = activeCtOpt.get();
            if (Boolean.TRUE.equals(ct.getIsRepresentative())) {
                throw new BaseException(ErrorCode.TENANT_IS_REPRESENTATIVE);
            }
            Contract contract = ct.getContract();
            contractTenantRepository.delete(ct);

            if (contract != null && contract.getRoom() != null) {
                Room room = contract.getRoom();
                long remaining = contractTenantRepository.countByContractId(contract.getId());
                room.setCurrentOccupancy((int) remaining);
                roomRepository.save(room);
            }
        }
    }

    @Override
    @Transactional
    public void inviteUserLink(Long landlordId, Long tenantId, TenantLinkInviteRequest request) {
        log.info("Mời liên kết tài khoản cho khách thuê id: {} với từ khóa: {}", tenantId, request.getSearchKeyword());

        Tenant tenant = tenantRepository.findByIdAndLandlordId(tenantId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.TENANT_NOT_FOUND));

        if (tenant.getLinkStatus() == TenantLinkStatus.LINKED) {
            throw new BaseException(ErrorCode.TENANT_ALREADY_LINKED);
        }

        String keyword = request.getSearchKeyword().trim();
        User targetUser = userRepository.findByPhone(keyword)
                .or(() -> userRepository.findByEmail(keyword))
                .or(() -> userRepository.findByUsername(keyword))
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        java.util.Optional<ContractTenant> activeCtOpt = contractTenantRepository.findActiveByTenantId(tenantId);
        Contract activeContract = activeCtOpt.map(ContractTenant::getContract).orElse(null);
        Room activeRoom = activeContract != null ? activeContract.getRoom() : null;

        TenantLinkInvitation invitation = TenantLinkInvitation.builder()
                .tenant(tenant)
                .user(targetUser)
                .contract(activeContract)
                .invitedBy(landlord)
                .status(InvitationStatus.PENDING)
                .build();
        invitationRepository.save(invitation);

        tenant.setLinkStatus(TenantLinkStatus.PENDING);
        tenantRepository.save(tenant);

        // Bắn thông báo đẩy cho user
        Notification notification = Notification.builder()
                .user(targetUser)
                .title("Lời mời liên kết phòng trọ từ chủ nhà " + landlord.getFullName())
                .content("Chủ trọ đã gửi lời mời xác nhận bạn đang thuê phòng " +
                        (activeRoom != null ? activeRoom.getName() : "") +
                        ". Vui lòng xác nhận để xem hợp đồng và hóa đơn.")
                .notificationType(NotificationType.ROOM_LINK)
                .relatedEntityType("TENANT_INVITATION")
                .relatedEntityId(invitation.getId())
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void cancelInvitation(Long landlordId, Long tenantId) {
        log.info("Hủy lời mời liên kết tài khoản cho khách thuê id: {}", tenantId);

        Tenant tenant = tenantRepository.findByIdAndLandlordId(tenantId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.TENANT_NOT_FOUND));

        if (tenant.getLinkStatus() != TenantLinkStatus.PENDING) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Khách thuê này không có lời mời đang chờ xử lý");
        }

        // Xóa tất cả lời mời PENDING của tenant này
        List<TenantLinkInvitation> pendingInvitations = invitationRepository.findByTenantId(tenantId);
        pendingInvitations.stream()
                .filter(inv -> inv.getStatus() == InvitationStatus.PENDING)
                .forEach(inv -> {
                    inv.setStatus(InvitationStatus.CANCELLED);
                    inv.setRespondedAt(java.time.Instant.now());
                    invitationRepository.save(inv);
                });

        tenant.setLinkStatus(TenantLinkStatus.NOT_LINKED);
        tenant.setUser(null);
        tenantRepository.save(tenant);

        log.info("Đã hủy lời mời liên kết tài khoản cho khách thuê id={}", tenantId);
    }
}
