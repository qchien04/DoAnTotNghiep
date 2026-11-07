package com.doan.core.business.service.impl;

import com.doan.core.business.dto.room.RoomAuditLogResponse;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.RoomAuditLog;
import com.doan.core.business.entity.User;
import com.doan.core.business.repository.RoomAuditLogRepository;
import com.doan.core.business.service.RoomAuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomAuditLogServiceImpl implements RoomAuditLogService {

    private final RoomAuditLogRepository roomAuditLogRepository;

    @Override
    @Transactional
    public void logAction(Room room,
                          User actor,
                          String action,
                          String oldStatus,
                          String newStatus,
                          String oldModerationStatus,
                          String newModerationStatus,
                          Integer riskScore,
                          String reason,
                          String changedSummary,
                          String snapshotJson) {

        if (room == null || actor == null) {
            log.warn("Không thể ghi log audit do room hoặc actor null");
            return;
        }

        RoomAuditLog auditLog = RoomAuditLog.builder()
                .room(room)
                .actor(actor)
                .action(action)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .oldModerationStatus(oldModerationStatus)
                .newModerationStatus(newModerationStatus)
                .riskScore(riskScore != null ? riskScore : 0)
                .reason(reason)
                .changedSummary(changedSummary)
                .snapshotJson(snapshotJson)
                .createdAt(LocalDateTime.now())
                .build();

        roomAuditLogRepository.save(auditLog);
        log.info("Đã ghi nhận Audit Log cho phòng ID [{}]: Hành động={}, Actor={}",
                room.getId(), action, actor.getFullName());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomAuditLogResponse> getRoomAuditLogs(Long roomId) {
        log.info("Lấy danh sách lịch sử chỉnh sửa & kiểm duyệt cho phòng ID: {}", roomId);
        List<RoomAuditLog> logs = roomAuditLogRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
        return logs.stream()
                .map(RoomAuditLogResponse::fromEntity)
                .collect(Collectors.toList());
    }
}

