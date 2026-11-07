package com.doan.core.common.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;
import org.springframework.stereotype.Component;

/**
 * Converter tự động chuẩn hóa chuỗi String sang Enum tại tầng Controller:
 * - Hỗ trợ không phân biệt hoa thường (Case-insensitive)
 * - Tự động loại bỏ khoảng trắng (Trim)
 * - Chuyển đổi "ALL" hoặc chuỗi rỗng thành null
 * - Tương thích ngược với các alias cũ (PENDING -> UNPAID, PARTIAL -> PARTIALLY_PAID...)
 */
@Component
@SuppressWarnings({ "unchecked", "rawtypes" })
public class CaseInsensitiveEnumConverterFactory implements ConverterFactory<String, Enum> {

    @Override
    public <T extends Enum> Converter<String, T> getConverter(Class<T> targetType) {
        return new StringToEnumConverter<>(targetType);
    }

    private static class StringToEnumConverter<T extends Enum> implements Converter<String, T> {
        private final Class<T> enumType;

        StringToEnumConverter(Class<T> enumType) {
            this.enumType = enumType;
        }

        @Override
        public T convert(String source) {
            if (source == null || source.trim().isBlank() || "ALL".equalsIgnoreCase(source.trim())) {
                return null;
            }
            try {
                return (T) Enum.valueOf(enumType, source.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
    }
}
