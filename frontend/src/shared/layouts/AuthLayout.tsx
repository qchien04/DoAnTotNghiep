import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { env } from '@/configs/env';
import { ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="mb-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-stay-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">{env.APP_TITLE}</span>
        </Link>
        <p className="text-xs text-slate-400 mt-1">Hệ Thống Xác Thực JWT Mono-Service</p>
      </div>

      <div className="w-full max-w-md bg-stay-card-bg rounded-2xl shadow-xl border border-stay-border p-8">
        <Outlet />
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        <p>Đồ Án Tốt Nghiệp • Spring Boot & ReactJS Architecture</p>
      </div>
    </div>
  );
};
