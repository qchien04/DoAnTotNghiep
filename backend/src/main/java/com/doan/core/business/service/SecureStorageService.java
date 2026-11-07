package com.doan.core.business.service;

import com.doan.core.business.dto.kyc.StoredFileInfo;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface SecureStorageService {

    /**
     * Lưu trữ an toàn một tệp tin hình ảnh vào vùng riêng tư (không public)
     *
     * @param file Tệp tin tải lên
     * @param subFolder Thư mục con phân loại (ví dụ: "kyc")
     * @return Thông tin tệp tin đã lưu
     */
    StoredFileInfo storeSecureFile(MultipartFile file, String subFolder);

    /**
     * Đọc tệp tin bảo mật thành Resource để truyền stream dữ liệu
     *
     * @param storagePath Đường dẫn lưu trữ tương đối hoặc tuyệt đối
     * @return Resource tệp tin
     */
    Resource loadSecureFileAsResource(String storagePath);

    /**
     * Xóa tệp tin vật lý khỏi đĩa lưu trữ an toàn
     *
     * @param storagePath Đường dẫn tệp tin
     * @return true nếu xóa thành công
     */
    boolean deleteSecureFile(String storagePath);
}
