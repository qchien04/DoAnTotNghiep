package com.doan.core.common.task;

import com.doan.core.business.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupTask {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Dọn dẹp các Refresh Token đã hết hạn hoặc đã bị thu hồi quá 7 ngày
     * Chạy định kỳ lúc 03:00 sáng hàng ngày (cron: 0 0 3 * * ?)
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void purgeOldTokens() {
        log.info("Bắt đầu tiến trình dọn dẹp Refresh Token hết hạn / đã thu hồi trong CSDL...");
        Instant cutoff = Instant.now().minus(7, ChronoUnit.DAYS);
        int deleted = refreshTokenRepository.deleteExpiredOrRevokedBefore(cutoff);
        log.info("Hoàn tất dọn dẹp: Đã xóa {} refresh tokens cũ khỏi hệ thống.", deleted);
    }
}
