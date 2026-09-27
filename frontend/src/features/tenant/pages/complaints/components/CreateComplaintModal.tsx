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
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={680}
      title={<span className="text-base font-bold text-stay-text">Tạo Phản Ánh / Khiếu Nại Sự Cố Phòng Trọ</span>}
    >
      <Form
        form={form}
        layout="vertical"
        className="space-y-5 pt-3 text-xs"
        initialValues={{
          type: 'COOLING',
          urgency: 'HIGH',
          title: 'Điều hòa chảy nước và không mát',
          content: 'Điều hòa bật 16 độ nhưng chỉ có gió thoang thoảng, nước chảy rỉ xuống sàn gỗ từ đêm qua.',
        }}
      >
        {/* Section 1: Label nằm ra ngoài card */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
            1. Phân loại sự cố & Mức độ khẩn cấp
          </label>
          <div className="bg-stay-bg-app border border-stay-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Phân loại sự cố"
              rules={[{ required: true, message: 'Vui lòng chọn loại sự cố!' }]}
            >
              <Select
                options={[
                  { label: 'Hỏng thiết bị điện lạnh (Điều hòa, Tủ lạnh)', value: 'COOLING' },
                  { label: 'Điện nước sinh hoạt (Bình nóng lạnh, Bóng đèn, Vòi nước)', value: 'PLUMBING' },
                  { label: 'Cơ sở vật chất / Cửa sổ, Khóa phòng', value: 'OTHER' },
                  { label: 'An ninh trật tự / Tiếng ồn xung quanh', value: 'SECURITY' },
                  { label: 'Sai lệch số điện nước trên hóa đơn', value: 'BILL' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="urgency"
              label="Mức độ khẩn cấp"
              rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
            >
              <Select
                options={[
                  { label: 'Khẩn cấp (Cần xử lý ngay trong ngày)', value: 'HIGH' },
                  { label: 'Bình thường (Xử lý trong 1-2 ngày)', value: 'MEDIUM' },
                ]}
              />
            </Form.Item>
          </div>
        </div>

        {/* Section 2: Label nằm ra ngoài card */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
            2. Thông tin chi tiết sự cố
          </label>
          <div className="bg-stay-bg-app border border-stay-border rounded-xl p-4 space-y-3">
            <Form.Item
              name="title"
              label="Tiêu đề khiếu nại (*)"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề sự cố!' }]}
            >
              <Input placeholder="Ví dụ: Điều hòa chảy nước và không mát..." />
            </Form.Item>

            <Form.Item
              name="content"
              label="Mô tả chi tiết tình trạng sự cố (*)"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung mô tả chi tiết!' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Mô tả hiện tượng, thời gian phát sinh và ảnh hưởng tới sinh hoạt..."
              />
            </Form.Item>
          </div>
        </div>

        {/* Section 3: Label nằm ra ngoài card */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
            3. Hình ảnh / Video bằng chứng hiện trạng
          </label>
          <div className="bg-stay-bg-app border border-stay-border rounded-xl p-4">
            <Upload.Dragger
              title="Kéo thả ảnh chụp sự cố vào đây hoặc nhấp để tải"
              hint="Khuyến khích đính kèm ảnh chụp hiện trạng để chủ nhà nắm bắt chính xác và mang đúng dụng cụ sửa chữa (Tối đa 5 ảnh)"
              beforeUpload={() => {
                message.success('Đã chọn ảnh hiện trạng sự cố!');
                return false;
              }}
            />
          </div>
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
