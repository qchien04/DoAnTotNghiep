package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.contract.*;
import com.doan.core.business.entity.*;
import com.doan.core.business.enums.BillingMethod;
import com.doan.core.business.enums.ContractStatus;
import com.doan.core.business.enums.RoomStatus;
import com.doan.core.business.enums.TenantStatus;
import com.doan.core.business.repository.*;
import com.doan.core.business.service.LandlordContractService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordContractServiceImpl implements LandlordContractService {

    private final ContractRepository contractRepository;
    private final ContractServiceRepository contractServiceRepository;
    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final UtilityServiceRepository utilityServiceRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ContractResponse> getContracts(Long landlordId, Long buildingId, ContractStatus status, String keyword,
                                                       int page, int size, String sortBy, String sortDirection) {
        String kw = (keyword != null && !keyword.trim().isBlank()) ? keyword.trim() : null;

        Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? Direction.ASC
                : Direction.DESC;
        String sortProperty = switch (sortBy != null ? sortBy.toLowerCase() : "id") {
            case "startdate" -> "startDate";
            case "enddate" -> "endDate";
            case "rentprice" -> "rentPrice";
            case "depositamount" -> "depositAmount";
            case "status" -> "status";
            default -> "id";
        };
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(direction, sortProperty);

        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        log.info("Lấy danh sách hợp đồng cho chủ trọ id: {}, tòa: {}, trạng thái: {}, keyword: {}, pageable: {}",
                landlordId, buildingId, status, kw, pageable);
        Page<Contract> contracts = contractRepository.filterContracts(landlordId, buildingId, status, kw, pageable);

        Page<ContractResponse> dtoPage = contracts.map(ContractResponse::fromEntity);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public ContractResponse getContractById(Long landlordId, Long contractId) {
        log.info("Lấy chi tiết hợp đồng id: {} cho chủ trọ: {}", contractId, landlordId);

        Contract contract = contractRepository.findByIdAndLandlordId(contractId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.CONTRACT_NOT_FOUND));

        return ContractResponse.fromEntity(contract);
    }

    @Override
    @Transactional
    public ContractResponse createContract(Long landlordId, ContractCreateRequest request) {
        log.info("Tạo hợp đồng mới cho chủ trọ: {}, phòng: {}, khách đại diện: {}",
                landlordId, request.getRoomId(), request.getRepresentativeTenantId());

        if (request.getRentPrice() == null || request.getRentPrice() <= 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Giá thuê phòng phải lớn hơn 0");
        }
        if (request.getDepositAmount() == null || request.getDepositAmount() < 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Tiền cọc phòng không được là số âm");
        }
        if (request.getStartDate() == null) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Ngày bắt đầu hợp đồng không được để trống");
        }

        LocalDate endDate = request.getEndDate();
        if (endDate == null) {
            int months = (request.getDurationMonths() != null && request.getDurationMonths() > 0)
                    ? request.getDurationMonths()
                    : 12;
            endDate = request.getStartDate().plusMonths(months).minusDays(1);
        }

        if (endDate == null || !endDate.isAfter(request.getStartDate())) {
            throw new BaseException(ErrorCode.INVALID_CONTRACT_DATES);
        }

        Room room = roomRepository.findByIdAndBuildingLandlordId(request.getRoomId(), landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new BaseException(ErrorCode.ROOM_NOT_AVAILABLE);
        }

        Tenant tenant = tenantRepository.findById(request.getRepresentativeTenantId())
                .orElseThrow(() -> new BaseException(ErrorCode.TENANT_NOT_FOUND));

        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        Contract contract = Contract.builder()
                .room(room)
                .representativeTenant(tenant)
                .landlord(landlord)
                .startDate(request.getStartDate())
                .endDate(endDate)
                .rentPrice(request.getRentPrice())
                .depositAmount(request.getDepositAmount())
                .paymentCycleDay(request.getPaymentCycleDay() != null ? request.getPaymentCycleDay() : 5)
                .termsAndConditions(request.getTermsAndConditions())
                .status(ContractStatus.ACTIVE)
                .build();

        Contract savedContract = contractRepository.save(contract);

        // Lưu danh sách dịch vụ áp dụng trong hợp đồng (CHỈ ÁP DỤNG DỊCH VỤ CHỦ TRỌ CHỈ
        // ĐỊNH TRONG REQUEST, KHÔNG TỰ Ý LẤY TỪ PHÒNG)
        List<ContractService> csList = new ArrayList<>();
        if (request.getServices() != null && !request.getServices().isEmpty()) {
            for (ContractCreateRequest.ContractServiceItemRequest item : request.getServices()) {
                UtilityService us = item.getServiceId() != null
                        ? utilityServiceRepository.findById(item.getServiceId()).orElse(null)
                        : null;

                BillingMethod method;
                if (item.getBillingMethod() != null) {
                    method = item.getBillingMethod();
                } else if (us != null && us.getBillingMethod() != null) {
                    method = us.getBillingMethod();
                } else {
                    method = BillingMethod.FIXED_PER_ROOM;
                }

                int initIndex = item.getInitialIndex() != null ? item.getInitialIndex() : 0;
                if (method == BillingMethod.METER_INDEX && initIndex < 0) {
                    throw new BaseException(ErrorCode.BAD_REQUEST, "Chỉ số ban đầu không được là số âm");
                }

                long price = item.getAppliedUnitPrice() != null ? item.getAppliedUnitPrice()
                        : (us != null ? us.getUnitPrice() : 0L);
                if (price < 0) {
                    throw new BaseException(ErrorCode.BAD_REQUEST, "Đơn giá dịch vụ không được là số âm");
                }

                ContractService cs = ContractService.builder()
                        .contract(savedContract)
                        .service(us)
                        .serviceName(item.getServiceName() != null ? item.getServiceName().trim()
                                : (us != null ? us.getName() : "Dịch vụ"))
                        .unit(item.getUnit() != null ? item.getUnit().trim() : (us != null ? us.getUnit() : "Lần"))
                        .appliedUnitPrice(price)
                        .billingMethod(method)
                        .lastIndex(initIndex)
                        .build();
                csList.add(cs);
            }
        }
        if (!csList.isEmpty()) {
            contractServiceRepository.saveAll(csList);
            savedContract.setContractServices(csList);
        }

        // Cập nhật trạng thái phòng thành ĐANG THUÊ (OCCUPIED)
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        // Cập nhật khách đại diện
        tenant.setContract(savedContract);
        tenant.setIsRepresentative(true);
        tenantRepository.save(tenant);

        return ContractResponse.fromEntity(savedContract);
    }

    @Override
    @Transactional
    public ContractResponse updateContract(Long landlordId, Long contractId, ContractUpdateRequest request) {
        log.info("Cập nhật hợp đồng id: {} của chủ trọ: {}", contractId, landlordId);

        Contract contract = contractRepository.findByIdAndLandlordId(contractId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.CONTRACT_NOT_FOUND));

        if (contract.getStatus() == ContractStatus.TERMINATED) {
            throw new BaseException(ErrorCode.CONTRACT_ALREADY_TERMINATED);
        }

        if (request.getEndDate() != null) {
            if (!request.getEndDate().isAfter(contract.getStartDate())) {
                throw new BaseException(ErrorCode.INVALID_CONTRACT_DATES);
            }
            contract.setEndDate(request.getEndDate());
        }

        if (request.getRentPrice() != null) {
            if (request.getRentPrice() <= 0) {
                throw new BaseException(ErrorCode.BAD_REQUEST, "Giá thuê phòng phải lớn hơn 0");
            }
            contract.setRentPrice(request.getRentPrice());
        }

        if (request.getPaymentCycleDay() != null) {
            contract.setPaymentCycleDay(request.getPaymentCycleDay());
        }

        if (request.getTermsAndConditions() != null) {
            contract.setTermsAndConditions(request.getTermsAndConditions());
        }

        Contract updated = contractRepository.save(contract);
        return ContractResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public CheckoutCalculationResponse terminateContract(Long landlordId, Long contractId,
            ContractTerminateRequest request) {
        log.info("Thanh lý hợp đồng id: {} của chủ trọ: {}", contractId, landlordId);

        Contract contract = contractRepository.findByIdAndLandlordId(contractId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.CONTRACT_NOT_FOUND));

        if (contract.getStatus() == ContractStatus.TERMINATED) {
            throw new BaseException(ErrorCode.CONTRACT_ALREADY_TERMINATED);
        }

        // Quyết toán tài chính khi trả phòng căn cứ theo billingMethod của từng dịch vụ
        // trong hợp đồng
        long totalUtilityCost = 0L;
        List<CheckoutCalculationResponse.ServiceSettlementItem> settlements = new ArrayList<>();

        Map<Long, Integer> readingMap = new HashMap<>();
        if (request.getMeterReadings() != null) {
            for (ContractTerminateRequest.MeterReadingItem item : request.getMeterReadings()) {
                if (item.getContractServiceId() != null && item.getFinalIndex() != null) {
                    readingMap.put(item.getContractServiceId(), item.getFinalIndex());
                }
            }
        }

        if (contract.getContractServices() != null) {
            for (ContractService cs : contract.getContractServices()) {
                BillingMethod method = cs.getBillingMethod() != null ? cs.getBillingMethod()
                        : BillingMethod.FIXED_PER_ROOM;

                // Chỉ dịch vụ có billingMethod = METER_INDEX mới tính toán theo chỉ số công tơ
                if (method == BillingMethod.METER_INDEX) {
                    if (!readingMap.containsKey(cs.getId())) {
                        throw new BaseException(ErrorCode.BAD_REQUEST,
                                "Vui lòng nhập chỉ số công tơ chốt ngày trả phòng cho dịch vụ: " + cs.getServiceName());
                    }

                    int startIdx = cs.getLastIndex() != null ? cs.getLastIndex() : 0;
                    int endIdx = readingMap.get(cs.getId());

                    if (endIdx < startIdx) {
                        throw new BaseException(ErrorCode.INVALID_METER_READING,
                                "Chỉ số chốt ngày trả phòng (" + endIdx + ") không được nhỏ hơn chỉ số trước đó ("
                                        + startIdx + ") cho dịch vụ: " + cs.getServiceName());
                    }

                    int consumed = endIdx - startIdx;
                    long unitPrice = cs.getAppliedUnitPrice() != null ? cs.getAppliedUnitPrice() : 0L;
                    long amount = (long) consumed * unitPrice;
                    totalUtilityCost += amount;
                    cs.setLastIndex(endIdx);

                    settlements.add(CheckoutCalculationResponse.ServiceSettlementItem.builder()
                            .contractServiceId(cs.getId())
                            .serviceName(cs.getServiceName())
                            .unit(cs.getUnit())
                            .startIndex(startIdx)
                            .endIndex(endIdx)
                            .consumed(consumed)
                            .unitPrice(unitPrice)
                            .amount(amount)
                            .build());
                }
            }
            contractServiceRepository.saveAll(contract.getContractServices());
        }

        long initialDeposit = contract.getDepositAmount() != null ? contract.getDepositAmount() : 0L;
        long damageCost = request.getDamageCost() != null ? request.getDamageCost() : 0L;
        if (damageCost < 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Chi phí bồi thường hư hỏng không được là số âm");
        }

        long netRefund = initialDeposit - totalUtilityCost - damageCost;

        contract.setDepositRefundAmount(netRefund);
        contract.setStatus(ContractStatus.TERMINATED);
        contractRepository.save(contract);

        // Chuyển phòng về trạng thái AVAILABLE, xóa occupancy và cập nhật khách thuê
        // thành LEFT
        Room room = contract.getRoom();
        if (room != null) {
            room.setStatus(RoomStatus.AVAILABLE);
            room.setCurrentOccupancy(0);
            roomRepository.save(room);

            List<Tenant> stayingTenants = tenantRepository.findByRoomId(room.getId());
            for (Tenant t : stayingTenants) {
                t.setStatus(TenantStatus.LEFT);
                t.setRoom(null);
            }
            tenantRepository.saveAll(stayingTenants);
        }

        return CheckoutCalculationResponse.builder()
                .initialDeposit(initialDeposit)
                .totalUtilityCost(totalUtilityCost)
                .settlements(settlements)
                .damageCost(damageCost)
                .damageNote(request.getDamageNote())
                .netRefundAmount(netRefund)
                .build();
    }
}
