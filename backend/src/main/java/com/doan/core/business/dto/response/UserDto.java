package com.doan.core.business.dto.response;

import com.doan.core.business.entity.Role;
import com.doan.core.business.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết người dùng")
public class UserDto {

    @Schema(description = "ID người dùng", example = "1")
    private Long id;

    @Schema(description = "Mã người dùng", example = "USR001")
    private String userCode;

    @Schema(description = "Tên đăng nhập", example = "landlord")
    private String username;

    @Schema(description = "Họ và tên", example = "Nguyễn Văn Chủ Nhà")
    private String fullName;

    @Schema(description = "Địa chỉ email", example = "landlord@gmail.com")
    private String email;

    @Schema(description = "Số điện thoại", example = "0988888888")
    private String phone;

    @Schema(description = "Đường dẫn ảnh đại diện")
    private String avatarUrl;

    @Schema(description = "Ngày sinh")
    private LocalDate dateOfBirth;

    @Schema(description = "Giới tính", example = "Nam")
    private String gender;

    @Schema(description = "Giới thiệu bản thân")
    private String bio;

    @Schema(description = "Vai trò người dùng")
    private Role role;

    @Schema(description = "Trạng thái người dùng", example = "ACTIVE")
    private String status;

    @Schema(description = "Trạng thái kích hoạt", example = "true")
    private Boolean enabled;

    @Schema(description = "Thời điểm tạo tài khoản")
    private LocalDateTime createdAt;

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .userCode(user.getUserCode())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .bio(user.getBio())
                .role(user.getRole())
                .status(user.getStatus())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
