package com.doan.core.business.entity;

/**
 * Trạng thái xét duyệt hồ sơ xác thực danh tính
 */
public enum KycStatus {
    PENDING,  // Đang chờ xét duyệt
    VERIFIED, // Đã xác thực thành công
    REJECTED  // Bị từ chối xác thực
}
