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
        log.info("Lấy danh sách hóa đơn cho chủ trọ id: {}, tòa: {}, kỳ cước: {}, trạng thái: {}", landlordId, buildingId, billingPeriod, status);
        List<Invoice> invoices = invoiceRepository.filterInvoices(landlordId, buildingId, billingPeriod, status);

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
        Integer currentElectric = request.getCurrentElectricIndex();
        Integer currentWater = request.getCurrentWaterIndex();
        Integer prevElectric = null;
        Integer prevWater = null;

        // 1. Khoản mục tiền thuê phòng
        items.add(InvoiceItem.builder()
                .itemName("Tiền thuê phòng " + contract.getRoom().getRoomCode())
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

                BigDecimal qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : BigDecimal.ONE;
                long price = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : (cs != null ? cs.getAppliedUnitPrice() : 0L);
                long amount = itemReq.getAmount() != null ? itemReq.getAmount() : qty.multiply(BigDecimal.valueOf(price)).longValue();

                servicesAmount += amount;

                if (cs != null && "METER_INDEX".equalsIgnoreCase(cs.getBillingMethod()) && itemReq.getCurrentIndex() != null) {
                    cs.setLastIndex(itemReq.getCurrentIndex());
                    contractServiceRepository.save(cs);
                }

                if (itemReq.getItemName() != null && itemReq.getItemName().toLowerCase().contains("điện")) {
                    currentElectric = itemReq.getCurrentIndex() != null ? itemReq.getCurrentIndex() : currentElectric;
                    prevElectric = itemReq.getPreviousIndex();
                } else if (itemReq.getItemName() != null && itemReq.getItemName().toLowerCase().contains("nước")) {
                    currentWater = itemReq.getCurrentIndex() != null ? itemReq.getCurrentIndex() : currentWater;
                    prevWater = itemReq.getPreviousIndex();
                }

                items.add(InvoiceItem.builder()
                        .contractService(cs)
                        .itemName(itemReq.getItemName() != null ? itemReq.getItemName() : (cs != null ? cs.getServiceName() : "Dịch vụ"))
                        .quantity(qty)
                        .unitPrice(price)
                        .amount(amount)
                        .note(itemReq.getNote())
                        .build());
            }
        } else {
            // 3. Nếu client không gửi items, tự động tính dựa vào ContractServices của hợp đồng
            List<Invoice> prevInvoices = invoiceRepository.findLatestByContractId(contract.getId());
            int defaultPrevElec = contract.getInitialElectricIndex() != null ? contract.getInitialElectricIndex() : 0;
            int defaultPrevWater = contract.getInitialWaterIndex() != null ? contract.getInitialWaterIndex() : 0;
            for (Invoice pi : prevInvoices) {
                if (!"CANCELLED".equalsIgnoreCase(pi.getStatus())) {
                    if (pi.getCurrentElectricIndex() != null) defaultPrevElec = pi.getCurrentElectricIndex();
                    if (pi.getCurrentWaterIndex() != null) defaultPrevWater = pi.getCurrentWaterIndex();
                    break;
                }
            }

            if (contract.getContractServices() != null && !contract.getContractServices().isEmpty()) {
                for (ContractService cs : contract.getContractServices()) {
                    String method = cs.getBillingMethod() != null ? cs.getBillingMethod() : "FIXED_PER_ROOM";
                    String nameLower = cs.getServiceName().toLowerCase();
                    BigDecimal qty = BigDecimal.ONE;
                    long price = cs.getAppliedUnitPrice() != null ? cs.getAppliedUnitPrice() : 0L;
                    String note = cs.getUnit();

                    if ("METER_INDEX".equalsIgnoreCase(method)) {
                        int pIdx = cs.getLastIndex() != null && cs.getLastIndex() > 0 ? cs.getLastIndex() : 0;
                        int cIdx = pIdx;
                        if (nameLower.contains("điện")) {
                            pIdx = defaultPrevElec;
                            cIdx = request.getCurrentElectricIndex() != null ? request.getCurrentElectricIndex() : pIdx;
                            currentElectric = cIdx;
                            prevElectric = pIdx;
                        } else if (nameLower.contains("nước")) {
                            pIdx = defaultPrevWater;
                            cIdx = request.getCurrentWaterIndex() != null ? request.getCurrentWaterIndex() : pIdx;
                            currentWater = cIdx;
                            prevWater = pIdx;
                        }
                        int consumed = Math.max(0, cIdx - pIdx);
                        qty = BigDecimal.valueOf(consumed);
                        note = consumed + " " + cs.getUnit() + " (Từ số " + pIdx + " đến " + cIdx + ")";
                        cs.setLastIndex(cIdx);
                        contractServiceRepository.save(cs);
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
                            .itemName(cs.getServiceName())
                            .quantity(qty)
                            .unitPrice(price)
                            .amount(amount)
                            .note(note)
                            .build());
                }
            } else {
                if (request.getCurrentElectricIndex() != null) {
                    prevElectric = defaultPrevElec;
                    int consumed = Math.max(0, request.getCurrentElectricIndex() - defaultPrevElec);
                    long amount = consumed * 3800L;
                    servicesAmount += amount;
                    items.add(InvoiceItem.builder()
                            .itemName("Tiền điện sinh hoạt")
                            .quantity(BigDecimal.valueOf(consumed))
                            .unitPrice(3800L)
                            .amount(amount)
                            .note(consumed + " kWh (Từ số " + defaultPrevElec + " đến " + request.getCurrentElectricIndex() + ")")
                            .build());
                }
                if (request.getCurrentWaterIndex() != null) {
                    prevWater = defaultPrevWater;
                    int consumed = Math.max(0, request.getCurrentWaterIndex() - defaultPrevWater);
                    long amount = consumed * 30000L;
                    servicesAmount += amount;
                    items.add(InvoiceItem.builder()
                            .itemName("Tiền nước sinh hoạt")
                            .quantity(BigDecimal.valueOf(consumed))
                            .unitPrice(30000L)
                            .amount(amount)
                            .note(consumed + " m3 (Từ số " + defaultPrevWater + " đến " + request.getCurrentWaterIndex() + ")")
                            .build());
                }
            }
        }

        // 4. Chi phí phát sinh khác nếu có
        long otherAmount = request.getOtherAmount() != null ? request.getOtherAmount() : 0L;
        if (otherAmount > 0) {
            items.add(InvoiceItem.builder()
                    .itemName("Chi phí phát sinh khác")
                    .quantity(BigDecimal.ONE)
                    .unitPrice(otherAmount)
                    .amount(otherAmount)
                    .note(request.getOtherNote())
                    .build());
        }

        long totalAmount = contract.getRentPrice() + servicesAmount + otherAmount;

        String rawPeriod = request.getBillingPeriod().trim().replace("/", "");
        String invoiceCode = "HD-" + rawPeriod + "-" + contract.getRoom().getRoomCode();
        if (invoiceRepository.existsByInvoiceCode(invoiceCode)) {
            invoiceCode += "-" + (System.currentTimeMillis() % 1000);
        }

        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(10);

        Invoice invoice = Invoice.builder()
                .invoiceCode(invoiceCode)
                .contract(contract)
                .billingPeriod(request.getBillingPeriod().trim())
                .dueDate(dueDate)
                .roomPrice(contract.getRentPrice())
                .servicesAmount(servicesAmount)
                .otherAmount(otherAmount)
                .totalAmount(totalAmount)
                .paidAmount(0L)
                .previousElectricIndex(prevElectric)
                .currentElectricIndex(currentElectric)
                .previousWaterIndex(prevWater)
                .currentWaterIndex(currentWater)
                .status("UNPAID")
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        for (InvoiceItem item : items) {
            item.setInvoice(savedInvoice);
        }
        invoiceItemRepository.saveAll(items);
        savedInvoice.setItems(items);

        // Bắn thông báo cho khách thuê đại diện
        if (contract.getRepresentativeTenant() != null && contract.getRepresentativeTenant().getUser() != null) {
            Notification n = Notification.builder()
                    .user(contract.getRepresentativeTenant().getUser())
                    .title("Hóa đơn tiền phòng kỳ " + invoice.getBillingPeriod() + " đã phát hành")
                    .content("Hóa đơn " + invoice.getInvoiceCode() + " với tổng số tiền " + totalAmount + " VNĐ. Hạn nộp: " + invoice.getDueDate())
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

        int prevElectric = invoice.getPreviousElectricIndex() != null ? invoice.getPreviousElectricIndex() : 0;
        int prevWater = invoice.getPreviousWaterIndex() != null ? invoice.getPreviousWaterIndex() : 0;

        if (request.getCurrentElectricIndex() < prevElectric || request.getCurrentWaterIndex() < prevWater) {
            throw new BaseException(ErrorCode.INVALID_METER_READING);
        }

        invoice.setCurrentElectricIndex(request.getCurrentElectricIndex());
        invoice.setCurrentWaterIndex(request.getCurrentWaterIndex());

        if (request.getDueDate() != null) {
            invoice.setDueDate(request.getDueDate());
        }

        if (request.getOtherAmount() != null) {
            invoice.setOtherAmount(request.getOtherAmount());
        }

        // Xóa các dòng cước cũ và tính toán lại
        invoiceItemRepository.deleteByInvoiceId(invoiceId);

        int electricConsumed = request.getCurrentElectricIndex() - prevElectric;
        int waterConsumed = request.getCurrentWaterIndex() - prevWater;

        long electricUnitPrice = 3800L;
        long waterUnitPrice = 30000L;
        long servicesAmount = 0L;

        List<InvoiceItem> items = new ArrayList<>();

        // Tiền phòng
        items.add(InvoiceItem.builder()
                .invoice(invoice)
                .itemName("Tiền thuê phòng " + invoice.getContract().getRoom().getRoomCode())
                .quantity(BigDecimal.ONE)
                .unitPrice(invoice.getRoomPrice())
                .amount(invoice.getRoomPrice())
                .note("1 tháng")
                .build());

        // Dịch vụ cố định từ hợp đồng
        if (invoice.getContract().getContractServices() != null) {
            for (ContractService cs : invoice.getContract().getContractServices()) {
                String sNameLower = cs.getServiceName().toLowerCase();
                if (sNameLower.contains("điện")) {
                    electricUnitPrice = cs.getAppliedUnitPrice();
                } else if (sNameLower.contains("nước")) {
                    waterUnitPrice = cs.getAppliedUnitPrice();
                } else {
                    long itemAmount = cs.getAppliedUnitPrice();
                    servicesAmount += itemAmount;
                    items.add(InvoiceItem.builder()
                            .invoice(invoice)
                            .contractService(cs)
                            .itemName(cs.getServiceName())
                            .quantity(BigDecimal.ONE)
                            .unitPrice(cs.getAppliedUnitPrice())
                            .amount(itemAmount)
                            .note(cs.getUnit())
                            .build());
                }
            }
        }

        long electricAmount = electricConsumed * electricUnitPrice;
        servicesAmount += electricAmount;
        items.add(InvoiceItem.builder()
                .invoice(invoice)
                .itemName("Tiền điện sinh hoạt")
                .quantity(BigDecimal.valueOf(electricConsumed))
                .unitPrice(electricUnitPrice)
                .amount(electricAmount)
                .note(electricConsumed + " kWh")
                .build());

        long waterAmount = waterConsumed * waterUnitPrice;
        servicesAmount += waterAmount;
        items.add(InvoiceItem.builder()
                .invoice(invoice)
                .itemName("Tiền nước sinh hoạt")
                .quantity(BigDecimal.valueOf(waterConsumed))
                .unitPrice(waterUnitPrice)
                .amount(waterAmount)
                .note(waterConsumed + " m3")
                .build());

        long otherAmount = invoice.getOtherAmount() != null ? invoice.getOtherAmount() : 0L;
        if (otherAmount > 0) {
            items.add(InvoiceItem.builder()
                    .invoice(invoice)
                    .itemName("Chi phí phát sinh khác")
                    .quantity(BigDecimal.ONE)
                    .unitPrice(otherAmount)
                    .amount(otherAmount)
                    .note(request.getOtherNote())
                    .build());
        }

        invoice.setServicesAmount(servicesAmount);
        invoice.setTotalAmount(invoice.getRoomPrice() + servicesAmount + otherAmount);

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
}
