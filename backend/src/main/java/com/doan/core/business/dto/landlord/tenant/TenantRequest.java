package com.doan.core.business.dto.landlord.tenant;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Yêu cầu thêm mới hoặc cập nhật hồ sơ khách thuê")
public class TenantRequest {

    @NotNull(message = "Phòng ở không được để trống")
    @Schema(description = "ID phòng thuê", example = "1")
    private Long roomId;

    @NotBlank(message = "Họ và tên khách thuê không được để trống")
    @Schema(description = "Họ và tên", example = "Lê Văn Cường")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Schema(description = "Số điện thoại liên hệ", example = "0905111222")
    private String phone;

    @NotBlank(message = "Số CCCD/CMND không được để trống")
    @Schema(description = "Số CMND/CCCD", example = "001200009999")
    private String idCardNumber;

    @Schema(description = "Giới tính (Nam, Nữ, Khác)", example = "Nam")
    private String gender;

    @Schema(description = "Ngày sinh")
    private LocalDate dateOfBirth;

    @Schema(description = "Quê quán", example = "Hải Phòng")
    private String hometown;

    @Schema(description = "Đường dẫn ảnh chụp mặt trước CCCD")
    private String idCardPhotoFront;

    @Schema(description = "Đường dẫn ảnh chụp mặt sau CCCD")
    private String idCardPhotoBack;

    @Schema(description = "Đánh dấu là đại diện hợp đồng thuê", example = "false")
    private Boolean isRepresentative;
}
