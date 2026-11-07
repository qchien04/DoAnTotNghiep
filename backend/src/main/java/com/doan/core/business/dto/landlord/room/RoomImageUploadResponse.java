package com.doan.core.business.dto.landlord.room;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin ảnh phòng trọ đã tải lên kèm mã băm dHash và đường dẫn watermark an toàn")
public class RoomImageUploadResponse {

    @Schema(description = "Mã định danh bảo mật của tệp tin (File Key)", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    private String fileKey;

    @Schema(description = "Tên tệp gốc khi tải lên", example = "phong_ngu_1.jpg")
    private String originalFilename;

    @Schema(description = "Đường dẫn lưu trữ an toàn trong máy chủ", example = "rooms/a1b2c3d4.jpg")
    private String storagePath;

    @Schema(description = "Đường dẫn hiển thị ảnh đã đóng dấu Watermark chống tải trộm", example = "/api/v1/public/rooms/images/file/a1b2c3d4/watermarked")
    private String watermarkedUrl;

    @Schema(description = "Mã băm Perceptual Hash (dHash 64-bit)", example = "8f3e2a1b9c4d5e6f")
    private String imageHash;

    @Schema(description = "Cờ cảnh báo nếu ảnh bị phát hiện trùng lặp với chủ trọ khác", example = "false")
    private boolean duplicateWithOtherLandlord;

    @Schema(description = "Thông báo chi tiết nếu phát hiện trùng lặp")
    private String duplicateWarningMessage;
}

