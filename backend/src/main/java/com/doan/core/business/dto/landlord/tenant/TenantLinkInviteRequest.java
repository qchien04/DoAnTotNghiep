package com.doan.core.business.dto.landlord.tenant;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu mời liên kết tài khoản hệ thống cho khách thuê")
public class TenantLinkInviteRequest {

    @NotBlank(message = "Từ khóa tìm kiếm tài khoản (SĐT hoặc Email) không được để trống")
    @Schema(description = "Số điện thoại hoặc Email của tài khoản người dùng cần liên kết", example = "0905111222")
    private String searchKeyword;
}
