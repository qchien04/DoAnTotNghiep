package com.doan.core.business.dto.tenant;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLifestyleProfileResponse {
    private Long userId;
    private String fullName;
    private String lifestyleVector;
    private List<UserLifestyleAnswerDto> answers;
}
