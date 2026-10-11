import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/shared/services/authService';
import { Lock, User, Mail, Phone, AlertCircle, ArrowRight, CheckCircle2, UserCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import type { Role } from '@/shared/types/auth';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
    fullName: string;
    email: string;
    phone: string;
    role: Role;
    otpCode: string;
  }>({
    username: '',
    email: '',
    phone: '',
    role: 'ROLE_TENANT',
    otpCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [otpInfoMsg, setOtpInfoMsg] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Đếm ngược 60 giây trước khi cho phép gửi lại OTP
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    clearError();
    setFormError(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      alert('Vui lòng nhập địa chỉ email hợp lệ trước khi gửi mã OTP');
      return;
    }

    clearError();
    setIsSendingOtp(true);
    setOtpInfoMsg('');

    try {
      const res = await authService.sendRegisterOtp(formData.email.trim());
      if (res.code === '00') {
        setOtpInfoMsg('Mã OTP 6 số đã được gửi đến email. Vui lòng kiểm tra hộp thư!');
        setCountdown(60);
      } else {
        alert(res.message || 'Không thể gửi mã OTP');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau';
      alert(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');

    if (!formData.otpCode || formData.otpCode.trim().length !== 6) {
      alert('Vui lòng nhập đúng mã OTP gồm 6 chữ số đã được gửi qua email');
      return;
    }

    const success = await register(formData);
    if (success) {
      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-stay-text">Đăng Ký Tài Khoản</h2>
        <p className="text-xs text-stay-text-secondary">Xác thực mã OTP qua Email để kích hoạt tài khoản StayConnect</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {otpInfoMsg && !error && (
        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center gap-2.5 text-xs text-sky-600 dark:text-sky-400">
          <Mail className="w-4 h-4 shrink-0 text-sky-500" />
          <span>{otpInfoMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1">
            Họ và tên
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className="w-full pl-9 pr-3 py-2 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1">
            Tên đăng nhập
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="nguyenvana"
              className="w-full pl-9 pr-3 py-2 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1">
            Email xác thực
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="vana@gmail.com"
                className="w-full pl-9 pr-3 py-2 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary focus:border-transparent transition-all"
              />
            </div>
            <button
              type="button"
              disabled={isSendingOtp || countdown > 0 || !formData.email}
              onClick={handleSendOtp}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-stay-primary text-white hover:bg-stay-primary-hover disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-colors shadow-sm"
            >
              {isSendingOtp ? 'Đang gửi...' : countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi mã OTP'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1">
            Mã OTP (6 chữ số)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="otpCode"
              required
              maxLength={6}
              value={formData.otpCode}
              onChange={handleChange}
              placeholder="Nhập 6 số mã OTP từ email"
              className="w-full pl-9 pr-3 py-2 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text placeholder:text-stay-text-muted tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-stay-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1">
            Số điện thoại
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0912345678"
              className="w-full pl-9 pr-3 py-2 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1">
            Vai trò tham gia
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
              <UserCheck className="w-4 h-4" />
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text focus:outline-none focus:ring-2 focus:ring-stay-primary focus:border-transparent transition-all"
            >
              <option value="ROLE_TENANT">Khách thuê (Tìm phòng & Tìm bạn ở ghép)</option>
              <option value="ROLE_LANDLORD">Chủ trọ (Quản lý nhà trọ & phòng)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-2.5 bg-stay-primary hover:bg-stay-primary-hover active:scale-[0.99] text-white text-xs font-semibold rounded-lg shadow-md shadow-stay-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Đăng Ký Tài Khoản</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-stay-text-secondary">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-stay-primary font-semibold hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};

