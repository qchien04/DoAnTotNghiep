package com.doan.core.business.dto.kyc;

import com.doan.core.business.entity.KycDocumentType;
import com.doan.core.business.entity.KycStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết một tài liệu KYC xác thực danh tính")
public class KycDocumentResponse {

    @Schema(description = "ID bản ghi", example = "1")
    private Long id;

    @Schema(description = "ID người dùng sở hữu", example = "5")
    private Long userId;

    @Schema(description = "Loại tài liệu", example = "ID_CARD_FRONT")
    private KycDocumentType documentType;

    @Schema(description = "Mã khóa bảo mật truy xuất file", example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    private String fileKey;

    @Schema(description = "Tên tệp gốc khi tải lên", example = "cccd_mat_truoc.jpg")
    private String originalFilename;

    @Schema(description = "Dung lượng tệp (bytes)", example = "2048576")
    private Long fileSize;

    @Schema(description = "Loại nội dung MIME", example = "image/jpeg")
    private String contentType;

    @Schema(description = "Số CCCD đính kèm (nếu có)", example = "001200009999")
    private String idCardNumber;

    @Schema(description = "Trạng thái xác thực", example = "PENDING")
    private KycStatus status;

    @Schema(description = "Lý do từ chối nếu có")
    private String rejectionReason;

    @Schema(description = "Đường dẫn bảo mật để xem ảnh (Cần Access Token)", example = "/api/v1/secure/kyc/view/d290f1ee-6c54-4b01-90e6-d701748f0851")
    private String viewUrl;

    @Schema(description = "Đường dẫn bảo mật để tải ảnh về (Cần Access Token)", example = "/api/v1/secure/kyc/download/d290f1ee-6c54-4b01-90e6-d701748f0851")
    private String downloadUrl;

    @Schema(description = "Thời gian tải lên")
    private LocalDateTime createdAt;
}
