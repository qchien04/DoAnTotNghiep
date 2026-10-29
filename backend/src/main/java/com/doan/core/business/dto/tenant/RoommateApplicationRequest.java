package com.doan.core.business.dto.tenant;

import com.doan.core.business.enums.Gender;
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

    // Tiêu chí đối chiếu lọc cứng (Dealbreakers)
    private Gender gender;
    private Boolean isSmoking;
    private Boolean isPet;

    // Danh sách câu trả lời tinh chỉnh từ hồ sơ
    private java.util.List<SaveLifestyleAnswersRequest.AnswerItem> lifestyleAnswers;
    private Boolean isCustomized;
}
