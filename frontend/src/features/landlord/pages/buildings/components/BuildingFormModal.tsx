import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Tag,
  LocationPickerModal,
  LocationSelectedData,
  message,
} from '@/shared/components';
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
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingBuilding) {
        if (editingBuilding.latitude && editingBuilding.longitude) {
          setCurrentCoords({
            lat: Number(editingBuilding.latitude),
            lng: Number(editingBuilding.longitude),
          });
        } else {
          setCurrentCoords(null);
        }

        form.setFieldsValue({
          name: editingBuilding.name,
          province: editingBuilding.province || 'Thành phố Hà Nội',
          ward: editingBuilding.ward || '',
          addressDetail: editingBuilding.addressDetail || '',
          numFloors: editingBuilding.numFloors || 5,
          generalRules: editingBuilding.generalRules || '',
          latitude: editingBuilding.latitude,
          longitude: editingBuilding.longitude,
        });
      } else {
        form.resetFields();
        setCurrentCoords(null);
        form.setFieldsValue({
          province: 'Thành phố Hà Nội',
          ward: '',
          numFloors: 5,
        });
      }
    }
  }, [open, editingBuilding, form]);

  const handleLocationConfirmed = (data: LocationSelectedData) => {
    setCurrentCoords({ lat: data.latitude, lng: data.longitude });
    form.setFieldsValue({
      latitude: data.latitude,
      longitude: data.longitude,
    });
    if (data.province && !form.getFieldValue('province')) {
      form.setFieldsValue({ province: data.province });
    }
    if (data.ward && !form.getFieldValue('ward')) {
      form.setFieldsValue({ ward: data.ward });
    }
    if (data.address && !form.getFieldValue('addressDetail')) {
      form.setFieldsValue({ addressDetail: data.address });
    }
    message.success('Đã ghim vị trí địa lý cho tòa nhà thành công!');
  };

  const handleGetQuickLocation = () => {
    if (!navigator.geolocation) {
      message.error('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeolocating(false);
        const lat = Number(pos.coords.latitude.toFixed(7));
        const lng = Number(pos.coords.longitude.toFixed(7));
        setCurrentCoords({ lat, lng });
        form.setFieldsValue({ latitude: lat, longitude: lng });
        message.success('Đã lấy vị trí GPS hiện tại cho tòa nhà thành công!');
      },
      (err) => {
        setIsGeolocating(false);
        message.warning(
          err.code === 1
            ? 'Vui lòng cấp quyền truy cập vị trí trên trình duyệt.'
            : 'Không thể lấy vị trí hiện tại.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values as CreateBuildingDto);
  };

  return (
    <>
      <Modal
        title={editingBuilding ? `Cập nhật tòa nhà: ${editingBuilding.name}` : 'Thêm tòa nhà mới'}
        open={open}
        onOk={handleOk}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        okText={editingBuilding ? 'Cập nhật' : 'Lưu tòa nhà'}
        cancelText="Hủy"
        width={720}
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
              initialValue="Thành phố Hà Nội"
              rules={[{ required: true, message: 'Vui lòng nhập Tỉnh / Thành phố' }]}
            >
              <Input placeholder="Ví dụ: Thành phố Hà Nội" className="h-10" />
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold text-stay-text text-sm">Phường / Xã</span>}
              name="ward"
              rules={[{ required: true, message: 'Vui lòng nhập Phường / Xã' }]}
            >
              <Input placeholder="Ví dụ: Phường Bách Khoa" className="h-10" />
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold text-stay-text text-sm">Số tầng</span>}
              name="numFloors"
              rules={[{ required: true, message: 'Nhập số tầng (*)' }]}
              initialValue={5}
            >
              <Input type="number" min={1} className="h-10" />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-semibold text-stay-text text-sm">Địa chỉ chi tiết</span>}
            name="addressDetail"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết (*)' }]}
          >
            <Input placeholder="Số 12 Ngõ 80 Cầu Giấy, Dịch Vọng Hậu..." className="h-10" />
          </Form.Item>

          {/* Vị trí bản đồ & GPS cho tòa nhà */}
          <div className="p-3.5 rounded-lg bg-stay-bg-app border border-stay-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-stay-text block">
                  Tọa độ GPS / Vị trí tòa nhà:
                </span>
                <span className="text-[11px] text-stay-text-secondary">
                  (Vị trí này sẽ được tự động fill cho tất cả các phòng trọ thuộc tòa nhà)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  type="default"
                  onClick={handleGetQuickLocation}
                  loading={isGeolocating}
                  className="text-xs"
                >
                  Vị trí hiện tại
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-xs"
                >
                  Chọn trên bản đồ
                </Button>
              </div>
            </div>

            {currentCoords ? (
              <div className="flex items-center gap-2 pt-1 border-t border-stay-border text-xs">
                <Tag color="green" className="m-0 font-mono font-medium">
                  LAT: {currentCoords.lat.toFixed(6)}
                </Tag>
                <Tag color="cyan" className="m-0 font-mono font-medium">
                  LNG: {currentCoords.lng.toFixed(6)}
                </Tag>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Đã ghim vị trí tòa nhà</span>
              </div>
            ) : (
              <p className="text-[11px] text-stay-text-secondary italic">
                Chưa ghim vị trí. Bấm "Vị trí hiện tại" hoặc "Chọn trên bản đồ" để ghim tọa độ tòa nhà.
              </p>
            )}

            <Form.Item name="latitude" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="longitude" hidden>
              <Input />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-semibold text-stay-text text-sm">Quy định chung của tòa nhà</span>}
            name="generalRules"
          >
            <Input.TextArea
              rows={3}
              placeholder="Quy định giờ giấc, bảo đảm an ninh trật tự, khóa cổng ban đêm, giữ gìn vệ sinh chung..."
              className="p-3"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chọn vị trí trên bản đồ */}
      <LocationPickerModal
        open={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={handleLocationConfirmed}
        initialLat={currentCoords?.lat || (editingBuilding?.latitude ? Number(editingBuilding.latitude) : 21.0285)}
        initialLng={currentCoords?.lng || (editingBuilding?.longitude ? Number(editingBuilding.longitude) : 105.8048)}
        title={editingBuilding ? `Chọn vị trí bản đồ cho tòa nhà ${editingBuilding.name}` : 'Chọn vị trí bản đồ cho tòa nhà mới'}
      />
    </>
  );
};
