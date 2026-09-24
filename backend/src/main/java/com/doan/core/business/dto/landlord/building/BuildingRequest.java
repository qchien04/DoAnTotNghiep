package com.doan.core.business.dto.landlord.building;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
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

    @Deprecated
    private List<String> commonAmenities;

    @Deprecated
    private List<Long> serviceIds;

    @Deprecated
    private BigDecimal latitude;

    @Deprecated
    private BigDecimal longitude;
}
