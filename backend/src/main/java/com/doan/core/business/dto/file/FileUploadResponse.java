package com.doan.core.business.dto.file;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin kết quả tệp tải lên")
public class FileUploadResponse {

    @Schema(description = "Đường dẫn URL truy cập tệp", example = "/uploads/rooms/abc-xyz.jpg")
    private String url;

    @Schema(description = "Tên tệp đã lưu trên server", example = "abc-xyz.jpg")
    private String fileName;

    @Schema(description = "Tên gốc của tệp khi tải lên", example = "phong-101.jpg")
    private String originalFileName;

    @Schema(description = "Kích thước tệp (bytes)", example = "204800")
    private Long size;

    @Schema(description = "Kiểu định dạng tệp", example = "image/jpeg")
    private String contentType;
}
