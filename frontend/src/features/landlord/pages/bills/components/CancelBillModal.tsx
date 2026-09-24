import React from 'react';
import { Modal, Input } from '@/shared/components';
import { Bill } from '@/shared/types/landlord';

interface CancelBillModalProps {
  open: boolean;
  bill: Bill | null;
  reason: string;
  onReasonChange: (val: string) => void;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}

export const CancelBillModal: React.FC<CancelBillModalProps> = ({
  open,
  bill,
  reason,
  onReasonChange,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Hủy hóa đơn"
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="Xác nhận hủy hóa đơn"
      okButtonProps={{ danger: true }}
      cancelText="Bỏ qua"
      width={520}
    >
      <div className="py-2 space-y-4">
        <p className="text-xs text-stay-text-secondary leading-relaxed">
          Nhập lý do hủy hóa đơn{' '}
          <strong className="text-stay-text">{bill?.invoiceCode || bill?.billNumber}</strong>:
        </p>
        <Input.TextArea
          rows={3}
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Lập nhầm cho phòng khác, tính sai số công tơ..."
          className="rounded-xl p-3"
        />
      </div>
    </Modal>
  );
};
