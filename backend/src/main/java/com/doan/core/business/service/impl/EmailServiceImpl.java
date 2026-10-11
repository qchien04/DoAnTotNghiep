package com.doan.core.business.service.impl;

import com.doan.core.business.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@stayconnect.vn}")
    private String fromEmail;

    @Override
    public void sendRegistrationOtp(String toEmail, String otpCode) {
        log.info("\n" +
                "========================================================================================\n" +
                "📧 [STAYCONNECT - XÁC THỰC EMAIL ĐĂNG KÝ]\n" +
                "   Người nhận: {}\n" +
                "   MÃ OTP:     >>> [ {} ] <<<\n" +
                "   Hiệu lực:   3 phút (180 giây)\n" +
                "========================================================================================",
                toEmail, otpCode);

        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

                helper.setFrom(fromEmail, "StayConnect Support");
                helper.setTo(toEmail);
                helper.setSubject("[StayConnect] Mã xác thực đăng ký tài khoản của bạn");

                String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;\">"
                        + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                        + "<h2 style=\"color: #2563eb; margin: 0;\">StayConnect</h2>"
                        + "<p style=\"color: #64748b; font-size: 13px; margin-top: 4px;\">Hệ Thống Quản Lý Nhà Trọ & Tìm Bạn Ở Ghép</p>"
                        + "</div>"
                        + "<p style=\"font-size: 15px; color: #1e293b;\">Xin chào bạn,</p>"
                        + "<p style=\"font-size: 14px; color: #475569; line-height: 1.6;\">Bạn vừa yêu cầu đăng ký tài khoản trên nền tảng StayConnect. Vui lòng nhập mã xác thực OTP dưới đây để hoàn tất kích hoạt tài khoản:</p>"
                        + "<div style=\"text-align: center; margin: 28px 0;\">"
                        + "<div style=\"display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8; background-color: #eff6ff; padding: 14px 28px; border-radius: 12px; border: 1px dashed #93c5fd;\">"
                        + otpCode
                        + "</div>"
                        + "<p style=\"color: #ef4444; font-size: 12px; margin-top: 10px;\">Mã xác thực có hiệu lực trong vòng <b>3 phút</b>.</p>"
                        + "</div>"
                        + "<p style=\"font-size: 13px; color: #64748b;\">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Tuyệt đối không chia sẻ mã này cho bất kỳ ai khác.</p>"
                        + "<hr style=\"border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;\" />"
                        + "<p style=\"font-size: 11px; color: #94a3b8; text-align: center;\">Đồ Án Tốt Nghiệp • StayConnect Mono-service Architecture</p>"
                        + "</div>";

                helper.setText(htmlContent, true);
                mailSender.send(message);
                log.info("Đã gửi thành công email OTP tới: {}", toEmail);
            } catch (Exception e) {
                log.warn("Không thể gửi email thực tế qua SMTP (Đã in ra log console): {}", e.getMessage());
            }
        } else {
            log.info("Chưa cấu hình JavaMailSender SMTP -> Mã OTP được mô phỏng trực tiếp trên Console Log");
        }
    }

    @Override
    public void sendForgotPasswordOtp(String toEmail, String otpCode) {
        log.info("\n" +
                "========================================================================================\n" +
                "🔑 [STAYCONNECT - XÁC THỰC ĐẶT LẠI MẬT KHẨU]\n" +
                "   Người nhận: {}\n" +
                "   MÃ OTP:     >>> [ {} ] <<<\n" +
                "   Hiệu lực:   3 phút (180 giây)\n" +
                "========================================================================================",
                toEmail, otpCode);

        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

                helper.setFrom(fromEmail, "StayConnect Security");
                helper.setTo(toEmail);
                helper.setSubject("[StayConnect] Yêu cầu đặt lại mật khẩu tài khoản");

                String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;\">"
                        + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                        + "<h2 style=\"color: #ef4444; margin: 0;\">StayConnect Security</h2>"
                        + "<p style=\"color: #64748b; font-size: 13px; margin-top: 4px;\">Yêu Cầu Đặt Lại Mật Khẩu</p>"
                        + "</div>"
                        + "<p style=\"font-size: 15px; color: #1e293b;\">Xin chào,</p>"
                        + "<p style=\"font-size: 14px; color: #475569; line-height: 1.6;\">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này. Vui lòng nhập mã OTP dưới đây để xác nhận:</p>"
                        + "<div style=\"text-align: center; margin: 28px 0;\">"
                        + "<div style=\"display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #dc2626; background-color: #fef2f2; padding: 14px 28px; border-radius: 12px; border: 1px dashed #fca5a5;\">"
                        + otpCode
                        + "</div>"
                        + "<p style=\"color: #ef4444; font-size: 12px; margin-top: 10px;\">Mã xác thực có hiệu lực trong vòng <b>3 phút</b>.</p>"
                        + "</div>"
                        + "<p style=\"font-size: 13px; color: #64748b;\">Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>"
                        + "<hr style=\"border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;\" />"
                        + "<p style=\"font-size: 11px; color: #94a3b8; text-align: center;\">Đồ Án Tốt Nghiệp • StayConnect Security System</p>"
                        + "</div>";

                helper.setText(htmlContent, true);
                mailSender.send(message);
                log.info("Đã gửi thành công email OTP đặt lại mật khẩu tới: {}", toEmail);
            } catch (Exception e) {
                log.warn("Không thể gửi email thực tế qua SMTP (Đã in ra log console): {}", e.getMessage());
            }
        }
    }
}
