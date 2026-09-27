import React from 'react';
import { RoommatePost } from '@/shared/types/tenant';

interface PostHeaderCardProps {
  post: RoommatePost;
}

export const PostHeaderCard: React.FC<PostHeaderCardProps> = ({ post }) => {
  return (
    <div className="bg-stay-card-bg border border-stay-border rounded-xl p-5 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stay-primary bg-stay-primary/10 px-2 py-0.5 rounded">
              {post.code}
            </span>
            <span className="text-xs font-semibold text-stay-text">
              {post.status === 'OPEN' ? 'Đang mở (Cần tìm 1 người)' : 'Đã hoàn thành'}
            </span>
          </div>
          <h2 className="text-base font-bold text-stay-text">{post.title}</h2>
          <p className="text-xs text-stay-text-secondary">{post.areaName}</p>
        </div>

        <div className="p-3 bg-stay-bg-app border border-stay-border rounded-lg text-right shrink-0">
          <span className="text-[11px] text-slate-500 block">Tiến độ nhóm:</span>
          <span className="text-base font-bold text-stay-primary">
            Đã có: {post.currentRoommates} / {post.neededRoommates + post.currentRoommates} người
          </span>
        </div>
      </div>
    </div>
  );
};
