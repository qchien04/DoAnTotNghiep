import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { Lock, User, AlertCircle, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    const success = await login({ username: username.trim(), password });
    if (success) {
      const currentUser = useAuthStore.getState().user;
      const redirectPath = (location.state as any)?.from?.pathname;

      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (currentUser?.role === 'ROLE_ADMIN') {
        navigate('/admin', { replace: true });
      } else if (currentUser?.role === 'ROLE_LANDLORD') {
        navigate('/landlord', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  const fillQuickAccount = (userVal: string, passVal: string) => {
    clearError();
    setUsername(userVal);
    setPassword(passVal);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-stay-text">Đăng Nhập Hệ Thống</h2>
        <p className="text-xs text-stay-text-secondary">
          Nhập tài khoản để cấp JWT Token và phân quyền truy cập
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stay-text mb-1.5">
            Tên đăng nhập
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => {
                clearError();
                setUsername(e.target.value);
              }}
              placeholder="admin, landlord hoặc tenant"
              className="w-full pl-9 pr-3 py-2 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-stay-text">
              Mật khẩu
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] text-stay-primary hover:underline font-medium"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stay-text-muted">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
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
          className="w-full py-2.5 bg-stay-primary hover:bg-stay-primary-hover active:scale-[0.99] text-white text-xs font-semibold rounded-lg shadow-md shadow-stay-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Đăng Nhập</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Lối tắt điền nhanh tài khoản demo chuẩn với dữ liệu seed data.sql */}
      <div className="pt-2 border-t border-stay-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-stay-text-secondary flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Tài khoản mẫu nhanh:
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillQuickAccount('admin', '123456')}
            className="p-2 rounded-lg border border-stay-border bg-stay-bg-app hover:border-stay-primary hover:bg-stay-primary-subtle text-[11px] font-medium text-stay-text transition-all text-left cursor-pointer"
          >
            <p className="font-semibold text-stay-primary truncate">Quản trị</p>
            <p className="text-[10px] text-stay-text-muted">admin / 123456</p>
          </button>
          <button
            type="button"
            onClick={() => fillQuickAccount('landlord', '123456')}
            className="p-2 rounded-lg border border-stay-border bg-stay-bg-app hover:border-stay-primary hover:bg-stay-primary-subtle text-[11px] font-medium text-stay-text transition-all text-left cursor-pointer"
          >
            <p className="font-semibold text-emerald-600 dark:text-emerald-400 truncate">Chủ trọ</p>
            <p className="text-[10px] text-stay-text-muted">landlord / 123456</p>
          </button>
          <button
            type="button"
            onClick={() => fillQuickAccount('tenant', '123456')}
            className="p-2 rounded-lg border border-stay-border bg-stay-bg-app hover:border-stay-primary hover:bg-stay-primary-subtle text-[11px] font-medium text-stay-text transition-all text-left cursor-pointer"
          >
            <p className="font-semibold text-sky-600 dark:text-sky-400 truncate">Khách thuê</p>
            <p className="text-[10px] text-stay-text-muted">tenant / 123456</p>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-stay-text-secondary">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-stay-primary font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};
