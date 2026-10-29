package com.doan.core.business.controller.admin;

import com.doan.core.business.dto.tenant.LifestyleOptionResponse;
import com.doan.core.business.dto.tenant.LifestyleQuestionResponse;
import com.doan.core.business.service.LifestyleConstants;
import com.doan.core.common.data.ResponseData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/admin/master-data", "/api/v1/admin/master-data"})
@RequiredArgsConstructor
@Tag(name = "15. Quản trị viên - Cấu hình Tiêu chí Lối sống (UC 54)", description = "Quản lý câu hỏi khảo sát và tiêu chí lối sống do Admin tạo")
public class AdminMasterDataController {

    private final List<LifestyleCriterionDto> criteriaCache = new CopyOnWriteArrayList<>();

    @PostConstruct
    public void init() {
        for (LifestyleQuestionResponse q : LifestyleConstants.QUESTIONS) {
            List<String> optionLabels = q.getOptions() != null
                    ? q.getOptions().stream().map(LifestyleOptionResponse::getLabel).collect(Collectors.toList())
                    : Collections.emptyList();

            int weightPercent = q.getWeight() != null
                    ? q.getWeight().multiply(BigDecimal.valueOf(10)).intValue()
                    : 10;

            criteriaCache.add(LifestyleCriterionDto.builder()
                    .id(String.valueOf(q.getId()))
                    .code(q.getCode())
                    .name(q.getLabel())
                    .category(q.getCategory() != null ? q.getCategory() : "HABIT")
                    .qType(q.getQType() != null ? q.getQType() : "SINGLE")
                    .algorithmWeight(weightPercent > 0 ? weightPercent : 10)
                    .options(optionLabels)
                    .status("ACTIVE")
                    .build());
        }
    }

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
    @Operation(summary = "Lấy danh sách các câu hỏi / tiêu chí lối sống chuẩn hóa 15 chiều")
    public ResponseEntity<ResponseData<List<LifestyleCriterionDto>>> getMasterData() {
        return ResponseEntity.ok(ResponseData.success(new ArrayList<>(criteriaCache)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin tạo câu hỏi / tiêu chí lối sống mới")
    public ResponseEntity<ResponseData<LifestyleCriterionDto>> createCriterion(@RequestBody CreateCriterionRequest request) {
        String code = request.getCode() != null && !request.getCode().isBlank()
                ? request.getCode().trim().toUpperCase()
                : "CRIT_" + System.currentTimeMillis();

        LifestyleCriterionDto dto = LifestyleCriterionDto.builder()
                .id(String.valueOf(System.currentTimeMillis()))
                .code(code)
                .name(request.getName() != null ? request.getName().trim() : "Tiêu chí mới")
                .category(request.getCategory() != null ? request.getCategory() : "HABIT")
                .qType(request.getQType() != null && !request.getQType().isBlank() ? request.getQType().trim().toUpperCase() : "SINGLE")
                .algorithmWeight(request.getAlgorithmWeight() != null ? request.getAlgorithmWeight() : 10)
                .options(request.getOptions() != null && !request.getOptions().isEmpty() ? request.getOptions() : List.of("Không", "Có"))
                .status("ACTIVE")
                .build();

        criteriaCache.add(dto);
        return ResponseEntity.ok(ResponseData.success("Tạo câu hỏi tiêu chí mới thành công!", dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin cập nhật câu hỏi / tiêu chí lối sống")
    public ResponseEntity<ResponseData<LifestyleCriterionDto>> updateCriterion(
            @PathVariable Long id,
            @RequestBody UpdateCriterionRequest request) {
        String idStr = String.valueOf(id);
        for (int i = 0; i < criteriaCache.size(); i++) {
            LifestyleCriterionDto item = criteriaCache.get(i);
            if (idStr.equals(item.getId())) {
                if (request.getName() != null && !request.getName().isBlank()) item.setName(request.getName().trim());
                if (request.getCategory() != null) item.setCategory(request.getCategory());
                if (request.getQType() != null && !request.getQType().isBlank()) item.setQType(request.getQType().trim().toUpperCase());
                if (request.getAlgorithmWeight() != null) item.setAlgorithmWeight(request.getAlgorithmWeight());
                if (request.getStatus() != null) item.setStatus(request.getStatus());
                if (request.getOptions() != null && !request.getOptions().isEmpty()) item.setOptions(request.getOptions());
                return ResponseEntity.ok(ResponseData.success("Cập nhật tiêu chí thành công!", item));
            }
        }

        return ResponseEntity.ok(ResponseData.success("Cập nhật tiêu chí thành công!", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin vô hiệu hóa câu hỏi / tiêu chí lối sống")
    public ResponseEntity<ResponseData<Void>> deleteCriterion(@PathVariable Long id) {
        String idStr = String.valueOf(id);
        for (LifestyleCriterionDto item : criteriaCache) {
            if (idStr.equals(item.getId())) {
                item.setStatus("DEACTIVATED");
                break;
            }
        }
        return ResponseEntity.ok(ResponseData.success("Đã vô hiệu hóa tiêu chí thành công!", null));
    }
}

