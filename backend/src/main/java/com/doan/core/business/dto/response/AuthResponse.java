package com.doan.core.business.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Kết quả xác thực người dùng thành công")
public class AuthResponse {

    @Schema(description = "Access Token dạng JWT", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String accessToken;

    @Schema(description = "Refresh Token dùng để làm mới Access Token khi hết hạn", example = "c8dfb208-8dfa-45c6-9430-c3d52d92bb3b")
    private String refreshToken;

    @Schema(description = "Loại Token", example = "Bearer")
    @Builder.Default
    private String tokenType = "Bearer";

    @Schema(description = "Thời gian hết hạn của Access Token tính bằng mili-giây", example = "86400000")
    private Long expiresIn;

    @Schema(description = "Thông tin người dùng đăng nhập")
    private UserDto user;
}
