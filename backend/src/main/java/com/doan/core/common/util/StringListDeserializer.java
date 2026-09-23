package com.doan.core.common.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Hỗ trợ deserialize linh hoạt trường List<String> từ JSON Array [val1, val2] hoặc chuỗi phân tách dấu phẩy "val1, val2".
 */
public class StringListDeserializer extends JsonDeserializer<List<String>> {

    @Override
    public List<String> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() == JsonToken.START_ARRAY) {
            List<String> list = new ArrayList<>();
            while (p.nextToken() != JsonToken.END_ARRAY) {
                String val = p.getText();
                if (val != null && !val.isBlank()) {
                    list.add(val.trim());
                }
            }
            return list;
        } else if (p.currentToken() == JsonToken.VALUE_STRING) {
            String val = p.getText();
            if (val == null || val.isBlank()) {
                return new ArrayList<>();
            }
            return Arrays.stream(val.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        } else if (p.currentToken() == JsonToken.VALUE_NULL) {
            return new ArrayList<>();
        }
        return new ArrayList<>();
    }
}
