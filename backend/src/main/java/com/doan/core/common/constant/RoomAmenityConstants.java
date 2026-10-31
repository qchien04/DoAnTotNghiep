package com.doan.core.common.constant;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class RoomAmenityConstants {

    private RoomAmenityConstants() {}

    public record AmenityItem(int bitIndex, String key, String name) {
        public int bitValue() {
            return 1 << bitIndex;
        }
    }

    public static final List<AmenityItem> ALL_AMENITIES = List.of(
            new AmenityItem(0, "AIR_CONDITIONER", "Điều hòa"),
            new AmenityItem(1, "WATER_HEATER", "Nóng lạnh"),
            new AmenityItem(2, "REFRIGERATOR", "Tủ lạnh"),
            new AmenityItem(3, "WASHING_MACHINE", "Máy giặt"),
            new AmenityItem(4, "BED_MATTRESS", "Giường nệm"),
            new AmenityItem(5, "WARDROBE", "Tủ quần áo"),
            new AmenityItem(6, "KITCHEN", "Kệ bếp / Bếp nấu"),
            new AmenityItem(7, "BALCONY_WINDOW", "Ban công / Cửa sổ"),
            new AmenityItem(8, "PRIVATE_BATHROOM", "Vệ sinh khép kín"),
            new AmenityItem(9, "WIFI", "Wi-Fi tốc độ cao"),
            new AmenityItem(10, "PARKING", "Chỗ để xe"),
            new AmenityItem(11, "ELEVATOR", "Thang máy"),
            new AmenityItem(12, "FINGERPRINT_LOCK", "Khóa vân tay / Camera"),
            new AmenityItem(13, "NO_CURFEW", "Giờ giấc tự do"),
            new AmenityItem(14, "PET_FRIENDLY", "Cho nuôi thú cưng"),
            new AmenityItem(15, "MEZZANINE", "Gác xép")
    );

    /**
     * Mã hóa danh sách tên hoặc mã tiện ích thành số nguyên Bitmask
     */
    public static int encode(List<String> namesOrKeys) {
        if (namesOrKeys == null || namesOrKeys.isEmpty()) {
            return 0;
        }
        int mask = 0;
        for (String item : namesOrKeys) {
            if (item == null || item.isBlank()) continue;
            String trimmed = item.trim();
            for (AmenityItem amenity : ALL_AMENITIES) {
                if (amenity.name().equalsIgnoreCase(trimmed) || 
                    amenity.key().equalsIgnoreCase(trimmed) ||
                    trimmed.toLowerCase().contains(amenity.name().toLowerCase())) {
                    mask |= amenity.bitValue();
                    break;
                }
            }
        }
        return mask;
    }

    /**
     * Giải mã số nguyên Bitmask thành danh sách tên tiếng Việt của tiện ích
     */
    public static List<String> decode(int mask) {
        if (mask <= 0) {
            return Collections.emptyList();
        }
        List<String> result = new ArrayList<>();
        for (AmenityItem amenity : ALL_AMENITIES) {
            if ((mask & amenity.bitValue()) != 0) {
                result.add(amenity.name());
            }
        }
        return result;
    }

    /**
     * Giải mã số nguyên Bitmask thành danh sách các key định danh
     */
    public static List<String> decodeKeys(int mask) {
        if (mask <= 0) {
            return Collections.emptyList();
        }
        List<String> result = new ArrayList<>();
        for (AmenityItem amenity : ALL_AMENITIES) {
            if ((mask & amenity.bitValue()) != 0) {
                result.add(amenity.key());
            }
        }
        return result;
    }
}
