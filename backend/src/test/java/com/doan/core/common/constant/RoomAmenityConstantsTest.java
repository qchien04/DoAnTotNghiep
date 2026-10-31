package com.doan.core.common.constant;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class RoomAmenityConstantsTest {
    @Test
    void testEncodeAndDecode() {
        List<String> selected = List.of("Điều hòa", "Nóng lạnh", "Giường nệm");
        int mask = RoomAmenityConstants.encode(selected);
        assertEquals(1 + 2 + 16, mask); // Bit 0, 1, 4 = 19

        List<String> decoded = RoomAmenityConstants.decode(mask);
        assertEquals(3, decoded.size());
        assertTrue(decoded.contains("Điều hòa"));
        assertTrue(decoded.contains("Nóng lạnh"));
        assertTrue(decoded.contains("Giường nệm"));
    }

    @Test
    void testBoundaryValues() {
        assertEquals(0, RoomAmenityConstants.encode(null));
        assertEquals(0, RoomAmenityConstants.encode(List.of()));
        assertTrue(RoomAmenityConstants.decode(0).isEmpty());
        assertEquals(16, RoomAmenityConstants.decode(65535).size());
    }
}
