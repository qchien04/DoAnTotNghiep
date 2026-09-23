package com.doan.core.common.data;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Định dạng phản hồi phân trang chuẩn
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Đối tượng phản hồi phân trang")
public class PageResponse<T> {

    @Schema(description = "Danh sách phần tử")
    private List<T> items;

    @Schema(description = "Trang hiện tại (0-indexed)", example = "0")
    private int page;

    @Schema(description = "Số phần tử mỗi trang", example = "10")
    private int size;

    @Schema(description = "Tổng số phần tử", example = "100")
    private long totalElements;

    @Schema(description = "Tổng số trang", example = "10")
    private int totalPages;

    @Schema(description = "Có phải trang cuối không")
    private boolean last;

    public static <T> PageResponse<T> from(Page<T> springPage) {
        return PageResponse.<T>builder()
                .items(springPage.getContent())
                .page(springPage.getNumber())
                .size(springPage.getSize())
                .totalElements(springPage.getTotalElements())
                .totalPages(springPage.getTotalPages())
                .last(springPage.isLast())
                .build();
    }
}
