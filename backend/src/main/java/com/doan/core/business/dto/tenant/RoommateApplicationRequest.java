package com.doan.core.business.dto.tenant;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoommateApplicationRequest {

    @NotNull(message = "ID bài đăng không được để trống!")
    private Long postId;

    private String introMessage;

    // Khảo sát lối sống của ứng viên (UC14)
    private String gender;
    private String sleepTime;
    private Boolean isSmoking;
    private Boolean isPet;
    private String cookingHabit;
    private String guestHabit;

    // Danh sách câu trả lời tinh chỉnh từ hồ sơ
    private java.util.List<SaveLifestyleAnswersRequest.AnswerItem> lifestyleAnswers;
    private Boolean isCustomized;
}
