import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from '@/shared/components';
import { CreateTenantDto, Tenant } from '@/shared/types/landlord';

interface TenantFormModalProps {
  open: boolean;
  editingTenant: Tenant | null;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateTenantDto) => Promise<void>;
}

export const TenantFormModal: React.FC<TenantFormModalProps> = ({
  open,
  editingTenant,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (editingTenant) {
        form.setFieldsValue({
          fullName: editingTenant.fullName,
          phone: editingTenant.phone,
          idCardNumber: editingTenant.idCardNumber,
          hometown: editingTenant.hometown,
          gender: editingTenant.gender || 'MALE',
          dateOfBirth: editingTenant.dateOfBirth,
        });
      } else {
        form.setFieldsValue({
          gender: 'MALE',
          hometown: 'Hà Nội',
        });
      }
    }
  }, [open, editingTenant]);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values as CreateTenantDto);
    } catch {
      // Form validation error is shown inline, mutation error is handled in mutation hook
    }
  };

  return (
    <Modal
      title={editingTenant ? `Cập nhật khách thuê: ${editingTenant.fullName}` : 'Thêm khách thuê'}
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={editingTenant ? 'Lưu cập nhật' : 'Lưu khách thuê'}
      cancelText="Hủy"
      width={720}
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium">Họ và tên khách thuê</span>}
              name="fullName"
              rules={[{ required: true, message: 'Nhập họ và tên' }]}
              className="mb-0"
            >
              <Input placeholder="Ví dụ: Lê Văn Cường..." className="h-10" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium">Số điện thoại liên lạc</span>}
              name="phone"
              rules={[{ required: true, message: 'Nhập số điện thoại' }]}
              className="mb-0"
            >
              <Input placeholder="Ví dụ: 0905111222..." className="h-10" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium">Số định danh CCCD / CMND</span>}
              name="idCardNumber"
              rules={[{ required: true, message: 'Nhập số CCCD' }]}
              className="mb-0"
            >
              <Input placeholder="Ví dụ: 001200009999..." className="h-10 font-mono" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium">Quê quán / Nơi thường trú</span>}
              name="hometown"
              className="mb-0"
            >
              <Input placeholder="Ví dụ: Hà Nội, Hải Phòng..." className="h-10" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium">Giới tính</span>}
              name="gender"
              className="mb-0"
            >
              <Select
                className="w-full h-10"
                options={[
                  { label: 'Nam', value: 'MALE' },
                  { label: 'Nữ', value: 'FEMALE' },
                  { label: 'Khác', value: 'OTHER' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium">Ngày sinh</span>}
              name="dateOfBirth"
              className="mb-0"
            >
              <Input type="date" className="h-10" />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};
