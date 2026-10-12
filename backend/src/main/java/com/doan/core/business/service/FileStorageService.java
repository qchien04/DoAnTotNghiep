package com.doan.core.business.service;

import com.doan.core.business.dto.file.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileStorageService {

    /**
     * Tải lên 1 tệp tin (ảnh phòng, avatar...)
     * @param file tệp tải lên
     * @param subFolder thư mục con phân loại (ví dụ: "rooms", "avatars", "complaints")
     * @return FileUploadResponse chứa đường dẫn URL
     */
    FileUploadResponse storeFile(MultipartFile file, String subFolder);

    /**
     * Tải lên nhiều tệp tin cùng lúc
     * @param files danh sách tệp
     * @param subFolder thư mục con
     * @return danh sách FileUploadResponse
     */
    List<FileUploadResponse> storeMultipleFiles(List<MultipartFile> files, String subFolder);
}
