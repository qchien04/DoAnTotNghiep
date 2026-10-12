import React from 'react';
import { RoommatePost } from '@/shared/types/tenant';
import { MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import { Image } from 'antd';

interface PostHeroProps {
  post: RoommatePost;
}

export const PostHero: React.FC<PostHeroProps> = ({ post }) => {
  const images = post.roomInfo?.images || [];
  const isHasRoom = post.postType === 'HAS_ROOM';

  return (
    <div className="space-y-4">
      {/* Tiêu đề & Thông tin cơ bản */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
              isHasRoom
                ? 'bg-stay-primary-subtle text-stay-primary border border-stay-primary/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {isHasRoom ? 'Đã có phòng sẵn' : 'Tìm bạn cùng thuê'}
          </span>

          <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-stay-bg-app border border-stay-border text-stay-text-secondary">
            Mã tin: {post.code || `#BG${post.id}`}
          </span>

          <span className="inline-flex items-center gap-1 text-xs text-stay-text-secondary">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Mới đăng'}</span>
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-stay-text tracking-tight leading-snug">
          {post.title}
        </h1>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stay-text-secondary">
          <MapPin className="w-4 h-4 text-stay-primary shrink-0" />
          <span>{post.areaName || post.district || 'Hà Nội'}</span>
        </div>
      </div>

      {/* Gallery Album hình ảnh (nếu có) */}
      {images.length > 0 ? (
        <div className="rounded-xl overflow-hidden border border-stay-border bg-stay-bg-app p-2 space-y-2">
          <Image.PreviewGroup>
            {/* Ảnh chính to */}
            <div className="relative aspect-16/9 w-full rounded-lg overflow-hidden bg-stay-card-bg">
              <Image
                src={images[0]}
                alt={post.title}
                className="w-full h-full object-cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                fallback="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80"
              />
            </div>

            {/* Các ảnh phụ bên dưới */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-lg overflow-hidden border border-stay-border bg-stay-card-bg"
                  >
                    <Image
                      src={img}
                      alt={`Ảnh phòng ${idx + 2}`}
                      className="w-full h-full object-cover"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </Image.PreviewGroup>
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-dashed border-stay-border bg-stay-bg-app text-center">
          <ImageIcon className="w-8 h-8 text-stay-text-muted mx-auto mb-2" />
          <p className="text-xs text-stay-text-secondary">
            Bài đăng tìm bạn cùng thuê nhà (chưa có sẵn hình ảnh phòng trọ cụ thể)
          </p>
        </div>
      )}
    </div>
  );
};
