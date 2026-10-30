package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.contract.*;
import com.doan.core.business.entity.*;
import com.doan.core.business.enums.BillingMethod;
import com.doan.core.business.enums.ContractStatus;
import com.doan.core.business.enums.RoomStatus;
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
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

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
    private final ContractTenantRepository contractTenantRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ContractResponse> getContracts(Long landlordId, Long buildingId, ContractStatus status,
            String keyword,
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
        Sort sort = Sort.by(direction, sortProperty);

        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        log.info("Lấy danh sách hợp đồng cho chủ trọ id: {}, tòa: {}, status: {}, keyword: {}, pageable: {}",
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

        LocalDate endDate = request.getEndDate();
        if (endDate == null || !endDate.isAfter(request.getStartDate())) {
            throw new BaseException(ErrorCode.INVALID_CONTRACT_DATES);
        }

        Room room = roomRepository.findByIdAndBuildingLandlordId(request.getRoomId(), landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new BaseException(ErrorCode.ROOM_NOT_AVAILABLE);
        }

        // 1. Xác thực và gom danh sách khách thuê hợp lệ
        List<Tenant> contractTenants = validateAndGetTenants(landlordId, room, request);

        // 2. Khởi tạo và lưu Hợp đồng chính
        User landlord = userRepository.getReferenceById(landlordId);
        Contract contract = Contract.builder()
                .room(room)
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

        // 3. Liên kết danh sách khách thuê vào hợp đồng (bảng trung gian
        // contract_tenants)
        List<ContractTenant> ctList = linkTenantsToContract(savedContract, contractTenants,
                request.getRepresentativeTenantId());
        savedContract.setContractTenants(ctList);

        // 4. Liên kết danh sách dịch vụ tiện ích vào hợp đồng (bảng contract_services)
        List<ContractService> csList = attachServicesToContract(landlordId, savedContract, request.getServices());
        savedContract.setContractServices(csList);

        // 5. Cập nhật trạng thái phòng sang ĐANG THUÊ và cập nhật số người ở thực tế
        updateRoomOccupancy(room, contractTenants.size());

        return ContractResponse.fromEntity(savedContract);
    }

    /**
     * Xác thực thông tin khách thuê: kiểm tra sức chứa phòng và quyền quản lý của
     * chủ trọ
     */
    private List<Tenant> validateAndGetTenants(Long landlordId, Room room, ContractCreateRequest request) {
        Set<Long> allTenantIds = new LinkedHashSet<>();
        allTenantIds.add(request.getRepresentativeTenantId());
        if (request.getTenantIds() != null) {
            allTenantIds.addAll(request.getTenantIds());
        }

        if (allTenantIds.size() > room.getMaxCapacity()) {
            throw new BaseException(ErrorCode.BAD_REQUEST,
                    "Số lượng khách thuê (" + allTenantIds.size() + " người) vượt quá sức chứa tối đa của phòng ("
                            + room.getMaxCapacity() + " người)");
        }

        List<Tenant> contractTenants = tenantRepository.findAllByIdsAndLandlordId(allTenantIds, landlordId);
        if (contractTenants.size() != allTenantIds.size()) {
            throw new BaseException(ErrorCode.TENANT_NOT_FOUND,
                    "Một hoặc nhiều khách thuê không tồn tại hoặc không thuộc quyền quản lý của bạn");
        }
        return contractTenants;
    }

    /**
     * Lưu danh sách khách thuê liên kết với hợp đồng (bảng trung gian
     * contract_tenants)
     */
    private List<ContractTenant> linkTenantsToContract(Contract contract, List<Tenant> tenants,
            Long representativeTenantId) {
        List<ContractTenant> ctList = new ArrayList<>();
        for (Tenant t : tenants) {
            boolean isRep = t.getId().equals(representativeTenantId);
            ContractTenant ct = ContractTenant.builder()
                    .contract(contract)
                    .tenant(t)
                    .isRepresentative(isRep)
                    .build();
            ctList.add(ct);
        }
        return contractTenantRepository.saveAll(ctList);
    }

    /**
     * Gắn danh sách dịch vụ tiện ích vào hợp đồng (batch query tối ưu tránh N+1)
     */
    private List<ContractService> attachServicesToContract(Long landlordId, Contract contract,
            List<ContractServiceItemRequest> serviceRequests) {
        if (serviceRequests == null || serviceRequests.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> serviceIds = serviceRequests.stream()
                .map(ContractServiceItemRequest::getServiceId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (serviceIds.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, UtilityService> serviceMap = utilityServiceRepository
                .findAllByIdInAndLandlordId(serviceIds, landlordId).stream()
                .collect(Collectors.toMap(UtilityService::getId, Function.identity()));

        List<ContractService> csList = new ArrayList<>();
        for (ContractServiceItemRequest item : serviceRequests) {
            UtilityService us = serviceMap.get(item.getServiceId());
            if (us == null) {
                throw new BaseException(ErrorCode.SERVICE_NOT_FOUND,
                        "Dịch vụ tiện ích (ID: " + item.getServiceId()
                                + ") không tồn tại hoặc không thuộc quyền quản lý của bạn");
            }

            BillingMethod method = us.getBillingMethod();
            int initIndex = (method == BillingMethod.METER_INDEX && item.getInitialIndex() != null)
                    ? item.getInitialIndex()
                    : 0;

            ContractService cs = ContractService.builder()
                    .contract(contract)
                    .service(us)
                    .serviceName(us.getName())
                    .unit(us.getUnit())
                    .appliedUnitPrice(us.getUnitPrice())
                    .billingMethod(method)
                    .lastIndex(initIndex)
                    .build();
            csList.add(cs);
        }

        return csList.isEmpty() ? Collections.emptyList() : contractServiceRepository.saveAll(csList);
    }

    /**
     * Chuyển trạng thái phòng sang ĐANG THUÊ (OCCUPIED) và lưu số lượng khách đang
     * ở
     */
    private void updateRoomOccupancy(Room room, int occupancy) {
        room.setStatus(RoomStatus.OCCUPIED);
        room.setCurrentOccupancy(occupancy);
        roomRepository.save(room);
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
                BillingMethod method = cs.getBillingMethod();

                // Chỉ dịch vụ có billingMethod = METER_INDEX mới tính toán theo chỉ số công tơ
                if (method == BillingMethod.METER_INDEX) {
                    if (!readingMap.containsKey(cs.getId())) {
                        throw new BaseException(ErrorCode.BAD_REQUEST,
                                "Vui lòng nhập chỉ số công tơ chốt ngày trả phòng cho dịch vụ: " + cs.getServiceName());
                    }

                    int startIdx = cs.getLastIndex();
                    int endIdx = readingMap.get(cs.getId());

                    if (endIdx < startIdx) {
                        throw new BaseException(ErrorCode.INVALID_METER_READING,
                                "Chỉ số chốt ngày trả phòng (" + endIdx + ") không được nhỏ hơn chỉ số trước đó ("
                                        + startIdx + ") cho dịch vụ: " + cs.getServiceName());
                    }

                    int consumed = endIdx - startIdx;
                    long unitPrice = cs.getAppliedUnitPrice();
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

        long initialDeposit = contract.getDepositAmount();
        long damageCost = request.getDamageCost() != null ? request.getDamageCost() : 0L;
        if (damageCost < 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Chi phí bồi thường hư hỏng không được là số âm");
        }

        long netRefund = initialDeposit - totalUtilityCost - damageCost;

        contract.setDepositRefundAmount(netRefund);
        contract.setStatus(ContractStatus.TERMINATED);
        contractRepository.save(contract);

        Room room = contract.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);
        room.setCurrentOccupancy(0);
        roomRepository.save(room);

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
