package com.doan.core.business.dto.tenant;

import lombok.*;

import java.time.LocalDateTime;

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

    private String gender;
    private String sleepTime;
    private Boolean isSmoking;
    private Boolean isPet;
    private String cookingHabit;
    private String guestHabit;

    private Integer compatibilityScore; // Điểm tương thích %
    private String status; // PENDING, APPROVED, REJECTED
    private String rejectReason;
    private LocalDateTime createdAt;
}
