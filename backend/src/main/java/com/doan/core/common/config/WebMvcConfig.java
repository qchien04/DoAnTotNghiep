package com.doan.core.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Cấu hình Static Resource Handlers phục vụ tệp tin tải lên (ảnh phòng trọ, avatar...)
 * và đăng ký Formatter/Converter chuẩn hóa tham số Enum tại tầng Controller.
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private final CaseInsensitiveEnumConverterFactory enumConverterFactory;

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverterFactory(enumConverterFactory);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadUri = uploadPath.toUri().toString();
        if (!uploadUri.endsWith("/")) {
            uploadUri += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadUri);
    }
}
