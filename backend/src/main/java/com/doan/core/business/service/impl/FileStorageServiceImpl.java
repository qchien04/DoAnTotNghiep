package com.doan.core.business.service.impl;

import com.doan.core.business.dto.file.FileUploadResponse;
import com.doan.core.business.service.FileStorageService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final long MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif", "svg");

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Override
    public FileUploadResponse storeFile(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new BaseException(ErrorCode.FILE_EMPTY);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BaseException(ErrorCode.FILE_TOO_LARGE);
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "file"));
        String extension = getFileExtension(originalFilename).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BaseException(ErrorCode.FILE_TYPE_INVALID);
        }

        String safeSubFolder = (subFolder != null && !subFolder.isBlank())
                ? subFolder.replaceAll("[^a-zA-Z0-9_-]", "")
                : "general";

        try {
            Path targetFolder = Paths.get(uploadDir, safeSubFolder).toAbsolutePath().normalize();
            if (!Files.exists(targetFolder)) {
                Files.createDirectories(targetFolder);
            }

            String uniqueFileName = UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + "." + extension;
            Path targetFile = targetFolder.resolve(uniqueFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }

            String accessUrl = "/uploads/" + safeSubFolder + "/" + uniqueFileName;
            log.info("Uploaded file successfully: {} -> {}", originalFilename, accessUrl);

            return FileUploadResponse.builder()
                    .url(accessUrl)
                    .fileName(uniqueFileName)
                    .originalFileName(originalFilename)
                    .size(file.getSize())
                    .contentType(file.getContentType())
                    .build();

        } catch (IOException ex) {
            log.error("Failed to store file: {}", originalFilename, ex);
            throw new BaseException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    public List<FileUploadResponse> storeMultipleFiles(List<MultipartFile> files, String subFolder) {
        if (files == null || files.isEmpty()) {
            throw new BaseException(ErrorCode.FILE_EMPTY);
        }

        List<FileUploadResponse> results = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                results.add(storeFile(file, subFolder));
            }
        }
        return results;
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1);
        }
        return "";
    }
}
