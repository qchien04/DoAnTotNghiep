package com.doan.core.business.service.impl;

import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.service.EmailService;
import com.doan.core.business.service.OtpService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class InMemoryOtpServiceImpl implements OtpService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    // Bộ lưu trữ OTP tạm thời trong bộ nhớ RAM, tự giải phóng sau 3 phút
    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();

    private static final long OTP_EXPIRATION_SECONDS = 180; // 3 phút
    private static final long RATE_LIMIT_SECONDS = 60;      // 60 giây giữa 2 lần gửi
    private static final int MAX_ATTEMPTS = 5;              // Tối đa 5 lần thử

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    private static class OtpEntry {
        private String otpCode;
        private Instant expiryTime;
        private Instant lastSentTime;
        @Builder.Default
        private AtomicInteger attemptCount = new AtomicInteger(0);

        public boolean isExpired() {
            return Instant.now().isAfter(expiryTime);
        }
    }

    @Override
    public void sendRegistrationOtp(String email) {
        String cleanEmail = email.trim().toLowerCase();

        // 1. Kiểm tra nếu Email đã được tài khoản khác sử dụng
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BaseException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // 2. Chống spam (Rate limiting 60s)
        OtpEntry existingEntry = otpStorage.get(cleanEmail);
        if (existingEntry != null) {
            long secondsSinceLastSent = Duration.between(existingEntry.getLastSentTime(), Instant.now()).getSeconds();
            if (secondsSinceLastSent < RATE_LIMIT_SECONDS) {
                throw new BaseException(ErrorCode.OTP_RATE_LIMITED);
            }
        }

        // 3. Sinh mã OTP 6 chữ số ngẫu nhiên an toàn
        SecureRandom random = new SecureRandom();
        String otpCode = String.format("%06d", random.nextInt(1_000_000));

        // 4. Lưu vào RAM (In-Memory Cache)
        OtpEntry newEntry = OtpEntry.builder()
                .otpCode(otpCode)
                .expiryTime(Instant.now().plusSeconds(OTP_EXPIRATION_SECONDS))
                .lastSentTime(Instant.now())
                .attemptCount(new AtomicInteger(0))
                .build();

        otpStorage.put(cleanEmail, newEntry);
        log.info("Đã tạo mã OTP In-Memory cho email {}: [{}], hạn dùng 3 phút", cleanEmail, otpCode);

        // 5. Gửi mã qua Email
        emailService.sendRegistrationOtp(cleanEmail, otpCode);
    }

    @Override
    public void verifyRegistrationOtp(String email, String otpCode) {
        if (otpCode == null || otpCode.trim().length() != 6) {
            throw new BaseException(ErrorCode.INVALID_OTP);
        }

        String cleanEmail = email.trim().toLowerCase();
        OtpEntry entry = otpStorage.get(cleanEmail);

        if (entry == null || entry.isExpired()) {
            otpStorage.remove(cleanEmail);
            throw new BaseException(ErrorCode.OTP_EXPIRED);
        }

        // Kiểm tra số lần thử sai
        int attempts = entry.getAttemptCount().incrementAndGet();
        if (attempts > MAX_ATTEMPTS) {
            otpStorage.remove(cleanEmail);
            throw new BaseException(ErrorCode.OTP_MAX_ATTEMPTS);
        }

        if (!entry.getOtpCode().equals(otpCode.trim())) {
            throw new BaseException(ErrorCode.INVALID_OTP);
        }

        // Mã đúng: Xóa ngay lập tức khỏi RAM để mã chỉ được sử dụng đúng 1 lần (One-Time)
        otpStorage.remove(cleanEmail);
        log.info("Xác thực OTP đăng ký thành công cho email: {}. Đã giải phóng khỏi RAM.", cleanEmail);
    }

    @Override
    public void sendForgotPasswordOtp(String email) {
        String cleanEmail = email.trim().toLowerCase();

        // 1. Phải tồn tại tài khoản với Email này trong hệ thống
        if (!userRepository.existsByEmail(cleanEmail)) {
            throw new BaseException(ErrorCode.USER_NOT_FOUND);
        }

        String key = "FORGOT:" + cleanEmail;

        // 2. Chống spam (Rate limiting 60s)
        OtpEntry existingEntry = otpStorage.get(key);
        if (existingEntry != null) {
            long secondsSinceLastSent = Duration.between(existingEntry.getLastSentTime(), Instant.now()).getSeconds();
            if (secondsSinceLastSent < RATE_LIMIT_SECONDS) {
                throw new BaseException(ErrorCode.OTP_RATE_LIMITED);
            }
        }

        // 3. Sinh mã OTP 6 chữ số ngẫu nhiên an toàn
        SecureRandom random = new SecureRandom();
        String otpCode = String.format("%06d", random.nextInt(1_000_000));

        // 4. Lưu vào RAM
        OtpEntry newEntry = OtpEntry.builder()
                .otpCode(otpCode)
                .expiryTime(Instant.now().plusSeconds(OTP_EXPIRATION_SECONDS))
                .lastSentTime(Instant.now())
                .attemptCount(new AtomicInteger(0))
                .build();

        otpStorage.put(key, newEntry);
        log.info("Đã tạo mã OTP đặt lại mật khẩu cho email {}: [{}], hạn dùng 3 phút", cleanEmail, otpCode);

        // 5. Gửi mã qua Email
        emailService.sendForgotPasswordOtp(cleanEmail, otpCode);
    }

    @Override
    public void verifyForgotPasswordOtp(String email, String otpCode) {
        if (otpCode == null || otpCode.trim().length() != 6) {
            throw new BaseException(ErrorCode.INVALID_OTP);
        }

        String cleanEmail = email.trim().toLowerCase();
        String key = "FORGOT:" + cleanEmail;
        OtpEntry entry = otpStorage.get(key);

        if (entry == null || entry.isExpired()) {
            otpStorage.remove(key);
            throw new BaseException(ErrorCode.OTP_EXPIRED);
        }

        // Kiểm tra số lần thử sai
        int attempts = entry.getAttemptCount().incrementAndGet();
        if (attempts > MAX_ATTEMPTS) {
            otpStorage.remove(key);
            throw new BaseException(ErrorCode.OTP_MAX_ATTEMPTS);
        }

        if (!entry.getOtpCode().equals(otpCode.trim())) {
            throw new BaseException(ErrorCode.INVALID_OTP);
        }

        // Mã đúng: Xóa ngay lập tức khỏi RAM
        otpStorage.remove(key);
        log.info("Xác thực OTP đặt lại mật khẩu thành công cho email: {}. Đã giải phóng khỏi RAM.", cleanEmail);
    }

    /**
     * Dọn dẹp định kỳ mỗi 60 giây để thu hồi các mã OTP đã quá hạn khỏi RAM
     */
    @Scheduled(fixedRate = 60000)
    public void evictExpiredOtps() {
        otpStorage.entrySet().removeIf(e -> e.getValue().isExpired());
    }
}
