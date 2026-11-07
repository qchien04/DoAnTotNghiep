package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.room.RoomRequest;
import com.doan.core.business.dto.room.RoomRiskEvaluationResult;

public interface RoomRiskScoringService {

    /**
     * Đánh giá điểm rủi ro tin đăng phòng trọ theo hệ thống Rule-based:
     * 1. Kiểm tra tính hợp lệ của giá điện, nước, cọc, số lượng ảnh tối thiểu
     * 2. Quét nội dung văn bản tìm SĐT, Link mạng xã hội, STK ngân hàng, cụm từ ép cọc
     * 3. Quét bất thường về đơn giá phòng, tiền cọc, giá điện/nước
     * 4. Tính toán perceptual hash (dHash) & đối soát ảnh trùng lặp giữa các chủ trọ
     * 5. Phân luồng kiểm duyệt:
     *    - < 30: Tự động duyệt (AUTO_APPROVED)
     *    - 30 - 60: Chờ quản trị viên duyệt (PENDING_ADMIN_REVIEW)
     *    - > 60: Tự động từ chối (REJECTED)
     *    - Phát hiện ảnh trùng lặp từ chủ trọ khác: Khóa tin ngay lập tức (LOCKED_STOLEN_IMAGES, 100 điểm)
     */
    RoomRiskEvaluationResult evaluateRoomRisk(Long landlordId, Long currentRoomId, RoomRequest request);
}

