package com.doan.core.common.data;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Đối tượng nhận tham số phân trang từ Controller
 */
@Data
@Schema(description = "Tham số phân trang")
public class PagingRequest {

    @Schema(description = "Số trang (bắt đầu từ 0)", defaultValue = "0")
    private int page = 0;

    @Schema(description = "Kích thước trang", defaultValue = "10")
    private int size = 10;

    @Schema(description = "Trường sắp xếp", defaultValue = "createdAt")
    private String sortBy = "createdAt";

    @Schema(description = "Hướng sắp xếp (asc hoặc desc)", defaultValue = "desc")
    private String sortDirection = "desc";

    public Pageable toPageable() {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }
}
