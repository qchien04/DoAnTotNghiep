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

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationInMs;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Xử lý đăng nhập cho người dùng: {}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BaseException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BaseException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!Boolean.TRUE.equals(user.getEnabled()) || "LOCKED".equalsIgnoreCase(user.getStatus())) {
            throw new BaseException(ErrorCode.USER_DISABLED);
        }

        // Tạo UserPrincipal và phát hành JWT Access Token
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String accessToken = jwtTokenProvider.generateToken(userPrincipal);

        // Thu hồi các refresh token cũ (nếu có) và tạo mới Refresh Token
        refreshTokenRepository.revokeAllByUserId(user.getId());

        RefreshToken refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
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
                .build();

        User savedUser = userRepository.save(newUser);
        return UserDto.fromEntity(savedUser);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        log.info("Xử lý làm mới Access Token bằng Refresh Token");

        String token = request.getRefreshToken();
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(token)
                .orElseThrow(() -> new BaseException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        if (refreshToken.isExpired()) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new BaseException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        User user = refreshToken.getUser();
        if (!Boolean.TRUE.equals(user.getEnabled()) || "LOCKED".equalsIgnoreCase(user.getStatus())) {
            throw new BaseException(ErrorCode.USER_DISABLED);
        }

        // Sinh Access Token mới
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String newAccessToken = jwtTokenProvider.generateToken(userPrincipal);

        // Xoay vòng Refresh Token (Token Rotation) để bảo mật tối đa
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        RefreshToken newRefreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
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
    @Transactional(readOnly = true)
    public UserDto getMe(UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new BaseException(ErrorCode.UNAUTHORIZED);
        }

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        return UserDto.fromEntity(user);
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpirationInMs))
                .revoked(false)
                .build();
        return refreshTokenRepository.save(refreshToken);
    }
}
