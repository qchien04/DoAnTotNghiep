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

        long totalBuildings = buildingRepository.findByLandlordId(landlordId).size();
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
                .build();
    }
}
