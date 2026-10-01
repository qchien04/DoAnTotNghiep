import React, { useEffect, useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Switch,
  message,
} from '@/shared/components';
import { Tooltip, Spin } from 'antd';
import { HelpCircle, MapPin, Navigation } from 'lucide-react';
import { Building, CreateRoomDto, Room, UtilityService } from '@/shared/types/landlord';
import {
  formatServicePriceWithUnit,
  getBillingMethodInfo,
} from '@/shared/utils/serviceUtils';
import { VIETNAM_BOUNDS } from '@/shared/components/ui/LeafletMap';

// Fix default leaflet marker icon issue in Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pinIcon = L.divIcon({
  className: 'custom-location-pin',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #EF4444;
      color: white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

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

  // Location & Map State
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 21.0285,
    lng: 105.8048,
  });
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Reverse geocode to extract address components from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'vi,en',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const foundProvince = addr.city || addr.state || addr.province || 'Thành phố Hà Nội';
          const foundWard = addr.quarter || addr.suburb || addr.neighbourhood || addr.city_district || '';
          const fullDisplayName = data.display_name || '';

          form.setFieldsValue({
            province: foundProvince,
            ward: foundWard,
            addressDetail: fullDisplayName,
          });
        }
      }
    } catch {
      // ignore network errors
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [form]);

  // Form initialization
  useEffect(() => {
    if (open) {
      if (editingRoom) {
        const matchedBld = buildings.find((b: any) => String(b.id) === String(editingRoom.buildingId));
        const effectiveLat = editingRoom.latitude ? Number(editingRoom.latitude) : (matchedBld?.latitude ? Number(matchedBld.latitude) : 21.0285);
        const effectiveLng = editingRoom.longitude ? Number(editingRoom.longitude) : (matchedBld?.longitude ? Number(matchedBld.longitude) : 105.8048);
        const effectiveCoords = { lat: effectiveLat, lng: effectiveLng };

        setCurrentCoords(effectiveCoords);

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
          addressDetail: editingRoom.addressDetail || matchedBld?.addressDetail || 'Hà Nội, Việt Nam',
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

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([effectiveLat, effectiveLng], 15);
          markerRef.current.setLatLng([effectiveLat, effectiveLng]);
        }
      } else {
        form.resetFields();
        const initialBld = buildings.length > 0 ? buildings[0] : null;
        const initialLat = initialBld?.latitude ? Number(initialBld.latitude) : 21.0285;
        const initialLng = initialBld?.longitude ? Number(initialBld.longitude) : 105.8048;
        const initialCoords = { lat: initialLat, lng: initialLng };

        setCurrentCoords(initialCoords);

        form.setFieldsValue({
          buildingId: initialBld ? initialBld.id : null,
          province: initialBld?.province || 'Thành phố Hà Nội',
          ward: initialBld?.ward || '',
          addressDetail: initialBld?.addressDetail || 'Hà Nội, Việt Nam',
          latitude: initialLat,
          longitude: initialLng,
          floor: 1,
          area: 25,
          maxCapacity: 2,
          listedPrice: 3500000,
          standardDeposit: 3500000,
          isPublic: true,
          serviceIds: services.map((s: any) => s.id),
        });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([initialLat, initialLng], 15);
          markerRef.current.setLatLng([initialLat, initialLng]);
        }
      }
    }
  }, [open, editingRoom, buildings, services, form]);

  // Leaflet Map Initialization directly in modal
  useEffect(() => {
    if (!open) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const initialPos: [number, number] = [
        currentCoords.lat || 21.0285,
        currentCoords.lng || 105.8048,
      ];

      const map = L.map(mapContainerRef.current, {
        center: initialPos,
        zoom: 15,
        minZoom: 5,
        maxZoom: 19,
        maxBounds: VIETNAM_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors &bull; Chủ quyền Việt Nam',
      }).addTo(map);

      const marker = L.marker(initialPos, {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const latLng = marker.getLatLng();
        const newCoords = { lat: Number(latLng.lat.toFixed(7)), lng: Number(latLng.lng.toFixed(7)) };
        setCurrentCoords(newCoords);
        form.setFieldsValue({ latitude: newCoords.lat, longitude: newCoords.lng });
        reverseGeocode(newCoords.lat, newCoords.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        const newCoords = { lat: Number(e.latlng.lat.toFixed(7)), lng: Number(e.latlng.lng.toFixed(7)) };
        setCurrentCoords(newCoords);
        marker.setLatLng(e.latlng);
        form.setFieldsValue({ latitude: newCoords.lat, longitude: newCoords.lng });
        reverseGeocode(newCoords.lat, newCoords.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      map.invalidateSize();
    }, 250);

    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [open, reverseGeocode]);

  const handleBuildingChange = (val: number | string | null) => {
    if (val) {
      const bld = buildings.find((b: any) => String(b.id) === String(val));
      if (bld) {
        const lat = bld.latitude ? Number(bld.latitude) : currentCoords.lat;
        const lng = bld.longitude ? Number(bld.longitude) : currentCoords.lng;
        const addr = bld.addressDetail || `${bld.ward ? bld.ward + ', ' : ''}${bld.province || ''}`;

        setCurrentCoords({ lat, lng });

        form.setFieldsValue({
          province: bld.province || 'Thành phố Hà Nội',
          ward: bld.ward || '',
          addressDetail: bld.addressDetail || addr || 'Hà Nội, Việt Nam',
          latitude: lat,
          longitude: lng,
        });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.0 });
          markerRef.current.setLatLng([lat, lng]);
        }
        message.info(`Đã nạp vị trí từ tòa nhà: ${bld.name}`);
      }
    } else {
      message.info('Đã chọn phòng độc lập. Hãy nhấp trực tiếp trên bản đồ để chọn vị trí phòng.');
    }
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

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.0 });
          markerRef.current.setLatLng([lat, lng]);
        }

        reverseGeocode(lat, lng);
        message.success('Đã xác định vị trí hiện tại thành công!');
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

  return (
    <Modal
      title={editingRoom ? `Cập nhật phòng: ${editingRoom.name}` : 'Thêm phòng trọ mới'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={editingRoom ? 'Lưu thay đổi' : 'Xác nhận tạo phòng'}
      cancelText="Hủy"
      width={940}
      centered
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        {/* SECTION 1: TÒA NHÀ & VỊ TRÍ - ĐỊA CHỈ (2 CỘT TỶ LỆ 6:4) */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            1. Tòa nhà & vị trí phòng trọ
          </h3>

          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-3">
            <Form.Item
              label={
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-stay-text text-sm">
                    Thuộc tòa nhà / Khu trọ
                  </span>
                  <Tooltip title="Chọn tòa nhà quản lý hoặc để trống nếu là phòng trọ / nhà riêng độc lập">
                    <HelpCircle className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary cursor-pointer inline" />
                  </Tooltip>
                </div>
              }
              name="buildingId"
              className="mb-2"
            >
              <Select
                allowClear
                placeholder="Chọn tòa nhà hoặc để trống nếu là phòng trọ độc lập"
                onChange={handleBuildingChange}
                className="w-full h-10"
                options={[
                  {
                    label: '🏠 Phòng trọ độc lập (không thuộc tòa nhà nào)',
                    value: null as any,
                  },
                  ...buildings.map((b: any) => ({
                    label: `🏢 ${b.name}`,
                    value: b.id,
                  })),
                ]}
              />
            </Form.Item>

            {/* 2 CỘT TỶ LỆ KHOẢNG 6:4: 1 BÊN BẢN ĐỒ - 1 BÊN INPUT ĐỊA CHỈ */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stay-text text-xs">
                  Vị trí trên bản đồ & địa chỉ phòng
                </span>
                <Button
                  size="small"
                  icon={<Navigation className="w-3.5 h-3.5 text-emerald-600" />}
                  onClick={handleGetQuickLocation}
                  loading={isGeolocating}
                  className="font-semibold text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  Vị trí hiện tại
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* CỘT 1 (TỶ LỆ ~60%): BẢN ĐỒ LEAFLET */}
                <div className="lg:col-span-7">
                  <div className="relative rounded-xl overflow-hidden border border-stay-border shadow-inner">
                    <div
                      ref={mapContainerRef}
                      style={{ width: '100%', height: '260px' }}
                      className="z-0"
                    />

                    {isGeolocating && (
                      <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50">
                        <Spin tip="Đang lấy tọa độ GPS..." />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-stay-text-muted mt-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stay-primary shrink-0" />
                    <span>Nhấp chuột hoặc kéo thả ghim trên bản đồ để tự động điền địa chỉ</span>
                  </p>
                </div>

                {/* CỘT 2 (TỶ LỆ ~40%): CÁC Ô INPUT ĐỊA CHỈ */}
                <div className="lg:col-span-5 space-y-2.5">
                  <Form.Item
                    label={<span className="font-semibold text-stay-text text-xs">Tỉnh / Thành phố</span>}
                    name="province"
                    rules={[{ required: true, message: 'Vui lòng nhập Tỉnh / TP' }]}
                    className="mb-2"
                  >
                    <Input placeholder="Ví dụ: Thành phố Hà Nội" className="w-full h-9 text-xs" />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-semibold text-stay-text text-xs">Phường / Xã</span>}
                    name="ward"
                    className="mb-2"
                  >
                    <Input placeholder="Ví dụ: Phường Bách Khoa" className="w-full h-9 text-xs" />
                  </Form.Item>

                  <Form.Item
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-stay-text text-xs">Địa chỉ chi tiết</span>
                        {isReverseGeocoding && (
                          <span className="text-[11px] text-stay-primary flex items-center gap-1 font-normal">
                            <Spin size="small" /> Đang nhận diện...
                          </span>
                        )}
                      </div>
                    }
                    name="addressDetail"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
                    className="mb-0"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Số nhà, ngõ/ngách, tên đường..."
                      className="w-full p-2 text-xs rounded-lg"
                    />
                  </Form.Item>

                  {/* Ẩn hoàn toàn tọa độ khỏi UI nhưng vẫn nạp vào Form payload */}
                  <Form.Item name="latitude" noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Form.Item name="longitude" noStyle>
                    <input type="hidden" />
                  </Form.Item>
                </div>
              </div>
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
              label={<span className="font-semibold text-stay-text text-sm">Tên phòng </span>}
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên phòng ' }]}
            >
              <Input placeholder="Ví dụ: Phòng 101, Phòng Studio ban công, P.202..." className="w-full h-10" />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Form.Item
                label={<span className="font-semibold text-stay-text text-sm">Tầng bố trí </span>}
                name="floor"
                rules={[{ required: true, message: 'Nhập tầng ' }]}
                initialValue={1}
              >
                <Input
                  type="number"
                  min={1}
                  suffix={<span className="text-xs text-stay-text-muted font-medium">Tầng</span>}
                  className="w-full h-10"
                />
              </Form.Item>
              <Form.Item
                label={<span className="font-semibold text-stay-text text-sm">Diện tích phòng </span>}
                name="area"
                rules={[{ required: true, message: 'Nhập diện tích ' }]}
                initialValue={25}
              >
                <Input
                  type="number"
                  min={5}
                  suffix={<span className="text-xs text-stay-text-muted font-medium">m²</span>}
                  className="w-full h-10"
                />
              </Form.Item>
              <Form.Item
                label={<span className="font-semibold text-stay-text text-sm">Sức chứa tối đa </span>}
                name="maxCapacity"
                rules={[{ required: true, message: 'Nhập sức chứa ' }]}
                initialValue={2}
              >
                <Input
                  type="number"
                  min={1}
                  suffix={<span className="text-xs text-stay-text-muted font-medium">Người</span>}
                  className="w-full h-10"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item
                label={<span className="font-semibold text-stay-text text-sm">Giá thuê phòng niêm yết </span>}
                name="listedPrice"
                rules={[{ required: true, message: 'Nhập giá thuê ' }]}
                initialValue={3500000}
              >
                <Input
                  type="number"
                  step={100000}
                  suffix={<span className="text-xs font-semibold text-emerald-600">VNĐ/tháng</span>}
                  className="w-full h-10 font-medium"
                />
              </Form.Item>
              <Form.Item
                label={<span className="font-semibold text-stay-text text-sm">Tiền cọc tiêu chuẩn </span>}
                name="standardDeposit"
                rules={[{ required: true, message: 'Nhập tiền cọc ' }]}
                initialValue={3500000}
              >
                <Input
                  type="number"
                  step={100000}
                  suffix={<span className="text-xs font-semibold text-stay-text">VNĐ</span>}
                  className="w-full h-10 font-medium"
                />
              </Form.Item>
            </div>

            {editingRoom && (
              <Form.Item label={<span className="font-semibold text-stay-text text-sm">Trạng thái phòng</span>} name="status">
                <Select
                  className="w-full h-10"
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
                className="w-full min-h-[40px]"
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
                <div className="flex items-center gap-1.5">
                  <label className="font-semibold text-stay-text text-sm">
                    Dịch vụ tiện ích áp dụng
                  </label>
                  <Tooltip title="Khi lập hợp đồng mới cho phòng này, hệ thống sẽ tự động gán các dịch vụ này">
                    <HelpCircle className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary cursor-pointer inline" />
                  </Tooltip>
                </div>
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
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn các dịch vụ phòng hỗ trợ..."
                  className="w-full min-h-[40px]"
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
                  rows={2}
                  placeholder="Mô tả đặc điểm phòng, hướng cửa sổ, ánh sáng, ban công, không gian xung quanh..."
                  className="w-full p-2.5 rounded-xl text-xs"
                />
              </Form.Item>
            </div>

            {/* CÀI ĐẶT CÔNG KHAI PHÒNG LÊN TRANG CHỦ */}
            <div className="pt-1">
              <Form.Item
                name="isPublic"
                valuePropName="checked"
                className="mb-0"
              >
                <div className="flex items-center justify-between p-3 bg-stay-card-bg border border-stay-border rounded-xl">
                  <div className="pr-4">
                    <div className="font-semibold text-stay-text text-sm flex items-center gap-1.5">
                      <span>Công khai phòng lên trang chủ</span>
                      <Tooltip title="Cho phép người thuê tìm kiếm và liên hệ xem phòng trên trang chủ">
                        <HelpCircle className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary cursor-pointer inline" />
                      </Tooltip>
                    </div>
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
  );
};
