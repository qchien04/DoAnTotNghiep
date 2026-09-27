package com.doan.core.business.service.impl;

import com.doan.core.business.dto.tenant.RoommateApplicationRequest;
import com.doan.core.business.dto.tenant.RoommateApplicationResponse;
import com.doan.core.business.dto.tenant.RoommatePostRequest;
import com.doan.core.business.dto.tenant.RoommatePostResponse;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.RoommateApplication;
import com.doan.core.business.entity.RoommatePost;
import com.doan.core.business.entity.User;
import com.doan.core.business.repository.RoomRepository;
import com.doan.core.business.repository.RoommateApplicationRepository;
import com.doan.core.business.repository.RoommatePostRepository;
import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.service.TenantRoommateService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantRoommateServiceImpl implements TenantRoommateService {

    private final RoommatePostRepository postRepository;
    private final RoommateApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<RoommatePostResponse> searchPosts(
            String keyword,
            String district,
            String postType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String gender,
            Boolean noSmoking,
            String sleepTime,
            Pageable pageable) {

        log.info("Tìm kiếm bài đăng ở ghép: keyword={}, district={}, postType={}, minPrice={}, maxPrice={}",
                keyword, district, postType, minPrice, maxPrice);

        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Khoảng giá không hợp lệ (Giá tối thiểu lớn hơn giá tối đa)");
        }

        Page<RoommatePost> page = postRepository.searchPosts(
                (keyword != null && !keyword.isBlank()) ? keyword.trim() : null,
                (district != null && !district.isBlank()) ? district.trim() : null,
                (postType != null && !postType.isBlank()) ? postType.trim() : null,
                minPrice,
                maxPrice,
                pageable);

        List<RoommatePostResponse> filtered = page.getContent().stream()
                .filter(p -> gender == null || "ANY".equalsIgnoreCase(gender) || gender.equalsIgnoreCase(p.getGenderPreference()))
                .filter(p -> noSmoking == null || !noSmoking || Boolean.TRUE.equals(p.getIsNoSmoking()))
                .filter(p -> sleepTime == null || "ALL".equalsIgnoreCase(sleepTime) || sleepTime.equalsIgnoreCase(p.getSleepTime()))
                .map(this::mapToPostResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(filtered, pageable, page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public RoommatePostResponse getPostById(Long id) {
        RoommatePost post = postRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy bài đăng ở ghép"));
        return mapToPostResponse(post);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoommatePostResponse> getMyPosts(Long userId) {
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToPostResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoommatePostResponse createPostWithRoom(Long userId, RoommatePostRequest request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        if (request.getTotalRoomPrice() != null && request.getSharePrice().compareTo(request.getTotalRoomPrice()) > 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Giá đóng góp mỗi người không được vượt quá tổng tiền thuê phòng gốc!");
        }

        Room room = null;
        if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId()).orElse(null);
        }

        RoommatePost post = RoommatePost.builder()
                .author(author)
                .title(request.getTitle())
                .description(request.getDescription())
                .postType("HAS_ROOM")
                .room(room)
                .areaName(request.getRoomAddress() != null ? request.getRoomAddress() : (room != null && room.getBuilding() != null ? room.getBuilding().getAddressDetail() : null))
                .district(request.getDistrict())
                .city(request.getCity() != null ? request.getCity() : "Hà Nội")
                .sharePrice(request.getSharePrice())
                .totalRoomPrice(request.getTotalRoomPrice() != null ? request.getTotalRoomPrice() : request.getSharePrice().multiply(BigDecimal.valueOf(2)))
                .neededRoommates(request.getNeededRoommates() != null ? request.getNeededRoommates() : 1)
                .currentRoommates(1)
                .genderPreference(request.getGenderPreference() != null ? request.getGenderPreference() : "ANY")
                .sleepTime(request.getSleepTime() != null ? request.getSleepTime() : "BEFORE_24H")
                .isNoSmoking(request.getIsNoSmoking() != null ? request.getIsNoSmoking() : true)
                .isPetFriendly(request.getIsPetFriendly() != null ? request.getIsPetFriendly() : false)
                .cookingFrequency(request.getCookingFrequency() != null ? request.getCookingFrequency() : "DAILY")
                .cleanlinessLevel(request.getCleanlinessLevel() != null ? request.getCleanlinessLevel() : "VERY_CLEAN")
                .guestAllowed(request.getGuestAllowed() != null ? request.getGuestAllowed() : "WEEKENDS_ONLY")
                .status("OPEN")
                .build();

        RoommatePost saved = postRepository.save(post);
        log.info("Tạo bài đăng ở ghép có phòng thành công: id={}", saved.getId());
        return mapToPostResponse(saved);
    }

    @Override
    @Transactional
    public RoommatePostResponse createPostWithoutRoom(Long userId, RoommatePostRequest request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        RoommatePost post = RoommatePost.builder()
                .author(author)
                .title(request.getTitle())
                .description(request.getDescription())
                .postType("SEARCHING_ROOM")
                .areaName(request.getRoomAddress())
                .district(request.getDistrict())
                .city(request.getCity() != null ? request.getCity() : "Hà Nội")
                .sharePrice(request.getSharePrice())
                .neededRoommates(request.getNeededRoommates() != null ? request.getNeededRoommates() : 2)
                .currentRoommates(1)
                .latitude(request.getLatitude() != null ? request.getLatitude() : 21.0056)
                .longitude(request.getLongitude() != null ? request.getLongitude() : 105.8433)
                .radiusKm(request.getRadiusKm() != null ? request.getRadiusKm() : 3.0)
                .genderPreference(request.getGenderPreference() != null ? request.getGenderPreference() : "ANY")
                .sleepTime(request.getSleepTime() != null ? request.getSleepTime() : "BEFORE_23H")
                .isNoSmoking(request.getIsNoSmoking() != null ? request.getIsNoSmoking() : true)
                .isPetFriendly(request.getIsPetFriendly() != null ? request.getIsPetFriendly() : true)
                .cookingFrequency(request.getCookingFrequency() != null ? request.getCookingFrequency() : "SOMETIMES")
                .status("OPEN")
                .build();

        RoommatePost saved = postRepository.save(post);
        log.info("Tạo bài đăng ở ghép chưa có phòng (bán kính) thành công: id={}", saved.getId());
        return mapToPostResponse(saved);
    }

    @Override
    @Transactional
    public void closePost(Long userId, Long postId) {
        RoommatePost post = postRepository.findById(postId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy bài đăng"));
        if (!post.getAuthor().getId().equals(userId)) {
            throw new BaseException(ErrorCode.FORBIDDEN, "Bạn không có quyền đóng bài đăng này");
        }
        post.setStatus("CLOSED");
        postRepository.save(post);
    }

    @Override
    @Transactional
    public void lockGroup(Long userId, Long postId) {
        RoommatePost post = postRepository.findById(postId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy bài đăng"));
        if (!post.getAuthor().getId().equals(userId)) {
            throw new BaseException(ErrorCode.FORBIDDEN, "Bạn không có quyền chốt nhóm của bài đăng này");
        }
        post.setStatus("COMPLETED");
        postRepository.save(post);
        log.info("Chốt nhóm thành công cho bài đăng: id={}", post.getId());
    }

    @Override
    @Transactional
    public RoommateApplicationResponse applyToGroup(Long userId, RoommateApplicationRequest request) {
        User applicant = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        RoommatePost post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy bài đăng"));

        if (post.getAuthor().getId().equals(userId)) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Bạn là chủ bài đăng này, không thể tự ứng tuyển vào nhóm của mình");
        }

        if (applicationRepository.existsByPostIdAndApplicantIdAndStatus(post.getId(), userId, "PENDING")) {
            throw new BaseException(ErrorCode.CONFLICT, "Bạn đã gửi đơn xin gia nhập trước đó, vui lòng chờ chủ phòng phản hồi");
        }

        // Tính điểm tương thích Matching Score theo thuật toán
        int score = calculateMatchingScore(post, request);

        RoommateApplication app = RoommateApplication.builder()
                .post(post)
                .applicant(applicant)
                .introMessage(request.getIntroMessage())
                .gender(request.getGender())
                .sleepTime(request.getSleepTime())
                .isSmoking(request.getIsSmoking() != null ? request.getIsSmoking() : false)
                .isPet(request.getIsPet() != null ? request.getIsPet() : false)
                .cookingHabit(request.getCookingHabit())
                .guestHabit(request.getGuestHabit())
                .compatibilityScore(score)
                .status("PENDING")
                .build();

        RoommateApplication saved = applicationRepository.save(app);
        log.info("Nộp đơn xin vào nhóm thành công: appId={}, score={}%", saved.getId(), score);

        return mapToApplicationResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoommateApplicationResponse> getPostApplications(Long userId, Long postId) {
        RoommatePost post = postRepository.findById(postId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy bài đăng"));
        if (!post.getAuthor().getId().equals(userId)) {
            throw new BaseException(ErrorCode.FORBIDDEN, "Bạn không có quyền xem danh sách ứng viên của bài đăng này");
        }

        return applicationRepository.findByPostIdOrderByCreatedAtDesc(postId).stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void approveApplication(Long userId, Long applicationId) {
        RoommateApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy đơn ứng tuyển"));

        RoommatePost post = app.getPost();
        if (!post.getAuthor().getId().equals(userId)) {
            throw new BaseException(ErrorCode.FORBIDDEN, "Bạn không phải chủ bài đăng để duyệt đơn này");
        }

        app.setStatus("APPROVED");
        applicationRepository.save(app);

        // Tăng số người hiện tại trong nhóm
        post.setCurrentRoommates(post.getCurrentRoommates() + 1);
        if (post.getCurrentRoommates() >= post.getNeededRoommates() + 1) {
            post.setStatus("COMPLETED");
        }
        postRepository.save(post);
        log.info("Duyệt ứng viên {} vào nhóm bài đăng {}", app.getApplicant().getFullName(), post.getId());
    }

    @Override
    @Transactional
    public void rejectApplication(Long userId, Long applicationId, String reason) {
        RoommateApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy đơn ứng tuyển"));

        RoommatePost post = app.getPost();
        if (!post.getAuthor().getId().equals(userId)) {
            throw new BaseException(ErrorCode.FORBIDDEN, "Bạn không phải chủ bài đăng để từ chối đơn này");
        }

        app.setStatus("REJECTED");
        app.setRejectReason(reason);
        applicationRepository.save(app);
        log.info("Từ chối ứng viên {} của bài đăng {}: lý do={}", app.getApplicant().getFullName(), post.getId(), reason);
    }

    private int calculateMatchingScore(RoommatePost post, RoommateApplicationRequest req) {
        int score = 40; // Điểm nền

        // 1. Giới tính (+20%)
        if ("ANY".equalsIgnoreCase(post.getGenderPreference()) ||
                (req.getGender() != null && req.getGender().equalsIgnoreCase(post.getGenderPreference()))) {
            score += 20;
        }

        // 2. Không hút thuốc (+20%)
        if (Boolean.TRUE.equals(post.getIsNoSmoking()) && Boolean.FALSE.equals(req.getIsSmoking())) {
            score += 20;
        } else if (Boolean.FALSE.equals(post.getIsNoSmoking())) {
            score += 15;
        }

        // 3. Giờ giấc thức ngủ (+10%)
        if (req.getSleepTime() != null && post.getSleepTime() != null) {
            score += 10;
        }

        // 4. Thú cưng (+10%)
        if (post.getIsPetFriendly().equals(req.getIsPet())) {
            score += 10;
        }

        return Math.min(score, 98);
    }

    private RoommatePostResponse mapToPostResponse(RoommatePost p) {
        List<String> images = new ArrayList<>();
        if (p.getRoom() != null && p.getRoom().getImages() != null) {
            images = p.getRoom().getImages().stream().map(img -> img.getImageUrl()).collect(Collectors.toList());
        }

        return RoommatePostResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .postType(p.getPostType())
                .authorId(p.getAuthor() != null ? p.getAuthor().getId() : null)
                .authorName(p.getAuthor() != null ? p.getAuthor().getFullName() : null)
                .authorAvatar(p.getAuthor() != null ? p.getAuthor().getAvatarUrl() : null)
                .roomId(p.getRoom() != null ? p.getRoom().getId() : null)
                .roomName(p.getRoom() != null ? p.getRoom().getName() : null)
                .areaName(p.getAreaName())
                .district(p.getDistrict())
                .city(p.getCity())
                .sharePrice(p.getSharePrice())
                .totalRoomPrice(p.getTotalRoomPrice())
                .neededRoommates(p.getNeededRoommates())
                .currentRoommates(p.getCurrentRoommates())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .radiusKm(p.getRadiusKm())
                .genderPreference(p.getGenderPreference())
                .sleepTime(p.getSleepTime())
                .isNoSmoking(p.getIsNoSmoking())
                .isPetFriendly(p.getIsPetFriendly())
                .cookingFrequency(p.getCookingFrequency())
                .cleanlinessLevel(p.getCleanlinessLevel())
                .guestAllowed(p.getGuestAllowed())
                .matchPercentage(94)
                .status(p.getStatus())
                .roomImages(images)
                .createdAt(p.getCreatedAt())
                .build();
    }

    private RoommateApplicationResponse mapToApplicationResponse(RoommateApplication a) {
        return RoommateApplicationResponse.builder()
                .id(a.getId())
                .postId(a.getPost().getId())
                .postTitle(a.getPost().getTitle())
                .applicantId(a.getApplicant().getId())
                .applicantName(a.getApplicant().getFullName())
                .applicantPhone(a.getApplicant().getPhone())
                .applicantAvatar(a.getApplicant().getAvatarUrl())
                .introMessage(a.getIntroMessage())
                .gender(a.getGender())
                .sleepTime(a.getSleepTime())
                .isSmoking(a.getIsSmoking())
                .isPet(a.getIsPet())
                .cookingHabit(a.getCookingHabit())
                .guestHabit(a.getGuestHabit())
                .compatibilityScore(a.getCompatibilityScore())
                .status(a.getStatus())
                .rejectReason(a.getRejectReason())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
