package com.doan.core.business.entity;

/**
 * Trạng thái xét duyệt hồ sơ xác minh chủ trọ
 */
public enum LandlordVerificationStatus {
    UNVERIFIED, // Chưa nộp hồ sơ
    PENDING,    // Đang chờ xét duyệt
    VERIFIED,   // Đã xác thực thành công (Chủ trọ xác minh)
    REJECTED    // Bị từ chối xét duyệt
}

