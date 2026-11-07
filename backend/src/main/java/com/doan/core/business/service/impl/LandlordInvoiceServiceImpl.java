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

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordInvoiceServiceImpl implements LandlordInvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ContractServiceRepository contractServiceRepository;
    private final ContractRepository contractRepository;
    private final TenantRepository tenantRepository;
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
    public InvoiceResponse createInvoice(Long landlordId, CreateInvoiceRequest request) {
        log.info("Lập hóa đơn kỳ: {} cho hợp đồng: {} của chủ trọ: {}",
                request.getBillingPeriod(), request.getContractId(), landlordId);

        // 1. Phân giải hợp đồng (Fetch toàn bộ chi tiết phòng, tòa nhà, khách thuê và
        // dịch vụ trong 1 query duy nhất)
        Contract contract = contractRepository.findByIdAndLandlordIdWithDetails(request.getContractId(), landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.CONTRACT_NOT_FOUND));

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

        // Validate hạn nộp tiền
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
                .quantity(1)
                .unitPrice(contract.getRentPrice())
                .amount(contract.getRentPrice())
                .note("1 tháng")
                .build());

        // Nạp toàn bộ dịch vụ của hợp đồng trong
        List<ContractService> contractServices = contractServiceRepository.findByContractId(contract.getId());
        Map<Long, ContractService> contractServiceMap = contractServices.stream()
                .filter(s -> s.getId() != null)
                .collect(Collectors.toMap(ContractService::getId, Function.identity(), (a, b) -> a));

        List<ContractService> updatedMeterServices = new ArrayList<>();

        // 3. Xử lý danh sách khoản mục dịch vụ (Chỉ đọc contractServiceId, currentIndex
        // / quantity từ request)
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreateInvoiceRequest.InvoiceItemRequest itemReq : request.getItems()) {
                // Xác thực ContractService thuộc về hợp đồng này
                ContractService cs = contractServiceMap.get(itemReq.getContractServiceId());
                if (cs == null) {
                    throw new BaseException(ErrorCode.BAD_REQUEST,
                            "Dịch vụ tiện ích (id=" + itemReq.getContractServiceId() + ") không thuộc về hợp đồng này");
                }

                // Toàn bộ đơn giá, tên dịch vụ, chỉ số cũ, phương thức tính lấy từ
                // ContractService trong DB
                long price = cs.getAppliedUnitPrice();
                int qty = 0;
                Integer pIdx = null;
                Integer cIdx = null;
                String note = cs.getUnit();

                BillingMethod method = cs.getBillingMethod();

                if (method == BillingMethod.METER_INDEX) {
                    pIdx = cs.getLastIndex();
                    cIdx = itemReq.getCurrentIndex();

                    if (cIdx != null) {
                        if (cIdx < pIdx) {
                            throw new BaseException(ErrorCode.INVALID_METER_READING,
                                    "Chỉ số mới (" + cIdx + ") không được nhỏ hơn chỉ số cũ (" + pIdx
                                            + ") cho dịch vụ: " + cs.getServiceName());
                        }
                        qty = cIdx - pIdx;
                        cs.setLastIndex(cIdx);
                        updatedMeterServices.add(cs);
                        note = qty + " " + cs.getUnit()
                                + " (Từ số " + pIdx + " đến " + cIdx + ")";
                    } else {
                        if (!isDraft) {
                            throw new BaseException(ErrorCode.INVALID_METER_READING,
                                    "Vui lòng nhập chỉ số mới cho dịch vụ: " + cs.getServiceName());
                        }
                        qty = 0;
                        cIdx = pIdx;
                    }
                } else if (method == BillingMethod.FIXED_PER_PERSON) {
                    long stayingCount = tenantRepository.countByContractId(contract.getId());
                    int defaultOccupancy = stayingCount > 0 ? (int) stayingCount : 1;
                    qty = (itemReq != null && itemReq.getQuantity() != null && itemReq.getQuantity() > 0)
                            ? itemReq.getQuantity()
                            : defaultOccupancy;
                    note = qty + " người";
                } else if (method == BillingMethod.FIXED_PER_UNIT) {
                    qty = (itemReq != null && itemReq.getQuantity() != null) ? itemReq.getQuantity() : 0;
                    note = qty + " " + cs.getUnit();
                } else {
                    // FIXED_PER_ROOM
                    qty = 1;
                    note = "Cố định / phòng";
                }

                long amount = qty * price;
                servicesAmount += amount;

                // Server quyết định: Dịch vụ theo hợp đồng luôn là SERVICE
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
        // Cập nhật batch các chỉ số công tơ điện nước thay đổi (1 lệnh batch thay vì N
        // lệnh save)
        if (!updatedMeterServices.isEmpty()) {
            contractServiceRepository.saveAll(updatedMeterServices);
        }

        // 4. Các khoản phụ thu & giảm trừ phát sinh (Server quyết định InvoiceItemType:
        // SURCHARGE / DISCOUNT)
        long adjustmentTotal = 0L;
        if (request.getAdjustments() != null && !request.getAdjustments().isEmpty()) {
            for (CreateInvoiceRequest.InvoiceAdjustmentRequest adjReq : request.getAdjustments()) {
                InvoiceItemType itemType = (adjReq.getType() == AdjustmentType.DISCOUNT)
                        ? InvoiceItemType.DISCOUNT
                        : InvoiceItemType.SURCHARGE;

                int qty = adjReq.getQuantity() != null
                        ? adjReq.getQuantity()
                        : 1;
                long unitPrice = adjReq.getUnitPrice() != null ? adjReq.getUnitPrice() : 0L;
                long amount = qty * unitPrice;

                // Dựa vào itemType để biết là nên cộng hay trừ:
                if (itemType == InvoiceItemType.DISCOUNT) {
                    adjustmentTotal -= amount;
                } else {
                    adjustmentTotal += amount;
                }

                items.add(InvoiceItem.builder()
                        .contractService(null)
                        .itemType(itemType)
                        .itemName(adjReq.getReason().trim())
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .amount(amount)
                        .note(adjReq.getNote())
                        .build());
            }
        }

        long totalAmount = Math.max(0L, contract.getRentPrice() + servicesAmount + adjustmentTotal);

        Invoice invoice = Invoice.builder()
                .contract(contract)
                .billingPeriod(billingPeriod)
                .dueDate(dueDate)
                .roomPrice(contract.getRentPrice())
                .servicesAmount(servicesAmount)
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
        if (!isDraft) {
            ContractTenant repCt = contract.getContractTenants() != null ? contract.getContractTenants().stream()
                    .filter(ct -> Boolean.TRUE.equals(ct.getIsRepresentative()))
                    .findFirst()
                    .orElse(null) : null;
            if (repCt != null && repCt.getTenant() != null && repCt.getTenant().getUser() != null) {
                Notification n = Notification.builder()
                        .user(repCt.getTenant().getUser())
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

        long servicesAmount = 0L;
        List<InvoiceItem> items = new ArrayList<>();

        // Xóa các dòng cước cũ
        invoiceItemRepository.deleteByInvoiceId(invoiceId);

        Contract contract = invoice.getContract();
        List<ContractService> contractServices = contractServiceRepository.findByContractId(contract.getId());
        Map<Long, ContractService> contractServiceMap = contractServices.stream()
                .filter(s -> s.getId() != null)
                .collect(Collectors.toMap(ContractService::getId, Function.identity(), (a, b) -> a));

        List<ContractService> updatedMeterServices = new ArrayList<>();

        // Tiền thuê phòng cố định
        items.add(InvoiceItem.builder()
                .invoice(invoice)
                .itemType(InvoiceItemType.ROOM_RENT)
                .itemName("Tiền thuê phòng " + contract.getRoom().getName())
                .quantity(1)
                .unitPrice(invoice.getRoomPrice())
                .amount(invoice.getRoomPrice())
                .note("1 tháng")
                .build());

        // 3. Xử lý danh sách khoản mục dịch vụ (Chỉ đọc contractServiceId, currentIndex
        // / quantity từ request)
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreateInvoiceRequest.InvoiceItemRequest itemReq : request.getItems()) {
                ContractService cs = null;
                if (itemReq.getContractServiceId() != null) {
                    cs = contractServiceMap.get(itemReq.getContractServiceId());
                    if (cs == null) {
                        throw new BaseException(ErrorCode.BAD_REQUEST,
                                "Dịch vụ tiện ích (id=" + itemReq.getContractServiceId()
                                        + ") không thuộc về hợp đồng này");
                    }
                }
                if (cs == null) {
                    throw new BaseException(ErrorCode.BAD_REQUEST, "Vui lòng chọn dịch vụ hợp đồng");
                }

                // Toàn bộ đơn giá, tên dịch vụ, chỉ số cũ lấy từ ContractService trong DB
                long price = cs.getAppliedUnitPrice();
                int qty = 1;
                Integer pIdx = null;
                Integer cIdx = null;
                String note = cs.getUnit();

                BillingMethod method = cs.getBillingMethod();

                if (method == BillingMethod.METER_INDEX) {
                    pIdx = cs.getLastIndex();
                    cIdx = itemReq.getCurrentIndex();

                    if (cIdx != null) {
                        if (cIdx < pIdx) {
                            throw new BaseException(ErrorCode.INVALID_METER_READING,
                                    "Chỉ số mới (" + cIdx + ") không được nhỏ hơn chỉ số cũ (" + pIdx
                                            + ") cho dịch vụ: " + cs.getServiceName());
                        }
                        qty = cIdx - pIdx;
                        cs.setLastIndex(cIdx);
                        updatedMeterServices.add(cs);
                        note = qty + " " + cs.getUnit()
                                + " (Từ số " + pIdx + " đến " + cIdx + ")";
                    } else {
                        qty = 0;
                        cIdx = pIdx;
                        note = "Chưa chốt số mới (số cũ: " + pIdx + ")";
                    }
                } else if (method == BillingMethod.FIXED_PER_PERSON) {
                    long stayingCount = tenantRepository.countByContractId(contract.getId());
                    int defaultOccupancy = stayingCount > 0 ? (int) stayingCount : 1;
                    qty = (itemReq != null && itemReq.getQuantity() != null && itemReq.getQuantity() > 0)
                            ? itemReq.getQuantity()
                            : defaultOccupancy;
                    note = qty + " người";
                } else if (method == BillingMethod.FIXED_PER_UNIT) {
                    qty = (itemReq != null && itemReq.getQuantity() != null && itemReq.getQuantity() > 0)
                            ? itemReq.getQuantity()
                            : 1;
                    note = qty + " " + cs.getUnit();
                } else {
                    qty = 1;
                    note = "Cố định / phòng";
                }

                long amount = (long) qty * price;
                servicesAmount += amount;

                items.add(InvoiceItem.builder()
                        .invoice(invoice)
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

        if (!updatedMeterServices.isEmpty()) {
            contractServiceRepository.saveAll(updatedMeterServices);
        }

        // 4. Các khoản phụ thu & giảm trừ phát sinh (Server quyết định: SURCHARGE /
        // DISCOUNT)
        long adjustmentTotal = 0L;
        if (request.getAdjustments() != null && !request.getAdjustments().isEmpty()) {
            for (CreateInvoiceRequest.InvoiceAdjustmentRequest adjReq : request.getAdjustments()) {
                InvoiceItemType itemType = (adjReq.getType() == AdjustmentType.DISCOUNT)
                        ? InvoiceItemType.DISCOUNT
                        : InvoiceItemType.SURCHARGE;

                int qty = (adjReq.getQuantity() != null && adjReq.getQuantity() > 0)
                        ? adjReq.getQuantity()
                        : 1;
                long unitPrice = adjReq.getUnitPrice() != null ? adjReq.getUnitPrice() : 0L;
                long amount = adjReq.getAmount() != null ? adjReq.getAmount()
                        : (long) qty * unitPrice;

                // Dựa vào itemType để biết là nên cộng hay trừ:
                if (itemType == InvoiceItemType.DISCOUNT) {
                    adjustmentTotal -= amount;
                } else {
                    adjustmentTotal += amount;
                }

                items.add(InvoiceItem.builder()
                        .invoice(invoice)
                        .contractService(null)
                        .itemType(itemType)
                        .itemName(adjReq.getReason().trim())
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .amount(amount)
                        .note(adjReq.getNote())
                        .build());
            }
        }

        invoice.setServicesAmount(servicesAmount);
        long grandTotal = Math.max(0L, invoice.getRoomPrice() + servicesAmount + adjustmentTotal);
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

        // Hoàn trả chỉ số công tơ về chỉ số cũ trước khi lập hóa đơn này
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                if (item.getContractService() != null
                        && item.getContractService().getBillingMethod() == BillingMethod.METER_INDEX
                        && item.getPreviousIndex() != null) {
                    ContractService cs = item.getContractService();
                    cs.setLastIndex(item.getPreviousIndex());
                    contractServiceRepository.save(cs);
                }
            }
        }

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

        long currentPaid = invoice.getPaidAmount();
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
        ContractTenant repCt = contract.getContractTenants() != null ? contract.getContractTenants().stream()
                .filter(ct -> Boolean.TRUE.equals(ct.getIsRepresentative()))
                .findFirst()
                .orElse(null) : null;
        if (repCt != null && repCt.getTenant() != null && repCt.getTenant().getUser() != null) {
            Notification n = Notification.builder()
                    .user(repCt.getTenant().getUser())
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
