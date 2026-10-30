package com.doan.core.business.dto.tenant;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveLifestyleAnswersRequest {

    private List<AnswerItem> answers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerItem {
        private Long questionId;
        private Long optionId;
        private List<Long> optionIds;
    }
}
