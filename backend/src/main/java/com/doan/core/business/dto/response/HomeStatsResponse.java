package com.doan.core.business.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu tổng quan hiển thị trên Trang chủ đồ án")
public class HomeStatsResponse {

    @Schema(description = "Tên đề tài đồ án")
    private String projectTitle;

    @Schema(description = "Mô tả đề tài")
    private String description;

    @Schema(description = "Thông tin sinh viên thực hiện")
    private String studentName;

    @Schema(description = "Mã số sinh viên")
    private String studentId;

    @Schema(description = "Giảng viên hướng dẫn")
    private String instructorName;

    @Schema(description = "Trạng thái hệ thống", example = "ONLINE")
    private String systemStatus;

    @Schema(description = "Tổng số người dùng")
    private long totalUsers;

    @Schema(description = "Các tính năng chính của hệ thống")
    private Map<String, String> features;
}
