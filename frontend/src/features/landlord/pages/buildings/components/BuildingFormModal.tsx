import React, { useEffect } from 'react';
import { Modal, Form, Input } from '@/shared/components';
import { Building, CreateBuildingDto } from '@/shared/types/landlord';

interface BuildingFormModalProps {
  open: boolean;
  editingBuilding: Building | null;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateBuildingDto) => Promise<void>;
}

export const BuildingFormModal: React.FC<BuildingFormModalProps> = ({
  open,
  editingBuilding,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editingBuilding) {
        form.setFieldsValue({
          name: editingBuilding.name,
          province: editingBuilding.province || 'Hà Nội',
          district: editingBuilding.district || 'Cầu Giấy',
          ward: editingBuilding.ward || '',
          address: editingBuilding.address || editingBuilding.addressDetail,
          totalFloors: editingBuilding.totalFloors || editingBuilding.numFloors || 5,
          rules: editingBuilding.rules || editingBuilding.generalRules,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          province: 'Hà Nội',
          district: 'Cầu Giấy',
          totalFloors: 5,
        });
      }
    }
  }, [open, editingBuilding, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values as CreateBuildingDto);
  };

  return (
    <Modal
      title={editingBuilding ? `Cập nhật tòa nhà: ${editingBuilding.name}` : 'Thêm tòa nhà mới'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={editingBuilding ? 'Cập nhật' : 'Lưu tòa nhà'}
      cancelText="Hủy"
      width={680}
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        <Form.Item
          label={<span className="font-semibold text-stay-text text-sm">Tên tòa nhà / Khu trọ</span>}
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên tòa nhà (*)' }]}
        >
          <Input placeholder="Ví dụ: Tòa nhà Ánh Dương, KTX Bách Khoa..." className="h-10" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Form.Item
            label={<span className="font-semibold text-stay-text text-sm">Tỉnh / Thành phố</span>}
            name="province"
            initialValue="Hà Nội"
          >
            <Input placeholder="Hà Nội" className="h-10" />
          </Form.Item>
          <Form.Item
            label={<span className="font-semibold text-stay-text text-sm">Quận / Huyện</span>}
            name="district"
            initialValue="Cầu Giấy"
          >
            <Input placeholder="Cầu Giấy" className="h-10" />
          </Form.Item>
          <Form.Item
            label={<span className="font-semibold text-stay-text text-sm">Số tầng</span>}
            name="totalFloors"
            rules={[{ required: true, message: 'Nhập số tầng (*)' }]}
            initialValue={5}
          >
            <Input type="number" min={1} className="h-10" />
          </Form.Item>
        </div>

        <Form.Item
          label={<span className="font-semibold text-stay-text text-sm">Địa chỉ chi tiết</span>}
          name="address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết (*)' }]}
        >
          <Input placeholder="Số 12 Ngõ 80 Cầu Giấy, Dịch Vọng Hậu..." className="h-10" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-stay-text text-sm">Quy định chung của tòa nhà</span>}
          name="rules"
        >
          <Input.TextArea
            rows={3}
            placeholder="Quy định giờ giấc, bảo đảm an ninh trật tự, khóa cổng ban đêm, giữ gìn vệ sinh chung..."
            className="p-3"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
