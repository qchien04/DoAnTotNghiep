package com.doan.core.business.service.impl;

import com.doan.core.business.dto.request.LoginRequest;
import com.doan.core.business.dto.request.RefreshTokenRequest;
import com.doan.core.business.dto.request.RegisterRequest;
import com.doan.core.business.dto.response.AuthResponse;
import com.doan.core.business.dto.response.UserDto;
import com.doan.core.business.entity.RefreshToken;
import com.doan.core.business.entity.Role;
import com.doan.core.business.entity.User;
import com.doan.core.business.repository.RefreshTokenRepository;
import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.service.AuthService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import com.doan.core.common.security.JwtTokenProvider;
import com.doan.core.common.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.doan.core.business.service.OtpService otpService;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationInMs;

    @Override
    @Transactional(noRollbackFor = BaseException.class)
    public AuthResponse login(LoginRequest request) {
        log.info("Xử lý đăng nhập cho người dùng: {}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BaseException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BaseException(ErrorCode.INVALID_CREDENTIALS);
        }

        // Tự động giải phóng khóa tài khoản nếu đã quá hạn locked_until
        if ("LOCKED".equalsIgnoreCase(user.getStatus()) && user.getLockedUntil() != null
                && user.getLockedUntil().isBefore(Instant.now())) {
            user.setStatus("ACTIVE");
            user.setLockedUntil(null);
            user.setLockedReason(null);
            userRepository.save(user);
        }

        if (!Boolean.TRUE.equals(user.getEnabled()) || "LOCKED".equalsIgnoreCase(user.getStatus())) {
            throw new BaseException(ErrorCode.USER_DISABLED);
        }

        // 3. Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            int currentAttempts = (user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0) + 1;
            user.setFailedLoginAttempts(currentAttempts);

            if (currentAttempts >= 5) {
                user.setLockedUntil(Instant.now().plus(Duration.ofMinutes(15)));
                user.setLockedReason("Nhập sai mật khẩu 5 lần liên tiếp. Tài khoản tạm khóa 15 phút.");
                userRepository.save(user);
                log.warn("Tài khoản {} đã bị tạm khóa 15 phút do nhập sai 5 lần liên tiếp", user.getUsername());
                throw new BaseException(ErrorCode.ACCOUNT_TEMPORARILY_LOCKED,
                        "Tài khoản đã bị tạm khóa 15 phút do nhập sai mật khẩu 5 lần liên tiếp.");
            }

            userRepository.save(user);
            int remaining = 5 - currentAttempts;
            throw new BaseException(ErrorCode.INVALID_CREDENTIALS,
                    String.format(
                            "Tên đăng nhập hoặc mật khẩu không chính xác. Bạn còn %d lần thử trước khi tài khoản bị tạm khóa.",
                            remaining));
        }

        // 4. Đăng nhập thành công -> Reset bộ đếm số lần sai và mở khóa
        if ((user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0)
                || user.getLockedUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            user.setLockedReason(null);
            userRepository.save(user);
        }

        // Tạo UserPrincipal và phát hành JWT Access Token
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String accessToken = jwtTokenProvider.generateToken(userPrincipal);

        // Thu hồi các refresh token cũ và tạo mới Refresh Token được băm an toàn
        refreshTokenRepository.revokeAllByUserId(user.getId());

        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationInMs)
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Override
    @Transactional
    public UserDto register(RegisterRequest request) {
        log.info("Xử lý đăng ký tài khoản mới: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BaseException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BaseException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Xác thực mã OTP gửi về Email trước khi tạo tài khoản
        otpService.verifyRegistrationOtp(request.getEmail(), request.getOtpCode());

        Role assignRole = request.getRole() != null ? request.getRole() : Role.ROLE_TENANT;
        // Không cho phép đăng ký trực tiếp role ADMIN qua public endpoint
        if (assignRole == Role.ROLE_ADMIN) {
            assignRole = Role.ROLE_TENANT;
        }

        User newUser = User.builder()
                .username(request.getUsername().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .role(assignRole)
                .status("ACTIVE")
                .enabled(true)
                .failedLoginAttempts(0)
                .build();

        User savedUser = userRepository.save(newUser);
        return UserDto.fromEntity(savedUser);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        log.info("Xử lý làm mới Access Token bằng Refresh Token");

        String token = request.getRefreshToken();
        if (token == null || token.isBlank()) {
            throw new BaseException(ErrorCode.BAD_REQUEST);
        }

        // Tìm token trong CSDL (kể cả còn hiệu lực hay đã bị revoked)
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token.trim())
                .orElseThrow(() -> new BaseException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        User user = refreshToken.getUser();

        // 🚨 TOKEN REUSE DETECTION (Phát hiện tấn công phát lại token đã thu hồi)
        if (Boolean.TRUE.equals(refreshToken.getRevoked())) {
            log.warn("🚨 PHÁT HIỆN TẤN CÔNG PHÁT LẠI TOKEN (Token Reuse) đối với User ID: {} (Username: {})",
                    user.getId(), user.getUsername());
            // Lập tức thu hồi tất cả Refresh Token của người dùng này để bảo vệ tài khoản
            refreshTokenRepository.revokeAllByUserId(user.getId());
            throw new BaseException(ErrorCode.TOKEN_REUSE_DETECTED);
        }

        if (refreshToken.isExpired()) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new BaseException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        // Tự động giải phóng khóa tài khoản nếu đã quá hạn locked_until
        if ("LOCKED".equalsIgnoreCase(user.getStatus()) && user.getLockedUntil() != null
                && user.getLockedUntil().isBefore(Instant.now())) {
            user.setStatus("ACTIVE");
            user.setLockedUntil(null);
            user.setLockedReason(null);
            userRepository.save(user);
        }

        if (!Boolean.TRUE.equals(user.getEnabled()) || "LOCKED".equalsIgnoreCase(user.getStatus())) {
            throw new BaseException(ErrorCode.USER_DISABLED);
        }

        // Sinh Access Token mới
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String newAccessToken = jwtTokenProvider.generateToken(userPrincipal);

        // Xoay vòng Refresh Token (Token Rotation) để bảo mật tối đa
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        String newRefreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationInMs)
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Override
    @Transactional
    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            log.info("Thu hồi Refresh Token khi đăng xuất");
            refreshTokenRepository.findByToken(token.trim()).ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
        }
    }

    @Override
    @Transactional
    public void logoutAll(Long userId) {
        if (userId != null) {
            log.info("Thu hồi toàn bộ Refresh Token trên mọi thiết bị cho User ID: {}", userId);
            refreshTokenRepository.revokeAllByUserId(userId);
        }
    }

    @Override
    @Transactional
    public void changePassword(Long userId, com.doan.core.business.dto.request.ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BaseException(ErrorCode.PASSWORD_CONFIRM_NOT_MATCH);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BaseException(ErrorCode.INVALID_OLD_PASSWORD);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Thu hồi toàn bộ Refresh Token cũ để ép đăng nhập lại trên các phiên khác
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    @Override
    @Transactional
    public void resetPassword(com.doan.core.business.dto.request.ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BaseException(ErrorCode.PASSWORD_CONFIRM_NOT_MATCH);
        }

        // 1. Xác thực mã OTP trong RAM
        otpService.verifyForgotPasswordOtp(request.getEmail(), request.getOtpCode());

        // 2. Tìm tài khoản theo email
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // 3. Đổi mật khẩu
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 4. Thu hồi toàn bộ Refresh Token cũ để bảo vệ tài khoản
        refreshTokenRepository.revokeAllByUserId(user.getId());
        log.info("Đặt lại mật khẩu thành công cho email: {} (User ID: {})", user.getEmail(), user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getMe(UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        return UserDto.fromEntity(user);
    }

    private String createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpirationInMs))
                .revoked(false)
                .build();

        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        return saved.getToken();
    }
}
