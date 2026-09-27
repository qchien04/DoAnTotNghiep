package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.invoice.*;
import com.doan.core.business.entity.*;
import com.doan.core.business.repository.*;
import com.doan.core.business.service.LandlordInvoiceService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
    public List<InvoiceResponse> getInvoices(Long landlordId, Long buildingId, String billingPeriod, String status) {
        String normalizedStatus = status;
        if ("PENDING".equalsIgnoreCase(status)) {
            normalizedStatus = "UNPAID";
        } else if ("PARTIAL".equalsIgnoreCase(status)) {
            normalizedStatus = "PARTIALLY_PAID";
        }
        log.info("Lấy danh sách hóa đơn cho chủ trọ id: {}, tòa: {}, kỳ cước: {}, trạng thái: {}", landlordId, buildingId, billingPeriod, normalizedStatus);
        List<Invoice> invoices = invoiceRepository.filterInvoices(landlordId, buildingId, billingPeriod, normalizedStatus);

        return invoices.stream()
                .map(InvoiceResponse::fromEntity)
                .collect(Collectors.toList());
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

        Contract contract = null;
        if (request.getContractId() != null) {
            contract = contractRepository.findByIdAndLandlordId(request.getContractId(), landlordId)
                    .orElse(null);
        }
        if (contract == null && request.getRoomId() != null) {
            contract = contractRepository.findByRoomIdAndStatus(request.getRoomId(), "ACTIVE")
                    .filter(c -> c.getLandlord() != null && c.getLandlord().getId().equals(landlordId))
                    .orElse(null);
        }
        if (contract == null) {
            throw new BaseException(ErrorCode.CONTRACT_NOT_FOUND);
        }

        if (invoiceRepository.existsByContractIdAndBillingPeriodAndStatusNot(contract.getId(), request.getBillingPeriod().trim(), "CANCELLED")) {
            throw new BaseException(ErrorCode.INVOICE_ALREADY_EXISTS);
        }

        List<InvoiceItem> items = new ArrayList<>();
        long servicesAmount = 0L;

        // 1. Khoản mục tiền thuê phòng
        items.add(InvoiceItem.builder()
                .itemType("ROOM_RENT")
                .itemName("Tiền thuê phòng " + contract.getRoom().getName())
                .quantity(BigDecimal.ONE)
                .unitPrice(contract.getRentPrice())
                .amount(contract.getRentPrice())
                .note("1 tháng")
                .build());

        // 2. Nếu client gửi danh sách items chi tiết (dynamic invoice items từ UI)
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (MeterReadingInvoiceRequest.InvoiceItemRequest itemReq : request.getItems()) {
                if (itemReq.getItemName() != null && itemReq.getItemName().toLowerCase().contains("tiền thuê phòng")) {
                    continue;
                }

                ContractService cs = null;
                if (itemReq.getContractServiceId() != null) {
                    cs = contractServiceRepository.findById(itemReq.getContractServiceId()).orElse(null);
                }

                String itemType = resolveItemType(itemReq, cs);
                BigDecimal qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : BigDecimal.ONE;
                long price = itemReq.getUnitPrice() != null ? Math.abs(itemReq.getUnitPrice()) : (cs != null ? cs.getAppliedUnitPrice() : 0L);
                long amount = itemReq.getAmount() != null ? Math.abs(itemReq.getAmount()) : qty.multiply(BigDecimal.valueOf(price)).longValue();

                if ("DISCOUNT".equalsIgnoreCase(itemType)) {
                    servicesAmount -= amount;
                } else {
                    servicesAmount += amount;
                }

                if (cs != null && "METER_INDEX".equalsIgnoreCase(cs.getBillingMethod()) && itemReq.getCurrentIndex() != null) {
                    cs.setLastIndex(itemReq.getCurrentIndex());
                    contractServiceRepository.save(cs);
                }

                items.add(InvoiceItem.builder()
                        .contractService(cs)
                        .itemType(itemType)
                        .itemName(itemReq.getItemName() != null ? itemReq.getItemName() : (cs != null ? cs.getServiceName() : "Dịch vụ"))
                        .previousIndex(itemReq.getPreviousIndex())
                        .currentIndex(itemReq.getCurrentIndex())
                        .quantity(qty)
                        .unitPrice(price)
                        .amount(amount)
                        .note(itemReq.getNote())
                        .build());
            }
        } else {
            // 3. Nếu client không gửi items, tự động tạo danh sách items dựa vào ContractServices của hợp đồng
            if (contract.getContractServices() != null && !contract.getContractServices().isEmpty()) {
                for (ContractService cs : contract.getContractServices()) {
                    String method = cs.getBillingMethod() != null ? cs.getBillingMethod() : "FIXED_PER_ROOM";
                    BigDecimal qty = BigDecimal.ONE;
                    long price = cs.getAppliedUnitPrice() != null ? cs.getAppliedUnitPrice() : 0L;
                    String note = cs.getUnit();
                    Integer pIdx = null;
                    Integer cIdx = null;

                    if ("METER_INDEX".equalsIgnoreCase(method)) {
                        pIdx = cs.getLastIndex() != null ? cs.getLastIndex() : 0;
                        cIdx = pIdx;
                        qty = BigDecimal.ZERO;
                        note = "Chưa chốt số mới (số cũ: " + pIdx + ")";
                    } else if ("FIXED_PER_PERSON".equalsIgnoreCase(method)) {
                        int occupancy = contract.getRoom() != null && contract.getRoom().getCurrentOccupancy() != null && contract.getRoom().getCurrentOccupancy() > 0
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
                            .itemType("SERVICE")
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

        // 4. Chi phí phát sinh khác nếu có
        long otherAmount = request.getOtherAmount() != null ? request.getOtherAmount() : 0L;
        if (otherAmount > 0) {
            items.add(InvoiceItem.builder()
                    .itemType("SURCHARGE")
                    .itemName("Chi phí phát sinh khác")
                    .quantity(BigDecimal.ONE)
                    .unitPrice(otherAmount)
                    .amount(otherAmount)
                    .note(request.getOtherNote())
                    .build());
        }

        long totalAmount = Math.max(0L, contract.getRentPrice() + servicesAmount + otherAmount);

        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(10);

        Invoice invoice = Invoice.builder()
                .contract(contract)
                .billingPeriod(request.getBillingPeriod().trim())
                .dueDate(dueDate)
                .roomPrice(contract.getRentPrice())
                .servicesAmount(servicesAmount)
                .otherAmount(otherAmount)
                .totalAmount(totalAmount)
                .paidAmount(0L)
                .status(Boolean.TRUE.equals(request.getIsDraft()) ? "DRAFT" : "UNPAID")
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        for (InvoiceItem item : items) {
            item.setInvoice(savedInvoice);
        }
        invoiceItemRepository.saveAll(items);
        savedInvoice.setItems(items);

        // Bắn thông báo cho khách thuê đại diện nếu là ban hành chính thức (không phải lưu nháp)
        if (!Boolean.TRUE.equals(request.getIsDraft()) && contract.getRepresentativeTenant() != null && contract.getRepresentativeTenant().getUser() != null) {
            Notification n = Notification.builder()
                    .user(contract.getRepresentativeTenant().getUser())
                    .title("Hóa đơn tiền phòng kỳ " + invoice.getBillingPeriod() + " đã phát hành")
                    .content("Hóa đơn kỳ " + invoice.getBillingPeriod() + " với tổng số tiền " + totalAmount + " VNĐ. Hạn nộp: " + invoice.getDueDate())
                    .notificationType("INVOICE")
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

        if ("PAID".equalsIgnoreCase(invoice.getStatus())) {
            throw new BaseException(ErrorCode.INVOICE_ALREADY_PAID);
        }

        if (request.getDueDate() != null) {
            invoice.setDueDate(request.getDueDate());
        }

        if (request.getOtherAmount() != null) {
            invoice.setOtherAmount(request.getOtherAmount());
        }

        long servicesAmount = 0L;
        List<InvoiceItem> items = new ArrayList<>();

        // Xóa các dòng cước cũ
        invoiceItemRepository.deleteByInvoiceId(invoiceId);

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            // Client gửi danh sách khoản mục cập nhật (hỗ trợ phụ thu, giảm trừ...)
            for (MeterReadingInvoiceRequest.InvoiceItemRequest itemReq : request.getItems()) {
                if (itemReq.getItemName() != null && itemReq.getItemName().toLowerCase().contains("tiền thuê phòng")) {
                    continue;
                }

                ContractService cs = null;
                if (itemReq.getContractServiceId() != null) {
                    cs = contractServiceRepository.findById(itemReq.getContractServiceId()).orElse(null);
                }

                String itemType = resolveItemType(itemReq, cs);
                BigDecimal qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : BigDecimal.ONE;
                long price = itemReq.getUnitPrice() != null ? Math.abs(itemReq.getUnitPrice()) : (cs != null ? cs.getAppliedUnitPrice() : 0L);
                long amount = itemReq.getAmount() != null ? Math.abs(itemReq.getAmount()) : qty.multiply(BigDecimal.valueOf(price)).longValue();

                if ("DISCOUNT".equalsIgnoreCase(itemType)) {
                    servicesAmount -= amount;
                } else {
                    servicesAmount += amount;
                }

                if (cs != null && "METER_INDEX".equalsIgnoreCase(cs.getBillingMethod()) && itemReq.getCurrentIndex() != null) {
                    cs.setLastIndex(itemReq.getCurrentIndex());
                    contractServiceRepository.save(cs);
                }

                items.add(InvoiceItem.builder()
                        .invoice(invoice)
                        .contractService(cs)
                        .itemType(itemType)
                        .itemName(itemReq.getItemName() != null ? itemReq.getItemName() : (cs != null ? cs.getServiceName() : "Dịch vụ"))
                        .previousIndex(itemReq.getPreviousIndex())
                        .currentIndex(itemReq.getCurrentIndex())
                        .quantity(qty)
                        .unitPrice(price)
                        .amount(amount)
                        .note(itemReq.getNote())
                        .build());
            }

            // Tiền thuê phòng
            items.add(0, InvoiceItem.builder()
                    .invoice(invoice)
                    .itemType("ROOM_RENT")
                    .itemName("Tiền thuê phòng " + invoice.getContract().getRoom().getName())
                    .quantity(BigDecimal.ONE)
                    .unitPrice(invoice.getRoomPrice())
                    .amount(invoice.getRoomPrice())
                    .note("1 tháng")
                    .build());
        } else {
            // Tái tạo items dựa trên hợp đồng nếu không truyền items
            items.add(InvoiceItem.builder()
                    .invoice(invoice)
                    .itemType("ROOM_RENT")
                    .itemName("Tiền thuê phòng " + invoice.getContract().getRoom().getName())
                    .quantity(BigDecimal.ONE)
                    .unitPrice(invoice.getRoomPrice())
                    .amount(invoice.getRoomPrice())
                    .note("1 tháng")
                    .build());

            if (invoice.getContract().getContractServices() != null) {
                for (ContractService cs : invoice.getContract().getContractServices()) {
                    long price = cs.getAppliedUnitPrice() != null ? cs.getAppliedUnitPrice() : 0L;
                    servicesAmount += price;
                    items.add(InvoiceItem.builder()
                            .invoice(invoice)
                            .contractService(cs)
                            .itemType("SERVICE")
                            .itemName(cs.getServiceName())
                            .previousIndex(cs.getLastIndex())
                            .currentIndex(cs.getLastIndex())
                            .quantity(BigDecimal.ONE)
                            .unitPrice(price)
                            .amount(price)
                            .note(cs.getUnit())
                            .build());
                }
            }
        }

        long otherAmount = invoice.getOtherAmount() != null ? invoice.getOtherAmount() : 0L;
        if (otherAmount > 0) {
            items.add(InvoiceItem.builder()
                    .invoice(invoice)
                    .itemType("SURCHARGE")
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

        if ("PAID".equalsIgnoreCase(invoice.getStatus())) {
            throw new BaseException(ErrorCode.INVOICE_ALREADY_PAID);
        }

        invoice.setStatus("CANCELLED");
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

        long currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0L;
        long newTotalPaid = currentPaid + request.getPaymentAmount();

        invoice.setPaidAmount(newTotalPaid);
        invoice.setPaymentMethod(request.getPaymentMethod());

        if (newTotalPaid >= invoice.getTotalAmount()) {
            invoice.setStatus("PAID");
            invoice.setPaidAt(Instant.now());
        } else {
            invoice.setStatus("PARTIALLY_PAID");
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

        if (!"DRAFT".equalsIgnoreCase(invoice.getStatus())) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Hóa đơn này không ở trạng thái lưu nháp (DRAFT)");
        }

        invoice.setStatus("UNPAID");
        Invoice saved = invoiceRepository.save(invoice);

        // Bắn thông báo phát hành hóa đơn cho khách thuê đại diện
        Contract contract = saved.getContract();
        if (contract != null && contract.getRepresentativeTenant() != null && contract.getRepresentativeTenant().getUser() != null) {
            Notification n = Notification.builder()
                    .user(contract.getRepresentativeTenant().getUser())
                    .title("Hóa đơn tiền phòng kỳ " + saved.getBillingPeriod() + " đã phát hành")
                    .content("Hóa đơn kỳ " + saved.getBillingPeriod() + " với tổng số tiền " + saved.getTotalAmount() + " VNĐ. Hạn nộp: " + saved.getDueDate())
                    .notificationType("INVOICE")
                    .relatedEntityType("INVOICE")
                    .relatedEntityId(saved.getId())
                    .isRead(false)
                    .build();
            notificationRepository.save(n);
        }

        return InvoiceResponse.fromEntity(saved);
    }

    private String resolveItemType(MeterReadingInvoiceRequest.InvoiceItemRequest itemReq, ContractService cs) {
        if (itemReq.getItemType() != null && !itemReq.getItemType().trim().isEmpty()) {
            return itemReq.getItemType().trim().toUpperCase();
        }
        if (itemReq.getItemName() != null) {
            String nameLower = itemReq.getItemName().toLowerCase();
            if (nameLower.contains("giảm trừ") || nameLower.contains("chiết khấu")) {
                return "DISCOUNT";
            }
            if (nameLower.contains("phụ thu")) {
                return "SURCHARGE";
            }
            if (nameLower.contains("tiền thuê phòng") || nameLower.contains("tiền phòng")) {
                return "ROOM_RENT";
            }
        }
        return "SERVICE";
    }
}
