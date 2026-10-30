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
    <div className="space-y-2 pt-2 border-t border-stay-border-subtle">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-stay-primary" />
        <label className="text-stay-text font-bold block m-0">
          Danh sách khách thuê trong phòng ({roommates.length})
        </label>
      </div>

      <div className="border border-stay-border rounded-xl overflow-hidden bg-stay-card-bg">
        <table className="w-full text-left border-collapse text-[14px]">
          <thead>
            <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text-secondary font-semibold text-xs">
              <th className="py-2.5 px-3 w-14 text-center">STT</th>
              <th className="py-2.5 px-3">Họ và tên</th>
              <th className="py-2.5 px-3">Số điện thoại</th>
              <th className="py-2.5 px-3 text-center">Vai trò</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stay-border text-stay-text">
            {roommates.map((rm, idx) => (
              <tr key={idx} className="hover:bg-stay-bg-app/40 transition-colors">
                <td className="py-2.5 px-3 text-center text-stay-text-secondary font-medium">
                  {idx + 1}
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={rm.name}
                      className="w-7 h-7 rounded-full object-cover border border-stay-border shrink-0"
                    />
                    <span className="font-semibold text-stay-text">{rm.name}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 font-medium text-stay-text">
                  {rm.phone || '—'}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {rm.role === 'Đại diện hợp đồng' ? (
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-stay-primary/10 text-stay-primary border border-stay-primary/20">
                      Đại diện hợp đồng
                    </span>
                  ) : (
                    <span className="text-xs text-stay-text-secondary">Thành viên</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
