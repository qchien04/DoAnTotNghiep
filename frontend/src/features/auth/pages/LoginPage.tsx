import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    const success = await login({ username, password });
    if (success) {
      navigate('/');
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
        <h2 className="text-xl font-bold text-slate-800">Đăng Nhập Hệ Thống</h2>
        <p className="text-xs text-slate-500">
          Nhập tài khoản để cấp JWT Token truy cập hệ thống
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tên đăng nhập
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
              placeholder="admin hoặc student"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Lối tắt điền nhanh tài khoản demo phục vụ bảo vệ đồ án */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Tài khoản mẫu nhanh:
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillQuickAccount('admin', 'admin123')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-[11px] font-medium text-slate-700 transition-all text-left"
          >
            <p className="font-semibold text-blue-600">Quản trị (Admin)</p>
            <p className="text-[10px] text-slate-400">admin / admin123</p>
          </button>
          <button
            type="button"
            onClick={() => fillQuickAccount('student', '123456')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-[11px] font-medium text-slate-700 transition-all text-left"
          >
            <p className="font-semibold text-emerald-600">Sinh viên</p>
            <p className="text-[10px] text-slate-400">student / 123456</p>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-blue-600 font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};
