package com.doan.core.business.dto.amenity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAmenityRequest {

    @NotBlank(message = "Tên tiện ích không được để trống")
    @Size(max = 100, message = "Tên tiện ích tối đa 100 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả tiện ích tối đa 500 ký tự")
    private String description;
}
