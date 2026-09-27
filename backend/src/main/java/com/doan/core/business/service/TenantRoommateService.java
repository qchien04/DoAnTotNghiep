package com.doan.core.business.service;

import com.doan.core.business.dto.tenant.RoommateApplicationRequest;
import com.doan.core.business.dto.tenant.RoommateApplicationResponse;
import com.doan.core.business.dto.tenant.RoommatePostRequest;
import com.doan.core.business.dto.tenant.RoommatePostResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface TenantRoommateService {

    // UC 11: Tìm kiếm bài đăng ở ghép kèm bộ lọc lối sống
    Page<RoommatePostResponse> searchPosts(
            String keyword,
            String district,
            String postType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String gender,
            Boolean noSmoking,
            String sleepTime,
            Pageable pageable);

    // Chi tiết bài đăng
    RoommatePostResponse getPostById(Long id);

    // Danh sách bài đăng của bản thân
    List<RoommatePostResponse> getMyPosts(Long userId);

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
