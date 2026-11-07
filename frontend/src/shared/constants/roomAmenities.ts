/**
 * Danh sách 16 Tiện ích Phòng trọ chuẩn cố định theo mã hóa Bitmask 16-bit
 * Giá trị bit từ 0 -> 15 (Số nguyên tương ứng từ 0 -> 65535)
 */

export interface RoomAmenityItem {
  bitIndex: number;
  bitValue: number;
  key: string;
  name: string;
  iconName: string;
}

export const ROOM_AMENITIES: RoomAmenityItem[] = [
  { bitIndex: 0, bitValue: 1 << 0, key: 'AIR_CONDITIONER', name: 'Điều hòa', iconName: 'Wind' },
  { bitIndex: 1, bitValue: 1 << 1, key: 'WATER_HEATER', name: 'Nóng lạnh', iconName: 'Flame' },
  { bitIndex: 2, bitValue: 1 << 2, key: 'REFRIGERATOR', name: 'Tủ lạnh', iconName: 'Refrigerator' },
  { bitIndex: 3, bitValue: 1 << 3, key: 'WASHING_MACHINE', name: 'Máy giặt', iconName: 'WashingMachine' },
  { bitIndex: 4, bitValue: 1 << 4, key: 'BED_MATTRESS', name: 'Giường nệm', iconName: 'Bed' },
  { bitIndex: 5, bitValue: 1 << 5, key: 'WARDROBE', name: 'Tủ quần áo', iconName: 'DoorClosed' },
  { bitIndex: 6, bitValue: 1 << 6, key: 'KITCHEN', name: 'Kệ bếp / Bếp nấu', iconName: 'ChefHat' },
  { bitIndex: 7, bitValue: 1 << 7, key: 'BALCONY_WINDOW', name: 'Ban công / Cửa sổ', iconName: 'Sun' },
  { bitIndex: 8, bitValue: 1 << 8, key: 'PRIVATE_BATHROOM', name: 'Vệ sinh khép kín', iconName: 'Bath' },
  { bitIndex: 9, bitValue: 1 << 9, key: 'WIFI', name: 'Wi-Fi tốc độ cao', iconName: 'Wifi' },
  { bitIndex: 10, bitValue: 1 << 10, key: 'PARKING', name: 'Chỗ để xe', iconName: 'Bike' },
  { bitIndex: 11, bitValue: 1 << 11, key: 'ELEVATOR', name: 'Thang máy', iconName: 'ArrowUpDown' },
  { bitIndex: 12, bitValue: 1 << 12, key: 'FINGERPRINT_LOCK', name: 'Khóa vân tay / Camera', iconName: 'ShieldCheck' },
  { bitIndex: 13, bitValue: 1 << 13, key: 'NO_CURFEW', name: 'Giờ giấc tự do', iconName: 'Clock' },
  { bitIndex: 14, bitValue: 1 << 14, key: 'PET_FRIENDLY', name: 'Cho nuôi thú cưng', iconName: 'PawPrint' },
  { bitIndex: 15, bitValue: 1 << 15, key: 'MEZZANINE', name: 'Gác xép', iconName: 'Layers' },
];

/**
 * Mã hóa danh sách tên hoặc mã tiện ích thành số nguyên Bitmask
 */
export const encodeAmenitiesMask = (namesOrKeys?: string[] | null): number => {
  if (!namesOrKeys || !namesOrKeys.length) return 0;
  let mask = 0;
  for (const item of namesOrKeys) {
    if (!item) continue;
    const trimmed = item.trim().toLowerCase();
    const found = ROOM_AMENITIES.find(
      (a) =>
        a.name.toLowerCase() === trimmed ||
        a.key.toLowerCase() === trimmed ||
        trimmed.includes(a.name.toLowerCase())
    );
    if (found) {
      mask |= found.bitValue;
    }
  }
  return mask;
};

/**
 * Giải mã số nguyên Bitmask thành danh sách tên tiếng Việt của tiện ích
 */
export const decodeAmenitiesMask = (mask?: number | null): string[] => {
  if (!mask || mask <= 0) return [];
  return ROOM_AMENITIES.filter((a) => (mask & a.bitValue) !== 0).map((a) => a.name);
};

/**
 * Giải mã số nguyên Bitmask thành danh sách chi tiết các object tiện ích
 */
export const decodeAmenitiesDetails = (mask?: number | null): RoomAmenityItem[] => {
  if (!mask || mask <= 0) return [];
  return ROOM_AMENITIES.filter((a) => (mask & a.bitValue) !== 0);
};
