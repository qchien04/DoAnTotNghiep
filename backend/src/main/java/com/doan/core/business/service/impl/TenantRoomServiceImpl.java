package com.doan.core.business.service.impl;

import com.doan.core.business.dto.tenant.TenantContractHistoryResponse;
import com.doan.core.business.dto.tenant.TenantInvoiceResponse;
import com.doan.core.business.dto.tenant.TenantRoomResponse;
import com.doan.core.business.dto.tenant.VietQRPaymentResponse;
import com.doan.core.business.entity.*;
import com.doan.core.business.repository.InvoiceRepository;
import com.doan.core.business.repository.TenantLinkInvitationRepository;
import com.doan.core.business.repository.TenantRepository;
import com.doan.core.business.service.TenantRoomService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Override
    @Transactional(readOnly = true)
    public TenantRoomResponse getMyRoomDetails(Long userId) {
        log.info("Lấy thông tin phòng trọ của người thuê userId={}", userId);

        Tenant tenant = tenantRepository.findByUserId(userId).orElse(null);
        if (tenant != null && tenant.getRoom() != null && "LINKED".equalsIgnoreCase(tenant.getLinkStatus())) {
            Room room = tenant.getRoom();
            Contract contract = tenant.getContract();
            Building building = room.getBuilding();
            User landlord = (building != null) ? building.getLandlord() : null;

            List<Tenant> roomTenants = tenantRepository.findByRoomId(room.getId());
            List<TenantRoomResponse.RoommateInfo> roommates = roomTenants.stream()
                    .map(t -> TenantRoomResponse.RoommateInfo.builder()
                            .name(t.getFullName())
                            .role(Boolean.TRUE.equals(t.getIsRepresentative()) ? "Đại diện hợp đồng" : "Thành viên")
                            .phone(t.getPhone())
                            .avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100")
                            .build())
                    .collect(Collectors.toList());

            List<String> amenities = new ArrayList<>();
            if (room.getAmenities() != null && !room.getAmenities().isBlank()) {
                amenities = List.of(room.getAmenities().split(",\\s*"));
            }

            String buildingAddress = null;
            if (building != null) {
                StringBuilder sb = new StringBuilder();
                if (building.getAddressDetail() != null) sb.append(building.getAddressDetail());
                if (building.getWard() != null && !building.getWard().isBlank()) sb.append(", ").append(building.getWard());
                if (building.getProvince() != null && !building.getProvince().isBlank()) sb.append(", ").append(building.getProvince());
                buildingAddress = sb.toString();
            }

            TenantRoomResponse.LandlordDetailDto landlordDto = TenantRoomResponse.LandlordDetailDto.builder()
                    .name(landlord != null ? landlord.getFullName() : "Nguyễn Văn Thành")
                    .phone(landlord != null ? landlord.getPhone() : "0912345678")
                    .bankAccount(TenantRoomResponse.BankAccountDto.builder()
                            .bankName("MB Bank (Quân Đội)")
                            .accountNumber("0912345678999")
                            .accountHolder(landlord != null && landlord.getFullName() != null ? landlord.getFullName().toUpperCase() : "NGUYEN VAN THANH")
                            .build())
                    .build();

            TenantRoomResponse.RoomDetailDto roomDto = TenantRoomResponse.RoomDetailDto.builder()
                    .id(String.valueOf(room.getId()))
                    .name(room.getName())
                    .buildingName(building != null ? building.getName() : "Tòa nhà Ánh Dương")
                    .address(buildingAddress)
                    .monthlyRent(room.getListedPrice() != null ? BigDecimal.valueOf(room.getListedPrice()) : BigDecimal.ZERO)
                    .deposit(room.getStandardDeposit() != null ? BigDecimal.valueOf(room.getStandardDeposit()) : BigDecimal.ZERO)
                    .area(room.getArea() != null ? room.getArea().doubleValue() : 0.0)
                    .amenities(amenities)
                    .landlord(landlordDto)
                    .roommates(roommates)
                    .build();

            List<TenantRoomResponse.ContractServiceDto> contractServices = new ArrayList<>();
            if (contract != null && contract.getContractServices() != null) {
                contractServices = contract.getContractServices().stream()
                        .map(cs -> TenantRoomResponse.ContractServiceDto.builder()
                                .name(cs.getServiceName())
                                .price(cs.getAppliedUnitPrice() != null ? BigDecimal.valueOf(cs.getAppliedUnitPrice()) : BigDecimal.ZERO)
                                .unit(cs.getUnit())
                                .lastIndex(cs.getLastIndex())
                                .build())
                        .collect(Collectors.toList());
            }

            TenantRoomResponse.ContractDetailDto contractDto = null;
            if (contract != null) {
                contractDto = TenantRoomResponse.ContractDetailDto.builder()
                        .contractNumber("HD" + contract.getId())
                        .startDate(contract.getStartDate())
                        .endDate(contract.getEndDate())
                        .monthlyRent(contract.getRentPrice() != null ? BigDecimal.valueOf(contract.getRentPrice()) : BigDecimal.ZERO)
                        .depositAmount(contract.getDepositAmount() != null ? BigDecimal.valueOf(contract.getDepositAmount()) : BigDecimal.ZERO)
                        .services(contractServices)
                        .build();
            }

            return TenantRoomResponse.builder()
                    .hasLinkedRoom(true)
                    .hasPendingInvitation(false)
                    .room(roomDto)
                    .contract(contractDto)
                    .build();
        }

        // Chưa liên kết phòng: Kiểm tra xem có lời mời nào đang chờ (PENDING) cho user này không
        List<TenantLinkInvitation> pendingInvites = invitationRepository.findByUserIdAndStatus(userId, "PENDING");
        if (!pendingInvites.isEmpty()) {
            TenantLinkInvitation invite = pendingInvites.get(0);
            Contract contract = invite.getContract();
            Room room = (contract != null && contract.getRoom() != null) ? contract.getRoom() : ((invite.getTenant() != null) ? invite.getTenant().getRoom() : null);
            Building building = (room != null) ? room.getBuilding() : null;
            User landlord = invite.getInvitedBy();
            if (landlord == null && building != null) {
                landlord = building.getLandlord();
            }

            String addressStr = "";
            if (building != null) {
                StringBuilder sb = new StringBuilder();
                if (room != null) sb.append(room.getName() != null ? room.getName() : "Phòng " + room.getId()).append(", ");
                if (building.getAddressDetail() != null) sb.append(building.getAddressDetail());
                if (building.getWard() != null && !building.getWard().isBlank()) sb.append(", ").append(building.getWard());
                if (building.getProvince() != null && !building.getProvince().isBlank()) sb.append(", ").append(building.getProvince());
                addressStr = sb.toString();
            }

            boolean isRep = invite.getTenant() != null && Boolean.TRUE.equals(invite.getTenant().getIsRepresentative());

            BigDecimal rentPrice = null;
            if (contract != null && contract.getRentPrice() != null) {
                rentPrice = BigDecimal.valueOf(contract.getRentPrice());
            } else if (room != null && room.getListedPrice() != null) {
                rentPrice = BigDecimal.valueOf(room.getListedPrice());
            }

            TenantRoomResponse.RoomLinkInvitationDto invitationDto = TenantRoomResponse.RoomLinkInvitationDto.builder()
                    .id(String.valueOf(invite.getId()))
                    .landlordName(landlord != null ? landlord.getFullName() : "Nguyễn Văn Thành")
                    .landlordPhone(landlord != null ? landlord.getPhone() : "0912345678")
                    .buildingName(building != null ? building.getName() : "Tòa nhà Ánh Dương")
                    .roomName(room != null ? room.getName() : "P102")
                    .address(addressStr)
                    .monthlyRent(rentPrice != null ? rentPrice : BigDecimal.ZERO)
                    .roleInRoom(isRep ? "REPRESENTATIVE" : "MEMBER")
                    .status("PENDING")
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

        invitation.setStatus("ACCEPTED");
        invitation.setRespondedAt(Instant.now());
        invitationRepository.save(invitation);

        Tenant tenant = invitation.getTenant();
        if (tenant != null) {
            tenant.setUser(invitation.getUser());
            tenant.setLinkStatus("LINKED");
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

        invitation.setStatus("REJECTED");
        invitation.setRejectReason(reason);
        invitation.setRespondedAt(Instant.now());
        invitationRepository.save(invitation);

        Tenant tenant = invitation.getTenant();
        if (tenant != null) {
            tenant.setLinkStatus("REJECTED");
            tenantRepository.save(tenant);
        }

        log.info("Từ chối liên kết phòng user={}, lý do={}", userId, reason);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenantInvoiceResponse> getMyInvoices(Long userId) {
        List<Tenant> tenants = tenantRepository.findAllByUserIdAndLinkStatus(userId, "LINKED");
        if (tenants.isEmpty()) {
            return List.of();
        }

        List<Long> contractIds = tenants.stream()
                .map(Tenant::getContract)
                .filter(c -> c != null && c.getId() != null)
                .map(Contract::getId)
                .distinct()
                .collect(Collectors.toList());

        if (contractIds.isEmpty()) {
            return List.of();
        }

        List<Invoice> invoices = invoiceRepository.findByContractIdInOrderByIdDesc(contractIds);

        return invoices.stream()
                .filter(i -> !"DRAFT".equalsIgnoreCase(i.getStatus()))
                .map(this::mapToInvoiceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenantContractHistoryResponse> getMyContracts(Long userId) {
        log.info("Lấy lịch sử danh sách hợp đồng của người thuê userId={}", userId);
        List<Tenant> tenants = tenantRepository.findAllByUserId(userId);
        if (tenants.isEmpty()) {
            return List.of();
        }

        List<TenantContractHistoryResponse> result = new ArrayList<>();

        for (Tenant tenant : tenants) {
            Contract contract = tenant.getContract();
            if (contract == null) continue;

            Room room = tenant.getRoom() != null ? tenant.getRoom() : contract.getRoom();
            Building building = room != null ? room.getBuilding() : null;
            User landlord = (building != null && building.getLandlord() != null) ? building.getLandlord() : contract.getLandlord();

            String buildingAddress = null;
            if (building != null) {
                StringBuilder sb = new StringBuilder();
                if (building.getAddressDetail() != null) sb.append(building.getAddressDetail());
                if (building.getWard() != null && !building.getWard().isBlank()) sb.append(", ").append(building.getWard());
                if (building.getProvince() != null && !building.getProvince().isBlank()) sb.append(", ").append(building.getProvince());
                buildingAddress = sb.toString();
            }

            List<TenantRoomResponse.ContractServiceDto> contractServices = new ArrayList<>();
            if (contract.getContractServices() != null) {
                contractServices = contract.getContractServices().stream()
                        .map(cs -> TenantRoomResponse.ContractServiceDto.builder()
                                .name(cs.getServiceName())
                                .price(cs.getAppliedUnitPrice() != null ? BigDecimal.valueOf(cs.getAppliedUnitPrice()) : BigDecimal.ZERO)
                                .unit(cs.getUnit())
                                .build())
                        .collect(Collectors.toList());
            }

            boolean isCurrent = "LINKED".equalsIgnoreCase(tenant.getLinkStatus())
                    && "STAYING".equalsIgnoreCase(tenant.getStatus())
                    && "ACTIVE".equalsIgnoreCase(contract.getStatus());

            result.add(TenantContractHistoryResponse.builder()
                    .id(contract.getId())
                    .status(contract.getStatus())
                    .isCurrent(isCurrent)
                    .isRepresentative(Boolean.TRUE.equals(tenant.getIsRepresentative()))
                    .startDate(contract.getStartDate())
                    .endDate(contract.getEndDate())
                    .monthlyRent(contract.getRentPrice() != null ? BigDecimal.valueOf(contract.getRentPrice()) : BigDecimal.ZERO)
                    .depositAmount(contract.getDepositAmount() != null ? BigDecimal.valueOf(contract.getDepositAmount()) : BigDecimal.ZERO)
                    .depositRefundAmount(contract.getDepositRefundAmount() != null ? BigDecimal.valueOf(contract.getDepositRefundAmount()) : null)
                    .termsAndConditions(contract.getTermsAndConditions())
                    .pdfFileUrl(contract.getPdfFileUrl())
                    .roomId(room != null ? room.getId() : null)
                    .roomName(room != null ? room.getName() : null)
                    .buildingName(building != null ? building.getName() : null)
                    .buildingAddress(buildingAddress)
                    .roomArea(room != null && room.getArea() != null ? room.getArea().doubleValue() : null)
                    .landlordName(landlord != null ? landlord.getFullName() : null)
                    .landlordPhone(landlord != null ? landlord.getPhone() : null)
                    .services(contractServices)
                    .build());
        }

        // Sắp xếp: Hợp đồng hiện tại (isCurrent = true) lên đầu, tiếp đến các hợp đồng theo ngày bắt đầu mới nhất
        result.sort((a, b) -> {
            if (Boolean.TRUE.equals(a.getIsCurrent()) && !Boolean.TRUE.equals(b.getIsCurrent())) return -1;
            if (!Boolean.TRUE.equals(a.getIsCurrent()) && Boolean.TRUE.equals(b.getIsCurrent())) return 1;
            if (a.getStartDate() != null && b.getStartDate() != null) {
                return b.getStartDate().compareTo(a.getStartDate());
            }
            return b.getId().compareTo(a.getId());
        });

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public VietQRPaymentResponse getVietQRInfo(Long userId, Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy hóa đơn"));

        String bankCode = "MB";
        String accountNumber = "0912345678999";
        String accountHolder = "NGUYỄN VĂN THÀNH";
        String bankName = "Ngân hàng TMCP Quân Đội (MB Bank)";

        String bNumber = "HD" + invoice.getId();
        String transferContent = bNumber.replaceAll("[^a-zA-Z0-9]", "") + " Thanh toan";

        long total = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0L;
        long paid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0L;
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

        invoice.setPaymentNote("Khách thuê đã quét VietQR chuyển khoản, đang chờ chủ trọ xác nhận gạch nợ.");
        invoice.setPaymentMethod("VIETQR");
        invoiceRepository.save(invoice);
        log.info("Khách thuê userId={} xác nhận đã chuyển khoản hóa đơn id={}", userId, invoiceId);
    }

    private TenantInvoiceResponse mapToInvoiceResponse(Invoice i) {
        Room room = (i.getContract() != null) ? i.getContract().getRoom() : null;
        Building building = (room != null) ? room.getBuilding() : null;

        List<TenantInvoiceResponse.InvoiceItemDto> items = new ArrayList<>();
        BigDecimal elecAmount = BigDecimal.ZERO;
        BigDecimal waterAmount = BigDecimal.ZERO;

        if (i.getItems() != null) {
            for (InvoiceItem it : i.getItems()) {
                BigDecimal itemTotal = it.getAmount() != null ? BigDecimal.valueOf(it.getAmount()) : BigDecimal.ZERO;
                BigDecimal unitPrice = it.getUnitPrice() != null ? BigDecimal.valueOf(it.getUnitPrice()) : BigDecimal.ZERO;
                double qty = it.getQuantity() != null ? it.getQuantity().doubleValue() : 1.0;

                items.add(TenantInvoiceResponse.InvoiceItemDto.builder()
                        .serviceName(it.getItemName())
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .totalAmount(itemTotal)
                        .build());

                if (it.getItemName() != null) {
                    String lower = it.getItemName().toLowerCase();
                    if (lower.contains("điện")) {
                        elecAmount = elecAmount.add(itemTotal);
                    } else if (lower.contains("nước")) {
                        waterAmount = waterAmount.add(itemTotal);
                    }
                }
            }
        }

        int elecUsage = 0;
        int waterUsage = 0;
        if (i.getItems() != null) {
            for (InvoiceItem item : i.getItems()) {
                String name = (item.getItemName() != null ? item.getItemName() : "").toLowerCase();
                if (name.contains("điện")) {
                    if (item.getCurrentIndex() != null && item.getPreviousIndex() != null) {
                        elecUsage = Math.max(0, item.getCurrentIndex() - item.getPreviousIndex());
                    } else if (item.getQuantity() != null) {
                        elecUsage = item.getQuantity().intValue();
                    }
                } else if (name.contains("nước")) {
                    if (item.getCurrentIndex() != null && item.getPreviousIndex() != null) {
                        waterUsage = Math.max(0, item.getCurrentIndex() - item.getPreviousIndex());
                    } else if (item.getQuantity() != null) {
                        waterUsage = item.getQuantity().intValue();
                    }
                }
            }
        }

        long total = i.getTotalAmount() != null ? i.getTotalAmount() : 0L;
        long paid = i.getPaidAmount() != null ? i.getPaidAmount() : 0L;
        long remaining = Math.max(0L, total - paid);

        return TenantInvoiceResponse.builder()
                .id(i.getId())
                .billingMonth(i.getBillingPeriod())
                .roomName(room != null ? room.getName() : "P102")
                .buildingName(building != null ? building.getName() : "Tòa nhà Ánh Dương")
                .electricityUsage(elecUsage)
                .waterUsage(waterUsage)
                .roomRent(BigDecimal.valueOf(i.getRoomPrice() != null ? i.getRoomPrice() : 0L))
                .electricityAmount(elecAmount)
                .waterAmount(waterAmount)
                .serviceAmount(BigDecimal.valueOf(i.getServicesAmount() != null ? i.getServicesAmount() : 0L))
                .totalAmount(BigDecimal.valueOf(total))
                .paidAmount(BigDecimal.valueOf(paid))
                .remainingAmount(BigDecimal.valueOf(remaining))
                .dueDate(i.getDueDate())
                .status(i.getStatus())
                .items(items)
                .build();
    }
}
