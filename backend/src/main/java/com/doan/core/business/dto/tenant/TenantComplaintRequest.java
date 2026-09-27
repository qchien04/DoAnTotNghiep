package com.doan.core.business.dto.tenant;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantComplaintRequest {

    @NotBlank(message = "Loại sự cố không được để trống!")
    private String type; // COOLING, PLUMBING, ELECTRICITY, SECURITY, BILL, OTHER

    @NotBlank(message = "Tiêu đề không được để trống!")
    private String title;

    @NotBlank(message = "Mô tả chi tiết không được để trống!")
    private String content;

    private String urgency; // LOW, MEDIUM, HIGH, URGENT

    private String images;
}
