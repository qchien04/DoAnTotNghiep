package com.doan.core.business.dto.tenant;

import com.doan.core.business.enums.ComplaintIncidentType;
import com.doan.core.business.enums.ComplaintSeverity;
import com.doan.core.business.enums.ComplaintStatus;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantComplaintResponse {

    private Long id;
    private String title;
    private String content;
    private ComplaintIncidentType type;
    private ComplaintSeverity urgency;
    private ComplaintStatus status;
    private String responseNote;
    private Integer rating;
    private String feedback;
    private String images;
    private LocalDateTime createdAt;
    private Instant resolvedAt;
}
