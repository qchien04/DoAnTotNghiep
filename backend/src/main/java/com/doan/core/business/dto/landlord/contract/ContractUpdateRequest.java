package com.doan.core.business.dto.landlord.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Yêu cầu cập nhật hoặc gia hạn hợp đồng thuê phòng")
public class ContractUpdateRequest {

    @Schema(description = "Ngày kết thúc mới (nếu muốn gia hạn thời hạn hợp đồng)", example = "2028-03-31")
    private LocalDate endDate;

    @Min(value = 1, message = "Tiền thuê phải lớn hơn 0")
    @Schema(description = "Giá thuê mới thỏa thuận", example = "4000000")
    private Long rentPrice;

    @Schema(description = "Ngày thanh toán hàng tháng", example = "5")
    private Integer paymentCycleDay;

    @Schema(description = "Điều khoản bổ sung hoặc phụ lục hợp đồng")
    private String termsAndConditions;
}
