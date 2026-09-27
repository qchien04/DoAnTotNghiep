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
      title={<span className="text-base font-bold text-stay-text">Nhóm Đã Đủ Thành Viên (2/2)</span>}
    >
      <div className="space-y-4 pt-2 text-xs">
        <p className="text-stay-text leading-relaxed">
          Chúc mừng bạn! Nhóm ở ghép phòng <strong>P102 - Tòa nhà Ánh Dương</strong> đã có đủ 2/2 thành viên (Phạm Minh Đức & Nguyễn Văn Hùng).
        </p>

        <div className="p-3.5 bg-stay-bg-app border border-stay-border rounded-xl space-y-2">
          <span className="font-bold text-stay-text block">Thông tin liên lạc các thành viên trong nhóm:</span>
          <div className="flex items-center justify-between text-stay-text">
            <span>1. Phạm Minh Đức (Chủ phòng)</span>
            <span className="font-semibold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-stay-primary" /> 0977888999
            </span>
          </div>
          <div className="flex items-center justify-between text-stay-text">
            <span>2. Nguyễn Văn Hùng (Thành viên mới)</span>
            <span className="font-semibold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-stay-primary" /> 0966555444 (Zalo)
            </span>
          </div>
        </div>

        <p className="text-slate-500">
          Bạn có muốn chuyển trạng thái bài đăng sang <strong>HOÀN THÀNH</strong> để đóng nhận đơn mới không? Hệ thống sẽ tự động gửi lời cảm ơn và từ chối lịch sự tới các ứng viên còn lại trong danh sách chờ.
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
