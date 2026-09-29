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
      width={560}
      title={<span className="text-base font-bold text-stay-text">Từ chối ứng viên</span>}
    >
      <div className="space-y-4 pt-2 text-xs">
        <div>
          <label className="text-stay-text-secondary block mb-1">
            Lý do từ chối (tùy chọn):
          </label>
          <Input.TextArea
            rows={3}
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Nhập lý do gửi đến ứng viên..."
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
