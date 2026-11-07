import React from 'react';
import { Modal, Input } from '@/shared/components';
import { InvoiceResponse } from '@/shared/types/landlord';

interface CancelBillModalProps {
  open: boolean;
  bill: InvoiceResponse | null;
  cancelReason: string;
  onCancelReasonChange: (val: string) => void;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}

export const CancelBillModal: React.FC<CancelBillModalProps> = ({
  open,
  bill,
  cancelReason,
  onCancelReasonChange,
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
      width={580}
    >
      <div className="py-2 space-y-4">
        <p className=" text-stay-text-secondary leading-relaxed">
          Nhập lý do hủy hóa đơn{' '}
          <strong className="text-stay-text">Kỳ {bill?.billingPeriod} (#{bill?.id})</strong>:
        </p>
        <Input.TextArea
          rows={3}
          value={cancelReason}
          onChange={(e) => onCancelReasonChange(e.target.value)}
          placeholder="Lập nhầm cho phòng khác, tính sai số công tơ..."
          className="rounded-xl p-3"
        />
      </div>
    </Modal>
  );
};
