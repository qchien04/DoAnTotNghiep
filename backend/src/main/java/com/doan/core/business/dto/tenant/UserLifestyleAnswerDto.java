package com.doan.core.business.dto.tenant;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLifestyleAnswerDto {
    private Long questionId;
    private String questionCode;
    private String questionLabel;
    private Long optionId;
    private String optionLabel;
    private BigDecimal optionValue;
    private Boolean fromProfile;
}
