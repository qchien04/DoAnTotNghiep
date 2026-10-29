package com.doan.core.business.entity;

import com.doan.core.business.enums.ComplaintIncidentType;
import com.doan.core.business.enums.ComplaintSeverity;
import com.doan.core.business.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entity Khiếu nại / Báo hỏng thiết bị phòng trọ
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "complaints")
public class Complaint extends BaseEntity {


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "incident_type", nullable = false, length = 50)
    @Builder.Default
    private ComplaintIncidentType incidentType = ComplaintIncidentType.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    @Builder.Default
    private ComplaintSeverity severity = ComplaintSeverity.MEDIUM;

    @Column(name = "images", columnDefinition = "TEXT")
    private String images;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.PENDING; // PENDING, PROCESSING, RESOLVED, REJECTED

    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;
}
