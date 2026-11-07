package com.doan.core.business.controller;

import com.doan.core.business.dto.kyc.KycAiVerificationResponse;
import com.doan.core.business.dto.kyc.KycBundleResponse;

import com.doan.core.business.dto.kyc.KycDocumentResponse;
import com.doan.core.business.dto.kyc.KycFileResource;
import com.doan.core.business.entity.KycDocumentType;
import com.doan.core.business.service.KycService;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
@RequestMapping("/api/v1/secure/kyc")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Xác thực danh tính & KYC (CCCD + Selfie)", description = "APIs upload ảnh CCCD + Selfie lưu vùng riêng biệt không public, kèm cơ chế xem/tải an toàn kiểm soát quyền")
public class KycController {

    private final KycService kycService;

    @PostMapping(value = "/upload-bundle", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload trọn bộ hồ sơ xác thực danh tính (CCCD mặt trước, mặt sau + Ảnh selfie)",
            description = "Tải lên đồng thời ảnh CCCD mặt trước, mặt sau và ảnh chân dung selfie. Tệp được lưu vào vùng riêng biệt không public.")
    @ApiResponse(responseCode = "200", description = "Tải lên trọn bộ hồ sơ thành công")
    public ResponseEntity<ResponseData<KycBundleResponse>> uploadBundle(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Ảnh mặt trước CCCD", required = true)
            @RequestPart("frontCard") MultipartFile frontCard,
            @Parameter(description = "Ảnh mặt sau CCCD", required = true)
            @RequestPart("backCard") MultipartFile backCard,
            @Parameter(description = "Ảnh chụp selfie khuôn mặt", required = true)
            @RequestPart("selfie") MultipartFile selfie,
            @Parameter(description = "Số CMND/CCCD (tùy chọn)")
            @RequestParam(value = "idCardNumber", required = false) String idCardNumber) {

        KycBundleResponse response = kycService.uploadBundle(
                principal.getId(), frontCard, backCard, selfie, idCardNumber
        );
        return ResponseEntity.ok(ResponseData.success("Tải lên hồ sơ CCCD và ảnh selfie thành công!", response));
    }

    @PostMapping(value = "/verify-ai", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Xác thực danh tính tự động bằng AI (Quét QR CCCD + Nhận diện khuôn mặt ArcFace + RetinaFace)",
            description = "Tải lên ảnh mặt trước CCCD kèm video/selfie khuôn mặt và điểm liveness người thật. Hệ thống đối soát bằng mô hình ArcFace + RetinaFace phân tầng 3 cấp.")
    @ApiResponse(responseCode = "200", description = "Xác thực KYC AI thành công")
    public ResponseEntity<ResponseData<KycAiVerificationResponse>> verifyAi(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Ảnh mặt trước CCCD (chứa QR và chân dung)", required = true)
            @RequestPart("frontCard") MultipartFile frontCard,
            @Parameter(description = "Ảnh mặt sau CCCD (tùy chọn)")
            @RequestPart(value = "backCard", required = false) MultipartFile backCard,
            @Parameter(description = "Video quay khuôn mặt hoặc ảnh selfie trực tiếp", required = true)
            @RequestPart("faceFile") MultipartFile faceFile,
            @Parameter(description = "Điểm kiểm tra liveness người thật phía client (0 - 100)")
            @RequestParam(value = "livenessScore", required = false) Double livenessScore) {

        KycAiVerificationResponse response = kycService.verifyWithAi(
                principal.getId(), frontCard, backCard, faceFile, livenessScore
        );
        return ResponseEntity.ok(ResponseData.success("Xử lý xác thực danh tính AI hoàn tất!", response));
    }

