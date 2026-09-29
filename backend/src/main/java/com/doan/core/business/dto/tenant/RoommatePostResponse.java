package com.doan.core.business.dto.tenant;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoommatePostResponse {

    private Long id;
    private String title;
    private String description;
    private String postType;

    private Long authorId;
    private String authorName;
    private String authorAvatar;

    private Long roomId;
    private String roomName;
    private String areaName;
    private String district;
    private String city;

    private BigDecimal sharePrice;
    private BigDecimal totalRoomPrice;
    private Integer neededRoommates;
    private Integer currentRoommates;

    private Double latitude;
    private Double longitude;
    private Double radiusKm;

    private String genderPreference;
    private String sleepTime;
    private Boolean isNoSmoking;
    private Boolean isPetFriendly;
    private String cookingFrequency;
    private String cleanlinessLevel;
    private String guestAllowed;

    private String lifestyleVector;
    private java.util.List<UserLifestyleAnswerDto> lifestyleAnswers;

    private Integer matchPercentage;
    private String status;
    private List<String> roomImages;
    private LocalDateTime createdAt;
}
