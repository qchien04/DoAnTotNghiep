import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/shared/services/authService';
import { Mail, KeyRound, Lock, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [otpSentMsg, setOtpSentMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ của bạn');
      return;
    }

    setError(null);
    setIsSendingOtp(true);
    setOtpSentMsg(null);

    try {
      const res = await authService.sendForgotPasswordOtp(email.trim());
      if (res.code === '00') {
        setOtpSentMsg('Mã OTP 6 số đã được gửi đến email. Vui lòng kiểm tra hộp thư!');
        setCountdown(60);
      } else {
        setError(res.message || 'Không thể gửi mã OTP đặt lại mật khẩu');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không tìm thấy tài khoản với email này';
      setError(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !otpCode || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin');
      return;
    }

    if (otpCode.trim().length !== 6) {
      setError('Mã OTP phải gồm đúng 6 chữ số');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu mới');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword({
        email: email.trim(),
        otpCode: otpCode.trim(),
        newPassword,
        confirmPassword,
      });

      if (res.code === '00') {
        setSuccessMsg('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(res.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-stay-text">Khôi Phục Mật Khẩu</h2>
        <p className="text-xs text-stay-text-secondary">
          Nhập email tài khoản để nhận mã OTP xác thực đặt lại mật khẩu
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {otpSentMsg && !error && (
        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center gap-2.5 text-xs text-sky-600 dark:text-sky-400">
          <Mail className="w-4 h-4 shrink-0 text-sky-500" />
          <span>{otpSentMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1.5">
            Email tài khoản
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setError(null);
                  setEmail(e.target.value);
                }}
                placeholder="email@stayhub.vn"
                className="w-full pl-9 pr-3 py-2 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary focus:border-transparent transition-all"
              />
            </div>
            <button
              type="button"
              disabled={isSendingOtp || countdown > 0 || !email}
              onClick={handleSendOtp}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-stay-primary text-white hover:bg-stay-primary-hover disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-colors shadow-sm"
            >
              {isSendingOtp ? 'Đang gửi...' : countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi mã OTP'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1.5">
            Mã OTP (6 chữ số)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => {
                setError(null);
                setOtpCode(e.target.value);
              }}
              placeholder="Nhập 6 số mã OTP từ email"
              className="w-full pl-9 pr-3 py-2 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text placeholder:text-stay-text-muted tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-stay-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1.5">
            Mật khẩu mới
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => {
                setError(null);
                setNewPassword(e.target.value);
              }}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full pl-9 pr-10 py-2 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stay-text-muted hover:text-stay-text transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1.5">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => {
                setError(null);
                setConfirmPassword(e.target.value);
              }}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full pl-9 pr-10 py-2 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-stay-primary hover:bg-stay-primary-hover active:scale-[0.99] text-white text-xs font-semibold rounded-lg shadow-md shadow-stay-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Đặt Lại Mật Khẩu</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-stay-text-secondary">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-stay-primary font-semibold hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
};
