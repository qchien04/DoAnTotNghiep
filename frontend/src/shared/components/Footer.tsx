import React from 'react';
import { Link } from 'react-router-dom';
import { StayConnectLogo } from './StayConnectLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stay-card-bg border-t border-stay-border text-stay-text transition-colors mt-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/rooms" className="shrink-0">
            <StayConnectLogo size="sm" />
          </Link>
          <span className="text-xs text-stay-text-secondary hidden md:inline">
            • Nền tảng quản lý phòng trọ & kết nối ở ghép
          </span>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-6 text-xs text-stay-text-secondary">
          <Link to="/rooms" className="hover:text-stay-primary transition-colors">
            Tìm phòng
          </Link>
          <Link to="/roommates" className="hover:text-stay-primary transition-colors">
            Bài đăng ở ghép
          </Link>
          <Link to="/landlord" className="hover:text-stay-primary transition-colors">
            Trang quản trị
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-stay-text-muted">
          © 2026 StayConnect. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
