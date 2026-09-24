import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Modal, Button, Input, message, Spin, Tag } from 'antd';
import {
  MapPin,
  Navigation,
  Search,
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
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

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '&copy; OpenStreetMap &bull; Chủ quyền Việt Nam',
        }
      ).addTo(map);

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
    }, 150);

    return () => {
      clearTimeout(timer);
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

  // Tìm kiếm địa điểm bằng Nominatim OpenStreetMap
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      message.info('Vui lòng nhập địa chỉ cần tìm kiếm');
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&countrycodes=vn&limit=1`,
        {
          headers: {
            'Accept-Language': 'vi,en',
          },
        }
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const newPos: [number, number] = [lat, lng];

          setPosition(newPos);
          setAddress(item.display_name);

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.flyTo(newPos, 16, { duration: 1.0 });
            markerRef.current.setLatLng(newPos);
          }

          reverseGeocode(lat, lng);
          message.success('Đã tìm thấy địa điểm trên bản đồ!');
        } else {
          message.warning('Không tìm thấy địa điểm tương ứng, hãy thử nhập tên đường hoặc quận huyện.');
        }
      }
    } catch {
      message.error('Lỗi khi tìm kiếm địa chỉ');
    } finally {
      setIsSearching(false);
    }
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
      title={title}
      open={open}
      onCancel={onClose}
      width={780}
      footer={null}
      destroyOnClose
      centered
    >
      <div className="space-y-3 mt-1 max-h-[calc(85vh-100px)] overflow-y-auto pr-1.5 custom-modal-scroll">
        {/* Thanh tìm kiếm & Nút lấy vị trí hiện tại */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input.Search
            placeholder="Tìm theo địa chỉ, tên đường, trường đại học (Ví dụ: Ngõ 80 Cầu Giấy)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearchLocation}
            loading={isSearching}
            enterButton={<Search className="w-4 h-4" />}
            className="flex-1"
          />

          <Button
            icon={<Navigation className="w-4 h-4 text-emerald-600" />}
            onClick={handleGetCurrentLocation}
            loading={isGeolocating}
            className="font-semibold border-emerald-500 text-emerald-600 hover:bg-emerald-50 shrink-0"
          >
            Vị trí hiện tại
          </Button>
        </div>

        {/* Hướng dẫn thao tác */}
        <div className="px-3 py-2 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 shrink-0" />
            Nhấp chuột vào bản đồ hoặc <strong>kéo thả ghim đỏ</strong> để chọn chính xác vị trí nhà trọ / phòng trọ.
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">OpenStreetMap (VN)</span>
        </div>

        {/* Vùng hiển thị bản đồ Leaflet */}
        <div className="relative rounded-2xl overflow-hidden border border-stay-border shadow-inner">
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '340px' }}
            className="z-0"
          />

          {(isSearching || isGeolocating) && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-1000">
              <Spin tip="Đang định vị tọa độ..." />
            </div>
          )}
        </div>

        {/* Thông tin tọa độ & địa chỉ đã chọn */}
        <div className="p-3.5 rounded-xl bg-stay-card-bg border border-stay-border space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
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
                icon={<Copy className="w-3 h-3 text-slate-500" />}
                onClick={copyCoordinates}
                title="Sao chép tọa độ"
              />
            </div>
            {isReverseGeocoding && (
              <span className="text-slate-400 text-[11px] italic flex items-center gap-1">
                <Spin size="small" /> Đang nhận diện địa chỉ...
              </span>
            )}
          </div>

          {address && (
            <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-stay-primary shrink-0 mt-0.5" />
              <p className="line-clamp-2 leading-relaxed">
                <strong>Địa chỉ ước tính:</strong> {address}
              </p>
            </div>
          )}
        </div>

        {/* Nút thao tác xác nhận */}
        <div className="flex justify-end items-center gap-2 pt-2 border-t border-stay-border">
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
    </Modal>
  );
};
