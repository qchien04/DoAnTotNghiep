import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Tag,
  LocationPickerModal,
  LocationSelectedData,
  message,
} from '@/shared/components';
import { Building, CreateRoomDto, Room, UtilityService } from '@/shared/types/landlord';
import {
  formatServicePriceWithUnit,
  getBillingMethodInfo,
} from '@/shared/utils/serviceUtils';

interface RoomFormModalProps {
  open: boolean;
  editingRoom: Room | null;
  buildings: Building[];
  services: UtilityService[];
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateRoomDto) => Promise<void>;
}

export const RoomFormModal: React.FC<RoomFormModalProps> = ({
  open,
  editingRoom,
  buildings,
  services,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | string | null>(null);

  // Location Picker State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingRoom) {
        setSelectedBuildingId(editingRoom.buildingId);
        if (editingRoom.latitude && editingRoom.longitude) {
          setCurrentCoords({ lat: Number(editingRoom.latitude), lng: Number(editingRoom.longitude) });
        } else {
          setCurrentCoords(null);
        }

        const parsedAmenities = Array.isArray(editingRoom.amenities)
          ? editingRoom.amenities
          : typeof editingRoom.amenities === 'string' && editingRoom.amenities.trim()
            ? editingRoom.amenities.split(',').map((s) => s.trim())
            : [];

        const roomServiceIds =
          editingRoom.serviceIds ||
          (editingRoom.services ? (editingRoom.services as any[]).map((s: any) => s.id) : []);

        form.setFieldsValue({
          buildingId: editingRoom.buildingId,
          code: editingRoom.code || editingRoom.roomCode,
          name: editingRoom.name,
          floor: editingRoom.floor,
          area: editingRoom.area,
          price: editingRoom.price || editingRoom.listedPrice,
          deposit: editingRoom.deposit || editingRoom.standardDeposit,
          capacity: editingRoom.capacity || editingRoom.maxCapacity,
          amenities: parsedAmenities,
          serviceIds: roomServiceIds,
          description: editingRoom.description,
          status: editingRoom.status,
          latitude: editingRoom.latitude,
          longitude: editingRoom.longitude,
        });
      } else {
        form.resetFields();
        setCurrentCoords(null);
        const initialBldId = buildings.length > 0 ? buildings[0].id : null;
        setSelectedBuildingId(initialBldId);
        form.setFieldsValue({
          buildingId: initialBldId,
          floor: 1,
          area: 25,
          capacity: 2,
          price: 3500000,
          deposit: 3500000,
          serviceIds: services.map((s: any) => s.id),
        });
      }
    }
  }, [open, editingRoom, buildings, services, form]);

  const handleLocationConfirmed = (data: LocationSelectedData) => {
    setCurrentCoords({ lat: data.latitude, lng: data.longitude });
    form.setFieldsValue({
      latitude: data.latitude,
      longitude: data.longitude,
    });
    message.success('Đã chọn tọa độ vị trí cho phòng trọ!');
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
        message.success('Đã gán vị trí GPS hiện tại cho phòng trọ thành công!');
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
    await onSubmit(values as CreateRoomDto);
  };

  const currentBldId = Form.useWatch('buildingId', form) || selectedBuildingId;
  const curBld = buildings.find((b: any) => Number(b.id) === Number(currentBldId));

  return (
    <>
      <Modal
        title={editingRoom ? `Cập nhật phòng ${editingRoom.code || editingRoom.roomCode || ''}` : 'Thêm phòng trọ mới'}
        open={open}
        onOk={handleOk}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        okText={editingRoom ? 'Lưu thay đổi' : 'Xác nhận tạo phòng'}
        cancelText="Hủy"
        width={820}
      >
        <Form form={form} layout="vertical" className="mt-4 space-y-5">
          {/* SECTION 1: TÒA NHÀ & VỊ TRÍ PHÒNG TRỌ */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-stay-text">
              1. Tòa nhà & vị trí phòng trọ
            </h3>
            <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-3">

            <Form.Item
              label={<span className="font-semibold text-stay-text text-sm">Chọn tòa nhà chứa phòng (*)</span>}
              name="buildingId"
              rules={[{ required: true, message: 'Vui lòng chọn tòa nhà (*)' }]}
              className="mb-2"
            >
              <Select
                onChange={(val) => setSelectedBuildingId(val)}
                className="w-full h-11"
                options={buildings.map((b: any) => ({
                  label: `${b.buildingCode || b.code || ''} - ${b.name}`,
                  value: b.id,
                }))}
              />
            </Form.Item>

            {curBld && (
              <div className="p-3 rounded-lg bg-stay-card-bg border border-stay-border text-xs flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stay-text text-xs">{curBld.name}</p>
                  <p className="text-[11px] text-stay-text-secondary mt-0.5">
                    {curBld.address || curBld.addressDetail || 'Chưa có địa chỉ chi tiết'}
                  </p>
                </div>
                <Tag className="m-0 bg-stay-bg-app text-stay-text border-stay-border font-medium text-xs px-2.5 py-0.5">
                  {curBld.totalFloors || curBld.numFloors || 1} tầng
                </Tag>
              </div>
            )}

            {/* GPS & Bản đồ */}
            <div className="p-3.5 rounded-lg bg-stay-card-bg border border-stay-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stay-text">
                  Tọa độ GPS / Vị trí phòng:
                </span>
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
                  <span className="text-[11px] text-stay-secondary">Đã ghim vị trí chính xác</span>
                </div>
              ) : (
                <p className="text-[11px] text-stay-text-secondary italic">
                  Chưa ghim vị trí. Bấm "Vị trí hiện tại" hoặc "Chọn trên bản đồ" để ghim tọa độ.
                </p>
              )}

              <Form.Item name="latitude" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="longitude" hidden>
                <Input />
              </Form.Item>
            </div>
          </div>
        </div>

          {/* SECTION 2: QUY MÔ & TÀI CHÍNH */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-stay-text">
              2. Thông tin phòng & giá cước niêm yết
            </h3>
            <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4">
                  <Form.Item
                    label={<span className="font-semibold text-stay-text text-sm">Mã phòng (*)</span>}
                    name="code"
                    rules={[{ required: true, message: 'Nhập mã phòng (*)' }]}
                  >
                    <Input placeholder="Ví dụ: P301..." className="w-full h-11" />
                  </Form.Item>
                </div>
                <div className="sm:col-span-8">
                  <Form.Item
                    label={<span className="font-semibold text-stay-text text-sm">Tên phòng / Tiêu đề hiển thị</span>}
                    name="name"
                  >
                    <Input placeholder="Ví dụ: Phòng 301 ban công thoáng mát..." className="w-full h-11" />
                  </Form.Item>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Form.Item
                  label={<span className="font-semibold text-stay-text text-sm">Tầng bố trí (*)</span>}
                  name="floor"
                  rules={[{ required: true, message: 'Nhập tầng (*)' }]}
                  initialValue={1}
                >
                  <Input
                    type="number"
                    min={1}
                    suffix={<span className="text-xs text-stay-text-muted font-medium">Tầng</span>}
                    className="w-full h-11"
                  />
                </Form.Item>
                <Form.Item
                  label={<span className="font-semibold text-stay-text text-sm">Diện tích phòng (*)</span>}
                  name="area"
                  rules={[{ required: true, message: 'Nhập diện tích (*)' }]}
                  initialValue={25}
                >
                  <Input
                    type="number"
                    min={5}
                    suffix={<span className="text-xs text-stay-text-muted font-medium">m²</span>}
                    className="w-full h-11"
                  />
                </Form.Item>
                <Form.Item
                  label={<span className="font-semibold text-stay-text text-sm">Sức chứa tối đa (*)</span>}
                  name="capacity"
                  rules={[{ required: true, message: 'Nhập sức chứa (*)' }]}
                  initialValue={2}
                >
                  <Input
                    type="number"
                    min={1}
                    suffix={<span className="text-xs text-stay-text-muted font-medium">Người</span>}
                    className="w-full h-11"
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  label={<span className="font-semibold text-stay-text text-sm">Giá thuê phòng niêm yết (*)</span>}
                  name="price"
                  rules={[{ required: true, message: 'Nhập giá thuê (*)' }]}
                  initialValue={3500000}
                >
                  <Input
                    type="number"
                    step={100000}
                    suffix={<span className="text-xs font-semibold text-emerald-600">VNĐ/tháng</span>}
                    className="w-full h-11 font-medium"
                  />
                </Form.Item>
                <Form.Item
                  label={<span className="font-semibold text-stay-text text-sm">Tiền cọc tiêu chuẩn (*)</span>}
                  name="deposit"
                  rules={[{ required: true, message: 'Nhập tiền cọc (*)' }]}
                  initialValue={3500000}
                >
                  <Input
                    type="number"
                    step={100000}
                    suffix={<span className="text-xs font-semibold text-stay-text">VNĐ</span>}
                    className="w-full h-11 font-medium"
                  />
                </Form.Item>
              </div>

              {editingRoom && (
                <Form.Item label={<span className="font-semibold text-stay-text text-sm">Trạng thái phòng</span>} name="status">
                  <Select
                    className="w-full h-11"
                    options={[
                      { label: 'Còn trống (AVAILABLE)', value: 'AVAILABLE' },
                      { label: 'Đang thuê (RENTED)', value: 'RENTED' },
                      { label: 'Đang sửa chữa (MAINTENANCE)', value: 'MAINTENANCE' },
                      { label: 'Ngừng sử dụng (DISABLED)', value: 'DISABLED' },
                    ]}
                  />
                </Form.Item>
              )}
            </div>
          </div>

          {/* SECTION 3: TIỆN NGHI & DỊCH VỤ */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-stay-text">
              3. Tiện nghi & dịch vụ áp dụng
            </h3>
            <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-4">
              <Form.Item
                label={<span className="font-semibold text-stay-text text-sm">Tiện nghi có sẵn trong phòng</span>}
                name="amenities"
              >
                <Select
                  mode="tags"
                  className="w-full min-h-[42px]"
                  placeholder="Chọn hoặc nhập tiện nghi (Điều hòa, Nóng lạnh, Giường, Tủ...)"
                  options={[
                    { value: 'Điều hòa', label: 'Điều hòa' },
                    { value: 'Nóng lạnh', label: 'Nóng lạnh' },
                    { value: 'Giường', label: 'Giường' },
                    { value: 'Tủ quần áo', label: 'Tủ quần áo' },
                    { value: 'Tủ lạnh', label: 'Tủ lạnh' },
                    { value: 'Kệ bếp', label: 'Kệ bếp' },
                    { value: 'Ban công', label: 'Ban công' },
                  ]}
                />
              </Form.Item>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-stay-text text-sm">
                    Dịch vụ tiện ích áp dụng cho phòng
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      type="link"
                      className="p-0 text-xs text-stay-primary font-medium"
                      onClick={() => form.setFieldsValue({ serviceIds: services.map((s) => s.id) })}
                    >
                      Chọn tất cả
                    </Button>
                    <span className="text-stay-border">|</span>
                    <Button
                      size="small"
                      type="link"
                      className="p-0 text-xs text-rose-500 font-medium"
                      onClick={() => form.setFieldsValue({ serviceIds: [] })}
                    >
                      Bỏ chọn hết
                    </Button>
                  </div>
                </div>

                <Form.Item
                  name="serviceIds"
                  className="mb-2"
                  extra="Khi lập hợp đồng mới cho phòng này, hệ thống sẽ tự động gán đúng các dịch vụ tiện ích này."
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn các dịch vụ phòng hỗ trợ..."
                    className="w-full min-h-[44px]"
                    options={services.map((s: any) => {
                      const info = getBillingMethodInfo(s.billingMethod, s.chargingType, s.serviceName || s.name, s.category);
                      const priceFormatted = formatServicePriceWithUnit(s);
                      return {
                        label: `${s.serviceName || s.name} - ${priceFormatted} [Cách tính: ${info.shortLabel}]`,
                        value: s.id,
                      };
                    })}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold text-stay-text text-sm">Mô tả đặc điểm phòng & ghi chú</span>}
                  name="description"
                  className="mb-0"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Mô tả đặc điểm phòng, hướng cửa sổ, ánh sáng, ban công, không gian xung quanh..."
                    className="w-full p-3 rounded-xl"
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Location Picker Modal cho Phòng Trọ */}
      <LocationPickerModal
        open={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={handleLocationConfirmed}
        initialLat={currentCoords?.lat || (editingRoom?.latitude ? Number(editingRoom.latitude) : 21.0285)}
        initialLng={currentCoords?.lng || (editingRoom?.longitude ? Number(editingRoom.longitude) : 105.8048)}
        title={editingRoom ? `Chọn Vị Trí Bản Đồ Cho Phòng ${editingRoom.code || editingRoom.name}` : 'Chọn Vị Trí Bản Đồ Cho Phòng Trọ Mới'}
      />
    </>
  );
};
