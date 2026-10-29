package com.doan.core.business.service;

import com.doan.core.business.dto.tenant.LifestyleOptionResponse;
import com.doan.core.business.dto.tenant.LifestyleQuestionResponse;

import java.math.BigDecimal;
import java.util.*;

/**
 * Danh mục 15 câu hỏi và các lựa chọn lối sống chuẩn hóa được fix cứng trong mã nguồn Backend.
 * Không cần lưu vào bảng cơ sở dữ liệu để tối ưu hiệu năng và đảm bảo tính nhất quán tuyệt đối
 * với thuật toán so khớp lối sống hai chiều.
 */
public final class LifestyleConstants {

    private LifestyleConstants() {
    }

    public static final List<LifestyleQuestionResponse> QUESTIONS;
    public static final Map<Long, LifestyleQuestionResponse> QUESTIONS_BY_ID;
    public static final Map<Long, LifestyleOptionResponse> OPTIONS_BY_ID;

    static {
        List<LifestyleQuestionResponse> qList = new ArrayList<>();
        Map<Long, LifestyleQuestionResponse> qMap = new HashMap<>();
        Map<Long, LifestyleOptionResponse> oMap = new HashMap<>();

        // 1. CLEAN
        qList.add(createQ(1L, "CLEAN", "Mức độ giữ gìn sạch sẽ, ngăn nắp", "LIVING", "SINGLE", false, "1.50", 1, List.of(
                createO(1L, 1L, "Linh hoạt, thoải mái", "0.000", 1),
                createO(2L, 1L, "Trung bình, định kỳ dọn", "0.333", 2),
                createO(3L, 1L, "Gọn gàng, sạch sẽ", "0.667", 3),
                createO(4L, 1L, "Rất sạch sẽ, ngăn nắp hàng ngày", "1.000", 4)
        )));

        // 2. GUESTS
        qList.add(createQ(2L, "GUESTS", "Quy định tiếp khách / Bạn bè về phòng", "LIVING", "SINGLE", false, "1.20", 2, List.of(
                createO(5L, 2L, "Không dẫn bạn bè về phòng", "0.000", 1),
                createO(6L, 2L, "Hiếm khi / Cần báo trước", "0.333", 2),
                createO(7L, 2L, "Chỉ tiếp bạn cuối tuần", "0.667", 3),
                createO(8L, 2L, "Thoải mái tiếp bạn bè", "1.000", 4)
        )));

        // 3. SLEEP
        qList.add(createQ(3L, "SLEEP", "Giờ giấc đi ngủ ban đêm", "HABIT", "SINGLE", false, "1.20", 3, List.of(
                createO(9L, 3L, "Ngủ sớm trước 22h", "0.000", 1),
                createO(10L, 3L, "Ngủ khoảng 22h - 24h", "0.333", 2),
                createO(11L, 3L, "Ngủ khoảng 24h - 2h sáng", "0.667", 3),
                createO(12L, 3L, "Cú đêm sau 2h sáng", "1.000", 4)
        )));

        // 4. CHORES
        qList.add(createQ(4L, "CHORES", "Ý thức và tần suất dọn dẹp việc nhà", "LIVING", "SINGLE", false, "1.00", 4, List.of(
                createO(13L, 4L, "Hiếm khi dọn dẹp việc nhà", "0.000", 1),
                createO(14L, 4L, "Dọn dẹp định kỳ hàng tuần", "0.500", 2),
                createO(15L, 4L, "Dọn dẹp việc nhà hàng ngày", "1.000", 3)
        )));

        // 5. NOISE_MAKE (MULTI)
        qList.add(createQ(5L, "NOISE_MAKE", "Thói quen phát âm thanh trong phòng", "HABIT", "MULTI", false, "1.00", 5, List.of(
                createO(16L, 5L, "Thích không gian yên tĩnh", "0.000", 1),
                createO(17L, 5L, "Nghe nhạc / Xem phim loa ngoài", "0.250", 2),
                createO(18L, 5L, "Chơi game / Voice chat tối", "0.500", 3),
                createO(19L, 5L, "Thường xuyên gọi điện thoại lâu", "0.750", 4),
                createO(20L, 5L, "Sinh hoạt tự do âm thanh", "1.000", 5)
        )));

        // 6. NOISE_SENSE (MULTI)
        qList.add(createQ(6L, "NOISE_SENSE", "Mức độ nhạy cảm với tiếng ồn & môi trường", "HABIT", "MULTI", false, "1.00", 6, List.of(
                createO(21L, 6L, "Ngủ sâu, không nhạy cảm tiếng ồn", "0.000", 1),
                createO(22L, 6L, "Khó ngủ nếu có ánh sáng", "0.333", 2),
                createO(23L, 6L, "Nhạy cảm âm thanh, tiếng động nhỏ", "0.667", 3),
                createO(24L, 6L, "Nhạy cảm với mùi đồ ăn / khói", "1.000", 4)
        )));

        // 7. WAKE
        qList.add(createQ(7L, "WAKE", "Giờ giấc thức dậy buổi sáng", "HABIT", "SINGLE", false, "0.80", 7, List.of(
                createO(25L, 7L, "Thức dậy sớm trước 6h", "0.000", 1),
                createO(26L, 7L, "Thức dậy khoảng 6h - 8h", "0.333", 2),
                createO(27L, 7L, "Thức dậy khoảng 8h - 10h", "0.667", 3),
                createO(28L, 7L, "Thức dậy muộn sau 10h", "1.000", 4)
        )));

        // 8. WORK (MULTI)
        qList.add(createQ(8L, "WORK", "Hình thức làm việc & học tập", "PERSONAL", "MULTI", false, "0.80", 8, List.of(
                createO(29L, 8L, "Đi học sinh viên theo ca", "0.250", 1),
                createO(30L, 8L, "Đi làm văn phòng giờ hành chính", "0.500", 2),
                createO(31L, 8L, "Làm việc / Học online tại phòng", "0.750", 3),
                createO(32L, 8L, "Làm ca đêm / Lịch làm xoay ca", "1.000", 4)
        )));

        // 9. SOCIAL
        qList.add(createQ(9L, "SOCIAL", "Tính cách & Giao tiếp xã hội", "PERSONAL", "SINGLE", false, "0.80", 9, List.of(
                createO(33L, 9L, "Hướng nội, thích ở một mình", "0.000", 1),
                createO(34L, 9L, "Cân bằng, vui vẻ hòa đồng", "0.500", 2),
                createO(35L, 9L, "Hướng ngoại, thích giao lưu kết nối", "1.000", 3)
        )));

        // 10. SPACE
        qList.add(createQ(10L, "SPACE", "Nhu cầu không gian riêng tư cá nhân", "PERSONAL", "SINGLE", false, "0.80", 10, List.of(
                createO(36L, 10L, "Đề cao không gian riêng tư", "0.000", 1),
                createO(37L, 10L, "Thoải mái chia sẻ không gian chung", "0.500", 2),
                createO(38L, 10L, "Rất thích sinh hoạt chung cùng phòng", "1.000", 3)
        )));

        // 11. WEEKEND (MULTI)
        qList.add(createQ(11L, "WEEKEND", "Thói quen sinh hoạt cuối tuần", "HABIT", "MULTI", false, "0.60", 11, List.of(
                createO(39L, 11L, "Ở phòng nghỉ ngơi, thư giãn", "0.200", 1),
                createO(40L, 11L, "Dành cuối tuần tự học / làm thêm", "0.400", 2),
                createO(41L, 11L, "Đi ra ngoài dạo phố, thể thao", "0.600", 3),
                createO(42L, 11L, "Tụ tập bạn bè, liên hoan cuối tuần", "0.800", 4),
                createO(43L, 11L, "Thường xuyên đi phượt / du lịch xa", "1.000", 5)
        )));

        // 12. MONEY
        qList.add(createQ(12L, "MONEY", "Quan điểm chia sẻ chi phí sinh hoạt", "LIVING", "SINGLE", false, "0.60", 12, List.of(
                createO(44L, 12L, "Chia đều 50-50 mọi chi phí", "1.000", 1),
                createO(45L, 12L, "Linh hoạt theo tình hình thực tế", "0.850", 2),
                createO(46L, 12L, "Tính chi li theo mức độ sử dụng", "0.600", 3)
        )));

        // 13. COOK
        qList.add(createQ(13L, "COOK", "Tần suất tự nấu ăn tại phòng", "LIVING", "SINGLE", false, "0.50", 13, List.of(
                createO(47L, 13L, "Không nấu ăn, chủ yếu ăn ngoài", "0.000", 1),
                createO(48L, 13L, "Thỉnh thoảng nấu ăn nhẹ", "0.500", 2),
                createO(49L, 13L, "Tự nấu ăn hàng ngày tại phòng", "1.000", 3)
        )));

        // 14. AIRCON
        qList.add(createQ(14L, "AIRCON", "Thói quen sử dụng điều hòa nhiệt độ", "LIVING", "SINGLE", false, "0.50", 14, List.of(
                createO(50L, 14L, "Thích bật lạnh sâu (< 24 độ C)", "0.000", 1),
                createO(51L, 14L, "Bật vừa phải (26 - 28 độ C)", "0.500", 2),
                createO(52L, 14L, "Ít bật điều hòa, thích dùng quạt", "1.000", 3)
        )));

        // 15. INTEREST (MULTI)
        qList.add(createQ(15L, "INTEREST", "Sở thích và hoạt động cá nhân", "PERSONAL", "MULTI", false, "0.40", 15, List.of(
                createO(53L, 15L, "Âm nhạc / Phim ảnh", "0.125", 1),
                createO(54L, 15L, "Thể thao / Gym / Chạy bộ", "0.250", 2),
                createO(55L, 15L, "Đọc sách / Học tập", "0.375", 3),
                createO(56L, 15L, "Chơi game / Esport", "0.500", 4),
                createO(57L, 15L, "Nấu ăn / Làm bánh", "0.625", 5),
                createO(58L, 15L, "Du lịch / Phượt", "0.750", 6),
                createO(59L, 15L, "Công nghệ / Lập trình", "0.875", 7),
                createO(60L, 15L, "Nghệ thuật / Hội họa / Nhiếp ảnh", "1.000", 8)
        )));

        for (LifestyleQuestionResponse q : qList) {
            qMap.put(q.getId(), q);
            if (q.getOptions() != null) {
                for (LifestyleOptionResponse o : q.getOptions()) {
                    oMap.put(o.getId(), o);
                }
            }
        }

        QUESTIONS = Collections.unmodifiableList(qList);
        QUESTIONS_BY_ID = Collections.unmodifiableMap(qMap);
        OPTIONS_BY_ID = Collections.unmodifiableMap(oMap);
    }

    private static LifestyleQuestionResponse createQ(
            Long id, String code, String label, String category, String qType,
            boolean isHard, String weight, int sortOrder, List<LifestyleOptionResponse> options) {
        return LifestyleQuestionResponse.builder()
                .id(id)
                .code(code)
                .label(label)
                .category(category)
                .qType(qType)
                .isHard(isHard)
                .weight(new BigDecimal(weight))
                .sortOrder(sortOrder)
                .options(options)
                .build();
    }

    private static LifestyleOptionResponse createO(Long id, Long questionId, String label, String value, int sortOrder) {
        return LifestyleOptionResponse.builder()
                .id(id)
                .questionId(questionId)
                .label(label)
                .value(new BigDecimal(value))
                .sortOrder(sortOrder)
                .build();
    }
}
