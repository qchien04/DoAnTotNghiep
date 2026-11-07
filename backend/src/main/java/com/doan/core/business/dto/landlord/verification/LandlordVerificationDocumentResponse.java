package com.doan.core.business.dto.landlord.verification;

import com.doan.core.business.entity.LandlordVerificationDocument;
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
@Schema(description = "Thông tin tệp tin giấy tờ xác minh quyền chủ trọ")
public class LandlordVerificationDocumentResponse {

    private Long id;
    private String fileKey;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String viewUrl;
    private String downloadUrl;
    private LocalDateTime createdAt;

    public static LandlordVerificationDocumentResponse fromEntity(LandlordVerificationDocument doc, String baseUrl) {
        if (doc == null) return null;
        return LandlordVerificationDocumentResponse.builder()
                .id(doc.getId())
                .fileKey(doc.getFileKey())
                .originalFilename(doc.getOriginalFilename())
                .contentType(doc.getContentType())
                .fileSize(doc.getFileSize())
                .viewUrl(baseUrl + "/document/" + doc.getFileKey())
                .downloadUrl(baseUrl + "/download/" + doc.getFileKey())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}

