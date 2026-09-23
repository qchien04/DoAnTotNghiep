package com.doan.core.business.controller;

import com.doan.core.business.dto.response.HomeStatsResponse;
import com.doan.core.business.service.UserService;
import com.doan.core.common.data.ResponseData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/home")
@RequiredArgsConstructor
@Tag(name = "0. Trang Chủ & Thông Tin Đồ Án", description = "Các API công khai phục vụ hiển thị trên Trang chủ")
public class HomeController {

    private final UserService userService;

    @Value("${app.info.title:Hệ Thống Quản Lý Đồ Án Tốt Nghiệp}")
    private String projectTitle;

    @Value("${app.info.author:Sinh Viên Thực Hiện}")
    private String author;

    @GetMapping("/stats")
    @Operation(summary = "Lấy dữ liệu tổng quan trang chủ", description = "Trả về thông tin đề tài, sinh viên, giáo viên và số liệu tổng quan")
    public ResponseEntity<ResponseData<HomeStatsResponse>> getHomeStats() {
        Map<String, String> features = new LinkedHashMap<>();
        features.put("Xác thực & Phân quyền", "Spring Security 6 kết hợp JWT Payload độc lập");
        features.put("Kiến trúc Dịch vụ", "Mono-service tinh gọn, mở rộng module dễ dàng");
        features.put("Frontend Hiện đại", "React 19, TypeScript, Vite, Tailwind CSS, Zustand");
        features.put("Tài liệu hóa API", "Tích hợp Swagger OpenAPI UI tự động");

        HomeStatsResponse response = HomeStatsResponse.builder()
                .projectTitle(projectTitle)
                .description("Hệ thống phần mềm xây dựng theo kiến trúc chuẩn doanh nghiệp phục vụ bảo vệ đồ án tốt nghiệp.")
                .studentName(author)
                .studentId("B20DCCN001")
                .instructorName("TS. Giảng Viên Hướng Dẫn")
                .systemStatus("ONLINE - ỔN ĐỊNH")
                .totalUsers(userService.countUsers())
                .features(features)
                .build();

        return ResponseEntity.ok(ResponseData.success("Lấy thông tin trang chủ thành công", response));
    }
}
