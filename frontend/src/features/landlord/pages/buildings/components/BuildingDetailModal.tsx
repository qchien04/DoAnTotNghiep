import React, { useEffect, useRef } from 'react';
import { Modal, Button } from '@/shared/components';
import { Building } from '@/shared/types/landlord';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VIETNAM_BOUNDS } from '@/shared/components/ui/LeafletMap';
import { getProvinceName, getWardName } from '@/shared/constants/vietnamLocations';

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
        <div style="font-family: inherit; font-size: 13px; padding: 2px;">
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
                onEdit(building);
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
        {/* 1. THÔNG TIN TÊN & SỐ TẦNG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Tên tòa nhà / Khu:
            </span>
            <span className="text-stay-text text-[14px] font-semibold">
              {building.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Số tầng:
            </span>
            <span className="text-stay-text text-[14px] font-medium">
              {building.numFloors ?? 1} tầng
            </span>
          </div>
        </div>

        {/* 2. BẢN ĐỒ VỊ TRÍ & ĐỊA CHỈ */}
        <div className="space-y-3 pt-3.5 border-t border-stay-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-stay-text-secondary block">
              Vị trí trên bản đồ & địa chỉ tòa nhà
            </span>
            {building.latitude && building.longitude && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${building.latitude},${building.longitude}`}
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
                  Tỉnh / Thành phố
                </span>
                <span className="text-stay-text text-[14px] font-medium">
                  {building.province || (building.provinceId ? getProvinceName(building.provinceId) : '—')}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-stay-text-secondary text-[13px]">
                  Phường / Xã
                </span>
                <span className="text-stay-text text-[14px] font-medium">
                  {building.ward || (building.wardId ? getWardName(building.wardId) : '—')}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-stay-text-secondary text-[13px]">
                  Địa chỉ chi tiết
                </span>
                <span className="text-stay-text text-[14px] font-medium leading-relaxed">
                  {building.addressDetail || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. THỐNG KÊ PHÒNG TRỌ */}
        <div className="pt-3.5 border-t border-stay-border-subtle">
          <span className="text-[13px] font-semibold text-stay-text-secondary block mb-2">
            Thống kê phòng trọ
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[14px] w-32 shrink-0">
                Tổng số phòng:
              </span>
              <span className="text-stay-text text-[14px] font-semibold">
                {building.totalRooms ?? 0} phòng
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[14px] w-32 shrink-0">
                Đang cho thuê:
              </span>
              <span className="text-blue-600 dark:text-blue-400 text-[14px] font-semibold">
                {building.occupiedRooms ?? 0} phòng
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[14px] w-32 shrink-0">
                Phòng còn trống:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 text-[14px] font-semibold">
                {building.availableRooms ?? 0} phòng
              </span>
            </div>
          </div>
        </div>

        {/* 4. QUY ĐỊNH CHUNG */}
        <div className="pt-3.5 border-t border-stay-border-subtle">
          <span className="text-[13px] font-semibold text-stay-text-secondary block mb-1.5">
            Quy định chung của tòa nhà
          </span>
          <div className="text-stay-text whitespace-pre-line leading-relaxed text-[14px]">
            {building.generalRules || 'Chưa thiết lập quy định chung.'}
          </div>
        </div>
      </div>
    </Modal>
  );
};
