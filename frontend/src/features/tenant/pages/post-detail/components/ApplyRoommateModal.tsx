import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '@/shared/components';
import { LifestyleSurvey } from '@/shared/types/tenant';

interface ApplyRoommateModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: { introMessage: string; lifestyle: LifestyleSurvey }) => Promise<void>;
  loading?: boolean;
}

export const ApplyRoommateModal: React.FC<ApplyRoommateModalProps> = ({
  open,
  onCancel,
  onSubmit,
  loading,
}) => {
  const [applicantSurvey, setApplicantSurvey] = useState({
    fullName: 'Nguyễn Văn Hùng',
    birthYear: '2004',
    hometown: 'Hải Dương',
    schoolOrJob: 'Sinh viên năm 3 Đại học Giao thông Vận tải',
    introMessage: 'Chào bạn, mình học ngay gần đường Cầu Giấy, tính tình gọn gàng, ít khi ở phòng ban ngày, rất mong muốn được ghép phòng cùng bạn!',
    gender: 'Nam',
    sleepTime: 'Khoảng 23h30 - 6h30',
    smoking: 'Không hút thuốc',
    pet: 'Không nuôi',
    cooking: 'Chỉ nấu bữa tối đơn giản',
    guest: 'Chỉ thỉnh thoảng và luôn báo trước',
  });

  const handleConfirm = async () => {
    const survey: LifestyleSurvey = {
      genderPreference: applicantSurvey.gender === 'Nam' ? 'MALE' : 'FEMALE',
      sleepTime: 'AROUND_23H_24H',
      smoking: applicantSurvey.smoking.includes('Có hút'),
      petFriendly: applicantSurvey.pet.includes('Có nuôi'),
      cookingFrequency: 'SOMETIMES',
      cleanlinessLevel: 'VERY_CLEAN',
      personality: 'BALANCED',
      guestsAllowed: 'WEEKENDS_ONLY',
    };

    await onSubmit({
      introMessage: applicantSurvey.introMessage,
      lifestyle: survey,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      title={<span className="text-base font-bold text-stay-text">Hồ Sơ Ứng Tuyển Ở Ghép</span>}
    >
      <div className="space-y-5 pt-3">
        {/* Section 1: Label nằm ra ngoài card */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
            1. Thông tin cá nhân & Giới thiệu bản thân
          </label>
          <div className="bg-stay-bg-app border border-stay-border rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Họ và tên:</span>
                <Input
                  value={applicantSurvey.fullName}
                  onChange={(e) => setApplicantSurvey({ ...applicantSurvey, fullName: e.target.value })}
                />
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Năm sinh:</span>
                <Input
                  value={applicantSurvey.birthYear}
                  onChange={(e) => setApplicantSurvey({ ...applicantSurvey, birthYear: e.target.value })}
                />
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Quê quán:</span>
                <Input
                  value={applicantSurvey.hometown}
                  onChange={(e) => setApplicantSurvey({ ...applicantSurvey, hometown: e.target.value })}
                />
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Nghề nghiệp / Trường học:</span>
                <Input
                  value={applicantSurvey.schoolOrJob}
                  onChange={(e) => setApplicantSurvey({ ...applicantSurvey, schoolOrJob: e.target.value })}
                />
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">
                Lời nhắn gửi chủ phòng (*)
              </span>
              <Input.TextArea
                rows={3}
                value={applicantSurvey.introMessage}
                onChange={(e) => setApplicantSurvey({ ...applicantSurvey, introMessage: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Label nằm ra ngoài card */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
            2. Bảng trả lời khảo sát lối sống sinh hoạt của ứng viên
          </label>
          <div className="border border-stay-border rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text font-bold">
                  <th className="p-3 w-1/3">Tiêu chí khảo sát</th>
                  <th className="p-3 w-1/3">Câu trả lời của ứng viên</th>
                  <th className="p-3 w-1/3">Mức độ tự đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stay-border">
                <tr>
                  <td className="p-3 font-semibold text-stay-text">Giới tính</td>
                  <td className="p-3">
                    <Select
                      value={applicantSurvey.gender}
                      onChange={(val) => setApplicantSurvey({ ...applicantSurvey, gender: val })}
                      className="w-full text-xs"
                      options={[
                        { label: 'Nam', value: 'Nam' },
                        { label: 'Nữ', value: 'Nữ' },
                      ]}
                    />
                  </td>
                  <td className="p-3 text-emerald-600 font-semibold">Khớp yêu cầu</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stay-text">Thời gian ngủ đêm</td>
                  <td className="p-3">
                    <Select
                      value={applicantSurvey.sleepTime}
                      onChange={(val) => setApplicantSurvey({ ...applicantSurvey, sleepTime: val })}
                      className="w-full text-xs"
                      options={[
                        { label: 'Khoảng 23h30 - 6h30', value: 'Khoảng 23h30 - 6h30' },
                        { label: 'Trước 23h00', value: 'Trước 23h00' },
                        { label: 'Sau 24h00', value: 'Sau 24h00' },
                      ]}
                    />
                  </td>
                  <td className="p-3 text-slate-500">Tương đồng</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stay-text">Hút thuốc lá</td>
                  <td className="p-3">
                    <Select
                      value={applicantSurvey.smoking}
                      onChange={(val) => setApplicantSurvey({ ...applicantSurvey, smoking: val })}
                      className="w-full text-xs"
                      options={[
                        { label: 'Không hút thuốc', value: 'Không hút thuốc' },
                        { label: 'Có hút thuốc', value: 'Có hút thuốc' },
                      ]}
                    />
                  </td>
                  <td className="p-3 text-emerald-600 font-semibold">Khớp yêu cầu 100%</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stay-text">Nuôi thú cưng</td>
                  <td className="p-3">
                    <Select
                      value={applicantSurvey.pet}
                      onChange={(val) => setApplicantSurvey({ ...applicantSurvey, pet: val })}
                      className="w-full text-xs"
                      options={[
                        { label: 'Không nuôi', value: 'Không nuôi' },
                        { label: 'Có nuôi', value: 'Có nuôi' },
                      ]}
                    />
                  </td>
                  <td className="p-3 text-emerald-600 font-semibold">Khớp yêu cầu 100%</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stay-text">Tần suất nấu ăn</td>
                  <td className="p-3">
                    <Select
                      value={applicantSurvey.cooking}
                      onChange={(val) => setApplicantSurvey({ ...applicantSurvey, cooking: val })}
                      className="w-full text-xs"
                      options={[
                        { label: 'Chỉ nấu bữa tối đơn giản', value: 'Chỉ nấu bữa tối đơn giản' },
                        { label: 'Nấu ăn thường xuyên', value: 'Nấu ăn thường xuyên' },
                        { label: 'Không nấu ăn', value: 'Không nấu ăn' },
                      ]}
                    />
                  </td>
                  <td className="p-3 text-slate-500">Hòa đồng</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stay-text">Dẫn bạn bè về phòng</td>
                  <td className="p-3">
                    <Select
                      value={applicantSurvey.guest}
                      onChange={(val) => setApplicantSurvey({ ...applicantSurvey, guest: val })}
                      className="w-full text-xs"
                      options={[
                        { label: 'Chỉ thỉnh thoảng và luôn báo trước', value: 'Chỉ thỉnh thoảng và luôn báo trước' },
                        { label: 'Tự do thoải mái', value: 'Tự do thoải mái' },
                      ]}
                    />
                  </td>
                  <td className="p-3 text-slate-500">Tôn trọng không gian chung</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stay-border">
          <Button variant="outline" size="md" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={handleConfirm}
          >
            Xác nhận gửi hồ sơ tham gia
          </Button>
        </div>
      </div>
    </Modal>
  );
};
