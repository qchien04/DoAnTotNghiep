package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity lưu vết lịch sử chỉnh sửa và nhật ký kiểm duyệt phòng trọ (Room Audit Log)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "room_audit_logs")
public class RoomAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @Column(name = "action", nullable = false, length = 50)
    private String action; // CREATED, UPDATED, MODERATION_APPROVED, MODERATION_REJECTED, MODERATION_UNLOCKED

    @Column(name = "old_status", length = 50)
    private String oldStatus;

    @Column(name = "new_status", length = 50)
    private String newStatus;

    @Column(name = "old_moderation_status", length = 50)
    private String oldModerationStatus;

    @Column(name = "new_moderation_status", length = 50)
    private String newModerationStatus;

    @Column(name = "risk_score")
    @Builder.Default
    private Integer riskScore = 0;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "changed_summary", columnDefinition = "TEXT")
    private String changedSummary;

    @Column(name = "snapshot_json", columnDefinition = "TEXT")
    private String snapshotJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

