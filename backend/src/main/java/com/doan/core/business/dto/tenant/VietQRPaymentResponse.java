package com.doan.core.business.dto.tenant;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VietQRPaymentResponse {

    private String billNumber;
    private BigDecimal amount;
    private String accountNumber;
    private String accountHolder;
    private String bankName;
    private String bankCode;
    private String qrCodeUrl;
    private String transferContent; // HD202610 P102
}
