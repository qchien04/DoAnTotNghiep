package com.doan.core.business.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu đặt lại mật khẩu bằng mã OTP")
public class ResetPasswordRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Định dạng email không hợp lệ")
    @Schema(description = "Địa chỉ email của tài khoản", example = "tenant@stayhub.vn")
    private String email;

    @NotBlank(message = "Mã xác thực OTP không được để trống")
    @Size(min = 6, max = 6, message = "Mã OTP gồm đúng 6 chữ số")
    @Schema(description = "Mã OTP 6 số nhận được qua email", example = "123456")
    private String otpCode;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu mới phải có tối thiểu 6 ký tự")
    @Schema(description = "Mật khẩu mới", example = "newpass123")
    private String newPassword;

    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    @Schema(description = "Xác nhận mật khẩu mới", example = "newpass123")
    private String confirmPassword;
}
