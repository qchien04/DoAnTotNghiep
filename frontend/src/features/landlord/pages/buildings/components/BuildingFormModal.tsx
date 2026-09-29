import React, { useEffect, useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Modal,
  Form,
  Input,
  Button,
  message,
} from '@/shared/components';
import { Tooltip, Spin } from 'antd';
import { HelpCircle, MapPin, Navigation } from 'lucide-react';
import { Building, CreateBuildingDto } from '@/shared/types/landlord';
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
      if (editingBuilding) {
        const lat = editingBuilding.latitude ? Number(editingBuilding.latitude) : 21.0285;
        const lng = editingBuilding.longitude ? Number(editingBuilding.longitude) : 105.8048;
        const coords = { lat, lng };

        setCurrentCoords(coords);

        form.setFieldsValue({
          name: editingBuilding.name,
          province: editingBuilding.province || 'Thành phố Hà Nội',
          ward: editingBuilding.ward || '',
          addressDetail: editingBuilding.addressDetail || 'Hà Nội, Việt Nam',
          numFloors: editingBuilding.numFloors || 5,
          generalRules: editingBuilding.generalRules || '',
          latitude: lat,
          longitude: lng,
        });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
        }
      } else {
        form.resetFields();
        const defaultLat = 21.0285;
        const defaultLng = 105.8048;
        const coords = { lat: defaultLat, lng: defaultLng };

        setCurrentCoords(coords);

        form.setFieldsValue({
          province: 'Thành phố Hà Nội',
          ward: '',
          addressDetail: 'Hà Nội, Việt Nam',
          numFloors: 5,
          latitude: defaultLat,
          longitude: defaultLng,
        });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([defaultLat, defaultLng], 15);
          markerRef.current.setLatLng([defaultLat, defaultLng]);
        }
      }
    }
  }, [open, editingBuilding, form]);

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
      width={880}
      centered
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        {/* Hidden fields for latitude & longitude - Completely invisible on UI */}
        <Form.Item name="latitude" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="longitude" hidden>
          <Input />
        </Form.Item>

        {/* THÔNG TIN TÊN & SỐ TẦNG */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item
            label={<span className="font-semibold text-stay-text text-sm">Tên tòa nhà / Khu trọ</span>}
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên tòa nhà' }]}
            className="sm:col-span-2 mb-0"
          >
            <Input placeholder="Ví dụ: Tòa nhà Ánh Dương, KTX Bách Khoa..." className="h-10" />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold text-stay-text text-sm">Số tầng</span>}
            name="numFloors"
            rules={[{ required: true, message: 'Nhập số tầng' }]}
            initialValue={5}
            className="mb-0"
          >
            <Input type="number" min={1} className="h-10" />
          </Form.Item>
        </div>

        {/* BẢN ĐỒ VỊ TRÍ & ĐỊA CHỈ (2 CỘT TỶ LỆ 6:4) */}
        <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-stay-text">
                Vị trí trên bản đồ & địa chỉ tòa nhà
              </span>
              <Tooltip title="Vị trí này được dùng để định vị trên bản đồ tìm trọ và tự động áp dụng cho các phòng thuộc tòa nhà">
                <HelpCircle className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary cursor-pointer inline" />
              </Tooltip>
            </div>
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
                  placeholder="Số 12 Ngõ 80 Cầu Giấy, Dịch Vọng Hậu..."
                  className="w-full p-2 text-xs rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* QUY ĐỊNH CHUNG */}
        <Form.Item
          label={<span className="font-semibold text-stay-text text-sm">Quy định chung của tòa nhà</span>}
          name="generalRules"
          className="mb-0"
        >
          <Input.TextArea
            rows={2}
            placeholder="Quy định giờ giấc, bảo đảm an ninh trật tự, khóa cổng ban đêm, giữ gìn vệ sinh chung..."
            className="p-2.5 text-xs"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
