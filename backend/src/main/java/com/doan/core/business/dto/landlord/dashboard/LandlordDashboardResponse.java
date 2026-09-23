package com.doan.core.business.dto.landlord.dashboard;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Số liệu thống kê Dashboard tổng quan của chủ trọ")
public class LandlordDashboardResponse {

    @Schema(description = "Doanh thu thực thu trong tháng (VNĐ)", example = "85600000")
    private Long monthlyRevenue;

    @Schema(description = "Tỷ lệ lấp đầy phòng (%)", example = "92.5")
    private Double occupancyRate;

    @Schema(description = "Tổng số tòa nhà", example = "3")
    private Long totalBuildings;

    @Schema(description = "Tổng số phòng trọ", example = "40")
    private Long totalRooms;

    @Schema(description = "Số phòng đang thuê", example = "37")
    private Long occupiedRooms;

    @Schema(description = "Số phòng còn trống", example = "3")
    private Long availableRooms;

    @Schema(description = "Số phòng đang sửa chữa", example = "0")
    private Long maintenanceRooms;

    @Schema(description = "Số khách thuê đang ở", example = "78")
    private Long activeTenants;

    @Schema(description = "Số hóa đơn chưa thanh toán", example = "5")
    private Long unpaidInvoicesCount;

    @Schema(description = "Số khiếu nại báo hỏng đang chờ xử lý", example = "2")
    private Long pendingComplaintsCount;
}
