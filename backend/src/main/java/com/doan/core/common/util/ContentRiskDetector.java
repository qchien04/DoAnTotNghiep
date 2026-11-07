package com.doan.core.common.util;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Bộ phát hiện rủi ro nội dung tin đăng: Số điện thoại, Link mạng xã hội, Số tài khoản ngân hàng và cụm từ lừa đảo cọc
 */
@Slf4j
public final class ContentRiskDetector {

    private ContentRiskDetector() {}

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetectionResult {
        private boolean hasPhoneNumber;
        @Builder.Default
        private List<String> detectedPhoneNumbers = new ArrayList<>();

        private boolean hasSocialMediaLink;
        @Builder.Default
        private List<String> detectedSocialLinks = new ArrayList<>();

        private boolean hasBankAccountOrPrepayment;
        @Builder.Default
        private List<String> detectedBankAccounts = new ArrayList<>();

        @Builder.Default
        private List<String> suspiciousPhrases = new ArrayList<>();

        public boolean hasAnyRisk() {
            return hasPhoneNumber || hasSocialMediaLink || hasBankAccountOrPrepayment;
        }
    }

    // Pattern nhận diện số điện thoại di động Việt Nam (kể cả viết cách điệu, có dấu chấm, cách, gạch ngang)
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "(?:(?:\\+84|84|0)(?:[\\s.-]?[35789])(?:[\\s.-]?\\d){8})|" +
            "(?:\\b0[35789](?:[\\s.-]?\\d{2}){4}\\b)|" +
            "(?:\\b0[35789](?:[\\s.-]?\\d{3}){2}\\d{2}\\b)",
            Pattern.CASE_INSENSITIVE
    );

    // Pattern nhận diện số điện thoại viết dãn cách chữ số (ví dụ: 0 9 1 2 3 4 5 6 7 8)
    private static final Pattern SPACED_PHONE_PATTERN = Pattern.compile(
            "\\b0(?:\\s+\\d){9}\\b"
    );

    // Pattern nhận diện liên kết mạng xã hội hoặc lời mời chat ngoài sàn
    private static final Pattern SOCIAL_LINK_PATTERN = Pattern.compile(
            "(?:https?://[\\w.-]+(?:facebook|fb|zalo|telegram|t\\.me|tiktok|instagram)[\\w./?=&%-]*)|" +
            "(?:\\b(?:zalo\\.me|fb\\.com|fb\\.me|m\\.me|t\\.me)/[\\w.-]+)|" +
            "(?:\\b(?:kết bạn|add|ib|inbox|liên hệ|nhắn|qua|tìm)\\s+(?:zalo|fb|facebook|tele|telegram)\\b)|" +
            "(?:\\b(?:zalo|zl|tele|fb)\\s*[:=-]\\s*\\w+)",
            Pattern.CASE_INSENSITIVE
    );

    // Pattern nhận diện số tài khoản ngân hàng (dãy 8-16 chữ số kèm ngữ cảnh STK/Ngân hàng)
    private static final Pattern BANK_ACCOUNT_PATTERN = Pattern.compile(
            "(?:(?:stk|số\\s+tài\\s+khoản|số\\s+tk|tài\\s+khoản|ngân\\s+hàng|vcb|vietcombank|techcombank|tcb|mb\\s*bank|mbbank|agribank|bidv|acb|vpbank|tpbank|momo)\\s*[:=-]?\\s*([0-9]{8,18}))|" +
            "(?:([0-9]{9,16})\\s*(?:-\\s*)?(?:vcb|vietcombank|techcombank|mb\\s*bank|agribank|bidv|acb|vpbank|tpbank|momo))",
            Pattern.CASE_INSENSITIVE
    );

    // Các cụm từ rủi ro giục chuyển tiền cọc giữ chỗ trước khi xem phòng
    private static final String[] SUSPICIOUS_DEPOSIT_KEYWORDS = {
            "chuyển cọc", "cọc trước", "đặt cọc trước", "chuyển tiền giữ chỗ",
            "giữ phòng gấp", "chuyển cọc giữ phòng", "cọc xem phòng", "chuyển tiền cọc",
            "đặt cọc ngay", "cọc sớm", "bắn cọc", "bank cọc"
    };

    /**
     * Phân tích nội dung văn bản để phát hiện các yếu tố rủi ro
     */
    public static DetectionResult detect(String text) {
        DetectionResult result = new DetectionResult();
        if (text == null || text.isBlank()) {
            return result;
        }

        String normalizedText = text.trim();

        // 1. Quét số điện thoại
        Matcher phoneMatcher = PHONE_PATTERN.matcher(normalizedText);
        Set<String> phones = new LinkedHashSet<>();
        while (phoneMatcher.find()) {
            String p = phoneMatcher.group().replaceAll("[\\s.-]", "");
            if (p.length() >= 10 && p.length() <= 12) {
                phones.add(phoneMatcher.group().trim());
            }
        }

        Matcher spacedPhoneMatcher = SPACED_PHONE_PATTERN.matcher(normalizedText);
        while (spacedPhoneMatcher.find()) {
            phones.add(spacedPhoneMatcher.group().trim());
        }

        if (!phones.isEmpty()) {
            result.setHasPhoneNumber(true);
            result.setDetectedPhoneNumbers(new ArrayList<>(phones));
        }

        // 2. Quét link MXH và liên hệ ngoài
        Matcher socialMatcher = SOCIAL_LINK_PATTERN.matcher(normalizedText);
        Set<String> socials = new LinkedHashSet<>();
        while (socialMatcher.find()) {
            socials.add(socialMatcher.group().trim());
        }
        if (!socials.isEmpty()) {
            result.setHasSocialMediaLink(true);
            result.setDetectedSocialLinks(new ArrayList<>(socials));
        }

        // 3. Quét số tài khoản ngân hàng
        Matcher bankMatcher = BANK_ACCOUNT_PATTERN.matcher(normalizedText);
        Set<String> banks = new LinkedHashSet<>();
        while (bankMatcher.find()) {
            banks.add(bankMatcher.group().trim());
        }

        // Quét cụm từ ép cọc giữ phòng
        String lowerText = normalizedText.toLowerCase();
        Set<String> suspicious = new LinkedHashSet<>();
        for (String kw : SUSPICIOUS_DEPOSIT_KEYWORDS) {
            if (lowerText.contains(kw)) {
                suspicious.add(kw);
            }
        }

        if (!banks.isEmpty() || !suspicious.isEmpty()) {
            result.setHasBankAccountOrPrepayment(true);
            result.setDetectedBankAccounts(new ArrayList<>(banks));
            result.setSuspiciousPhrases(new ArrayList<>(suspicious));
        }

        return result;
    }
}

