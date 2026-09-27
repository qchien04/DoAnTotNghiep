import React from 'react';
import { Button } from '@/shared/components';
import { Mail } from 'lucide-react';

import { RoomLinkInvitation } from '@/shared/types/tenant';

interface RoomInviteBannerProps {
  invitation?: RoomLinkInvitation;
  onOpenInviteModal: () => void;
}

export const RoomInviteBanner: React.FC<RoomInviteBannerProps> = ({
  invitation,
  onOpenInviteModal,
}) => {
  const landlord = invitation?.landlordName || 'Chủ trọ';
  const roomName = invitation?.roomName ? `Phòng ${invitation.roomName}` : 'phòng trọ';
  const buildingName = invitation?.buildingName ? ` - ${invitation.buildingName}` : '';

  return (
    <div className="p-4 rounded-xl bg-stay-primary/5 border border-stay-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-stay-primary text-white shrink-0 mt-0.5">
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-sm text-stay-text">
            Chủ nhà {landlord} vừa gửi lời mời bạn liên kết với {roomName}{buildingName}!
          </p>
          <p className="text-xs text-stay-text-secondary mt-0.5">
            Xác nhận liên kết để kích hoạt hợp đồng điện tử, nhận thông báo đóng tiền và thanh toán hóa đơn VietQR.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="primary" size="sm" onClick={onOpenInviteModal}>
          Xem chi tiết lời mời
        </Button>
      </div>
    </div>
  );
};
