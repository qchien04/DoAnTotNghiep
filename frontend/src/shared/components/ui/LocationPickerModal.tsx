import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Modal, Button, message, Spin, Tag } from 'antd';
import {
  MapPin,
  Navigation,
  Check,
  Copy,
} from 'lucide-react';
import { VIETNAM_BOUNDS } from './LeafletMap';

export interface LocationSelectedData {
  latitude: number;
  longitude: number;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
}

export interface LocationPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: LocationSelectedData) => void;
  initialLat?: number;
  initialLng?: number;
  title?: string;
  initialAddress?: string;
}

// Fix icon mặc định của Leaflet trong Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Red Pin Icon
const pinIcon = L.divIcon({
  className: 'custom-location-pin',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background: #EF4444;
      color: white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
    ">
      <div style="
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  open,
  onClose,
  onConfirm,
  initialLat = 21.0285,
  initialLng = 105.8048,
  title = 'Chọn Vị Trí Địa Lý Trên Bản Đồ',
  initialAddress = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [position, setPosition] = useState<[number, number]>([
    initialLat || 21.0285,
    initialLng || 105.8048,
  ]);
  const [address, setAddress] = useState<string>(initialAddress || '');
  const [province, setProvince] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [ward, setWard] = useState<string>('');
  const [isGeolocating, setIsGeolocating] = useState<boolean>(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);

  // Reverse geocoding để lấy tên đường phố, phường, quận từ tọa độ
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
          const foundProvince = addr.city || addr.state || addr.province || 'Hà Nội';
          const foundDistrict = addr.city_district || addr.district || addr.county || addr.suburb || '';
          const foundWard = addr.quarter || addr.suburb || addr.neighbourhood || '';
          const fullDisplayName = data.display_name || '';

          setAddress(fullDisplayName);
          setProvince(foundProvince);
          setDistrict(foundDistrict);
          setWard(foundWard);
        }
      }
    } catch {
      // Bỏ qua nếu mất kết nối mạng hoặc lỗi CORS
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Khởi tạo bản đồ khi modal mở ra
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

      const defaultPos: [number, number] = [
        initialLat && initialLat !== 0 ? initialLat : 21.0285,
        initialLng && initialLng !== 0 ? initialLng : 105.8048,
      ];
      setPosition(defaultPos);

      const map = L.map(mapContainerRef.current, {
        center: defaultPos,
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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &bull; Chủ quyền Việt Nam',
      }).addTo(map);

      // Marker có thể kéo thả
      const marker = L.marker(defaultPos, {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const latLng = marker.getLatLng();
        const newPos: [number, number] = [latLng.lat, latLng.lng];
        setPosition(newPos);
        reverseGeocode(latLng.lat, latLng.lng);
      });

      // Click vào bản đồ để chuyển marker tới vị trí đó
      map.on('click', (e: L.LeafletMouseEvent) => {
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        marker.setLatLng(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size để render đúng kích thước sau khi modal mở
      map.invalidateSize();

      if (!initialAddress) {
        reverseGeocode(defaultPos[0], defaultPos[1]);
      }
    }, 200);

    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [open, initialLat, initialLng, initialAddress, reverseGeocode]);

  // Lấy vị trí GPS hiện tại của thiết bị
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeolocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const newPos: [number, number] = [lat, lng];

        setPosition(newPos);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo(newPos, 17, { duration: 1.2 });
          markerRef.current.setLatLng(newPos);
        }

        reverseGeocode(lat, lng);
        message.success('Đã xác định vị trí hiện tại thành công!');
      },
      (err) => {
        setIsGeolocating(false);
        let msg = 'Không thể lấy vị trí hiện tại.';
        if (err.code === 1) {
          msg = 'Bạn đã từ chối cấp quyền truy cập vị trí. Vui lòng cho phép quyền vị trí trên trình duyệt.';
        } else if (err.code === 2) {
          msg = 'Không tìm thấy tín hiệu định vị GPS.';
        } else if (err.code === 3) {
          msg = 'Hết thời gian chờ định vị.';
        }
        message.warning(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Xác nhận vị trí đã chọn
  const handleConfirm = () => {
    onConfirm({
      latitude: Number(position[0].toFixed(7)),
      longitude: Number(position[1].toFixed(7)),
      address,
      province,
      district,
      ward,
    });
    message.success('Đã ghim vị trí địa lý thành công!');
    onClose();
  };

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${position[0].toFixed(6)}, ${position[1].toFixed(6)}`);
    message.success('Đã sao chép tọa độ vào bộ nhớ tạm!');
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-stay-text font-bold text-base">
          <MapPin className="w-5 h-5 text-stay-primary" />
          <span>{title}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={840}
      destroyOnClose
      centered
      zIndex={1100}
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs text-stay-text text-left flex items-center gap-1.5 truncate flex-1 min-w-0">
            <MapPin className="w-4 h-4 text-stay-primary shrink-0" />
            {isReverseGeocoding ? (
              <span className="text-stay-text-muted italic flex items-center gap-1">
                <Spin size="small" /> Đang nhận diện địa chỉ...
              </span>
            ) : address ? (
              <span className="truncate font-medium text-stay-text" title={address}>
                {address}
              </span>
            ) : (
              <span className="text-stay-text-muted">Nhấp chuột vào bản đồ để chọn vị trí</span>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end shrink-0">
            <Button onClick={onClose}>Hủy bỏ</Button>
            <Button
              type="primary"
              icon={<Check className="w-4 h-4" />}
              onClick={handleConfirm}
              className="bg-stay-primary hover:bg-stay-primary-hover font-bold px-5"
            >
              Xác nhận vị trí này
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-2 py-1">
        {/* Top Control Bar: Coordinates & Quick GPS */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stay-bg-app border border-stay-border text-xs">
          <div className="flex items-center gap-2">
            <Tag color="blue" className="font-mono text-xs px-2 py-0.5 m-0 font-bold">
              LAT: {position[0].toFixed(6)}
            </Tag>
            <Tag color="cyan" className="font-mono text-xs px-2 py-0.5 m-0 font-bold">
              LNG: {position[1].toFixed(6)}
            </Tag>
            <Button
              size="small"
              type="text"
              icon={<Copy className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary" />}
              onClick={copyCoordinates}
              title="Sao chép tọa độ"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stay-text-muted hidden sm:inline">
              Nhấp hoặc kéo ghim đỏ để chọn vị trí
            </span>
            <Button
              size="small"
              icon={<Navigation className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleGetCurrentLocation}
              loading={isGeolocating}
              className="font-semibold text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50 shrink-0"
            >
              Vị trí hiện tại
            </Button>
          </div>
        </div>

        {/* Leaflet Map Container */}
        <div className="relative rounded-xl overflow-hidden border border-stay-border shadow-inner">
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '390px' }}
            className="z-0"
          />

          {isGeolocating && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50">
              <Spin tip="Đang định vị tọa độ GPS..." />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
