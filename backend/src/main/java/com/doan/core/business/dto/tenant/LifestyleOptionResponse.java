package com.doan.core.business.dto.tenant;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LifestyleOptionResponse {
    private Long id;
    private Long questionId;
    private String label;
    private BigDecimal value;
    private Integer sortOrder;
}
