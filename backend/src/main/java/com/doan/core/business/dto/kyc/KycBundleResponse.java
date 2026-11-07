package com.doan.core.business.dto.kyc;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Kết quả tải lên trọn bộ hồ sơ xác thực danh tính (CCCD 2 mặt + Selfie)")
public class KycBundleResponse {

    @Schema(description = "Tài liệu CCCD mặt trước")
    private KycDocumentResponse frontCard;

    @Schema(description = "Tài liệu CCCD mặt sau")
    private KycDocumentResponse backCard;

    @Schema(description = "Tài liệu ảnh chụp selfie khuôn mặt")
    private KycDocumentResponse selfie;

    @Schema(description = "Số CCCD", example = "001200009999")
    private String idCardNumber;
}
