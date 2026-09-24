package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.dashboard.LandlordDashboardResponse;
import com.doan.core.business.repository.*;
import com.doan.core.business.service.LandlordDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
            billingPeriod = (now.getMonthValue() < 10 ? "0" : "") + now.getMonthValue() + "/" + now.getYear();
        }

        long totalBuildings = buildingRepository.countByLandlordId(landlordId);
        long totalRooms = roomRepository.countByBuildingLandlordId(landlordId);
        long occupiedRooms = roomRepository.countByBuildingLandlordIdAndStatus(landlordId, "OCCUPIED");
        long availableRooms = roomRepository.countByBuildingLandlordIdAndStatus(landlordId, "AVAILABLE");
        long maintenanceRooms = roomRepository.countByBuildingLandlordIdAndStatus(landlordId, "UNDER_MAINTENANCE");

        double occupancyRate = 0.0;
        if (totalRooms > 0) {
            occupancyRate = Math.round(((double) occupiedRooms / totalRooms * 100.0) * 10.0) / 10.0;
        }

        long activeTenants = tenantRepository.countByRoomBuildingLandlordIdAndStatus(landlordId, "STAYING");
        long unpaidInvoices = invoiceRepository.countByContractLandlordIdAndStatus(landlordId, "UNPAID");
        long pendingComplaints = complaintRepository.countByRoomBuildingLandlordIdAndStatus(landlordId, "PENDING");

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
        java.util.List<com.doan.core.business.entity.Invoice> allInvoices = invoiceRepository.filterInvoices(landlordId, null, null, null);
        java.util.List<LandlordDashboardResponse.OverdueDebtItem> debtList = allInvoices.stream()
                .filter(inv -> !"PAID".equalsIgnoreCase(inv.getStatus()) && !"CANCELLED".equalsIgnoreCase(inv.getStatus()))
                .filter(inv -> inv.getDueDate() != null && inv.getDueDate().isBefore(LocalDate.now()))
                .map(inv -> {
                    long remaining = Math.max(0, inv.getTotalAmount() - (inv.getPaidAmount() != null ? inv.getPaidAmount() : 0L));
                    long daysLate = java.time.temporal.ChronoUnit.DAYS.between(inv.getDueDate(), LocalDate.now());
                    String rCode = (inv.getContract() != null && inv.getContract().getRoom() != null)
                            ? inv.getContract().getRoom().getRoomCode() : "---";
                    String bName = (inv.getContract() != null && inv.getContract().getRoom() != null && inv.getContract().getRoom().getBuilding() != null)
                            ? inv.getContract().getRoom().getBuilding().getName() : "---";
                    String tName = (inv.getContract() != null && inv.getContract().getRepresentativeTenant() != null)
                            ? inv.getContract().getRepresentativeTenant().getFullName() : "---";
                    String phone = (inv.getContract() != null && inv.getContract().getRepresentativeTenant() != null)
                            ? inv.getContract().getRepresentativeTenant().getPhone() : "---";

                    return LandlordDashboardResponse.OverdueDebtItem.builder()
                            .roomName("Phòng " + rCode)
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
