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
@Schema(description = "Kết quả xác thực danh tính tổng hợp (AI DeepFace + Quét QR CCCD)")
public class KycAiVerificationResponse {

    @Schema(description = "Xác thực danh tính tổng thể thành công (Khuôn mặt khớp và QR hợp lệ)", example = "true")
    private Boolean overallVerified;

    @Schema(description = "Phân tầng quyết định (AUTO_APPROVED, CONDITIONAL_LIVENESS, RETAKE_OR_MANUAL_REVIEW)", example = "AUTO_APPROVED")
    private String decisionTier;

    @Schema(description = "Khoảng cách vector đặc trưng khuôn mặt (ArcFace Cosine Distance)", example = "0.28")
    private Double distance;

    @Schema(description = "Ngưỡng chấp nhận chuẩn của ArcFace", example = "0.68")
    private Double threshold;

    @Schema(description = "Thông tin trích xuất tự động từ mã QR CCCD")
    private QrCccdInfo qrInfo;

    @Schema(description = "Kết quả so khớp khuôn mặt DeepFace với ảnh thẻ")
    private FaceVerificationInfo faceInfo;

    @Schema(description = "Bộ hồ sơ tài liệu xác thực đã được lưu trữ an toàn")
    private KycBundleResponse documents;

    @Schema(description = "Thông báo kết quả xác thực", example = "Xác thực danh tính tự động thành công!")
    private String message;
}
