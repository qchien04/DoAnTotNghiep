package com.doan.core.common.constant;

import java.util.*;

import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;

/**
 * Danh mục Địa chính 2 cấp (Tỉnh / Thành phố và Phường / Xã) của Việt Nam
 * Cố định và chuẩn hóa mã định danh số nguyên (provinceId, wardId)
 */
public final class VietnamLocationConstants {

    private VietnamLocationConstants() {
    }

    public record ProvinceItem(int id, String name, String code) {
    }

    public record WardItem(int id, int provinceId, String name) {
    }

    public static final Map<Integer, ProvinceItem> PROVINCES = new LinkedHashMap<>();
    public static final Map<Integer, WardItem> WARDS = new LinkedHashMap<>();
    public static final Map<Integer, List<WardItem>> WARDS_BY_PROVINCE = new LinkedHashMap<>();

    static {
        PROVINCES.put(1, new ProvinceItem(1, "Thành phố Hà Nội", "01"));
        PROVINCES.put(79, new ProvinceItem(79, "Thành phố Hồ Chí Minh", "79"));
        PROVINCES.put(48, new ProvinceItem(48, "Thành phố Đà Nẵng", "48"));
        PROVINCES.put(31, new ProvinceItem(31, "Thành phố Hải Phòng", "31"));
        PROVINCES.put(92, new ProvinceItem(92, "Thành phố Cần Thơ", "92"));
        PROVINCES.put(2, new ProvinceItem(2, "Tỉnh Hà Giang", "02"));
        PROVINCES.put(4, new ProvinceItem(4, "Tỉnh Cao Bằng", "04"));
        PROVINCES.put(6, new ProvinceItem(6, "Tỉnh Bắc Kạn", "06"));
        PROVINCES.put(8, new ProvinceItem(8, "Tỉnh Tuyên Quang", "08"));
        PROVINCES.put(10, new ProvinceItem(10, "Tỉnh Lào Cai", "10"));
        PROVINCES.put(11, new ProvinceItem(11, "Tỉnh Điện Biên", "11"));
        PROVINCES.put(12, new ProvinceItem(12, "Tỉnh Lai Châu", "12"));
        PROVINCES.put(14, new ProvinceItem(14, "Tỉnh Sơn La", "14"));
        PROVINCES.put(15, new ProvinceItem(15, "Tỉnh Yên Bái", "15"));
        PROVINCES.put(17, new ProvinceItem(17, "Tỉnh Hoà Bình", "17"));
        PROVINCES.put(19, new ProvinceItem(19, "Tỉnh Thái Nguyên", "19"));
        PROVINCES.put(20, new ProvinceItem(20, "Tỉnh Lạng Sơn", "20"));
        PROVINCES.put(22, new ProvinceItem(22, "Tỉnh Quảng Ninh", "22"));
        PROVINCES.put(24, new ProvinceItem(24, "Tỉnh Bắc Giang", "24"));
        PROVINCES.put(25, new ProvinceItem(25, "Tỉnh Phú Thọ", "25"));
        PROVINCES.put(26, new ProvinceItem(26, "Tỉnh Vĩnh Phúc", "26"));
        PROVINCES.put(27, new ProvinceItem(27, "Tỉnh Bắc Ninh", "27"));
        PROVINCES.put(30, new ProvinceItem(30, "Tỉnh Hải Dương", "30"));
        PROVINCES.put(33, new ProvinceItem(33, "Tỉnh Hưng Yên", "33"));
        PROVINCES.put(34, new ProvinceItem(34, "Tỉnh Thái Bình", "34"));
        PROVINCES.put(35, new ProvinceItem(35, "Tỉnh Hà Nam", "35"));
        PROVINCES.put(36, new ProvinceItem(36, "Tỉnh Nam Định", "36"));
        PROVINCES.put(37, new ProvinceItem(37, "Tỉnh Ninh Bình", "37"));
        PROVINCES.put(38, new ProvinceItem(38, "Tỉnh Thanh Hóa", "38"));
        PROVINCES.put(40, new ProvinceItem(40, "Tỉnh Nghệ An", "40"));
        PROVINCES.put(42, new ProvinceItem(42, "Tỉnh Hà Tĩnh", "42"));
        PROVINCES.put(44, new ProvinceItem(44, "Tỉnh Quảng Bình", "44"));
        PROVINCES.put(45, new ProvinceItem(45, "Tỉnh Quảng Trị", "45"));
        PROVINCES.put(46, new ProvinceItem(46, "Tỉnh Thừa Thiên Huế", "46"));
        PROVINCES.put(49, new ProvinceItem(49, "Tỉnh Quảng Nam", "49"));
        PROVINCES.put(51, new ProvinceItem(51, "Tỉnh Quảng Ngãi", "51"));
        PROVINCES.put(52, new ProvinceItem(52, "Tỉnh Bình Định", "52"));
        PROVINCES.put(54, new ProvinceItem(54, "Tỉnh Phú Yên", "54"));
        PROVINCES.put(56, new ProvinceItem(56, "Tỉnh Khánh Hòa", "56"));
        PROVINCES.put(58, new ProvinceItem(58, "Tỉnh Ninh Thuận", "58"));
        PROVINCES.put(60, new ProvinceItem(60, "Tỉnh Bình Thuận", "60"));
        PROVINCES.put(62, new ProvinceItem(62, "Tỉnh Kon Tum", "62"));
        PROVINCES.put(64, new ProvinceItem(64, "Tỉnh Gia Lai", "64"));
        PROVINCES.put(66, new ProvinceItem(66, "Tỉnh Đắk Lắk", "66"));
        PROVINCES.put(67, new ProvinceItem(67, "Tỉnh Đắk Nông", "67"));
        PROVINCES.put(68, new ProvinceItem(68, "Tỉnh Lâm Đồng", "68"));
        PROVINCES.put(70, new ProvinceItem(70, "Tỉnh Bình Phước", "70"));
        PROVINCES.put(72, new ProvinceItem(72, "Tỉnh Tây Ninh", "72"));
        PROVINCES.put(74, new ProvinceItem(74, "Tỉnh Bình Dương", "74"));
        PROVINCES.put(75, new ProvinceItem(75, "Tỉnh Đồng Nai", "75"));
        PROVINCES.put(77, new ProvinceItem(77, "Tỉnh Bà Rịa - Vũng Tàu", "77"));
        PROVINCES.put(80, new ProvinceItem(80, "Tỉnh Long An", "80"));
        PROVINCES.put(82, new ProvinceItem(82, "Tỉnh Tiền Giang", "82"));
        PROVINCES.put(83, new ProvinceItem(83, "Tỉnh Bến Tre", "83"));
        PROVINCES.put(84, new ProvinceItem(84, "Tỉnh Trà Vinh", "84"));
        PROVINCES.put(86, new ProvinceItem(86, "Tỉnh Vĩnh Long", "86"));
        PROVINCES.put(87, new ProvinceItem(87, "Tỉnh Đồng Tháp", "87"));
        PROVINCES.put(89, new ProvinceItem(89, "Tỉnh An Giang", "89"));
        PROVINCES.put(91, new ProvinceItem(91, "Tỉnh Kiên Giang", "91"));
        PROVINCES.put(93, new ProvinceItem(93, "Tỉnh Hậu Giang", "93"));
        PROVINCES.put(94, new ProvinceItem(94, "Tỉnh Sóc Trăng", "94"));
        PROVINCES.put(95, new ProvinceItem(95, "Tỉnh Bạc Liêu", "95"));
        PROVINCES.put(96, new ProvinceItem(96, "Tỉnh Cà Mau", "96"));
        WARDS.put(101, new WardItem(101, 1, "Phường Dịch Vọng Hậu"));
        WARDS.put(102, new WardItem(102, 1, "Phường Quan Hoa"));
        WARDS.put(103, new WardItem(103, 1, "Phường Nghĩa Tân"));
        WARDS.put(104, new WardItem(104, 1, "Phường Dịch Vọng"));
        WARDS.put(105, new WardItem(105, 1, "Phường Mai Dịch"));
        WARDS.put(106, new WardItem(106, 1, "Phường Láng Thượng"));
        WARDS.put(107, new WardItem(107, 1, "Phường Láng Hạ"));
        WARDS.put(108, new WardItem(108, 1, "Phường Ô Chợ Dừa"));
        WARDS.put(109, new WardItem(109, 1, "Phường Khâm Thiên"));
        WARDS.put(110, new WardItem(110, 1, "Phường Trung Tự"));
        WARDS.put(111, new WardItem(111, 1, "Phường Bách Khoa"));
        WARDS.put(112, new WardItem(112, 1, "Phường Đồng Tâm"));
        WARDS.put(113, new WardItem(113, 1, "Phường Trương Định"));
        WARDS.put(114, new WardItem(114, 1, "Phường Bạch Mai"));
        WARDS.put(115, new WardItem(115, 1, "Phường Thanh Xuân Bắc"));
        WARDS.put(116, new WardItem(116, 1, "Phường Thanh Xuân Nam"));
        WARDS.put(117, new WardItem(117, 1, "Phường Nhân Chính"));
        WARDS.put(118, new WardItem(118, 1, "Phường Khương Đình"));
        WARDS.put(119, new WardItem(119, 1, "Phường Mỹ Đình 1"));
        WARDS.put(120, new WardItem(120, 1, "Phường Mỹ Đình 2"));
        WARDS.put(121, new WardItem(121, 1, "Phường Mễ Trì"));
        WARDS.put(122, new WardItem(122, 1, "Phường Trung Văn"));
        WARDS.put(123, new WardItem(123, 1, "Phường Cổ Nhuế 1"));
        WARDS.put(124, new WardItem(124, 1, "Phường Cổ Nhuế 2"));
        WARDS.put(125, new WardItem(125, 1, "Phường Xuân Đỉnh"));
        WARDS.put(126, new WardItem(126, 1, "Phường Minh Khai"));
        WARDS.put(127, new WardItem(127, 1, "Phường Mộ Lao"));
        WARDS.put(128, new WardItem(128, 1, "Phường Văn Quán"));
        WARDS.put(129, new WardItem(129, 1, "Phường Hà Cầu"));
        WARDS.put(130, new WardItem(130, 1, "Phường Quang Trung"));
        WARDS.put(131, new WardItem(131, 1, "Phường Hàng Trống"));
        WARDS.put(132, new WardItem(132, 1, "Phường Tràng Tiền"));
        WARDS.put(133, new WardItem(133, 1, "Phường Phan Chu Trinh"));
        WARDS.put(134, new WardItem(134, 1, "Xã Kim Chung"));
        WARDS.put(135, new WardItem(135, 1, "Xã Tiền Phong"));
        WARDS.put(136, new WardItem(136, 1, "Xã An Khánh"));
        WARDS.put(137, new WardItem(137, 1, "Xã Tân Lập"));
        WARDS.put(7901, new WardItem(7901, 79, "Phường Bến Nghé"));
        WARDS.put(7902, new WardItem(7902, 79, "Phường Bến Thành"));
        WARDS.put(7903, new WardItem(7903, 79, "Phường Cầu Kho"));
        WARDS.put(7904, new WardItem(7904, 79, "Phường Đa Kao"));
        WARDS.put(7905, new WardItem(7905, 79, "Phường 1 (Quận 3)"));
        WARDS.put(7906, new WardItem(7906, 79, "Phường 2 (Quận 3)"));
        WARDS.put(7907, new WardItem(7907, 79, "Phường 4 (Quận 3)"));
        WARDS.put(7908, new WardItem(7908, 79, "Phường 25 (Bình Thạnh)"));
        WARDS.put(7909, new WardItem(7909, 79, "Phường 15 (Bình Thạnh)"));
        WARDS.put(7910, new WardItem(7910, 79, "Phường 26 (Bình Thạnh)"));
        WARDS.put(7911, new WardItem(7911, 79, "Phường 2 (Tân Bình)"));
        WARDS.put(7912, new WardItem(7912, 79, "Phường 13 (Tân Bình)"));
        WARDS.put(7913, new WardItem(7913, 79, "Phường 15 (Tân Bình)"));
        WARDS.put(7914, new WardItem(7914, 79, "Phường 14 (Quận 10)"));
        WARDS.put(7915, new WardItem(7915, 79, "Phường 12 (Quận 10)"));
        WARDS.put(7916, new WardItem(7916, 79, "Phường 15 (Quận 10)"));
        WARDS.put(7917, new WardItem(7917, 79, "Phường Tân Phong (Quận 7)"));
        WARDS.put(7918, new WardItem(7918, 79, "Phường Tân Hưng (Quận 7)"));
        WARDS.put(7919, new WardItem(7919, 79, "Phường Tân Phú (Quận 7)"));
        WARDS.put(7920, new WardItem(7920, 79, "Phường Linh Trung (Thủ Đức)"));
        WARDS.put(7921, new WardItem(7921, 79, "Phường Linh Chiểu (Thủ Đức)"));
        WARDS.put(7922, new WardItem(7922, 79, "Phường Tăng Nhơn Phú A (Thủ Đức)"));
        WARDS.put(7923, new WardItem(7923, 79, "Phường Hiệp Phú (Thủ Đức)"));
        WARDS.put(7924, new WardItem(7924, 79, "Phường Thảo Điền (Thủ Đức)"));
        WARDS.put(7925, new WardItem(7925, 79, "Phường 12 (Gò Vấp)"));
        WARDS.put(7926, new WardItem(7926, 79, "Phường 5 (Gò Vấp)"));
        WARDS.put(7927, new WardItem(7927, 79, "Phường 10 (Gò Vấp)"));
        WARDS.put(4801, new WardItem(4801, 48, "Phường Hòa Cường Bắc"));
        WARDS.put(4802, new WardItem(4802, 48, "Phường Hòa Cường Nam"));
        WARDS.put(4803, new WardItem(4803, 48, "Phường Hải Châu 1"));
        WARDS.put(4804, new WardItem(4804, 48, "Phường Thạch Thang"));
        WARDS.put(4805, new WardItem(4805, 48, "Phường Mỹ An"));
        WARDS.put(4806, new WardItem(4806, 48, "Phường Khuê Mỹ"));
        WARDS.put(4807, new WardItem(4807, 48, "Phường Hòa Hải"));
        WARDS.put(4808, new WardItem(4808, 48, "Phường An Hải Bắc"));
        WARDS.put(4809, new WardItem(4809, 48, "Phường Phước Mỹ"));
        WARDS.put(4810, new WardItem(4810, 48, "Phường Hòa Khánh Bắc"));
        WARDS.put(4811, new WardItem(4811, 48, "Phường Hòa Khánh Nam"));
        WARDS.put(4812, new WardItem(4812, 48, "Phường Hòa Minh"));
        WARDS.put(3101, new WardItem(3101, 31, "Phường Minh Khai"));
        WARDS.put(3102, new WardItem(3102, 31, "Phường Hoàng Văn Thụ"));
        WARDS.put(3103, new WardItem(3103, 31, "Phường Lạch Tray"));
        WARDS.put(3104, new WardItem(3104, 31, "Phường Đằng Giang"));
        WARDS.put(3105, new WardItem(3105, 31, "Phường Cầu Tre"));
        WARDS.put(3106, new WardItem(3106, 31, "Phường Vạn Mỹ"));
        WARDS.put(3107, new WardItem(3107, 31, "Phường Niệm Nghĩa"));
        WARDS.put(3108, new WardItem(3108, 31, "Phường Quán Toan"));
        WARDS.put(9201, new WardItem(9201, 92, "Phường An Khánh"));
        WARDS.put(9202, new WardItem(9202, 92, "Phường Xuân Khánh"));
        WARDS.put(9203, new WardItem(9203, 92, "Phường Hưng Lợi"));
        WARDS.put(9204, new WardItem(9204, 92, "Phường Tân An"));
        WARDS.put(9205, new WardItem(9205, 92, "Phường Cái Khế"));
        WARDS.put(9206, new WardItem(9206, 92, "Phường Trà Nóc"));
        WARDS.put(9207, new WardItem(9207, 92, "Phường Lê Bình"));
        WARDS.put(201, new WardItem(201, 2, "Phường 1 (Hà Giang)"));
        WARDS.put(202, new WardItem(202, 2, "Phường 2 (Hà Giang)"));
        WARDS.put(203, new WardItem(203, 2, "Phường Trung Tâm (Hà Giang)"));
        WARDS.put(204, new WardItem(204, 2, "Xã Hòa Bình (Hà Giang)"));
        WARDS.put(205, new WardItem(205, 2, "Xã Tân Phong (Hà Giang)"));
        WARDS.put(401, new WardItem(401, 4, "Phường 1 (Cao Bằng)"));
        WARDS.put(402, new WardItem(402, 4, "Phường 2 (Cao Bằng)"));
        WARDS.put(403, new WardItem(403, 4, "Phường Trung Tâm (Cao Bằng)"));
        WARDS.put(404, new WardItem(404, 4, "Xã Hòa Bình (Cao Bằng)"));
        WARDS.put(405, new WardItem(405, 4, "Xã Tân Phong (Cao Bằng)"));
        WARDS.put(601, new WardItem(601, 6, "Phường 1 (Bắc Kạn)"));
        WARDS.put(602, new WardItem(602, 6, "Phường 2 (Bắc Kạn)"));
        WARDS.put(603, new WardItem(603, 6, "Phường Trung Tâm (Bắc Kạn)"));
        WARDS.put(604, new WardItem(604, 6, "Xã Hòa Bình (Bắc Kạn)"));
        WARDS.put(605, new WardItem(605, 6, "Xã Tân Phong (Bắc Kạn)"));
        WARDS.put(801, new WardItem(801, 8, "Phường 1 (Tuyên Quang)"));
        WARDS.put(802, new WardItem(802, 8, "Phường 2 (Tuyên Quang)"));
        WARDS.put(803, new WardItem(803, 8, "Phường Trung Tâm (Tuyên Quang)"));
        WARDS.put(804, new WardItem(804, 8, "Xã Hòa Bình (Tuyên Quang)"));
        WARDS.put(805, new WardItem(805, 8, "Xã Tân Phong (Tuyên Quang)"));
        WARDS.put(1001, new WardItem(1001, 10, "Phường 1 (Lào Cai)"));
        WARDS.put(1002, new WardItem(1002, 10, "Phường 2 (Lào Cai)"));
        WARDS.put(1003, new WardItem(1003, 10, "Phường Trung Tâm (Lào Cai)"));
        WARDS.put(1004, new WardItem(1004, 10, "Xã Hòa Bình (Lào Cai)"));
        WARDS.put(1005, new WardItem(1005, 10, "Xã Tân Phong (Lào Cai)"));
        WARDS.put(1101, new WardItem(1101, 11, "Phường 1 (Điện Biên)"));
        WARDS.put(1102, new WardItem(1102, 11, "Phường 2 (Điện Biên)"));
        WARDS.put(1103, new WardItem(1103, 11, "Phường Trung Tâm (Điện Biên)"));
        WARDS.put(1104, new WardItem(1104, 11, "Xã Hòa Bình (Điện Biên)"));
        WARDS.put(1105, new WardItem(1105, 11, "Xã Tân Phong (Điện Biên)"));
        WARDS.put(1201, new WardItem(1201, 12, "Phường 1 (Lai Châu)"));
        WARDS.put(1202, new WardItem(1202, 12, "Phường 2 (Lai Châu)"));
        WARDS.put(1203, new WardItem(1203, 12, "Phường Trung Tâm (Lai Châu)"));
        WARDS.put(1204, new WardItem(1204, 12, "Xã Hòa Bình (Lai Châu)"));
        WARDS.put(1205, new WardItem(1205, 12, "Xã Tân Phong (Lai Châu)"));
        WARDS.put(1401, new WardItem(1401, 14, "Phường 1 (Sơn La)"));
        WARDS.put(1402, new WardItem(1402, 14, "Phường 2 (Sơn La)"));
        WARDS.put(1403, new WardItem(1403, 14, "Phường Trung Tâm (Sơn La)"));
        WARDS.put(1404, new WardItem(1404, 14, "Xã Hòa Bình (Sơn La)"));
        WARDS.put(1405, new WardItem(1405, 14, "Xã Tân Phong (Sơn La)"));
        WARDS.put(1501, new WardItem(1501, 15, "Phường 1 (Yên Bái)"));
        WARDS.put(1502, new WardItem(1502, 15, "Phường 2 (Yên Bái)"));
        WARDS.put(1503, new WardItem(1503, 15, "Phường Trung Tâm (Yên Bái)"));
        WARDS.put(1504, new WardItem(1504, 15, "Xã Hòa Bình (Yên Bái)"));
        WARDS.put(1505, new WardItem(1505, 15, "Xã Tân Phong (Yên Bái)"));
        WARDS.put(1701, new WardItem(1701, 17, "Phường 1 (Hoà Bình)"));
        WARDS.put(1702, new WardItem(1702, 17, "Phường 2 (Hoà Bình)"));
        WARDS.put(1703, new WardItem(1703, 17, "Phường Trung Tâm (Hoà Bình)"));
        WARDS.put(1704, new WardItem(1704, 17, "Xã Hòa Bình (Hoà Bình)"));
        WARDS.put(1705, new WardItem(1705, 17, "Xã Tân Phong (Hoà Bình)"));
        WARDS.put(1901, new WardItem(1901, 19, "Phường Quang Trung"));
        WARDS.put(1902, new WardItem(1902, 19, "Phường Phan Đình Phùng"));
        WARDS.put(1903, new WardItem(1903, 19, "Phường Tân Lập"));
        WARDS.put(1904, new WardItem(1904, 19, "Phường Hoàng Văn Thụ"));
        WARDS.put(1905, new WardItem(1905, 19, "Phường Tích Lương"));
        WARDS.put(2001, new WardItem(2001, 20, "Phường 1 (Lạng Sơn)"));
        WARDS.put(2002, new WardItem(2002, 20, "Phường 2 (Lạng Sơn)"));
        WARDS.put(2003, new WardItem(2003, 20, "Phường Trung Tâm (Lạng Sơn)"));
        WARDS.put(2004, new WardItem(2004, 20, "Xã Hòa Bình (Lạng Sơn)"));
        WARDS.put(2005, new WardItem(2005, 20, "Xã Tân Phong (Lạng Sơn)"));
        WARDS.put(2201, new WardItem(2201, 22, "Phường Bãi Cháy"));
        WARDS.put(2202, new WardItem(2202, 22, "Phường Hồng Gai"));
        WARDS.put(2203, new WardItem(2203, 22, "Phường Bạch Đằng"));
        WARDS.put(2204, new WardItem(2204, 22, "Phường Cao Xanh"));
        WARDS.put(2205, new WardItem(2205, 22, "Phường Cẩm Thành"));
        WARDS.put(2206, new WardItem(2206, 22, "Phường Uông Bí"));
        WARDS.put(2401, new WardItem(2401, 24, "Phường 1 (Bắc Giang)"));
        WARDS.put(2402, new WardItem(2402, 24, "Phường 2 (Bắc Giang)"));
        WARDS.put(2403, new WardItem(2403, 24, "Phường Trung Tâm (Bắc Giang)"));
        WARDS.put(2404, new WardItem(2404, 24, "Xã Hòa Bình (Bắc Giang)"));
        WARDS.put(2405, new WardItem(2405, 24, "Xã Tân Phong (Bắc Giang)"));
        WARDS.put(2501, new WardItem(2501, 25, "Phường 1 (Phú Thọ)"));
        WARDS.put(2502, new WardItem(2502, 25, "Phường 2 (Phú Thọ)"));
        WARDS.put(2503, new WardItem(2503, 25, "Phường Trung Tâm (Phú Thọ)"));
        WARDS.put(2504, new WardItem(2504, 25, "Xã Hòa Bình (Phú Thọ)"));
        WARDS.put(2505, new WardItem(2505, 25, "Xã Tân Phong (Phú Thọ)"));
        WARDS.put(2601, new WardItem(2601, 26, "Phường 1 (Vĩnh Phúc)"));
        WARDS.put(2602, new WardItem(2602, 26, "Phường 2 (Vĩnh Phúc)"));
        WARDS.put(2603, new WardItem(2603, 26, "Phường Trung Tâm (Vĩnh Phúc)"));
        WARDS.put(2604, new WardItem(2604, 26, "Xã Hòa Bình (Vĩnh Phúc)"));
        WARDS.put(2605, new WardItem(2605, 26, "Xã Tân Phong (Vĩnh Phúc)"));
        WARDS.put(2701, new WardItem(2701, 27, "Phường Tiền An"));
        WARDS.put(2702, new WardItem(2702, 27, "Phường Suối Hoa"));
        WARDS.put(2703, new WardItem(2703, 27, "Phường Đại Phúc"));
        WARDS.put(2704, new WardItem(2704, 27, "Phường Võ Cường"));
        WARDS.put(2705, new WardItem(2705, 27, "Phường Đông Ngàn (Từ Sơn)"));
        WARDS.put(2706, new WardItem(2706, 27, "Phường Đồng Kỵ"));
        WARDS.put(3001, new WardItem(3001, 30, "Phường 1 (Hải Dương)"));
        WARDS.put(3002, new WardItem(3002, 30, "Phường 2 (Hải Dương)"));
        WARDS.put(3003, new WardItem(3003, 30, "Phường Trung Tâm (Hải Dương)"));
        WARDS.put(3004, new WardItem(3004, 30, "Xã Hòa Bình (Hải Dương)"));
        WARDS.put(3005, new WardItem(3005, 30, "Xã Tân Phong (Hải Dương)"));
        WARDS.put(3301, new WardItem(3301, 33, "Phường 1 (Hưng Yên)"));
        WARDS.put(3302, new WardItem(3302, 33, "Phường 2 (Hưng Yên)"));
        WARDS.put(3303, new WardItem(3303, 33, "Phường Trung Tâm (Hưng Yên)"));
        WARDS.put(3304, new WardItem(3304, 33, "Xã Hòa Bình (Hưng Yên)"));
        WARDS.put(3305, new WardItem(3305, 33, "Xã Tân Phong (Hưng Yên)"));
        WARDS.put(3401, new WardItem(3401, 34, "Phường 1 (Thái Bình)"));
        WARDS.put(3402, new WardItem(3402, 34, "Phường 2 (Thái Bình)"));
        WARDS.put(3403, new WardItem(3403, 34, "Phường Trung Tâm (Thái Bình)"));
        WARDS.put(3404, new WardItem(3404, 34, "Xã Hòa Bình (Thái Bình)"));
        WARDS.put(3405, new WardItem(3405, 34, "Xã Tân Phong (Thái Bình)"));
        WARDS.put(3501, new WardItem(3501, 35, "Phường 1 (Hà Nam)"));
        WARDS.put(3502, new WardItem(3502, 35, "Phường 2 (Hà Nam)"));
        WARDS.put(3503, new WardItem(3503, 35, "Phường Trung Tâm (Hà Nam)"));
        WARDS.put(3504, new WardItem(3504, 35, "Xã Hòa Bình (Hà Nam)"));
        WARDS.put(3505, new WardItem(3505, 35, "Xã Tân Phong (Hà Nam)"));
        WARDS.put(3601, new WardItem(3601, 36, "Phường 1 (Nam Định)"));
        WARDS.put(3602, new WardItem(3602, 36, "Phường 2 (Nam Định)"));
        WARDS.put(3603, new WardItem(3603, 36, "Phường Trung Tâm (Nam Định)"));
        WARDS.put(3604, new WardItem(3604, 36, "Xã Hòa Bình (Nam Định)"));
        WARDS.put(3605, new WardItem(3605, 36, "Xã Tân Phong (Nam Định)"));
        WARDS.put(3701, new WardItem(3701, 37, "Phường 1 (Ninh Bình)"));
        WARDS.put(3702, new WardItem(3702, 37, "Phường 2 (Ninh Bình)"));
        WARDS.put(3703, new WardItem(3703, 37, "Phường Trung Tâm (Ninh Bình)"));
        WARDS.put(3704, new WardItem(3704, 37, "Xã Hòa Bình (Ninh Bình)"));
        WARDS.put(3705, new WardItem(3705, 37, "Xã Tân Phong (Ninh Bình)"));
        WARDS.put(3801, new WardItem(3801, 38, "Phường 1 (Thanh Hóa)"));
        WARDS.put(3802, new WardItem(3802, 38, "Phường 2 (Thanh Hóa)"));
        WARDS.put(3803, new WardItem(3803, 38, "Phường Trung Tâm (Thanh Hóa)"));
        WARDS.put(3804, new WardItem(3804, 38, "Xã Hòa Bình (Thanh Hóa)"));
        WARDS.put(3805, new WardItem(3805, 38, "Xã Tân Phong (Thanh Hóa)"));
        WARDS.put(4001, new WardItem(4001, 40, "Phường Trường Thi"));
        WARDS.put(4002, new WardItem(4002, 40, "Phường Hưng Dũng"));
        WARDS.put(4003, new WardItem(4003, 40, "Phường Lê Mao"));
        WARDS.put(4004, new WardItem(4004, 40, "Phường Bến Thủy"));
        WARDS.put(4005, new WardItem(4005, 40, "Phường Nghi Hương (Cửa Lò)"));
        WARDS.put(4201, new WardItem(4201, 42, "Phường 1 (Hà Tĩnh)"));
        WARDS.put(4202, new WardItem(4202, 42, "Phường 2 (Hà Tĩnh)"));
        WARDS.put(4203, new WardItem(4203, 42, "Phường Trung Tâm (Hà Tĩnh)"));
        WARDS.put(4204, new WardItem(4204, 42, "Xã Hòa Bình (Hà Tĩnh)"));
        WARDS.put(4205, new WardItem(4205, 42, "Xã Tân Phong (Hà Tĩnh)"));
        WARDS.put(4401, new WardItem(4401, 44, "Phường 1 (Quảng Bình)"));
        WARDS.put(4402, new WardItem(4402, 44, "Phường 2 (Quảng Bình)"));
        WARDS.put(4403, new WardItem(4403, 44, "Phường Trung Tâm (Quảng Bình)"));
        WARDS.put(4404, new WardItem(4404, 44, "Xã Hòa Bình (Quảng Bình)"));
        WARDS.put(4405, new WardItem(4405, 44, "Xã Tân Phong (Quảng Bình)"));
        WARDS.put(4501, new WardItem(4501, 45, "Phường 1 (Quảng Trị)"));
        WARDS.put(4502, new WardItem(4502, 45, "Phường 2 (Quảng Trị)"));
        WARDS.put(4503, new WardItem(4503, 45, "Phường Trung Tâm (Quảng Trị)"));
        WARDS.put(4504, new WardItem(4504, 45, "Xã Hòa Bình (Quảng Trị)"));
        WARDS.put(4505, new WardItem(4505, 45, "Xã Tân Phong (Quảng Trị)"));
        WARDS.put(4601, new WardItem(4601, 46, "Phường Vĩnh Ninh"));
        WARDS.put(4602, new WardItem(4602, 46, "Phường Phú Hội"));
        WARDS.put(4603, new WardItem(4603, 46, "Phường Thuận Hòa"));
        WARDS.put(4604, new WardItem(4604, 46, "Phường An Cựu"));
        WARDS.put(4605, new WardItem(4605, 46, "Phường Tây Lộc"));
        WARDS.put(4606, new WardItem(4606, 46, "Thị xã Hương Thủy"));
        WARDS.put(4901, new WardItem(4901, 49, "Phường 1 (Quảng Nam)"));
        WARDS.put(4902, new WardItem(4902, 49, "Phường 2 (Quảng Nam)"));
        WARDS.put(4903, new WardItem(4903, 49, "Phường Trung Tâm (Quảng Nam)"));
        WARDS.put(4904, new WardItem(4904, 49, "Xã Hòa Bình (Quảng Nam)"));
        WARDS.put(4905, new WardItem(4905, 49, "Xã Tân Phong (Quảng Nam)"));
        WARDS.put(5101, new WardItem(5101, 51, "Phường 1 (Quảng Ngãi)"));
        WARDS.put(5102, new WardItem(5102, 51, "Phường 2 (Quảng Ngãi)"));
        WARDS.put(5103, new WardItem(5103, 51, "Phường Trung Tâm (Quảng Ngãi)"));
        WARDS.put(5104, new WardItem(5104, 51, "Xã Hòa Bình (Quảng Ngãi)"));
        WARDS.put(5105, new WardItem(5105, 51, "Xã Tân Phong (Quảng Ngãi)"));
        WARDS.put(5201, new WardItem(5201, 52, "Phường 1 (Bình Định)"));
        WARDS.put(5202, new WardItem(5202, 52, "Phường 2 (Bình Định)"));
        WARDS.put(5203, new WardItem(5203, 52, "Phường Trung Tâm (Bình Định)"));
        WARDS.put(5204, new WardItem(5204, 52, "Xã Hòa Bình (Bình Định)"));
        WARDS.put(5205, new WardItem(5205, 52, "Xã Tân Phong (Bình Định)"));
        WARDS.put(5401, new WardItem(5401, 54, "Phường 1 (Phú Yên)"));
        WARDS.put(5402, new WardItem(5402, 54, "Phường 2 (Phú Yên)"));
        WARDS.put(5403, new WardItem(5403, 54, "Phường Trung Tâm (Phú Yên)"));
        WARDS.put(5404, new WardItem(5404, 54, "Xã Hòa Bình (Phú Yên)"));
        WARDS.put(5405, new WardItem(5405, 54, "Xã Tân Phong (Phú Yên)"));
        WARDS.put(5601, new WardItem(5601, 56, "Phường Lộc Thọ"));
        WARDS.put(5602, new WardItem(5602, 56, "Phường Vĩnh Hải"));
        WARDS.put(5603, new WardItem(5603, 56, "Phường Phước Hải"));
        WARDS.put(5604, new WardItem(5604, 56, "Phường Vĩnh Phước"));
        WARDS.put(5605, new WardItem(5605, 56, "Phường Cam Nghĩa"));
        WARDS.put(5801, new WardItem(5801, 58, "Phường 1 (Ninh Thuận)"));
        WARDS.put(5802, new WardItem(5802, 58, "Phường 2 (Ninh Thuận)"));
        WARDS.put(5803, new WardItem(5803, 58, "Phường Trung Tâm (Ninh Thuận)"));
        WARDS.put(5804, new WardItem(5804, 58, "Xã Hòa Bình (Ninh Thuận)"));
        WARDS.put(5805, new WardItem(5805, 58, "Xã Tân Phong (Ninh Thuận)"));
        WARDS.put(6001, new WardItem(6001, 60, "Phường 1 (Bình Thuận)"));
        WARDS.put(6002, new WardItem(6002, 60, "Phường 2 (Bình Thuận)"));
        WARDS.put(6003, new WardItem(6003, 60, "Phường Trung Tâm (Bình Thuận)"));
        WARDS.put(6004, new WardItem(6004, 60, "Xã Hòa Bình (Bình Thuận)"));
        WARDS.put(6005, new WardItem(6005, 60, "Xã Tân Phong (Bình Thuận)"));
        WARDS.put(6201, new WardItem(6201, 62, "Phường 1 (Kon Tum)"));
        WARDS.put(6202, new WardItem(6202, 62, "Phường 2 (Kon Tum)"));
        WARDS.put(6203, new WardItem(6203, 62, "Phường Trung Tâm (Kon Tum)"));
        WARDS.put(6204, new WardItem(6204, 62, "Xã Hòa Bình (Kon Tum)"));
        WARDS.put(6205, new WardItem(6205, 62, "Xã Tân Phong (Kon Tum)"));
        WARDS.put(6401, new WardItem(6401, 64, "Phường 1 (Gia Lai)"));
        WARDS.put(6402, new WardItem(6402, 64, "Phường 2 (Gia Lai)"));
        WARDS.put(6403, new WardItem(6403, 64, "Phường Trung Tâm (Gia Lai)"));
        WARDS.put(6404, new WardItem(6404, 64, "Xã Hòa Bình (Gia Lai)"));
        WARDS.put(6405, new WardItem(6405, 64, "Xã Tân Phong (Gia Lai)"));
        WARDS.put(6601, new WardItem(6601, 66, "Phường 1 (Đắk Lắk)"));
        WARDS.put(6602, new WardItem(6602, 66, "Phường 2 (Đắk Lắk)"));
        WARDS.put(6603, new WardItem(6603, 66, "Phường Trung Tâm (Đắk Lắk)"));
        WARDS.put(6604, new WardItem(6604, 66, "Xã Hòa Bình (Đắk Lắk)"));
        WARDS.put(6605, new WardItem(6605, 66, "Xã Tân Phong (Đắk Lắk)"));
        WARDS.put(6701, new WardItem(6701, 67, "Phường 1 (Đắk Nông)"));
        WARDS.put(6702, new WardItem(6702, 67, "Phường 2 (Đắk Nông)"));
        WARDS.put(6703, new WardItem(6703, 67, "Phường Trung Tâm (Đắk Nông)"));
        WARDS.put(6704, new WardItem(6704, 67, "Xã Hòa Bình (Đắk Nông)"));
        WARDS.put(6705, new WardItem(6705, 67, "Xã Tân Phong (Đắk Nông)"));
        WARDS.put(6801, new WardItem(6801, 68, "Phường 1 (Đà Lạt)"));
        WARDS.put(6802, new WardItem(6802, 68, "Phường 2 (Đà Lạt)"));
        WARDS.put(6803, new WardItem(6803, 68, "Phường 8 (Đà Lạt)"));
        WARDS.put(6804, new WardItem(6804, 68, "Phường Lộc Sơn (Bảo Lộc)"));
        WARDS.put(6805, new WardItem(6805, 68, "Thị trấn Liên Nghĩa"));
        WARDS.put(7001, new WardItem(7001, 70, "Phường 1 (Bình Phước)"));
        WARDS.put(7002, new WardItem(7002, 70, "Phường 2 (Bình Phước)"));
        WARDS.put(7003, new WardItem(7003, 70, "Phường Trung Tâm (Bình Phước)"));
        WARDS.put(7004, new WardItem(7004, 70, "Xã Hòa Bình (Bình Phước)"));
        WARDS.put(7005, new WardItem(7005, 70, "Xã Tân Phong (Bình Phước)"));
        WARDS.put(7201, new WardItem(7201, 72, "Phường 1 (Tây Ninh)"));
        WARDS.put(7202, new WardItem(7202, 72, "Phường 2 (Tây Ninh)"));
        WARDS.put(7203, new WardItem(7203, 72, "Phường Trung Tâm (Tây Ninh)"));
        WARDS.put(7204, new WardItem(7204, 72, "Xã Hòa Bình (Tây Ninh)"));
        WARDS.put(7205, new WardItem(7205, 72, "Xã Tân Phong (Tây Ninh)"));
        WARDS.put(7401, new WardItem(7401, 74, "Phường Phú Hòa"));
        WARDS.put(7402, new WardItem(7402, 74, "Phường Phú Cường"));
        WARDS.put(7403, new WardItem(7403, 74, "Phường Định Hòa"));
        WARDS.put(7404, new WardItem(7404, 74, "Phường Dĩ An"));
        WARDS.put(7405, new WardItem(7405, 74, "Phường Đông Hòa"));
        WARDS.put(7406, new WardItem(7406, 74, "Phường Lái Thiêu"));
        WARDS.put(7407, new WardItem(7407, 74, "Phường Thuận Giao"));
        WARDS.put(7408, new WardItem(7408, 74, "Phường Bến Cát"));
        WARDS.put(7501, new WardItem(7501, 75, "Phường Trảng Dài"));
        WARDS.put(7502, new WardItem(7502, 75, "Phường Tân Phong"));
        WARDS.put(7503, new WardItem(7503, 75, "Phường Quyết Thắng"));
        WARDS.put(7504, new WardItem(7504, 75, "Phường Long Bình"));
        WARDS.put(7505, new WardItem(7505, 75, "Phường Hố Nai"));
        WARDS.put(7506, new WardItem(7506, 75, "Phường Long Thành"));
        WARDS.put(7507, new WardItem(7507, 75, "Phường Nhơn Trạch"));
        WARDS.put(7701, new WardItem(7701, 77, "Phường 1 (Bà Rịa - Vũng Tàu)"));
        WARDS.put(7702, new WardItem(7702, 77, "Phường 2 (Bà Rịa - Vũng Tàu)"));
        WARDS.put(7703, new WardItem(7703, 77, "Phường Trung Tâm (Bà Rịa - Vũng Tàu)"));
        WARDS.put(7704, new WardItem(7704, 77, "Xã Hòa Bình (Bà Rịa - Vũng Tàu)"));
        WARDS.put(7705, new WardItem(7705, 77, "Xã Tân Phong (Bà Rịa - Vũng Tàu)"));
        WARDS.put(8001, new WardItem(8001, 80, "Phường 1 (Long An)"));
        WARDS.put(8002, new WardItem(8002, 80, "Phường 2 (Long An)"));
        WARDS.put(8003, new WardItem(8003, 80, "Phường Trung Tâm (Long An)"));
        WARDS.put(8004, new WardItem(8004, 80, "Xã Hòa Bình (Long An)"));
        WARDS.put(8005, new WardItem(8005, 80, "Xã Tân Phong (Long An)"));
        WARDS.put(8201, new WardItem(8201, 82, "Phường 1 (Tiền Giang)"));
        WARDS.put(8202, new WardItem(8202, 82, "Phường 2 (Tiền Giang)"));
        WARDS.put(8203, new WardItem(8203, 82, "Phường Trung Tâm (Tiền Giang)"));
        WARDS.put(8204, new WardItem(8204, 82, "Xã Hòa Bình (Tiền Giang)"));
        WARDS.put(8205, new WardItem(8205, 82, "Xã Tân Phong (Tiền Giang)"));
        WARDS.put(8301, new WardItem(8301, 83, "Phường 1 (Bến Tre)"));
        WARDS.put(8302, new WardItem(8302, 83, "Phường 2 (Bến Tre)"));
        WARDS.put(8303, new WardItem(8303, 83, "Phường Trung Tâm (Bến Tre)"));
        WARDS.put(8304, new WardItem(8304, 83, "Xã Hòa Bình (Bến Tre)"));
        WARDS.put(8305, new WardItem(8305, 83, "Xã Tân Phong (Bến Tre)"));
        WARDS.put(8401, new WardItem(8401, 84, "Phường 1 (Trà Vinh)"));
        WARDS.put(8402, new WardItem(8402, 84, "Phường 2 (Trà Vinh)"));
        WARDS.put(8403, new WardItem(8403, 84, "Phường Trung Tâm (Trà Vinh)"));
        WARDS.put(8404, new WardItem(8404, 84, "Xã Hòa Bình (Trà Vinh)"));
        WARDS.put(8405, new WardItem(8405, 84, "Xã Tân Phong (Trà Vinh)"));
        WARDS.put(8601, new WardItem(8601, 86, "Phường 1 (Vĩnh Long)"));
        WARDS.put(8602, new WardItem(8602, 86, "Phường 2 (Vĩnh Long)"));
        WARDS.put(8603, new WardItem(8603, 86, "Phường Trung Tâm (Vĩnh Long)"));
        WARDS.put(8604, new WardItem(8604, 86, "Xã Hòa Bình (Vĩnh Long)"));
        WARDS.put(8605, new WardItem(8605, 86, "Xã Tân Phong (Vĩnh Long)"));
        WARDS.put(8701, new WardItem(8701, 87, "Phường 1 (Đồng Tháp)"));
        WARDS.put(8702, new WardItem(8702, 87, "Phường 2 (Đồng Tháp)"));
        WARDS.put(8703, new WardItem(8703, 87, "Phường Trung Tâm (Đồng Tháp)"));
        WARDS.put(8704, new WardItem(8704, 87, "Xã Hòa Bình (Đồng Tháp)"));
        WARDS.put(8705, new WardItem(8705, 87, "Xã Tân Phong (Đồng Tháp)"));
        WARDS.put(8901, new WardItem(8901, 89, "Phường 1 (An Giang)"));
        WARDS.put(8902, new WardItem(8902, 89, "Phường 2 (An Giang)"));
        WARDS.put(8903, new WardItem(8903, 89, "Phường Trung Tâm (An Giang)"));
        WARDS.put(8904, new WardItem(8904, 89, "Xã Hòa Bình (An Giang)"));
        WARDS.put(8905, new WardItem(8905, 89, "Xã Tân Phong (An Giang)"));
        WARDS.put(9101, new WardItem(9101, 91, "Phường 1 (Kiên Giang)"));
        WARDS.put(9102, new WardItem(9102, 91, "Phường 2 (Kiên Giang)"));
        WARDS.put(9103, new WardItem(9103, 91, "Phường Trung Tâm (Kiên Giang)"));
        WARDS.put(9104, new WardItem(9104, 91, "Xã Hòa Bình (Kiên Giang)"));
        WARDS.put(9105, new WardItem(9105, 91, "Xã Tân Phong (Kiên Giang)"));
        WARDS.put(9301, new WardItem(9301, 93, "Phường 1 (Hậu Giang)"));
        WARDS.put(9302, new WardItem(9302, 93, "Phường 2 (Hậu Giang)"));
        WARDS.put(9303, new WardItem(9303, 93, "Phường Trung Tâm (Hậu Giang)"));
        WARDS.put(9304, new WardItem(9304, 93, "Xã Hòa Bình (Hậu Giang)"));
        WARDS.put(9305, new WardItem(9305, 93, "Xã Tân Phong (Hậu Giang)"));
        WARDS.put(9401, new WardItem(9401, 94, "Phường 1 (Sóc Trăng)"));
        WARDS.put(9402, new WardItem(9402, 94, "Phường 2 (Sóc Trăng)"));
        WARDS.put(9403, new WardItem(9403, 94, "Phường Trung Tâm (Sóc Trăng)"));
        WARDS.put(9404, new WardItem(9404, 94, "Xã Hòa Bình (Sóc Trăng)"));
        WARDS.put(9405, new WardItem(9405, 94, "Xã Tân Phong (Sóc Trăng)"));
        WARDS.put(9501, new WardItem(9501, 95, "Phường 1 (Bạc Liêu)"));
        WARDS.put(9502, new WardItem(9502, 95, "Phường 2 (Bạc Liêu)"));
        WARDS.put(9503, new WardItem(9503, 95, "Phường Trung Tâm (Bạc Liêu)"));
        WARDS.put(9504, new WardItem(9504, 95, "Xã Hòa Bình (Bạc Liêu)"));
        WARDS.put(9505, new WardItem(9505, 95, "Xã Tân Phong (Bạc Liêu)"));
        WARDS.put(9601, new WardItem(9601, 96, "Phường 1 (Cà Mau)"));
        WARDS.put(9602, new WardItem(9602, 96, "Phường 2 (Cà Mau)"));
        WARDS.put(9603, new WardItem(9603, 96, "Phường Trung Tâm (Cà Mau)"));
        WARDS.put(9604, new WardItem(9604, 96, "Xã Hòa Bình (Cà Mau)"));
        WARDS.put(9605, new WardItem(9605, 96, "Xã Tân Phong (Cà Mau)"));

        for (WardItem w : WARDS.values()) {
            WARDS_BY_PROVINCE.computeIfAbsent(w.provinceId(), k -> new ArrayList<>()).add(w);
        }
    }

