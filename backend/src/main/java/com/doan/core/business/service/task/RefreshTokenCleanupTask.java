package com.doan.core.business.service.task;

import com.doan.core.business.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Task định kỳ dọn dẹp các Refresh Token đã hết hạn hoặc bị thu hồi (revoked)
 * Giúp tối ưu dung lượng cơ sở dữ liệu và bảo mật hệ thống.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupTask {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Mặc định chạy hàng ngày vào lúc 03:00 sáng.
     * Có thể cấu hình lại qua thuộc tính app.security.token-cleanup-cron trong application.yml
     */
    @Scheduled(cron = "${app.security.token-cleanup-cron:0 0 3 * * ?}")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Bắt đầu tiến trình định kỳ dọn dẹp Refresh Token không còn hiệu lực...");
        try {
            int deleted = refreshTokenRepository.deleteExpiredOrRevokedTokens(Instant.now());
            log.info("Dọn dẹp hoàn tất: Đã xóa {} refresh token hết hạn hoặc đã thu hồi.", deleted);
        } catch (Exception ex) {
            log.error("Lỗi khi dọn dẹp refresh token định kỳ: {}", ex.getMessage(), ex);
        }
    }
}
