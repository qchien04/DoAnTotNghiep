package com.doan.core.business.dto.tenant;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LifestyleQuestionResponse {
    private Long id;
    private String code;
    private String label;
    private String category;
    private String qType;
    private Boolean isHard;
    private BigDecimal weight;
    private Integer sortOrder;
    private List<LifestyleOptionResponse> options;
}
