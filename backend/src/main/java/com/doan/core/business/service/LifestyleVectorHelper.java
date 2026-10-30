package com.doan.core.business.service;

import com.doan.core.business.dto.tenant.LifestyleOptionResponse;
import com.doan.core.business.dto.tenant.LifestyleQuestionResponse;
import com.doan.core.business.dto.tenant.UserLifestyleAnswerDto;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class LifestyleVectorHelper {

    /**
     * Sinh chuỗi vector lối sống 15 chiều từ danh sách các lựa chọn được chọn,
     * tự động áp dụng danh mục 15 câu hỏi chuẩn hóa trong LifestyleConstants.
     */
    public String buildVectorFromOptionMap(Map<Long, List<LifestyleOptionResponse>> selectedOptionsByQuestionId) {
        List<LifestyleQuestionResponse> questions = LifestyleConstants.QUESTIONS;
        List<String> values = new ArrayList<>();

        for (LifestyleQuestionResponse q : questions) {
            List<LifestyleOptionResponse> opts = selectedOptionsByQuestionId != null ? selectedOptionsByQuestionId.get(q.getId()) : null;
            if (opts != null && !opts.isEmpty()) {
                if ("MULTI".equalsIgnoreCase(q.getQType())) {
                    // Mã hóa bitmask bảo toàn nguyên vẹn mọi lựa chọn cho các câu hỏi đa lựa chọn (SETS & NOISE)
                    int bitmask = 0;
                    for (LifestyleOptionResponse opt : opts) {
                        if (opt != null && opt.getSortOrder() != null) {
                            bitmask |= (1 << (opt.getSortOrder() - 1));
                        }
                    }
                    values.add(String.format(Locale.US, "%.3f", (double) bitmask));
                } else {
                    LifestyleOptionResponse opt = opts.get(0);
                    if (opt != null && opt.getValue() != null) {
                        values.add(String.format(Locale.US, "%.3f", opt.getValue().doubleValue()));
                    } else {
                        values.add("nan");
                    }
                }
            } else {
                // Không điền giá trị giả tạo nếu câu hỏi bị bỏ trống (Zero Fake Similarity)
                values.add("nan");
            }
        }
        return String.join(",", values);
    }

    /**
     * Sinh vector lối sống từ Map questionId -> optionId
     */
    public String buildVectorFromSingleOptionMap(Map<Long, LifestyleOptionResponse> selectedOptionsByQuestionId) {
        Map<Long, List<LifestyleOptionResponse>> multiMap = new HashMap<>();
        if (selectedOptionsByQuestionId != null) {
            selectedOptionsByQuestionId.forEach((k, v) -> {
                if (v != null) {
                    multiMap.put(k, List.of(v));
                }
            });
        }
        return buildVectorFromOptionMap(multiMap);
    }

    /**
     * Tính điểm tương thích Compatibility Score (0 -> 100%) giữa 2 vector lối sống
     * sử dụng danh mục 15 câu hỏi chuẩn hóa và trọng số trong LifestyleConstants.
     * Áp dụng nguyên tắc: Không tạo độ giống giả, an toàn với NaN và Bayesian Shrinkage.
     * Với câu hỏi MULTI (SETS & NOISE), so khớp bằng khoảng cách Jaccard.
     */
    public int calculateCompatibilityScore(String vectorA, String vectorB) {
        if (vectorA == null || vectorA.isBlank() || vectorB == null || vectorB.isBlank()) {
            return 0; // Không có dữ liệu thì không tạo điểm tương thích giả
        }

        String[] partsA = vectorA.split(",");
        String[] partsB = vectorB.split(",");
        int length = Math.min(partsA.length, partsB.length);
        if (length == 0) return 0;

        List<LifestyleQuestionResponse> questions = LifestyleConstants.QUESTIONS;
        double weightedDiffSum = 0.0;
        double answeredWeight = 0.0;
        double totalQuestionnaireWeight = 0.0;
        boolean hardConstraintViolated = false;

        for (int i = 0; i < length; i++) {
            double weight = 1.0;
            boolean isHard = false;
            LifestyleQuestionResponse q = null;
            if (i < questions.size()) {
                q = questions.get(i);
                weight = q.getWeight() != null ? q.getWeight().doubleValue() : 1.0;
                isHard = Boolean.TRUE.equals(q.getIsHard());
            }
            totalQuestionnaireWeight += weight;

            String sA = partsA[i].trim();
            String sB = partsB[i].trim();
            if (sA.equalsIgnoreCase("nan") || sB.equalsIgnoreCase("nan") || sA.isBlank() || sB.isBlank()) {
                // Câu bỏ trống ở một trong hai phía: BỎ QUA, không điền giá trị giả tạo
                continue;
            }

            try {
                double valA = Double.parseDouble(sA);
                double valB = Double.parseDouble(sB);
                if (Double.isNaN(valA) || Double.isNaN(valB)) {
                    continue;
                }

                double diff;
                boolean isMulti = q != null && "MULTI".equalsIgnoreCase(q.getQType());
                if (isMulti && valA >= 1.0 && valB >= 1.0) {
                    int bmA = (int) Math.round(valA);
                    int bmB = (int) Math.round(valB);
                    int intersection = Integer.bitCount(bmA & bmB);
                    int union = Integer.bitCount(bmA | bmB);
                    double jaccard = union > 0 ? (double) intersection / union : 0.0;
                    diff = 1.0 - jaccard;
                } else {
                    diff = Math.abs(valA - valB);
                }

                weightedDiffSum += diff * weight;
                answeredWeight += weight;

                // Nếu vi phạm tiêu chí cứng gắt gao
                if (isHard && diff >= 0.7) {
                    hardConstraintViolated = true;
                }
            } catch (NumberFormatException ignored) {
            }
        }

        if (answeredWeight <= 0) {
            return 0; // Fail close: Không có câu hỏi chung nào thì không tạo điểm tương thích giả
        }

        double rawCompatibility = 1.0 - (weightedDiffSum / answeredWeight); // [0.0, 1.0]

        // Bayesian Shrinkage: kéo về prior 0.60 theo mức độ khuyết thiếu dữ liệu (1 - coverage)
        double coverage = totalQuestionnaireWeight > 0 ? answeredWeight / totalQuestionnaireWeight : 1.0;
        double kEff = 2.5 * Math.max(0.0, 1.0 - coverage);
        double shrunkScore = (rawCompatibility * answeredWeight + kEff * 0.60) / (answeredWeight + kEff);

        int score = (int) Math.round(shrunkScore * 100);

        if (hardConstraintViolated) {
            score = Math.min(score, 50);
        }

        return Math.max(0, Math.min(score, 99));
    }

    /**
     * Giải mã chuỗi vector 15 chiều thành danh sách UserLifestyleAnswerDto.
     * Đối với câu hỏi MULTI: giải mã bitmask để phục hồi toàn bộ các lựa chọn được chọn.
     * Đối với câu hỏi SINGLE: lấy option có value gần nhất với giá trị vector.
     */
    public List<UserLifestyleAnswerDto> decodeVectorToAnswers(String vector) {
        if (vector == null || vector.isBlank()) {
            return Collections.emptyList();
        }

        List<LifestyleQuestionResponse> questions = LifestyleConstants.QUESTIONS;
        String[] parts = vector.split(",");
        List<UserLifestyleAnswerDto> result = new ArrayList<>();

        for (int i = 0; i < Math.min(parts.length, questions.size()); i++) {
            LifestyleQuestionResponse q = questions.get(i);
            if (q.getOptions() == null || q.getOptions().isEmpty()) continue;

            String s = parts[i].trim();
            if (s.equalsIgnoreCase("nan") || s.isBlank()) {
                continue; // Câu bỏ trống: không decode ra đáp án giả tạo
            }

            try {
                double targetVal = Double.parseDouble(s);
                if (Double.isNaN(targetVal)) continue;

                boolean isMulti = "MULTI".equalsIgnoreCase(q.getQType());
                if (isMulti && targetVal >= 1.0) {
                    int bitmask = (int) Math.round(targetVal);
                    for (LifestyleOptionResponse opt : q.getOptions()) {
                        if (opt.getSortOrder() != null) {
                            int bit = 1 << (opt.getSortOrder() - 1);
                            if ((bitmask & bit) != 0) {
                                result.add(UserLifestyleAnswerDto.builder()
                                        .questionId(q.getId())
                                        .questionCode(q.getCode())
                                        .questionLabel(q.getLabel())
                                        .optionId(opt.getId())
                                        .optionLabel(opt.getLabel())
                                        .optionValue(opt.getValue())
                                        .fromProfile(true)
                                        .build());
                            }
                        }
                    }
                } else {
                    LifestyleOptionResponse bestOpt = q.getOptions().get(0);
                    double minDiff = Math.abs(bestOpt.getValue().doubleValue() - targetVal);

                    for (LifestyleOptionResponse opt : q.getOptions()) {
                        if (opt.getValue() != null) {
                            double diff = Math.abs(opt.getValue().doubleValue() - targetVal);
                            if (diff < minDiff) {
                                minDiff = diff;
                                bestOpt = opt;
                            }
                        }
                    }

                    result.add(UserLifestyleAnswerDto.builder()
                            .questionId(q.getId())
                            .questionCode(q.getCode())
                            .questionLabel(q.getLabel())
                            .optionId(bestOpt.getId())
                            .optionLabel(bestOpt.getLabel())
                            .optionValue(bestOpt.getValue())
                            .fromProfile(true)
                            .build());
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return result;
    }
}


