package com.doan.core.business.service;

import com.doan.core.business.dto.room.RoomAuditLogResponse;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.User;

import java.util.List;

public interface RoomAuditLogService {

    /**
     * Ghi lại một bản ghi nhật ký kiểm duyệt / chỉnh sửa tin đăng phòng trọ
     */
    void logAction(Room room,
                   User actor,
                   String action,
                   String oldStatus,
                   String newStatus,
                   String oldModerationStatus,
                   String newModerationStatus,
                   Integer riskScore,
                   String reason,
                   String changedSummary,
                   String snapshotJson);

    /**
     * Lấy toàn bộ lịch sử chỉnh sửa và kiểm duyệt của một phòng trọ
     */
    List<RoomAuditLogResponse> getRoomAuditLogs(Long roomId);
}

