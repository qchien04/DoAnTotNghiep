package com.doan.core.business.dto.tenant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoommatePostRequest {

    @NotBlank(message = "Tiêu đề bài đăng không được để trống!")
    private String title;

    private String description;

    @NotBlank(message = "Loại hình đăng bài không được để trống!")
    private String postType; // HAS_ROOM, SEARCHING_ROOM

    private Long roomId; // ID phòng liên kết nếu chọn Lựa chọn A

    private String roomAddress;
    private String district;
    private String city;

    @NotNull(message = "Chi phí chia sẻ mỗi người không được để trống!")
    private BigDecimal sharePrice;

    private BigDecimal totalRoomPrice;

    private Integer neededRoommates;

    // Vị trí bản đồ (UC13)
    private Double latitude;
    private Double longitude;
    private Double radiusKm;

    // Tiêu chí lối sống
    private String genderPreference;
    private String sleepTime;
    private Boolean isNoSmoking;
    private Boolean isPetFriendly;
    private String cookingFrequency;
    private String cleanlinessLevel;
    private String guestAllowed;
}
