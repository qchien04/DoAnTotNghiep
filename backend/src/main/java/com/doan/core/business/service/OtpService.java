package com.doan.core.business.service;

public interface OtpService {

    /**
     * Gửi mã OTP xác thực đăng ký đến Email
     *
     * @param email Địa chỉ email đăng ký
     */
    void sendRegistrationOtp(String email);

    /**
     * Kiểm tra tính hợp lệ của mã OTP đã lưu trong bộ nhớ RAM
     *
     * @param email Địa chỉ email
     * @param otpCode Mã OTP người dùng nhập
     */
    void verifyRegistrationOtp(String email, String otpCode);

    /**
     * Gửi mã OTP xác thực đặt lại mật khẩu đến Email
     *
     * @param email Địa chỉ email tài khoản
     */
    void sendForgotPasswordOtp(String email);

    /**
     * Kiểm tra tính hợp lệ của mã OTP đặt lại mật khẩu
     *
     * @param email Địa chỉ email tài khoản
     * @param otpCode Mã OTP người dùng nhập
     */
    void verifyForgotPasswordOtp(String email, String otpCode);
}
