package com.doan.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main Application Class cho Hệ Thống Đồ Án Tốt Nghiệp (Mono-service)
 */
@SpringBootApplication
@EnableJpaAuditing
public class CoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoreApplication.class, args);
    }
}
