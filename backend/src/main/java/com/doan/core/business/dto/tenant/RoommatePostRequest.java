package com.doan.core.business.dto.tenant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

import com.doan.core.business.enums.GenderPreference;
import com.doan.core.business.enums.RoommatePostType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoommatePostRequest {

    @NotBlank(message = "Tiêu đề bài đăng không được để trống!")
    private String title;

    private String description;

    private RoommatePostType postType; // HAS_ROOM, SEARCHING_ROOM (tự động suy ra từ endpoint nếu null)

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

    // Tiêu chí lọc cứng (Dealbreakers)
    private GenderPreference genderPreference;
    private Boolean isNoSmoking;
    private Boolean isPetFriendly;

    private java.util.List<SaveLifestyleAnswersRequest.AnswerItem> lifestyleAnswers;
}
