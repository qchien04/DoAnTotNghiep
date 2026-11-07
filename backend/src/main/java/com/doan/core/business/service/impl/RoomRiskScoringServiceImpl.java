package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.room.RoomRequest;
import com.doan.core.business.dto.room.RoomRiskEvaluationResult;
import com.doan.core.business.entity.RoomImage;
import com.doan.core.business.repository.RoomImageRepository;
import com.doan.core.business.service.RoomRiskScoringService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import com.doan.core.common.util.ContentRiskDetector;
import com.doan.core.common.util.ImageHashUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomRiskScoringServiceImpl implements RoomRiskScoringService {

    private final RoomImageRepository roomImageRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public RoomRiskEvaluationResult evaluateRoomRisk(Long landlordId, Long currentRoomId, RoomRequest request) {
        log.info("Bắt đầu đánh giá điểm rủi ro tin đăng phòng trọ: '{}', landlordId: {}, currentRoomId: {}",
                request.getName(), landlordId, currentRoomId);

        // 1. Kiểm tra xác thực phía máy chủ (Server-side validation bắt buộc)
        if (request.getImageUrls() == null || request.getImageUrls().size() < 3) {
            log.warn("Tin đăng vi phạm số lượng ảnh tối thiểu: {}", request.getImageUrls() != null ? request.getImageUrls().size() : 0);
            throw new BaseException(ErrorCode.ROOM_MIN_IMAGES_REQUIRED);
        }

        if (request.getElectricityPrice() == null || request.getElectricityPrice() < 1000) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Giá điện tiêu thụ bắt buộc tối thiểu 1.000 VNĐ/kWh");
        }

        if (request.getWaterPrice() == null || request.getWaterPrice() < 1000) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Giá nước sinh hoạt bắt buộc tối thiểu 1.000 VNĐ");
        }

        if (request.getStandardDeposit() == null || request.getStandardDeposit() < 0) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Tiền cọc tiêu chuẩn không được để trống hoặc âm");
        }

        int totalRiskScore = 0;
        List<RoomRiskEvaluationResult.RuleViolationDetail> triggeredRules = new ArrayList<>();
        boolean hasStolenImages = false;
        String stolenFromRoomInfo = null;

        // 2. Quét nội dung văn bản (SĐT, Link MXH, STK ngân hàng, cụm từ ép cọc)
        String combinedContent = String.format("%s %s %s",
                request.getName() != null ? request.getName() : "",
                request.getDescription() != null ? request.getDescription() : "",
                request.getAddressDetail() != null ? request.getAddressDetail() : "");

        ContentRiskDetector.DetectionResult detection = ContentRiskDetector.detect(combinedContent);

        // 2.1 Luật: Phát hiện số điện thoại trong nội dung (+25 điểm)
        if (detection.isHasPhoneNumber()) {
            totalRiskScore += 25;
            triggeredRules.add(RoomRiskEvaluationResult.RuleViolationDetail.builder()
                    .ruleCode("RISK_PHONE_DETECTED")
                    .ruleName("Phát hiện số điện thoại trong bài đăng")
                    .penaltyPoints(25)
                    .description("Nội dung chứa SĐT cá nhân: " + String.join(", ", detection.getDetectedPhoneNumbers()) + ". Quy định yêu cầu trao đổi qua ứng dụng.")
                    .build());
        }

        // 2.2 Luật: Phát hiện liên kết mạng xã hội / nhắn tin ngoài (+30 điểm)
        if (detection.isHasSocialMediaLink()) {
            totalRiskScore += 30;
            triggeredRules.add(RoomRiskEvaluationResult.RuleViolationDetail.builder()
                    .ruleCode("RISK_SOCIAL_LINK_DETECTED")
                    .ruleName("Phát hiện link mạng xã hội hoặc lôi kéo ra ngoài")
                    .penaltyPoints(30)
                    .description("Nội dung chứa liên kết mạng xã hội hoặc mời chat ngoài: " + String.join(", ", detection.getDetectedSocialLinks()))
                    .build());
        }

        // 2.3 Luật: Phát hiện số tài khoản ngân hàng hoặc giục cọc gấp (+40 điểm)
        if (detection.isHasBankAccountOrPrepayment()) {
            totalRiskScore += 40;
            String details = "";
            if (!detection.getDetectedBankAccounts().isEmpty()) {
                details += "STK: " + String.join(", ", detection.getDetectedBankAccounts()) + "; ";
            }
            if (!detection.getSuspiciousPhrases().isEmpty()) {
                details += "Từ khóa cọc: " + String.join(", ", detection.getSuspiciousPhrases());
            }
            triggeredRules.add(RoomRiskEvaluationResult.RuleViolationDetail.builder()
                    .ruleCode("RISK_BANK_PREPAY_DETECTED")
                    .ruleName("Phát hiện số tài khoản hoặc yêu cầu cọc chuyển khoản")
                    .penaltyPoints(40)
                    .description("Cảnh báo lừa đảo đặt cọc giữ chỗ: " + details)
                    .build());
        }

        // 3. Quét bất thường về đơn giá, tiền cọc, giá điện/nước
        Long listedPrice = request.getListedPrice() != null ? request.getListedPrice() : 0L;
        Long deposit = request.getStandardDeposit() != null ? request.getStandardDeposit() : 0L;
        Long elec = request.getElectricityPrice() != null ? request.getElectricityPrice() : 0L;
        Long water = request.getWaterPrice() != null ? request.getWaterPrice() : 0L;

        // 3.1 Giá niêm yết quá rẻ bất thường (< 500k VNĐ/tháng) (+30 điểm)
        if (listedPrice > 0 && listedPrice < 500000L) {
            totalRiskScore += 30;
            triggeredRules.add(RoomRiskEvaluationResult.RuleViolationDetail.builder()
                    .ruleCode("RISK_PRICE_TOO_LOW")
                    .ruleName("Giá thuê niêm yết thấp bất thường")
                    .penaltyPoints(30)
                    .description("Giá thuê " + listedPrice + " VNĐ/tháng quá thấp so với mặt bằng chung (nghi vấn tin mồi câu khách)")
                    .build());
        }

        // 3.2 Tiền cọc quá cao (> 3 tháng tiền phòng) (+20 điểm)
        if (listedPrice > 0 && deposit > listedPrice * 3) {
            totalRiskScore += 20;
            triggeredRules.add(RoomRiskEvaluationResult.RuleViolationDetail.builder()
                    .ruleCode("RISK_DEPOSIT_TOO_HIGH")
                    .ruleName("Tiền cọc cao bất thường")
                    .penaltyPoints(20)
                    .description("Tiền cọc " + deposit + " VNĐ vượt quá 3 tháng tiền phòng niêm yết (" + listedPrice + " VNĐ)")
                    .build());
        }

        // 3.3 Tiền cọc bằng 0 (Nghi vấn tin quảng cáo ảo) (+10 điểm)
        if (deposit == 0L) {
            totalRiskScore += 10;
            triggeredRules.add(RoomRiskEvaluationResult.RuleViolationDetail.builder()
                    .ruleCode("RISK_ZERO_DEPOSIT")
                    .ruleName("Không yêu cầu tiền cọc")
                    .penaltyPoints(10)
                    .description("Tin đăng không yêu cầu tiền cọc (thường là tin ảo hoặc dịch vụ quảng cáo ngoài)")
                    .build());
        }

        // 3.4 Giá điện bất thường (< 1.500 hoặc > 6.000 VNĐ/kWh) (+15 điểm)
        if (elec < 1500L) {
            totalRiskScore += 15;
            triggeredRules.add(RoomRiskEvaluationResult.RuleViolationDetail.builder()
                    .ruleCode("RISK_ELEC_TOO_LOW")
                    .ruleName("Giá điện thấp bất thường")
                    .penaltyPoints(15)
                    .description("Giá điện " + elec + " VNĐ/kWh thấp hơn khung giá nhà nước quy định")
                    .build());
        } else if (elec > 6000L) {
            totalRiskScore += 15;
            triggeredRules.add(RoomRiskEvaluationResult.RuleViolationDetail.builder()
                    .ruleCode("RISK_ELEC_TOO_HIGH")
                    .ruleName("Giá điện cao bất thường")
                    .penaltyPoints(15)
                    .description("Giá điện " + elec + " VNĐ/kWh cao vượt ngưỡng thông thường")
                    .build());
        }

        // 3.5 Giá nước bất thường (< 5.000 hoặc > 60.000 VNĐ) (+15 điểm)
        if (water < 5000L) {
            totalRiskScore += 15;
            triggeredRules.add(RoomRiskEvaluationResult.RuleViolationDetail.builder()
                    .ruleCode("RISK_WATER_TOO_LOW")
                    .ruleName("Giá nước thấp bất thường")
                    .penaltyPoints(15)
                    .description("Giá nước " + water + " VNĐ/tháng thấp bất thường")
                    .build());
        } else if (water > 60000L) {
            totalRiskScore += 15;
            triggeredRules.add(RoomRiskEvaluationResult.RuleViolationDetail.builder()
                    .ruleCode("RISK_WATER_TOO_HIGH")
                    .ruleName("Giá nước cao bất thường")
                    .penaltyPoints(15)
                    .description("Giá nước " + water + " VNĐ/tháng cao vượt ngưỡng quy định")
                    .build());
        }

        // 4. Quét mã băm Perceptual Hash (dHash) & Phát hiện trộm/sao chép ảnh của chủ trọ khác
        List<String> inputHashes = new ArrayList<>();
        if (request.getImageHashes() != null && !request.getImageHashes().isEmpty()) {
            inputHashes.addAll(request.getImageHashes());
        }

        // Lấy danh sách ảnh có hash từ các chủ trọ khác trong CSDL
        List<RoomImage> existingImagesOtherLandlords = roomImageRepository.findImagesOfOtherLandlords(landlordId);
        log.info("Đối soát dHash với {} ảnh của các chủ trọ khác trong hệ thống", existingImagesOtherLandlords.size());

        for (String incomingHash : inputHashes) {
            if (incomingHash == null || incomingHash.isBlank()) continue;

            for (RoomImage otherImg : existingImagesOtherLandlords) {
                if (otherImg.getImageHash() == null) continue;

                int hammingDistance = ImageHashUtil.calculateHammingDistance(incomingHash, otherImg.getImageHash());
                if (hammingDistance <= ImageHashUtil.DUPLICATE_HAMMING_THRESHOLD) {
                    // Phát hiện trùng lặp hình ảnh với chủ trọ khác!
                    hasStolenImages = true;
                    Long stolenRoomId = otherImg.getRoom() != null ? otherImg.getRoom().getId() : null;
                    String stolenRoomName = otherImg.getRoom() != null ? otherImg.getRoom().getName() : "Không rõ";
                    String origLandlordName = otherImg.getRoom() != null && otherImg.getRoom().getLandlord() != null
                            ? otherImg.getRoom().getLandlord().getFullName() : "Chủ trọ khác";

                    stolenFromRoomInfo = String.format("Phòng '%s' (ID: %s) của %s", stolenRoomName, stolenRoomId, origLandlordName);

                    log.warn("CẢNH BÁO TRỘM ẢNH: Hash {} trùng với ảnh ID {} của {} (Khoảng cách Hamming: {})",
                            incomingHash, otherImg.getId(), stolenFromRoomInfo, hammingDistance);

                    triggeredRules.add(RoomRiskEvaluationResult.RuleViolationDetail.builder()
                            .ruleCode("VIOLATION_STOLEN_IMAGE")
                            .ruleName("Phát hiện sao chép ảnh của chủ trọ khác")
                            .penaltyPoints(100)
                            .description(String.format("Hình ảnh trùng khớp với %s (Khoảng cách Hamming: %d <= %d). Vi phạm bản quyền hình ảnh.",
                                    stolenFromRoomInfo, hammingDistance, ImageHashUtil.DUPLICATE_HAMMING_THRESHOLD))
                            .build());
                    break;
                }
            }
            if (hasStolenImages) {
                break;
            }
        }

        // 5. Phân luồng kiểm duyệt theo điểm rủi ro:
        // - Trộm ảnh của chủ trọ khác: Khóa tin B ngay lập tức (LOCKED_STOLEN_IMAGES, 100 điểm)
        // - Điểm > 60: Từ chối tin (REJECTED)
        // - Điểm 30 - 60: Chờ Admin duyệt (PENDING_ADMIN_REVIEW)
        // - Điểm < 30: Tự động duyệt (AUTO_APPROVED)
        String moderationAction;
        String roomStatus;
        boolean isPublic;
        String moderationReason;

        String ruleSummary = triggeredRules.stream()
                .map(r -> r.getRuleName() + " (+" + r.getPenaltyPoints() + "đ)")
                .collect(Collectors.joining("; "));

        if (hasStolenImages) {
            totalRiskScore = 100;
            moderationAction = "LOCKED_STOLEN_IMAGES";
            roomStatus = "STOPPED";
            isPublic = false;
            moderationReason = "Hệ thống phát hiện sao chép trái phép hình ảnh từ " + stolenFromRoomInfo + ". Tin đăng đã bị khóa vĩnh viễn do vi phạm bản quyền.";
        } else if (totalRiskScore > 60) {
            moderationAction = "REJECTED";
            roomStatus = "STOPPED";
            isPublic = false;
            moderationReason = "Hệ thống tự động từ chối tin do điểm rủi ro cao (" + totalRiskScore + "/100). Vi phạm: " + ruleSummary;
        } else if (totalRiskScore >= 30) {
            moderationAction = "PENDING_REVIEW";
            roomStatus = "AVAILABLE"; // hoặc hiển thị trong danh sách chủ trọ nhưng chưa public
            isPublic = false;
            moderationReason = "Tin đăng có dấu hiệu nghi ngờ (Điểm rủi ro: " + totalRiskScore + "/100). Chờ Quản trị viên kiểm duyệt: " + ruleSummary;
        } else {
            moderationAction = "APPROVED";
            roomStatus = "AVAILABLE";
            isPublic = request.getIsPublic() == null || Boolean.TRUE.equals(request.getIsPublic());
            moderationReason = "Hệ thống tự động phê duyệt (Điểm rủi ro an toàn: " + totalRiskScore + "/100).";
        }

        RoomRiskEvaluationResult result = RoomRiskEvaluationResult.builder()
                .totalRiskScore(totalRiskScore)
                .moderationAction(moderationAction)
                .roomStatus(roomStatus)
                .isPublic(isPublic)
                .moderationReason(moderationReason)
                .hasStolenImages(hasStolenImages)
                .stolenFromRoomInfo(stolenFromRoomInfo)
                .triggeredRules(triggeredRules)
                .contentDetection(detection)
                .build();

        log.info("Hoàn tất đánh giá phòng '{}': Điểm {}, Hành động: {}, Public: {}",
                request.getName(), totalRiskScore, moderationAction, isPublic);

        return result;
    }
}

