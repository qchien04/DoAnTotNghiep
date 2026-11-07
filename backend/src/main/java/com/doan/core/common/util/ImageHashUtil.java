package com.doan.core.common.util;

import lombok.extern.slf4j.Slf4j;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;

/**
 * Thuật toán tính Perceptual Hash (dHash - Difference Hash) cho hình ảnh
 * Phục vụ phát hiện ảnh trùng lặp, chống sao chép ảnh giữa các tin đăng và chủ trọ
 */
@Slf4j
public final class ImageHashUtil {

    private ImageHashUtil() {}

    private static final int WIDTH = 9;
    private static final int HEIGHT = 8;
    public static final int DUPLICATE_HAMMING_THRESHOLD = 8; // Khoảng cách Hamming <= 8 được coi là trùng lặp

    /**
     * Tính mã băm dHash (16 ký tự hex, 64-bit) từ InputStream
     */
    public static String computeDHash(InputStream inputStream) {
        try {
            BufferedImage image = ImageIO.read(inputStream);
            if (image == null) {
                log.warn("Không thể giải mã hình ảnh từ luồng dữ liệu đầu vào");
                return null;
            }
            return computeDHash(image);
        } catch (IOException e) {
            log.error("Lỗi khi đọc hình ảnh để tính dHash", e);
            return null;
        }
    }

    /**
     * Tính mã băm dHash từ mảng byte
     */
    public static String computeDHash(byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) return null;
        try (ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes)) {
            return computeDHash(bais);
        } catch (IOException e) {
            log.error("Lỗi khi chuyển đổi mảng byte ảnh", e);
            return null;
        }
    }

    /**
     * Tính mã băm dHash từ tệp tin File
     */
    public static String computeDHash(File file) {
        if (file == null || !file.exists()) return null;
        try {
            BufferedImage image = ImageIO.read(file);
            return computeDHash(image);
        } catch (IOException e) {
            log.error("Lỗi khi đọc file ảnh để tính dHash: {}", file.getAbsolutePath(), e);
            return null;
        }
    }

    /**
     * Tính mã băm dHash từ BufferedImage
     * 1. Thu nhỏ ảnh về kích thước 9x8 pixel
     * 2. Chuyển ảnh về Grayscale (mức xám)
     * 3. So sánh pixel liền kề theo hàng ngang (8x8 = 64 phép so sánh)
     * 4. Tạo ra chuỗi hex 16 ký tự (64-bit)
     */
    public static String computeDHash(BufferedImage originalImage) {
        if (originalImage == null) return null;

        // 1. Thu nhỏ ảnh về 9x8
        BufferedImage resizedImage = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = resizedImage.createGraphics();
        g.drawImage(originalImage.getScaledInstance(WIDTH, HEIGHT, Image.SCALE_SMOOTH), 0, 0, null);
        g.dispose();

        // 2. Lấy giá trị xám các pixel
        int[][] pixels = new int[HEIGHT][WIDTH];
        for (int y = 0; y < HEIGHT; y++) {
            for (int x = 0; x < WIDTH; x++) {
                int rgb = resizedImage.getRGB(x, y);
                int r = (rgb >> 16) & 0xff;
                int gr = (rgb >> 8) & 0xff;
                int b = rgb & 0xff;
                pixels[y][x] = (int) (0.299 * r + 0.587 * gr + 0.114 * b);
            }
        }

        // 3. So sánh pixel(x, y) với pixel(x+1, y) để tạo 64 bits
        long hash = 0L;
        for (int y = 0; y < HEIGHT; y++) {
            for (int x = 0; x < WIDTH - 1; x++) {
                if (pixels[y][x] < pixels[y][x + 1]) {
                    hash |= (1L << (y * 8 + x));
                }
            }
        }

        return String.format("%016x", hash);
    }

    /**
     * Tính khoảng cách Hamming (Hamming Distance) giữa 2 mã băm dHash
     * Giá trị từ 0 đến 64:
     * - 0 - 5: Ảnh gần như trùng khớp hoàn toàn (duplicate)
     * - 6 - 8: Ảnh cùng góc chụp / đã bị chỉnh sửa nhẹ (potential duplicate)
     * - > 10: Hai hình ảnh khác nhau
     */
    public static int calculateHammingDistance(String hash1, String hash2) {
        if (hash1 == null || hash2 == null || hash1.length() != 16 || hash2.length() != 16) {
            return 64; // Không hợp lệ coi như khác biệt tối đa
        }
        try {
            long h1 = Long.parseUnsignedLong(hash1, 16);
            long h2 = Long.parseUnsignedLong(hash2, 16);
            return Long.bitCount(h1 ^ h2);
        } catch (NumberFormatException e) {
            log.warn("Mã băm không hợp lệ khi tính Hamming: hash1={}, hash2={}", hash1, hash2);
            return 64;
        }
    }

    /**
     * Kiểm tra xem 2 ảnh có bị coi là trùng lặp không (Hamming Distance <= Threshold)
     */
    public static boolean isDuplicate(String hash1, String hash2) {
        return calculateHammingDistance(hash1, hash2) <= DUPLICATE_HAMMING_THRESHOLD;
    }
}

