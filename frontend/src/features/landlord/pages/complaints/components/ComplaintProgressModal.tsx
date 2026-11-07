import React, { useEffect } from 'react';
import { Modal, Form, Radio, Input } from '@/shared/components';
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
        status: complaint.status === 'PENDING' ? 'PROCESSING' : complaint.status,
        resolutionNote: complaint.resolutionNote || 'Chủ nhà đã hẹn thợ kiểm tra và khắc phục.',
      });
    }
  }, [open, complaint]);

  const handleFinish = async () => {
    if (!complaint) return;
    try {
      const values = await form.validateFields();
      await onSubmit(complaint.id, values as UpdateComplaintProgressDto);
    } catch {
      // Form validation error is shown inline, mutation error is handled in mutation hook
    }
  };

  return (
    <Modal
      title="Phản hồi khiếu nại"
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Lưu & báo khách"
      cancelText="Hủy"
      width={700}
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        <div className="space-y-1.5 pb-1 text-stay-text text-sm">
          <p>
            Khiếu nại: <strong className="text-stay-primary">#{complaint?.id}</strong> | Phòng:{' '}
            <strong className="text-stay-text">{complaint?.roomName}</strong> (
            {complaint?.tenantName})
          </p>
          <p className="text-stay-text-secondary">
            Nội dung phản ánh:{' '}
            <strong className="text-stay-text">{complaint?.title}</strong> - {complaint?.content || ''}
          </p>
        </div>

        <div className="pt-3 border-t border-stay-border-subtle">
          <Form.Item
            label={<span className="text-stay-text font-medium">Trạng thái xử lý</span>}
            name="status"
            rules={[{ required: true, message: 'Chọn trạng thái' }]}
          >
            <Radio.Group className="flex flex-wrap gap-3">
              <Radio value="PROCESSING">Đang xử lý</Radio>
              <Radio value="RESOLVED">Đã giải quyết</Radio>
              <Radio value="REJECTED">Từ chối</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label={<span className="text-stay-text font-medium ">Nội dung phản hồi</span>}
            name="resolutionNote"
            rules={[{ required: true, message: 'Nhập nội dung phản hồi ' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ví dụ: Đã liên hệ thợ điện nước, sẽ qua phòng lúc 14h chiều nay..."
              className="rounded-lg p-3"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
