package com.doan.core.business.service;

import com.doan.core.business.dto.kyc.KycFileResource;
import com.doan.core.business.dto.landlord.verification.LandlordVerificationOverviewStats;
import com.doan.core.business.dto.landlord.verification.LandlordVerificationResponse;
import com.doan.core.business.entity.LandlordVerificationStatus;
import com.doan.core.business.entity.LandlordVerificationType;
import com.doan.core.common.data.PageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LandlordVerificationService {

    /**
     * Chủ trọ nộp hồ sơ xác minh kèm các tài liệu (Sổ đỏ / Sổ hồng hoặc Hợp đồng ủy quyền)
     */
    LandlordVerificationResponse submitVerification(Long landlordId,
                                                    LandlordVerificationType verificationType,
                                                    String propertyAddress,
                                                    String documentNumber,
                                                    String notes,
                                                    List<MultipartFile> files);

    /**
     * Lấy trạng thái hồ sơ xác minh mới nhất của chủ trọ đang đăng nhập
     */
    LandlordVerificationResponse getVerificationStatus(Long landlordId);

    /**
     * Tải tệp tin tài liệu an toàn để xem preview (kiểm tra quyền sở hữu hoặc quyền Admin)
     */
    KycFileResource loadDocumentForView(Long requesterId, String requesterRole, String fileKey);

    /**
     * Tải tệp tin tài liệu an toàn để download
     */
    KycFileResource loadDocumentForDownload(Long requesterId, String requesterRole, String fileKey);

    /**
     * Quản trị viên lấy danh sách các hồ sơ xác minh có lọc và phân trang
     */
    PageResponse<LandlordVerificationResponse> getAdminVerifications(LandlordVerificationStatus status,
                                                                    String search,
                                                                    int page,
                                                                    int size);

    /**
     * Quản trị viên xem chi tiết một hồ sơ xác minh
     */
    LandlordVerificationResponse getAdminVerificationDetail(Long verificationId);

    /**
     * Quản trị viên lấy số liệu thống kê tổng quan các hồ sơ xác minh
     */
    LandlordVerificationOverviewStats getOverviewStats();

    /**
     * Quản trị viên phê duyệt hồ sơ xác minh chủ trọ -> Cấp quyền đăng tin và huy hiệu Chủ trọ xác minh
     */
    LandlordVerificationResponse approveVerification(Long adminId, Long verificationId);

    /**
     * Quản trị viên từ chối hồ sơ xác minh chủ trọ kèm lý do phản hồi
     */
    LandlordVerificationResponse rejectVerification(Long adminId, Long verificationId, String reason);
}

