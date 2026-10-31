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

    @NotBlank(message = "Tên tòa nhà không được để trống")
    @Schema(description = "Tên tòa nhà", example = "Tòa nhà Ánh Dương")
    private String name;

    @NotNull(message = "Tỉnh / Thành phố không được để trống")
    @Schema(description = "Mã Tỉnh / Thành phố", example = "1")
    private Integer provinceId;

    @NotNull(message = "Phường / Xã không được để trống")
    @Schema(description = "Mã Phường / Xã", example = "101")
    private Integer wardId;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    @Schema(description = "Địa chỉ chi tiết", example = "Số 12 Ngõ 80 Cầu Giấy, Hà Nội")
    private String addressDetail;

    @NotNull(message = "Số tầng không được để trống")
    @Min(value = 1, message = "Số tầng phải từ 1 trở lên")
    @Schema(description = "Số tầng", example = "5")
    private Integer numFloors;

    @Schema(description = "Quy định chung của tòa nhà", example = "Không làm ồn sau 23h, để xe đúng vị trí")
    private String generalRules;

    @Schema(description = "Vĩ độ vị trí tòa nhà (Latitude)", example = "21.033333")
    private BigDecimal latitude;

    @Schema(description = "Kinh độ vị trí tòa nhà (Longitude)", example = "105.783333")
    private BigDecimal longitude;
}
