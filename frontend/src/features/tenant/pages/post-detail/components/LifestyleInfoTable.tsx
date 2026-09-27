import React from 'react';

export const LifestyleInfoTable: React.FC = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-stay-text">
        Bảng lối sống & Thói quen sinh hoạt của người đang ở
      </h3>
      <div className="border border-stay-border rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text font-bold">
              <th className="p-3 w-1/3">Tiêu chí lối sống</th>
              <th className="p-3 w-1/3">Lựa chọn của người đăng</th>
              <th className="p-3 w-1/3">Mức độ quan trọng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stay-border">
            <tr>
              <td className="p-3 font-semibold text-stay-text">Giới tính</td>
              <td className="p-3">Nam</td>
              <td className="p-3 text-red-600 font-semibold">Bắt buộc</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stay-text">Giờ giấc thức - ngủ</td>
              <td className="p-3">Ngủ sau 23h, thức dậy 7h sáng</td>
              <td className="p-3 text-slate-500">Tương đồng (không ồn ào đêm)</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stay-text">Thói quen hút thuốc lá</td>
              <td className="p-3">Hoàn toàn không hút thuốc</td>
              <td className="p-3 text-red-600 font-semibold">Bắt buộc không hút thuốc</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stay-text">Nuôi thú cưng (Chó/Mèo)</td>
              <td className="p-3">Không nuôi thú cưng</td>
              <td className="p-3 text-slate-500">Ưu tiên không nuôi</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stay-text">Nấu ăn tại phòng</td>
              <td className="p-3">Thường xuyên nấu ăn buổi tối</td>
              <td className="p-3 text-slate-500">Thoải mái cùng nấu</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stay-text">Khách tới chơi / Bạn bè</td>
              <td className="p-3">Báo trước trước khi dẫn bạn về</td>
              <td className="p-3 text-slate-500">Đồng thuận tôn trọng riêng tư</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
