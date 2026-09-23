package com.doan.core.business.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu cấp lại Access Token qua Refresh Token")
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh Token không được để trống")
    @Schema(description = "Refresh Token hợp lệ của phiên đăng nhập", example = "c8dfb208-8dfa-45c6-9430-c3d52d92bb3b")
    private String refreshToken;
}
