package com.doan.core.business.service;

import com.doan.core.business.dto.tenant.RoommateApplicationRequest;
import com.doan.core.business.dto.tenant.RoommateApplicationResponse;
import com.doan.core.business.dto.tenant.RoommatePostRequest;
import com.doan.core.business.dto.tenant.RoommatePostResponse;
import com.doan.core.business.dto.tenant.SaveLifestyleAnswersRequest;
import com.doan.core.business.dto.tenant.UserLifestyleProfileResponse;
import com.doan.core.business.enums.GenderPreference;
import com.doan.core.business.enums.RoommatePostStatus;
import com.doan.core.business.enums.RoommatePostType;
import com.doan.core.common.data.PageResponse;

import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface TenantRoommateService {

    // Master data câu hỏi & lựa chọn lối sống
    List<com.doan.core.business.dto.tenant.LifestyleQuestionResponse> getLifestyleQuestions();

    // Hồ sơ lối sống gốc của người dùng
    UserLifestyleProfileResponse getUserLifestyleProfile(Long userId);

    // Lưu / Cập nhật hồ sơ lối sống gốc (và tự động sinh users.lifestyle_vector)
    UserLifestyleProfileResponse saveUserLifestyleProfile(Long userId,
            SaveLifestyleAnswersRequest request);

    // UC 11: Tìm kiếm bài đăng ở ghép kèm bộ lọc lối sống và tính độ khớp theo
    // vector
    PageResponse<RoommatePostResponse> searchPosts(
            Long currentUserId,
            String keyword,
            String district,
            RoommatePostType postType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            GenderPreference gender,
            Boolean noSmoking,
            String sleepTime,
            Pageable pageable);

    // Chi tiết bài đăng
    RoommatePostResponse getPostById(Long id);

    RoommatePostResponse getPostById(Long id, Long currentUserId);

    // Danh sách bài đăng của bản thân
    PageResponse<RoommatePostResponse> getMyPosts(Long userId, String keyword, RoommatePostStatus status,
            RoommatePostType postType, int page,
            int size, String sortBy, String sortDirection);

    // UC 12: Đăng bài tìm bạn ở ghép - Đã có phòng
    RoommatePostResponse createPostWithRoom(Long userId, RoommatePostRequest request);

    // UC 13: Đăng bài tìm bạn ở ghép - Chưa có phòng
    RoommatePostResponse createPostWithoutRoom(Long userId, RoommatePostRequest request);

    // Đóng bài đăng
    void closePost(Long userId, Long postId);

    // UC 15: Chốt nhóm khi đã đủ người (2/2)
    void lockGroup(Long userId, Long postId);

    // UC 14: Gửi đơn ứng tuyển ở ghép & tính Matching Score
    RoommateApplicationResponse applyToGroup(Long userId, RoommateApplicationRequest request);

    // UC 15: Lấy danh sách ứng viên chờ duyệt của bài đăng
    List<RoommateApplicationResponse> getPostApplications(Long userId, Long postId);

    // UC 15: Duyệt ứng viên vào nhóm
    void approveApplication(Long userId, Long applicationId);

    // UC 15: Từ chối ứng viên
    void rejectApplication(Long userId, Long applicationId, String reason);
}
