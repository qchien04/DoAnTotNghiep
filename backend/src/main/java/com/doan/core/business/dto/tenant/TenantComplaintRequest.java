package com.doan.core.business.dto.tenant;

import com.doan.core.business.enums.ComplaintIncidentType;
import com.doan.core.business.enums.ComplaintSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantComplaintRequest {

    @NotNull(message = "Loại sự cố không được để trống!")
    private ComplaintIncidentType type; // ELECTRICITY, WATER, AIR_CONDITIONER, SECURITY, OTHER

    @NotBlank(message = "Tiêu đề không được để trống!")
    private String title;

    @NotBlank(message = "Mô tả chi tiết không được để trống!")
    private String content;

    private ComplaintSeverity urgency; // LOW, MEDIUM, HIGH, URGENT

    private String images;

    @com.fasterxml.jackson.annotation.JsonSetter("images")
    public void setImagesFromJson(Object imagesObj) {
        if (imagesObj == null) {
            this.images = null;
        } else if (imagesObj instanceof java.util.List<?> list) {
            this.images = list.stream().map(Object::toString).collect(java.util.stream.Collectors.joining(","));
        } else {
            this.images = imagesObj.toString();
        }
    }
}
