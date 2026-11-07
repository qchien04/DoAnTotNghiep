package com.doan.core.business.dto.kyc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoredFileInfo {
    private String fileKey;
    private String originalFilename;
    private String storedFilename;
    private String storagePath;
    private String contentType;
    private Long fileSize;
}
