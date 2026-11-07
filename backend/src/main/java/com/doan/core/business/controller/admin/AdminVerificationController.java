package com.doan.core.business.controller.admin;

import com.doan.core.business.dto.kyc.KycFileResource;
import com.doan.core.business.dto.landlord.verification.LandlordVerificationOverviewStats;
import com.doan.core.business.dto.landlord.verification.LandlordVerificationRejectRequest;
import com.doan.core.business.dto.landlord.verification.LandlordVerificationResponse;
import com.doan.core.business.entity.LandlordVerificationStatus;
import com.doan.core.business.service.LandlordVerificationService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/verifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "16. Quản trị viên - Phê duyệt Xác minh Chủ trọ", description = "Quản lý và duyệt hồ sơ giấy tờ nhà đất, hợp đồng ủy quyền của chủ trọ")
public class AdminVerificationController {

    private final LandlordVerificationService verificationService;

    @GetMapping
    @Operation(summary = "Lấy danh sách các yêu cầu xác minh chủ trọ có phân trang và bộ lọc")
    public ResponseEntity<ResponseData<PageResponse<LandlordVerificationResponse>>> getVerifications(
            @Parameter(description = "Trạng thái hồ sơ (PENDING, VERIFIED, REJECTED)")
            @RequestParam(value = "status", required = false) LandlordVerificationStatus status,
            @Parameter(description = "Từ khóa tìm kiếm (Tên, SĐT, Email, Địa chỉ, Số hiệu)")
            @RequestParam(value = "search", required = false) String search,
            @Parameter(description = "Số trang (bắt đầu từ 0)")
            @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang")
            @RequestParam(value = "size", defaultValue = "10") int size) {

        PageResponse<LandlordVerificationResponse> response = verificationService.getAdminVerifications(status, search, page, size);
        return ResponseEntity.ok(ResponseData.success(response));
    }

    @GetMapping("/overview")
    @Operation(summary = "Lấy số liệu thống kê tổng quan các hồ sơ xác minh")
    public ResponseEntity<ResponseData<LandlordVerificationOverviewStats>> getOverviewStats() {
        LandlordVerificationOverviewStats stats = verificationService.getOverviewStats();
        return ResponseEntity.ok(ResponseData.success(stats));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết một hồ sơ xác minh chủ trọ kèm danh sách tệp đính kèm")
    public ResponseEntity<ResponseData<LandlordVerificationResponse>> getVerificationDetail(
            @PathVariable Long id) {
        LandlordVerificationResponse response = verificationService.getAdminVerificationDetail(id);
        return ResponseEntity.ok(ResponseData.success(response));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Phê duyệt hồ sơ xác minh chủ trọ",
            description = "Gắn huy hiệu Chủ trọ xác minh và mở khóa toàn quyền đăng tin phòng trọ cho chủ nhà.")
    public ResponseEntity<ResponseData<LandlordVerificationResponse>> approveVerification(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        LandlordVerificationResponse response = verificationService.approveVerification(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Đã phê duyệt hồ sơ và gắn huy hiệu Chủ trọ xác minh thành công!", response));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Từ chối hồ sơ xác minh chủ trọ kèm lý do",
            description = "Gửi lý do phản hồi cho chủ trọ để nộp lại tài liệu hợp lệ.")
    public ResponseEntity<ResponseData<LandlordVerificationResponse>> rejectVerification(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody LandlordVerificationRejectRequest request) {

        LandlordVerificationResponse response = verificationService.rejectVerification(principal.getId(), id, request.getReason());
        return ResponseEntity.ok(ResponseData.success("Đã từ chối hồ sơ xác minh thành công!", response));
    }

    @GetMapping("/document/{fileKey}")
    @Operation(summary = "Xem trực tiếp ảnh tài liệu xác minh (Dành cho Quản trị viên)",
            description = "Truy xuất tệp tin hình ảnh từ vùng lưu trữ riêng tư với toàn quyền Admin.")
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
}

