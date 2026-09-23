package com.doan.core.business.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu đăng nhập hệ thống")
public class LoginRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Schema(description = "Tên đăng nhập", example = "admin")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Schema(description = "Mật khẩu", example = "admin123")
    private String password;
}
