package com.doan.core.business.service.impl;

import com.doan.core.business.dto.tenant.TenantContractHistoryResponse;
import com.doan.core.business.dto.tenant.TenantInvoiceResponse;
import com.doan.core.business.dto.tenant.TenantRoomResponse;
import com.doan.core.business.dto.tenant.VietQRPaymentResponse;
import com.doan.core.business.entity.*;
import com.doan.core.business.enums.*;
import com.doan.core.business.repository.ContractRepository;
import com.doan.core.business.repository.InvoiceRepository;
import com.doan.core.business.repository.TenantLinkInvitationRepository;
import com.doan.core.business.repository.TenantRepository;
import com.doan.core.business.service.TenantRoomService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantRoomServiceImpl implements TenantRoomService {

    private final TenantRepository tenantRepository;
    private final TenantLinkInvitationRepository invitationRepository;
    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;

    @Override
    @Transactional(readOnly = true)
    public TenantRoomResponse getMyRoomDetails(Long userId) {
        log.info("Lấy thông tin phòng trọ của người thuê userId={}", userId);

        List<Tenant> activeTenants = tenantRepository.findActiveLinkedTenants(userId, TenantLinkStatus.LINKED);
        Tenant tenant = activeTenants.isEmpty() ? null : activeTenants.get(0);
        ContractTenant activeCt = (tenant != null && tenant.getContractTenants() != null)
                ? tenant.getContractTenants().stream()
                        .filter(ct -> ct.getContract() != null && ct.getContract().getStatus() == ContractStatus.ACTIVE)
                        .findFirst()
                        .orElse(null)
                : null;
        if (tenant != null && activeCt != null && activeCt.getContract() != null
                && activeCt.getContract().getRoom() != null && tenant.getLinkStatus() == TenantLinkStatus.LINKED) {
            Contract contract = activeCt.getContract();
            Room room = contract.getRoom();
            Building building = room.getBuilding();
            User landlord = (building != null) ? building.getLandlord() : null;

            List<ContractTenant> contractTenants = contract.getContractTenants() != null ? contract.getContractTenants()
                    : List.of();
            List<TenantRoomResponse.RoommateInfo> roommates = contractTenants.stream()
                    .filter(ct -> ct.getTenant() != null)
                    .map(ct -> TenantRoomResponse.RoommateInfo.builder()
                            .name(ct.getTenant().getFullName())
                            .role(Boolean.TRUE.equals(ct.getIsRepresentative()) ? "Đại diện hợp đồng" : "Thành viên")
                            .phone(ct.getTenant().getPhone())
                            .avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100")
                            .build())
                    .collect(Collectors.toList());

            List<String> amenities = room.getAmenities() != null
                    ? room.getAmenities().stream().map(com.doan.core.business.entity.Amenity::getName).collect(Collectors.toList())
                    : new ArrayList<>();

            String buildingAddress = null;
            if (building != null) {
                StringBuilder sb = new StringBuilder();
                if (building.getAddressDetail() != null)
                    sb.append(building.getAddressDetail());
                if (building.getWard() != null && !building.getWard().isBlank())
                    sb.append(", ").append(building.getWard());
                if (building.getProvince() != null && !building.getProvince().isBlank())
                    sb.append(", ").append(building.getProvince());
                buildingAddress = sb.toString();
            }

            TenantRoomResponse.LandlordDetailDto landlordDto = TenantRoomResponse.LandlordDetailDto.builder()
                    .name(landlord != null ? landlord.getFullName() : "Chủ trọ")
                    .phone(landlord != null ? landlord.getPhone() : "")
                    .bankAccount(TenantRoomResponse.BankAccountDto.builder()
                            .bankName("MB Bank (Quân Đội)")
                            .accountNumber("0912345678999")
                            .accountHolder(landlord != null && landlord.getFullName() != null
                                    ? landlord.getFullName().toUpperCase()
                                    : "CHU TRO")
                            .build())
                    .build();

            TenantRoomResponse.RoomDetailDto roomDto = TenantRoomResponse.RoomDetailDto.builder()
                    .id(String.valueOf(room.getId()))
                    .name(room.getName())
                    .buildingName(building != null ? building.getName() : "Phòng riêng")
                    .address(buildingAddress)
                    .monthlyRent(BigDecimal.valueOf(room.getListedPrice()))
                    .deposit(BigDecimal.valueOf(room.getStandardDeposit()))
                    .area(room.getArea().doubleValue())
                    .amenities(amenities)
                    .landlord(landlordDto)
                    .roommates(roommates)
                    .build();

            List<TenantRoomResponse.ContractServiceDto> contractServices = new ArrayList<>();
            if (contract.getContractServices() != null) {
                contractServices = contract.getContractServices().stream()
                        .map(cs -> TenantRoomResponse.ContractServiceDto.builder()
                                .name(cs.getServiceName())
                                .price(BigDecimal.valueOf(cs.getAppliedUnitPrice()))
                                .unit(cs.getUnit())
                                .lastIndex(cs.getLastIndex())
                                .build())
                        .collect(Collectors.toList());
            }

            TenantRoomResponse.ContractDetailDto contractDto = TenantRoomResponse.ContractDetailDto.builder()
                    .contractNumber("HD" + contract.getId())
                    .startDate(contract.getStartDate())
                    .endDate(contract.getEndDate())
                    .monthlyRent(BigDecimal.valueOf(contract.getRentPrice()))
                    .depositAmount(BigDecimal.valueOf(contract.getDepositAmount()))
                    .services(contractServices)
                    .build();

            return TenantRoomResponse.builder()
                    .hasLinkedRoom(true)
                    .hasPendingInvitation(false)
                    .room(roomDto)
                    .contract(contractDto)
                    .build();
        }

        // Chưa liên kết phòng: Kiểm tra xem có lời mời nào đang chờ (PENDING) cho user
        // này không
        List<TenantLinkInvitation> pendingInvites = invitationRepository.findByUserIdAndStatus(userId,
                InvitationStatus.PENDING);
        if (!pendingInvites.isEmpty()) {
            TenantLinkInvitation invite = pendingInvites.get(0);
            Contract contract = invite.getContract();
            Room room = (contract != null) ? contract.getRoom() : null;
            Building building = (room != null) ? room.getBuilding() : null;
            User landlord = invite.getInvitedBy();
            if (landlord == null && building != null) {
                landlord = building.getLandlord();
            }

            String addressStr = "";
            if (building != null) {
                StringBuilder sb = new StringBuilder();
                if (room != null)
                    sb.append(room.getName()).append(", ");
                if (building.getAddressDetail() != null)
                    sb.append(building.getAddressDetail());
                if (building.getWard() != null && !building.getWard().isBlank())
                    sb.append(", ").append(building.getWard());
                if (building.getProvince() != null && !building.getProvince().isBlank())
                    sb.append(", ").append(building.getProvince());
                addressStr = sb.toString();
            }

            boolean isRep = false;
            if (contract != null && invite.getTenant() != null && contract.getContractTenants() != null) {
                isRep = contract.getContractTenants().stream()
                        .anyMatch(ct -> ct.getTenant() != null
                                && ct.getTenant().getId().equals(invite.getTenant().getId())
                                && Boolean.TRUE.equals(ct.getIsRepresentative()));
            }

            BigDecimal rentPrice = BigDecimal.ZERO;
            if (contract != null) {
                rentPrice = BigDecimal.valueOf(contract.getRentPrice());
            } else if (room != null) {
                rentPrice = BigDecimal.valueOf(room.getListedPrice());
            }

            TenantRoomResponse.RoomLinkInvitationDto invitationDto = TenantRoomResponse.RoomLinkInvitationDto.builder()
                    .id(String.valueOf(invite.getId()))
                    .landlordName(landlord != null ? landlord.getFullName() : "Nguyễn Văn Thành")
                    .landlordPhone(landlord != null ? landlord.getPhone() : "0912345678")
                    .buildingName(building != null ? building.getName() : "Tòa nhà Ánh Dương")
                    .roomName(room != null ? room.getName() : "P102")
                    .address(addressStr)
                    .monthlyRent(rentPrice)
                    .roleInRoom(isRep ? "REPRESENTATIVE" : "MEMBER")
                    .status(invite.getStatus())
                    .build();

            return TenantRoomResponse.builder()
                    .hasLinkedRoom(false)
                    .hasPendingInvitation(true)
                    .invitation(invitationDto)
                    .build();
        }

        // Không có phòng và cũng không có lời mời nào
        return TenantRoomResponse.builder()
                .hasLinkedRoom(false)
                .hasPendingInvitation(false)
                .build();
    }

    @Override
    @Transactional
    public void acceptRoomLink(Long userId, Long invitationId) {
        TenantLinkInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy lời mời liên kết phòng"));

        if (!invitation.getUser().getId().equals(userId)) {
            throw new BaseException(ErrorCode.FORBIDDEN, "Lời mời liên kết này không dành cho bạn");
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setRespondedAt(Instant.now());
        invitationRepository.save(invitation);

        Tenant tenant = invitation.getTenant();
        if (tenant != null) {
            tenant.setUser(invitation.getUser());
            tenant.setLinkStatus(TenantLinkStatus.LINKED);
            tenantRepository.save(tenant);
        }

        log.info("Chấp nhận liên kết phòng thành công cho user={}", userId);
    }

    @Override
    @Transactional
    public void rejectRoomLink(Long userId, Long invitationId, String reason) {
        TenantLinkInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy lời mời liên kết phòng"));

        if (!invitation.getUser().getId().equals(userId)) {
            throw new BaseException(ErrorCode.FORBIDDEN, "Lời mời liên kết này không dành cho bạn");
        }

        invitation.setStatus(InvitationStatus.REJECTED);
        invitation.setRejectReason(reason);
        invitation.setRespondedAt(Instant.now());
        invitationRepository.save(invitation);

        Tenant tenant = invitation.getTenant();
        if (tenant != null) {
            tenant.setLinkStatus(TenantLinkStatus.REJECTED);
            tenantRepository.save(tenant);
        }

        log.info("Từ chối liên kết phòng user={}, lý do={}", userId, reason);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TenantInvoiceResponse> getMyInvoices(Long userId, String keyword, InvoiceStatus status,
            String billingPeriod, int page, int size, String sortBy, String sortDirection) {
        String bp = (billingPeriod != null && !billingPeriod.trim().isBlank()) ? billingPeriod.trim() : null;
        String kw = (keyword != null && !keyword.trim().isBlank()) ? keyword.trim() : null;

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        String sortProperty = switch (sortBy != null ? sortBy.toLowerCase() : "id") {
            case "billingperiod" -> "billingPeriod";
            case "totalamount" -> "totalAmount";
            case "duedate" -> "dueDate";
            case "status" -> "status";
            default -> "id";
        };
        Sort sort = Sort.by(direction, sortProperty);

        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        log.info(
                "Lấy danh sách hóa đơn cho người thuê userId: {}, status: {}, billingPeriod: {}, keyword: {}, pageable: {}",
                userId, status, bp, kw, pageable);
        Page<Invoice> invoices = invoiceRepository.filterTenantInvoices(userId, status, bp, kw, pageable);
        Page<TenantInvoiceResponse> dtoPage = invoices.map(this::mapToInvoiceResponse);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TenantContractHistoryResponse> getMyContracts(Long userId, String keyword,
            ContractStatus status,
            int page, int size, String sortBy, String sortDirection) {
        log.info("Lấy lịch sử danh sách hợp đồng của người thuê userId={}", userId);
        String kw = (keyword != null && !keyword.trim().isBlank()) ? keyword.trim() : null;

        Sort sort;
        if (sortBy != null && !sortBy.isBlank()) {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            String sortProperty = switch (sortBy.toLowerCase()) {
                case "startdate" -> "startDate";
                case "enddate" -> "endDate";
                case "monthlyrent", "rentprice" -> "rentPrice";
                case "depositamount" -> "depositAmount";
                case "status" -> "status";
                default -> "id";
            };
            sort = Sort.by(direction, sortProperty);
        } else {
            sort = Sort.by(Sort.Direction.DESC, "startDate", "id");
        }

        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Page<Contract> contracts = contractRepository.filterTenantContracts(userId, status, kw, pageable);
        List<TenantContractHistoryResponse> result = new ArrayList<>();

        for (Contract contract : contracts.getContent()) {
            ContractTenant ct = contract.getContractTenants() != null ? contract.getContractTenants().stream()
                    .filter(item -> item.getTenant() != null && item.getTenant().getUser() != null
                            && item.getTenant().getUser().getId().equals(userId))
                    .findFirst().orElse(null) : null;
            if (ct == null)
                continue;
            Tenant tenant = ct.getTenant();

            Room room = contract.getRoom();
            Building building = room != null ? room.getBuilding() : null;
            User landlord = (building != null && building.getLandlord() != null) ? building.getLandlord()
                    : contract.getLandlord();

            String buildingAddress = null;
            if (building != null) {
                StringBuilder sb = new StringBuilder();
                if (building.getAddressDetail() != null)
                    sb.append(building.getAddressDetail());
                if (building.getWard() != null && !building.getWard().isBlank())
                    sb.append(", ").append(building.getWard());
                if (building.getProvince() != null && !building.getProvince().isBlank())
                    sb.append(", ").append(building.getProvince());
                buildingAddress = sb.toString();
            }

            List<TenantRoomResponse.ContractServiceDto> contractServices = new ArrayList<>();
            if (contract.getContractServices() != null) {
                contractServices = contract.getContractServices().stream()
                        .map(cs -> TenantRoomResponse.ContractServiceDto.builder()
                                .name(cs.getServiceName())
                                .price(BigDecimal.valueOf(cs.getAppliedUnitPrice()))
                                .unit(cs.getUnit())
                                .build())
                        .collect(Collectors.toList());
            }

            boolean isCurrent = tenant.getLinkStatus() == TenantLinkStatus.LINKED
                    && contract.getStatus() == ContractStatus.ACTIVE;

            result.add(TenantContractHistoryResponse.builder()
                    .id(contract.getId())
                    .status(contract.getStatus())
                    .isCurrent(isCurrent)
                    .isRepresentative(Boolean.TRUE.equals(ct.getIsRepresentative()))
                    .startDate(contract.getStartDate())
                    .endDate(contract.getEndDate())
                    .monthlyRent(BigDecimal.valueOf(contract.getRentPrice()))
                    .depositAmount(BigDecimal.valueOf(contract.getDepositAmount()))
                    .depositRefundAmount(contract.getDepositRefundAmount() != null
                            ? BigDecimal.valueOf(contract.getDepositRefundAmount())
                            : null)
                    .termsAndConditions(contract.getTermsAndConditions())
                    .pdfFileUrl(contract.getPdfFileUrl())
                    .roomId(room != null ? room.getId() : null)
                    .roomName(room != null ? room.getName() : null)
                    .buildingName(building != null ? building.getName() : null)
                    .buildingAddress(buildingAddress)
                    .roomArea(room != null ? room.getArea().doubleValue() : null)
                    .landlordName(landlord != null ? landlord.getFullName() : null)
                    .landlordPhone(landlord != null ? landlord.getPhone() : null)
                    .services(contractServices)
                    .build());
        }

        Page<TenantContractHistoryResponse> dtoPage = new PageImpl<>(result, pageable, contracts.getTotalElements());
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public VietQRPaymentResponse getVietQRInfo(Long userId, Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy hóa đơn"));

        // Phân quyền: Kiểm tra người dùng có phải là khách thuê của hợp đồng này không
        // (Fail-close)
        Contract contract = invoice.getContract();
        boolean isTenantOfContract = false;
        if (contract != null && contract.getContractTenants() != null) {
            isTenantOfContract = contract.getContractTenants().stream()
                    .anyMatch(ct -> ct.getTenant() != null && ct.getTenant().getUser() != null
                            && ct.getTenant().getUser().getId().equals(userId)
                            && ct.getTenant().getLinkStatus() == TenantLinkStatus.LINKED);
        }
        if (!isTenantOfContract) {
            throw new BaseException(ErrorCode.FORBIDDEN, "Bạn không có quyền truy cập hóa đơn này");
        }

        User landlord = contract != null ? contract.getLandlord() : null;

        String bankCode = "MB";
        String accountNumber = "0912345678999";
        String accountHolder = (landlord != null && landlord.getFullName() != null)
                ? landlord.getFullName().toUpperCase()
                : "CHU TRO";
        String bankName = "Ngân hàng TMCP Quân Đội (MB Bank)";

        String bNumber = "HD" + invoice.getId();
        String transferContent = bNumber.replaceAll("[^a-zA-Z0-9]", "") + " Thanh toan";

        long total = invoice.getTotalAmount();
        long paid = invoice.getPaidAmount();
        long remaining = Math.max(0L, total - paid);
        BigDecimal amount = BigDecimal.valueOf(remaining > 0 ? remaining : total);

        String encodedContent = URLEncoder.encode(transferContent, StandardCharsets.UTF_8);
        String encodedHolder = URLEncoder.encode(accountHolder, StandardCharsets.UTF_8);

        String qrCodeUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                bankCode, accountNumber, amount.toPlainString(), encodedContent, encodedHolder);

        return VietQRPaymentResponse.builder()
                .billNumber(bNumber)
                .amount(amount)
                .accountNumber(accountNumber)
                .accountHolder(accountHolder)
                .bankName(bankName)
                .bankCode(bankCode)
                .qrCodeUrl(qrCodeUrl)
                .transferContent(transferContent)
                .build();
    }

    @Override
    @Transactional
    public void confirmTransferred(Long userId, Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy hóa đơn"));

        // Phân quyền: Kiểm tra người dùng có phải là khách thuê của hợp đồng này không
        // (Fail-close)
        Contract contract = invoice.getContract();
        boolean isTenantOfContract = false;
        if (contract != null && contract.getContractTenants() != null) {
            isTenantOfContract = contract.getContractTenants().stream()
                    .anyMatch(ct -> ct.getTenant() != null && ct.getTenant().getUser() != null
                            && ct.getTenant().getUser().getId().equals(userId)
                            && ct.getTenant().getLinkStatus() == TenantLinkStatus.LINKED);
        }
        if (!isTenantOfContract) {
            throw new BaseException(ErrorCode.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này");
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BaseException(ErrorCode.INVOICE_ALREADY_PAID);
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Hóa đơn đã bị hủy, không thể thanh toán");
        }

        invoice.setPaymentNote("Khách thuê đã quét VietQR chuyển khoản, đang chờ chủ trọ xác nhận gạch nợ.");
        invoice.setPaymentMethod("VIETQR");
        invoiceRepository.save(invoice);
        log.info("Khách thuê userId={} xác nhận đã chuyển khoản hóa đơn id={}", userId, invoiceId);
    }

    private TenantInvoiceResponse mapToInvoiceResponse(Invoice i) {
        Room room = i.getContract().getRoom();
        Building building = room.getBuilding();

        List<TenantInvoiceResponse.InvoiceItemDto> items = new ArrayList<>();

        if (i.getItems() != null) {
            for (InvoiceItem it : i.getItems()) {
                items.add(TenantInvoiceResponse.InvoiceItemDto.builder()
                        .serviceName(it.getItemName())
                        .quantity(1)
                        .unitPrice(it.getUnitPrice())
                        .totalAmount(it.getAmount())
                        .build());
            }
        }

        long total = i.getTotalAmount();
        long paid = i.getPaidAmount();
        long remaining = Math.max(0L, total - paid);

        return TenantInvoiceResponse.builder()
                .id(i.getId())
                .billingMonth(i.getBillingPeriod())
                .roomName(room.getName())
                .buildingName(building != null ? building.getName() : "Phòng riêng")
                .roomRent(i.getRoomPrice())
                .serviceAmount(i.getServicesAmount())
                .totalAmount(total)
                .paidAmount(paid)
                .remainingAmount(remaining)
                .dueDate(i.getDueDate())
                .status(i.getStatus())
                .items(items)
                .build();
    }
}
