import React from 'react';
import { RoommatePost } from '@/shared/types/tenant';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface LifestyleInfoTableProps {
  post: RoommatePost;
}

export const LifestyleInfoTable: React.FC<LifestyleInfoTableProps> = ({ post }) => {
  const ls = post.lifestyle;

  const getGenderText = (val?: string) => {
    if (val === 'MALE') return 'Nam';
    if (val === 'FEMALE') return 'Nữ';
    return 'Linh hoạt (Nam hoặc Nữ)';
  };

  const getSleepTimeText = (val?: string) => {
    if (val === 'BEFORE_23H') return 'Trước 23:00 (Ngủ sớm)';
    if (val === 'AROUND_23H_24H' || val === 'BEFORE_24H') return 'Khoảng 23:00 - 24:00';
    if (val === 'AFTER_24H') return 'Sau 24:00 đêm (Cú đêm)';
    return 'Khoảng 23:00 - 24:00';
  };

  const getCookingText = (val?: string) => {
    if (val === 'DAILY') return 'Nấu ăn thường xuyên hàng ngày';
    if (val === 'SOMETIMES') return 'Thỉnh thoảng nấu ăn';
    if (val === 'RARELY') return 'Hiếm khi nấu ăn tại phòng';
    return 'Thỉnh thoảng nấu ăn';
  };

  const getGuestText = (val?: string) => {
    if (val === 'NEVER') return 'Hạn chế dẫn bạn về phòng';
    if (val === 'WEEKENDS_ONLY') return 'Báo trước / Chỉ dịp cuối tuần';
    if (val === 'ANYTIME') return 'Thoải mái dẫn bạn bè tới';
    return 'Báo trước cho nhau';
  };

  const rows = [
    {
      label: 'Giới tính mong muốn',
      value: getGenderText(ls?.genderPreference),
      isHard: true,
      note: 'Ưu tiên hòa hợp sinh hoạt',
    },
    {
      label: 'Giờ giấc thức - ngủ',
      value: getSleepTimeText(ls?.sleepTime),
      isHard: false,
      note: 'Giữ yên tĩnh trong phòng',
    },
    {
      label: 'Thói quen hút thuốc lá',
      value: ls?.smoking ? 'Có hút thuốc' : 'Tuyệt đối không hút thuốc',
      isHard: !ls?.smoking,
      note: !ls?.smoking ? 'Tiêu chí bắt buộc' : 'Trao đổi thêm',
    },
    {
      label: 'Nuôi thú cưng (Chó/Mèo)',
      value: ls?.petFriendly ? 'Thân thiện / Có thể nuôi' : 'Không nuôi thú cưng',
      isHard: false,
      note: ls?.petFriendly ? 'Thoải mái cùng chăm sóc' : 'Tránh gây phiền phức',
    },
    {
      label: 'Nấu ăn tại phòng',
      value: getCookingText(ls?.cookingFrequency),
      isHard: false,
      note: 'Dọn dẹp sạch sẽ sau khi dùng bếp',
    },
    {
      label: 'Dẫn bạn bè / Khách về chơi',
      value: getGuestText(ls?.guestsAllowed),
      isHard: false,
      note: 'Tôn trọng không gian riêng tư',
    },
    {
      label: 'Mức độ ngăn nắp sạch sẽ',
      value: ls?.cleanlinessLevel === 'VERY_CLEAN' ? 'Rất sạch sẽ, dọn định kỳ' : 'Gọn gàng, ngăn nắp',
      isHard: false,
      note: 'Phân công dọn vệ sinh chung',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stay-text">
          Tiêu chuẩn lối sống & Thói quen sinh hoạt
        </h3>
        <span className="text-xs text-stay-text-secondary">
          Khảo sát lối sống 8 chiều
        </span>
      </div>

      <div className="border border-stay-border rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text font-bold">
              <th className="p-3 w-4/12">Tiêu chí</th>
              <th className="p-3 w-5/12">Thói quen của phòng</th>
              <th className="p-3 w-3/12">Mức độ ưu tiên</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stay-border">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-stay-bg-app/50 transition-colors">
                <td className="p-3 font-medium text-stay-text">{row.label}</td>
                <td className="p-3 font-semibold text-stay-text">
                  <span className="inline-flex items-center gap-1.5">
                    {row.isHard ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-stay-primary shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-stay-text-muted shrink-0" />
                    )}
                    <span>{row.value}</span>
                  </span>
                </td>
                <td className="p-3">
                  {row.isHard ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <AlertCircle className="w-3 h-3" />
                      <span>{row.note}</span>
                    </span>
                  ) : (
                    <span className="text-stay-text-secondary text-[11px]">{row.note}</span>
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
