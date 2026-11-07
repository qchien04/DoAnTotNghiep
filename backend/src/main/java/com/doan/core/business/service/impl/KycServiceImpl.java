package com.doan.core.business.service.impl;

import com.doan.core.business.dto.kyc.KycAiVerificationResponse;
import com.doan.core.business.dto.kyc.KycBundleResponse;
import com.doan.core.business.dto.kyc.KycDocumentResponse;
import com.doan.core.business.dto.kyc.KycFileResource;
import com.doan.core.business.dto.kyc.StoredFileInfo;
import com.doan.core.business.dto.kyc.QrCccdInfo;
import com.doan.core.business.entity.KycDocument;
import com.doan.core.business.entity.KycDocumentType;
import com.doan.core.business.entity.KycStatus;
import com.doan.core.business.service.KycAiServiceClient;

import com.doan.core.business.entity.Tenant;
import com.doan.core.business.entity.User;
import com.doan.core.business.repository.KycDocumentRepository;
import com.doan.core.business.repository.TenantRepository;
import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.service.KycService;
import com.doan.core.business.service.SecureStorageService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KycServiceImpl implements KycService {

    private final KycDocumentRepository kycDocumentRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final SecureStorageService secureStorageService;
    private final KycAiServiceClient kycAiServiceClient;

    private static final String KYC_SUBFOLDER = "kyc";


    /**
     * Kiểm tra ràng buộc duy nhất: 1 số CCCD chỉ thuộc về 1 tài khoản duy nhất trong CSDL
     */
    private String validateAndNormalizeIdCardNumber(Long userId, String idCardNumber) {
        if (!StringUtils.hasText(idCardNumber)) {
            return null;
        }
        String normalized = idCardNumber.trim();

        // 1. Kiểm tra trong bảng users xem tài khoản khác đã sở hữu số CCCD này chưa
        if (userRepository.existsByIdCardNumberAndIdNot(normalized, userId)) {
            log.warn("Cảnh báo trùng lặp: Số CCCD [{}] đã được liên kết với một tài khoản khác trong bảng users", normalized);
            throw new BaseException(ErrorCode.ID_CARD_ALREADY_EXISTS);
        }

        // 2. Kiểm tra trong bảng kyc_documents xem người dùng khác đã nộp số CCCD này chưa
        if (kycDocumentRepository.existsByIdCardNumberAndUserIdNot(normalized, userId)) {
            log.warn("Cảnh báo trùng lặp: Số CCCD [{}] đã tồn tại trong hồ sơ KYC của tài khoản khác", normalized);
            throw new BaseException(ErrorCode.ID_CARD_ALREADY_EXISTS);
        }

        return normalized;
    }

    @Override
    @Transactional
    public KycDocumentResponse uploadSingle(Long userId, MultipartFile file, KycDocumentType documentType, String idCardNumber) {
        if (file == null || file.isEmpty()) {
            throw new BaseException(ErrorCode.FILE_EMPTY);
        }
        if (documentType == null) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Loại tài liệu xác thực không được để trống");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra ràng buộc duy nhất 1 CCCD = 1 tài khoản trước khi lưu
        String normalizedIdCard = validateAndNormalizeIdCardNumber(userId, idCardNumber);

        // Lưu file vào vùng đĩa riêng an toàn
        StoredFileInfo storedInfo = secureStorageService.storeSecureFile(file, KYC_SUBFOLDER);

        // Kiểm tra xem đã có tài liệu cùng loại trước đó chưa
        Optional<KycDocument> existingOpt = kycDocumentRepository.findByUserIdAndDocumentType(userId, documentType);

        KycDocument document;
        if (existingOpt.isPresent()) {
            document = existingOpt.get();
            // Xóa file vật lý cũ trên đĩa để tiết kiệm dung lượng
            secureStorageService.deleteSecureFile(document.getStoragePath());

            document.setFileKey(storedInfo.getFileKey());
            document.setOriginalFilename(storedInfo.getOriginalFilename());
            document.setStoredFilename(storedInfo.getStoredFilename());
            document.setStoragePath(storedInfo.getStoragePath());
            document.setContentType(storedInfo.getContentType());
            document.setFileSize(storedInfo.getFileSize());
            document.setStatus(KycStatus.PENDING);
            document.setRejectionReason(null);
            document.setVerifiedAt(null);
            document.setVerifiedBy(null);
            if (normalizedIdCard != null) {
                document.setIdCardNumber(normalizedIdCard);
            }
        } else {
            document = KycDocument.builder()
                    .user(user)
                    .documentType(documentType)
                    .fileKey(storedInfo.getFileKey())
                    .originalFilename(storedInfo.getOriginalFilename())
                    .storedFilename(storedInfo.getStoredFilename())
                    .storagePath(storedInfo.getStoragePath())
                    .contentType(storedInfo.getContentType())
                    .fileSize(storedInfo.getFileSize())
                    .idCardNumber(normalizedIdCard)
                    .status(KycStatus.PENDING)
                    .build();
        }

        // Đồng bộ số CCCD vào bảng users nếu có cung cấp
        if (normalizedIdCard != null) {
            user.setIdCardNumber(normalizedIdCard);
            userRepository.save(user);
        }

        KycDocument saved = kycDocumentRepository.save(document);
        log.info("Đã lưu an toàn tài liệu KYC [{}] cho người dùng ID [{}] (FileKey: {})",
                documentType, userId, saved.getFileKey());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public KycBundleResponse uploadBundle(Long userId, MultipartFile frontCard, MultipartFile backCard, MultipartFile selfie, String idCardNumber) {
        if (frontCard == null || frontCard.isEmpty() ||
            backCard == null || backCard.isEmpty() ||
            selfie == null || selfie.isEmpty()) {
            throw new BaseException(ErrorCode.KYC_BUNDLE_INCOMPLETE);
        }

        // Validate số CCCD duy nhất ngay từ đầu trước khi xử lý chuỗi 3 tệp
        String normalizedIdCard = validateAndNormalizeIdCardNumber(userId, idCardNumber);

        KycDocumentResponse front = uploadSingle(userId, frontCard, KycDocumentType.ID_CARD_FRONT, normalizedIdCard);
        KycDocumentResponse back = uploadSingle(userId, backCard, KycDocumentType.ID_CARD_BACK, normalizedIdCard);
        KycDocumentResponse self = uploadSingle(userId, selfie, KycDocumentType.SELFIE, normalizedIdCard);

        return KycBundleResponse.builder()
                .frontCard(front)
                .backCard(back)
                .selfie(self)
                .idCardNumber(normalizedIdCard)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<KycDocumentResponse> getMyDocuments(Long userId) {
        List<KycDocument> documents = kycDocumentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return documents.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<KycDocumentResponse> getUserDocuments(Long requesterId, String requesterRole, Long targetUserId) {
        // Kiểm tra quyền xem hồ sơ của người dùng khác
        validateUserViewPermission(requesterId, requesterRole, targetUserId);

        List<KycDocument> documents = kycDocumentRepository.findByUserIdOrderByCreatedAtDesc(targetUserId);
        return documents.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public KycFileResource loadKycFileForView(Long requesterId, String requesterRole, String fileKey) {
        return loadKycFileResource(requesterId, requesterRole, fileKey);
    }

    @Override
    @Transactional(readOnly = true)
    public KycFileResource loadKycFileForDownload(Long requesterId, String requesterRole, String fileKey) {
        return loadKycFileResource(requesterId, requesterRole, fileKey);
    }

    @Override
    @Transactional
    public void deleteDocument(Long userId, KycDocumentType documentType) {
        Optional<KycDocument> docOpt = kycDocumentRepository.findByUserIdAndDocumentType(userId, documentType);
        if (docOpt.isPresent()) {
            KycDocument doc = docOpt.get();
            secureStorageService.deleteSecureFile(doc.getStoragePath());
            kycDocumentRepository.delete(doc);
            log.info("Đã xóa tài liệu KYC [{}] của người dùng ID [{}]", documentType, userId);
        }
    }

    private KycFileResource loadKycFileResource(Long requesterId, String requesterRole, String fileKey) {
        KycDocument document = kycDocumentRepository.findByFileKey(fileKey)
                .orElseThrow(() -> new BaseException(ErrorCode.KYC_DOCUMENT_NOT_FOUND));

        // Kiểm tra quyền truy cập tài liệu nhạy cảm
        validateDocumentAccess(requesterId, requesterRole, document);

        Resource resource = secureStorageService.loadSecureFileAsResource(document.getStoragePath());

        long contentLength = 0;
        try {
            contentLength = resource.contentLength();
        } catch (IOException e) {
            log.warn("Không thể xác định kích thước tệp: {}", document.getStoragePath());
        }

        return KycFileResource.builder()
                .resource(resource)
                .contentType(document.getContentType())
                .originalFilename(document.getOriginalFilename())
                .contentLength(contentLength)
                .build();
    }

    /**
     * Xác thực phân quyền truy cập tài liệu:
     * - Người sở hữu tài liệu (Chính chủ)
     * - Admin toàn hệ thống (ROLE_ADMIN)
     * - Chủ trọ đang quản lý người thuê này (ROLE_LANDLORD)
     */
    private void validateDocumentAccess(Long requesterId, String requesterRole, KycDocument document) {
        Long ownerId = document.getUser().getId();

        // 1. Nếu là chính chủ sở hữu
        if (ownerId.equals(requesterId)) {
            return;
        }

        // 2. Nếu là Admin toàn sàn
        if ("ROLE_ADMIN".equalsIgnoreCase(requesterRole)) {
            return;
        }

        // 3. Nếu là Chủ trọ quản lý khách thuê
        if ("ROLE_LANDLORD".equalsIgnoreCase(requesterRole)) {
            if (isLandlordManagingUser(requesterId, ownerId)) {
                return;
            }
        }

        log.warn("Người dùng ID [{}] (Role: {}) bị từ chối quyền truy cập tài liệu KYC ID [{}] của người dùng ID [{}]",
                requesterId, requesterRole, document.getId(), ownerId);
        throw new BaseException(ErrorCode.KYC_ACCESS_DENIED);
    }

    private void validateUserViewPermission(Long requesterId, String requesterRole, Long targetUserId) {
        if (requesterId.equals(targetUserId)) {
            return;
        }
        if ("ROLE_ADMIN".equalsIgnoreCase(requesterRole)) {
            return;
        }
        if ("ROLE_LANDLORD".equalsIgnoreCase(requesterRole)) {
            if (isLandlordManagingUser(requesterId, targetUserId)) {
                return;
            }
        }
        throw new BaseException(ErrorCode.KYC_ACCESS_DENIED);
    }

    private boolean isLandlordManagingUser(Long landlordId, Long tenantUserId) {
        List<Tenant> tenants = tenantRepository.findAllByUserId(tenantUserId);
        for (Tenant tenant : tenants) {
            if (tenant.getRoom() != null) {
                if (tenant.getRoom().getLandlord() != null && landlordId.equals(tenant.getRoom().getLandlord().getId())) {
                    return true;
                }
                if (tenant.getRoom().getBuilding() != null && landlordId.equals(tenant.getRoom().getBuilding().getLandlord().getId())) {
                    return true;
                }
            }
            if (tenant.getContract() != null && tenant.getContract().getLandlord() != null &&
                landlordId.equals(tenant.getContract().getLandlord().getId())) {
                return true;
            }
        }
        return false;
    }

    private KycDocumentResponse mapToResponse(KycDocument doc) {
        return KycDocumentResponse.builder()
                .id(doc.getId())
                .userId(doc.getUser().getId())
                .documentType(doc.getDocumentType())
                .fileKey(doc.getFileKey())
                .originalFilename(doc.getOriginalFilename())
                .fileSize(doc.getFileSize())
                .contentType(doc.getContentType())
                .idCardNumber(doc.getIdCardNumber())
                .status(doc.getStatus())
                .rejectionReason(doc.getRejectionReason())
                .viewUrl("/api/v1/secure/kyc/view/" + doc.getFileKey())
                .downloadUrl("/api/v1/secure/kyc/download/" + doc.getFileKey())
                .createdAt(doc.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public KycAiVerificationResponse verifyWithAi(
            Long userId,
            MultipartFile frontCard,
            MultipartFile backCard,
            MultipartFile faceFile
    ) {
        return verifyWithAi(userId, frontCard, backCard, faceFile, 100.0);
    }

    @Override
    @Transactional
    public KycAiVerificationResponse verifyWithAi(
            Long userId,
            MultipartFile frontCard,
            MultipartFile backCard,
            MultipartFile faceFile,
            Double livenessScore
    ) {
        if (frontCard == null || frontCard.isEmpty()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Vui lòng tải lên ảnh mặt trước CCCD");
        }
        if (faceFile == null || faceFile.isEmpty()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Vui lòng tải lên video hoặc ảnh khuôn mặt xác nhận");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        double effectiveLiveness = (livenessScore != null) ? livenessScore : 100.0;

        // 1. Gửi sang Python AI Service để quét mã QR CCCD và so khớp khuôn mặt bằng ArcFace + RetinaFace
        KycAiServiceClient.AiVerificationResult aiResult = kycAiServiceClient.callAiVerification(frontCard, faceFile, effectiveLiveness);

        String idCardNumber = null;
        if (aiResult.qrInfo != null && StringUtils.hasText(aiResult.qrInfo.getIdCardNumber())) {
            idCardNumber = aiResult.qrInfo.getIdCardNumber().trim();
        }

        // 2. Kiểm tra tính duy nhất của số CCCD nếu QR đọc thành công
        String normalizedIdCard = null;
        if (idCardNumber != null) {
            normalizedIdCard = validateAndNormalizeIdCardNumber(userId, idCardNumber);
        }

        // 3. Lưu trữ các tệp vào vùng bảo mật an toàn
        KycDocumentResponse frontDoc = uploadSingle(userId, frontCard, KycDocumentType.ID_CARD_FRONT, normalizedIdCard);
        KycDocumentResponse backDoc = null;
        if (backCard != null && !backCard.isEmpty()) {
            backDoc = uploadSingle(userId, backCard, KycDocumentType.ID_CARD_BACK, normalizedIdCard);
        }
        KycDocumentResponse selfieDoc = uploadSingle(userId, faceFile, KycDocumentType.SELFIE, normalizedIdCard);

        // 4. Đánh giá kết quả xác thực theo Cấu hình 3 tầng phân loại (3 Tiers Classification):
        // - Tầng 1: distance < 0.40 -> Tự động duyệt thành công, cấp tick xanh ngay.
        // - Tầng 2: 0.40 <= distance <= 0.55 -> Duyệt nếu bài test người thật (liveness) đạt điểm cao (>= 70%).
        // - Tầng 3: distance > 0.55 -> Báo chụp lại ở nơi đủ sáng hoặc đưa vào hàng đợi kiểm duyệt thủ công.
        double distance = (aiResult.faceInfo != null && aiResult.faceInfo.getDistance() != null)
                ? aiResult.faceInfo.getDistance() : 1.0;
        double threshold = (aiResult.faceInfo != null && aiResult.faceInfo.getThreshold() != null)
                ? aiResult.faceInfo.getThreshold() : 0.68;
        String decisionTier = (aiResult.faceInfo != null && aiResult.faceInfo.getDecisionTier() != null)
                ? aiResult.faceInfo.getDecisionTier() : "MANUAL_REVIEW_OR_RETAKE";
        String faceEmbedding = (aiResult.faceInfo != null) ? aiResult.faceInfo.getFaceEmbedding() : null;

        boolean isApproved = false;
        String message;

        if (distance < 0.40 || "AUTO_APPROVED".equalsIgnoreCase(decisionTier)) {
            // Tầng 1: Tự động phê duyệt
            isApproved = true;
            decisionTier = "AUTO_APPROVED";
            message = String.format("Xác thực danh tính tự động thành công! Khoảng cách vector ArcFace (%.4f < 0.40) đạt chuẩn tuyệt đối. Cấp tick xanh xác minh ngay lập tức.", distance);
        } else if (distance <= 0.55 || "CONDITIONAL_LIVENESS".equalsIgnoreCase(decisionTier)) {
            // Tầng 2: Duyệt có điều kiện Liveness
            decisionTier = "CONDITIONAL_LIVENESS";
            if (effectiveLiveness >= 70.0) {
                isApproved = true;
                message = String.format("Xác thực danh tính thành công! Khoảng cách vector ArcFace (%.4f) an toàn và bài kiểm tra người thật (%.1f%%) đạt chuẩn. Cấp tick xanh xác minh.", distance, effectiveLiveness);
            } else {
                isApproved = false;
                message = String.format("Khoảng cách khuôn mặt (%.4f) khá tốt, tuy nhiên điểm kiểm tra người thật (%.1f%%) chưa đạt chuẩn 70%%. Hồ sơ đã được chuyển vào hàng đợi Quản trị viên duyệt thủ công.", distance, effectiveLiveness);
            }
        } else {
            // Tầng 3: Retake hoặc chuyển Manual Review
            decisionTier = "RETAKE_OR_MANUAL_REVIEW";
            isApproved = false;
            message = String.format("Khoảng cách vector khuôn mặt (%.4f) vượt ngưỡng 0.55. Vui lòng chụp lại ảnh selfie ở nơi đủ sáng, không đeo kính, hoặc hồ sơ sẽ chờ Quản trị viên đối soát thủ công.", distance);
        }

        // 5. Cập nhật hồ sơ người dùng và chuyển trạng thái các tài liệu KYC
        KycStatus targetStatus = isApproved ? KycStatus.VERIFIED : KycStatus.PENDING;

        if (isApproved) {
            user.setIdCardVerified(true);
            if (StringUtils.hasText(faceEmbedding)) {
                user.setFaceEmbedding(faceEmbedding);
            }
            if (aiResult.qrInfo != null) {
                if (StringUtils.hasText(aiResult.qrInfo.getFullName()) && (user.getFullName() == null || user.getFullName().isBlank())) {
                    user.setFullName(aiResult.qrInfo.getFullName());
                }
                if (StringUtils.hasText(aiResult.qrInfo.getDateOfBirth())) {
                    try {
                        user.setDateOfBirth(java.time.LocalDate.parse(aiResult.qrInfo.getDateOfBirth()));
                    } catch (Exception ignored) {
                    }
                }
                if (StringUtils.hasText(aiResult.qrInfo.getGender())) {
                    user.setGender(aiResult.qrInfo.getGender());
                }
            }
            if (normalizedIdCard != null) {
                user.setIdCardNumber(normalizedIdCard);
            }
            userRepository.save(user);
        }

        // Cập nhật metadata chi tiết cho từng tài liệu đã lưu
        updateKycDocumentMetadata(userId, KycDocumentType.ID_CARD_FRONT, targetStatus, decisionTier, distance, effectiveLiveness, faceEmbedding);
        if (backDoc != null) {
            updateKycDocumentMetadata(userId, KycDocumentType.ID_CARD_BACK, targetStatus, decisionTier, distance, effectiveLiveness, null);
        }
        updateKycDocumentMetadata(userId, KycDocumentType.SELFIE, targetStatus, decisionTier, distance, effectiveLiveness, faceEmbedding);

        KycBundleResponse bundleResponse = KycBundleResponse.builder()
                .frontCard(frontDoc)
                .backCard(backDoc)
                .selfie(selfieDoc)
                .idCardNumber(normalizedIdCard)
                .build();

        return KycAiVerificationResponse.builder()
                .overallVerified(isApproved)
                .decisionTier(decisionTier)
                .distance(distance)
                .threshold(threshold)
                .qrInfo(aiResult.qrInfo)
                .faceInfo(aiResult.faceInfo)
                .documents(bundleResponse)
                .message(message)
                .build();
    }

    private void updateKycDocumentMetadata(
            Long userId,
            KycDocumentType type,
            KycStatus status,
            String decisionTier,
            Double distance,
            Double livenessScore,
            String faceEmbedding
    ) {
        kycDocumentRepository.findByUserIdAndDocumentType(userId, type).ifPresent(doc -> {
            doc.setStatus(status);
            doc.setDecisionTier(decisionTier);
            doc.setSimilarityDistance(distance);
            doc.setLivenessScore(livenessScore);
            if (StringUtils.hasText(faceEmbedding)) {
                doc.setFaceEmbedding(faceEmbedding);
            }
            if (status == KycStatus.VERIFIED) {
                doc.setVerifiedAt(LocalDateTime.now());
            }
            kycDocumentRepository.save(doc);
        });
    }

    private void approveKycDocument(Long userId, KycDocumentType type) {
        kycDocumentRepository.findByUserIdAndDocumentType(userId, type).ifPresent(doc -> {
            doc.setStatus(KycStatus.VERIFIED);
            doc.setVerifiedAt(LocalDateTime.now());
            kycDocumentRepository.save(doc);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public QrCccdInfo scanCccdQr(MultipartFile frontCard) {
        if (frontCard == null || frontCard.isEmpty()) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Vui lòng tải lên ảnh mặt trước CCCD");
        }
        return kycAiServiceClient.callScanQr(frontCard);
    }
}

