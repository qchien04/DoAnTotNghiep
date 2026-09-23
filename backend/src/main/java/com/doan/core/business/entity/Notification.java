package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entity Thông báo hệ thống
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String notificationType; // INVOICE, CONTRACT, COMPLAINT, ROOMMATE, SYSTEM

    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
