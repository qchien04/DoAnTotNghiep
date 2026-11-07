package com.doan.core.business.service;

import com.doan.core.business.dto.kyc.KycBundleResponse;
import com.doan.core.business.dto.kyc.KycDocumentResponse;
import com.doan.core.business.dto.kyc.KycFileResource;
import com.doan.core.business.entity.KycDocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface KycService {

    /**
     * Tải lên một tài liệu xác thực danh tính riêng lẻ (Mặt trước CCCD, Mặt sau CCCD, hoặc Selfie)
     */
    KycDocumentResponse uploadSingle(Long userId, MultipartFile file, KycDocumentType documentType, String idCardNumber);

    /**
     * Tải lên trọn bộ hồ sơ xác thực danh tính (CCCD 2 mặt + Ảnh selfie chân dung)
     */
    KycBundleResponse uploadBundle(Long userId, MultipartFile frontCard, MultipartFile backCard, MultipartFile selfie, String idCardNumber);

    /**
     * Lấy danh sách tài liệu xác thực danh tính của người dùng đang đăng nhập
     */
    List<KycDocumentResponse> getMyDocuments(Long userId);

    /**
     * Xem danh sách tài liệu xác thực danh tính của một người dùng (Dành cho Admin hoặc Chủ trọ quản lý)
     */
    List<KycDocumentResponse> getUserDocuments(Long requesterId, String requesterRole, Long targetUserId);

    /**
     * Lấy tài nguyên file để xem trực tiếp (Có kiểm tra bảo mật phân quyền)
     */
    KycFileResource loadKycFileForView(Long requesterId, String requesterRole, String fileKey);

    /**
     * Lấy tài nguyên file để tải xuống (Có kiểm tra bảo mật phân quyền)
     */
    KycFileResource loadKycFileForDownload(Long requesterId, String requesterRole, String fileKey);

    /**
     * Xóa một tài liệu xác thực danh tính
     */
    void deleteDocument(Long userId, KycDocumentType documentType);

    /**
     * Xác thực danh tính thông minh bằng AI (Quét QR CCCD + So khớp khuôn mặt DeepFace ArcFace + RetinaFace)
     */
    com.doan.core.business.dto.kyc.KycAiVerificationResponse verifyWithAi(
            Long userId,
            MultipartFile frontCard,
            MultipartFile backCard,
            MultipartFile faceFile
    );

    com.doan.core.business.dto.kyc.KycAiVerificationResponse verifyWithAi(
            Long userId,
            MultipartFile frontCard,
            MultipartFile backCard,
            MultipartFile faceFile,
            Double livenessScore
    );

    /**
     * Quét và trích xuất thông tin định danh từ mã QR trên thẻ CCCD
     */
    com.doan.core.business.dto.kyc.QrCccdInfo scanCccdQr(MultipartFile frontCard);
}

