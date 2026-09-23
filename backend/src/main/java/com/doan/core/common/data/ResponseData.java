package com.doan.core.common.data;

import com.doan.core.common.constant.CommonConstants;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Định dạng phản hồi chuẩn cho toàn bộ API hệ thống (tương tự chuẩn Viettel ResponseData)
 *
 * @param <T> Kiểu dữ liệu trong data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Đối tượng phản hồi chuẩn của API")
public class ResponseData<T> {

    @Schema(description = "Mã phản hồi (00 = thành công, khác 00 = lỗi)", example = "00")
    @Builder.Default
    private String code = CommonConstants.SUCCESS_CODE;

    @Schema(description = "Thông báo kết quả xử lý", example = "Thành công")
    @Builder.Default
    private String message = CommonConstants.SUCCESS_MESSAGE;

    @Schema(description = "Mô tả chi tiết lỗi nếu có")
    private String errorDesc;

    @Schema(description = "Dữ liệu trả về")
    private T data;

    @Schema(description = "Thời gian phản hồi trên máy chủ")
    @Builder.Default
    private String serverTime = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

    @Schema(description = "Tên service xử lý")
    @Builder.Default
    private String service = CommonConstants.SERVICE_NAME;

    public static <T> ResponseData<T> success(T data) {
        return ResponseData.<T>builder()
                .code(CommonConstants.SUCCESS_CODE)
                .message(CommonConstants.SUCCESS_MESSAGE)
                .data(data)
                .build();
    }

    public static <T> ResponseData<T> success(String message, T data) {
        return ResponseData.<T>builder()
                .code(CommonConstants.SUCCESS_CODE)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ResponseData<T> error(String code, String message) {
        return ResponseData.<T>builder()
                .code(code)
                .message(message)
                .data(null)
                .build();
    }

    public static <T> ResponseData<T> error(String code, String message, String errorDesc) {
        return ResponseData.<T>builder()
                .code(code)
                .message(message)
                .errorDesc(errorDesc)
                .data(null)
                .build();
    }
}
