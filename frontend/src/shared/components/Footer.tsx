import React from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { StayConnectLogo } from './StayConnectLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stay-card-bg border-t border-stay-border text-stay-text transition-colors mt-auto">
      {/* 1. Value Proposition Banner */}
      <div className="border-b border-stay-border/60 bg-stay-bg-app/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-stay-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-stay-primary" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stay-text">100% Phòng thật - Giá thật</h4>
              <p className="text-xs text-stay-text-secondary mt-0.5">
                Xác thực chủ nhà và khảo sát hình ảnh thực tế tại từng căn phòng.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-stay-match/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-stay-match" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stay-text">Ghép đôi lối sống thông minh</h4>
              <p className="text-xs text-stay-text-secondary mt-0.5">
                Tìm bạn cùng phòng hòa hợp từ giờ giấc sinh hoạt đến thói quen cá nhân.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-stay-secondary/10 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6 text-stay-secondary" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stay-text">Hợp đồng điện tử minh bạch</h4>
              <p className="text-xs text-stay-text-secondary mt-0.5">
                Thanh toán VietQR tự động, bảo vệ tiền cọc và hỗ trợ giải quyết tranh chấp.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Column 1: Brand & Contact (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <StayConnectLogo size="md" />
            </Link>
            <p className="text-xs sm:text-sm text-stay-text-secondary leading-relaxed max-w-sm">
              Nền tảng công nghệ kết nối phòng trọ và bạn ở ghép uy tín hàng đầu, mang đến trải nghiệm thuê trọ an tâm và văn minh cho sinh viên, người đi làm.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-stay-text-secondary">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-stay-primary shrink-0" />
                <span>
                  Hotline hỗ trợ: <strong className="text-stay-text font-semibold">1900 8899</strong> (8:00 - 21:00)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-stay-primary shrink-0" />
                <span>
                  Email: <strong className="text-stay-text font-semibold">hotro@stayconnect.vn</strong>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-stay-primary" />
                <span>
                  Tầng 8 Phố Duy Tân, Cầu Giấy, Hà Nội
                </span>
              </div>
            </div>

          </div>

          {/* Column 2: Dành cho người thuê */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stay-text">
              Dành cho người thuê
            </h4>
            <ul className="space-y-2 text-xs text-stay-text-secondary">
              <li>
                <Link to="/" className="hover:text-stay-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Tìm kiếm phòng trọ
                </Link>
              </li>
              <li>
                <Link to="/roommates" className="hover:text-stay-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Tìm bạn cùng ở ghép
                </Link>
              </li>
              <li>
                <Link to="/roommates/create" className="hover:text-stay-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Đăng tin tìm bạn ghép
                </Link>
              </li>
              <li>
                <Link to="/tenant/my-room" className="hover:text-stay-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Phòng & Hợp đồng
                </Link>
              </li>
              <li>
                <Link to="/tenant/complaints" className="hover:text-stay-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Báo hỏng & Khiếu nại
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Dành cho chủ trọ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stay-text">
              Dành cho chủ trọ
            </h4>
            <ul className="space-y-2 text-xs text-stay-text-secondary">
              <li>
                <Link to="/landlord" className="hover:text-stay-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Kênh quản trị chủ trọ
                </Link>
              </li>
              <li>
                <Link to="/landlord/buildings" className="hover:text-stay-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Quản lý tòa nhà
                </Link>
              </li>
              <li>
                <Link to="/landlord/rooms" className="hover:text-stay-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Quản lý phòng
                </Link>
              </li>
              <li>
                <Link to="/landlord/contracts" className="hover:text-stay-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Tạo hợp đồng điện tử
                </Link>
              </li>
              <li>
                <Link to="/landlord/bills" className="hover:text-stay-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Hóa đơn & Thu tiền
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quy định & Chính sách */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stay-text">
              Quy định Chính sách
            </h4>
            <ul className="space-y-2 text-xs text-stay-text-secondary">
              <li>
                <Link to="/policy" className="hover:text-stay-primary transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Quy chế hoạt động sàn
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-stay-primary transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Bảo mật thông tin
                </Link>
              </li>
              <li>
                <Link to="/complaints" className="hover:text-stay-primary transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Giải quyết khiếu nại
                </Link>
              </li>
              <li>
                <Link to="/deposit" className="hover:text-stay-primary transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Hoàn cọc minh bạch
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-stay-primary transition-colors flex items-center gap-1.5 text-slate-400">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  Quản trị viên hệ thống
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Social Media & Official Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stay-text">
              Quy định Chính sách
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {/* Zalo OA */}
              {/* <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors shadow-2xs"
              >
                <span className="w-5 h-5 rounded-full bg-[#0068FF] text-white flex items-center justify-center font-bold text-[9px] leading-none">
                  Zalo
                </span>
                <span>Chat Zalo OA</span>
              </a> */}

              {/* Facebook Fanpage */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1877F2] border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
                <span>Facebook</span>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-semibold hover:bg-red-100 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
                <span>TikTok</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar: Copyright & Badges */}
      <div className="border-t border-stay-border/70 py-6 px-4 sm:px-6 lg:px-8 bg-stay-bg-app/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stay-text-secondary">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span>© 2026 StayConnect. Bản quyền thuộc về Công ty CP Công nghệ StayConnect.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Đã đăng ký Bộ Công Thương
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
              <ShieldCheck className="w-3 h-3" /> Chứng nhận SSL 256-bit
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
