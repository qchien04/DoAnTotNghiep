import React, { useEffect, useRef } from 'react';
import { Modal, Button } from '@/shared/components';
import { Building } from '@/shared/types/landlord';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VIETNAM_BOUNDS } from '@/shared/components/ui/LeafletMap';

interface BuildingDetailModalProps {
  open: boolean;
  building: Building | null;
  onCancel: () => void;
  onEdit?: (bld: Building) => void;
}

export const BuildingDetailModal: React.FC<BuildingDetailModalProps> = ({
  open,
  building,
  onCancel,
  onEdit,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!open || !building) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    const lat = Number(building.latitude) || 21.0285;
    const lng = Number(building.longitude) || 105.8048;
    const hasCoordinates = Boolean(building.latitude && building.longitude);

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
        attribution: '&copy; OpenStreetMap contributors &bull; Chủ quyền Việt Nam',
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'stay-building-detail-pin',
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; padding: 2px;">
          <strong>${building.name}</strong><br/>
          <span style="color: #666; font-size: 12px;">${building.addressDetail || 'Chưa cập nhật địa chỉ'}</span>
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
  }, [open, building]);

  if (!building) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      destroyOnClose
      title={`Chi tiết tòa nhà: ${building.name}`}
      width={880}
      centered
      footer={[
        <Button key="close" onClick={onCancel} className="h-9 px-4 rounded-lg">
          Đóng
        </Button>,
        onEdit && (
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              onCancel();
              onEdit(building);
            }}
            className="h-9 px-4 rounded-lg bg-[#E60023] hover:bg-[#CC001F] text-white font-medium"
          >
            Chỉnh sửa
          </Button>
        ),
      ]}
    >
      <div className="mt-4 space-y-4 text-[14px]">
        {/* 1. THÔNG TIN TÊN & SỐ TẦNG */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="font-semibold text-stay-text text-sm block mb-1">
              Tên tòa nhà / Khu trọ
            </label>
            <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-bg-app text-stay-text">
              {building.name}
            </div>
          </div>

          <div>
            <label className="font-semibold text-stay-text text-sm block mb-1">
              Số tầng
            </label>
            <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-bg-app text-stay-text">
              {building.numFloors ?? 1} tầng
            </div>
          </div>
        </div>

        {/* 2. BẢN ĐỒ VỊ TRÍ & ĐỊA CHỈ (2 CỘT TỶ LỆ 6:4) */}
        <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-stay-text">
              Vị trí trên bản đồ & địa chỉ tòa nhà
            </span>
            {building.latitude && building.longitude && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${building.latitude},${building.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-stay-primary hover:underline font-medium"
              >
                Mở trong Google Maps
              </a>
            )}
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
              </div>
            </div>

            {/* CỘT 2 (TỶ LỆ ~40%): CÁC Ô HIỂN THỊ ĐỊA CHỈ */}
            <div className="lg:col-span-5 space-y-2.5">
              <div>
                <label className="font-semibold text-stay-text text-xs block mb-1">
                  Tỉnh / Thành phố
                </label>
                <div className="w-full h-9 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-xs text-stay-text">
                  {building.province || '—'}
                </div>
              </div>

              <div>
                <label className="font-semibold text-stay-text text-xs block mb-1">
                  Phường / Xã
                </label>
                <div className="w-full h-9 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-xs text-stay-text">
                  {building.ward || '—'}
                </div>
              </div>

              <div>
                <label className="font-semibold text-stay-text text-xs block mb-1">
                  Địa chỉ chi tiết
                </label>
                <div className="w-full p-2.5 min-h-[72px] rounded-lg border border-stay-border bg-stay-card-bg text-xs text-stay-text whitespace-pre-line">
                  {building.addressDetail || '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. THỐNG KÊ PHÒNG TRỌ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-semibold text-stay-text text-sm block mb-1">
              Tổng số phòng
            </label>
            <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-bg-app text-stay-text font-medium">
              {building.totalRooms ?? 0} phòng
            </div>
          </div>

          <div>
            <label className="font-semibold text-stay-text text-sm block mb-1">
              Đang cho thuê
            </label>
            <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-bg-app text-stay-text font-medium">
              {building.occupiedRooms ?? 0} phòng
            </div>
          </div>

          <div>
            <label className="font-semibold text-stay-text text-sm block mb-1">
              Phòng còn trống
            </label>
            <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-bg-app text-stay-text font-medium">
              {building.availableRooms ?? 0} phòng
            </div>
          </div>
        </div>

        {/* 4. QUY ĐỊNH CHUNG */}
        <div>
          <label className="font-semibold text-stay-text text-sm block mb-1">
            Quy định chung của tòa nhà
          </label>
          <div className="p-3 min-h-[64px] rounded-lg border border-stay-border bg-stay-bg-app text-xs text-stay-text whitespace-pre-line leading-relaxed">
            {building.generalRules || 'Chưa thiết lập quy định chung.'}
          </div>
        </div>
      </div>
    </Modal>
  );
};
