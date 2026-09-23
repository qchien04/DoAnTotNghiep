package com.doan.core.business.dto.landlord.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Schema(description = "Yêu cầu tạo hợp đồng thuê phòng mới")
public class ContractCreateRequest {

    @NotNull(message = "Phòng thuê không được để trống")
    @Schema(description = "ID phòng thuê (phòng phải ở trạng thái AVAILABLE)", example = "1")
    private Long roomId;

    @NotNull(message = "Khách đại diện không được để trống")
    @Schema(description = "ID khách thuê làm người đại diện hợp đồng", example = "1")
    private Long representativeTenantId;

    @Schema(description = "Mã hợp đồng (nếu để trống hệ thống sẽ tự sinh)", example = "HĐ-2026-P102")
    private String contractCode;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @Schema(description = "Ngày bắt đầu hợp đồng", example = "2026-10-01")
    private LocalDate startDate;

    @Schema(description = "Thời hạn hợp đồng (tháng) - nếu không truyền endDate, hệ thống sẽ tự tính", example = "12")
    private Integer durationMonths;

    @Schema(description = "Ngày kết thúc hợp đồng (nếu để trống hệ thống sẽ tính theo startDate + durationMonths)", example = "2027-09-30")
    private LocalDate endDate;

    @NotNull(message = "Tiền thuê thỏa thuận không được để trống")
    @Min(value = 1, message = "Tiền thuê phải lớn hơn 0")
    @Schema(description = "Tiền thuê thỏa thuận (VNĐ/tháng)", example = "3800000")
    private Long rentPrice;

    @NotNull(message = "Tiền đặt cọc không được để trống")
    @Min(value = 0, message = "Tiền cọc không được là số âm")
    @Schema(description = "Tiền đặt cọc (VNĐ)", example = "3800000")
    private Long depositAmount;

    @Schema(description = "Chu kỳ thanh toán hàng tháng (ngày thu tiền)", example = "5")
    private Integer paymentCycleDay = 5;

    @Schema(description = "Chỉ số điện bắt đầu", example = "1420")
    private Integer initialElectricIndex = 0;

    @Schema(description = "Chỉ số nước bắt đầu", example = "85")
    private Integer initialWaterIndex = 0;

    @Schema(description = "Các điều khoản thỏa thuận")
    private String termsAndConditions;

    @Schema(description = "Danh sách ID dịch vụ áp dụng trong hợp đồng (Điện, nước, internet...)", example = "[1, 2, 3]")
    private List<Long> serviceIds;

    @Schema(description = "Danh sách dịch vụ áp dụng trong hợp đồng (tùy chọn nếu không dùng serviceIds)")
    private List<ContractServiceItemRequest> services;

    @Data
    public static class ContractServiceItemRequest {
        private Long serviceId;
        private String serviceName;
        private String unit;
        private Long appliedUnitPrice;
        private String billingMethod;
    }
}
