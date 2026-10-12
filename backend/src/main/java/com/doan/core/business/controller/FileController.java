package com.doan.core.business.controller;

import com.doan.core.business.dto.file.FileUploadResponse;
import com.doan.core.business.service.FileStorageService;
import com.doan.core.common.data.ResponseData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "Tệp & Upload", description = "Các API tải lên tệp tin và hình ảnh hệ thống")
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên 1 tệp tin / hình ảnh", description = "Tải lên hình ảnh phòng trọ, avatar hoặc ảnh sự cố báo hỏng")
    public ResponseEntity<ResponseData<FileUploadResponse>> uploadFile(
            @Parameter(description = "Tệp tin hình ảnh cần tải lên", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Thư mục phân loại (rooms, avatars, complaints...)")
            @RequestParam(value = "folder", defaultValue = "rooms") String folder
    ) {
        FileUploadResponse response = fileStorageService.storeFile(file, folder);
        return ResponseEntity.ok(ResponseData.success("Tải lên tệp thành công", response));
    }

    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên nhiều tệp tin cùng lúc", description = "Tải lên album ảnh phòng trọ thực tế")
    public ResponseEntity<ResponseData<List<FileUploadResponse>>> uploadMultipleFiles(
            @Parameter(description = "Danh sách tệp tin cần tải lên", required = true)
            @RequestParam("files") List<MultipartFile> files,
            @Parameter(description = "Thư mục phân loại (rooms, avatars, complaints...)")
            @RequestParam(value = "folder", defaultValue = "rooms") String folder
    ) {
        List<FileUploadResponse> responses = fileStorageService.storeMultipleFiles(files, folder);
        return ResponseEntity.ok(ResponseData.success("Tải lên " + responses.size() + " tệp thành công", responses));
    }
}