    public static String getProvinceName(Integer provinceId) {
        if (provinceId == null)
            return null;
        ProvinceItem p = PROVINCES.get(provinceId);
        return p != null ? p.name() : null;
    }

    public static String getWardName(Integer wardId) {
        if (wardId == null)
            return null;
        WardItem w = WARDS.get(wardId);
        return w != null ? w.name() : null;
    }

    public static List<WardItem> getWardsByProvince(Integer provinceId) {
        if (provinceId == null)
            return Collections.emptyList();
        return WARDS_BY_PROVINCE.getOrDefault(provinceId, Collections.emptyList());
    }

    public static boolean isValidProvince(Integer provinceId) {
        if (provinceId == null)
            return false;
        return PROVINCES.containsKey(provinceId);
    }

    public static boolean isValidWard(Integer wardId) {
        if (wardId == null)
            return false;
        return WARDS.containsKey(wardId);
    }

    public static boolean isValidWardOfProvince(Integer wardId, Integer provinceId) {
        if (wardId == null)
            return false;
        WardItem ward = WARDS.get(wardId);
        if (ward == null)
            return false;
        if (provinceId != null && ward.provinceId() != provinceId) {
            return false;
        }
        return true;
    }

    public static void validateLocation(Integer provinceId, Integer wardId) {
        if (provinceId != null && !isValidProvince(provinceId)) {
            throw new BaseException(
                    ErrorCode.BAD_REQUEST,
                    "Mã tỉnh/thành phố không hợp lệ: " + provinceId);
        }
        if (wardId != null) {
            if (!isValidWard(wardId)) {
                throw new BaseException(
                        ErrorCode.BAD_REQUEST,
                        "Mã phường/xã không hợp lệ: " + wardId);
            }
            if (provinceId != null && !isValidWardOfProvince(wardId, provinceId)) {
                throw new BaseException(
                        ErrorCode.BAD_REQUEST,
                        "Mã phường/xã (" + wardId + ") không thuộc tỉnh/thành phố (" + provinceId + ")");
            }
        }
    }

    public static String formatAddress(String addressDetail, Integer wardId, Integer provinceId) {
        StringBuilder sb = new StringBuilder();
        if (addressDetail != null && !addressDetail.isBlank()) {
            sb.append(addressDetail.trim());
        }
        String ward = getWardName(wardId);
        if (ward != null && !ward.isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(ward);
        }
        String prov = getProvinceName(provinceId);
        if (prov != null && !prov.isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(prov);
        }
        return sb.toString();
    }
}
