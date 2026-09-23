package com.doan.core.common.exception;

import com.doan.core.common.data.ResponseData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Bộ xử lý ngoại lệ toàn cục cho tất cả REST Controller trong hệ thống
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Xử lý ngoại lệ nghiệp vụ tùy chỉnh BaseException
     */
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ResponseData<Void>> handleBaseException(BaseException ex) {
        log.warn("Business Exception: [{}] - {}", ex.getErrorCode().getCode(), ex.getMessage());
        ResponseData<Void> response = ResponseData.error(
                ex.getErrorCode().getCode(),
                ex.getMessage(),
                ex.getErrorDesc()
        );
        return new ResponseEntity<>(response, ex.getHttpStatus());
    }

    /**
     * Xử lý lỗi validation dữ liệu đầu vào (@Valid DTO)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseData<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        log.warn("Validation failed: {}", errors);

        ResponseData<Map<String, String>> response = ResponseData.<Map<String, String>>builder()
                .code(ErrorCode.BAD_REQUEST.getCode())
                .message(ErrorCode.BAD_REQUEST.getMessage())
                .errorDesc("Dữ liệu đầu vào không hợp lệ")
                .data(errors)
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý lỗi sai tài khoản / mật khẩu
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ResponseData<Void>> handleBadCredentialsException(BadCredentialsException ex) {
        log.warn("Bad credentials: {}", ex.getMessage());
        ResponseData<Void> response = ResponseData.error(
                ErrorCode.INVALID_CREDENTIALS.getCode(),
                ErrorCode.INVALID_CREDENTIALS.getMessage(),
                ex.getMessage()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý lỗi không đủ quyền truy cập
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseData<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        ResponseData<Void> response = ResponseData.error(
                ErrorCode.FORBIDDEN.getCode(),
                ErrorCode.FORBIDDEN.getMessage(),
                ex.getMessage()
        );
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    /**
     * Bắt tất cả các lỗi chưa được định nghĩa khác (500 Internal Server Error)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseData<Void>> handleAllExceptions(Exception ex) {
        log.error("Unhandled Exception: ", ex);
        ResponseData<Void> response = ResponseData.error(
                ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                ErrorCode.INTERNAL_SERVER_ERROR.getMessage(),
                ex.getMessage()
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
