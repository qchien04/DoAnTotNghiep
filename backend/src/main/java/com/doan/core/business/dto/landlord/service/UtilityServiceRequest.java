package com.doan.core.business.dto.landlord.service;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu thêm mới hoặc cập nhật dịch vụ tiện ích")
public class UtilityServiceRequest {

    @Schema(description = "Mã dịch vụ", example = "DV01")
    private String serviceCode;

    @NotBlank(message = "Tên dịch vụ không được để trống")
    @Schema(description = "Tên dịch vụ", example = "Điện sinh hoạt")
    private String name;

    @NotBlank(message = "Loại dịch vụ không được để trống")
    @Schema(description = "Phân loại (ELECTRICITY, WATER, INTERNET, CLEANING, PARKING, OTHER)", example = "ELECTRICITY")
    private String category;

    @NotBlank(message = "Đơn vị tính không được để trống")
    @Schema(description = "Đơn vị tính", example = "kWh (Số)")
    private String unit;

    @NotNull(message = "Đơn giá không được để trống")
    @Min(value = 0, message = "Đơn giá phải lớn hơn hoặc bằng 0")
    @Schema(description = "Đơn giá (VNĐ)", example = "3800")
    private Long unitPrice;

    @NotBlank(message = "Hình thức thu phí không được để trống")
    @Schema(description = "Hình thức thu phí (METER_INDEX, FIXED_PER_ROOM, FIXED_PER_PERSON, FIXED_PER_UNIT)", example = "METER_INDEX")
    private String billingMethod;

    @Schema(description = "Phạm vi áp dụng (Tất cả, Tòa nhà cụ thể)", example = "ALL")
    private String scope;

    @Schema(description = "Trạng thái hoạt động", example = "true")
    private Boolean isActive;
}
