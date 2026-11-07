package com.doan.core.business.dto.kyc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.core.io.Resource;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycFileResource {
    private Resource resource;
    private String contentType;
    private String originalFilename;
    private Long contentLength;
}
