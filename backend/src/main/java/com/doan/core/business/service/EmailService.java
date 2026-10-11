package com.doan.core.business.service;

public interface EmailService {

    /**
     * Gửi mã OTP xác thực đăng ký tài khoản qua Email
     *
     * @param toEmail Email người nhận
     * @param otpCode Mã OTP gồm 6 chữ số
     */
    void sendRegistrationOtp(String toEmail, String otpCode);

    /**
     * Gửi mã OTP xác thực đặt lại mật khẩu qua Email
     *
     * @param toEmail Email người nhận
     * @param otpCode Mã OTP gồm 6 chữ số
     */
    void sendForgotPasswordOtp(String toEmail, String otpCode);
}
