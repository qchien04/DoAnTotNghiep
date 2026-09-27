import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Tag,
  Switch,
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
        setSelectedBuildingId(editingRoom.buildingId || null);
        const matchedBld = buildings.find((b: any) => String(b.id) === String(editingRoom.buildingId));
        const effectiveLat = editingRoom.latitude ?? matchedBld?.latitude;
        const effectiveLng = editingRoom.longitude ?? matchedBld?.longitude;

        if (effectiveLat && effectiveLng) {
          setCurrentCoords({ lat: Number(effectiveLat), lng: Number(effectiveLng) });
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
          buildingId: editingRoom.buildingId || null,
          province: editingRoom.province || matchedBld?.province || 'Thành phố Hà Nội',
          ward: editingRoom.ward || matchedBld?.ward || '',
          addressDetail: editingRoom.addressDetail || matchedBld?.addressDetail || '',
          name: editingRoom.name,
          floor: editingRoom.floor ?? 1,
          area: editingRoom.area,
          listedPrice: editingRoom.listedPrice,
          standardDeposit: editingRoom.standardDeposit,
          maxCapacity: editingRoom.maxCapacity,
          amenities: parsedAmenities,
          serviceIds: roomServiceIds,
          description: editingRoom.description,
          status: editingRoom.status,
          isPublic: editingRoom.isPublic !== undefined ? Boolean(editingRoom.isPublic) : true,
          latitude: effectiveLat,
          longitude: effectiveLng,
        });
      } else {
        form.resetFields();
        const initialBld = buildings.length > 0 ? buildings[0] : null;
        setSelectedBuildingId(initialBld ? initialBld.id : null);
        if (initialBld?.latitude && initialBld?.longitude) {
          setCurrentCoords({ lat: Number(initialBld.latitude), lng: Number(initialBld.longitude) });
        } else {
          setCurrentCoords(null);
        }
        form.setFieldsValue({
          buildingId: initialBld ? initialBld.id : null,
          province: initialBld?.province || 'Thành phố Hà Nội',
          ward: initialBld?.ward || '',
          addressDetail: initialBld?.addressDetail || '',
          latitude: initialBld?.latitude,
          longitude: initialBld?.longitude,
          floor: 1,
          area: 25,
          maxCapacity: 2,
          listedPrice: 3500000,
          standardDeposit: 3500000,
          isPublic: true,
          serviceIds: services.map((s: any) => s.id),
        });
      }
    }
  }, [open, editingRoom, buildings, services, form]);

  const handleBuildingChange = (val: number | string | null) => {
    setSelectedBuildingId(val);
    if (val) {
      const bld = buildings.find((b: any) => String(b.id) === String(val));
      if (bld) {
        form.setFieldsValue({
          province: bld.province || 'Thành phố Hà Nội',
          ward: bld.ward || '',
          addressDetail: bld.addressDetail || '',
          latitude: bld.latitude,
          longitude: bld.longitude,
        });
        if (bld.latitude && bld.longitude) {
          setCurrentCoords({ lat: Number(bld.latitude), lng: Number(bld.longitude) });
          message.info(`Đã tự động nạp địa chỉ & vị trí bản đồ từ tòa nhà: ${bld.name}`);
        } else {
          message.info(`Đã tự động nạp địa chỉ từ tòa nhà: ${bld.name}`);
        }
      }
    } else {
      message.info('Đã chọn phòng trọ / nhà trọ độc lập. Bạn có thể tự nhập địa chỉ và vị trí bản đồ bên dưới.');
    }
  };

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
        title={editingRoom ? `Cập nhật phòng: ${editingRoom.name}` : 'Thêm phòng trọ mới'}
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
              label={
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-stay-text text-sm">
                    Thuộc tòa nhà / Khu trọ (Không bắt buộc)
                  </span>
                  <span className="text-[11px] text-stay-text-secondary font-normal">
                    (Phòng có thể là nhà trọ độc lập)
                  </span>
                </div>
              }
              name="buildingId"
              className="mb-2"
            >
              <Select
                allowClear
                placeholder="Chọn tòa nhà hoặc để trống nếu là phòng trọ / nhà riêng độc lập"
                onChange={handleBuildingChange}
                className="w-full h-11"
                options={[
                  {
                    label: '🏠 Phòng trọ / Nhà trọ độc lập (không thuộc tòa nhà nào)',
                    value: null as any,
                  },
                  ...buildings.map((b: any) => ({
                    label: `🏢 ${b.name}`,
                    value: b.id,
                  })),
                ]}
              />
            </Form.Item>

            {curBld && (
              <div className="p-3 rounded-lg bg-stay-card-bg border border-stay-border text-xs flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stay-text text-xs flex items-center gap-1.5">
                    <span>🏢 {curBld.name}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
                      ✓ Đã tự động điền địa chỉ & vị trí
                    </span>
                  </p>
                  <p className="text-[11px] text-stay-text-secondary mt-0.5">
                    {curBld.addressDetail || 'Chưa có địa chỉ chi tiết'}
                    {curBld.latitude && curBld.longitude && (
                      <span className="ml-2 font-mono text-[10px] text-stay-primary font-semibold">
                        📍 ({Number(curBld.latitude).toFixed(4)}, {Number(curBld.longitude).toFixed(4)})
                      </span>
                    )}
                  </p>
                </div>
                <Tag className="m-0 bg-stay-bg-app text-stay-text border-stay-border font-medium text-xs px-2.5 py-0.5">
                  {curBld.numFloors || 1} tầng
                </Tag>
              </div>
            )}

            {/* ĐỊA CHỈ PHÒNG / NHÀ TRỌ (2 CẤP: TỈNH/TP VÀ PHƯỜNG/XÃ) */}
            <div className="p-3.5 rounded-lg bg-stay-card-bg border border-stay-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stay-text">
                  Địa chỉ phòng / nhà trọ (2 cấp hành chính: Tỉnh/TP và Phường/Xã)
                </span>
                <span className="text-[10px] text-stay-text-secondary">
                  Không còn cấp quận/huyện
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Form.Item
                  label={<span className="font-semibold text-stay-text text-xs">Tỉnh / Thành phố (*)</span>}
                  name="province"
                  rules={[{ required: true, message: 'Vui lòng nhập Tỉnh / Thành phố (*)' }]}
                  className="mb-0"
                >
                  <Input placeholder="Ví dụ: Thành phố Hà Nội" className="h-10 text-xs" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold text-stay-text text-xs">Phường / Xã (*)</span>}
                  name="ward"
                  rules={[{ required: true, message: 'Vui lòng nhập Phường / Xã (*)' }]}
                  className="mb-0"
                >
                  <Input placeholder="Ví dụ: Phường Bách Khoa" className="h-10 text-xs" />
                </Form.Item>
              </div>

              <Form.Item
                label={<span className="font-semibold text-stay-text text-xs">Địa chỉ chi tiết (Số nhà, tên ngõ/ngách/đường) (*)</span>}
                name="addressDetail"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết (*)' }]}
                className="mb-0"
              >
                <Input placeholder="Ví dụ: Số 12 ngõ 40 Tạ Quang Bửu" className="h-10 text-xs" />
              </Form.Item>
            </div>

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
              <Form.Item
                label={<span className="font-semibold text-stay-text text-sm">Tên phòng (*)</span>}
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên phòng (*)' }]}
              >
                <Input placeholder="Ví dụ: Phòng 101, Phòng Studio ban công, P.202..." className="w-full h-11" />
              </Form.Item>

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
                  name="maxCapacity"
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
                  name="listedPrice"
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
                  name="standardDeposit"
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

              {/* CÀI ĐẶT CÔNG KHAI PHÒNG LÊN TRANG CHỦ */}
              <div className="pt-2">
                <Form.Item
                  name="isPublic"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <div className="flex items-center justify-between p-3.5 bg-stay-card-bg border border-stay-border rounded-xl">
                    <div className="pr-4">
                      <div className="font-semibold text-stay-text text-sm flex items-center gap-2">
                        <span>Công khai phòng lên trang chủ</span>
                        <Tag color="blue" className="rounded-full px-2 text-[10px]">Trang chủ tìm kiếm</Tag>
                      </div>
                      <p className="text-xs text-stay-text-secondary mt-0.5">
                        Khi bật, phòng trọ sẽ được hiển thị công khai trên trang chủ để khách thuê có thể tìm kiếm, xem chi tiết và liên hệ thuê.
                      </p>
                    </div>
                    <Switch
                      checked={form.getFieldValue('isPublic') !== false}
                      onChange={(checked) => form.setFieldsValue({ isPublic: checked })}
                    />
                  </div>
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
        title={editingRoom ? `Chọn Vị Trí Bản Đồ Cho Phòng: ${editingRoom.name}` : 'Chọn Vị Trí Bản Đồ Cho Phòng Trọ Mới'}
      />
    </>
  );
};
