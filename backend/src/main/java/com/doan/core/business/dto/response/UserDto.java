package com.doan.core.business.dto.response;

import com.doan.core.business.enums.Gender;
import com.doan.core.business.enums.GenderPreference;
import com.doan.core.business.entity.Role;
import com.doan.core.business.entity.User;
import com.doan.core.business.enums.UserStatus;

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

    @Schema(description = "Giới tính", example = "MALE")
    private Gender gender;

    @Schema(description = "Tiêu chí giới tính mong muốn", example = "ANY")
    private GenderPreference genderPreference;

    @Schema(description = "Có hút thuốc lá không", example = "false")
    private Boolean smokes;

    @Schema(description = "Có từ chối người hút thuốc không", example = "false")
    private Boolean rejectsSmokers;

    @Schema(description = "Có nuôi thú cưng không", example = "false")
    private Boolean hasPet;

    @Schema(description = "Có từ chối thú cưng không", example = "false")
    private Boolean rejectsPets;

    @Schema(description = "Giới thiệu bản thân")
    private String bio;

    @Schema(description = "Vai trò người dùng")
    private Role role;

    @Schema(description = "Trạng thái người dùng", example = "ACTIVE")
    private UserStatus status;

    @Schema(description = "Trạng thái kích hoạt", example = "true")
    private Boolean enabled;

    @Schema(description = "Vector sinh hoạt của người dùng", example = "0.000,0.500,0.000,0.000,1.000,1.000,0.500,0.500")
    private String lifestyleVector;

    @Schema(description = "Thời điểm tạo tài khoản")
    private LocalDateTime createdAt;

    public static UserDto fromEntity(User user) {
        if (user == null)
            return null;
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .genderPreference(user.getGenderPreference())
                .smokes(user.getSmokes())
                .rejectsSmokers(user.getRejectsSmokers())
                .hasPet(user.getHasPet())
                .rejectsPets(user.getRejectsPets())
                .bio(user.getBio())
                .lifestyleVector(user.getLifestyleVector())
                .role(user.getRole())
                .status(user.getStatus())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
