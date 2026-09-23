import React, { useEffect } from 'react';
import { Receipt, Sparkles, DollarSign, Settings2 } from 'lucide-react';
import { Modal, Form, Input, Select, Switch } from '@/shared/components';
import { InputNumber, message } from 'antd';
import { CreateServiceDto, UtilityService } from '@/shared/types/landlord';

interface ServiceFormModalProps {
  open: boolean;
  editingService: UtilityService | null;
  servicesCount: number;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateServiceDto) => Promise<void>;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  open,
  editingService,
  servicesCount,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (editingService) {
        form.setFieldsValue({
          serviceCode:
            editingService.serviceCode ||
            editingService.code ||
            `DV${String(editingService.id || '').padStart(2, '0')}`,
          name: editingService.name,
          category: editingService.category || 'OTHER',
          unit: editingService.unit || 'Tháng',
          unitPrice: Number(
            editingService.unitPrice !== undefined
              ? editingService.unitPrice
              : editingService.price !== undefined
              ? editingService.price
              : 0
          ),
          billingMethod:
            editingService.billingMethod || editingService.chargingType || 'FIXED_PER_ROOM',
          scope: editingService.scope || editingService.appliedScope || 'ALL',
          isActive:
            editingService.isActive !== undefined
              ? Boolean(editingService.isActive)
              : editingService.status === 'ACTIVE',
        });
      } else {
        const nextCode = `DV${String(servicesCount + 1).padStart(2, '0')}`;
        form.setFieldsValue({
          serviceCode: nextCode,
          category: 'OTHER',
          unit: 'Tháng',
          billingMethod: 'FIXED_PER_ROOM',
          unitPrice: 100000,
          scope: 'ALL',
          isActive: true,
        });
      }
    }
  }, [open, editingService, servicesCount]);

  const handleCategoryChange = (cat: string) => {
    const curName = form.getFieldValue('name');
    switch (cat) {
      case 'ELECTRICITY':
        form.setFieldsValue({
          name: !curName || curName === 'nước' || curName === 'điện' ? 'Điện sinh hoạt' : curName,
          unit: 'kWh (Số)',
          billingMethod: 'METER_INDEX',
          unitPrice: form.getFieldValue('unitPrice') || 3800,
        });
        break;
      case 'WATER':
        form.setFieldsValue({
          name: !curName || curName === 'nước' || curName === 'điện' ? 'Nước sinh hoạt' : curName,
          unit: 'm³ (Khối)',
          billingMethod: 'METER_INDEX',
          unitPrice: form.getFieldValue('unitPrice') || 30000,
        });
        break;
      case 'INTERNET':
        form.setFieldsValue({
          name: !curName ? 'Internet Wifi' : curName,
          unit: 'Phòng/Tháng',
          billingMethod: 'FIXED_PER_ROOM',
          unitPrice: form.getFieldValue('unitPrice') || 100000,
        });
        break;
      case 'CLEANING':
        form.setFieldsValue({
          name: !curName ? 'Vệ sinh & Rác' : curName,
          unit: 'Phòng/Tháng',
          billingMethod: 'FIXED_PER_ROOM',
          unitPrice: form.getFieldValue('unitPrice') || 50000,
        });
        break;
      case 'PARKING':
        form.setFieldsValue({
          name: !curName ? 'Phí gửi xe máy' : curName,
          unit: 'Xe/Tháng',
          billingMethod: 'FIXED_PER_UNIT',
          unitPrice: form.getFieldValue('unitPrice') || 100000,
        });
        break;
      case 'ELEVATOR':
        form.setFieldsValue({
          name: !curName ? 'Thang máy' : curName,
          unit: 'Người/Tháng',
          billingMethod: 'FIXED_PER_PERSON',
          unitPrice: form.getFieldValue('unitPrice') || 50000,
        });
        break;
    }
  };

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        serviceCode:
          values.serviceCode ||
          (editingService ? editingService.serviceCode : `DV${Date.now().toString().slice(-4)}`),
        name: values.name.trim(),
        category: values.category,
        unit: values.unit.trim(),
        unitPrice: Number(values.unitPrice),
        billingMethod: values.billingMethod,
        scope: values.scope || 'ALL',
        isActive: values.isActive !== undefined ? Boolean(values.isActive) : true,
      };

      await onSubmit(payload as CreateServiceDto);
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
          <Receipt className="w-5 h-5" />
          <span>{editingService ? `Cập Nhật Dịch Vụ: ${editingService.name}` : 'Thêm Dịch Vụ Tiện Ích Mới'}</span>
        </div>
      }
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={editingService ? 'Cập nhật' : 'Lưu dịch vụ'}
      cancelText="Hủy"
      width={720}
      className="stay-modal-wide"
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        {/* SECTION 1: ĐỊNH DANH */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
          <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
            <Sparkles className="w-4 h-4 text-stay-primary" />
            <span>1. Định danh & Phân loại dịch vụ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Mã dịch vụ (*)</span>}
              name="serviceCode"
              rules={[{ required: true, message: 'Vui lòng nhập mã dịch vụ (*)' }]}
              className="mb-0"
            >
              <Input placeholder="Ví dụ: DV01, DV_ELEC..." className="h-10" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Phân loại dịch vụ (*)</span>}
              name="category"
              rules={[{ required: true, message: 'Chọn phân loại (*)' }]}
              className="mb-0"
            >
              <Select
                onChange={handleCategoryChange}
                className="w-full h-10"
                options={[
                  { label: 'Điện sinh hoạt (ELECTRICITY)', value: 'ELECTRICITY' },
                  { label: 'Nước sinh hoạt (WATER)', value: 'WATER' },
                  { label: 'Internet Wifi (INTERNET)', value: 'INTERNET' },
                  { label: 'Vệ sinh & Rác (CLEANING)', value: 'CLEANING' },
                  { label: 'Gửi xe (PARKING)', value: 'PARKING' },
                  { label: 'Thang máy (ELEVATOR)', value: 'ELEVATOR' },
                  { label: 'Khác (OTHER)', value: 'OTHER' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Tên dịch vụ (*)</span>}
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ (*)' }]}
              className="mb-0"
            >
              <Input placeholder="Ví dụ: Điện sinh hoạt..." className="h-10" />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 2: ĐƠN GIÁ & CÁCH THU */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
          <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
            <DollarSign className="w-4 h-4 text-stay-primary" />
            <span>2. Định mức chi phí & Hình thức tính thu</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Đơn vị tính (*)</span>}
              name="unit"
              rules={[{ required: true, message: 'Nhập đơn vị tính (*)' }]}
              className="mb-0"
            >
              <Input placeholder="kWh (Số), m³, Phòng/Tháng..." className="h-10" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Đơn giá (VNĐ) (*)</span>}
              name="unitPrice"
              rules={[{ required: true, message: 'Nhập đơn giá (*)' }]}
              className="mb-0"
            >
              <InputNumber
                min={0}
                step={1000}
                className="w-full h-10 pt-1 font-bold text-stay-secondary"
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0) as any}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Hình thức thu phí (*)</span>}
              name="billingMethod"
              rules={[{ required: true, message: 'Chọn hình thức thu (*)' }]}
              className="mb-0"
            >
              <Select
                className="w-full h-10"
                options={[
                  { label: 'Theo công tơ (METER_INDEX)', value: 'METER_INDEX' },
                  { label: 'Cố định theo phòng (FIXED_PER_ROOM)', value: 'FIXED_PER_ROOM' },
                  { label: 'Theo số người ở (FIXED_PER_PERSON)', value: 'FIXED_PER_PERSON' },
                  { label: 'Theo số lượng phát sinh (FIXED_PER_UNIT)', value: 'FIXED_PER_UNIT' },
                ]}
              />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 3: PHẠM VI & TRẠNG THÁI */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
          <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
            <Settings2 className="w-4 h-4 text-stay-primary" />
            <span>3. Phạm vi áp dụng & Trạng thái hoạt động</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Phạm vi áp dụng</span>}
              name="scope"
              className="mb-0"
            >
              <Input placeholder="ALL (Tất cả) hoặc tên tòa nhà..." className="h-10" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Trạng thái áp dụng</span>}
              name="isActive"
              valuePropName="checked"
              className="mb-0"
            >
              <div className="h-10 flex items-center gap-3">
                <Switch defaultChecked />
                <span className="text-xs text-stay-text-secondary font-medium">
                  Đang kích hoạt và áp dụng cho các phòng
                </span>
              </div>
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};
