import React, { useEffect, useRef } from 'react';
import { Modal, Button, StatusBadge } from '@/shared/components';
import { Room } from '@/shared/types/landlord';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VIETNAM_BOUNDS } from '@/shared/components/ui/LeafletMap';

interface RoomDetailModalProps {
  open: boolean;
  room: Room | null;
  onCancel: () => void;
  onEdit?: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  open,
  room,
  onCancel,
  onEdit,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!open || !room) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    const lat = Number(room.latitude) || 21.0285;
    const lng = Number(room.longitude) || 105.8048;
    const hasCoordinates = Boolean(room.latitude && room.longitude);

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: hasCoordinates ? 16 : 14,
        minZoom: 5,
        maxZoom: 19,
        maxBounds: VIETNAM_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b'],
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'stay-room-detail-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #E60023;
            color: #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
          ">
            <svg style="transform: rotate(45deg); width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; padding: 2px;">
          <strong>Phòng: ${room.name}</strong><br/>
          ${room.buildingName ? `<span style="color: #4F46E5; font-size: 12px; font-weight: 500;">Tòa nhà: ${room.buildingName}</span><br/>` : ''}
          <span style="color: #666; font-size: 12px;">${room.fullAddress || room.addressDetail || 'Chưa cập nhật địa chỉ'}</span>
        </div>
      `).openPopup();

      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [open, room]);

  if (!room) return null;

  const images = room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls : room.coverImageUrl ? [room.coverImageUrl] : [];
  const rawAmenities = room.amenities as any;
  const amenityList: string[] = Array.isArray(rawAmenities)
    ? rawAmenities
    : typeof rawAmenities === 'string' && rawAmenities
      ? rawAmenities.split(',').map((s: string) => s.trim()).filter(Boolean)
      : (room.amenityDetails?.map((a) => a.name) || []);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={`Chi tiết phòng: ${room.name}`}
      width={880}
      centered
      destroyOnClose
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full pt-1">
          <Button
            key="close"
            variant="outline"
            size="md"
            onClick={onCancel}
            className="h-9 px-4 rounded-lg border border-stay-border text-stay-text hover:bg-stay-bg-app bg-stay-card-bg font-medium text-[14px]"
          >
            Đóng
          </Button>
          {onEdit && (
            <Button
              key="edit"
              variant="primary"
              size="md"
              onClick={() => {
                onCancel();
                onEdit(room);
              }}
              className="h-9 px-4 rounded-lg bg-stay-primary hover:bg-stay-primary-hover text-white font-medium text-[14px] shadow-xs"
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      }
    >
      <div className="mt-4 space-y-4 text-[14px]">
        {/* Hình ảnh phòng */}
        {images.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[13px] font-semibold text-stay-text-secondary block">
              Hình ảnh phòng trọ ({images.length} ảnh)
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Room ${room.name} image ${i + 1}`}
                  className="w-28 h-20 rounded-lg object-cover border border-stay-border shrink-0"
                />
              ))}
            </div>
          </div>
        )}

        {/* 1. THÔNG TIN CƠ BẢN & GIÁ THUÊ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Tên phòng:
            </span>
            <span className="text-stay-text text-[14px] font-semibold">
              {room.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Trạng thái:
            </span>
            <StatusBadge status={room.status} size="lg" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Tầng bố trí:
            </span>
            <span className="text-stay-text text-[14px] font-medium">
              Tầng {room.floor ?? 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Diện tích:
            </span>
            <span className="text-stay-text text-[14px] font-medium">
              {room.area ?? 0} m²
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Sức chứa tối đa:
            </span>
            <span className="text-stay-text text-[14px] font-medium">
              {room.maxCapacity ?? 1} người
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Tiền cọc tiêu chuẩn:
            </span>
            <span className="text-stay-text text-[14px] font-bold">
              {Number(room.standardDeposit || 0).toLocaleString()} đ
            </span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Giá thuê niêm yết:
            </span>
            <span className="text-stay-text text-[15px] font-bold">
              {Number(room.listedPrice || 0).toLocaleString()} đ/tháng
            </span>
          </div>
        </div>

        {/* 2. BẢN ĐỒ VỊ TRÍ & ĐỊA CHỈ PHÒNG TRỌ (GIỐNG BÊN TÒA NHÀ) */}
        <div className="space-y-3 pt-3.5 border-t border-stay-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-stay-text-secondary block">
              Vị trí trên bản đồ & địa chỉ phòng trọ
            </span>
            {room.latitude && room.longitude && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${room.latitude},${room.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stay-primary hover:underline font-medium text-xs"
              >
                Mở trong Google Maps
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* CỘT 1: BẢN ĐỒ LEAFLET */}
            <div className="lg:col-span-7">
              <div className="relative rounded-xl overflow-hidden border border-stay-border shadow-inner">
                <div
                  ref={mapContainerRef}
                  style={{ width: '100%', height: '240px' }}
                  className="z-0"
                />
              </div>
            </div>

            {/* CỘT 2: CÁC DÒNG ĐỊA CHỈ */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-stay-text-secondary text-[13px]">
                  Thuộc tòa nhà / Khu trọ
                </span>
                <span className="text-stay-text text-[14px] font-medium">
                  {room.buildingName ? `Tòa nhà: ${room.buildingName}` : 'Phòng trọ độc lập (không thuộc tòa nhà)'}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-stay-text-secondary text-[13px]">
                  Tỉnh / Thành phố
                </span>
                <span className="text-stay-text text-[14px] font-medium">
                  {room.province || '—'}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-stay-text-secondary text-[13px]">
                  Phường / Xã
                </span>
                <span className="text-stay-text text-[14px] font-medium">
                  {room.ward || '—'}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-stay-text-secondary text-[13px]">
                  Địa chỉ chi tiết
                </span>
                <span className="text-stay-text text-[14px] font-medium leading-relaxed">
                  {room.addressDetail || room.fullAddress || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TIỆN NGHI */}
        {amenityList.length > 0 && (
          <div className="space-y-2 pt-3.5 border-t border-stay-border-subtle">
            <span className="text-[13px] font-semibold text-stay-text-secondary block">
              Tiện nghi phòng trọ
            </span>
            <div className="flex flex-wrap gap-2">
              {amenityList.map((item, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md border border-stay-border bg-stay-bg-app text-stay-text font-medium text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 4. MÔ TẢ CHI TIẾT */}
        {room.description && (
          <div className="space-y-1.5 pt-3.5 border-t border-stay-border-subtle">
            <span className="text-[13px] font-semibold text-stay-text-secondary block">
              Mô tả chi tiết phòng
            </span>
            <div className="text-stay-text whitespace-pre-line leading-relaxed text-[14px]">
              {room.description}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
