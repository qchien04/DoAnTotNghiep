package com.doan.core.business.dto.room;

import com.doan.core.business.dto.landlord.room.RoomResponse;
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
@Schema(description = "Thông tin chi tiết phục vụ kiểm duyệt phòng trọ: Nội dung, Điểm rủi ro từng dấu hiệu và Lịch sử chỉnh sửa")
public class RoomModerationDetailResponse {

    @Schema(description = "Thông tin chi tiết phòng trọ")
    private RoomResponse room;

    @Schema(description = "Kết quả phân tích điểm rủi ro chi tiết từng dấu hiệu vi phạm")
    private RoomRiskEvaluationResult riskEvaluation;

    @Builder.Default
    @Schema(description = "Toàn bộ lịch sử chỉnh sửa và nhật ký kiểm duyệt của phòng trọ")
    private List<RoomAuditLogResponse> auditLogs = new ArrayList<>();
}

