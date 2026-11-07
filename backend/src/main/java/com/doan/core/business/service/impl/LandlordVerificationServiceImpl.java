package com.doan.core.business.service.impl;

import com.doan.core.business.dto.kyc.KycFileResource;
import com.doan.core.business.dto.kyc.StoredFileInfo;
import com.doan.core.business.dto.landlord.verification.LandlordVerificationOverviewStats;
import com.doan.core.business.dto.landlord.verification.LandlordVerificationResponse;
import com.doan.core.business.entity.*;
import com.doan.core.business.repository.LandlordVerificationDocumentRepository;
import com.doan.core.business.repository.LandlordVerificationRepository;
import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.service.LandlordVerificationService;
import com.doan.core.business.service.SecureStorageService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordVerificationServiceImpl implements LandlordVerificationService {

    private final LandlordVerificationRepository verificationRepository;
    private final LandlordVerificationDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final SecureStorageService secureStorageService;

    private static final String LANDLORD_DOCS_SUBFOLDER = "landlord_verifications";
    private static final String LANDLORD_API_BASE = "/api/v1/landlord/verification";

    @Override
    @Transactional
    public LandlordVerificationResponse submitVerification(Long landlordId,
                                                           LandlordVerificationType verificationType,
                                                           String propertyAddress,
                                                           String documentNumber,
                                                           String notes,
                                                           List<MultipartFile> files) {
        if (files == null || files.isEmpty() || files.stream().allMatch(MultipartFile::isEmpty)) {
            throw new BaseException(ErrorCode.FILE_EMPTY, "Vui lòng đính kèm ít nhất một ảnh giấy tờ nhà đất hoặc hợp đồng ủy quyền");
        }

        User landlord = userRepository.findById(landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        log.info("Chủ trọ ID [{}] nộp hồ sơ xác minh loại [{}]", landlordId, verificationType);

        // Tạo bản ghi hồ sơ xác minh mới
        LandlordVerification verification = LandlordVerification.builder()
                .user(landlord)
                .verificationType(verificationType)
                .propertyAddress(propertyAddress != null ? propertyAddress.trim() : null)
                .documentNumber(documentNumber != null ? documentNumber.trim() : null)
                .notes(notes != null ? notes.trim() : null)
                .status(LandlordVerificationStatus.PENDING)
                .documents(new ArrayList<>())
                .build();

        LandlordVerification savedVerification = verificationRepository.save(verification);

        // Lưu trữ các file đính kèm an toàn
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;

            StoredFileInfo storedInfo = secureStorageService.storeSecureFile(file, LANDLORD_DOCS_SUBFOLDER);

            LandlordVerificationDocument doc = LandlordVerificationDocument.builder()
                    .verification(savedVerification)
                    .fileKey(storedInfo.getFileKey())
                    .originalFilename(storedInfo.getOriginalFilename())
                    .storedFilename(storedInfo.getStoredFilename())
                    .storagePath(storedInfo.getStoragePath())
                    .contentType(storedInfo.getContentType())
                    .fileSize(storedInfo.getFileSize())
                    .build();

            savedVerification.getDocuments().add(doc);
        }

        savedVerification = verificationRepository.save(savedVerification);

        // Cập nhật trạng thái người dùng
        landlord.setLandlordVerificationStatus(LandlordVerificationStatus.PENDING.name());
        landlord.setLandlordRejectionReason(null);
        userRepository.save(landlord);

        log.info("Đã lưu hồ sơ xác minh ID [{}] với {} tệp tin cho chủ trọ [{}]",
                savedVerification.getId(), savedVerification.getDocuments().size(), landlordId);

        return LandlordVerificationResponse.fromEntity(savedVerification, LANDLORD_API_BASE);
    }

    @Override
    @Transactional(readOnly = true)
    public LandlordVerificationResponse getVerificationStatus(Long landlordId) {
        LandlordVerification verification = verificationRepository
                .findTopByUserIdOrderByCreatedAtDesc(landlordId)
                .orElse(null);

        if (verification == null) {
            User landlord = userRepository.findById(landlordId)
                    .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

            return LandlordVerificationResponse.builder()
                    .userId(landlord.getId())
                    .landlordName(landlord.getFullName())
                    .landlordEmail(landlord.getEmail())
                    .landlordPhone(landlord.getPhone())
                    .landlordAvatarUrl(landlord.getAvatarUrl())
                    .status(Boolean.TRUE.equals(landlord.getLandlordVerified()) ? LandlordVerificationStatus.VERIFIED : LandlordVerificationStatus.UNVERIFIED)
                    .rejectionReason(landlord.getLandlordRejectionReason())
                    .verifiedAt(landlord.getLandlordVerifiedAt())
                    .documents(List.of())
                    .build();
        }

        return LandlordVerificationResponse.fromEntity(verification, LANDLORD_API_BASE);
    }

    @Override
    @Transactional(readOnly = true)
    public KycFileResource loadDocumentForView(Long requesterId, String requesterRole, String fileKey) {
        LandlordVerificationDocument document = documentRepository.findByFileKey(fileKey)
                .orElseThrow(() -> new BaseException(ErrorCode.KYC_DOCUMENT_NOT_FOUND, "Không tìm thấy tệp tin giấy tờ xác minh"));

        // Kiểm tra quyền hạn: Chỉ Admin hoặc chính chủ tài khoản mới được truy cập
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(requesterRole);
        boolean isOwner = document.getVerification().getUser().getId().equals(requesterId);

        if (!isAdmin && !isOwner) {
            log.warn("Truy cập trái phép tệp xác minh: User ID [{}] không sở hữu fileKey [{}]", requesterId, fileKey);
            throw new BaseException(ErrorCode.KYC_ACCESS_DENIED, "Bạn không có quyền truy cập vào tài liệu xác minh này");
        }

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

    @Override
    @Transactional(readOnly = true)
    public KycFileResource loadDocumentForDownload(Long requesterId, String requesterRole, String fileKey) {
        return loadDocumentForView(requesterId, requesterRole, fileKey);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<LandlordVerificationResponse> getAdminVerifications(LandlordVerificationStatus status,
                                                                            String search,
                                                                            int page,
                                                                            int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String keyword = StringUtils.hasText(search) ? search.trim() : null;

        Page<LandlordVerification> pageResult = verificationRepository.searchVerifications(status, keyword, pageRequest);

        List<LandlordVerificationResponse> list = pageResult.getContent().stream()
                .map(v -> LandlordVerificationResponse.fromEntity(v, "/api/v1/admin/verifications"))
                .collect(Collectors.toList());

        return PageResponse.<LandlordVerificationResponse>builder()
                .items(list)
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public LandlordVerificationResponse getAdminVerificationDetail(Long verificationId) {
        LandlordVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new BaseException(ErrorCode.LANDLORD_VERIFICATION_NOT_FOUND));

        return LandlordVerificationResponse.fromEntity(verification, "/api/v1/admin/verifications");
    }

    @Override
    @Transactional(readOnly = true)
    public LandlordVerificationOverviewStats getOverviewStats() {
        long total = verificationRepository.count();
        long pending = verificationRepository.countByStatus(LandlordVerificationStatus.PENDING);
        long verified = verificationRepository.countByStatus(LandlordVerificationStatus.VERIFIED);
        long rejected = verificationRepository.countByStatus(LandlordVerificationStatus.REJECTED);

        return LandlordVerificationOverviewStats.builder()
                .total(total)
                .pending(pending)
                .verified(verified)
                .rejected(rejected)
                .build();
    }

    @Override
    @Transactional
    public LandlordVerificationResponse approveVerification(Long adminId, Long verificationId) {
        LandlordVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new BaseException(ErrorCode.LANDLORD_VERIFICATION_NOT_FOUND));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        log.info("Admin [{}] phê duyệt hồ sơ xác minh ID [{}] cho chủ trọ [{}]",
                adminId, verificationId, verification.getUser().getId());

        LocalDateTime now = LocalDateTime.now();

        verification.setStatus(LandlordVerificationStatus.VERIFIED);
        verification.setVerifiedAt(now);
        verification.setVerifiedBy(admin);
        verification.setRejectionReason(null);
        LandlordVerification saved = verificationRepository.save(verification);

        // Cập nhật người dùng: Gắn cờ và huy hiệu Chủ trọ xác minh
        User landlord = verification.getUser();
        landlord.setLandlordVerified(true);
        landlord.setLandlordVerificationStatus(LandlordVerificationStatus.VERIFIED.name());
        landlord.setLandlordVerifiedAt(now);
        landlord.setLandlordVerifiedBy(admin);
        landlord.setLandlordRejectionReason(null);
        userRepository.save(landlord);

        return LandlordVerificationResponse.fromEntity(saved, "/api/v1/admin/verifications");
    }

    @Override
    @Transactional
    public LandlordVerificationResponse rejectVerification(Long adminId, Long verificationId, String reason) {
        LandlordVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new BaseException(ErrorCode.LANDLORD_VERIFICATION_NOT_FOUND));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        if (!StringUtils.hasText(reason)) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Vui lòng nhập lý do từ chối hồ sơ xác minh");
        }

        log.info("Admin [{}] từ chối hồ sơ xác minh ID [{}] cho chủ trọ [{}]. Lý do: {}",
                adminId, verificationId, verification.getUser().getId(), reason);

        LocalDateTime now = LocalDateTime.now();

        verification.setStatus(LandlordVerificationStatus.REJECTED);
        verification.setRejectionReason(reason.trim());
        verification.setVerifiedAt(now);
        verification.setVerifiedBy(admin);
        LandlordVerification saved = verificationRepository.save(verification);

        // Cập nhật người dùng
        User landlord = verification.getUser();
        landlord.setLandlordVerified(false);
        landlord.setLandlordVerificationStatus(LandlordVerificationStatus.REJECTED.name());
        landlord.setLandlordRejectionReason(reason.trim());
        userRepository.save(landlord);

        return LandlordVerificationResponse.fromEntity(saved, "/api/v1/admin/verifications");
    }
}
