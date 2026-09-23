package com.doan.core.business.dto.request;

import com.doan.core.business.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu đăng ký tài khoản")
public class RegisterRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    @Schema(description = "Tên đăng nhập", example = "landlord01")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải chứa ít nhất 6 ký tự")
    @Schema(description = "Mật khẩu", example = "123456")
    private String password;

    @NotBlank(message = "Họ và tên không được để trống")
    @Schema(description = "Họ và tên đầy đủ", example = "Nguyễn Văn Chủ Nhà")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Định dạng email không hợp lệ")
    @Schema(description = "Địa chỉ email", example = "landlord01@gmail.com")
    private String email;

    @Schema(description = "Số điện thoại liên hệ", example = "0987654321")
    private String phone;

    @Schema(description = "Vai trò tài khoản (ROLE_LANDLORD hoặc ROLE_TENANT, mặc định là ROLE_TENANT)", example = "ROLE_LANDLORD")
    private Role role;
}
