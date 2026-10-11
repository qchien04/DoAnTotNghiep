import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { env } from '@/configs/env';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Nếu người dùng đã đăng nhập, tự động chuyển hướng đến portal phù hợp
  if (isAuthenticated && user) {
    if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'ROLE_LANDLORD') return <Navigate to="/landlord" replace />;
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-stay-bg flex flex-col justify-center items-center p-4 sm:p-6 transition-colors">
      <div className="mb-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-stay-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-stay-primary/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-stay-text tracking-tight">{env.APP_TITLE}</span>
        </Link>
        <p className="text-xs text-stay-text-secondary mt-1">Hệ Thống Xác Thực JWT Mono-Service</p>
      </div>

      <div className="w-full max-w-md bg-stay-card-bg rounded-2xl shadow-xl border border-stay-border p-8">
        <Outlet />
      </div>

      <div className="mt-8 text-center text-xs text-stay-text-muted">
        <p>Đồ Án Tốt Nghiệp • Spring Boot & ReactJS Architecture</p>
      </div>
    </div>
  );
};
