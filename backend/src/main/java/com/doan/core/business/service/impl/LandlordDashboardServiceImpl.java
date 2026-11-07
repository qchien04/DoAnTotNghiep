package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.dashboard.LandlordDashboardResponse;
import com.doan.core.business.entity.*;
import com.doan.core.business.enums.ComplaintStatus;
import com.doan.core.business.enums.InvoiceStatus;
import com.doan.core.business.enums.RoomStatus;
import com.doan.core.business.repository.*;
import com.doan.core.business.service.LandlordDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordDashboardServiceImpl implements LandlordDashboardService {

        private final BuildingRepository buildingRepository;
        private final RoomRepository roomRepository;
        private final TenantRepository tenantRepository;
        private final InvoiceRepository invoiceRepository;
        private final ComplaintRepository complaintRepository;

        @Override
        @Transactional(readOnly = true)
        public LandlordDashboardResponse getDashboardStats(Long landlordId, String billingPeriod) {
                log.info("Thống kê Dashboard cho chủ trọ id: {}, kỳ cước: {}", landlordId, billingPeriod);

                if (billingPeriod == null || billingPeriod.isBlank()) {
                        LocalDate now = LocalDate.now();
                        billingPeriod = (now.getMonthValue() < 10 ? "0" : "") + now.getMonthValue() + "/"
                                        + now.getYear();
                }

                long totalBuildings = buildingRepository.countByLandlordId(landlordId);
                long totalRooms = roomRepository.countByBuildingLandlordId(landlordId);
                long occupiedRooms = roomRepository.countByBuildingLandlordIdAndStatus(landlordId, RoomStatus.OCCUPIED);
                long availableRooms = roomRepository.countByBuildingLandlordIdAndStatus(landlordId,
                                RoomStatus.AVAILABLE);
                long maintenanceRooms = roomRepository.countByBuildingLandlordIdAndStatus(landlordId,
                                RoomStatus.UNDER_MAINTENANCE);

                double occupancyRate = 0.0;
                if (totalRooms > 0) {
                        occupancyRate = Math.round(((double) occupiedRooms / totalRooms * 100.0) * 10.0) / 10.0;
                }

                long activeTenants = tenantRepository.countActiveTenantsByLandlordId(landlordId);
                long unpaidInvoices = invoiceRepository.countByContractLandlordIdAndStatus(landlordId,
                                InvoiceStatus.UNPAID);
                long pendingComplaints = complaintRepository.countByRoomBuildingLandlordIdAndStatus(landlordId,
                                ComplaintStatus.PENDING);

                Long monthlyRevenue = invoiceRepository.sumRevenueByLandlordAndPeriod(landlordId, billingPeriod);
                if (monthlyRevenue == null) {
                        monthlyRevenue = 0L;
                }

                // 1. Tính xu hướng doanh thu 6 tháng gần nhất
                java.util.List<LandlordDashboardResponse.RevenueTrendItem> trendList = new java.util.ArrayList<>();
                LocalDate currentMonth = LocalDate.now();
                for (int i = 5; i >= 0; i--) {
                        LocalDate m = currentMonth.minusMonths(i);
                        String pStr = (m.getMonthValue() < 10 ? "0" : "") + m.getMonthValue() + "/" + m.getYear();
                        String displayMonth = "T" + m.getMonthValue();
                        Long rev = invoiceRepository.sumRevenueByLandlordAndPeriod(landlordId, pStr);
                        trendList.add(LandlordDashboardResponse.RevenueTrendItem.builder()
                                        .month(displayMonth)
                                        .revenue(rev != null ? rev : 0L)
                                        .build());
                }

                // 2. Tìm danh sách công nợ quá hạn
                java.util.List<Invoice> allInvoices = invoiceRepository.filterInvoices(
                                landlordId, null, null, null, null,
                                PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
                java.util.List<LandlordDashboardResponse.OverdueDebtItem> debtList = allInvoices.stream()
                                .filter(inv -> inv.getStatus() != InvoiceStatus.PAID
                                                && inv.getStatus() != InvoiceStatus.CANCELLED)
                                .filter(inv -> inv.getDueDate().isBefore(LocalDate.now()))
                                .map(inv -> {
                                        long remaining = Math.max(0, inv.getTotalAmount() - inv.getPaidAmount());
                                        long daysLate = java.time.temporal.ChronoUnit.DAYS.between(inv.getDueDate(),
                                                        LocalDate.now());
                                        Contract contract = inv.getContract();
                                        Room room = contract.getRoom();
                                        String rName = room.getName();
                                        Building building = room.getBuilding();
                                        String bName = building != null ? building.getName() : "Phòng độc lập";
                                        ContractTenant repCt = contract.getContractTenants() != null
                                                        ? contract.getContractTenants().stream()
                                                                        .filter(ct -> Boolean.TRUE.equals(ct.getIsRepresentative()))
                                                                        .findFirst()
                                                                        .orElse(null)
                                                        : null;
                                        Tenant repTenant = repCt != null ? repCt.getTenant() : null;
                                        String tName = repTenant != null ? repTenant.getFullName() : "---";
                                        String phone = repTenant != null ? repTenant.getPhone() : "---";

                                        return LandlordDashboardResponse.OverdueDebtItem.builder()
                                                        .roomName(rName)
                                                        .buildingName(bName)
                                                        .tenantName(tName)
                                                        .phone(phone)
                                                        .debtAmount(remaining)
                                                        .daysLate(daysLate)
                                                        .build();
                                })
                                .filter(item -> item.getDebtAmount() > 0)
                                .limit(10)
                                .collect(java.util.stream.Collectors.toList());

                return LandlordDashboardResponse.builder()
                                .monthlyRevenue(monthlyRevenue)
                                .occupancyRate(occupancyRate)
                                .totalBuildings(totalBuildings)
                                .totalRooms(totalRooms)
                                .occupiedRooms(occupiedRooms)
                                .availableRooms(availableRooms)
                                .maintenanceRooms(maintenanceRooms)
                                .activeTenants(activeTenants)
                                .unpaidInvoicesCount(unpaidInvoices)
                                .pendingComplaintsCount(pendingComplaints)
                                .revenueTrend(trendList)
                                .overdueDebts(debtList)
                                .build();
        }
}
