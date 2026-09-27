import React from 'react';
import { Users } from 'lucide-react';

export interface RoommateItem {
  name: string;
  role: string;
  phone: string;
  avatar?: string;
}

interface RoommatesListProps {
  roommates?: RoommateItem[];
}

export const RoommatesList: React.FC<RoommatesListProps> = ({ roommates = [] }) => {
  if (roommates.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-stay-primary" />
        <h3 className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider">
          Danh sách bạn cùng phòng ({roommates.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {roommates.map((rm: RoommateItem, idx: number) => (
          <div key={idx} className="p-3 rounded-xl bg-stay-card-bg border border-stay-border flex items-center gap-3">
            <img
              src={rm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={rm.name}
              className="w-9 h-9 rounded-full object-cover border border-stay-border"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stay-text">{rm.name}</span>
                {rm.role === 'Đại diện hợp đồng' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stay-primary/10 text-stay-primary font-semibold">
                    Đại diện
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">{rm.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
