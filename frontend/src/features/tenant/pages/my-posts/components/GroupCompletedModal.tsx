import React from 'react';
import { Modal, Button } from '@/shared/components';
import { Phone } from 'lucide-react';

interface GroupCompletedModalProps {
  open: boolean;
  onCancel: () => void;
  onFinishGroup: () => void;
}

export const GroupCompletedModal: React.FC<GroupCompletedModalProps> = ({
  open,
  onCancel,
  onFinishGroup,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={580}
      title={<span className="text-base font-bold text-stay-text">Nhóm đã đủ thành viên (2/2)</span>}
    >
      <div className="space-y-4 pt-2 text-xs">
        <p className="text-stay-text leading-relaxed">
          Nhóm phòng <strong>P102 - Tòa nhà Ánh Dương</strong> đã đủ 2/2 thành viên.
        </p>

        <div className="p-3.5 bg-stay-bg-app border border-stay-border rounded-xl space-y-2">
          <span className="font-bold text-stay-text block">Thông tin liên lạc thành viên:</span>
          <div className="flex items-center justify-between text-stay-text">
            <span>1. Phạm Minh Đức (Chủ phòng)</span>
            <span className="font-semibold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-stay-primary" /> 0977888999
            </span>
          </div>
          <div className="flex items-center justify-between text-stay-text">
            <span>2. Nguyễn Văn Hùng (Thành viên mới)</span>
            <span className="font-semibold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-stay-primary" /> 0966555444
            </span>
          </div>
        </div>

        <p className="text-stay-text-secondary">
          Chuyển bài đăng sang trạng thái <strong>Hoàn thành</strong> để dừng nhận đơn và từ chối các ứng viên trong danh sách chờ?
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stay-border">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Để sau
          </Button>
          <Button variant="primary" size="sm" onClick={onFinishGroup}>
            Hoàn thành nhóm
          </Button>
        </div>
      </div>
    </Modal>
  );
};
