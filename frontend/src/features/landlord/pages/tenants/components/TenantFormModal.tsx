import React, { useEffect } from 'react';
import { Users, User, DoorOpen } from 'lucide-react';
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
          identityCard: editingTenant.identityCard,
          hometown: editingTenant.hometown,
          gender: editingTenant.gender,
          birthDate: editingTenant.birthDate,
          roleInRoom: editingTenant.roleInRoom || 'MEMBER',
          roomId: editingTenant.roomId,
          buildingId: editingTenant.buildingId,
        });
      } else {
        if (rooms.length > 0) {
          form.setFieldsValue({
            roomId: rooms[0].id,
            buildingId: rooms[0].buildingId,
            roleInRoom: 'MEMBER',
            hometown: 'Hải Phòng',
          });
        }
      }
    }
  }, [open, editingTenant, rooms]);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values as CreateTenantDto);
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
          <Users className="w-5 h-5" />
          <span>{editingTenant ? 'Cập Nhật Hồ Sơ Khách Thuê' : 'Thêm Khách Thuê Vào Phòng'}</span>
        </div>
      }
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={editingTenant ? 'Lưu cập nhật' : 'Lưu khách thuê'}
      cancelText="Hủy"
      width={720}
      className="stay-modal-wide"
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        {/* SECTION 1: NHÂN THÂN & LIÊN HỆ */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
          <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
            <User className="w-4 h-4 text-stay-primary" />
            <span>1. Thông tin nhân thân & Số điện thoại</span>
          </div>

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

        {/* SECTION 2: PHÒNG & VAI TRÒ */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
          <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
            <DoorOpen className="w-4 h-4 text-stay-primary" />
            <span>2. Bố trí phòng ở & Quyền hạn</span>
          </div>

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
              name="roleInRoom"
              initialValue="MEMBER"
              className="mb-0"
            >
              <Select
                className="w-full h-10"
                options={[
                  { label: 'Thành viên ở cùng', value: 'MEMBER' },
                  { label: 'Đại diện hợp đồng chính', value: 'REPRESENTATIVE' },
                ]}
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};
