package com.doan.core.common.util;

import lombok.extern.slf4j.Slf4j;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Tiện ích tự động đóng dấu Watermark chống trộm ảnh cho tin đăng phòng trọ StayConnect
 */
@Slf4j
public final class ImageWatermarkUtil {

    private ImageWatermarkUtil() {}

    private static final String MAIN_TEXT = "StayConnect • Phòng Trọ Xác Minh";
    private static final String SUB_TEXT = "stayconnect.vn • Cảnh báo: Không chuyển cọc ngoài sàn";
    private static final String DIAGONAL_TEXT = "STAYCONNECT.VN";

    /**
     * Áp dụng Watermark tự động lên ảnh gốc và trả về mảng byte ảnh JPEG đã đóng dấu
     */
    public static byte[] applyWatermark(InputStream originalImageStream) throws IOException {
        BufferedImage originalImage = ImageIO.read(originalImageStream);
        if (originalImage == null) {
            throw new IOException("Không thể đọc tệp tin hình ảnh để gắn watermark");
        }
        return applyWatermark(originalImage);
    }

    /**
     * Áp dụng Watermark lên mảng byte ảnh
     */
    public static byte[] applyWatermark(byte[] originalImageBytes) throws IOException {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(originalImageBytes)) {
            return applyWatermark(bais);
        }
    }

    /**
     * Đóng dấu Watermark lên đối tượng BufferedImage
     */
    public static byte[] applyWatermark(BufferedImage originalImage) throws IOException {
        int width = originalImage.getWidth();
        int height = originalImage.getHeight();

        // Tạo ảnh mới dạng ARGB để vẽ watermark trong suốt
        BufferedImage watermarked = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = watermarked.createGraphics();

        // Cấu hình khử răng cưa và chất lượng vẽ
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

        // 1. Vẽ ảnh gốc
        g2d.drawImage(originalImage, 0, 0, null);

        // 2. Vẽ chữ chìm nghiêng ở giữa ảnh (Diagonal Watermark)
        int diagonalFontSize = Math.max(16, width / 18);
        Font diagonalFont = new Font("SansSerif", Font.BOLD, diagonalFontSize);
        g2d.setFont(diagonalFont);
        g2d.setColor(new Color(255, 255, 255, 40)); // Độ mờ rất nhẹ

        FontMetrics diagFm = g2d.getFontMetrics();
        Rectangle2D diagBounds = diagFm.getStringBounds(DIAGONAL_TEXT, g2d);

        g2d.translate(width / 2, height / 2);
        g2d.rotate(-Math.toRadians(30));
        g2d.drawString(DIAGONAL_TEXT, (int) -diagBounds.getWidth() / 2, (int) diagBounds.getHeight() / 4);
        g2d.rotate(Math.toRadians(30));
        g2d.translate(-width / 2, -height / 2);

        // 3. Vẽ huy hiệu Watermark bảo hộ ở góc dưới bên phải (Bottom-right badge)
        int mainFontSize = Math.max(12, Math.min(22, width / 36));
        int subFontSize = Math.max(9, (int) (mainFontSize * 0.72));

        Font mainFont = new Font("SansSerif", Font.BOLD, mainFontSize);
        Font subFont = new Font("SansSerif", Font.PLAIN, subFontSize);

        g2d.setFont(mainFont);
        FontMetrics mainFm = g2d.getFontMetrics();
        int mainWidth = mainFm.stringWidth(MAIN_TEXT);

        g2d.setFont(subFont);
        FontMetrics subFm = g2d.getFontMetrics();
        int subWidth = subFm.stringWidth(SUB_TEXT);

        int badgeWidth = Math.max(mainWidth, subWidth) + (mainFontSize * 2);
        int badgeHeight = mainFm.getHeight() + subFm.getHeight() + (mainFontSize / 2);

        int margin = Math.max(12, width / 40);
        int badgeX = width - badgeWidth - margin;
        int badgeY = height - badgeHeight - margin;

        if (badgeX > 0 && badgeY > 0) {
            // Nền tối bán trong suốt (Semi-transparent dark rounded pill)
            g2d.setColor(new Color(15, 23, 42, 160)); // Slate-900 mờ
            g2d.fillRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, 14, 14);

            // Viền bo thanh lịch
            g2d.setColor(new Color(255, 255, 255, 60));
            g2d.drawRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, 14, 14);

            // Chữ tiêu đề chính (Xanh ngọc / Emerald hoặc Trắng nổi bật)
            g2d.setFont(mainFont);
            g2d.setColor(new Color(52, 211, 153)); // Emerald-400
            int textX = badgeX + (mainFontSize);
            int textY = badgeY + mainFm.getAscent() + (mainFontSize / 3);
            g2d.drawString(MAIN_TEXT, textX, textY);

            // Dòng phụ cảnh báo
            g2d.setFont(subFont);
            g2d.setColor(new Color(226, 232, 240, 220)); // Slate-200
            int subY = textY + subFm.getHeight();
            g2d.drawString(SUB_TEXT, textX, subY);
        }

        g2d.dispose();

        // Xuất ra mảng byte định dạng JPEG chất lượng cao
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(watermarked, "jpg", baos);
            return baos.toByteArray();
        }
    }
}

