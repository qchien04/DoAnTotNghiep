package com.doan.core.business.dto.publicdto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu tìm kiếm phòng trọ công khai đa chiều")
public class PublicRoomSearchRequest {

    @Schema(description = "Từ khóa tìm kiếm (tên phòng, địa chỉ, tòa nhà)")
    private String keyword;

    @Schema(description = "Mã Tỉnh / Thành phố")
    private Integer provinceId;

    @Schema(description = "Mã Phường / Xã")
    private Integer wardId;

    @Schema(description = "Mã bitmask các tiện ích yêu cầu")
    private Integer amenitiesMask;

    @Schema(description = "Giá thuê tối thiểu (VNĐ)")
    private Long minPrice;

    @Schema(description = "Giá thuê tối đa (VNĐ)")
    private Long maxPrice;

    @Schema(description = "Diện tích tối thiểu (m2)")
    private BigDecimal minArea;

    @Schema(description = "Diện tích tối đa (m2)")
    private BigDecimal maxArea;

    @Schema(description = "Danh sách ID tiện ích yêu cầu")
    @Builder.Default
    private List<Long> amenityIds = new ArrayList<>();

    @Schema(description = "Danh sách các vùng tròn khoanh trên bản đồ")
    @Builder.Default
    private List<CircleZoneDto> zones = new ArrayList<>();

    @Schema(description = "Số trang (bắt đầu từ 0)", defaultValue = "0")
    @Builder.Default
    private int page = 0;

    @Schema(description = "Số lượng bản ghi mỗi trang", defaultValue = "12")
    @Builder.Default
    private int size = 12;

    @Schema(description = "Trường sắp xếp (id, listedPrice, area, createdAt)", defaultValue = "id")
    @Builder.Default
    private String sortBy = "id";

    @Schema(description = "Chiều sắp xếp (asc, desc)", defaultValue = "desc")
    @Builder.Default
    private String sortDirection = "desc";
}
