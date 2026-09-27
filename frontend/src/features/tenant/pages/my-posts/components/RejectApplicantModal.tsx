import React from 'react';
import { Modal, Button, Input } from '@/shared/components';

interface RejectApplicantModalProps {
  open: boolean;
  onCancel: () => void;
  reason: string;
  onReasonChange: (val: string) => void;
  onConfirm: () => void;
}

export const RejectApplicantModal: React.FC<RejectApplicantModalProps> = ({
  open,
  onCancel,
  reason,
  onReasonChange,
  onConfirm,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={<span className="text-base font-bold text-stay-text">Lý Do Từ Chối Ứng Viên</span>}
    >
      <div className="space-y-4 pt-3 text-xs">
        <div>
          <label className="text-slate-500 block mb-1">
            Lý do gửi phản hồi tới ứng viên (tùy chọn):
          </label>
          <Input.TextArea
            rows={3}
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stay-border">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
          >
            Xác nhận từ chối
          </Button>
        </div>
      </div>
    </Modal>
  );
};
