import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Form, Radio, Input } from '@/shared/components';
import { message } from 'antd';
import { Complaint, UpdateComplaintProgressDto } from '@/shared/types/landlord';

interface ComplaintProgressModalProps {
  open: boolean;
  complaint: Complaint | null;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (complaintId: string | number, dto: UpdateComplaintProgressDto) => Promise<void>;
}

export const ComplaintProgressModal: React.FC<ComplaintProgressModalProps> = ({
  open,
  complaint,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && complaint) {
      form.resetFields();
      form.setFieldsValue({
        status: complaint.status === 'NEW' ? 'PROCESSING' : complaint.status,
        responseNote: complaint.responseNote || 'Chủ nhà đã hẹn thợ kiểm tra và khắc phục.',
      });
    }
  }, [open, complaint]);

  const handleFinish = async () => {
    if (!complaint) return;
    try {
      const values = await form.validateFields();
      await onSubmit(complaint.id, values as UpdateComplaintProgressDto);
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-stay-primary font-bold text-lg pb-1">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>Cập Nhật Tiến Độ & Phản Hồi Khiếu Nại</span>
        </div>
      }
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Lưu phản hồi & Báo khách"
      cancelText="Hủy"
      width={640}
      className="stay-modal-wide"
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border text-xs space-y-2 text-stay-text">
          <p>
            Mã khiếu nại: <strong className="text-stay-primary">{complaint?.code}</strong> | Phòng:{' '}
            <strong className="text-stay-text">{complaint?.roomName}</strong> (
            {complaint?.senderName})
          </p>
          <p>
            Nội dung phản ánh:{' '}
            <strong className="text-stay-text">{complaint?.title}</strong> - {complaint?.content || ''}
          </p>
        </div>

        <Form.Item
          label={<span className="text-stay-text font-medium text-xs">Trạng thái xử lý (*)</span>}
          name="status"
          rules={[{ required: true, message: 'Chọn trạng thái (*)' }]}
        >
          <Radio.Group className="flex flex-wrap gap-3">
            <Radio value="PROCESSING">Đang xử lý</Radio>
            <Radio value="RESOLVED">Đã giải quyết</Radio>
            <Radio value="REJECTED">Từ chối</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={<span className="text-stay-text font-medium text-xs">Nội dung phản hồi / Lịch hẹn khách thuê (*)</span>}
          name="responseNote"
          rules={[{ required: true, message: 'Nhập nội dung phản hồi (*)' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Ví dụ: Đã liên hệ thợ điện nước, sẽ qua phòng lúc 14h chiều nay..."
            className="rounded-xl p-3"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
