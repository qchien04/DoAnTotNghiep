package com.doan.core.business.dto.room;

import com.doan.core.business.enums.RoomStatus;
import com.doan.core.common.util.ContentRiskDetector;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Kết quả đánh giá điểm rủi ro và phân luồng kiểm duyệt tin đăng phòng trọ")
public class RoomRiskEvaluationResult {

    @Schema(description = "Tổng điểm rủi ro tính theo hệ thống rule-based (0 - 100)", example = "25")
    private int totalRiskScore;

    @Schema(description = "Hành động phân luồng kiểm duyệt (AUTO_APPROVED, PENDING_ADMIN_REVIEW, REJECTED, LOCKED_STOLEN_IMAGES)", example = "AUTO_APPROVED")
    private String moderationAction;

    @Schema(description = "Trạng thái hiển thị phòng trọ (AVAILABLE, PENDING_APPROVAL, STOPPED)", example = "AVAILABLE")
    private RoomStatus roomStatus;

    @Schema(description = "Cho phép phòng hiển thị công khai trên sàn hay không", example = "true")
    private boolean isPublic;

    @Schema(description = "Thông điệp lý do phân luồng hoặc từ chối tin đăng")
    private String moderationReason;

    @Schema(description = "Phát hiện ảnh sao chép từ chủ trọ khác hay không")
    private boolean hasStolenImages;

    @Schema(description = "Thông tin phòng trọ bị sao chép ảnh (nếu có)")
    private String stolenFromRoomInfo;

    @Builder.Default
    @Schema(description = "Danh sách các luật rủi ro bị kích hoạt")
    private List<RuleViolationDetail> triggeredRules = new ArrayList<>();

    @Schema(description = "Chi tiết phân tích rủi ro trong nội dung bài đăng")
    private ContentRiskDetector.DetectionResult contentDetection;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RuleViolationDetail {
        private String ruleCode;
        private String ruleName;
        private int penaltyPoints;
        private String description;
    }
}

