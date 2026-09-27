package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.contract.*;
import com.doan.core.business.entity.*;
import com.doan.core.business.repository.*;
import com.doan.core.business.service.LandlordContractService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
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
    private final InvoiceRepository invoiceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getContracts(Long landlordId, Long buildingId, String status) {
        log.info("Lấy danh sách hợp đồng cho chủ trọ id: {}, tòa: {}, trạng thái: {}", landlordId, buildingId, status);
        List<Contract> contracts = contractRepository.filterContracts(landlordId, buildingId, status);

        return contracts.stream()
                .map(ContractResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ContractResponse getContractById(Long landlordId, Long contractId) {
        Contract contract = contractRepository.findByIdAndLandlordId(contractId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.CONTRACT_NOT_FOUND));

        return ContractResponse.fromEntity(contract);
    }

    @Override
    @Transactional
    public ContractResponse createContract(Long landlordId, ContractCreateRequest request) {
        log.info("Tạo hợp đồng thuê phòng: {} cho chủ trọ: {}", request.getRoomId(), landlordId);

        LocalDate endDate = request.getEndDate();
        if (endDate == null && request.getStartDate() != null) {
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

        if (!"AVAILABLE".equalsIgnoreCase(room.getStatus())) {
            throw new BaseException(ErrorCode.ROOM_NOT_AVAILABLE);
        }

        Tenant tenant = tenantRepository.findById(request.getRepresentativeTenantId())
                .orElseThrow(() -> new BaseException(ErrorCode.TENANT_NOT_FOUND));

        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra danh sách dịch vụ áp dụng: ưu tiên request.getServiceIds(), nếu không có thì kế thừa từ room.getServices()
        List<UtilityService> usList = new ArrayList<>();
        if (request.getServiceIds() != null && !request.getServiceIds().isEmpty()) {
            usList = utilityServiceRepository.findAllByIdInAndLandlordId(request.getServiceIds(), landlordId);
        } else if (room.getServices() != null && !room.getServices().isEmpty()) {
            usList = new ArrayList<>(room.getServices());
        }

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
                .status("ACTIVE")
                .build();

        Contract savedContract = contractRepository.save(contract);

        // Lưu danh sách dịch vụ áp dụng trong hợp đồng (từ serviceIds hoặc services)
        List<ContractService> csList = new ArrayList<>();
        if (request.getServices() != null && !request.getServices().isEmpty()) {
            for (ContractCreateRequest.ContractServiceItemRequest item : request.getServices()) {
                UtilityService us = item.getServiceId() != null
                        ? utilityServiceRepository.findById(item.getServiceId()).orElse(null)
                        : null;

                int initIndex = item.getInitialIndex() != null ? item.getInitialIndex() : 0;
                String method = item.getBillingMethod() != null ? item.getBillingMethod() : (us != null ? us.getBillingMethod() : "FIXED_PER_ROOM");

                ContractService cs = ContractService.builder()
                        .contract(savedContract)
                        .service(us)
                        .serviceName(item.getServiceName() != null ? item.getServiceName() : (us != null ? us.getName() : "Dịch vụ"))
                        .unit(item.getUnit() != null ? item.getUnit() : (us != null ? us.getUnit() : "Lần"))
                        .appliedUnitPrice(item.getAppliedUnitPrice() != null ? item.getAppliedUnitPrice() : (us != null ? us.getUnitPrice() : 0L))
                        .billingMethod(method)
                        .lastIndex(initIndex)
                        .build();
                csList.add(cs);
            }
        } else if (!usList.isEmpty()) {
            for (UtilityService us : usList) {
                csList.add(ContractService.builder()
                        .contract(savedContract)
                        .service(us)
                        .serviceName(us.getName())
                        .unit(us.getUnit())
                        .appliedUnitPrice(us.getUnitPrice())
                        .billingMethod(us.getBillingMethod())
                        .lastIndex(0)
                        .build());
            }
        }
        if (!csList.isEmpty()) {
            contractServiceRepository.saveAll(csList);
            savedContract.setContractServices(csList);
        }

        // Cập nhật trạng thái phòng thành ĐANG THUÊ (OCCUPIED)
        room.setStatus("OCCUPIED");
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

        if ("TERMINATED".equalsIgnoreCase(contract.getStatus())) {
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
    public CheckoutCalculationResponse terminateContract(Long landlordId, Long contractId, ContractTerminateRequest request) {
        log.info("Thanh lý hợp đồng id: {} của chủ trọ: {}", contractId, landlordId);

        Contract contract = contractRepository.findByIdAndLandlordId(contractId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.CONTRACT_NOT_FOUND));

        if ("TERMINATED".equalsIgnoreCase(contract.getStatus())) {
            throw new BaseException(ErrorCode.CONTRACT_ALREADY_TERMINATED);
        }

        // Tính tiêu thụ điện và nước từ chỉ số chốt gần nhất của contract_services hoặc kỳ hóa đơn trước
        int startElectric = 0;
        int startWater = 0;
        long electricUnitPrice = 3800L;
        long waterUnitPrice = 30000L;

        if (contract.getContractServices() != null) {
            for (ContractService cs : contract.getContractServices()) {
                String nameLower = cs.getServiceName().toLowerCase();
                if ("ELECTRICITY".equalsIgnoreCase(cs.getServiceName()) || nameLower.contains("điện")) {
                    startElectric = cs.getLastIndex() != null ? cs.getLastIndex() : 0;
                    electricUnitPrice = cs.getAppliedUnitPrice() != null ? cs.getAppliedUnitPrice() : 3800L;
                } else if ("WATER".equalsIgnoreCase(cs.getServiceName()) || nameLower.contains("nước")) {
                    startWater = cs.getLastIndex() != null ? cs.getLastIndex() : 0;
                    waterUnitPrice = cs.getAppliedUnitPrice() != null ? cs.getAppliedUnitPrice() : 30000L;
                }
            }
        }

        int endElectric = request.getFinalElectricIndex() != null ? request.getFinalElectricIndex() : startElectric;
        int electricConsumed = Math.max(0, endElectric - startElectric);

        int endWater = request.getFinalWaterIndex() != null ? request.getFinalWaterIndex() : startWater;
        int waterConsumed = Math.max(0, endWater - startWater);

        long electricAmount = electricConsumed * electricUnitPrice;
        long waterAmount = waterConsumed * waterUnitPrice;
        long totalUtilityCost = electricAmount + waterAmount;

        long initialDeposit = contract.getDepositAmount() != null ? contract.getDepositAmount() : 0L;
        long damageCost = request.getDamageCost() != null ? request.getDamageCost() : 0L;

        long netRefund = initialDeposit - totalUtilityCost - damageCost;

        // Cập nhật hợp đồng và chỉ số cuối của contract services
        if (contract.getContractServices() != null) {
            for (ContractService cs : contract.getContractServices()) {
                String nameLower = cs.getServiceName().toLowerCase();
                if ("ELECTRICITY".equalsIgnoreCase(cs.getServiceName()) || nameLower.contains("điện")) {
                    cs.setLastIndex(endElectric);
                } else if ("WATER".equalsIgnoreCase(cs.getServiceName()) || nameLower.contains("nước")) {
                    cs.setLastIndex(endWater);
                }
            }
            contractServiceRepository.saveAll(contract.getContractServices());
        }

        contract.setDepositRefundAmount(netRefund);
        contract.setStatus("TERMINATED");
        contractRepository.save(contract);

        // Chuyển phòng về trạng thái AVAILABLE, xóa occupancy và cập nhật khách thuê thành LEFT
        Room room = contract.getRoom();
        if (room != null) {
            room.setStatus("AVAILABLE");
            room.setCurrentOccupancy(0);
            roomRepository.save(room);

            List<Tenant> stayingTenants = tenantRepository.findByRoomId(room.getId());
            for (Tenant t : stayingTenants) {
                t.setStatus("LEFT");
                t.setRoom(null);
            }
            tenantRepository.saveAll(stayingTenants);
        }

        return CheckoutCalculationResponse.builder()
                .initialDeposit(initialDeposit)
                .electricConsumed(electricConsumed)
                .electricAmount(electricAmount)
                .waterConsumed(waterConsumed)
                .waterAmount(waterAmount)
                .totalUtilityCost(totalUtilityCost)
                .damageCost(damageCost)
                .damageNote(request.getDamageNote())
                .netRefundAmount(netRefund)
                .build();
    }
}
