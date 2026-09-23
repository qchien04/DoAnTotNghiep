import React, { useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { Modal, Form, Input, Radio } from '@/shared/components';
import { InputNumber, message } from 'antd';
import { Bill, ConfirmPaymentDto } from '@/shared/types/landlord';

interface ConfirmPaymentModalProps {
  open: boolean;
  bill: Bill | null;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (billId: string | number, dto: ConfirmPaymentDto) => Promise<void>;
}

export const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({
  open,
  bill,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && bill) {
      form.resetFields();
      form.setFieldsValue({
        amount: bill.remainingAmount || bill.totalAmount,
        paymentMethod: 'BANK_TRANSFER',
        note: 'Đã nhận tiền phòng qua chuyển khoản ngân hàng',
      });
    }
  }, [open, bill]);

  const handleFinish = async () => {
    if (!bill) return;
    try {
      const values = await form.validateFields();
      await onSubmit(bill.id, values as ConfirmPaymentDto);
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-lg pb-1">
          <CreditCard className="w-5 h-5" />
          <span>Xác Nhận Thu Tiền & Gạch Nợ Hóa Đơn</span>
        </div>
      }
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Xác nhận đã nhận tiền"
      cancelText="Hủy"
      width={560}
      className="stay-modal-wide"
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border text-xs space-y-1.5 text-stay-text">
          <p className="text-stay-text-secondary">
            Hóa đơn: <strong className="text-stay-text">{bill?.invoiceCode || bill?.billNumber}</strong>
          </p>
          <p className="text-stay-text-secondary">
            Phòng:{' '}
            <strong className="text-stay-text">{bill?.roomCode || bill?.roomName}</strong> (
            {bill?.representativeTenantName || bill?.tenantName})
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-base mt-2 pt-2 border-t border-stay-border">
            Số tiền phải thu: {(bill?.remainingAmount || bill?.totalAmount || 0).toLocaleString()} VNĐ
          </p>
        </div>

        <Form.Item
          label={<span className="text-stay-text font-medium text-xs">Số tiền thực nhận (VNĐ) (*)</span>}
          name="amount"
          rules={[{ required: true, message: 'Vui lòng nhập số tiền đã nhận' }]}
        >
          <InputNumber
            className="w-full h-10 pt-1 font-bold text-emerald-600 dark:text-emerald-400"
            step={100000}
            formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0) as any}
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-stay-text font-medium text-xs">Hình thức thanh toán</span>}
          name="paymentMethod"
          initialValue="BANK_TRANSFER"
        >
          <Radio.Group className="flex gap-4">
            <Radio value="BANK_TRANSFER">Chuyển khoản</Radio>
            <Radio value="CASH">Tiền mặt</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={<span className="text-stay-text font-medium text-xs">Ghi chú xác nhận</span>}
          name="note"
        >
          <Input placeholder="Ví dụ: Đã nhận qua MB Bank, khách nộp tiền mặt..." className="h-10" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
