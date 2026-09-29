package com.doan.core.business.controller.admin;

import com.doan.core.business.entity.LifestyleOption;
import com.doan.core.business.entity.LifestyleQuestion;
import com.doan.core.business.repository.LifestyleOptionRepository;
import com.doan.core.business.repository.LifestyleQuestionRepository;
import com.doan.core.common.data.ResponseData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/admin/master-data", "/api/v1/admin/master-data"})
@RequiredArgsConstructor
@Tag(name = "15. Quản trị viên - Cấu hình Tiêu chí Lối sống (UC 54)", description = "Quản lý câu hỏi khảo sát và tiêu chí lối sống do Admin tạo")
public class AdminMasterDataController {

    private final LifestyleQuestionRepository questionRepository;
    private final LifestyleOptionRepository optionRepository;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LifestyleCriterionDto {
        private String id;
        private String code;
        private String name;
        private String category;
        private String qType;
        private Integer algorithmWeight;
        private List<String> options;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateCriterionRequest {
        private String code;
        private String name;
        private String category;
        private String qType;
        private Integer algorithmWeight;
        private List<String> options;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateCriterionRequest {
        private String name;
        private String category;
        private String qType;
        private Integer algorithmWeight;
        private List<String> options;
        private String status;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách các câu hỏi / tiêu chí lối sống do Admin tạo")
    public ResponseEntity<ResponseData<List<LifestyleCriterionDto>>> getMasterData() {
        List<LifestyleQuestion> questions = questionRepository.findAll();
        questions.sort(Comparator.comparing(q -> q.getSortOrder() != null ? q.getSortOrder() : 0));

        List<LifestyleCriterionDto> result = questions.stream().map(q -> {
            List<String> optionLabels = q.getOptions() != null
                    ? q.getOptions().stream().map(LifestyleOption::getLabel).collect(Collectors.toList())
                    : Collections.emptyList();

            int weightPercent = q.getWeight() != null
                    ? q.getWeight().multiply(BigDecimal.valueOf(10)).intValue()
                    : 10;

            return LifestyleCriterionDto.builder()
                    .id(String.valueOf(q.getId()))
                    .code(q.getCode())
                    .name(q.getLabel())
                    .category(q.getCategory() != null ? q.getCategory() : "HABIT")
                    .qType(q.getQType() != null ? q.getQType() : "SINGLE")
                    .algorithmWeight(weightPercent > 0 ? weightPercent : 10)
                    .options(optionLabels)
                    .status(Boolean.TRUE.equals(q.getIsActive()) ? "ACTIVE" : "DEACTIVATED")
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ResponseData.success(result));
    }

    @PostMapping
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin tạo câu hỏi / tiêu chí lối sống mới")
    public ResponseEntity<ResponseData<LifestyleCriterionDto>> createCriterion(@RequestBody CreateCriterionRequest request) {
        String code = request.getCode() != null && !request.getCode().isBlank()
                ? request.getCode().trim().toUpperCase()
                : "CRIT_" + System.currentTimeMillis();

        BigDecimal weight = request.getAlgorithmWeight() != null
                ? BigDecimal.valueOf(request.getAlgorithmWeight()).divide(BigDecimal.valueOf(10), 2, RoundingMode.HALF_UP)
                : BigDecimal.ONE;

        String qType = request.getQType() != null && !request.getQType().isBlank()
                ? request.getQType().trim().toUpperCase()
                : "SINGLE";

        LifestyleQuestion question = LifestyleQuestion.builder()
                .code(code)
                .label(request.getName() != null ? request.getName().trim() : "Tiêu chí mới")
                .category(request.getCategory() != null ? request.getCategory() : "HABIT")
                .qType(qType)
                .isHard(false)
                .weight(weight)
                .sortOrder(99)
                .isActive(true)
                .options(new ArrayList<>())
                .build();

        LifestyleQuestion saved = questionRepository.save(question);

        List<String> rawOptions = request.getOptions() != null && !request.getOptions().isEmpty()
                ? request.getOptions()
                : List.of("Không", "Có");

        List<LifestyleOption> options = new ArrayList<>();
        int count = rawOptions.size();
        for (int i = 0; i < count; i++) {
            BigDecimal val = count > 1
                    ? BigDecimal.valueOf((double) i / (count - 1)).setScale(3, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            options.add(LifestyleOption.builder()
                    .question(saved)
                    .label(rawOptions.get(i).trim())
                    .value(val)
                    .sortOrder(i + 1)
                    .isActive(true)
                    .build());
        }
        optionRepository.saveAll(options);
        saved.setOptions(options);

        LifestyleCriterionDto dto = LifestyleCriterionDto.builder()
                .id(String.valueOf(saved.getId()))
                .code(saved.getCode())
                .name(saved.getLabel())
                .category(saved.getCategory())
                .qType(saved.getQType())
                .algorithmWeight(request.getAlgorithmWeight() != null ? request.getAlgorithmWeight() : 10)
                .options(rawOptions)
                .status("ACTIVE")
                .build();

        return ResponseEntity.ok(ResponseData.success("Tạo câu hỏi tiêu chí mới thành công!", dto));
    }

    @PutMapping("/{id}")
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin cập nhật câu hỏi / tiêu chí lối sống")
    public ResponseEntity<ResponseData<LifestyleCriterionDto>> updateCriterion(
            @PathVariable Long id,
            @RequestBody UpdateCriterionRequest request) {
        LifestyleQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tiêu chí ID: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            question.setLabel(request.getName().trim());
        }
        if (request.getCategory() != null) {
            question.setCategory(request.getCategory());
        }
        if (request.getQType() != null && !request.getQType().isBlank()) {
            question.setQType(request.getQType().trim().toUpperCase());
        }
        if (request.getAlgorithmWeight() != null) {
            question.setWeight(BigDecimal.valueOf(request.getAlgorithmWeight()).divide(BigDecimal.valueOf(10), 2, RoundingMode.HALF_UP));
        }
        if (request.getStatus() != null) {
            question.setIsActive("ACTIVE".equalsIgnoreCase(request.getStatus()));
        }

        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            optionRepository.deleteAll(question.getOptions());
            List<LifestyleOption> newOptions = new ArrayList<>();
            int count = request.getOptions().size();
            for (int i = 0; i < count; i++) {
                BigDecimal val = count > 1
                        ? BigDecimal.valueOf((double) i / (count - 1)).setScale(3, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;

                newOptions.add(LifestyleOption.builder()
                        .question(question)
                        .label(request.getOptions().get(i).trim())
                        .value(val)
                        .sortOrder(i + 1)
                        .isActive(true)
                        .build());
            }
            optionRepository.saveAll(newOptions);
            question.setOptions(newOptions);
        }

        LifestyleQuestion updated = questionRepository.save(question);

        List<String> optionLabels = updated.getOptions().stream().map(LifestyleOption::getLabel).collect(Collectors.toList());

        LifestyleCriterionDto dto = LifestyleCriterionDto.builder()
                .id(String.valueOf(updated.getId()))
                .code(updated.getCode())
                .name(updated.getLabel())
                .category(updated.getCategory())
                .qType(updated.getQType())
                .algorithmWeight(request.getAlgorithmWeight() != null ? request.getAlgorithmWeight() : 10)
                .options(optionLabels)
                .status(Boolean.TRUE.equals(updated.getIsActive()) ? "ACTIVE" : "DEACTIVATED")
                .build();

        return ResponseEntity.ok(ResponseData.success("Cập nhật tiêu chí thành công!", dto));
    }

    @DeleteMapping("/{id}")
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin vô hiệu hóa câu hỏi / tiêu chí lối sống")
    public ResponseEntity<ResponseData<Void>> deleteCriterion(@PathVariable Long id) {
        LifestyleQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tiêu chí ID: " + id));

        question.setIsActive(false);
        questionRepository.save(question);
        return ResponseEntity.ok(ResponseData.success("Đã vô hiệu hóa tiêu chí thành công!", null));
    }
}
