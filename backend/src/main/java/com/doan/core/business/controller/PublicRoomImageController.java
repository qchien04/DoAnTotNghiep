package com.doan.core.business.controller;

import com.doan.core.business.entity.RoomImage;
import com.doan.core.business.repository.RoomImageRepository;
import com.doan.core.business.service.SecureStorageService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import com.doan.core.common.util.ImageWatermarkUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/api/v1/public/rooms/images")
@RequiredArgsConstructor
@Tag(name = "0. Hình ảnh Phòng trọ có Watermark", description = "Phục vụ truyền luồng ảnh đã tự động đóng dấu Watermark bảo vệ bản quyền StayConnect, ngăn chặn tải ảnh gốc")
public class PublicRoomImageController {

    private final RoomImageRepository roomImageRepository;
    private final SecureStorageService secureStorageService;

    @GetMapping("/file/{fileKey}/watermarked")
    @Operation(summary = "Xem ảnh phòng theo FileKey (Tự động đóng dấu Watermark)", description = "Đọc ảnh từ vùng lưu trữ riêng tư, tự động gắn huy hiệu và watermark chống trộm bản quyền")
    public ResponseEntity<byte[]> getWatermarkedImageByFileKey(@PathVariable String fileKey) {
        log.debug("Yêu cầu xem ảnh watermarked theo fileKey: {}", fileKey);

        RoomImage roomImage = roomImageRepository.findByFileKey(fileKey).orElse(null);
        String storagePath = (roomImage != null && roomImage.getStoragePath() != null)
                ? roomImage.getStoragePath()
                : "rooms/" + fileKey + ".jpg";

        return renderWatermarkedImage(storagePath);
    }

    @GetMapping("/{id}/watermarked")
    @Operation(summary = "Xem ảnh phòng theo Image ID (Tự động đóng dấu Watermark)", description = "Đọc ảnh theo ID và trả về ảnh đã được đóng dấu Watermark bản quyền")
    public ResponseEntity<byte[]> getWatermarkedImageById(@PathVariable Long id) {
        log.debug("Yêu cầu xem ảnh watermarked theo ID: {}", id);

        RoomImage roomImage = roomImageRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.FILE_NOT_FOUND, "Không tìm thấy hình ảnh phòng"));

        String storagePath = roomImage.getStoragePath();
        if (storagePath == null || storagePath.isBlank()) {
            // Trường hợp dữ liệu seed hoặc ảnh từ URL bên ngoài
            if (roomImage.getImageUrl() != null && roomImage.getImageUrl().startsWith("http")) {
                try (InputStream in = new java.net.URI(roomImage.getImageUrl()).toURL().openStream()) {
                    byte[] watermarked = ImageWatermarkUtil.applyWatermark(in);
                    return ResponseEntity.ok()
                            .contentType(MediaType.IMAGE_JPEG)
                            .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                            .body(watermarked);
                } catch (Exception e) {
                    log.error("Không thể tải và watermark ảnh từ URL ngoài: {}", roomImage.getImageUrl(), e);
                    throw new BaseException(ErrorCode.FILE_NOT_FOUND, "Không thể đọc tệp tin hình ảnh");
                }
            }
            throw new BaseException(ErrorCode.FILE_NOT_FOUND, "Đường dẫn tệp tin không tồn tại");
        }

        return renderWatermarkedImage(storagePath);
    }

    private ResponseEntity<byte[]> renderWatermarkedImage(String storagePath) {
        try {
            Resource resource = secureStorageService.loadSecureFileAsResource(storagePath);
            if (!resource.exists() || !resource.isReadable()) {
                log.warn("Không tìm thấy tệp ảnh vật lý tại: {}", storagePath);
                throw new BaseException(ErrorCode.FILE_NOT_FOUND, "Tệp ảnh không tồn tại trên hệ thống");
            }

            byte[] watermarkedBytes;
            try (InputStream is = resource.getInputStream()) {
                watermarkedBytes = ImageWatermarkUtil.applyWatermark(is);
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"watermarked_room.jpg\"")
                    .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                    .body(watermarkedBytes);

        } catch (BaseException be) {
            throw be;
        } catch (Exception e) {
            log.error("Lỗi khi xử lý đóng dấu watermark cho tệp: {}", storagePath, e);
            throw new BaseException(ErrorCode.FILE_STORAGE_ERROR, "Không thể xử lý đóng dấu bản quyền cho ảnh");
        }
    }
}

