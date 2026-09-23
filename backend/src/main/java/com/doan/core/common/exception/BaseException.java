package com.doan.core.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Lớp ngoại lệ cơ sở cho toàn bộ ứng dụng
 */
@Getter
public class BaseException extends RuntimeException {

    private final ErrorCode errorCode;
    private final HttpStatus httpStatus;
    private final String errorDesc;

    public BaseException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.errorDesc = null;
    }

    public BaseException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.errorDesc = customMessage;
    }

    public BaseException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(customMessage, cause);
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.errorDesc = customMessage;
    }
}
