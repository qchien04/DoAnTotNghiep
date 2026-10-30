import React, { useEffect } from 'react';
import { Modal, Form, Input, Radio } from '@/shared/components';
import { DollarSign } from 'lucide-react';
import { InputNumber } from 'antd';
import { InvoiceResponse, InvoicePaymentRequest } from '@/shared/types/landlord';

interface ConfirmPaymentModalProps {
  open: boolean;
  bill: InvoiceResponse | null;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (billId: string | number, dto: InvoicePaymentRequest) => Promise<void>;
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
        paymentAmount: bill.remainingAmount || bill.totalAmount,
        paymentMethod: 'BANK_TRANSFER',
        paymentNote: 'Đã nhận tiền phòng qua chuyển khoản ngân hàng',
      });
    }
  }, [open, bill]);

  const handleFinish = async () => {
    if (!bill) return;
    try {
      const values = await form.validateFields();
      await onSubmit(bill.id, values as InvoicePaymentRequest);
    } catch {
      // Form validation error is shown inline, mutation error is handled in mutation hook
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-stay-primary" />
          <span>Xác nhận thu tiền hóa đơn</span>
        </div>
      }
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Xác nhận đã nhận tiền"
      cancelText="Hủy"
      width={640}
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        {/* TỔNG QUAN HÓA ĐƠN */}
        <div className="bg-stay-bg-app/40 border border-stay-border rounded-xl p-4 space-y-3 text-[14px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-28 shrink-0">Hóa đơn:</span>
              <span className="text-stay-text font-semibold text-[14px]">
                Kỳ {bill?.billingPeriod} (#{bill?.id})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-28 shrink-0">Phòng thuê:</span>
              <span className="text-stay-text font-semibold text-[14px]">
                {bill?.roomName || '—'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-28 shrink-0">Khách đại diện:</span>
              <span className="text-stay-text font-medium text-[14px]">
                {bill?.representativeTenantName || '—'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-28 shrink-0">Phải thu:</span>
              <span className="font-bold text-stay-text text-[15px]">
                {(bill?.remainingAmount || bill?.totalAmount || 0).toLocaleString()} VNĐ
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-stay-border-subtle">
          <Form.Item
            label={<span className="text-stay-text font-medium">Số tiền thực nhận (VNĐ)</span>}
            name="paymentAmount"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền đã nhận' }]}
          >
          <InputNumber
            className="w-full h-10 pt-1 font-bold text-stay-text"
            step={100000}
            formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0) as any}
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-stay-text font-medium ">Hình thức thanh toán</span>}
          name="paymentMethod"
          initialValue="BANK_TRANSFER"
        >
          <Radio.Group className="flex gap-4">
            <Radio value="BANK_TRANSFER">Chuyển khoản</Radio>
            <Radio value="CASH">Tiền mặt</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={<span className="text-stay-text font-medium">Ghi chú xác nhận</span>}
          name="paymentNote"
        >
          <Input placeholder="Ví dụ: Đã nhận qua MB Bank, khách nộp tiền mặt..." className="h-10" />
        </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
