package com.doan.core.business.dto.tenant;

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
    private String type;
    private String urgency;
    private String status;
    private String responseNote;
    private Integer rating;
    private String feedback;
    private String images;
    private LocalDateTime createdAt;
    private Instant resolvedAt;
}
