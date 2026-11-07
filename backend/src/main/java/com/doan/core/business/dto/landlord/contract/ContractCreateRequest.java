package com.doan.core.business.dto.landlord.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
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

    @Schema(description = "Danh sách ID các khách thuê ở trong phòng (bao gồm cả khách đại diện và thành viên)", example = "[1, 2]")
    private List<Long> tenantIds;

    @NotNull(message = "Ngày bắt đầu hợp đồng không được để trống")
    @Schema(description = "Ngày bắt đầu hợp đồng", example = "2026-10-01")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc hợp đồng không được để trống")
    @Schema(description = "Ngày kết thúc hợp đồng (nếu để trống hệ thống sẽ tính theo startDate + durationMonths)", example = "2027-09-30")
    private LocalDate endDate;

    @NotNull(message = "Giá thuê phòng không được để trống")
    @Min(value = 1, message = "Giá thuê phòng phải lớn hơn 0")
    @Schema(description = "Tiền thuê thỏa thuận (VNĐ/tháng)", example = "3800000")
    private Long rentPrice;

    @NotNull(message = "Tiền cọc phòng không được để trống")
    @Min(value = 0, message = "Tiền cọc phòng không được là số âm")
    @Schema(description = "Tiền đặt cọc (VNĐ)", example = "3800000")
    private Long depositAmount;

    @Min(value = 1, message = "Ngày chu kỳ thanh toán phải từ 1 đến 31")
    @Max(value = 31, message = "Ngày chu kỳ thanh toán phải từ 1 đến 31")
    @Schema(description = "Chu kỳ thanh toán hàng tháng (ngày thu tiền)", example = "5")
    private Integer paymentCycleDay = 5;

    @Schema(description = "Các điều khoản thỏa thuận")
    private String termsAndConditions;

    @Schema(description = "Danh sách chi tiết dịch vụ áp dụng trong hợp đồng (kèm đơn giá thỏa thuận và chỉ số ban đầu)")
    private List<@Valid ContractServiceItemRequest> services;
}
