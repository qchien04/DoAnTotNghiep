import React, { useState } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { Check } from 'lucide-react';

import { RoomLinkInvitation } from '@/shared/types/tenant';

interface RoomInvitationModalProps {
  open: boolean;
  invitation?: RoomLinkInvitation;
  onCancel: () => void;
  onAccept: () => void;
  onReject: (reason: string) => void;
}

export const RoomInvitationModal: React.FC<RoomInvitationModalProps> = ({
  open,
  invitation,
  onCancel,
  onAccept,
  onReject,
}) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('Tôi không thuê phòng này');

  const handleConfirmReject = () => {
    onReject(rejectReason);
    setRejectMode(false);
  };

  const buildingName = invitation?.buildingName || 'Tòa nhà Ánh Dương';
  const addressText = invitation?.address || `Phòng ${invitation?.roomName || '102'} - ${buildingName}`;
  const landlordInfo = `${invitation?.landlordName || 'Chủ trọ'}${invitation?.landlordPhone ? ` - SĐT: ${invitation.landlordPhone}` : ''}`;
  const priceText = invitation?.monthlyRent ? `${invitation.monthlyRent.toLocaleString()} VNĐ/tháng` : '3.800.000 VNĐ/tháng';
  const roleText = invitation?.roleInRoom === 'REPRESENTATIVE' ? 'Khách thuê đại diện hợp đồng' : 'Thành viên thuê cùng';

  return (
    <Modal
      open={open}
      onCancel={() => {
        setRejectMode(false);
        onCancel();
      }}
      footer={null}
      width={680}
      title={<span className="text-base font-bold text-stay-text">Chi Tiết Lời Mời Liên Kết Phòng Trọ</span>}
    >
      <div className="space-y-5 pt-3 text-xs">
        {!rejectMode ? (
          <>
            <p className="text-stay-text-secondary leading-relaxed">
              Chủ trọ đã gửi đề nghị liên kết tài khoản của bạn với phòng trọ thực tế. Vui lòng đối soát các thông tin dưới đây trước khi chấp nhận:
            </p>

            {/* Bảng thông tin đối soát chuẩn UC16 */}
            <div className="border border-stay-border rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text font-bold">
                    <th className="p-3 w-1/3">Mục thông tin</th>
                    <th className="p-3 w-1/2">Chi tiết từ chủ nhà cung cấp</th>
                    <th className="p-3 w-1/4">Trạng thái xác thực</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stay-border">
                  <tr>
                    <td className="p-3 font-semibold text-stay-text">Tên tòa nhà / Khu trọ</td>
                    <td className="p-3 text-stay-text">{buildingName}</td>
                    <td className="p-3 text-emerald-700 font-semibold">Đã xác thực địa chỉ</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-stay-text">Địa chỉ phòng</td>
                    <td className="p-3 text-stay-text">{addressText}</td>
                    <td className="p-3 text-emerald-700 font-semibold">Chính xác</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-stay-text">Chủ nhà trọ</td>
                    <td className="p-3 text-stay-text">{landlordInfo}</td>
                    <td className="p-3 text-emerald-700 font-semibold">Đã xác minh danh tính</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-stay-text">Giá phòng thỏa thuận</td>
                    <td className="p-3 font-bold text-stay-primary">{priceText}</td>
                    <td className="p-3 text-slate-500">Theo hợp đồng thuê</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-stay-text">Vai trò của bạn</td>
                    <td className="p-3 text-stay-text">{roleText}</td>
                    <td className="p-3 text-slate-500">
                      {invitation?.roleInRoom === 'REPRESENTATIVE' ? 'Có quyền nhận hóa đơn' : 'Thành viên cùng phòng'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stay-border">
              <Button
                variant="outline"
                size="md"
                className="text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => setRejectMode(true)}
              >
                Từ chối liên kết
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="md" onClick={onCancel}>
                  Để sau
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={<Check className="w-4 h-4" />}
                  onClick={onAccept}
                >
                  Chấp nhận liên kết phòng
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Reject Sub-view */
          <div className="space-y-4">
            <div>
              <label className="text-slate-500 block mb-1">
                Lý do từ chối lời mời liên kết phòng:
              </label>
              <Input.TextArea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stay-border">
              <Button variant="outline" size="sm" onClick={() => setRejectMode(false)}>
                Quay lại
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmReject}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
