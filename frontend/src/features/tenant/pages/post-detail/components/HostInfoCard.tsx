import React from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { RoommatePost } from '@/shared/types/tenant';

interface HostInfoCardProps {
  post: RoommatePost;
}

export const HostInfoCard: React.FC<HostInfoCardProps> = ({ post }) => {
  return (
    <div className="p-4 rounded-xl bg-stay-card-bg border border-stay-border space-y-2.5">
      <div className="flex items-center gap-3">
        <img
          src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
          alt={post.authorName}
          className="w-11 h-11 rounded-full object-cover border border-stay-border shrink-0"
        />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-bold text-stay-text truncate block">
            {post.authorName}
          </span>
          <span className="text-xs text-stay-text-secondary flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Chủ bài đăng</span>
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-stay-border flex items-center gap-2 text-xs text-stay-text-muted">
        <UserCheck className="w-3.5 h-3.5 text-stay-primary shrink-0" />
        <span>Tài khoản đã xác minh thông tin cá nhân</span>
      </div>
    </div>
  );
};
