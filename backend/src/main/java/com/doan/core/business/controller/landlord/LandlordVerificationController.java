package com.doan.core.business.controller.landlord;

import com.doan.core.business.dto.kyc.KycFileResource;
import com.doan.core.business.dto.landlord.verification.LandlordVerificationResponse;
import com.doan.core.business.entity.LandlordVerificationType;
import com.doan.core.business.service.LandlordVerificationService;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/landlord/verification")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Xác minh Chủ trọ (Giấy tờ nhà/đất & Ủy quyền)", description = "APIs nộp hồ sơ xác minh, xem trạng thái và tải ảnh tài liệu an toàn")
public class LandlordVerificationController {

    private final LandlordVerificationService verificationService;

    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Nộp hồ sơ xác minh quyền chủ trọ (Sổ đỏ / Sổ hồng hoặc Hợp đồng ủy quyền)",
            description = "Tải lên các ảnh giấy tờ nhà đất hoặc hợp đồng ủy quyền để ban quản trị duyệt cấp huy hiệu Chủ trọ xác minh.")
    public ResponseEntity<ResponseData<LandlordVerificationResponse>> submitVerification(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Loại tài liệu xác minh (OWNERSHIP_CERTIFICATE hoặc AUTHORIZATION_CONTRACT)", required = true)
            @RequestParam("verificationType") LandlordVerificationType verificationType,
            @Parameter(description = "Địa chỉ bất động sản / nhà trọ")
            @RequestParam(value = "propertyAddress", required = false) String propertyAddress,
            @Parameter(description = "Số hiệu giấy tờ / Số hợp đồng")
            @RequestParam(value = "documentNumber", required = false) String documentNumber,
            @Parameter(description = "Ghi chú bổ sung")
            @RequestParam(value = "notes", required = false) String notes,
            @Parameter(description = "Danh sách tệp tin hình ảnh giấy tờ (ít nhất 1 ảnh)", required = true)
            @RequestPart("files") List<MultipartFile> files) {

        LandlordVerificationResponse response = verificationService.submitVerification(
                principal.getId(), verificationType, propertyAddress, documentNumber, notes, files
        );
        return ResponseEntity.ok(ResponseData.success("Nộp hồ sơ xác minh thành công! Vui lòng chờ quản trị viên xét duyệt.", response));
    }

    @GetMapping("/status")
    @Operation(summary = "Xem trạng thái và hồ sơ xác minh mới nhất của chủ trọ",
            description = "Trả về trạng thái hiện tại (UNVERIFIED, PENDING, VERIFIED, REJECTED) kèm danh sách ảnh đã gửi.")
    public ResponseEntity<ResponseData<LandlordVerificationResponse>> getStatus(
            @AuthenticationPrincipal UserPrincipal principal) {
        LandlordVerificationResponse response = verificationService.getVerificationStatus(principal.getId());
        return ResponseEntity.ok(ResponseData.success(response));
    }

    @GetMapping("/document/{fileKey}")
    @Operation(summary = "Xem trực tiếp ảnh tài liệu xác minh",
            description = "Truy xuất tệp tin hình ảnh từ vùng lưu trữ riêng tư. Cho phép chủ sở hữu tài liệu hoặc Admin xem.")
    public ResponseEntity<Resource> viewDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String fileKey) {

        KycFileResource fileResource = verificationService.loadDocumentForView(
                principal.getId(), principal.getRole(), fileKey
        );

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(fileResource.getContentType());
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"preview\"")
                .header(HttpHeaders.CACHE_CONTROL, "private, no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .header("X-Content-Type-Options", "nosniff")
                .body(fileResource.getResource());
    }

    @GetMapping("/download/{fileKey}")
    @Operation(summary = "Tải xuống tệp tin tài liệu xác minh an toàn")
    public ResponseEntity<Resource> downloadDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String fileKey) {

        KycFileResource fileResource = verificationService.loadDocumentForDownload(
                principal.getId(), principal.getRole(), fileKey
        );

        String encodedFilename = URLEncoder.encode(fileResource.getOriginalFilename(), StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFilename + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "private, no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .header("X-Content-Type-Options", "nosniff")
                .body(fileResource.getResource());
    }
}

