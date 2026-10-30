import React from 'react';
import { Modal, Form, Input, Select, Button, Upload } from '@/shared/components';
import { message } from 'antd';
import { CreateTenantComplaintDto } from '@/shared/types/tenant';

interface CreateComplaintModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateTenantComplaintDto) => Promise<void>;
  loading?: boolean;
}

export const CreateComplaintModal: React.FC<CreateComplaintModalProps> = ({
  open,
  onCancel,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        type: values.type,
        title: values.title,
        content: values.content,
        urgency: values.urgency,
        images: [
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
        ],
      });
      form.resetFields();
    } catch {
      // Form validation error is shown inline, mutation error is handled in mutation hook
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      title={<span className="text-base font-bold text-stay-text">Báo hỏng & Phản ánh sự cố</span>}
    >
      <Form
        form={form}
        layout="vertical"
        className="space-y-4 pt-2 "
        initialValues={{
          type: 'AIR_CONDITIONER',
          urgency: 'HIGH',
          title: 'Điều hòa chảy nước và không mát',
          content: 'Điều hòa bật 16 độ nhưng chỉ có gió thoang thoảng, nước chảy rỉ xuống sàn gỗ từ đêm qua.',
        }}
      >
        {/* Section 1 */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Loại sự cố"
              rules={[{ required: true, message: 'Vui lòng chọn loại sự cố!' }]}
              className="mb-0"
            >
              <Select
                options={[
                  { label: 'Điều hòa & Điện lạnh', value: 'AIR_CONDITIONER' },
                  { label: 'Điện sinh hoạt (Đèn, quạt, ổ cắm)', value: 'ELECTRICITY' },
                  { label: 'Nước sinh hoạt (Vòi sen, đường ống, bình nóng lạnh)', value: 'WATER' },
                  { label: 'An ninh trật tự & Khóa cửa', value: 'SECURITY' },
                  { label: 'Cơ sở vật chất khác', value: 'OTHER' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="urgency"
              label="Mức độ khẩn cấp"
              rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
              className="mb-0"
            >
              <Select
                options={[
                  { label: 'Khẩn cấp (Xử lý ngay trong ngày)', value: 'URGENT' },
                  { label: 'Cao (Xử lý trong vòng 24h)', value: 'HIGH' },
                  { label: 'Bình thường (1 - 2 ngày)', value: 'MEDIUM' },
                  { label: 'Thấp (Sửa chữa định kỳ)', value: 'LOW' },
                ]}
              />
            </Form.Item>
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 pt-4 border-t border-stay-border-subtle">
          <div className="space-y-3">
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề sự cố!' }]}
              className="mb-0"
            >
              <Input placeholder="Ví dụ: Điều hòa chảy nước và không mát..." />
            </Form.Item>

            <Form.Item
              name="content"
              label="Mô tả sự cố"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung mô tả chi tiết!' }]}
              className="mb-0"
            >
              <Input.TextArea
                rows={3}
                placeholder="Mô tả hiện tượng và thời gian phát sinh..."
              />
            </Form.Item>
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-3 pt-4 border-t border-stay-border-subtle">
          <label className="font-semibold text-stay-text text-sm block">
            Ảnh chụp hiện trạng
          </label>
          <Upload.Dragger
            title="Kéo thả ảnh vào đây hoặc nhấp để tải"
            hint="Hỗ trợ JPG, PNG (tối đa 5 ảnh)"
            beforeUpload={() => {
              message.success('Đã chọn ảnh hiện trạng sự cố!');
              return false;
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stay-border">
          <Button variant="outline" size="md" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={handleFinish}
          >
            Gửi khiếu nại
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
