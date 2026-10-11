package com.doan.core.business.controller;

import com.doan.core.business.dto.request.LoginRequest;
import com.doan.core.business.dto.request.RefreshTokenRequest;
import com.doan.core.business.dto.request.RegisterRequest;
import com.doan.core.business.dto.response.AuthResponse;
import com.doan.core.business.dto.response.UserDto;
import com.doan.core.business.service.AuthService;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "1. Xác thực (Authentication)", description = "Các API đăng nhập, đăng ký tài khoản, Refresh Token và đăng xuất")
public class AuthController {

    private final AuthService authService;
    private final com.doan.core.business.service.OtpService otpService;

    @PostMapping("/otp/send-register")
    @Operation(summary = "Gửi mã OTP xác thực email đăng ký", description = "Gửi mã OTP 6 số đến email đăng ký tài khoản")
    public ResponseEntity<ResponseData<Void>> sendRegisterOtp(@Valid @RequestBody com.doan.core.business.dto.request.SendOtpRequest request) {
        otpService.sendRegistrationOtp(request.getEmail());
        return ResponseEntity.ok(ResponseData.success("Mã xác thực OTP đã được gửi đến email của bạn", null));
    }

    @PostMapping("/forgot-password/send-otp")
    @Operation(summary = "Gửi mã OTP đặt lại mật khẩu", description = "Gửi mã OTP 6 số đến email để khôi phục mật khẩu tài khoản")
    public ResponseEntity<ResponseData<Void>> sendForgotPasswordOtp(@Valid @RequestBody com.doan.core.business.dto.request.SendOtpRequest request) {
        otpService.sendForgotPasswordOtp(request.getEmail());
        return ResponseEntity.ok(ResponseData.success("Mã xác thực đặt lại mật khẩu đã được gửi đến email của bạn", null));
    }

    @PostMapping("/forgot-password/reset")
    @Operation(summary = "Đặt lại mật khẩu bằng mã OTP", description = "Xác nhận mã OTP và cập nhật mật khẩu mới cho tài khoản")
    public ResponseEntity<ResponseData<Void>> resetPassword(@Valid @RequestBody com.doan.core.business.dto.request.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ResponseData.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới", null));
    }

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationInMs;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống", description = "Trả về JWT Access Token và Refresh Token, đồng thời thiết lập cookie HttpOnly an toàn")
    public ResponseEntity<ResponseData<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        if (StringUtils.hasText(authResponse.getRefreshToken())) {
            addRefreshTokenCookie(response, authResponse.getRefreshToken());
        }
        return ResponseEntity.ok(ResponseData.success("Đăng nhập thành công", authResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới kèm xác thực OTP", description = "Tạo tài khoản mới với vai trò ROLE_TENANT hoặc ROLE_LANDLORD sau khi xác thực OTP email")
    public ResponseEntity<ResponseData<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto createdUser = authService.register(request);
        return ResponseEntity.ok(ResponseData.success("Đăng ký tài khoản thành công", createdUser));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Làm mới Access Token", description = "Gửi Refresh Token qua Body hoặc Cookie HttpOnly để nhận cặp token mới xoay vòng")
    public ResponseEntity<ResponseData<AuthResponse>> refreshToken(
            @RequestBody(required = false) RefreshTokenRequest request,
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            HttpServletResponse response) {
        String token = null;
        if (request != null && StringUtils.hasText(request.getRefreshToken())) {
            token = request.getRefreshToken().trim();
        } else if (StringUtils.hasText(cookieRefreshToken)) {
            token = cookieRefreshToken.trim();
        }

        if (!StringUtils.hasText(token)) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Refresh Token không được để trống (thiếu cả trong request body và cookie)");
        }

        AuthResponse authResponse = authService.refreshToken(new RefreshTokenRequest(token));
        if (StringUtils.hasText(authResponse.getRefreshToken())) {
            addRefreshTokenCookie(response, authResponse.getRefreshToken());
        }
        return ResponseEntity.ok(ResponseData.success("Cấp mới Access Token thành công", authResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất tài khoản", description = "Thu hồi Refresh Token của phiên làm việc và xóa cookie")
    public ResponseEntity<ResponseData<Void>> logout(
            @RequestBody(required = false) RefreshTokenRequest request,
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            HttpServletResponse response) {
        String token = null;
        if (request != null && StringUtils.hasText(request.getRefreshToken())) {
            token = request.getRefreshToken().trim();
        } else if (StringUtils.hasText(cookieRefreshToken)) {
            token = cookieRefreshToken.trim();
        }

        if (token != null) {
            authService.logout(token);
        }
        clearRefreshTokenCookie(response);
        return ResponseEntity.ok(ResponseData.success("Đăng xuất thành công", null));
    }

    @PostMapping("/logout-all")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Đăng xuất khỏi tất cả thiết bị", description = "Thu hồi toàn bộ Refresh Token của tài khoản hiện tại")
    public ResponseEntity<ResponseData<Void>> logoutAll(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal != null) {
            authService.logoutAll(userPrincipal.getId());
        }
        return ResponseEntity.ok(ResponseData.success("Đã đăng xuất khỏi toàn bộ thiết bị", null));
    }

    @PostMapping("/change-password")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Đổi mật khẩu tài khoản", description = "Đổi mật khẩu và thu hồi các phiên đăng nhập khác")
    public ResponseEntity<ResponseData<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody com.doan.core.business.dto.request.ChangePasswordRequest request) {
        if (userPrincipal == null) {
            throw new com.doan.core.common.exception.BaseException(com.doan.core.common.exception.ErrorCode.UNAUTHORIZED);
        }
        authService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Đổi mật khẩu thành công", null));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Lấy thông tin tài khoản hiện tại", description = "Trích xuất thông tin người dùng đang đăng nhập từ JWT")
    public ResponseEntity<ResponseData<UserDto>> getMe(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto userDto = authService.getMe(userPrincipal);
        return ResponseEntity.ok(ResponseData.success(userDto));
    }

    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // False cho môi trường dev HTTP; có thể chuyển true trên HTTPS production
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(Duration.ofMillis(refreshExpirationInMs))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}

