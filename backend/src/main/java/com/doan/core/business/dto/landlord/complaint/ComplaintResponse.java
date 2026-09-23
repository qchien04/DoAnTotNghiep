package com.doan.core.business.dto.landlord.complaint;

import com.doan.core.business.entity.Complaint;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết khiếu nại báo hỏng thiết bị")
public class ComplaintResponse {

    private Long id;
    private String complaintCode;
    private Long roomId;
    private String roomCode;
    private String buildingName;
    private Long tenantId;
    private String tenantName;
    private String tenantPhone;
    private String title;
    private String content;
    private String incidentType;
    private String severity;
    private String images;
    private String status;
    private String resolutionNote;
    private Instant resolvedAt;
    private LocalDateTime createdAt;

    public static ComplaintResponse fromEntity(Complaint complaint) {
        if (complaint == null) return null;

        String rCode = complaint.getRoom() != null ? complaint.getRoom().getRoomCode() : null;
        String bName = (complaint.getRoom() != null && complaint.getRoom().getBuilding() != null)
                ? complaint.getRoom().getBuilding().getName() : null;

        String tName = complaint.getTenant() != null ? complaint.getTenant().getFullName() : null;
        String tPhone = complaint.getTenant() != null ? complaint.getTenant().getPhone() : null;

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .complaintCode(complaint.getComplaintCode())
                .roomId(complaint.getRoom() != null ? complaint.getRoom().getId() : null)
                .roomCode(rCode)
                .buildingName(bName)
                .tenantId(complaint.getTenant() != null ? complaint.getTenant().getId() : null)
                .tenantName(tName)
                .tenantPhone(tPhone)
                .title(complaint.getTitle())
                .content(complaint.getContent())
                .incidentType(complaint.getIncidentType())
                .severity(complaint.getSeverity())
                .images(complaint.getImages())
                .status(complaint.getStatus())
                .resolutionNote(complaint.getResolutionNote())
                .resolvedAt(complaint.getResolvedAt())
                .createdAt(complaint.getCreatedAt())
                .build();
    }
}
