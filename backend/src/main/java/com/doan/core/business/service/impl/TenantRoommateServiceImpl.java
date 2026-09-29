package com.doan.core.business.service.impl;

import com.doan.core.business.dto.tenant.*;
import com.doan.core.business.entity.*;
import com.doan.core.business.repository.*;
import com.doan.core.business.service.LifestyleVectorHelper;
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
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantRoommateServiceImpl implements TenantRoommateService {

    private final RoommatePostRepository postRepository;
    private final RoommateApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final LifestyleQuestionRepository questionRepository;
    private final LifestyleOptionRepository optionRepository;
    private final UserLifestyleAnswerRepository userLifestyleAnswerRepository;
    private final RoommatePostLifestyleAnswerRepository postLifestyleAnswerRepository;
    private final RoommateApplicationLifestyleAnswerRepository applicationLifestyleAnswerRepository;
    private final LifestyleVectorHelper vectorHelper;

    @Override
    @Transactional(readOnly = true)
    public List<LifestyleQuestionResponse> getLifestyleQuestions() {
        List<LifestyleQuestion> questions = questionRepository.findAllActiveWithOptions();
        return questions.stream().map(q -> LifestyleQuestionResponse.builder()
                .id(q.getId())
                .code(q.getCode())
                .label(q.getLabel())
                .category(q.getCategory())
                .qType(q.getQType())
                .isHard(q.getIsHard())
                .weight(q.getWeight())
                .sortOrder(q.getSortOrder())
                .options(q.getOptions().stream()
                        .filter(o -> Boolean.TRUE.equals(o.getIsActive()))
                        .map(o -> LifestyleOptionResponse.builder()
                                .id(o.getId())
                                .questionId(q.getId())
                                .label(o.getLabel())
                                .value(o.getValue())
                                .sortOrder(o.getSortOrder())
                                .build())
                        .collect(Collectors.toList()))
                .build()).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserLifestyleProfileResponse getUserLifestyleProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        List<UserLifestyleAnswer> answers = userLifestyleAnswerRepository.findByUserIdWithDetails(userId);
        List<UserLifestyleAnswerDto> answerDtos = answers.stream().map(a -> UserLifestyleAnswerDto.builder()
                .questionId(a.getQuestionId())
                .questionCode(a.getQuestion() != null ? a.getQuestion().getCode() : null)
                .questionLabel(a.getQuestion() != null ? a.getQuestion().getLabel() : null)
                .optionId(a.getOptionId())
                .optionLabel(a.getOption() != null ? a.getOption().getLabel() : null)
                .optionValue(a.getOption() != null ? a.getOption().getValue() : null)
                .fromProfile(true)
                .build()).collect(Collectors.toList());

        return UserLifestyleProfileResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .lifestyleVector(user.getLifestyleVector())
                .answers(answerDtos)
                .build();
    }

    @Override
    @Transactional
    public UserLifestyleProfileResponse saveUserLifestyleProfile(Long userId, SaveLifestyleAnswersRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        userLifestyleAnswerRepository.deleteByUserId(userId);

        List<LifestyleQuestion> questions = questionRepository.findAllActiveWithOptions();
        Map<Long, List<LifestyleOption>> selectedOptionsMap = new HashMap<>();

        if (request.getAnswers() != null && !request.getAnswers().isEmpty()) {
            for (SaveLifestyleAnswersRequest.AnswerItem item : request.getAnswers()) {
                if (item.getQuestionId() == null || item.getOptionId() == null) continue;
                LifestyleOption option = optionRepository.findById(item.getOptionId()).orElse(null);
                if (option != null) {
                    selectedOptionsMap.computeIfAbsent(item.getQuestionId(), k -> new ArrayList<>()).add(option);
                    UserLifestyleAnswer answer = UserLifestyleAnswer.builder()
                            .userId(userId)
                            .questionId(item.getQuestionId())
                            .optionId(item.getOptionId())
                            .build();
                    userLifestyleAnswerRepository.save(answer);
                }
            }
        }

        // Sinh vector lối sống của người dùng và lưu vào users.lifestyle_vector
        String vector = vectorHelper.buildVectorFromMultiMap(questions, selectedOptionsMap);
        user.setLifestyleVector(vector);
        userRepository.save(user);
        log.info("Cập nhật hồ sơ lối sống User id={}, vector={}", user.getId(), vector);

        return getUserLifestyleProfile(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoommatePostResponse> searchPosts(
            Long currentUserId,
            String keyword,
            String district,
            String postType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String gender,
            Boolean noSmoking,
            String sleepTime,
            Pageable pageable) {

        log.info("Tìm kiếm bài đăng ở ghép: currentUserId={}, keyword={}, district={}, postType={}, minPrice={}, maxPrice={}",
                currentUserId, keyword, district, postType, minPrice, maxPrice);

        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Khoảng giá không hợp lệ (Giá tối thiểu lớn hơn giá tối đa)");
        }

        // Lấy vector lối sống của người đang tìm kiếm (nếu đã đăng nhập)
        String userVector = null;
        if (currentUserId != null) {
            userVector = userRepository.findById(currentUserId)
                    .map(User::getLifestyleVector)
                    .orElse(null);
        }

        List<LifestyleQuestion> questions = questionRepository.findAllActiveWithOptions();

        Page<RoommatePost> page = postRepository.searchPosts(
                (keyword != null && !keyword.isBlank()) ? keyword.trim() : null,
                (district != null && !district.isBlank()) ? district.trim() : null,
                (postType != null && !postType.isBlank()) ? postType.trim() : null,
                minPrice,
                maxPrice,
                pageable);

        final String finalUserVector = userVector;
        List<RoommatePostResponse> filtered = page.getContent().stream()
                .filter(p -> gender == null || "ANY".equalsIgnoreCase(gender) || gender.equalsIgnoreCase(p.getGenderPreference()))
                .filter(p -> noSmoking == null || !noSmoking || Boolean.TRUE.equals(p.getIsNoSmoking()))
                .filter(p -> sleepTime == null || "ALL".equalsIgnoreCase(sleepTime) || sleepTime.equalsIgnoreCase(p.getSleepTime()))
                .map(p -> {
                    RoommatePostResponse res = mapToPostResponse(p);
                    if (finalUserVector != null && p.getLifestyleVector() != null) {
                        int matchScore = vectorHelper.calculateCompatibilityScore(finalUserVector, p.getLifestyleVector(), questions);
                        res.setMatchPercentage(matchScore);
                    }
                    return res;
                })
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

        // Lưu câu trả lời lối sống riêng cho bài đăng và tính post.lifestyleVector
        savePostLifestyleAnswersAndVector(saved, author, request.getLifestyleAnswers());

        log.info("Tạo bài đăng ở ghép có phòng thành công: id={}, vector={}", saved.getId(), saved.getLifestyleVector());
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

        // Lưu câu trả lời lối sống riêng cho bài đăng và tính post.lifestyleVector
        savePostLifestyleAnswersAndVector(saved, author, request.getLifestyleAnswers());

        log.info("Tạo bài đăng ở ghép chưa có phòng thành công: id={}, vector={}", saved.getId(), saved.getLifestyleVector());
        return mapToPostResponse(saved);
    }

    private void savePostLifestyleAnswersAndVector(RoommatePost post, User author, List<SaveLifestyleAnswersRequest.AnswerItem> customAnswers) {
        List<LifestyleQuestion> questions = questionRepository.findAllActiveWithOptions();
        Map<Long, List<LifestyleOption>> selectedOptionsMap = new HashMap<>();

        if (customAnswers != null && !customAnswers.isEmpty()) {
            for (SaveLifestyleAnswersRequest.AnswerItem item : customAnswers) {
                if (item.getQuestionId() == null || item.getOptionId() == null) continue;
                LifestyleOption option = optionRepository.findById(item.getOptionId()).orElse(null);
                if (option != null) {
                    selectedOptionsMap.computeIfAbsent(item.getQuestionId(), k -> new ArrayList<>()).add(option);
                    RoommatePostLifestyleAnswer ans = RoommatePostLifestyleAnswer.builder()
                            .postId(post.getId())
                            .questionId(item.getQuestionId())
                            .optionId(item.getOptionId())
                            .fromProfile(false)
                            .build();
                    postLifestyleAnswerRepository.save(ans);
                }
            }
        } else {
            // Clone từ user_lifestyle_answers của tác giả
            List<UserLifestyleAnswer> authorAnswers = userLifestyleAnswerRepository.findByUserIdWithDetails(author.getId());
            for (UserLifestyleAnswer ula : authorAnswers) {
                if (ula.getOption() != null) {
                    selectedOptionsMap.computeIfAbsent(ula.getQuestionId(), k -> new ArrayList<>()).add(ula.getOption());
                }
                RoommatePostLifestyleAnswer ans = RoommatePostLifestyleAnswer.builder()
                        .postId(post.getId())
                        .questionId(ula.getQuestionId())
                        .optionId(ula.getOptionId())
                        .fromProfile(true)
                        .build();
                postLifestyleAnswerRepository.save(ans);
            }
        }

        String vector = vectorHelper.buildVectorFromMultiMap(questions, selectedOptionsMap);
        post.setLifestyleVector(vector);
        postRepository.save(post);
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

        List<LifestyleQuestion> questions = questionRepository.findAllActiveWithOptions();
        Map<Long, List<LifestyleOption>> selectedOptionsMap = new HashMap<>();
        boolean isCustomized = Boolean.TRUE.equals(request.getIsCustomized());

        // Kiểm tra xem ứng viên gửi câu trả lời tinh chỉnh hay clone từ hồ sơ
        if (request.getLifestyleAnswers() != null && !request.getLifestyleAnswers().isEmpty()) {
            isCustomized = true;
            for (SaveLifestyleAnswersRequest.AnswerItem item : request.getLifestyleAnswers()) {
                if (item.getQuestionId() == null || item.getOptionId() == null) continue;
                LifestyleOption opt = optionRepository.findById(item.getOptionId()).orElse(null);
                if (opt != null) {
                    selectedOptionsMap.computeIfAbsent(item.getQuestionId(), k -> new ArrayList<>()).add(opt);
                }
            }
        } else {
            // Clone từ user_lifestyle_answers
            List<UserLifestyleAnswer> userAnswers = userLifestyleAnswerRepository.findByUserIdWithDetails(userId);
            for (UserLifestyleAnswer ula : userAnswers) {
                if (ula.getOption() != null) {
                    selectedOptionsMap.computeIfAbsent(ula.getQuestionId(), k -> new ArrayList<>()).add(ula.getOption());
                }
            }
        }

        // Sinh vector lối sống riêng cho đơn ứng tuyển này
        String appVector = vectorHelper.buildVectorFromMultiMap(questions, selectedOptionsMap);

        // Tính điểm tương thích Compatibility Score trực tiếp giữa 2 vector
        int score = vectorHelper.calculateCompatibilityScore(appVector, post.getLifestyleVector(), questions);

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
                .lifestyleVector(appVector)
                .compatibilityScore(score)
                .isCustomized(isCustomized)
                .status("PENDING")
                .build();

        RoommateApplication saved = applicationRepository.save(app);

        // Lưu câu trả lời lối sống chi tiết của đơn ứng tuyển
        for (Map.Entry<Long, List<LifestyleOption>> entry : selectedOptionsMap.entrySet()) {
            if (entry.getValue() != null) {
                for (LifestyleOption opt : entry.getValue()) {
                    RoommateApplicationLifestyleAnswer answer = RoommateApplicationLifestyleAnswer.builder()
                            .applicationId(saved.getId())
                            .questionId(entry.getKey())
                            .optionId(opt.getId())
                            .fromProfile(!isCustomized)
                            .build();
                    applicationLifestyleAnswerRepository.save(answer);
                }
            }
        }

        log.info("Nộp đơn xin vào nhóm thành công: appId={}, score={}% (customized={}), vector={}",
                saved.getId(), score, isCustomized, appVector);

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

    private RoommatePostResponse mapToPostResponse(RoommatePost p) {
        List<String> images = new ArrayList<>();
        if (p.getRoom() != null && p.getRoom().getImages() != null) {
            images = p.getRoom().getImages().stream().map(RoomImage::getImageUrl).collect(Collectors.toList());
        }

        List<RoommatePostLifestyleAnswer> postAnswers = postLifestyleAnswerRepository.findByPostIdWithDetails(p.getId());
        List<UserLifestyleAnswerDto> answerDtos = postAnswers.stream().map(a -> UserLifestyleAnswerDto.builder()
                .questionId(a.getQuestionId())
                .questionCode(a.getQuestion() != null ? a.getQuestion().getCode() : null)
                .questionLabel(a.getQuestion() != null ? a.getQuestion().getLabel() : null)
                .optionId(a.getOptionId())
                .optionLabel(a.getOption() != null ? a.getOption().getLabel() : null)
                .optionValue(a.getOption() != null ? a.getOption().getValue() : null)
                .fromProfile(a.getFromProfile())
                .build()).collect(Collectors.toList());

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
                .lifestyleVector(p.getLifestyleVector())
                .lifestyleAnswers(answerDtos)
                .matchPercentage(92)
                .status(p.getStatus())
                .roomImages(images)
                .createdAt(p.getCreatedAt())
                .build();
    }

    private RoommateApplicationResponse mapToApplicationResponse(RoommateApplication a) {
        List<RoommateApplicationLifestyleAnswer> appAnswers = applicationLifestyleAnswerRepository.findByApplicationIdWithDetails(a.getId());
        List<UserLifestyleAnswerDto> answerDtos = appAnswers.stream().map(ans -> UserLifestyleAnswerDto.builder()
                .questionId(ans.getQuestionId())
                .questionCode(ans.getQuestion() != null ? ans.getQuestion().getCode() : null)
                .questionLabel(ans.getQuestion() != null ? ans.getQuestion().getLabel() : null)
                .optionId(ans.getOptionId())
                .optionLabel(ans.getOption() != null ? ans.getOption().getLabel() : null)
                .optionValue(ans.getOption() != null ? ans.getOption().getValue() : null)
                .fromProfile(ans.getFromProfile())
                .build()).collect(Collectors.toList());

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
                .lifestyleVector(a.getLifestyleVector())
                .isCustomized(a.getIsCustomized())
                .lifestyleAnswers(answerDtos)
                .compatibilityScore(a.getCompatibilityScore())
                .status(a.getStatus())
                .rejectReason(a.getRejectReason())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
