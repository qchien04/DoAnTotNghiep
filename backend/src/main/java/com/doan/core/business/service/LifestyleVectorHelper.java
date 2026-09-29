package com.doan.core.business.service;

import com.doan.core.business.entity.LifestyleOption;
import com.doan.core.business.entity.LifestyleQuestion;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class LifestyleVectorHelper {

    /**
     * Sinh chuỗi vector lối sống từ danh sách các lựa chọn được chọn (hỗ trợ cả SINGLE và MULTI),
     * sắp xếp theo thứ tự câu hỏi (sortOrder).
     * Với câu MULTI có nhiều lựa chọn, lấy giá trị trung bình cộng (average) của các lựa chọn.
     */
    public String buildVectorFromMultiMap(List<LifestyleQuestion> questions, Map<Long, List<LifestyleOption>> selectedOptionsByQuestionId) {
        if (questions == null || questions.isEmpty()) {
            return "0.000,0.500,0.000,0.000,1.000,1.000,0.500,0.500";
        }

        List<String> values = new ArrayList<>();
        for (LifestyleQuestion q : questions) {
            List<LifestyleOption> opts = selectedOptionsByQuestionId.get(q.getId());
            if (opts != null && !opts.isEmpty()) {
                double avg = opts.stream()
                        .filter(o -> o != null && o.getValue() != null)
                        .mapToDouble(o -> o.getValue().doubleValue())
                        .average()
                        .orElse(0.5);
                values.add(String.format(Locale.US, "%.3f", avg));
            } else if (!q.getOptions().isEmpty()) {
                // Mặc định lấy lựa chọn đầu tiên nếu chưa chọn
                values.add(String.format(Locale.US, "%.3f", q.getOptions().get(0).getValue().doubleValue()));
            } else {
                values.add("0.500");
            }
        }
        return String.join(",", values);
    }

    public String buildVector(List<LifestyleQuestion> questions, Map<Long, LifestyleOption> selectedOptionsByQuestionId) {
        Map<Long, List<LifestyleOption>> multiMap = new HashMap<>();
        if (selectedOptionsByQuestionId != null) {
            selectedOptionsByQuestionId.forEach((k, v) -> {
                if (v != null) {
                    multiMap.put(k, List.of(v));
                }
            });
        }
        return buildVectorFromMultiMap(questions, multiMap);
    }

    /**
     * Tính điểm tương thích Compatibility Score (0 -> 100%) giữa 2 vector lối sống.
     * Áp dụng trọng số câu hỏi và kiểm tra tiêu chí cứng (isHard).
     */
    public int calculateCompatibilityScore(String vectorA, String vectorB, List<LifestyleQuestion> questions) {
        if (vectorA == null || vectorA.isBlank() || vectorB == null || vectorB.isBlank()) {
            return 85; // Mặc định an toàn
        }

        String[] partsA = vectorA.split(",");
        String[] partsB = vectorB.split(",");
        int length = Math.min(partsA.length, partsB.length);
        if (length == 0) return 85;

        double weightedDiffSum = 0.0;
        double totalWeight = 0.0;
        boolean hardConstraintViolated = false;

        for (int i = 0; i < length; i++) {
            try {
                double valA = Double.parseDouble(partsA[i].trim());
                double valB = Double.parseDouble(partsB[i].trim());

                double weight = 1.0;
                boolean isHard = false;
                if (questions != null && i < questions.size()) {
                    LifestyleQuestion q = questions.get(i);
                    weight = q.getWeight() != null ? q.getWeight().doubleValue() : 1.0;
                    isHard = Boolean.TRUE.equals(q.getIsHard());
                }

                double diff = Math.abs(valA - valB);
                weightedDiffSum += diff * weight;
                totalWeight += weight;

                // Nếu vi phạm tiêu chí cứng gắt gao (ví dụ hút thuốc 0.0 vs 1.0)
                if (isHard && diff >= 0.8) {
                    hardConstraintViolated = true;
                }
            } catch (NumberFormatException ignored) {
            }
        }

        if (totalWeight <= 0) totalWeight = 1.0;
        double normalizedDiff = weightedDiffSum / totalWeight; // [0.0, 1.0]
        int score = (int) Math.round((1.0 - normalizedDiff) * 100);

        if (hardConstraintViolated) {
            // Hạ trần điểm nếu vi phạm tiêu chí cứng
            score = Math.min(score, 50);
        }

        return Math.max(0, Math.min(score, 99));
    }
}
