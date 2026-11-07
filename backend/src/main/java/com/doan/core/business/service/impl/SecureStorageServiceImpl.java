package com.doan.core.business.service.impl;

import com.doan.core.business.dto.kyc.StoredFileInfo;
import com.doan.core.business.service.SecureStorageService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class SecureStorageServiceImpl implements SecureStorageService {

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "video/webm",
            "video/mp4",
            "video/quicktime",
            "video/x-msvideo",
            "video/avi",
            "video/x-matroska",
            "application/octet-stream"
    );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg",
            "jpeg",
            "png",
            "webp",
            "webm",
            "mp4",
            "mov",
            "avi",
            "mkv",
            "bin"
    );

    // Kích thước tối đa cho phép: 50MB (hỗ trợ cả video xác thực khuôn mặt)
    private static final long MAX_FILE_SIZE = 50L * 1024L * 1024L;


    @Value("${app.storage.secure-dir:uploads/secure}")
    private String baseSecureDir;

    private Path baseSecurePath;

    @PostConstruct
    public void init() {
        try {
            this.baseSecurePath = Paths.get(baseSecureDir).toAbsolutePath().normalize();
            Files.createDirectories(this.baseSecurePath);
            log.info("Khởi tạo vùng lưu trữ tệp tin an toàn (Private Secure Storage): {}", this.baseSecurePath);
        } catch (IOException e) {
            log.error("Không thể khởi tạo thư mục lưu trữ an toàn: {}", baseSecureDir, e);
            throw new BaseException(ErrorCode.FILE_STORAGE_ERROR, "Không thể khởi tạo vùng lưu trữ an toàn");
        }
    }

    @Override
    public StoredFileInfo storeSecureFile(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new BaseException(ErrorCode.FILE_EMPTY);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BaseException(ErrorCode.FILE_SIZE_EXCEEDED, "Kích thước tệp vượt quá 50MB");
        }

        String rawOriginalFilename = file.getOriginalFilename();
        String originalFilename = StringUtils.cleanPath(rawOriginalFilename != null ? rawOriginalFilename : "file.jpg");

        // Kiểm tra chống Path Traversal trong tên file gốc
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new BaseException(ErrorCode.INVALID_FILE_TYPE, "Tên tệp tin không hợp lệ");
        }

        String extension = getFileExtension(originalFilename);
        if (extension.isEmpty() || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BaseException(ErrorCode.INVALID_FILE_TYPE, "Định dạng tệp không được hỗ trợ. Vui lòng tải ảnh (JPG, PNG, WEBP) hoặc video xác thực (WEBM, MP4, MOV)");
        }


        String fileKey = UUID.randomUUID().toString();
        String storedFilename = fileKey + "." + extension.toLowerCase();
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        try {
            Path targetFolder = this.baseSecurePath;
            if (StringUtils.hasText(subFolder)) {
                // Làm sạch subFolder và ghép vào base
                String cleanSubFolder = StringUtils.cleanPath(subFolder);
                if (cleanSubFolder.contains("..")) {
                    throw new BaseException(ErrorCode.FILE_STORAGE_ERROR, "Thư mục phụ không hợp lệ");
                }
                targetFolder = this.baseSecurePath.resolve(cleanSubFolder).normalize();
            }

            if (!targetFolder.startsWith(this.baseSecurePath)) {
                throw new BaseException(ErrorCode.FILE_STORAGE_ERROR, "Cảnh báo bảo mật: Đường dẫn tệp vi phạm vùng an toàn");
            }

            Files.createDirectories(targetFolder);

            Path destinationPath = targetFolder.resolve(storedFilename).normalize();
            if (!destinationPath.startsWith(this.baseSecurePath)) {
                throw new BaseException(ErrorCode.FILE_STORAGE_ERROR, "Cảnh báo bảo mật: Đường dẫn đích vi phạm vùng an toàn");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationPath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Lưu đường dẫn tương đối để linh hoạt khi di chuyển thư mục dự án
            String relativeStoragePath = this.baseSecurePath.relativize(destinationPath).toString().replace("\\", "/");

            return StoredFileInfo.builder()
                    .fileKey(fileKey)
                    .originalFilename(originalFilename)
                    .storedFilename(storedFilename)
                    .storagePath(relativeStoragePath)
                    .contentType(contentType)
                    .fileSize(file.getSize())
                    .build();

        } catch (IOException e) {
            log.error("Lỗi khi lưu trữ tệp an toàn: {}", originalFilename, e);
            throw new BaseException(ErrorCode.FILE_STORAGE_ERROR, "Không thể lưu trữ tệp tin trên máy chủ");
        }
    }

    @Override
    public Resource loadSecureFileAsResource(String storagePath) {
        if (!StringUtils.hasText(storagePath)) {
            throw new BaseException(ErrorCode.FILE_NOT_FOUND);
        }

        try {
            Path filePath = this.baseSecurePath.resolve(storagePath).normalize();

            // Chống tấn công Path Traversal
            if (!filePath.startsWith(this.baseSecurePath)) {
                log.warn("Cảnh báo truy cập trái phép ngoài vùng lưu trữ: {}", storagePath);
                throw new BaseException(ErrorCode.FILE_NOT_FOUND, "Không tìm thấy tệp tin");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new BaseException(ErrorCode.FILE_NOT_FOUND, "Tệp tin không tồn tại hoặc không thể đọc");
            }
        } catch (MalformedURLException e) {
            log.error("URL tệp không hợp lệ: {}", storagePath, e);
            throw new BaseException(ErrorCode.FILE_NOT_FOUND);
        }
    }

    @Override
    public boolean deleteSecureFile(String storagePath) {
        if (!StringUtils.hasText(storagePath)) {
            return false;
        }

        try {
            Path filePath = this.baseSecurePath.resolve(storagePath).normalize();
            if (filePath.startsWith(this.baseSecurePath)) {
                return Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            log.warn("Không thể xóa tệp tin an toàn: {}", storagePath, e);
        }
        return false;
    }

    private String getFileExtension(String filename) {
        int lastIndex = filename.lastIndexOf('.');
        if (lastIndex > 0 && lastIndex < filename.length() - 1) {
            return filename.substring(lastIndex + 1);
        }
        return "";
    }
}
