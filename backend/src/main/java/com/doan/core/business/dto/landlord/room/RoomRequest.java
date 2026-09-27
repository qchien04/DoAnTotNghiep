package com.doan.core.business.dto.landlord.room;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Schema(description = "Yêu cầu tạo mới hoặc cập nhật phòng trọ")
public class RoomRequest {

    @Schema(description = "ID tòa nhà chứa phòng (nếu có, để trống nếu là nhà/phòng trọ độc lập)", example = "1")
    private Long buildingId;

    @Schema(description = "Tỉnh / Thành phố", example = "Thành phố Hà Nội")
    private String province;

    @Schema(description = "Phường / Xã", example = "Phường Bách Khoa")
    private String ward;

    @Schema(description = "Địa chỉ chi tiết (số nhà, ngõ/đường)", example = "Số 15 ngõ 20 Đại Cồ Việt")
    private String addressDetail;

    @NotBlank(message = "Tên phòng không được để trống")
    @Schema(description = "Tên phòng (ví dụ Phòng 101, Phòng 302...)", example = "Phòng 301")
    private String name;

    @NotNull(message = "Tầng không được để trống")
    @Min(value = 1, message = "Số tầng phải lớn hơn hoặc bằng 1")
    @Schema(description = "Tầng", example = "3")
    private Integer floor;

    @NotNull(message = "Diện tích không được để trống")
    @DecimalMin(value = "1.0", message = "Diện tích phải lớn hơn 0")
    @Schema(description = "Diện tích tính bằng m2", example = "32.0")
    private BigDecimal area;

    @NotNull(message = "Giá niêm yết không được để trống")
    @Min(value = 1, message = "Giá niêm yết phải lớn hơn 0")
    @Schema(description = "Giá thuê niêm yết (VNĐ/tháng)", example = "4500000")
    private Long listedPrice;

    @NotNull(message = "Tiền cọc tiêu chuẩn không được để trống")
    @Min(value = 0, message = "Tiền cọc không được là số âm")
    @Schema(description = "Tiền cọc tiêu chuẩn (VNĐ)", example = "4500000")
    private Long standardDeposit;

    @NotNull(message = "Sức chứa tối đa không được để trống")
    @Min(value = 1, message = "Sức chứa tối đa phải từ 1 người trở lên")
    @Schema(description = "Sức chứa tối đa (người)", example = "3")
    private Integer maxCapacity;

    @Schema(description = "Mức độ nội thất (EMPTY, BASIC, FULL)", example = "FULL")
    private String furnishingLevel;

    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.doan.core.common.util.StringListDeserializer.class)
    @Schema(description = "Danh sách tiện nghi phòng (Điều hòa, Nóng lạnh, Giường, Ban công...)", example = "[\"Điều hòa\", \"Nóng lạnh\"]")
    private List<String> amenities;

    @Schema(description = "Danh sách ID các dịch vụ áp dụng cho phòng (Điện, nước, internet, gửi xe...)", example = "[1, 2, 3]")
    private List<Long> serviceIds;

    @Schema(description = "Mô tả chi tiết phòng trọ", example = "Phòng thoáng mát có cửa sổ lớn đón ánh sáng tự nhiên")
    private String description;

    @Schema(description = "Trạng thái phòng (AVAILABLE, OCCUPIED, UNDER_MAINTENANCE, STOPPED)", example = "AVAILABLE")
    private String status;

    @Schema(description = "Danh sách đường dẫn ảnh phòng")
    private List<String> imageUrls;

    @Schema(description = "Vĩ độ vị trí địa lý (Latitude)", example = "21.033333")
    private BigDecimal latitude;

    @Schema(description = "Kinh độ vị trí địa lý (Longitude)", example = "105.800000")
    private BigDecimal longitude;

    @Schema(description = "Trạng thái công khai phòng lên trang chủ tìm kiếm", example = "true")
    private Boolean isPublic;
}
