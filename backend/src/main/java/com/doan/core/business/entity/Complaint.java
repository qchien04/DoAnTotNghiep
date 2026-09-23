package com.doan.core.business.entity;

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

    @Column(name = "complaint_code", length = 30, unique = true)
    private String complaintCode;

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

    @Column(name = "incident_type", nullable = false, length = 50)
    private String incidentType; // ELECTRICITY, WATER, AIR_CONDITIONER, SECURITY, OTHER

    @Column(name = "severity", nullable = false, length = 20)
    @Builder.Default
    private String severity = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    @Column(name = "images", columnDefinition = "TEXT")
    private String images;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, PROCESSING, RESOLVED, REJECTED

    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
