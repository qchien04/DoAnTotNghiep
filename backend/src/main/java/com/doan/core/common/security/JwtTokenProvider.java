package com.doan.core.common.security;

import com.doan.core.common.constant.SecurityConstants;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Lớp xử lý phát hành, giải mã và xác thực JWT token sử dụng thuật toán HMAC-SHA256
 * Toàn bộ thông tin cần thiết được lưu trong payload (Claims), không cần truy vấn Redis/Database khi xác thực request.
 */
@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (Exception e) {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Tạo JWT token chứa toàn bộ thông tin người dùng trong Payload
     */
    public String generateToken(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put(SecurityConstants.CLAIM_USER_ID, userPrincipal.getId());
        claims.put(SecurityConstants.CLAIM_USERNAME, userPrincipal.getUsername());
        claims.put(SecurityConstants.CLAIM_EMAIL, userPrincipal.getEmail());
        claims.put(SecurityConstants.CLAIM_FULL_NAME, userPrincipal.getFullName());
        claims.put(SecurityConstants.CLAIM_ROLE, userPrincipal.getRole());

        return Jwts.builder()
                .subject(String.valueOf(userPrincipal.getId()))
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Giải mã claims từ JWT token
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Trích xuất trực tiếp UserPrincipal từ JWT Claims mà không cần truy vấn Database
     */
    public UserPrincipal getUserPrincipalFromToken(String token) {
        Claims claims = getClaimsFromToken(token);

        Long userId = claims.get(SecurityConstants.CLAIM_USER_ID, Number.class).longValue();
        String username = claims.get(SecurityConstants.CLAIM_USERNAME, String.class);
        String email = claims.get(SecurityConstants.CLAIM_EMAIL, String.class);
        String fullName = claims.get(SecurityConstants.CLAIM_FULL_NAME, String.class);
        String role = claims.get(SecurityConstants.CLAIM_ROLE, String.class);

        return UserPrincipal.createFromClaims(userId, username, email, fullName, role);
    }

    /**
     * Kiểm tra tính hợp lệ của JWT token
     */
    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("JWT token đã hết hạn: {}", ex.getMessage());
            throw new BaseException(ErrorCode.TOKEN_EXPIRED);
        } catch (MalformedJwtException | UnsupportedJwtException | IllegalArgumentException ex) {
            log.warn("JWT token không hợp lệ: {}", ex.getMessage());
            throw new BaseException(ErrorCode.TOKEN_INVALID);
        }
    }
}
