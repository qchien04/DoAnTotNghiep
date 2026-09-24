import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from '@/shared/components';
import { message } from 'antd';
import { CreateTenantDto, Room, Tenant } from '@/shared/types/landlord';

interface TenantFormModalProps {
  open: boolean;
  editingTenant: Tenant | null;
  rooms: Room[];
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateTenantDto) => Promise<void>;
}

export const TenantFormModal: React.FC<TenantFormModalProps> = ({
  open,
  editingTenant,
  rooms,
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
          identityCard: editingTenant.identityCard || editingTenant.idCardNumber,
          hometown: editingTenant.hometown,
          gender: editingTenant.gender,
          birthDate: editingTenant.birthDate || editingTenant.dateOfBirth,
          isRepresentative: Boolean(editingTenant.isRepresentative),
          roomId: editingTenant.roomId,
          buildingId: editingTenant.buildingId,
        });
      } else {
        if (rooms.length > 0) {
          form.setFieldsValue({
            roomId: rooms[0].id,
            buildingId: rooms[0].buildingId,
            isRepresentative: false,
            hometown: 'Hải Phòng',
          });
        }
      }
    }
  }, [open, editingTenant, rooms]);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        ...values,
        isRepresentative: Boolean(values.isRepresentative),
      } as CreateTenantDto);
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
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
        {/* SECTION 1: NHÂN THÂN & LIÊN HỆ */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            1. Thông tin cá nhân & số điện thoại
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-stay-text font-medium text-xs">Họ và tên khách thuê (*)</span>}
                name="fullName"
                rules={[{ required: true, message: 'Nhập họ và tên (*)' }]}
                className="mb-0"
              >
                <Input placeholder="Ví dụ: Lê Văn Cường..." className="h-10" />
              </Form.Item>

              <Form.Item
                label={<span className="text-stay-text font-medium text-xs">Số điện thoại liên lạc (*)</span>}
                name="phone"
                rules={[{ required: true, message: 'Nhập số điện thoại (*)' }]}
                className="mb-0"
              >
                <Input placeholder="Ví dụ: 0905111222..." className="h-10" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-stay-text font-medium text-xs">Số định danh CCCD / CMND (*)</span>}
                name="identityCard"
                rules={[{ required: true, message: 'Nhập số CCCD (*)' }]}
                className="mb-0"
              >
                <Input placeholder="Ví dụ: 001200009999..." className="h-10 font-mono" />
              </Form.Item>

              <Form.Item
                label={<span className="text-stay-text font-medium text-xs">Quê quán / Nơi thường trú</span>}
                name="hometown"
                className="mb-0"
              >
                <Input placeholder="Ví dụ: Hà Nội, Hải Phòng..." className="h-10" />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* SECTION 2: PHÒNG & VAI TRÒ */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            2. Bố trí phòng ở & vai trò
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-stay-text font-medium text-xs">Chọn phòng trọ bố trí (*)</span>}
                name="roomId"
                rules={[{ required: true, message: 'Vui lòng chọn phòng (*)' }]}
                className="mb-0"
              >
                <Select
                  className="w-full h-10"
                  options={rooms.map((r: any) => ({
                    label: `${r.roomCode || r.code || ''} - ${r.name}`,
                    value: r.id,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-stay-text font-medium text-xs">Vai trò trong phòng trọ</span>}
                name="isRepresentative"
                initialValue={false}
                className="mb-0"
              >
                <Select
                  className="w-full h-10"
                  options={[
                    { label: 'Thành viên ở cùng', value: false },
                    { label: 'Đại diện hợp đồng chính', value: true },
                  ]}
                />
              </Form.Item>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};
