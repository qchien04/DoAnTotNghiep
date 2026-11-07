/**
 * Danh mục Địa chính 2 cấp (Tỉnh / Thành phố và Phường / Xã) của Việt Nam
 * Cố định và chuẩn hóa mã định danh số nguyên (provinceId, wardId)
 */

export interface Province {
  id: number;
  name: string;
  code: string;
}

export interface Ward {
  id: number;
  provinceId: number;
  name: string;
}

export const VIETNAM_PROVINCES: Province[] = [
  {
    "id": 1,
    "name": "Thành phố Hà Nội",
    "code": "01"
  },
  {
    "id": 79,
    "name": "Thành phố Hồ Chí Minh",
    "code": "79"
  },
  {
    "id": 48,
    "name": "Thành phố Đà Nẵng",
    "code": "48"
  },
  {
    "id": 31,
    "name": "Thành phố Hải Phòng",
    "code": "31"
  },
  {
    "id": 92,
    "name": "Thành phố Cần Thơ",
    "code": "92"
  },
  {
    "id": 2,
    "name": "Tỉnh Hà Giang",
    "code": "02"
  },
  {
    "id": 4,
    "name": "Tỉnh Cao Bằng",
    "code": "04"
  },
  {
    "id": 6,
    "name": "Tỉnh Bắc Kạn",
    "code": "06"
  },
  {
    "id": 8,
    "name": "Tỉnh Tuyên Quang",
    "code": "08"
  },
  {
    "id": 10,
    "name": "Tỉnh Lào Cai",
    "code": "10"
  },
  {
    "id": 11,
    "name": "Tỉnh Điện Biên",
    "code": "11"
  },
  {
    "id": 12,
    "name": "Tỉnh Lai Châu",
    "code": "12"
  },
  {
    "id": 14,
    "name": "Tỉnh Sơn La",
    "code": "14"
  },
  {
    "id": 15,
    "name": "Tỉnh Yên Bái",
    "code": "15"
  },
  {
    "id": 17,
    "name": "Tỉnh Hoà Bình",
    "code": "17"
  },
  {
    "id": 19,
    "name": "Tỉnh Thái Nguyên",
    "code": "19"
  },
  {
    "id": 20,
    "name": "Tỉnh Lạng Sơn",
    "code": "20"
  },
  {
    "id": 22,
    "name": "Tỉnh Quảng Ninh",
    "code": "22"
  },
  {
    "id": 24,
    "name": "Tỉnh Bắc Giang",
    "code": "24"
  },
  {
    "id": 25,
    "name": "Tỉnh Phú Thọ",
    "code": "25"
  },
  {
    "id": 26,
    "name": "Tỉnh Vĩnh Phúc",
    "code": "26"
  },
  {
    "id": 27,
    "name": "Tỉnh Bắc Ninh",
    "code": "27"
  },
  {
    "id": 30,
    "name": "Tỉnh Hải Dương",
    "code": "30"
  },
  {
    "id": 33,
    "name": "Tỉnh Hưng Yên",
    "code": "33"
  },
  {
    "id": 34,
    "name": "Tỉnh Thái Bình",
    "code": "34"
  },
  {
    "id": 35,
    "name": "Tỉnh Hà Nam",
    "code": "35"
  },
  {
    "id": 36,
    "name": "Tỉnh Nam Định",
    "code": "36"
  },
  {
    "id": 37,
    "name": "Tỉnh Ninh Bình",
    "code": "37"
  },
  {
    "id": 38,
    "name": "Tỉnh Thanh Hóa",
    "code": "38"
  },
  {
    "id": 40,
    "name": "Tỉnh Nghệ An",
    "code": "40"
  },
  {
    "id": 42,
    "name": "Tỉnh Hà Tĩnh",
    "code": "42"
  },
  {
    "id": 44,
    "name": "Tỉnh Quảng Bình",
    "code": "44"
  },
  {
    "id": 45,
    "name": "Tỉnh Quảng Trị",
    "code": "45"
  },
  {
    "id": 46,
    "name": "Tỉnh Thừa Thiên Huế",
    "code": "46"
  },
  {
    "id": 49,
    "name": "Tỉnh Quảng Nam",
    "code": "49"
  },
  {
    "id": 51,
    "name": "Tỉnh Quảng Ngãi",
    "code": "51"
  },
  {
    "id": 52,
    "name": "Tỉnh Bình Định",
    "code": "52"
  },
  {
    "id": 54,
    "name": "Tỉnh Phú Yên",
    "code": "54"
  },
  {
    "id": 56,
    "name": "Tỉnh Khánh Hòa",
    "code": "56"
  },
  {
    "id": 58,
    "name": "Tỉnh Ninh Thuận",
    "code": "58"
  },
  {
    "id": 60,
    "name": "Tỉnh Bình Thuận",
    "code": "60"
  },
  {
    "id": 62,
    "name": "Tỉnh Kon Tum",
    "code": "62"
  },
  {
    "id": 64,
    "name": "Tỉnh Gia Lai",
    "code": "64"
  },
  {
    "id": 66,
    "name": "Tỉnh Đắk Lắk",
    "code": "66"
  },
  {
    "id": 67,
    "name": "Tỉnh Đắk Nông",
    "code": "67"
  },
  {
    "id": 68,
    "name": "Tỉnh Lâm Đồng",
    "code": "68"
  },
  {
    "id": 70,
    "name": "Tỉnh Bình Phước",
    "code": "70"
  },
  {
    "id": 72,
    "name": "Tỉnh Tây Ninh",
    "code": "72"
  },
  {
    "id": 74,
    "name": "Tỉnh Bình Dương",
    "code": "74"
  },
  {
    "id": 75,
    "name": "Tỉnh Đồng Nai",
    "code": "75"
  },
  {
    "id": 77,
    "name": "Tỉnh Bà Rịa - Vũng Tàu",
    "code": "77"
  },
  {
    "id": 80,
    "name": "Tỉnh Long An",
    "code": "80"
  },
  {
    "id": 82,
    "name": "Tỉnh Tiền Giang",
    "code": "82"
  },
  {
    "id": 83,
    "name": "Tỉnh Bến Tre",
    "code": "83"
  },
  {
    "id": 84,
    "name": "Tỉnh Trà Vinh",
    "code": "84"
  },
  {
    "id": 86,
    "name": "Tỉnh Vĩnh Long",
    "code": "86"
  },
  {
    "id": 87,
    "name": "Tỉnh Đồng Tháp",
    "code": "87"
  },
  {
    "id": 89,
    "name": "Tỉnh An Giang",
    "code": "89"
  },
  {
    "id": 91,
    "name": "Tỉnh Kiên Giang",
    "code": "91"
  },
  {
    "id": 93,
    "name": "Tỉnh Hậu Giang",
    "code": "93"
  },
  {
    "id": 94,
    "name": "Tỉnh Sóc Trăng",
    "code": "94"
  },
  {
    "id": 95,
    "name": "Tỉnh Bạc Liêu",
    "code": "95"
  },
  {
    "id": 96,
    "name": "Tỉnh Cà Mau",
    "code": "96"
  }
];

