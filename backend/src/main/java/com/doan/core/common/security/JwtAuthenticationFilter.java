package com.doan.core.common.security;

import com.doan.core.common.constant.SecurityConstants;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.exception.BaseException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter xác thực JWT cho từng request HTTP
 * Trích xuất token, xác thực và nạp thông tin user vào SecurityContextHolder
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                // Lấy thông tin UserPrincipal trực tiếp từ Payload của token
                UserPrincipal userPrincipal = tokenProvider.getUserPrincipalFromToken(jwt);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userPrincipal,
                        null,
                        userPrincipal.getAuthorities()
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Đã xác thực thành công user: {} cho URI: {}", userPrincipal.getUsername(), request.getRequestURI());
            }
        } catch (BaseException ex) {
            log.warn("Lỗi xác thực JWT: {} khi gọi {}", ex.getMessage(), request.getRequestURI());
            handleAuthenticationError(response, ex);
            return;
        } catch (Exception ex) {
            log.error("Không thể thiết lập xác thực người dùng trong security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(SecurityConstants.AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(SecurityConstants.BEARER_PREFIX)) {
            return bearerToken.substring(SecurityConstants.BEARER_PREFIX.length());
        }
        return null;
    }

    private void handleAuthenticationError(HttpServletResponse response, BaseException ex) throws IOException {
        response.setStatus(ex.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ResponseData<?> errorResponse = ResponseData.error(
                ex.getErrorCode().getCode(),
                ex.getMessage(),
                ex.getErrorDesc()
        );

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
