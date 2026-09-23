package com.doan.core.common.constant;

/**
 * Các hằng số liên quan đến bảo mật và xác thực JWT
 */
public final class SecurityConstants {

    private SecurityConstants() {}

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";

    // JWT Claims Keys
    public static final String CLAIM_USER_ID = "userId";
    public static final String CLAIM_USERNAME = "username";
    public static final String CLAIM_EMAIL = "email";
    public static final String CLAIM_ROLE = "role";
    public static final String CLAIM_FULL_NAME = "fullName";

    // Public URL patterns (bỏ qua xác thực JWT)
    public static final String[] PUBLIC_URLS = {
        "/api/v1/auth/**",
        "/api/v1/home/**",
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/h2-console/**",
        "/favicon.ico"
    };
}
