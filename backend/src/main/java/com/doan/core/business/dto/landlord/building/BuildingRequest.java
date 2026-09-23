package com.doan.core.business.dto.landlord.building;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Yêu cầu thêm mới / cập nhật tòa nhà")
public class BuildingRequest {

    @Schema(description = "Mã tòa nhà (nếu để trống hệ thống sẽ tự sinh)", example = "TN01")
    private String buildingCode;

    @NotBlank(message = "Tên tòa nhà không được để trống")
    @Schema(description = "Tên tòa nhà", example = "Tòa nhà Ánh Dương")
    private String name;

    @Schema(description = "Tỉnh / Thành phố", example = "Hà Nội")
    private String province;

    @Schema(description = "Quận / Huyện", example = "Cầu Giấy")
    private String district;

    @Schema(description = "Phường / Xã", example = "Quan Hoa")
    private String ward;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    @Schema(description = "Địa chỉ chi tiết", example = "Số 12 Ngõ 80 Cầu Giấy, Hà Nội")
    private String addressDetail;

    @NotNull(message = "Số tầng không được để trống")
    @Min(value = 1, message = "Số tầng phải từ 1 trở lên")
    @Schema(description = "Số tầng", example = "5")
    private Integer numFloors;

    @Schema(description = "Quy định chung của tòa nhà", example = "Không làm ồn sau 23h, để xe đúng vị trí")
    private String generalRules;

    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.doan.core.common.util.StringListDeserializer.class)
    @Schema(description = "Tiện ích chung tòa nhà", example = "[\"Thang máy\", \"Khóa vân tay\", \"Camera 24/7\"]")
    private java.util.List<String> commonAmenities;

    @Schema(description = "Danh sách ID các dịch vụ tiện ích của tòa nhà", example = "[1, 2, 3]")
    private java.util.List<Long> serviceIds;

    @Schema(description = "Vĩ độ (Latitude)", example = "21.033333")
    private BigDecimal latitude;

    @Schema(description = "Kinh độ (Longitude)", example = "105.800000")
    private BigDecimal longitude;
}
