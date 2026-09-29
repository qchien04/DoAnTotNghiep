package com.doan.core.business.controller.tenant;

import com.doan.core.business.dto.tenant.*;
import com.doan.core.business.service.TenantRoommateService;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tenant")
@RequiredArgsConstructor
@Tag(name = "11. Người thuê - Tìm kiếm & Ghép phòng (UC 11 - 15)", description = "Tìm kiếm phòng, đăng bài ở ghép, nộp đơn ứng tuyển, duyệt thành viên nhóm")
public class TenantRoommateController {

    private final TenantRoommateService roommateService;

    @GetMapping("/lifestyle/questions")
    @Operation(summary = "Lấy danh mục câu hỏi và lựa chọn khảo sát lối sống", description = "Dùng để render bảng khảo sát lối sống ở Frontend")
    public ResponseEntity<ResponseData<List<LifestyleQuestionResponse>>> getLifestyleQuestions() {
        List<LifestyleQuestionResponse> list = roommateService.getLifestyleQuestions();
        return ResponseEntity.ok(ResponseData.success(list));
    }

    @GetMapping("/lifestyle/profile")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy hồ sơ lối sống gốc của người dùng", description = "Lấy các câu trả lời gốc và vector lối sống của tài khoản hiện tại")
    public ResponseEntity<ResponseData<UserLifestyleProfileResponse>> getUserLifestyleProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        UserLifestyleProfileResponse response = roommateService.getUserLifestyleProfile(principal.getId());
        return ResponseEntity.ok(ResponseData.success(response));
    }

    @PutMapping("/lifestyle/profile")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lưu / Cập nhật hồ sơ lối sống gốc", description = "Cập nhật câu trả lời gốc và tự động tái tính toán users.lifestyle_vector")
    public ResponseEntity<ResponseData<UserLifestyleProfileResponse>> saveUserLifestyleProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody SaveLifestyleAnswersRequest request) {
        UserLifestyleProfileResponse response = roommateService.saveUserLifestyleProfile(principal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Cập nhật hồ sơ lối sống thành công!", response));
    }

    @GetMapping("/posts/search")
    @Operation(summary = "UC 11: Tìm kiếm phòng trọ & bài đăng ở ghép", description = "Tìm kiếm theo từ khóa khu vực, khoảng giá và các tiêu chí lối sống sinh hoạt (tính độ khớp dựa trên vector)")
    public ResponseEntity<ResponseData<Page<RoommatePostResponse>>> searchPosts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String postType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Boolean noSmoking,
            @RequestParam(required = false) String sleepTime,
            @PageableDefault(size = 10) Pageable pageable) {

        Long currentUserId = principal != null ? principal.getId() : null;
        Page<RoommatePostResponse> result = roommateService.searchPosts(
                currentUserId, keyword, district, postType, minPrice, maxPrice, gender, noSmoking, sleepTime, pageable);
        return ResponseEntity.ok(ResponseData.success(result));
    }

    @GetMapping("/posts/{id}")
    @Operation(summary = "Xem chi tiết bài đăng ở ghép", description = "Lấy toàn bộ thông tin bài đăng, album ảnh và bảng khảo sát lối sống")
    public ResponseEntity<ResponseData<RoommatePostResponse>> getPostById(@PathVariable Long id) {
        RoommatePostResponse response = roommateService.getPostById(id);
        return ResponseEntity.ok(ResponseData.success(response));
    }

    @GetMapping("/posts/my-posts")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "UC 15: Xem danh sách bài đăng ở ghép của tôi", description = "Xem các bài đăng của bản thân và tiến độ thành viên trong nhóm")
    public ResponseEntity<ResponseData<List<RoommatePostResponse>>> getMyPosts(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<RoommatePostResponse> list = roommateService.getMyPosts(principal.getId());
        return ResponseEntity.ok(ResponseData.success(list));
    }

    @PostMapping({"/posts/existing-room", "/posts/has-room"})
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "UC 12: Đăng bài tìm người ở ghép - Có phòng trọ", description = "Chọn phòng liên kết trên hệ thống hoặc tạo phòng ảo đại diện")
    public ResponseEntity<ResponseData<RoommatePostResponse>> createPostWithRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RoommatePostRequest request) {
        RoommatePostResponse response = roommateService.createPostWithRoom(principal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Đăng bài tìm bạn ở ghép thành công!", response));
    }

    @PostMapping({"/posts/virtual-room", "/posts/searching-room"})
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "UC 13: Đăng bài tìm người ở ghép - Chưa có phòng trọ", description = "Ghim vị trí điểm mốc trên bản đồ số và chọn bán kính tìm kiếm km")
    public ResponseEntity<ResponseData<RoommatePostResponse>> createPostWithoutRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RoommatePostRequest request) {
        RoommatePostResponse response = roommateService.createPostWithoutRoom(principal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Đăng bài tìm nhóm thành công!", response));
    }

    @RequestMapping(value = {"/posts/{id}/close"}, method = {RequestMethod.PUT, RequestMethod.POST})
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đóng bài đăng tìm bạn", description = "Chuyển bài đăng sang trạng thái đã đóng")
    public ResponseEntity<ResponseData<Void>> closePost(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        roommateService.closePost(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Đã đóng bài đăng thành công!", null));
    }

    @RequestMapping(value = {"/posts/{id}/lock", "/posts/{id}/complete"}, method = {RequestMethod.PUT, RequestMethod.POST})
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "UC 15: Chốt nhóm khi đã đủ người (2/2)", description = "Chuyển bài đăng sang Hoàn thành và đóng nhận đơn mới")
    public ResponseEntity<ResponseData<Void>> lockGroup(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        roommateService.lockGroup(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Chốt nhóm thành công!", null));
    }

    @PostMapping("/applications")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "UC 14: Xin gia nhập nhóm ở ghép", description = "Gửi đơn ứng tuyển kèm bảng trả lời khảo sát lối sống để tính Matching Score")
    public ResponseEntity<ResponseData<RoommateApplicationResponse>> applyToGroup(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RoommateApplicationRequest request) {
        RoommateApplicationResponse response = roommateService.applyToGroup(principal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Đã gửi đơn xin gia nhập nhóm thành công!", response));
    }

    @GetMapping("/posts/{id}/applications")
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "UC 15: Xem danh sách ứng viên chờ duyệt", description = "Chủ phòng xem danh sách các đơn ứng tuyển và điểm tương thích lối sống")
    public ResponseEntity<ResponseData<List<RoommateApplicationResponse>>> getPostApplications(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        List<RoommateApplicationResponse> list = roommateService.getPostApplications(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success(list));
    }

    @RequestMapping(value = {"/applications/{id}/approve"}, method = {RequestMethod.PUT, RequestMethod.POST})
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "UC 15: Duyệt ứng viên vào nhóm", description = "Chấp thuận ứng viên phù hợp tiêu chí lối sống vào nhóm chính thức")
    public ResponseEntity<ResponseData<Void>> approveApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        roommateService.approveApplication(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Đã chấp thuận thành viên vào nhóm thành công!", null));
    }

    @RequestMapping(value = {"/applications/{id}/reject"}, method = {RequestMethod.PUT, RequestMethod.POST})
    @SecurityRequirement(name = "BearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "UC 15: Từ chối ứng viên", description = "Từ chối đơn ứng tuyển kèm lý do lịch sự")
    public ResponseEntity<ResponseData<Void>> rejectApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "Tiêu chí sinh hoạt chưa phù hợp") String reason) {
        roommateService.rejectApplication(principal.getId(), id, reason);
        return ResponseEntity.ok(ResponseData.success("Đã từ chối đơn ứng tuyển!", null));
    }
}