export const VIETNAM_WARDS: Ward[] = [
  {
    "id": 101,
    "provinceId": 1,
    "name": "Phường Dịch Vọng Hậu"
  },
  {
    "id": 102,
    "provinceId": 1,
    "name": "Phường Quan Hoa"
  },
  {
    "id": 103,
    "provinceId": 1,
    "name": "Phường Nghĩa Tân"
  },
  {
    "id": 104,
    "provinceId": 1,
    "name": "Phường Dịch Vọng"
  },
  {
    "id": 105,
    "provinceId": 1,
    "name": "Phường Mai Dịch"
  },
  {
    "id": 106,
    "provinceId": 1,
    "name": "Phường Láng Thượng"
  },
  {
    "id": 107,
    "provinceId": 1,
    "name": "Phường Láng Hạ"
  },
  {
    "id": 108,
    "provinceId": 1,
    "name": "Phường Ô Chợ Dừa"
  },
  {
    "id": 109,
    "provinceId": 1,
    "name": "Phường Khâm Thiên"
  },
  {
    "id": 110,
    "provinceId": 1,
    "name": "Phường Trung Tự"
  },
  {
    "id": 111,
    "provinceId": 1,
    "name": "Phường Bách Khoa"
  },
  {
    "id": 112,
    "provinceId": 1,
    "name": "Phường Đồng Tâm"
  },
  {
    "id": 113,
    "provinceId": 1,
    "name": "Phường Trương Định"
  },
  {
    "id": 114,
    "provinceId": 1,
    "name": "Phường Bạch Mai"
  },
  {
    "id": 115,
    "provinceId": 1,
    "name": "Phường Thanh Xuân Bắc"
  },
  {
    "id": 116,
    "provinceId": 1,
    "name": "Phường Thanh Xuân Nam"
  },
  {
    "id": 117,
    "provinceId": 1,
    "name": "Phường Nhân Chính"
  },
  {
    "id": 118,
    "provinceId": 1,
    "name": "Phường Khương Đình"
  },
  {
    "id": 119,
    "provinceId": 1,
    "name": "Phường Mỹ Đình 1"
  },
  {
    "id": 120,
    "provinceId": 1,
    "name": "Phường Mỹ Đình 2"
  },
  {
    "id": 121,
    "provinceId": 1,
    "name": "Phường Mễ Trì"
  },
  {
    "id": 122,
    "provinceId": 1,
    "name": "Phường Trung Văn"
  },
  {
    "id": 123,
    "provinceId": 1,
    "name": "Phường Cổ Nhuế 1"
  },
  {
    "id": 124,
    "provinceId": 1,
    "name": "Phường Cổ Nhuế 2"
  },
  {
    "id": 125,
    "provinceId": 1,
    "name": "Phường Xuân Đỉnh"
  },
  {
    "id": 126,
    "provinceId": 1,
    "name": "Phường Minh Khai"
  },
  {
    "id": 127,
    "provinceId": 1,
    "name": "Phường Mộ Lao"
  },
  {
    "id": 128,
    "provinceId": 1,
    "name": "Phường Văn Quán"
  },
  {
    "id": 129,
    "provinceId": 1,
    "name": "Phường Hà Cầu"
  },
  {
    "id": 130,
    "provinceId": 1,
    "name": "Phường Quang Trung"
  },
  {
    "id": 131,
    "provinceId": 1,
    "name": "Phường Hàng Trống"
  },
  {
    "id": 132,
    "provinceId": 1,
    "name": "Phường Tràng Tiền"
  },
  {
    "id": 133,
    "provinceId": 1,
    "name": "Phường Phan Chu Trinh"
  },
  {
    "id": 134,
    "provinceId": 1,
    "name": "Xã Kim Chung"
  },
  {
    "id": 135,
    "provinceId": 1,
    "name": "Xã Tiền Phong"
  },
  {
    "id": 136,
    "provinceId": 1,
    "name": "Xã An Khánh"
  },
  {
    "id": 137,
    "provinceId": 1,
    "name": "Xã Tân Lập"
  },
  {
    "id": 7901,
    "provinceId": 79,
    "name": "Phường Bến Nghé"
  },
  {
    "id": 7902,
    "provinceId": 79,
    "name": "Phường Bến Thành"
  },
  {
    "id": 7903,
    "provinceId": 79,
    "name": "Phường Cầu Kho"
  },
  {
    "id": 7904,
    "provinceId": 79,
    "name": "Phường Đa Kao"
  },
  {
    "id": 7905,
    "provinceId": 79,
    "name": "Phường 1 (Quận 3)"
  },
  {
    "id": 7906,
    "provinceId": 79,
    "name": "Phường 2 (Quận 3)"
  },
  {
    "id": 7907,
    "provinceId": 79,
    "name": "Phường 4 (Quận 3)"
  },
  {
    "id": 7908,
    "provinceId": 79,
    "name": "Phường 25 (Bình Thạnh)"
  },
  {
    "id": 7909,
    "provinceId": 79,
    "name": "Phường 15 (Bình Thạnh)"
  },
  {
    "id": 7910,
    "provinceId": 79,
    "name": "Phường 26 (Bình Thạnh)"
  },
  {
    "id": 7911,
    "provinceId": 79,
    "name": "Phường 2 (Tân Bình)"
  },
  {
    "id": 7912,
    "provinceId": 79,
    "name": "Phường 13 (Tân Bình)"
  },
  {
    "id": 7913,
    "provinceId": 79,
    "name": "Phường 15 (Tân Bình)"
  },
  {
    "id": 7914,
    "provinceId": 79,
    "name": "Phường 14 (Quận 10)"
  },
  {
    "id": 7915,
    "provinceId": 79,
    "name": "Phường 12 (Quận 10)"
  },
  {
    "id": 7916,
    "provinceId": 79,
    "name": "Phường 15 (Quận 10)"
  },
  {
    "id": 7917,
    "provinceId": 79,
    "name": "Phường Tân Phong (Quận 7)"
  },
  {
    "id": 7918,
    "provinceId": 79,
    "name": "Phường Tân Hưng (Quận 7)"
  },
  {
    "id": 7919,
    "provinceId": 79,
    "name": "Phường Tân Phú (Quận 7)"
  },
  {
    "id": 7920,
    "provinceId": 79,
    "name": "Phường Linh Trung (Thủ Đức)"
  },
  {
    "id": 7921,
    "provinceId": 79,
    "name": "Phường Linh Chiểu (Thủ Đức)"
  },
  {
    "id": 7922,
    "provinceId": 79,
    "name": "Phường Tăng Nhơn Phú A (Thủ Đức)"
  },
  {
    "id": 7923,
    "provinceId": 79,
    "name": "Phường Hiệp Phú (Thủ Đức)"
  },
  {
    "id": 7924,
    "provinceId": 79,
    "name": "Phường Thảo Điền (Thủ Đức)"
  },
  {
    "id": 7925,
    "provinceId": 79,
    "name": "Phường 12 (Gò Vấp)"
  },
  {
    "id": 7926,
    "provinceId": 79,
    "name": "Phường 5 (Gò Vấp)"
  },
  {
    "id": 7927,
    "provinceId": 79,
    "name": "Phường 10 (Gò Vấp)"
  },
  {
    "id": 4801,
    "provinceId": 48,
    "name": "Phường Hòa Cường Bắc"
  },
  {
    "id": 4802,
    "provinceId": 48,
    "name": "Phường Hòa Cường Nam"
  },
  {
    "id": 4803,
    "provinceId": 48,
    "name": "Phường Hải Châu 1"
  },
  {
    "id": 4804,
    "provinceId": 48,
    "name": "Phường Thạch Thang"
  },
  {
    "id": 4805,
    "provinceId": 48,
    "name": "Phường Mỹ An"
  },
  {
    "id": 4806,
    "provinceId": 48,
    "name": "Phường Khuê Mỹ"
  },
  {
    "id": 4807,
    "provinceId": 48,
    "name": "Phường Hòa Hải"
  },
  {
    "id": 4808,
    "provinceId": 48,
    "name": "Phường An Hải Bắc"
  },
  {
    "id": 4809,
    "provinceId": 48,
    "name": "Phường Phước Mỹ"
  },
  {
    "id": 4810,
    "provinceId": 48,
    "name": "Phường Hòa Khánh Bắc"
  },
  {
    "id": 4811,
    "provinceId": 48,
    "name": "Phường Hòa Khánh Nam"
  },
  {
    "id": 4812,
    "provinceId": 48,
    "name": "Phường Hòa Minh"
  },
  {
    "id": 3101,
    "provinceId": 31,
    "name": "Phường Minh Khai"
  },
  {
    "id": 3102,
    "provinceId": 31,
    "name": "Phường Hoàng Văn Thụ"
  },
  {
    "id": 3103,
    "provinceId": 31,
    "name": "Phường Lạch Tray"
  },
  {
    "id": 3104,
    "provinceId": 31,
    "name": "Phường Đằng Giang"
  },
  {
    "id": 3105,
    "provinceId": 31,
    "name": "Phường Cầu Tre"
  },
  {
    "id": 3106,
    "provinceId": 31,
    "name": "Phường Vạn Mỹ"
  },
  {
    "id": 3107,
    "provinceId": 31,
    "name": "Phường Niệm Nghĩa"
  },
  {
    "id": 3108,
    "provinceId": 31,
    "name": "Phường Quán Toan"
  },
  {
    "id": 9201,
    "provinceId": 92,
    "name": "Phường An Khánh"
  },
  {
    "id": 9202,
    "provinceId": 92,
    "name": "Phường Xuân Khánh"
  },
  {
    "id": 9203,
    "provinceId": 92,
    "name": "Phường Hưng Lợi"
  },
  {
    "id": 9204,
    "provinceId": 92,
    "name": "Phường Tân An"
  },
  {
    "id": 9205,
    "provinceId": 92,
    "name": "Phường Cái Khế"
  },
  {
    "id": 9206,
    "provinceId": 92,
    "name": "Phường Trà Nóc"
  },
  {
    "id": 9207,
    "provinceId": 92,
    "name": "Phường Lê Bình"
  },
  {
    "id": 201,
    "provinceId": 2,
    "name": "Phường 1 (Hà Giang)"
  },
  {
    "id": 202,
    "provinceId": 2,
    "name": "Phường 2 (Hà Giang)"
  },
  {
    "id": 203,
    "provinceId": 2,
    "name": "Phường Trung Tâm (Hà Giang)"
  },
  {
    "id": 204,
    "provinceId": 2,
    "name": "Xã Hòa Bình (Hà Giang)"
  },
  {
    "id": 205,
    "provinceId": 2,
    "name": "Xã Tân Phong (Hà Giang)"
  },
  {
    "id": 401,
    "provinceId": 4,
    "name": "Phường 1 (Cao Bằng)"
  },
  {
    "id": 402,
    "provinceId": 4,
    "name": "Phường 2 (Cao Bằng)"
  },
  {
    "id": 403,
    "provinceId": 4,
    "name": "Phường Trung Tâm (Cao Bằng)"
  },
  {
    "id": 404,
    "provinceId": 4,
    "name": "Xã Hòa Bình (Cao Bằng)"
  },
  {
    "id": 405,
    "provinceId": 4,
    "name": "Xã Tân Phong (Cao Bằng)"
  },
  {
    "id": 601,
    "provinceId": 6,
    "name": "Phường 1 (Bắc Kạn)"
  },
  {
    "id": 602,
    "provinceId": 6,
    "name": "Phường 2 (Bắc Kạn)"
  },
  {
    "id": 603,
    "provinceId": 6,
    "name": "Phường Trung Tâm (Bắc Kạn)"
  },
  {
    "id": 604,
    "provinceId": 6,
    "name": "Xã Hòa Bình (Bắc Kạn)"
  },
  {
    "id": 605,
    "provinceId": 6,
    "name": "Xã Tân Phong (Bắc Kạn)"
  },
  {
    "id": 801,
    "provinceId": 8,
    "name": "Phường 1 (Tuyên Quang)"
  },
  {
    "id": 802,
    "provinceId": 8,
    "name": "Phường 2 (Tuyên Quang)"
  },
  {
    "id": 803,
    "provinceId": 8,
    "name": "Phường Trung Tâm (Tuyên Quang)"
  },
  {
    "id": 804,
    "provinceId": 8,
    "name": "Xã Hòa Bình (Tuyên Quang)"
  },
  {
    "id": 805,
    "provinceId": 8,
    "name": "Xã Tân Phong (Tuyên Quang)"
  },
  {
    "id": 1001,
    "provinceId": 10,
    "name": "Phường 1 (Lào Cai)"
  },
  {
    "id": 1002,
    "provinceId": 10,
    "name": "Phường 2 (Lào Cai)"
  },
  {
    "id": 1003,
    "provinceId": 10,
    "name": "Phường Trung Tâm (Lào Cai)"
  },
  {
    "id": 1004,
    "provinceId": 10,
    "name": "Xã Hòa Bình (Lào Cai)"
  },
  {
    "id": 1005,
    "provinceId": 10,
    "name": "Xã Tân Phong (Lào Cai)"
  },
  {
    "id": 1101,
    "provinceId": 11,
    "name": "Phường 1 (Điện Biên)"
  },
  {
    "id": 1102,
    "provinceId": 11,
    "name": "Phường 2 (Điện Biên)"
  },
  {
    "id": 1103,
    "provinceId": 11,
    "name": "Phường Trung Tâm (Điện Biên)"
  },
  {
    "id": 1104,
    "provinceId": 11,
    "name": "Xã Hòa Bình (Điện Biên)"
  },
  {
    "id": 1105,
    "provinceId": 11,
    "name": "Xã Tân Phong (Điện Biên)"
  },
  {
    "id": 1201,
    "provinceId": 12,
    "name": "Phường 1 (Lai Châu)"
  },
  {
    "id": 1202,
    "provinceId": 12,
    "name": "Phường 2 (Lai Châu)"
  },
  {
    "id": 1203,
    "provinceId": 12,
    "name": "Phường Trung Tâm (Lai Châu)"
  },
  {
    "id": 1204,
    "provinceId": 12,
    "name": "Xã Hòa Bình (Lai Châu)"
  },
  {
    "id": 1205,
    "provinceId": 12,
    "name": "Xã Tân Phong (Lai Châu)"
  },
  {
    "id": 1401,
    "provinceId": 14,
    "name": "Phường 1 (Sơn La)"
  },
  {
    "id": 1402,
    "provinceId": 14,
    "name": "Phường 2 (Sơn La)"
  },
  {
    "id": 1403,
    "provinceId": 14,
    "name": "Phường Trung Tâm (Sơn La)"
  },
  {
    "id": 1404,
    "provinceId": 14,
    "name": "Xã Hòa Bình (Sơn La)"
  },
  {
    "id": 1405,
    "provinceId": 14,
    "name": "Xã Tân Phong (Sơn La)"
  },
  {
    "id": 1501,
    "provinceId": 15,
    "name": "Phường 1 (Yên Bái)"
  },
  {
    "id": 1502,
    "provinceId": 15,
    "name": "Phường 2 (Yên Bái)"
  },
  {
    "id": 1503,
    "provinceId": 15,
    "name": "Phường Trung Tâm (Yên Bái)"
  },
  {
    "id": 1504,
    "provinceId": 15,
    "name": "Xã Hòa Bình (Yên Bái)"
  },
  {
    "id": 1505,
    "provinceId": 15,
    "name": "Xã Tân Phong (Yên Bái)"
  },
  {
    "id": 1701,
    "provinceId": 17,
    "name": "Phường 1 (Hoà Bình)"
  },
  {
    "id": 1702,
    "provinceId": 17,
    "name": "Phường 2 (Hoà Bình)"
  },
  {
    "id": 1703,
    "provinceId": 17,
    "name": "Phường Trung Tâm (Hoà Bình)"
  },
  {
    "id": 1704,
    "provinceId": 17,
    "name": "Xã Hòa Bình (Hoà Bình)"
  },
  {
    "id": 1705,
    "provinceId": 17,
    "name": "Xã Tân Phong (Hoà Bình)"
  },
  {
    "id": 1901,
    "provinceId": 19,
    "name": "Phường Quang Trung"
  },
  {
    "id": 1902,
    "provinceId": 19,
    "name": "Phường Phan Đình Phùng"
  },
  {
    "id": 1903,
    "provinceId": 19,
    "name": "Phường Tân Lập"
  },
  {
    "id": 1904,
    "provinceId": 19,
    "name": "Phường Hoàng Văn Thụ"
  },
  {
    "id": 1905,
    "provinceId": 19,
    "name": "Phường Tích Lương"
  },
  {
    "id": 2001,
    "provinceId": 20,
    "name": "Phường 1 (Lạng Sơn)"
  },
  {
    "id": 2002,
    "provinceId": 20,
    "name": "Phường 2 (Lạng Sơn)"
  },
  {
    "id": 2003,
    "provinceId": 20,
    "name": "Phường Trung Tâm (Lạng Sơn)"
  },
  {
    "id": 2004,
    "provinceId": 20,
    "name": "Xã Hòa Bình (Lạng Sơn)"
  },
  {
    "id": 2005,
    "provinceId": 20,
    "name": "Xã Tân Phong (Lạng Sơn)"
  },
  {
    "id": 2201,
    "provinceId": 22,
    "name": "Phường Bãi Cháy"
  },
  {
    "id": 2202,
    "provinceId": 22,
    "name": "Phường Hồng Gai"
  },
  {
    "id": 2203,
    "provinceId": 22,
    "name": "Phường Bạch Đằng"
  },
  {
    "id": 2204,
    "provinceId": 22,
    "name": "Phường Cao Xanh"
  },
  {
    "id": 2205,
    "provinceId": 22,
    "name": "Phường Cẩm Thành"
  },
  {
    "id": 2206,
    "provinceId": 22,
    "name": "Phường Uông Bí"
  },
  {
    "id": 2401,
    "provinceId": 24,
    "name": "Phường 1 (Bắc Giang)"
  },
  {
    "id": 2402,
    "provinceId": 24,
    "name": "Phường 2 (Bắc Giang)"
  },
  {
    "id": 2403,
    "provinceId": 24,
    "name": "Phường Trung Tâm (Bắc Giang)"
  },
  {
    "id": 2404,
    "provinceId": 24,
    "name": "Xã Hòa Bình (Bắc Giang)"
  },
  {
    "id": 2405,
    "provinceId": 24,
    "name": "Xã Tân Phong (Bắc Giang)"
  },
  {
    "id": 2501,
    "provinceId": 25,
    "name": "Phường 1 (Phú Thọ)"
  },
  {
    "id": 2502,
    "provinceId": 25,
    "name": "Phường 2 (Phú Thọ)"
  },
  {
    "id": 2503,
    "provinceId": 25,
    "name": "Phường Trung Tâm (Phú Thọ)"
  },
  {
    "id": 2504,
    "provinceId": 25,
    "name": "Xã Hòa Bình (Phú Thọ)"
  },
  {
    "id": 2505,
    "provinceId": 25,
    "name": "Xã Tân Phong (Phú Thọ)"
  },
  {
    "id": 2601,
    "provinceId": 26,
    "name": "Phường 1 (Vĩnh Phúc)"
  },
  {
    "id": 2602,
    "provinceId": 26,
    "name": "Phường 2 (Vĩnh Phúc)"
  },
  {
    "id": 2603,
    "provinceId": 26,
    "name": "Phường Trung Tâm (Vĩnh Phúc)"
  },
  {
    "id": 2604,
    "provinceId": 26,
    "name": "Xã Hòa Bình (Vĩnh Phúc)"
  },
  {
    "id": 2605,
    "provinceId": 26,
    "name": "Xã Tân Phong (Vĩnh Phúc)"
  },
  {
    "id": 2701,
    "provinceId": 27,
    "name": "Phường Tiền An"
  },
  {
    "id": 2702,
    "provinceId": 27,
    "name": "Phường Suối Hoa"
  },
  {
    "id": 2703,
    "provinceId": 27,
    "name": "Phường Đại Phúc"
  },
  {
    "id": 2704,
    "provinceId": 27,
    "name": "Phường Võ Cường"
  },
  {
    "id": 2705,
    "provinceId": 27,
    "name": "Phường Đông Ngàn (Từ Sơn)"
  },
  {
    "id": 2706,
    "provinceId": 27,
    "name": "Phường Đồng Kỵ"
  },
  {
    "id": 3001,
    "provinceId": 30,
    "name": "Phường 1 (Hải Dương)"
  },
  {
    "id": 3002,
    "provinceId": 30,
    "name": "Phường 2 (Hải Dương)"
  },
  {
    "id": 3003,
    "provinceId": 30,
    "name": "Phường Trung Tâm (Hải Dương)"
  },
  {
    "id": 3004,
    "provinceId": 30,
    "name": "Xã Hòa Bình (Hải Dương)"
  },
  {
    "id": 3005,
    "provinceId": 30,
    "name": "Xã Tân Phong (Hải Dương)"
  },
  {
    "id": 3301,
    "provinceId": 33,
    "name": "Phường 1 (Hưng Yên)"
  },
  {
    "id": 3302,
    "provinceId": 33,
    "name": "Phường 2 (Hưng Yên)"
  },
  {
    "id": 3303,
    "provinceId": 33,
    "name": "Phường Trung Tâm (Hưng Yên)"
  },
  {
    "id": 3304,
    "provinceId": 33,
    "name": "Xã Hòa Bình (Hưng Yên)"
  },
  {
    "id": 3305,
    "provinceId": 33,
    "name": "Xã Tân Phong (Hưng Yên)"
  },
  {
    "id": 3401,
    "provinceId": 34,
    "name": "Phường 1 (Thái Bình)"
  },
  {
    "id": 3402,
    "provinceId": 34,
    "name": "Phường 2 (Thái Bình)"
  },
  {
    "id": 3403,
    "provinceId": 34,
    "name": "Phường Trung Tâm (Thái Bình)"
  },
  {
    "id": 3404,
    "provinceId": 34,
    "name": "Xã Hòa Bình (Thái Bình)"
  },
  {
    "id": 3405,
    "provinceId": 34,
    "name": "Xã Tân Phong (Thái Bình)"
  },
  {
    "id": 3501,
    "provinceId": 35,
    "name": "Phường 1 (Hà Nam)"
  },
  {
    "id": 3502,
    "provinceId": 35,
    "name": "Phường 2 (Hà Nam)"
  },
  {
    "id": 3503,
    "provinceId": 35,
    "name": "Phường Trung Tâm (Hà Nam)"
  },
  {
    "id": 3504,
    "provinceId": 35,
    "name": "Xã Hòa Bình (Hà Nam)"
  },
  {
    "id": 3505,
    "provinceId": 35,
    "name": "Xã Tân Phong (Hà Nam)"
  },
  {
    "id": 3601,
    "provinceId": 36,
    "name": "Phường 1 (Nam Định)"
  },
  {
    "id": 3602,
    "provinceId": 36,
    "name": "Phường 2 (Nam Định)"
  },
  {
    "id": 3603,
    "provinceId": 36,
    "name": "Phường Trung Tâm (Nam Định)"
  },
  {
    "id": 3604,
    "provinceId": 36,
    "name": "Xã Hòa Bình (Nam Định)"
  },
  {
    "id": 3605,
    "provinceId": 36,
    "name": "Xã Tân Phong (Nam Định)"
  },
  {
    "id": 3701,
    "provinceId": 37,
    "name": "Phường 1 (Ninh Bình)"
  },
  {
    "id": 3702,
    "provinceId": 37,
    "name": "Phường 2 (Ninh Bình)"
  },
  {
    "id": 3703,
    "provinceId": 37,
    "name": "Phường Trung Tâm (Ninh Bình)"
  },
  {
    "id": 3704,
    "provinceId": 37,
    "name": "Xã Hòa Bình (Ninh Bình)"
  },
  {
    "id": 3705,
    "provinceId": 37,
    "name": "Xã Tân Phong (Ninh Bình)"
  },
  {
    "id": 3801,
    "provinceId": 38,
    "name": "Phường 1 (Thanh Hóa)"
  },
  {
    "id": 3802,
    "provinceId": 38,
    "name": "Phường 2 (Thanh Hóa)"
  },
  {
    "id": 3803,
    "provinceId": 38,
    "name": "Phường Trung Tâm (Thanh Hóa)"
  },
  {
    "id": 3804,
    "provinceId": 38,
    "name": "Xã Hòa Bình (Thanh Hóa)"
  },
  {
    "id": 3805,
    "provinceId": 38,
    "name": "Xã Tân Phong (Thanh Hóa)"
  },
  {
    "id": 4001,
    "provinceId": 40,
    "name": "Phường Trường Thi"
  },
  {
    "id": 4002,
    "provinceId": 40,
    "name": "Phường Hưng Dũng"
  },
  {
    "id": 4003,
    "provinceId": 40,
    "name": "Phường Lê Mao"
  },
  {
    "id": 4004,
    "provinceId": 40,
    "name": "Phường Bến Thủy"
  },
  {
    "id": 4005,
    "provinceId": 40,
    "name": "Phường Nghi Hương (Cửa Lò)"
  },
  {
    "id": 4201,
    "provinceId": 42,
    "name": "Phường 1 (Hà Tĩnh)"
  },
  {
    "id": 4202,
    "provinceId": 42,
    "name": "Phường 2 (Hà Tĩnh)"
  },
  {
    "id": 4203,
    "provinceId": 42,
    "name": "Phường Trung Tâm (Hà Tĩnh)"
  },
  {
    "id": 4204,
    "provinceId": 42,
    "name": "Xã Hòa Bình (Hà Tĩnh)"
  },
  {
    "id": 4205,
    "provinceId": 42,
    "name": "Xã Tân Phong (Hà Tĩnh)"
  },
  {
    "id": 4401,
    "provinceId": 44,
    "name": "Phường 1 (Quảng Bình)"
  },
  {
    "id": 4402,
    "provinceId": 44,
    "name": "Phường 2 (Quảng Bình)"
  },
  {
    "id": 4403,
    "provinceId": 44,
    "name": "Phường Trung Tâm (Quảng Bình)"
  },
  {
    "id": 4404,
    "provinceId": 44,
    "name": "Xã Hòa Bình (Quảng Bình)"
  },
  {
    "id": 4405,
    "provinceId": 44,
    "name": "Xã Tân Phong (Quảng Bình)"
  },
  {
    "id": 4501,
    "provinceId": 45,
    "name": "Phường 1 (Quảng Trị)"
  },
  {
    "id": 4502,
    "provinceId": 45,
    "name": "Phường 2 (Quảng Trị)"
  },
  {
    "id": 4503,
    "provinceId": 45,
    "name": "Phường Trung Tâm (Quảng Trị)"
  },
  {
    "id": 4504,
    "provinceId": 45,
    "name": "Xã Hòa Bình (Quảng Trị)"
  },
  {
    "id": 4505,
    "provinceId": 45,
    "name": "Xã Tân Phong (Quảng Trị)"
  },
  {
    "id": 4601,
    "provinceId": 46,
    "name": "Phường Vĩnh Ninh"
  },
  {
    "id": 4602,
    "provinceId": 46,
    "name": "Phường Phú Hội"
  },
  {
    "id": 4603,
    "provinceId": 46,
    "name": "Phường Thuận Hòa"
  },
  {
    "id": 4604,
    "provinceId": 46,
    "name": "Phường An Cựu"
  },
  {
    "id": 4605,
    "provinceId": 46,
    "name": "Phường Tây Lộc"
  },
  {
    "id": 4606,
    "provinceId": 46,
    "name": "Thị xã Hương Thủy"
  },
  {
    "id": 4901,
    "provinceId": 49,
    "name": "Phường 1 (Quảng Nam)"
  },
  {
    "id": 4902,
    "provinceId": 49,
    "name": "Phường 2 (Quảng Nam)"
  },
  {
    "id": 4903,
    "provinceId": 49,
    "name": "Phường Trung Tâm (Quảng Nam)"
  },
  {
    "id": 4904,
    "provinceId": 49,
    "name": "Xã Hòa Bình (Quảng Nam)"
  },
  {
    "id": 4905,
    "provinceId": 49,
    "name": "Xã Tân Phong (Quảng Nam)"
  },
  {
    "id": 5101,
    "provinceId": 51,
    "name": "Phường 1 (Quảng Ngãi)"
  },
  {
    "id": 5102,
    "provinceId": 51,
    "name": "Phường 2 (Quảng Ngãi)"
  },
  {
    "id": 5103,
    "provinceId": 51,
    "name": "Phường Trung Tâm (Quảng Ngãi)"
  },
  {
    "id": 5104,
    "provinceId": 51,
    "name": "Xã Hòa Bình (Quảng Ngãi)"
  },
  {
    "id": 5105,
    "provinceId": 51,
    "name": "Xã Tân Phong (Quảng Ngãi)"
  },
  {
    "id": 5201,
    "provinceId": 52,
    "name": "Phường 1 (Bình Định)"
  },
  {
    "id": 5202,
    "provinceId": 52,
    "name": "Phường 2 (Bình Định)"
  },
  {
    "id": 5203,
    "provinceId": 52,
    "name": "Phường Trung Tâm (Bình Định)"
  },
  {
    "id": 5204,
    "provinceId": 52,
    "name": "Xã Hòa Bình (Bình Định)"
  },
  {
    "id": 5205,
    "provinceId": 52,
    "name": "Xã Tân Phong (Bình Định)"
  },
  {
    "id": 5401,
    "provinceId": 54,
    "name": "Phường 1 (Phú Yên)"
  },
  {
    "id": 5402,
    "provinceId": 54,
    "name": "Phường 2 (Phú Yên)"
  },
  {
    "id": 5403,
    "provinceId": 54,
    "name": "Phường Trung Tâm (Phú Yên)"
  },
  {
    "id": 5404,
    "provinceId": 54,
    "name": "Xã Hòa Bình (Phú Yên)"
  },
  {
    "id": 5405,
    "provinceId": 54,
    "name": "Xã Tân Phong (Phú Yên)"
  },
  {
    "id": 5601,
    "provinceId": 56,
    "name": "Phường Lộc Thọ"
  },
  {
    "id": 5602,
    "provinceId": 56,
    "name": "Phường Vĩnh Hải"
  },
  {
    "id": 5603,
    "provinceId": 56,
    "name": "Phường Phước Hải"
  },
  {
    "id": 5604,
    "provinceId": 56,
    "name": "Phường Vĩnh Phước"
  },
  {
    "id": 5605,
    "provinceId": 56,
    "name": "Phường Cam Nghĩa"
  },
  {
    "id": 5801,
    "provinceId": 58,
    "name": "Phường 1 (Ninh Thuận)"
  },
  {
    "id": 5802,
    "provinceId": 58,
    "name": "Phường 2 (Ninh Thuận)"
  },
  {
    "id": 5803,
    "provinceId": 58,
    "name": "Phường Trung Tâm (Ninh Thuận)"
  },
  {
    "id": 5804,
    "provinceId": 58,
    "name": "Xã Hòa Bình (Ninh Thuận)"
  },
  {
    "id": 5805,
    "provinceId": 58,
    "name": "Xã Tân Phong (Ninh Thuận)"
  },
  {
    "id": 6001,
    "provinceId": 60,
    "name": "Phường 1 (Bình Thuận)"
  },
  {
    "id": 6002,
    "provinceId": 60,
    "name": "Phường 2 (Bình Thuận)"
  },
  {
    "id": 6003,
    "provinceId": 60,
    "name": "Phường Trung Tâm (Bình Thuận)"
  },
  {
    "id": 6004,
    "provinceId": 60,
    "name": "Xã Hòa Bình (Bình Thuận)"
  },
  {
    "id": 6005,
    "provinceId": 60,
    "name": "Xã Tân Phong (Bình Thuận)"
  },
  {
    "id": 6201,
    "provinceId": 62,
    "name": "Phường 1 (Kon Tum)"
  },
  {
    "id": 6202,
    "provinceId": 62,
    "name": "Phường 2 (Kon Tum)"
  },
  {
    "id": 6203,
    "provinceId": 62,
    "name": "Phường Trung Tâm (Kon Tum)"
  },
  {
    "id": 6204,
    "provinceId": 62,
    "name": "Xã Hòa Bình (Kon Tum)"
  },
  {
    "id": 6205,
    "provinceId": 62,
    "name": "Xã Tân Phong (Kon Tum)"
  },
  {
    "id": 6401,
    "provinceId": 64,
    "name": "Phường 1 (Gia Lai)"
  },
  {
    "id": 6402,
    "provinceId": 64,
    "name": "Phường 2 (Gia Lai)"
  },
  {
    "id": 6403,
    "provinceId": 64,
    "name": "Phường Trung Tâm (Gia Lai)"
  },
  {
    "id": 6404,
    "provinceId": 64,
    "name": "Xã Hòa Bình (Gia Lai)"
  },
  {
    "id": 6405,
    "provinceId": 64,
    "name": "Xã Tân Phong (Gia Lai)"
  },
  {
    "id": 6601,
    "provinceId": 66,
    "name": "Phường 1 (Đắk Lắk)"
  },
  {
    "id": 6602,
    "provinceId": 66,
    "name": "Phường 2 (Đắk Lắk)"
  },
  {
    "id": 6603,
    "provinceId": 66,
    "name": "Phường Trung Tâm (Đắk Lắk)"
  },
  {
    "id": 6604,
    "provinceId": 66,
    "name": "Xã Hòa Bình (Đắk Lắk)"
  },
  {
    "id": 6605,
    "provinceId": 66,
    "name": "Xã Tân Phong (Đắk Lắk)"
  },
  {
    "id": 6701,
    "provinceId": 67,
    "name": "Phường 1 (Đắk Nông)"
  },
  {
    "id": 6702,
    "provinceId": 67,
    "name": "Phường 2 (Đắk Nông)"
  },
  {
    "id": 6703,
    "provinceId": 67,
    "name": "Phường Trung Tâm (Đắk Nông)"
  },
  {
    "id": 6704,
    "provinceId": 67,
    "name": "Xã Hòa Bình (Đắk Nông)"
  },
  {
    "id": 6705,
    "provinceId": 67,
    "name": "Xã Tân Phong (Đắk Nông)"
  },
  {
    "id": 6801,
    "provinceId": 68,
    "name": "Phường 1 (Đà Lạt)"
  },
  {
    "id": 6802,
    "provinceId": 68,
    "name": "Phường 2 (Đà Lạt)"
  },
  {
    "id": 6803,
    "provinceId": 68,
    "name": "Phường 8 (Đà Lạt)"
  },
  {
    "id": 6804,
    "provinceId": 68,
    "name": "Phường Lộc Sơn (Bảo Lộc)"
  },
  {
    "id": 6805,
    "provinceId": 68,
    "name": "Thị trấn Liên Nghĩa"
  },
  {
    "id": 7001,
    "provinceId": 70,
    "name": "Phường 1 (Bình Phước)"
  },
  {
    "id": 7002,
    "provinceId": 70,
    "name": "Phường 2 (Bình Phước)"
  },
  {
    "id": 7003,
    "provinceId": 70,
    "name": "Phường Trung Tâm (Bình Phước)"
  },
  {
    "id": 7004,
    "provinceId": 70,
    "name": "Xã Hòa Bình (Bình Phước)"
  },
  {
    "id": 7005,
    "provinceId": 70,
    "name": "Xã Tân Phong (Bình Phước)"
  },
  {
    "id": 7201,
    "provinceId": 72,
    "name": "Phường 1 (Tây Ninh)"
  },
  {
    "id": 7202,
    "provinceId": 72,
    "name": "Phường 2 (Tây Ninh)"
  },
  {
    "id": 7203,
    "provinceId": 72,
    "name": "Phường Trung Tâm (Tây Ninh)"
  },
  {
    "id": 7204,
    "provinceId": 72,
    "name": "Xã Hòa Bình (Tây Ninh)"
  },
  {
    "id": 7205,
    "provinceId": 72,
    "name": "Xã Tân Phong (Tây Ninh)"
  },
  {
    "id": 7401,
    "provinceId": 74,
    "name": "Phường Phú Hòa"
  },
  {
    "id": 7402,
    "provinceId": 74,
    "name": "Phường Phú Cường"
  },
  {
    "id": 7403,
    "provinceId": 74,
    "name": "Phường Định Hòa"
  },
  {
    "id": 7404,
    "provinceId": 74,
    "name": "Phường Dĩ An"
  },
  {
    "id": 7405,
    "provinceId": 74,
    "name": "Phường Đông Hòa"
  },
  {
    "id": 7406,
    "provinceId": 74,
    "name": "Phường Lái Thiêu"
  },
  {
    "id": 7407,
    "provinceId": 74,
    "name": "Phường Thuận Giao"
  },
  {
    "id": 7408,
    "provinceId": 74,
    "name": "Phường Bến Cát"
  },
  {
    "id": 7501,
    "provinceId": 75,
    "name": "Phường Trảng Dài"
  },
  {
    "id": 7502,
    "provinceId": 75,
    "name": "Phường Tân Phong"
  },
  {
    "id": 7503,
    "provinceId": 75,
    "name": "Phường Quyết Thắng"
  },
  {
    "id": 7504,
    "provinceId": 75,
    "name": "Phường Long Bình"
  },
  {
    "id": 7505,
    "provinceId": 75,
    "name": "Phường Hố Nai"
  },
  {
    "id": 7506,
    "provinceId": 75,
    "name": "Phường Long Thành"
  },
  {
    "id": 7507,
    "provinceId": 75,
    "name": "Phường Nhơn Trạch"
  },
  {
    "id": 7701,
    "provinceId": 77,
    "name": "Phường 1 (Bà Rịa - Vũng Tàu)"
  },
  {
    "id": 7702,
    "provinceId": 77,
    "name": "Phường 2 (Bà Rịa - Vũng Tàu)"
  },
  {
    "id": 7703,
    "provinceId": 77,
    "name": "Phường Trung Tâm (Bà Rịa - Vũng Tàu)"
  },
  {
    "id": 7704,
    "provinceId": 77,
    "name": "Xã Hòa Bình (Bà Rịa - Vũng Tàu)"
  },
  {
    "id": 7705,
    "provinceId": 77,
    "name": "Xã Tân Phong (Bà Rịa - Vũng Tàu)"
  },
  {
    "id": 8001,
    "provinceId": 80,
    "name": "Phường 1 (Long An)"
  },
  {
    "id": 8002,
    "provinceId": 80,
    "name": "Phường 2 (Long An)"
  },
  {
    "id": 8003,
    "provinceId": 80,
    "name": "Phường Trung Tâm (Long An)"
  },
  {
    "id": 8004,
    "provinceId": 80,
    "name": "Xã Hòa Bình (Long An)"
  },
  {
    "id": 8005,
    "provinceId": 80,
    "name": "Xã Tân Phong (Long An)"
  },
  {
    "id": 8201,
    "provinceId": 82,
    "name": "Phường 1 (Tiền Giang)"
  },
  {
    "id": 8202,
    "provinceId": 82,
    "name": "Phường 2 (Tiền Giang)"
  },
  {
    "id": 8203,
    "provinceId": 82,
    "name": "Phường Trung Tâm (Tiền Giang)"
  },
  {
    "id": 8204,
    "provinceId": 82,
    "name": "Xã Hòa Bình (Tiền Giang)"
  },
  {
    "id": 8205,
    "provinceId": 82,
    "name": "Xã Tân Phong (Tiền Giang)"
  },
  {
    "id": 8301,
    "provinceId": 83,
    "name": "Phường 1 (Bến Tre)"
  },
  {
    "id": 8302,
    "provinceId": 83,
    "name": "Phường 2 (Bến Tre)"
  },
  {
    "id": 8303,
    "provinceId": 83,
    "name": "Phường Trung Tâm (Bến Tre)"
  },
  {
    "id": 8304,
    "provinceId": 83,
    "name": "Xã Hòa Bình (Bến Tre)"
  },
  {
    "id": 8305,
    "provinceId": 83,
    "name": "Xã Tân Phong (Bến Tre)"
  },
  {
    "id": 8401,
    "provinceId": 84,
    "name": "Phường 1 (Trà Vinh)"
  },
  {
    "id": 8402,
    "provinceId": 84,
    "name": "Phường 2 (Trà Vinh)"
  },
  {
    "id": 8403,
    "provinceId": 84,
    "name": "Phường Trung Tâm (Trà Vinh)"
  },
  {
    "id": 8404,
    "provinceId": 84,
    "name": "Xã Hòa Bình (Trà Vinh)"
  },
  {
    "id": 8405,
    "provinceId": 84,
    "name": "Xã Tân Phong (Trà Vinh)"
  },
  {
    "id": 8601,
    "provinceId": 86,
    "name": "Phường 1 (Vĩnh Long)"
  },
  {
    "id": 8602,
    "provinceId": 86,
    "name": "Phường 2 (Vĩnh Long)"
  },
  {
    "id": 8603,
    "provinceId": 86,
    "name": "Phường Trung Tâm (Vĩnh Long)"
  },
  {
    "id": 8604,
    "provinceId": 86,
    "name": "Xã Hòa Bình (Vĩnh Long)"
  },
  {
    "id": 8605,
    "provinceId": 86,
    "name": "Xã Tân Phong (Vĩnh Long)"
  },
  {
    "id": 8701,
    "provinceId": 87,
    "name": "Phường 1 (Đồng Tháp)"
  },
  {
    "id": 8702,
    "provinceId": 87,
    "name": "Phường 2 (Đồng Tháp)"
  },
  {
    "id": 8703,
    "provinceId": 87,
    "name": "Phường Trung Tâm (Đồng Tháp)"
  },
  {
    "id": 8704,
    "provinceId": 87,
    "name": "Xã Hòa Bình (Đồng Tháp)"
  },
  {
    "id": 8705,
    "provinceId": 87,
    "name": "Xã Tân Phong (Đồng Tháp)"
  },
  {
    "id": 8901,
    "provinceId": 89,
    "name": "Phường 1 (An Giang)"
  },
  {
    "id": 8902,
    "provinceId": 89,
    "name": "Phường 2 (An Giang)"
  },
  {
    "id": 8903,
    "provinceId": 89,
    "name": "Phường Trung Tâm (An Giang)"
  },
  {
    "id": 8904,
    "provinceId": 89,
    "name": "Xã Hòa Bình (An Giang)"
  },
  {
    "id": 8905,
    "provinceId": 89,
    "name": "Xã Tân Phong (An Giang)"
  },
  {
    "id": 9101,
    "provinceId": 91,
    "name": "Phường 1 (Kiên Giang)"
  },
  {
    "id": 9102,
    "provinceId": 91,
    "name": "Phường 2 (Kiên Giang)"
  },
  {
    "id": 9103,
    "provinceId": 91,
    "name": "Phường Trung Tâm (Kiên Giang)"
  },
  {
    "id": 9104,
    "provinceId": 91,
    "name": "Xã Hòa Bình (Kiên Giang)"
  },
  {
    "id": 9105,
    "provinceId": 91,
    "name": "Xã Tân Phong (Kiên Giang)"
  },
  {
    "id": 9301,
    "provinceId": 93,
    "name": "Phường 1 (Hậu Giang)"
  },
  {
    "id": 9302,
    "provinceId": 93,
    "name": "Phường 2 (Hậu Giang)"
  },
  {
    "id": 9303,
    "provinceId": 93,
    "name": "Phường Trung Tâm (Hậu Giang)"
  },
  {
    "id": 9304,
    "provinceId": 93,
    "name": "Xã Hòa Bình (Hậu Giang)"
  },
  {
    "id": 9305,
    "provinceId": 93,
    "name": "Xã Tân Phong (Hậu Giang)"
  },
  {
    "id": 9401,
    "provinceId": 94,
    "name": "Phường 1 (Sóc Trăng)"
  },
  {
    "id": 9402,
    "provinceId": 94,
    "name": "Phường 2 (Sóc Trăng)"
  },
  {
    "id": 9403,
    "provinceId": 94,
    "name": "Phường Trung Tâm (Sóc Trăng)"
  },
  {
    "id": 9404,
    "provinceId": 94,
    "name": "Xã Hòa Bình (Sóc Trăng)"
  },
  {
    "id": 9405,
    "provinceId": 94,
    "name": "Xã Tân Phong (Sóc Trăng)"
  },
  {
    "id": 9501,
    "provinceId": 95,
    "name": "Phường 1 (Bạc Liêu)"
  },
  {
    "id": 9502,
    "provinceId": 95,
    "name": "Phường 2 (Bạc Liêu)"
  },
  {
    "id": 9503,
    "provinceId": 95,
    "name": "Phường Trung Tâm (Bạc Liêu)"
  },
  {
    "id": 9504,
    "provinceId": 95,
    "name": "Xã Hòa Bình (Bạc Liêu)"
  },
  {
    "id": 9505,
    "provinceId": 95,
    "name": "Xã Tân Phong (Bạc Liêu)"
  },
  {
    "id": 9601,
    "provinceId": 96,
    "name": "Phường 1 (Cà Mau)"
  },
  {
    "id": 9602,
    "provinceId": 96,
    "name": "Phường 2 (Cà Mau)"
  },
  {
    "id": 9603,
    "provinceId": 96,
    "name": "Phường Trung Tâm (Cà Mau)"
  },
  {
    "id": 9604,
    "provinceId": 96,
    "name": "Xã Hòa Bình (Cà Mau)"
  },
  {
    "id": 9605,
    "provinceId": 96,
    "name": "Xã Tân Phong (Cà Mau)"
  }
];


