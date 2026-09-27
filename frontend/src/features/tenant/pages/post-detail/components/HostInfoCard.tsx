import React from 'react';
import { Button } from '@/shared/components';
import { CheckCircle } from 'lucide-react';
import { RoommatePost } from '@/shared/types/tenant';

interface HostInfoCardProps {
  post: RoommatePost;
  hasApplied: boolean;
  onOpenApply: () => void;
}

export const HostInfoCard: React.FC<HostInfoCardProps> = ({
  post,
  hasApplied,
  onOpenApply,
}) => {
  return (
    <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <img
          src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
          alt={post.authorName}
          className="w-11 h-11 rounded-full object-cover border border-stay-border"
        />
        <div>
          <span className="text-sm font-bold text-stay-text block">{post.authorName}</span>
          <span className="text-xs text-stay-text-secondary">Chủ bài đăng • ID: {post.authorId}</span>
        </div>
      </div>

      <div>
        {hasApplied ? (
          <Button variant="outline" size="md" disabled className="bg-slate-50 text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-600 mr-1.5" />
            Đã gửi yêu cầu (Đang chờ duyệt)
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={onOpenApply}>
            Tham gia nhóm ở ghép
          </Button>
        )}
      </div>
    </div>
  );
};
