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
@Schema(description = "Kết quả so khớp khuôn mặt bằng mô hình AI DeepFace")
public class FaceVerificationInfo {

    @Schema(description = "Khuôn mặt có trùng khớp với ảnh trong CCCD không", example = "true")
    private Boolean verified;

    @Schema(description = "Điểm tương đồng chuẩn hóa theo thang % (0% - 100%)", example = "88.5")
    private Double similarityScore;

    @Schema(description = "Khoảng cách vector đặc trưng khuôn mặt (Cosine Distance)", example = "0.28")
    private Double distance;

    @Schema(description = "Ngưỡng quyết định chấp nhận của mô hình", example = "0.68")
    private Double threshold;

    @Schema(description = "Mô hình nhận diện khuôn mặt sử dụng", example = "ArcFace")
    private String modelName;

    @Schema(description = "Bộ phát hiện khuôn mặt sử dụng", example = "retinaface")
    private String detector;

    @Schema(description = "Phân tầng quyết định 3 cấp: AUTO_APPROVED, CONDITIONAL_LIVENESS, RETAKE_OR_MANUAL_REVIEW", example = "AUTO_APPROVED")
    private String decisionTier;

    @Schema(description = "Mô tả chi tiết phân tầng quyết định", example = "Khoảng cách vector đạt mức tuyệt đối (<0.40). Hệ thống tự động duyệt ngay lập tức.")
    private String tierDescription;

    @Schema(description = "Điểm kiểm tra liveness người thật (0 - 100)", example = "95.0")
    private Double livenessScore;

    @Schema(description = "Số chiều của vector đặc trưng khuôn mặt", example = "512")
    private Integer embeddingDim;

    @Schema(description = "Vector embedding đặc trưng khuôn mặt 512 chiều trích xuất bởi ArcFace")
    private String faceEmbedding;

    @Schema(description = "Thông điệp giải thích từ hệ thống nhận diện", example = "Khuôn mặt trùng khớp với ảnh CCCD!")
    private String message;
}
