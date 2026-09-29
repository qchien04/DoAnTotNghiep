import React from 'react';
import { Modal, Button } from '@/shared/components';
import { Check } from 'lucide-react';
import { RoommateApplication } from '@/shared/types/tenant';

interface ReviewApplicantModalProps {
  open: boolean;
  onCancel: () => void;
  applicant: RoommateApplication | null;
  onApprove: () => void;
  onOpenReject: () => void;
}

export const ReviewApplicantModal: React.FC<ReviewApplicantModalProps> = ({
  open,
  onCancel,
  applicant,
  onApprove,
  onOpenReject,
}) => {
  if (!applicant) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={840}
      title={
        <span className="text-base font-bold text-stay-text">
          Đối chiếu lối sống • {applicant.applicantName || `#${applicant.id}`}
        </span>
      }
    >
      <div className="space-y-4 pt-2">
        {/* Applicant Summary */}
        <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-stay-text text-sm block">
                {applicant.applicantName} ({applicant.birthYear || 2004})
              </span>
              <span className="text-stay-text-muted">
                Quê: {applicant.hometown || 'Hải Dương'} • {applicant.occupationOrSchool}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-stay-text-muted block">Độ tương thích:</span>
              <span className="text-base font-bold text-emerald-600">
                {applicant.compatibilityScore}% (Rất hợp)
              </span>
            </div>
          </div>

          {applicant.introMessage && (
            <div className="pt-2 border-t border-stay-border/70 text-stay-text italic">
              "{applicant.introMessage}"
            </div>
          )}
        </div>

        {/* Bảng đối chiếu trực quan từng tiêu chí lối sống (Chuẩn UC15) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
            Bảng đối chiếu từng tiêu chí sinh hoạt
          </label>

          <div className="border border-stay-border rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text font-bold">
                  <th className="p-3 w-1/4">Tiêu chí sinh hoạt</th>
                  <th className="p-3 w-1/4">Chủ phòng (Phạm Minh Đức)</th>
                  <th className="p-3 w-1/4">Ứng viên ({applicant.applicantName})</th>
                  <th className="p-3 w-1/4">Mức độ hòa hợp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stay-border">
                <tr>
                  <td className="p-3 font-semibold text-stay-text">Giờ ngủ đêm</td>
                  <td className="p-3 text-stay-text">23h00 - 23h30</td>
                  <td className="p-3 text-stay-text">23h30</td>
                  <td className="p-3 text-emerald-700 font-semibold">Hoàn toàn phù hợp</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-stay-text">Hút thuốc lá</td>
                  <td className="p-3 text-stay-text">Không hút thuốc</td>
                  <td className="p-3 text-stay-text">
                    {applicant.lifestyle?.smoking ? 'Có hút thuốc' : 'Không hút thuốc'}
                  </td>
                  <td className="p-3 text-emerald-700 font-semibold">
                    {applicant.lifestyle?.smoking ? 'Khác biệt (Hút thuốc)' : 'Trùng khớp 100%'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-stay-text">Thú cưng</td>
                  <td className="p-3 text-stay-text">Không nuôi thú cưng</td>
                  <td className="p-3 text-stay-text">Không nuôi thú cưng</td>
                  <td className="p-3 text-emerald-700 font-semibold">Trùng khớp 100%</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-stay-text">Nấu ăn</td>
                  <td className="p-3 text-stay-text">Thường xuyên nấu bữa tối</td>
                  <td className="p-3 text-stay-text">Chỉ nấu bữa tối</td>
                  <td className="p-3 text-emerald-700 font-semibold">Dễ dàng chia sẻ bếp</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-stay-text">Lời nhắn gửi</td>
                  <td className="p-3 text-stay-text-muted">Muốn tìm bạn ngủ sớm, giữ vệ sinh</td>
                  <td className="p-3 text-stay-text-muted">Ít ở phòng ban ngày, gọn gàng</td>
                  <td className="p-3 text-emerald-700 font-semibold">Đáp ứng tốt mong muốn</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-stay-border">
          <Button
            variant="outline"
            size="md"
            className="text-red-600 hover:bg-red-50 border-red-200"
            onClick={onOpenReject}
          >
            Từ chối ứng viên
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={onCancel}>
              Đóng
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Check className="w-4 h-4" />}
              onClick={onApprove}
            >
              Đồng ý cho vào nhóm
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
