import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { RoommatePostType } from '@/shared/types/tenant';

interface PostTypeSelectorProps {
  postType: RoommatePostType;
  onSelectType: (type: RoommatePostType) => void;
}

export const PostTypeSelector: React.FC<PostTypeSelectorProps> = ({
  postType,
  onSelectType,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
        1. Loại hình đăng bài
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => onSelectType('HAS_ROOM')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            postType === 'HAS_ROOM'
              ? 'border-stay-primary bg-stay-primary/5'
              : 'border-stay-border hover:border-slate-300 bg-stay-card-bg'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-stay-text">
              Tôi đã có phòng trọ, cần tìm người vào ở cùng
            </span>
            {postType === 'HAS_ROOM' && <CheckCircle2 className="w-4 h-4 text-stay-primary" />}
          </div>
          <p className="text-xs text-stay-text-secondary mt-1">
            Phù hợp khi bạn đang thuê một phòng trọ và cần tìm bạn ở ghép để chia sẻ chi phí tiền phòng, điện nước.
          </p>
        </div>

        <div
          onClick={() => onSelectType('SEARCHING_ROOM')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            postType === 'SEARCHING_ROOM'
              ? 'border-stay-primary bg-stay-primary/5'
              : 'border-stay-border hover:border-slate-300 bg-stay-card-bg'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-stay-text">
              Tôi chưa có phòng, cần tìm bạn cùng tìm phòng & ở ghép
            </span>
            {postType === 'SEARCHING_ROOM' && <CheckCircle2 className="w-4 h-4 text-stay-primary" />}
          </div>
          <p className="text-xs text-stay-text-secondary mt-1">
            Phù hợp khi bạn chưa có chỗ ở cố định, muốn tìm bạn cùng trường/đồng hương để lập nhóm đi thuê chung theo bán kính bản đồ.
          </p>
        </div>
      </div>
    </div>
  );
};
