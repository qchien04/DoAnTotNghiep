package com.doan.core.business.entity;

/**
 * Định nghĩa phân loại tài liệu xác thực KYC (CCCD mặt trước, mặt sau, ảnh selfie)
 */
public enum KycDocumentType {
    ID_CARD_FRONT, // Ảnh chụp mặt trước CCCD
    ID_CARD_BACK,  // Ảnh chụp mặt sau CCCD
    SELFIE         // Ảnh chân dung selfie xác thực khuôn mặt
}