    @PostMapping(value = "/scan-qr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Quét và trích xuất dữ liệu từ mã QR trên mặt trước thẻ CCCD",
            description = "Trích xuất thông tin định danh (Số CCCD, họ tên, ngày sinh, quê quán...) từ mã QR trên thẻ CCCD gắn chip để người dùng xem trước khi so khớp khuôn mặt.")
    @ApiResponse(responseCode = "200", description = "Quét mã QR CCCD thành công")
    public ResponseEntity<ResponseData<com.doan.core.business.dto.kyc.QrCccdInfo>> scanQr(
            @Parameter(description = "Ảnh mặt trước CCCD có mã QR", required = true)
            @RequestPart("frontCard") MultipartFile frontCard) {

        com.doan.core.business.dto.kyc.QrCccdInfo response = kycService.scanCccdQr(frontCard);
        return ResponseEntity.ok(ResponseData.success("Đã trích xuất thông tin từ mã QR CCCD!", response));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)

    @Operation(summary = "Upload từng ảnh xác thực danh tính riêng lẻ (Mặt trước CCCD / Mặt sau CCCD / Selfie)",
            description = "Tải lên một tài liệu xác thực danh tính chỉ định loại tài liệu (ID_CARD_FRONT, ID_CARD_BACK, SELFIE).")
    @ApiResponse(responseCode = "200", description = "Tải lên tài liệu thành công")
    public ResponseEntity<ResponseData<KycDocumentResponse>> uploadSingle(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Tệp hình ảnh tải lên", required = true)
            @RequestPart("file") MultipartFile file,
            @Parameter(description = "Loại tài liệu xác thực (ID_CARD_FRONT, ID_CARD_BACK, SELFIE)", required = true)
            @RequestParam("documentType") KycDocumentType documentType,
            @Parameter(description = "Số CMND/CCCD (tùy chọn)")
            @RequestParam(value = "idCardNumber", required = false) String idCardNumber) {

        KycDocumentResponse response = kycService.uploadSingle(
                principal.getId(), file, documentType, idCardNumber
        );
        return ResponseEntity.ok(ResponseData.success("Tải lên tài liệu xác thực thành công!", response));
    }

    @GetMapping("/my-documents")
    @Operation(summary = "Lấy danh sách tài liệu xác thực danh tính của bản thân",
            description = "Trả về danh sách các ảnh CCCD và selfie hiện có của người dùng đang đăng nhập.")
    public ResponseEntity<ResponseData<List<KycDocumentResponse>>> getMyDocuments(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<KycDocumentResponse> documents = kycService.getMyDocuments(principal.getId());
        return ResponseEntity.ok(ResponseData.success(documents));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Xem danh sách tài liệu xác thực của một người dùng theo ID (Dành cho Admin hoặc Chủ trọ)",
            description = "Chủ trọ chỉ xem được khách thuê thuộc phòng/hợp đồng của mình, Admin có toàn quyền xem.")
    public ResponseEntity<ResponseData<List<KycDocumentResponse>>> getUserDocuments(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId) {
        List<KycDocumentResponse> documents = kycService.getUserDocuments(
                principal.getId(), principal.getRole(), userId
        );
        return ResponseEntity.ok(ResponseData.success(documents));
    }

    @GetMapping("/view/{fileKey}")
    @Operation(summary = "Xem trực tiếp ảnh xác thực danh tính an toàn",
            description = "Truy xuất tệp tin hình ảnh từ vùng lưu trữ riêng tư. Yêu cầu token hợp lệ và kiểm tra quyền sở hữu/quản lý.")
    public ResponseEntity<Resource> viewFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String fileKey) {

        KycFileResource fileResource = kycService.loadKycFileForView(
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
    @Operation(summary = "Tải xuống tệp tin xác thực danh tính an toàn",
            description = "Tải về tệp tin đính kèm từ vùng lưu trữ bảo mật.")
    public ResponseEntity<Resource> downloadFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String fileKey) {

        KycFileResource fileResource = kycService.loadKycFileForDownload(
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

    @DeleteMapping("/{documentType}")
    @Operation(summary = "Xóa một tài liệu xác thực danh tính của người dùng",
            description = "Xóa tệp tin vật lý và bản ghi tài liệu thuộc loại chỉ định.")
    public ResponseEntity<ResponseData<Void>> deleteDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable KycDocumentType documentType) {
        kycService.deleteDocument(principal.getId(), documentType);
        return ResponseEntity.ok(ResponseData.success("Đã xóa tài liệu xác thực thành công!", null));
    }
}
