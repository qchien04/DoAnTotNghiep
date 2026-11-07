package com.doan.core.business.dto.kyc;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin trích xuất từ mã QR trên thẻ CCCD gắn chip")
public class QrCccdInfo {

    @Schema(description = "Có tìm thấy mã QR hợp lệ hay không", example = "true")
    private Boolean qrFound;

    @Schema(description = "Số CCCD (12 chữ số)", example = "001202012345")
    private String idCardNumber;

    @Schema(description = "Số CMND 9 số cũ (nếu có)", example = "123456789")
    private String oldCmndNumber;

    @Schema(description = "Họ và tên người sở hữu thẻ", example = "NGUYỄN VĂN A")
    private String fullName;

    @Schema(description = "Ngày sinh (định dạng YYYY-MM-DD)", example = "2000-08-15")
    private String dateOfBirth;

    @Schema(description = "Giới tính (Nam / Nữ)", example = "Nam")
    private String gender;

    @Schema(description = "Địa chỉ thường trú", example = "Số 123 Đường Cầu Giấy, Hà Nội")
    private String address;

    @Schema(description = "Ngày cấp thẻ (định dạng YYYY-MM-DD)", example = "2021-05-10")
    private String issueDate;

    @Schema(description = "Nội dung text gốc từ mã QR")
    private String rawText;

    @Schema(description = "Thông điệp phản hồi từ bộ quét QR", example = "Quét mã QR thành công")
    private String message;
}
