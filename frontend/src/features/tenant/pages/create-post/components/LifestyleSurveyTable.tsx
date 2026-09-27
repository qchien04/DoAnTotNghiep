import React from 'react';
import { Select, Input } from '@/shared/components';

export interface LifestyleFormValues {
  gender: string;
  genderImportance: string;
  occupation: string;
  occupationImportance: string;
  sleepTime: string;
  sleepTimeImportance: string;
  smoking: string;
  smokingImportance: string;
  pet: string;
  petImportance: string;
  cooking: string;
  cookingImportance: string;
  guest: string;
  guestImportance: string;
}

interface LifestyleSurveyTableProps {
  values: LifestyleFormValues;
  onChange: (newVals: LifestyleFormValues) => void;
}

export const LifestyleSurveyTable: React.FC<LifestyleSurveyTableProps> = ({
  values,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
        Bảng khảo sát lối sống & Thói quen sinh hoạt (Bắt buộc)
      </label>
      <div className="bg-stay-card-bg border border-stay-border rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text font-bold">
              <th className="p-3 w-1/3">Tiêu chí lối sống</th>
              <th className="p-3 w-1/3">Lựa chọn của người đăng</th>
              <th className="p-3 w-1/3">Mức độ quan trọng yêu cầu đối phương</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stay-border">
            <tr>
              <td className="p-3 font-semibold text-stay-text">Giới tính</td>
              <td className="p-3">
                <Select
                  value={values.gender}
                  onChange={(val) => onChange({ ...values, gender: val })}
                  className="w-full text-xs"
                  options={[
                    { label: 'Nam', value: 'Nam' },
                    { label: 'Nữ', value: 'Nữ' },
                    { label: 'Linh hoạt', value: 'Linh hoạt' },
                  ]}
                />
              </td>
              <td className="p-3">
                <span className="font-semibold text-red-600">Bắt buộc</span>
              </td>
            </tr>

            <tr>
              <td className="p-3 font-semibold text-stay-text">Nghề nghiệp / Tình trạng</td>
              <td className="p-3">
                <Input
                  value={values.occupation}
                  onChange={(e) => onChange({ ...values, occupation: e.target.value })}
                />
              </td>
              <td className="p-3 text-slate-500">Linh hoạt</td>
            </tr>

            <tr>
              <td className="p-3 font-semibold text-stay-text">Giờ giấc thức - ngủ</td>
              <td className="p-3">
                <Select
                  value={values.sleepTime}
                  onChange={(val) => onChange({ ...values, sleepTime: val })}
                  className="w-full text-xs"
                  options={[
                    { label: 'Ngủ sau 23h, thức dậy 7h sáng', value: 'Ngủ sau 23h, thức dậy 7h sáng' },
                    { label: 'Ngủ sớm trước 23h', value: 'Ngủ sớm trước 23h' },
                    { label: 'Cú đêm sau 24h', value: 'Cú đêm sau 24h' },
                  ]}
                />
              </td>
              <td className="p-3 text-slate-500">Tương đồng (không ồn ào đêm)</td>
            </tr>

            <tr>
              <td className="p-3 font-semibold text-stay-text">Thói quen hút thuốc lá</td>
              <td className="p-3">
                <Select
                  value={values.smoking}
                  onChange={(val) => onChange({ ...values, smoking: val })}
                  className="w-full text-xs"
                  options={[
                    { label: 'Hoàn toàn không hút thuốc', value: 'Hoàn toàn không hút thuốc' },
                    { label: 'Có hút thuốc ngoài ban công', value: 'Có hút thuốc ngoài ban công' },
                  ]}
                />
              </td>
              <td className="p-3">
                <span className="font-semibold text-red-600">Bắt buộc không hút thuốc</span>
              </td>
            </tr>

            <tr>
              <td className="p-3 font-semibold text-stay-text">Nuôi thú cưng (Chó/Mèo)</td>
              <td className="p-3">
                <Select
                  value={values.pet}
                  onChange={(val) => onChange({ ...values, pet: val })}
                  className="w-full text-xs"
                  options={[
                    { label: 'Không nuôi thú cưng', value: 'Không nuôi thú cưng' },
                    { label: 'Có nuôi thú cưng', value: 'Có nuôi thú cưng' },
                  ]}
                />
              </td>
              <td className="p-3 text-slate-500">Ưu tiên không nuôi</td>
            </tr>

            <tr>
              <td className="p-3 font-semibold text-stay-text">Nấu ăn tại phòng</td>
              <td className="p-3">
                <Select
                  value={values.cooking}
                  onChange={(val) => onChange({ ...values, cooking: val })}
                  className="w-full text-xs"
                  options={[
                    { label: 'Thường xuyên nấu ăn buổi tối', value: 'Thường xuyên nấu ăn buổi tối' },
                    { label: 'Thỉnh thoảng nấu ăn', value: 'Thỉnh thoảng nấu ăn' },
                    { label: 'Không nấu ăn', value: 'Không nấu ăn' },
                  ]}
                />
              </td>
              <td className="p-3 text-slate-500">Thoải mái cùng nấu</td>
            </tr>

            <tr>
              <td className="p-3 font-semibold text-stay-text">Khách tới chơi / Bạn bè</td>
              <td className="p-3">
                <Select
                  value={values.guest}
                  onChange={(val) => onChange({ ...values, guest: val })}
                  className="w-full text-xs"
                  options={[
                    { label: 'Báo trước trước khi dẫn bạn về', value: 'Báo trước trước khi dẫn bạn về' },
                    { label: 'Tự do thoải mái', value: 'Tự do thoải mái' },
                    { label: 'Hạn chế tối đa khách lạ', value: 'Hạn chế tối đa khách lạ' },
                  ]}
                />
              </td>
              <td className="p-3 text-slate-500">Đồng thuận tôn trọng riêng tư</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
