import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components';
import { RoommatePost } from '@/shared/types/tenant';

interface PostGridProps {
  posts: RoommatePost[];
}

export const PostGrid: React.FC<PostGridProps> = ({ posts }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-stay-card-bg border border-stay-border hover:border-stay-primary/50 rounded-xl overflow-hidden transition-all flex flex-col justify-between"
        >
          {post.roomInfo?.images && post.roomInfo.images.length > 0 ? (
            <div className="h-44 w-full overflow-hidden relative bg-slate-100">
              <img
                src={post.roomInfo.images[0]}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-white/90 text-stay-text">
                {post.code} • Có sẵn phòng
              </span>
              {post.matchPercentage && (
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-black/70 text-white">
                  Khớp {post.matchPercentage}%
                </span>
              )}
            </div>
          ) : (
            <div className="h-28 w-full bg-stay-bg-app border-b border-stay-border p-3 flex flex-col justify-between">
              <span className="text-xs font-semibold text-stay-primary">
                {post.code} • Chưa có phòng (Tìm bạn cùng thuê)
              </span>
              {post.matchPercentage && (
                <span className="text-xs text-stay-text-secondary">
                  Độ tương thích lối sống: <strong>{post.matchPercentage}%</strong>
                </span>
              )}
            </div>
          )}

          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <Link
                to={`/roommates/${post.id}`}
                className="text-sm font-bold text-stay-text hover:text-stay-primary transition-colors line-clamp-2"
              >
                {post.title}
              </Link>
              <p className="text-xs text-stay-text-secondary line-clamp-1">
                {post.areaName || post.district}
              </p>
            </div>

            <div className="pt-2 border-t border-stay-border flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Giá share:</span>
                <span className="font-bold text-stay-primary text-sm">
                  {post.sharePrice.toLocaleString()} đ
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Cần tìm:</span>
                <span className="font-semibold text-stay-text">
                  {post.neededRoommates} người
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => navigate(`/roommates/${post.id}`)}
            >
              Xem chi tiết
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
