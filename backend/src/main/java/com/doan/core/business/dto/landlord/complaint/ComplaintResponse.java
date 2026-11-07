package com.doan.core.business.dto.landlord.complaint;

import com.doan.core.business.entity.Building;
import com.doan.core.business.entity.Complaint;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.Tenant;
import com.doan.core.business.enums.ComplaintIncidentType;
import com.doan.core.business.enums.ComplaintSeverity;
import com.doan.core.business.enums.ComplaintStatus;

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
    private Long roomId;
    private String roomName;
    private String buildingName;
    private Long tenantId;
    private String tenantName;
    private String tenantPhone;
    private String title;
    private String content;
    private ComplaintIncidentType incidentType;
    private ComplaintSeverity severity;
    private String images;
    private ComplaintStatus status;
    private String resolutionNote;
    private Instant resolvedAt;
    private Integer rating;
    private String feedback;
    private LocalDateTime createdAt;

    public static ComplaintResponse fromEntity(Complaint complaint) {
        if (complaint == null)
            return null;

        Room room = complaint.getRoom();
        Building building = room.getBuilding();
        Tenant tenant = complaint.getTenant();

        String rName = room.getName();
        String bName = building != null ? building.getName() : null;

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .roomId(room.getId())
                .roomName(rName)
                .buildingName(bName)
                .tenantId(tenant.getId())
                .tenantName(tenant.getFullName())
                .tenantPhone(tenant.getPhone())
                .title(complaint.getTitle())
                .content(complaint.getContent())
                .incidentType(complaint.getIncidentType())
                .severity(complaint.getSeverity())
                .images(complaint.getImages())
                .status(complaint.getStatus())
                .resolutionNote(complaint.getResolutionNote())
                .resolvedAt(complaint.getResolvedAt())
                .rating(complaint.getRating())
                .feedback(complaint.getFeedback())
                .createdAt(complaint.getCreatedAt())
                .build();
    }
}
