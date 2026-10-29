package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.invoice.*;
import com.doan.core.business.entity.*;
import com.doan.core.business.enums.*;
import com.doan.core.business.repository.*;
import com.doan.core.business.service.LandlordInvoiceService;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordInvoiceServiceImpl implements LandlordInvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ContractServiceRepository contractServiceRepository;
    private final ContractRepository contractRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InvoiceResponse> getInvoices(Long landlordId, Long buildingId, String billingPeriod,
                                                     InvoiceStatus status, String keyword, int page, int size, String sortBy, String sortDirection) {
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
        Sort sort = org.springframework.data.domain.Sort.by(direction, sortProperty);

        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        log.info(
                "Lấy danh sách hóa đơn cho chủ trọ id: {}, tòa: {}, kỳ cước: {}, trạng thái: {}, keyword: {}, pageable: {}",
                landlordId, buildingId, billingPeriod, status, kw, pageable);
        Page<Invoice> invoices = invoiceRepository.filterInvoices(landlordId, buildingId, billingPeriod, status, kw,
                pageable);

        Page<InvoiceResponse> dtoPage = invoices.map(InvoiceResponse::fromEntity);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long landlordId, Long invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndContractLandlordId(invoiceId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.INVOICE_NOT_FOUND));

        return InvoiceResponse.fromEntity(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse createInvoice(Long landlordId, MeterReadingInvoiceRequest request) {
        log.info("Lập hóa đơn kỳ: {} cho hợp đồng: {}, phòng: {} của chủ trọ: {}",
                request.getBillingPeriod(), request.getContractId(), request.getRoomId(), landlordId);

        if (request.getBillingPeriod() == null || request.getBillingPeriod().trim().isBlank()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Kỳ cước hóa đơn không được để trống");
        }

        // 1. Phân giải hợp đồng (Fail-close: Validate dứt khoát, không fallback lung
        // tung)
        Contract contract;
        if (request.getContractId() != null) {
            contract = contractRepository.findByIdAndLandlordId(request.getContractId(), landlordId)
                    .orElseThrow(() -> new BaseException(ErrorCode.CONTRACT_NOT_FOUND));
        } else if (request.getRoomId() != null) {
            contract = contractRepository.findByRoomIdAndStatus(request.getRoomId(), ContractStatus.ACTIVE)
                    .filter(c -> c.getLandlord() != null && c.getLandlord().getId().equals(landlordId))
                    .orElseThrow(() -> new BaseException(ErrorCode.CONTRACT_NOT_FOUND));
        } else {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Vui lòng chọn hợp đồng hoặc phòng để lập hóa đơn");
        }

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new BaseException(ErrorCode.BAD_REQUEST,
                    "Chỉ có thể lập hóa đơn cho hợp đồng đang có hiệu lực (ACTIVE)");
        }

        String billingPeriod = request.getBillingPeriod().trim();
        if (invoiceRepository.existsByContractIdAndBillingPeriodAndStatusNot(contract.getId(), billingPeriod,
                InvoiceStatus.CANCELLED)) {
            throw new BaseException(ErrorCode.INVOICE_ALREADY_EXISTS);
        }

        boolean isDraft = Boolean.TRUE.equals(request.getIsDraft());

        // Validate hạn nộp tiền (Fail-close)
        LocalDate dueDate;
        if (!isDraft) {
            if (request.getDueDate() == null) {
                throw new BaseException(ErrorCode.BAD_REQUEST, "Vui lòng chọn hạn thanh toán cho hóa đơn chính thức");
            }
            if (request.getDueDate().isBefore(LocalDate.now())) {
                throw new BaseException(ErrorCode.BAD_REQUEST, "Hạn thanh toán không được ở quá khứ");
            }
            dueDate = request.getDueDate();
        } else {
            dueDate = request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(10);
        }

        List<InvoiceItem> items = new ArrayList<>();
        long servicesAmount = 0L;

        // 2. Khoản mục tiền thuê phòng cố định từ hợp đồng
        items.add(InvoiceItem.builder()
                .itemType(InvoiceItemType.ROOM_RENT)
                .itemName("Tiền thuê phòng " + contract.getRoom().getName())
                .quantity(BigDecimal.ONE)
                .unitPrice(contract.getRentPrice())
                .amount(contract.getRentPrice())
                .note("1 tháng")
                .build());

        // 3. Xử lý danh sách khoản mục dịch vụ
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (MeterReadingInvoiceRequest.InvoiceItemRequest itemReq : request.getItems()) {
                InvoiceItemType itemType = itemReq.getItemType();

                // Bỏ qua nếu client gửi kèm khoản mục tiền phòng (đã được tạo ở trên)
                if (itemType == InvoiceItemType.ROOM_RENT) {
                    continue;
                }

                // Xác thực ContractService thuộc về hợp đồng này (Fail-close: Chặn dùng chéo
                // hợp đồng)
                ContractService cs = null;
                if (itemReq.getContractServiceId() != null) {
                    cs = contractServiceRepository.findById(itemReq.getContractServiceId())
                            .orElseThrow(() -> new BaseException(ErrorCode.SERVICE_NOT_FOUND,
                                    "Không tìm thấy dịch vụ thỏa thuận của hợp đồng"));

                    if (!cs.getContract().getId().equals(contract.getId())) {
                        throw new BaseException(ErrorCode.BAD_REQUEST,
                                "Dịch vụ tiện ích (id=" + cs.getId() + ") không thuộc về hợp đồng này");
                    }
                }

                if (itemType == null) {
                    itemType = (cs != null) ? InvoiceItemType.SERVICE : InvoiceItemType.SURCHARGE;
                }

                // Validate số tiền không âm (Fail-close: Không dùng Math.abs để che giấu lỗi)
                if (itemReq.getUnitPrice() != null && itemReq.getUnitPrice() < 0) {
                    throw new BaseException(ErrorCode.BAD_REQUEST, "Đơn giá khoản mục không được là số âm");
                }
                if (itemReq.getAmount() != null && itemReq.getAmount() < 0) {
                    throw new BaseException(ErrorCode.BAD_REQUEST, "Số tiền khoản mục không được là số âm");
                }

                long price = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice()
                        : (cs != null ? cs.getAppliedUnitPrice() : 0L);

                BigDecimal qty = BigDecimal.ONE;
                Integer pIdx = itemReq.getPreviousIndex();
                Integer cIdx = itemReq.getCurrentIndex();

                // Xác thực nghiêm ngặt chỉ số công tơ điện nước (METER_INDEX)
                if (cs != null && cs.getBillingMethod() == BillingMethod.METER_INDEX) {
                    if (pIdx == null) {
                        pIdx = cs.getLastIndex() != null ? cs.getLastIndex() : 0;
                    }

                    if (cIdx != null) {
                        if (cIdx < pIdx) {
                            throw new BaseException(ErrorCode.INVALID_METER_READING,
                                    "Chỉ số mới (" + cIdx + ") không được nhỏ hơn chỉ số cũ (" + pIdx
                                            + ") cho dịch vụ: " + cs.getServiceName());
                        }
                        qty = BigDecimal.valueOf(cIdx - pIdx);
                        cs.setLastIndex(cIdx);
                        contractServiceRepository.save(cs);
                    } else {
                        if (!isDraft) {
                            throw new BaseException(ErrorCode.INVALID_METER_READING,
                                    "Vui lòng nhập chỉ số mới cho dịch vụ: " + cs.getServiceName());
                        }
                        qty = BigDecimal.ZERO;
                        cIdx = pIdx;
                    }
                } else if (itemReq.getQuantity() != null) {
                    if (itemReq.getQuantity().compareTo(BigDecimal.ZERO) < 0) {
                        throw new BaseException(ErrorCode.BAD_REQUEST, "Số lượng không được là số âm");
                    }
                    qty = itemReq.getQuantity();
                }

                long amount = itemReq.getAmount() != null ? itemReq.getAmount()
                        : qty.multiply(BigDecimal.valueOf(price)).longValue();

                if (itemType == InvoiceItemType.DISCOUNT) {
                    servicesAmount -= amount;
                } else {
                    servicesAmount += amount;
                }

                items.add(InvoiceItem.builder()
                        .contractService(cs)
                        .itemType(itemType)
                        .itemName(itemReq.getItemName() != null ? itemReq.getItemName().trim()
                                : (cs != null ? cs.getServiceName() : "Khoản mục khác"))
                        .previousIndex(pIdx)
                        .currentIndex(cIdx)
                        .quantity(qty)
                        .unitPrice(price)
                        .amount(amount)
                        .note(itemReq.getNote())
                        .build());
            }
        } else {
            // Khi client không gửi items:
            // Nếu phát hành hóa đơn thật mà hợp đồng có dịch vụ công tơ METER_INDEX -> Bắt
            // buộc phải chốt số trước (Fail-close)
            if (contract.getContractServices() != null && !contract.getContractServices().isEmpty()) {
                if (!isDraft) {
                    boolean hasMeterService = contract.getContractServices().stream()
                            .anyMatch(cs -> cs.getBillingMethod() == BillingMethod.METER_INDEX);
                    if (hasMeterService) {
                        throw new BaseException(ErrorCode.BAD_REQUEST,
                                "Hợp đồng có dịch vụ tính theo công tơ (điện/nước). Vui lòng chốt chỉ số trước khi phát hành hóa đơn");
                    }
                }

                for (ContractService cs : contract.getContractServices()) {
                    BillingMethod method = cs.getBillingMethod() != null ? cs.getBillingMethod()
                            : BillingMethod.FIXED_PER_ROOM;
                    BigDecimal qty = BigDecimal.ONE;
                    long price = cs.getAppliedUnitPrice() != null ? cs.getAppliedUnitPrice() : 0L;
                    String note = cs.getUnit();
                    Integer pIdx = null;
                    Integer cIdx = null;

                    if (method == BillingMethod.METER_INDEX) {
                        pIdx = cs.getLastIndex() != null ? cs.getLastIndex() : 0;
                        cIdx = pIdx;
                        qty = BigDecimal.ZERO;
                        note = "Chưa chốt số mới (số cũ: " + pIdx + ")";
                    } else if (method == BillingMethod.FIXED_PER_PERSON) {
                        int occupancy = contract.getRoom() != null && contract.getRoom().getCurrentOccupancy() != null
                                && contract.getRoom().getCurrentOccupancy() > 0
                                        ? contract.getRoom().getCurrentOccupancy()
                                        : 1;
                        qty = BigDecimal.valueOf(occupancy);
                        note = occupancy + " người";
                    } else {
                        qty = BigDecimal.ONE;
                        note = "Cố định / phòng";
                    }

                    long amount = qty.multiply(BigDecimal.valueOf(price)).longValue();
                    servicesAmount += amount;

                    items.add(InvoiceItem.builder()
                            .contractService(cs)
                            .itemType(InvoiceItemType.SERVICE)
                            .itemName(cs.getServiceName())
                            .previousIndex(pIdx)
                            .currentIndex(cIdx)
                            .quantity(qty)
                            .unitPrice(price)
                            .amount(amount)
                            .note(note)
                            .build());
                }
            }
        }

        // 4. Chi phí phát sinh khác
        long otherAmount = request.getOtherAmount() != null ? request.getOtherAmount() : 0L;
        if (otherAmount < 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Chi phí phát sinh khác không được là số âm");
        }
        if (otherAmount > 0) {
            items.add(InvoiceItem.builder()
                    .itemType(InvoiceItemType.SURCHARGE)
                    .itemName("Chi phí phát sinh khác")
                    .quantity(BigDecimal.ONE)
                    .unitPrice(otherAmount)
                    .amount(otherAmount)
                    .note(request.getOtherNote())
                    .build());
        }

        long totalAmount = Math.max(0L, contract.getRentPrice() + servicesAmount + otherAmount);

        Invoice invoice = Invoice.builder()
                .contract(contract)
                .billingPeriod(billingPeriod)
                .dueDate(dueDate)
                .roomPrice(contract.getRentPrice())
                .servicesAmount(servicesAmount)
                .otherAmount(otherAmount)
                .totalAmount(totalAmount)
                .paidAmount(0L)
                .status(isDraft ? InvoiceStatus.DRAFT : InvoiceStatus.UNPAID)
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        for (InvoiceItem item : items) {
            item.setInvoice(savedInvoice);
        }
        invoiceItemRepository.saveAll(items);
        savedInvoice.setItems(items);

        // Bắn thông báo cho khách thuê đại diện nếu là hóa đơn phát hành chính thức
        if (!isDraft && contract.getRepresentativeTenant() != null
                && contract.getRepresentativeTenant().getUser() != null) {
            Notification n = Notification.builder()
                    .user(contract.getRepresentativeTenant().getUser())
                    .title("Hóa đơn tiền phòng kỳ " + invoice.getBillingPeriod() + " đã phát hành")
                    .content("Hóa đơn kỳ " + invoice.getBillingPeriod() + " với tổng số tiền " + totalAmount
                            + " VNĐ. Hạn nộp: " + invoice.getDueDate())
                    .notificationType(NotificationType.INVOICE)
                    .relatedEntityType("INVOICE")
                    .relatedEntityId(savedInvoice.getId())
                    .isRead(false)
                    .build();
            notificationRepository.save(n);
        }

        return InvoiceResponse.fromEntity(savedInvoice);
    }

    @Override
    @Transactional
    public InvoiceResponse updateInvoice(Long landlordId, Long invoiceId, InvoiceUpdateRequest request) {
        log.info("Điều chỉnh hóa đơn id: {} của chủ trọ: {}", invoiceId, landlordId);

        Invoice invoice = invoiceRepository.findByIdAndContractLandlordId(invoiceId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.INVOICE_NOT_FOUND));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BaseException(ErrorCode.INVOICE_ALREADY_PAID);
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Hóa đơn đã bị hủy, không thể chỉnh sửa");
        }

        if (request.getDueDate() != null) {
            invoice.setDueDate(request.getDueDate());
        }

        if (request.getOtherAmount() != null) {
            if (request.getOtherAmount() < 0) {
                throw new BaseException(ErrorCode.BAD_REQUEST, "Chi phí phát sinh khác không được là số âm");
            }
            invoice.setOtherAmount(request.getOtherAmount());
        }

        long servicesAmount = 0L;
        List<InvoiceItem> items = new ArrayList<>();

        // Xóa các dòng cước cũ
        invoiceItemRepository.deleteByInvoiceId(invoiceId);

        Contract contract = invoice.getContract();

        // Tiền thuê phòng cố định
        items.add(InvoiceItem.builder()
                .invoice(invoice)
                .itemType(InvoiceItemType.ROOM_RENT)
                .itemName("Tiền thuê phòng " + contract.getRoom().getName())
                .quantity(BigDecimal.ONE)
                .unitPrice(invoice.getRoomPrice())
                .amount(invoice.getRoomPrice())
                .note("1 tháng")
                .build());

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (MeterReadingInvoiceRequest.InvoiceItemRequest itemReq : request.getItems()) {
                InvoiceItemType itemType = itemReq.getItemType();
                if (itemType == InvoiceItemType.ROOM_RENT) {
                    continue;
                }

                ContractService cs = null;
                if (itemReq.getContractServiceId() != null) {
                    cs = contractServiceRepository.findById(itemReq.getContractServiceId())
                            .orElseThrow(() -> new BaseException(ErrorCode.SERVICE_NOT_FOUND,
                                    "Không tìm thấy dịch vụ thỏa thuận của hợp đồng"));

                    if (!cs.getContract().getId().equals(contract.getId())) {
                        throw new BaseException(ErrorCode.BAD_REQUEST,
                                "Dịch vụ tiện ích (id=" + cs.getId() + ") không thuộc về hợp đồng này");
                    }
                }

                if (itemType == null) {
                    itemType = (cs != null) ? InvoiceItemType.SERVICE : InvoiceItemType.SURCHARGE;
                }

                if (itemReq.getUnitPrice() != null && itemReq.getUnitPrice() < 0) {
                    throw new BaseException(ErrorCode.BAD_REQUEST, "Đơn giá không được là số âm");
                }
                if (itemReq.getAmount() != null && itemReq.getAmount() < 0) {
                    throw new BaseException(ErrorCode.BAD_REQUEST, "Số tiền không được là số âm");
                }

                long price = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice()
                        : (cs != null ? cs.getAppliedUnitPrice() : 0L);

                BigDecimal qty = BigDecimal.ONE;
                Integer pIdx = itemReq.getPreviousIndex();
                Integer cIdx = itemReq.getCurrentIndex();

                if (cs != null && cs.getBillingMethod() == BillingMethod.METER_INDEX) {
                    if (pIdx == null)
                        pIdx = cs.getLastIndex() != null ? cs.getLastIndex() : 0;
                    if (cIdx != null) {
                        if (cIdx < pIdx) {
                            throw new BaseException(ErrorCode.INVALID_METER_READING,
                                    "Chỉ số mới (" + cIdx + ") không được nhỏ hơn chỉ số cũ (" + pIdx
                                            + ") cho dịch vụ: " + cs.getServiceName());
                        }
                        qty = BigDecimal.valueOf(cIdx - pIdx);
                        cs.setLastIndex(cIdx);
                        contractServiceRepository.save(cs);
                    } else {
                        qty = BigDecimal.ZERO;
                        cIdx = pIdx;
                    }
                } else if (itemReq.getQuantity() != null) {
                    if (itemReq.getQuantity().compareTo(BigDecimal.ZERO) < 0) {
                        throw new BaseException(ErrorCode.BAD_REQUEST, "Số lượng không được là số âm");
                    }
                    qty = itemReq.getQuantity();
                }

                long amount = itemReq.getAmount() != null ? itemReq.getAmount()
                        : qty.multiply(BigDecimal.valueOf(price)).longValue();

                if (itemType == InvoiceItemType.DISCOUNT) {
                    servicesAmount -= amount;
                } else {
                    servicesAmount += amount;
                }

                items.add(InvoiceItem.builder()
                        .invoice(invoice)
                        .contractService(cs)
                        .itemType(itemType)
                        .itemName(itemReq.getItemName() != null ? itemReq.getItemName().trim()
                                : (cs != null ? cs.getServiceName() : "Khoản mục khác"))
                        .previousIndex(pIdx)
                        .currentIndex(cIdx)
                        .quantity(qty)
                        .unitPrice(price)
                        .amount(amount)
                        .note(itemReq.getNote())
                        .build());
            }
        }

        long otherAmount = invoice.getOtherAmount() != null ? invoice.getOtherAmount() : 0L;
        if (otherAmount > 0) {
            items.add(InvoiceItem.builder()
                    .invoice(invoice)
                    .itemType(InvoiceItemType.SURCHARGE)
                    .itemName("Chi phí phát sinh khác")
                    .quantity(BigDecimal.ONE)
                    .unitPrice(otherAmount)
                    .amount(otherAmount)
                    .note(request.getOtherNote())
                    .build());
        }

        invoice.setServicesAmount(servicesAmount);
        long grandTotal = Math.max(0L, invoice.getRoomPrice() + servicesAmount + otherAmount);
        invoice.setTotalAmount(grandTotal);

        invoiceItemRepository.saveAll(items);
        invoice.setItems(items);

        Invoice updated = invoiceRepository.save(invoice);
        return InvoiceResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public InvoiceResponse cancelInvoice(Long landlordId, Long invoiceId, InvoiceCancelRequest request) {
        log.info("Hủy hóa đơn id: {} của chủ trọ: {}", invoiceId, landlordId);

        Invoice invoice = invoiceRepository.findByIdAndContractLandlordId(invoiceId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.INVOICE_NOT_FOUND));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BaseException(ErrorCode.INVOICE_ALREADY_PAID);
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Hóa đơn này đã được hủy trước đó");
        }

        if (request.getCancelReason() == null || request.getCancelReason().trim().isBlank()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Vui lòng nhập lý do hủy hóa đơn");
        }

        invoice.setStatus(InvoiceStatus.CANCELLED);
        invoice.setCancelReason(request.getCancelReason().trim());

        Invoice updated = invoiceRepository.save(invoice);
        return InvoiceResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public InvoiceResponse confirmPayment(Long landlordId, Long invoiceId, InvoicePaymentRequest request) {
        log.info("Xác nhận thu tiền hóa đơn id: {} với số tiền: {}", invoiceId, request.getPaymentAmount());

        Invoice invoice = invoiceRepository.findByIdAndContractLandlordId(invoiceId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.INVOICE_NOT_FOUND));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BaseException(ErrorCode.INVOICE_ALREADY_PAID);
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Hóa đơn đã bị hủy, không thể thu tiền");
        }

        if (request.getPaymentAmount() == null || request.getPaymentAmount() <= 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Số tiền thanh toán phải lớn hơn 0");
        }

        long currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0L;
        long remaining = Math.max(0L, invoice.getTotalAmount() - currentPaid);

        if (request.getPaymentAmount() > remaining) {
            throw new BaseException(ErrorCode.BAD_REQUEST,
                    "Số tiền thu (" + request.getPaymentAmount() + " VNĐ) vượt quá số tiền còn nợ (" + remaining
                            + " VNĐ)");
        }

        long newTotalPaid = currentPaid + request.getPaymentAmount();

        invoice.setPaidAmount(newTotalPaid);
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()) {
            invoice.setPaymentMethod(request.getPaymentMethod().trim());
        }

        if (newTotalPaid >= invoice.getTotalAmount()) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoice.setPaidAt(Instant.now());
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }

        Invoice updated = invoiceRepository.save(invoice);
        return InvoiceResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public InvoiceResponse publishInvoice(Long landlordId, Long invoiceId) {
        log.info("Chính thức ban hành hóa đơn nháp id: {} của chủ trọ: {}", invoiceId, landlordId);

        Invoice invoice = invoiceRepository.findByIdAndContractLandlordId(invoiceId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.INVOICE_NOT_FOUND));

        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Hóa đơn này không ở trạng thái lưu nháp (DRAFT)");
        }

        // Kiểm tra xem các dịch vụ METER_INDEX đã được chốt chỉ số chưa
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                ContractService cs = item.getContractService();
                if (cs != null && cs.getBillingMethod() == BillingMethod.METER_INDEX) {
                    if (item.getCurrentIndex() == null || item.getPreviousIndex() == null) {
                        throw new BaseException(ErrorCode.INVALID_METER_READING,
                                "Chưa chốt chỉ số công tơ cho dịch vụ: " + item.getItemName());
                    }
                    if (item.getCurrentIndex() < item.getPreviousIndex()) {
                        throw new BaseException(ErrorCode.INVALID_METER_READING,
                                "Chỉ số mới không được nhỏ hơn chỉ số cũ cho dịch vụ: " + item.getItemName());
                    }
                }
            }
        }

        invoice.setStatus(InvoiceStatus.UNPAID);
        Invoice saved = invoiceRepository.save(invoice);

        // Bắn thông báo phát hành hóa đơn cho khách thuê đại diện
        Contract contract = saved.getContract();
        if (contract != null && contract.getRepresentativeTenant() != null
                && contract.getRepresentativeTenant().getUser() != null) {
            Notification n = Notification.builder()
                    .user(contract.getRepresentativeTenant().getUser())
                    .title("Hóa đơn tiền phòng kỳ " + saved.getBillingPeriod() + " đã phát hành")
                    .content("Hóa đơn kỳ " + saved.getBillingPeriod() + " với tổng số tiền " + saved.getTotalAmount()
                            + " VNĐ. Hạn nộp: " + saved.getDueDate())
                    .notificationType(NotificationType.INVOICE)
                    .relatedEntityType("INVOICE")
                    .relatedEntityId(saved.getId())
                    .isRead(false)
                    .build();
            notificationRepository.save(n);
        }

        return InvoiceResponse.fromEntity(saved);
    }
}
