package com.doan.core.business.dto.landlord.verification;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu từ chối hồ sơ xác minh chủ trọ kèm lý do")
public class LandlordVerificationRejectRequest {

    @NotBlank(message = "Vui lòng nhập lý do từ chối hồ sơ xác minh")
    @Schema(description = "Lý do từ chối để phản hồi cho chủ trọ biết và nộp lại", example = "Ảnh chụp giấy tờ bị mờ số hiệu và thiếu dấu giáp lai công chứng.")
    private String reason;
}

