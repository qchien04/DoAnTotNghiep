package com.doan.core.business.dto.landlord.verification;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Số liệu thống kê tổng quan các yêu cầu xác minh chủ trọ")
public class LandlordVerificationOverviewStats {

    private long total;
    private long pending;
    private long verified;
    private long rejected;
}

