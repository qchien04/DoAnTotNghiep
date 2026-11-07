package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.room.RoomRequest;
import com.doan.core.business.dto.room.RoomRiskEvaluationResult;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.RoomImage;
import com.doan.core.business.entity.User;
import com.doan.core.business.repository.RoomImageRepository;
import com.doan.core.business.service.impl.RoomRiskScoringServiceImpl;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import com.doan.core.common.util.ContentRiskDetector;
import com.doan.core.common.util.ImageHashUtil;
import com.doan.core.common.util.ImageWatermarkUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomRiskScoringServiceTest {

    @Mock
    private RoomImageRepository roomImageRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private RoomRiskScoringServiceImpl scoringService;

    private RoomRequest baseRequest;

    @BeforeEach
    void setUp() {
        baseRequest = new RoomRequest();
        baseRequest.setName("Phòng trọ cao cấp khép kín");
        baseRequest.setDescription("Phòng sạch đẹp, thoáng mát, đầy đủ tiện nghi.");
        baseRequest.setAddressDetail("Số 10 ngõ 50 Đại Cồ Việt");
        baseRequest.setArea(new BigDecimal("28.0"));
        baseRequest.setFloor(2);
        baseRequest.setMaxCapacity(2);
        baseRequest.setListedPrice(3500000L);
        baseRequest.setStandardDeposit(3500000L);
        baseRequest.setElectricityPrice(3500L);
        baseRequest.setWaterPrice(25000L);
        baseRequest.setIsPublic(true);
        baseRequest.setImageUrls(List.of(
                "https://stayconnect.vn/images/1.jpg",
                "https://stayconnect.vn/images/2.jpg",
                "https://stayconnect.vn/images/3.jpg"
        ));
    }

    @Test
    @DisplayName("BE-01: Yêu cầu tối thiểu 3 ảnh phòng trọ - Ném lỗi nếu ít hơn 3 ảnh")
    void testMinImagesValidation() {
        baseRequest.setImageUrls(List.of(
                "https://stayconnect.vn/images/1.jpg",
                "https://stayconnect.vn/images/2.jpg"
        ));

        BaseException ex = assertThrows(BaseException.class, () ->
                scoringService.evaluateRoomRisk(2L, null, baseRequest));

        assertEquals(ErrorCode.ROOM_MIN_IMAGES_REQUIRED, ex.getErrorCode());
    }

    @Test
    @DisplayName("BE-01: Validate giá điện, nước, cọc bắt buộc phía server")
    void testServerSideValidationPrices() {
        // Giá điện null hoặc < 1000
        baseRequest.setElectricityPrice(null);
        assertThrows(BaseException.class, () ->
                scoringService.evaluateRoomRisk(2L, null, baseRequest));

        baseRequest.setElectricityPrice(3500L);
        baseRequest.setWaterPrice(500L); // Dưới 1000
        assertThrows(BaseException.class, () ->
                scoringService.evaluateRoomRisk(2L, null, baseRequest));

        baseRequest.setWaterPrice(25000L);
        baseRequest.setStandardDeposit(-100000L); // Cọc âm
        assertThrows(BaseException.class, () ->
                scoringService.evaluateRoomRisk(2L, null, baseRequest));
    }

    @Test
    @DisplayName("BE-04: Tin đăng sạch chuẩn (< 30 điểm) -> Tự động duyệt (AUTO_APPROVED)")
    void testTriageAutoApproved() {
        when(roomImageRepository.findImagesOfOtherLandlords(anyLong())).thenReturn(List.of());

        RoomRiskEvaluationResult result = scoringService.evaluateRoomRisk(2L, null, baseRequest);

        assertEquals(0, result.getTotalRiskScore());
        assertEquals("APPROVED", result.getModerationAction());
        assertEquals("AVAILABLE", result.getRoomStatus());
        assertTrue(result.isPublic());
        assertFalse(result.isHasStolenImages());
    }

    @Test
    @DisplayName("BE-05: Phát hiện SĐT trong mô tả -> Cộng 25 điểm rủi ro")
    void testDetectPhoneNumber() {
        when(roomImageRepository.findImagesOfOtherLandlords(anyLong())).thenReturn(List.of());
        baseRequest.setDescription("Phòng đẹp, liên hệ chính chủ: 0987654321 để xem phòng.");

        RoomRiskEvaluationResult result = scoringService.evaluateRoomRisk(2L, null, baseRequest);

        assertTrue(result.getTotalRiskScore() >= 25);
        assertTrue(result.getContentDetection().isHasPhoneNumber());
        assertTrue(result.getContentDetection().getDetectedPhoneNumbers().contains("0987654321"));
    }

    @Test
    @DisplayName("BE-05: Phát hiện Link MXH / Zalo ngoài sàn -> Cộng 30 điểm -> Chờ Admin duyệt (30-60)")
    void testDetectSocialMediaLink() {
        when(roomImageRepository.findImagesOfOtherLandlords(anyLong())).thenReturn(List.of());
        baseRequest.setDescription("Ai cần thuê phòng vui lòng kết bạn qua Zalo: 0912345678 hoặc inbox fb.com/phongtrohn");

        RoomRiskEvaluationResult result = scoringService.evaluateRoomRisk(2L, null, baseRequest);

        assertTrue(result.getTotalRiskScore() >= 30);
        assertTrue(result.getContentDetection().isHasSocialMediaLink());
        // Điểm từ 30 đến 60 rơi vào phân luồng PENDING_REVIEW (Chờ admin)
        assertEquals("PENDING_REVIEW", result.getModerationAction());
        assertFalse(result.isPublic());
    }

    @Test
    @DisplayName("BE-05: Phát hiện STK / Ép cọc giữ phòng -> Điểm > 60 -> Tự động từ chối (REJECTED)")
    void testDetectBankAccountAndDepositFraud() {
        when(roomImageRepository.findImagesOfOtherLandlords(anyLong())).thenReturn(List.of());
        baseRequest.setDescription("Phòng hot nhiều người hỏi, yêu cầu chuyển cọc giữ chỗ trước qua stk 1903456789 VCB, liên hệ zalo 0988776655");

        RoomRiskEvaluationResult result = scoringService.evaluateRoomRisk(2L, null, baseRequest);

        // Có cả SĐT (+25), Link MXH (+30), STK & giục cọc (+40) -> Tổng điểm > 60
        assertTrue(result.getTotalRiskScore() > 60);
        assertEquals("REJECTED", result.getModerationAction());
        assertEquals("STOPPED", result.getRoomStatus());
        assertFalse(result.isPublic());
    }

    @Test
    @DisplayName("BE-07: Phát hiện ảnh chủ trọ A xuất hiện trong tin chủ trọ B -> Khóa tin B ngay lập tức (100 điểm)")
    void testDetectStolenImagesAcrossLandlords() {
        String originalLandlordAHash = "f0e1d2c3b4a59687";

        User landlordA = User.builder().fullName("Chủ trọ Nguyễn Văn A").build();
        landlordA.setId(99L);
        Room roomA = Room.builder().name("Phòng 201 Tòa Nhà Xanh").landlord(landlordA).build();
        roomA.setId(101L);
        RoomImage imageA = RoomImage.builder()
                .id(1L)
                .room(roomA)
                .imageHash(originalLandlordAHash)
                .build();

        // Chủ trọ B (id=2L) gửi ảnh có hash trùng khớp (hoặc Hamming <= 8)
        baseRequest.setImageHashes(List.of(
                "f0e1d2c3b4a59687", // Trùng tuyệt đối Hamming = 0
                "aabbccddeeff0011",
                "1122334455667788"
        ));

        when(roomImageRepository.findImagesOfOtherLandlords(2L)).thenReturn(List.of(imageA));

        RoomRiskEvaluationResult result = scoringService.evaluateRoomRisk(2L, null, baseRequest);

        assertTrue(result.isHasStolenImages());
        assertEquals(100, result.getTotalRiskScore());
        assertEquals("LOCKED_STOLEN_IMAGES", result.getModerationAction());
        assertEquals("STOPPED", result.getRoomStatus());
        assertFalse(result.isPublic());
        assertNotNull(result.getStolenFromRoomInfo());
        assertTrue(result.getStolenFromRoomInfo().contains("Chủ trọ Nguyễn Văn A"));
    }

    @Test
    @DisplayName("BE-02: Tính toán dHash và tính khoảng cách Hamming")
    void testDHashCalculationAndHammingDistance() {
        BufferedImage img1 = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);
        BufferedImage img2 = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);

        String hash1 = ImageHashUtil.computeDHash(img1);
        String hash2 = ImageHashUtil.computeDHash(img2);

        assertNotNull(hash1);
        assertEquals(16, hash1.length());
        // Hai ảnh giống nhau hoàn toàn -> Hamming distance = 0
        assertEquals(0, ImageHashUtil.calculateHammingDistance(hash1, hash2));
        assertTrue(ImageHashUtil.isDuplicate(hash1, hash2));

        // Kiểm tra với chuỗi hash khác biệt
        String differentHash = "0000000000000000";
        String invertedHash = "ffffffffffffffff";
        assertEquals(64, ImageHashUtil.calculateHammingDistance(differentHash, invertedHash));
        assertFalse(ImageHashUtil.isDuplicate(differentHash, invertedHash));
    }

    @Test
    @DisplayName("BE-06: Watermark tự động lên ảnh khi hiển thị")
    void testWatermarkGeneration() throws IOException {
        BufferedImage sampleImage = new BufferedImage(400, 300, BufferedImage.TYPE_INT_RGB);
        byte[] watermarkedBytes = ImageWatermarkUtil.applyWatermark(sampleImage);

        assertNotNull(watermarkedBytes);
        assertTrue(watermarkedBytes.length > 0);
        // Header JPEG: 0xFF, 0xD8
        assertEquals((byte) 0xFF, watermarkedBytes[0]);
        assertEquals((byte) 0xD8, watermarkedBytes[1]);
    }
}
