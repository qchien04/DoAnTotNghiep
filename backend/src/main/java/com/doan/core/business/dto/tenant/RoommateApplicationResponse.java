package com.doan.core.business.dto.tenant;

import com.doan.core.business.enums.Gender;
import com.doan.core.business.enums.RoommateApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoommateApplicationResponse {

    private Long id;
    private Long postId;
    private String postTitle;

    private Long applicantId;
    private String applicantName;
    private String applicantPhone;
    private String applicantAvatar;

    private String introMessage;

    private Gender gender;
    private Boolean isSmoking;
    private Boolean isPet;

    private Integer compatibilityScore; // Điểm tương thích %
    private String lifestyleVector;
    private Boolean isCustomized;
    private List<UserLifestyleAnswerDto> lifestyleAnswers;
    private RoommateApplicationStatus status; // PENDING, APPROVED, REJECTED
    private String rejectReason;
    private LocalDateTime createdAt;
}
