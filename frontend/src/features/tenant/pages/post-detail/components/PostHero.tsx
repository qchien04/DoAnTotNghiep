import React from 'react';
import { RoommatePost } from '@/shared/types/tenant';

interface PostHeroProps {
  post: RoommatePost;
}

export const PostHero: React.FC<PostHeroProps> = ({ post }) => {
  return (
    <div className="space-y-6">
      {/* Images Grid */}
      {post.roomInfo?.images && post.roomInfo.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-stay-bg-app border-b border-stay-border">
          <div className="md:col-span-2 aspect-[16/9] rounded-lg overflow-hidden bg-slate-100">
            <img
              src={post.roomInfo.images[0]}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {post.roomInfo.images.slice(1, 3).map((img: string, idx: number) => (
              <div key={idx} className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={img}
                  alt={`Ảnh ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 pt-2 space-y-4">
        {/* Post Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stay-text-secondary">
            <span>Tin đăng: <strong>#{post.id}</strong></span>
            <span>Ngày đăng: {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : '01/10/2026'}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-stay-text">
            {post.title}
          </h1>

          <p className="text-xs text-stay-text-secondary">
            Địa chỉ: {post.areaName || post.district}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-stay-bg-app border border-stay-border">
          <div>
            <span className="text-[11px] text-slate-500 block">Giá share mỗi người:</span>
            <span className="text-base font-bold text-stay-primary">
              {post.sharePrice.toLocaleString()} VNĐ
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block">Tiến độ nhóm:</span>
            <span className="text-base font-bold text-stay-text">
              {post.currentRoommates} / {post.neededRoommates + post.currentRoommates} người
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block">Tổng tiền phòng:</span>
            <span className="text-base font-semibold text-stay-text">
              {post.totalRoomPrice ? `${post.totalRoomPrice.toLocaleString()} đ` : 'Chưa xác định'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block">Độ khớp lối sống:</span>
            <span className="text-base font-bold text-emerald-600">
              {post.matchPercentage || 94}% (Rất hợp)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
