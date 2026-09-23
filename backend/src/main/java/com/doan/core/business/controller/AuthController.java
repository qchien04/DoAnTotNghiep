package com.doan.core.business.controller;

import com.doan.core.business.dto.request.LoginRequest;
import com.doan.core.business.dto.request.RefreshTokenRequest;
import com.doan.core.business.dto.request.RegisterRequest;
import com.doan.core.business.dto.response.AuthResponse;
import com.doan.core.business.dto.response.UserDto;
import com.doan.core.business.service.AuthService;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "1. Xác thực (Authentication)", description = "Các API đăng nhập, đăng ký tài khoản, Refresh Token và đăng xuất")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống", description = "Trả về JWT Access Token và Refresh Token cho người dùng")
    public ResponseEntity<ResponseData<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ResponseData.success("Đăng nhập thành công", authResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới", description = "Tạo tài khoản mới với vai trò ROLE_TENANT hoặc ROLE_LANDLORD")
    public ResponseEntity<ResponseData<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto createdUser = authService.register(request);
        return ResponseEntity.ok(ResponseData.success("Đăng ký tài khoản thành công", createdUser));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Làm mới Access Token", description = "Gửi Refresh Token để nhận cặp Access Token mới và Refresh Token xoay vòng")
    public ResponseEntity<ResponseData<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse authResponse = authService.refreshToken(request);
        return ResponseEntity.ok(ResponseData.success("Cấp mới Access Token thành công", authResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất tài khoản", description = "Thu hồi Refresh Token của phiên làm việc")
    public ResponseEntity<ResponseData<Void>> logout(@RequestBody(required = false) RefreshTokenRequest request) {
        if (request != null) {
            authService.logout(request.getRefreshToken());
        }
        return ResponseEntity.ok(ResponseData.success("Đăng xuất thành công", null));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Lấy thông tin tài khoản hiện tại", description = "Trích xuất thông tin người dùng đang đăng nhập từ JWT")
    public ResponseEntity<ResponseData<UserDto>> getMe(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto userDto = authService.getMe(userPrincipal);
        return ResponseEntity.ok(ResponseData.success(userDto));
    }
}
