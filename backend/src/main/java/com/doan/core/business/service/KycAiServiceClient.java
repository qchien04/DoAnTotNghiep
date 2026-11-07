package com.doan.core.business.service;

import com.doan.core.business.dto.kyc.FaceVerificationInfo;
import com.doan.core.business.dto.kyc.QrCccdInfo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class KycAiServiceClient {

    @Value("${app.ai-service.url:http://localhost:8001}")
    private String aiServiceUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public static class AiVerificationResult {
        public boolean overallVerified;
        public String decisionTier;
        public Double distance;
        public Double threshold;
        public QrCccdInfo qrInfo;
        public FaceVerificationInfo faceInfo;
    }

    /**
     * Gửi yêu cầu xác thực khuôn mặt DeepFace ArcFace + RetinaFace và giải mã mã QR CCCD sang Python AI Service
     */
    public AiVerificationResult callAiVerification(MultipartFile frontCard, MultipartFile faceFile) {
        return callAiVerification(frontCard, faceFile, 100.0);
    }

    public AiVerificationResult callAiVerification(MultipartFile frontCard, MultipartFile faceFile, Double livenessScore) {
        String targetUrl = aiServiceUrl + "/api/ai/kyc/verify";
        log.info("Đang gọi Python AI Service tại: {} (Liveness score: {})", targetUrl, livenessScore);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            // Đóng gói front_card
            ByteArrayResource frontResource = new ByteArrayResource(frontCard.getBytes()) {
                @Override
                public String getFilename() {
                    return frontCard.getOriginalFilename() != null ? frontCard.getOriginalFilename() : "front_card.jpg";
                }
            };
            body.add("front_card", frontResource);

            // Đóng gói face_file (video hoặc ảnh selfie)
            String rawFaceName = faceFile.getOriginalFilename();
            String determinedFaceName;
            if (rawFaceName != null && !rawFaceName.isBlank()) {
                determinedFaceName = rawFaceName;
            } else {
                String ct = faceFile.getContentType();
                determinedFaceName = (ct != null && ct.contains("video")) ? "face_video.webm" : "face_file.jpg";
            }

            ByteArrayResource faceResource = new ByteArrayResource(faceFile.getBytes()) {
                @Override
                public String getFilename() {
                    return determinedFaceName;
                }
            };
            body.add("face_file", faceResource);
            body.add("model_name", "ArcFace");
            body.add("detector_backend", "retinaface");
            if (livenessScore != null) {
                body.add("liveness_score", String.valueOf(livenessScore));
            }

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(targetUrl, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                boolean success = rootNode.path("success").asBoolean(false);

                if (!success) {
                    String errorMsg = rootNode.path("message").asText("Lỗi xử lý từ Python AI Service");
                    log.warn("Python AI Service trả về lỗi: {}", errorMsg);
                }

                boolean overallVerified = rootNode.path("overall_verified").asBoolean(false);
                String decisionTier = rootNode.path("decision_tier").asText("MANUAL_REVIEW_OR_RETAKE");
                double resDistance = rootNode.path("distance").asDouble(1.0);
                double resThreshold = rootNode.path("threshold").asDouble(0.68);

                // Trích xuất QR result
                JsonNode qrNode = rootNode.path("qr_result");
                QrCccdInfo qrInfo = QrCccdInfo.builder()
                        .qrFound(qrNode.path("qr_found").asBoolean(false))
                        .idCardNumber(qrNode.path("id_card_number").asText(null))
                        .oldCmndNumber(qrNode.path("old_cmnd_number").asText(null))
                        .fullName(qrNode.path("full_name").asText(null))
                        .dateOfBirth(qrNode.path("date_of_birth").asText(null))
                        .gender(qrNode.path("gender").asText(null))
                        .address(qrNode.path("address").asText(null))
                        .issueDate(qrNode.path("issue_date").asText(null))
                        .rawText(qrNode.path("raw_text").asText(null))
                        .message(qrNode.path("message").asText(qrNode.path("qr_found").asBoolean(false) ? "Đã quét thành công mã QR CCCD" : "Không tìm thấy mã QR"))
                        .build();

                // Trích xuất Face result
                JsonNode faceNode = rootNode.path("face_result");
                String faceEmbeddingStr = null;
                JsonNode embArray = faceNode.path("face_embedding");
                if (embArray.isArray() && embArray.size() > 0) {
                    faceEmbeddingStr = embArray.toString();
                }

                FaceVerificationInfo faceInfo = FaceVerificationInfo.builder()
                        .verified(faceNode.path("verified").asBoolean(false))
                        .similarityScore(faceNode.path("similarity_score").asDouble(0.0))
                        .distance(faceNode.path("distance").asDouble(resDistance))
                        .threshold(faceNode.path("threshold").asDouble(resThreshold))
                        .modelName(faceNode.path("model_name").asText("ArcFace"))
                        .detector(faceNode.path("detector").asText("retinaface"))
                        .decisionTier(faceNode.path("decision_tier").asText(decisionTier))
                        .tierDescription(faceNode.path("tier_description").asText(null))
                        .livenessScore(faceNode.path("liveness_score").asDouble(livenessScore != null ? livenessScore : 100.0))
                        .embeddingDim(faceNode.path("embedding_dim").asInt(512))
                        .faceEmbedding(faceEmbeddingStr)
                        .message(faceNode.path("message").asText("Chưa xác thực khuôn mặt"))
                        .build();

                AiVerificationResult result = new AiVerificationResult();
                result.overallVerified = overallVerified;
                result.decisionTier = decisionTier;
                result.distance = resDistance;
                result.threshold = resThreshold;
                result.qrInfo = qrInfo;
                result.faceInfo = faceInfo;
                return result;
            }

        } catch (IOException e) {
            log.error("Lỗi đọc byte tệp hình ảnh khi gửi tới AI service: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Không thể kết nối hoặc lỗi khi gọi Python AI service ({}): {}", targetUrl, e.getMessage());
        }

        // Dự phòng fallback khi Python AI Service chưa chạy hoặc xảy ra lỗi kết nối
        log.warn("Kích hoạt chế độ fallback cho AI Service");
        AiVerificationResult fallback = new AiVerificationResult();
        fallback.overallVerified = false;
        fallback.decisionTier = "MANUAL_REVIEW_OR_RETAKE";
        fallback.distance = 1.0;
        fallback.threshold = 0.68;
        fallback.qrInfo = QrCccdInfo.builder()
                .qrFound(false)
                .message("Không thể kết nối tới dịch vụ phân tích AI (DeepFace/QR). Vui lòng đảm bảo Python AI Service đang chạy trên cổng 8001.")
                .build();
        fallback.faceInfo = FaceVerificationInfo.builder()
                .verified(false)
                .similarityScore(0.0)
                .distance(1.0)
                .threshold(0.68)
                .modelName("ArcFace")
                .detector("retinaface")
                .decisionTier("MANUAL_REVIEW_OR_RETAKE")
                .message("Dịch vụ nhận diện khuôn mặt tạm thời gián đoạn.")
                .build();
        return fallback;
    }

    /**
     * Gửi yêu cầu trích xuất dữ liệu mã QR CCCD sang Python AI Service
     */
    public QrCccdInfo callScanQr(MultipartFile frontCard) {
        String targetUrl = aiServiceUrl + "/api/ai/kyc/scan-qr";
        log.info("Đang gọi quét mã QR CCCD tại: {}", targetUrl);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource frontResource = new ByteArrayResource(frontCard.getBytes()) {
                @Override
                public String getFilename() {
                    return frontCard.getOriginalFilename() != null ? frontCard.getOriginalFilename() : "front_card.jpg";
                }
            };
            body.add("front_card", frontResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(targetUrl, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                boolean success = rootNode.path("success").asBoolean(false);

                if (!success) {
                    String errorMsg = rootNode.path("message").asText("Không thể đọc mã QR từ thẻ CCCD");
                    log.warn("Python AI Service quét QR thất bại: {}", errorMsg);
                }

                JsonNode qrNode = rootNode.path("data");
                return QrCccdInfo.builder()
                        .qrFound(qrNode.path("qr_found").asBoolean(false))
                        .idCardNumber(qrNode.path("id_card_number").asText(null))
                        .oldCmndNumber(qrNode.path("old_cmnd_number").asText(null))
                        .fullName(qrNode.path("full_name").asText(null))
                        .dateOfBirth(qrNode.path("date_of_birth").asText(null))
                        .gender(qrNode.path("gender").asText(null))
                        .address(qrNode.path("address").asText(null))
                        .issueDate(qrNode.path("issue_date").asText(null))
                        .rawText(qrNode.path("raw_text").asText(null))
                        .message(qrNode.path("message").asText(qrNode.path("qr_found").asBoolean(false) ? "Đã quét thành công mã QR CCCD" : "Không tìm thấy mã QR hợp lệ trên thẻ"))
                        .build();
            }
        } catch (Exception e) {
            log.error("Lỗi khi gọi API quét mã QR: {}", e.getMessage());
        }

        return QrCccdInfo.builder()
                .qrFound(false)
                .message("Không thể kết nối đến dịch vụ AI quét mã QR. Vui lòng đảm bảo Python service đang hoạt động.")
                .build();
    }
}
