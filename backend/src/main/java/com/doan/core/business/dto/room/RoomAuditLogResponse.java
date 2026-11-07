package com.doan.core.business.dto.room;

import com.doan.core.business.entity.RoomAuditLog;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Bản ghi nhật ký kiểm duyệt và lịch sử chỉnh sửa phòng trọ")
public class RoomAuditLogResponse {

    private Long id;
    private Long roomId;
    private String roomName;
    private Long actorId;
    private String actorName;
    private String actorRole;
    private String action;
    private String oldStatus;
    private String newStatus;
    private String oldModerationStatus;
    private String newModerationStatus;
    private Integer riskScore;
    private String reason;
    private String changedSummary;
    private LocalDateTime createdAt;

    public static RoomAuditLogResponse fromEntity(RoomAuditLog log) {
        if (log == null) return null;
        return RoomAuditLogResponse.builder()
                .id(log.getId())
                .roomId(log.getRoom() != null ? log.getRoom().getId() : null)
                .roomName(log.getRoom() != null ? log.getRoom().getName() : null)
                .actorId(log.getActor() != null ? log.getActor().getId() : null)
                .actorName(log.getActor() != null ? log.getActor().getFullName() : null)
                .actorRole(log.getActor() != null && log.getActor().getRole() != null ? log.getActor().getRole().name() : null)
                .action(log.getAction())
                .oldStatus(log.getOldStatus())
                .newStatus(log.getNewStatus())
                .oldModerationStatus(log.getOldModerationStatus())
                .newModerationStatus(log.getNewModerationStatus())
                .riskScore(log.getRiskScore())
                .reason(log.getReason())
                .changedSummary(log.getChangedSummary())
                .createdAt(log.getCreatedAt())
                .build();
    }
}

