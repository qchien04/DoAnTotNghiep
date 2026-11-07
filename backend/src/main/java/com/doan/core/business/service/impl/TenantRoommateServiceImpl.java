package com.doan.core.business.service.impl;

import com.doan.core.business.dto.tenant.*;
import com.doan.core.business.entity.*;
import com.doan.core.business.enums.*;
import com.doan.core.business.repository.*;
import com.doan.core.business.service.LifestyleConstants;
import com.doan.core.business.service.LifestyleVectorHelper;
import com.doan.core.business.service.TenantRoommateService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final LifestyleVectorHelper vectorHelper;

    @Override
    @Transactional(readOnly = true)
    public List<LifestyleQuestionResponse> getLifestyleQuestions() {
        return com.doan.core.business.service.LifestyleConstants.QUESTIONS;
    }

    @Override
    @Transactional(readOnly = true)
    public UserLifestyleProfileResponse getUserLifestyleProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        List<UserLifestyleAnswerDto> answerDtos = vectorHelper.decodeVectorToAnswers(user.getLifestyleVector());

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

        Map<Long, List<LifestyleOptionResponse>> selectedOptionsMap = new HashMap<>();

        if (request.getAnswers() != null && !request.getAnswers().isEmpty()) {
            for (SaveLifestyleAnswersRequest.AnswerItem item : request.getAnswers()) {
                if (item.getQuestionId() == null)
                    continue;
                if (item.getOptionIds() != null && !item.getOptionIds().isEmpty()) {
                    for (Long optId : item.getOptionIds()) {
                        LifestyleOptionResponse opt = LifestyleConstants.OPTIONS_BY_ID.get(optId);
                        if (opt != null) {
                            selectedOptionsMap.computeIfAbsent(item.getQuestionId(), k -> new ArrayList<>()).add(opt);
                        }
                    }
                } else if (item.getOptionId() != null) {
                    LifestyleOptionResponse option = LifestyleConstants.OPTIONS_BY_ID
                            .get(item.getOptionId());
                    if (option != null) {
                        selectedOptionsMap.computeIfAbsent(item.getQuestionId(), k -> new ArrayList<>()).add(option);
                    }
                }
            }
        }

        // Sinh vector sinh hoạt của người dùng và lưu trực tiếp vào
        // users.lifestyle_vector
        String vector = vectorHelper.buildVectorFromOptionMap(selectedOptionsMap);
        user.setLifestyleVector(vector);
        userRepository.save(user);
        log.info("Cập nhật hồ sơ sinh hoạt User id={}, vector={}", user.getId(), vector);

        return getUserLifestyleProfile(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoommatePostResponse> searchPosts(
            Long currentUserId,
            String keyword,
            String district,
            RoommatePostType postType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            GenderPreference gender,
            Boolean noSmoking,
            String sleepTime,
            Pageable pageable) {

        log.info(
                "Tìm kiếm bài đăng ở ghép: currentUserId={}, keyword={}, district={}, postType={}, minPrice={}, maxPrice={}",
                currentUserId, keyword, district, postType, minPrice, maxPrice);

        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST,
                    "Khoảng giá không hợp lệ (Giá tối thiểu lớn hơn giá tối đa)");
        }

        // Lấy vector sinh hoạt của người đang tìm kiếm (nếu đã đăng nhập)
        String userVector = null;
        if (currentUserId != null) {
            userVector = userRepository.findById(currentUserId)
                    .map(User::getLifestyleVector)
                    .orElse(null);
        }

        Page<RoommatePost> page = postRepository.searchPosts(
                (keyword != null && !keyword.isBlank()) ? keyword.trim() : null,
                (district != null && !district.isBlank()) ? district.trim() : null,
                postType,
                minPrice,
                maxPrice,
                pageable);

        final String finalUserVector = userVector;
        final User currentUser = currentUserId != null ? userRepository.findById(currentUserId).orElse(null) : null;
        final GenderPreference targetPref = gender;
        List<RoommatePostResponse> filtered = page.getContent().stream()
                .filter(p -> {
                    if (targetPref == null || targetPref == GenderPreference.ANY) {
                        return true;
                    }
                    GenderPreference postPref = p.getGenderPreference();
                    if (postPref == null || postPref == GenderPreference.ANY) {
                        return true;
                    }
                    return postPref == targetPref;
                })
                .filter(p -> noSmoking == null || !noSmoking || Boolean.TRUE.equals(p.getIsNoSmoking()))
                .map(p -> {
                    RoommatePostResponse res = mapToPostResponse(p);
                    if (finalUserVector != null && p.getLifestyleVector() != null) {
                        int matchScore = vectorHelper.calculateCompatibilityScore(finalUserVector,
                                p.getLifestyleVector());
                        if (currentUser != null && isDealbreakerViolated(currentUser, p)) {
                            matchScore = Math.min(matchScore, 50);
                        }
                        res.setMatchPercentage(matchScore > 0 ? matchScore : null);
                    } else {
                        res.setMatchPercentage(null);
                    }
                    return res;
                })
                .collect(Collectors.toList());

        return PageResponse.from(new PageImpl<>(filtered, pageable, page.getTotalElements()));
    }

    @Override
    @Transactional(readOnly = true)
    public RoommatePostResponse getPostById(Long id) {
        return getPostById(id, null);
    }

    @Override
    @Transactional(readOnly = true)
    public RoommatePostResponse getPostById(Long id, Long currentUserId) {
        RoommatePost post = postRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy bài đăng ở ghép"));
        RoommatePostResponse res = mapToPostResponse(post);
        if (currentUserId != null && post.getLifestyleVector() != null) {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser != null && currentUser.getLifestyleVector() != null
                    && !currentUser.getLifestyleVector().isBlank()) {
                int score = vectorHelper.calculateCompatibilityScore(currentUser.getLifestyleVector(),
                        post.getLifestyleVector());
                if (isDealbreakerViolated(currentUser, post)) {
                    score = Math.min(score, 50);
                }
                res.setMatchPercentage(score > 0 ? score : null);
            }
        }
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoommatePostResponse> getMyPosts(Long userId, String keyword, RoommatePostStatus status,
            RoommatePostType postType, int page, int size, String sortBy, String sortDirection) {
        String kw = (keyword != null && !keyword.trim().isBlank()) ? keyword.trim() : null;

        Sort sort;
        if (sortBy != null && !sortBy.isBlank()) {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            String sortProperty = switch (sortBy.toLowerCase()) {
                case "createdat" -> "createdAt";
                case "shareprice" -> "sharePrice";
                case "status" -> "status";
                default -> "id";
            };
            sort = Sort.by(direction, sortProperty);
        } else {
            sort = Sort.by(Sort.Direction.DESC,
                    "createdAt");
        }

        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        log.info(
                "Lấy danh sách bài đăng của người thuê userId: {}, status: {}, postType: {}, keyword: {}, pageable: {}",
                userId, status, postType, kw, pageable);
        Page<RoommatePost> postsPage = postRepository.filterAuthorPosts(userId, status, postType, kw, pageable);
        Page<RoommatePostResponse> dtoPage = postsPage.map(this::mapToPostResponse);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional
    public RoommatePostResponse createPostWithRoom(Long userId, RoommatePostRequest request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // Ràng buộc eKYC: Bắt buộc người tìm ở ghép phải hoàn tất xác thực danh tính (eKYC) trước khi đăng tin
        if (!Boolean.TRUE.equals(author.getIdCardVerified()) && (author.getIdCardNumber() == null || author.getIdCardNumber().isBlank())) {
            throw new BaseException(ErrorCode.KYC_REQUIRED, "Bạn cần hoàn tất xác thực danh tính điện tử (eKYC) trước khi đăng tin tìm người ở ghép để đảm bảo an toàn và uy tín trong cộng đồng!");
        }

        if (request.getTotalRoomPrice() != null && request.getSharePrice().compareTo(request.getTotalRoomPrice()) > 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST,
                    "Giá đóng góp mỗi người không được vượt quá tổng tiền thuê phòng gốc!");
        }

        Room room = null;
        if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId()).orElse(null);
        }

        GenderPreference genderPref = request.getGenderPreference() != null
                ? request.getGenderPreference()
                : GenderPreference.ANY;

        RoommatePost post = RoommatePost.builder()
                .author(author)
                .title(request.getTitle())
                .description(request.getDescription())
                .postType(RoommatePostType.HAS_ROOM)
                .room(room)
                .areaName(request.getRoomAddress() != null ? request.getRoomAddress()
                        : (room != null && room.getBuilding() != null ? room.getBuilding().getAddressDetail() : null))
                .district(request.getDistrict())
                .city(request.getCity() != null ? request.getCity() : "Hà Nội")
                .sharePrice(request.getSharePrice())
                .totalRoomPrice(request.getTotalRoomPrice() != null ? request.getTotalRoomPrice()
                        : request.getSharePrice().multiply(BigDecimal.valueOf(2)))
                .neededRoommates(request.getNeededRoommates() != null ? request.getNeededRoommates() : 1)
                .currentRoommates(1)
                .genderPreference(genderPref)
                .isNoSmoking(request.getIsNoSmoking() != null ? request.getIsNoSmoking() : true)
                .isPetFriendly(request.getIsPetFriendly() != null ? request.getIsPetFriendly() : false)
                .status(RoommatePostStatus.OPEN)
                .build();

        RoommatePost saved = postRepository.save(post);

        // Lưu câu trả lời sinh hoạt riêng cho bài đăng và tính post.lifestyleVector
        savePostLifestyleAnswersAndVector(saved, author, request.getLifestyleAnswers());

        log.info("Tạo bài đăng ở ghép có phòng thành công: id={}, vector={}", saved.getId(),
                saved.getLifestyleVector());
        return mapToPostResponse(saved);
    }

    @Override
    @Transactional
    public RoommatePostResponse createPostWithoutRoom(Long userId, RoommatePostRequest request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // Ràng buộc eKYC: Bắt buộc người tìm ở ghép phải hoàn tất xác thực danh tính (eKYC) trước khi đăng tin
        if (!Boolean.TRUE.equals(author.getIdCardVerified()) && (author.getIdCardNumber() == null || author.getIdCardNumber().isBlank())) {
            throw new BaseException(ErrorCode.KYC_REQUIRED, "Bạn cần hoàn tất xác thực danh tính điện tử (eKYC) trước khi đăng tin tìm người ở ghép để đảm bảo an toàn và uy tín trong cộng đồng!");
        }

        GenderPreference genderPref = request.getGenderPreference() != null
                ? request.getGenderPreference()
                : GenderPreference.ANY;

        RoommatePost post = RoommatePost.builder()
                .author(author)
                .title(request.getTitle())
                .description(request.getDescription())
                .postType(RoommatePostType.SEARCHING_ROOM)
                .areaName(request.getRoomAddress())
                .district(request.getDistrict())
                .city(request.getCity() != null ? request.getCity() : "Hà Nội")
                .sharePrice(request.getSharePrice())
                .neededRoommates(request.getNeededRoommates() != null ? request.getNeededRoommates() : 2)
                .currentRoommates(1)
                .latitude(request.getLatitude() != null ? request.getLatitude() : 21.0056)
                .longitude(request.getLongitude() != null ? request.getLongitude() : 105.8433)
                .radiusKm(request.getRadiusKm() != null ? request.getRadiusKm() : 3.0)
                .genderPreference(genderPref)
                .isNoSmoking(request.getIsNoSmoking() != null ? request.getIsNoSmoking() : true)
                .isPetFriendly(request.getIsPetFriendly() != null ? request.getIsPetFriendly() : true)
                .status(RoommatePostStatus.OPEN)
                .build();

        RoommatePost saved = postRepository.save(post);

        // Lưu câu trả lời sinh hoạt riêng cho bài đăng và tính post.lifestyleVector
        savePostLifestyleAnswersAndVector(saved, author, request.getLifestyleAnswers());

        log.info("Tạo bài đăng ở ghép chưa có phòng thành công: id={}, vector={}", saved.getId(),
                saved.getLifestyleVector());
        return mapToPostResponse(saved);
    }

    private void savePostLifestyleAnswersAndVector(RoommatePost post, User author,
            List<SaveLifestyleAnswersRequest.AnswerItem> customAnswers) {
        String vector;

        if (customAnswers != null && !customAnswers.isEmpty()) {
            Map<Long, List<LifestyleOptionResponse>> selectedOptionsMap = new HashMap<>();
            for (SaveLifestyleAnswersRequest.AnswerItem item : customAnswers) {
                if (item.getQuestionId() == null)
                    continue;
                if (item.getOptionIds() != null && !item.getOptionIds().isEmpty()) {
                    for (Long optId : item.getOptionIds()) {
                        LifestyleOptionResponse opt = com.doan.core.business.service.LifestyleConstants.OPTIONS_BY_ID
                                .get(optId);
                        if (opt != null) {
                            selectedOptionsMap.computeIfAbsent(item.getQuestionId(), k -> new ArrayList<>()).add(opt);
                        }
                    }
                } else if (item.getOptionId() != null) {
                    LifestyleOptionResponse option = com.doan.core.business.service.LifestyleConstants.OPTIONS_BY_ID
                            .get(item.getOptionId());
                    if (option != null) {
                        selectedOptionsMap.computeIfAbsent(item.getQuestionId(), k -> new ArrayList<>()).add(option);
                    }
                }
            }
            vector = vectorHelper.buildVectorFromOptionMap(selectedOptionsMap);
        } else {
            // Kế thừa vector trực tiếp từ hồ sơ tác giả (Fail-close: Bắt buộc đã hoàn thành
            // khảo sát)
            if (author.getLifestyleVector() == null || author.getLifestyleVector().isBlank()) {
                throw new BaseException(ErrorCode.BAD_REQUEST,
                        "Bạn chưa hoàn thành khảo sát sinh hoạt trong hồ sơ cá nhân. Vui lòng hoàn thành khảo sát trước khi đăng bài ở ghép");
            }
            vector = author.getLifestyleVector();
        }

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
        post.setStatus(RoommatePostStatus.CLOSED);
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
        post.setStatus(RoommatePostStatus.COMPLETED);
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
            throw new BaseException(ErrorCode.BAD_REQUEST,
                    "Bạn là chủ bài đăng này, không thể tự ứng tuyển vào nhóm của mình");
        }

        if (applicationRepository.existsByPostIdAndApplicantIdAndStatus(post.getId(), userId,
                RoommateApplicationStatus.PENDING)) {
            throw new BaseException(ErrorCode.CONFLICT,
                    "Bạn đã gửi đơn xin gia nhập trước đó, vui lòng chờ chủ phòng phản hồi");
        }

        boolean isCustomized = Boolean.TRUE.equals(request.getIsCustomized());
        String appVector;

        // Kiểm tra xem ứng viên gửi câu trả lời tinh chỉnh hay kế thừa từ hồ sơ
        if (request.getLifestyleAnswers() != null && !request.getLifestyleAnswers().isEmpty()) {
            isCustomized = true;
            Map<Long, List<LifestyleOptionResponse>> selectedOptionsMap = new HashMap<>();
            for (SaveLifestyleAnswersRequest.AnswerItem item : request.getLifestyleAnswers()) {
                if (item.getQuestionId() == null)
                    continue;
                if (item.getOptionIds() != null && !item.getOptionIds().isEmpty()) {
                    for (Long optId : item.getOptionIds()) {
                        LifestyleOptionResponse opt = com.doan.core.business.service.LifestyleConstants.OPTIONS_BY_ID
                                .get(optId);
                        if (opt != null) {
                            selectedOptionsMap.computeIfAbsent(item.getQuestionId(), k -> new ArrayList<>()).add(opt);
                        }
                    }
                } else if (item.getOptionId() != null) {
                    LifestyleOptionResponse opt = com.doan.core.business.service.LifestyleConstants.OPTIONS_BY_ID
                            .get(item.getOptionId());
                    if (opt != null) {
                        selectedOptionsMap.computeIfAbsent(item.getQuestionId(), k -> new ArrayList<>()).add(opt);
                    }
                }
            }
            appVector = vectorHelper.buildVectorFromOptionMap(selectedOptionsMap);
        } else {
            // Kế thừa vector từ hồ sơ ứng viên (Fail-close: Bắt buộc đã hoàn thành khảo
            // sát)
            if (applicant.getLifestyleVector() == null || applicant.getLifestyleVector().isBlank()) {
                throw new BaseException(ErrorCode.BAD_REQUEST,
                        "Bạn chưa hoàn thành khảo sát sinh hoạt trong hồ sơ cá nhân. Vui lòng hoàn thành khảo sát hoặc trả lời câu hỏi khi nộp đơn");
            }
            appVector = applicant.getLifestyleVector();
        }

        // Tính điểm tương thích Compatibility Score trực tiếp giữa 2 vector
        int score = 0;
        if (post.getLifestyleVector() != null && !post.getLifestyleVector().isBlank()) {
            score = vectorHelper.calculateCompatibilityScore(appVector, post.getLifestyleVector());
        }

        // Kiểm tra lọc cứng Dealbreakers hai chiều nghiêm ngặt (Fail-close)
        Gender appGender = request.getGender() != null ? request.getGender() : applicant.getGender();
        GenderPreference appGpref = applicant.getGenderPreference() != null ? applicant.getGenderPreference()
                : GenderPreference.ANY;

        boolean appSmokes = Boolean.TRUE.equals(request.getIsSmoking()) || Boolean.TRUE.equals(applicant.getSmokes());
        boolean appHasPet = Boolean.TRUE.equals(request.getIsPet()) || Boolean.TRUE.equals(applicant.getHasPet());

        boolean violated = isDealbreakerViolated(
                appGender,
                appGpref,
                appSmokes,
                Boolean.TRUE.equals(applicant.getRejectsSmokers()),
                appHasPet,
                Boolean.TRUE.equals(applicant.getRejectsPets()),
                post);

        if (violated) {
            score = Math.min(score, 50);
        }

        RoommateApplication app = RoommateApplication.builder()
                .post(post)
                .applicant(applicant)
                .introMessage(request.getIntroMessage())
                .gender(appGender)
                .isSmoking(appSmokes)
                .isPet(appHasPet)
                .lifestyleVector(appVector)
                .compatibilityScore(score)
                .isCustomized(isCustomized)
                .status(RoommateApplicationStatus.PENDING)
                .build();

        RoommateApplication saved = applicationRepository.save(app);

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

        app.setStatus(RoommateApplicationStatus.APPROVED);
        applicationRepository.save(app);

        // Tăng số người hiện tại trong nhóm
        post.setCurrentRoommates(post.getCurrentRoommates() + 1);
        if (post.getCurrentRoommates() >= post.getNeededRoommates() + 1) {
            post.setStatus(RoommatePostStatus.COMPLETED);
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

        app.setStatus(RoommateApplicationStatus.REJECTED);
        app.setRejectReason(reason);
        applicationRepository.save(app);
        log.info("Từ chối ứng viên {} của bài đăng {}: lý do={}", app.getApplicant().getFullName(), post.getId(),
                reason);
    }

    private RoommatePostResponse mapToPostResponse(RoommatePost p) {
        List<String> images = new ArrayList<>();
        if (p.getRoom() != null) {
            if (p.getRoom().getCoverImageUrl() != null && !p.getRoom().getCoverImageUrl().isBlank()) {
                images.add(p.getRoom().getCoverImageUrl());
            }
            if (p.getRoom().getImages() != null) {
                p.getRoom().getImages().stream()
                        .map(RoomImage::getImageUrl)
                        .filter(url -> !images.contains(url))
                        .forEach(images::add);
            }
        }

        List<UserLifestyleAnswerDto> answerDtos = vectorHelper.decodeVectorToAnswers(p.getLifestyleVector());

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
                .isNoSmoking(p.getIsNoSmoking())
                .isPetFriendly(p.getIsPetFriendly())
                .lifestyleVector(p.getLifestyleVector())
                .lifestyleAnswers(answerDtos)
                .matchPercentage(null)
                .status(p.getStatus())
                .roomImages(images)
                .createdAt(p.getCreatedAt())
                .build();
    }

    private RoommateApplicationResponse mapToApplicationResponse(RoommateApplication a) {
        List<UserLifestyleAnswerDto> answerDtos = vectorHelper.decodeVectorToAnswers(a.getLifestyleVector());

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
                .isSmoking(a.getIsSmoking())
                .isPet(a.getIsPet())
                .lifestyleVector(a.getLifestyleVector())
                .isCustomized(a.getIsCustomized())
                .lifestyleAnswers(answerDtos)
                .compatibilityScore(a.getCompatibilityScore())
                .status(a.getStatus())
                .rejectReason(a.getRejectReason())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private boolean isDealbreakerViolated(User user, RoommatePost post) {
        if (user == null || post == null)
            return false;
        return isDealbreakerViolated(
                user.getGender(),
                user.getGenderPreference(),
                Boolean.TRUE.equals(user.getSmokes()),
                Boolean.TRUE.equals(user.getRejectsSmokers()),
                Boolean.TRUE.equals(user.getHasPet()),
                Boolean.TRUE.equals(user.getRejectsPets()),
                post);
    }

    private boolean isDealbreakerViolated(
            Gender genderA, GenderPreference gprefA, boolean smokesA, boolean rejectsSmokersA, boolean hasPetA,
            boolean rejectsPetsA,
            RoommatePost post) {
        if (post == null)
            return false;
        User author = post.getAuthor();
        Gender genderB = author != null ? author.getGender() : null;
        GenderPreference gprefB = post.getGenderPreference();
        boolean smokesB = author != null ? Boolean.TRUE.equals(author.getSmokes())
                : !Boolean.TRUE.equals(post.getIsNoSmoking());
        boolean rejectsSmokersB = Boolean.TRUE.equals(post.getIsNoSmoking())
                || (author != null && Boolean.TRUE.equals(author.getRejectsSmokers()));
        boolean hasPetB = Boolean.TRUE.equals(post.getIsPetFriendly())
                || (author != null && Boolean.TRUE.equals(author.getHasPet()));
        boolean rejectsPetsB = !Boolean.TRUE.equals(post.getIsPetFriendly())
                || (author != null && Boolean.TRUE.equals(author.getRejectsPets()));

        // 1. Giới tính hai chiều (Fail-close)
        boolean aRejectsB = (gprefA == GenderPreference.FEMALE_ONLY && genderB != Gender.FEMALE)
                || (gprefA == GenderPreference.MALE_ONLY && genderB != Gender.MALE);
        boolean bRejectsA = (gprefB == GenderPreference.FEMALE_ONLY && genderA != Gender.FEMALE)
                || (gprefB == GenderPreference.MALE_ONLY && genderA != Gender.MALE);
        if (aRejectsB || bRejectsA) {
            return true;
        }

        // 2. Thuốc lá hai chiều (Fail-close)
        boolean smokeViolated = (smokesB && rejectsSmokersA) || (smokesA && rejectsSmokersB);
        if (smokeViolated) {
            return true;
        }

        // 3. Thú cưng hai chiều (Fail-close)
        boolean petViolated = (hasPetB && rejectsPetsA) || (hasPetA && rejectsPetsB);
        if (petViolated) {
            return true;
        }

        return false;
    }
}
