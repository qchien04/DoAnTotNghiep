package com.doan.core.business.controller.landlord;

import com.doan.core.business.dto.landlord.dashboard.LandlordDashboardResponse;
import com.doan.core.business.service.LandlordDashboardService;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/landlord/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
@Tag(name = "9. Chủ trọ - Dashboard Thống kê (UC 29)", description = "Theo dõi doanh thu, tỷ lệ lấp đầy phòng, số phòng trống và hóa đơn nợ cước")
public class LandlordDashboardController {

    private final LandlordDashboardService dashboardService;

    @GetMapping
    @Operation(summary = "UC 29: Xem Dashboard thống kê chủ trọ", description = "Lấy các chỉ số KPI: Doanh thu tháng, tỷ lệ lấp đầy, số phòng trống, số khách thuê và sự cố chờ xử lý")
    public ResponseEntity<ResponseData<LandlordDashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String billingPeriod) {
        LandlordDashboardResponse stats = dashboardService.getDashboardStats(principal.getId(), billingPeriod);
        return ResponseEntity.ok(ResponseData.success(stats));
    }
}
