import React from 'react';
import { Modal, Form, Select, Input, Button } from '@/shared/components';

interface ReportPostModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const ReportPostModal: React.FC<ReportPostModalProps> = ({
  open,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={<span className="text-base font-bold text-stay-text">Báo Cáo Vi Phạm Bài Đăng</span>}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} className="pt-3 space-y-4">
        <Form.Item
          name="reason"
          label="Lý do báo cáo vi phạm"
          rules={[{ required: true, message: 'Vui lòng chọn lý do!' }]}
        >
          <Select
            options={[
              { label: 'Lừa đảo tiền cọc, thông tin phòng sai sự thật', value: 'FRAUD' },
              { label: 'Địa chỉ hoặc hình ảnh không trùng khớp thực tế', value: 'FAKE_INFO' },
              { label: 'Ngôn từ xúc phạm, thiếu văn minh', value: 'INAPPROPRIATE' },
              { label: 'Lý do khác', value: 'OTHER' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả cụ thể sự việc"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết!' }]}
        >
          <Input.TextArea rows={4} placeholder="Cung cấp thêm bằng chứng hoặc mô tả hiện tượng vi phạm..." />
        </Form.Item>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stay-border">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" htmlType="submit">
            Gửi báo cáo
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