export const getProvinces = (): Province[] => VIETNAM_PROVINCES;

export const getWardsByProvinceId = (provinceId?: number | null): Ward[] => {
  if (!provinceId) return [];
  return VIETNAM_WARDS.filter((w) => w.provinceId === Number(provinceId));
};

export const getProvinceById = (id?: number | null): Province | undefined => {
  if (!id) return undefined;
  return VIETNAM_PROVINCES.find((p) => p.id === Number(id));
};

export const getWardById = (id?: number | null): Ward | undefined => {
  if (!id) return undefined;
  return VIETNAM_WARDS.find((w) => w.id === Number(id));
};

export const getProvinceName = (id?: number | null): string => {
  const p = getProvinceById(id);
  return p ? p.name : '';
};

export const getWardName = (id?: number | null): string => {
  const w = getWardById(id);
  return w ? w.name : '';
};

export const formatFullAddress = (
  addressDetail?: string,
  wardId?: number | null,
  provinceId?: number | null
): string => {
  const parts: string[] = [];
  if (addressDetail && addressDetail.trim()) {
    parts.push(addressDetail.trim());
  }
  const wardName = getWardName(wardId);
  if (wardName) {
    parts.push(wardName);
  }
  const provinceName = getProvinceName(provinceId);
  if (provinceName) {
    parts.push(provinceName);
  }
  return parts.join(', ');
};
