import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, Tooltip } from 'antd';
import { LocateFixed, Maximize2 } from 'lucide-react';
import { Room } from '@/shared/types/landlord';
import { CircleZone, formatRadius } from '../types/roomSearch';
import { VIETNAM_BOUNDS } from '@/shared/components/ui/LeafletMap';
import { HOANG_SA_CENTER, TRUONG_SA_CENTER } from '@/shared/constants/vietnamIslands';
import { formatFullAddress } from '@/shared/constants/vietnamLocations';

export interface RoomBigMapProps {
  rooms: Room[];
  zones?: CircleZone[];
  onRoomClick?: (room: Room) => void;
  height?: string | number;
}

const DEFAULT_ROOM_IMAGE =
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

export const RoomBigMap: React.FC<RoomBigMapProps> = ({
  rooms,
  zones = [],
  onRoomClick,
  height = 'calc(100vh - 210px)',
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);

  // Khởi tạo bản đồ
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: [21.0285, 105.8048],
      zoom: 13,
      minZoom: 5,
      maxZoom: 19,
      maxBounds: VIETNAM_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    // Layer chủ quyền biển đảo
    const islandsGroup = L.layerGroup().addTo(map);
    const makeSovereigntyIcon = (name: string) =>
      L.divIcon({
        className: 'stay-sovereignty-badge',
        html: `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(220, 38, 38, 0.95);
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 9999px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            border: 1.5px solid #fde047;
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span style="color: #fde047; font-size: 12px;">★</span>
            <span>${name}</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

    L.marker([HOANG_SA_CENTER.lat, HOANG_SA_CENTER.lng], {
      icon: makeSovereigntyIcon(HOANG_SA_CENTER.name),
    }).addTo(islandsGroup);

    L.marker([TRUONG_SA_CENTER.lat, TRUONG_SA_CENTER.lng], {
      icon: makeSovereigntyIcon(TRUONG_SA_CENTER.name),
    }).addTo(islandsGroup);

    const zonesLayer = L.layerGroup().addTo(map);
    zonesLayerRef.current = zonesLayer;

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    // ResizeObserver đảm bảo map luôn khớp kích thước, không bị xám/trắng khi switch tabs
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Vẽ các vòng tròn zones
  useEffect(() => {
    const layer = zonesLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    zones.forEach((z) => {
      const circle = L.circle([z.latitude, z.longitude], {
        radius: z.radiusInMeters,
        color: '#7C3AED',
        weight: 2,
        dashArray: '4, 4',
        fillColor: '#8B5CF6',
        fillOpacity: 0.2,
      });

      circle.bindTooltip(`Vùng lọc: ${formatRadius(z.radiusInMeters)}`, {
        direction: 'center',
        className: 'stay-circle-drawing-tooltip',
      });

      layer.addLayer(circle);
    });
  }, [zones]);

  // Vẽ các Marker phòng trọ dạng Price Pill
  useEffect(() => {
    const layer = markersLayerRef.current;
    const map = mapInstanceRef.current;
    if (!layer || !map) return;

    layer.clearLayers();

    const validRooms = rooms.filter(
      (r) => r.latitude && r.longitude && !isNaN(Number(r.latitude)) && !isNaN(Number(r.longitude))
    );

    const bounds = L.latLngBounds([]);

    validRooms.forEach((room) => {
      const lat = Number(room.latitude);
      const lng = Number(room.longitude);
      bounds.extend([lat, lng]);

      const priceNum = Number(room.listedPrice || 0);
      const priceText =
        priceNum >= 1000000
          ? `${(priceNum / 1000000).toFixed(1).replace(/\.0$/, '')} tr`
          : `${Math.round(priceNum / 1000)}k`;

      const pricePillIcon = L.divIcon({
        className: 'room-price-marker-wrapper',
        html: `<div class="room-price-pill"><span>${priceText}</span></div>`,
        iconSize: [68, 28],
        iconAnchor: [34, 14],
      });

      const marker = L.marker([lat, lng], { icon: pricePillIcon });

      // Popup preview phòng
      const coverImg =
        room.coverImageUrl ||
        (room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls[0] : DEFAULT_ROOM_IMAGE);

      const popupContent = document.createElement('div');
      popupContent.style.width = '240px';
      popupContent.style.fontFamily = 'inherit';
      popupContent.innerHTML = `
        <div style="border-radius: 12px; overflow: hidden; background: white;">
          <div style="height: 120px; width: 100%; position: relative; overflow: hidden;">
            <img src="${coverImg}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 8px; left: 8px; background: rgba(79,70,229,0.9); color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">
              ${priceText}/tháng
            </span>
            <span style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); color: white; font-size: 11px; padding: 2px 6px; border-radius: 9999px;">
              ${room.area || 25} m²
            </span>
          </div>
          <div style="padding: 10px;">
            <div style="font-weight: 700; font-size: 13px; color: #1E293B; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${room.name}
            </div>
            <div style="font-size: 11px; color: #64748B; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${room.fullAddress || formatFullAddress(room.addressDetail, room.wardId, room.provinceId) || room.addressDetail || 'Hà Nội'}
            </div>
            <button id="view-room-${room.id}" style="
              width: 100%;
              background: #4F46E5;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 6px 12px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            ">
              Xem chi tiết phòng
            </button>
          </div>
        </div>
      `;

      popupContent.querySelector(`#view-room-${room.id}`)?.addEventListener('click', () => {
        if (onRoomClick) {
          onRoomClick(room);
        } else {
          navigate(`/rooms/${room.id}`);
        }
      });

      marker.bindPopup(popupContent, {
        maxWidth: 260,
        className: 'stay-room-map-popup',
      });

      layer.addLayer(marker);
    });

    // Tự động căn góc xem tới tất cả các phòng nếu có marker
    if (validRooms.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [rooms, navigate, onRoomClick]);

  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = L.latLngBounds([]);
    rooms.forEach((r) => {
      if (r.latitude && r.longitude) {
        bounds.extend([Number(r.latitude), Number(r.longitude)]);
      }
    });
    zones.forEach((z) => {
      bounds.extend([z.latitude, z.longitude]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView([21.0285, 105.8048], 13);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    const map = mapInstanceRef.current;
    if (!map) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 1.2 });
    });
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-stay-border shadow-md"
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Toolbar Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Tooltip title="Thu phóng vừa tất cả các phòng">
          <Button
            type="default"
            icon={<Maximize2 className="w-4 h-4 text-stay-text" />}
            onClick={handleFitAll}
            className="w-10 h-10 rounded-xl bg-stay-card-bg/95 backdrop-blur-md border border-stay-border shadow-lg flex items-center justify-center hover:bg-stay-bg-app"
          />
        </Tooltip>
        <Tooltip title="Vị trí hiện tại của tôi">
          <Button
            type="default"
            icon={<LocateFixed className="w-4 h-4 text-stay-primary" />}
            onClick={handleLocateMe}
            className="w-10 h-10 rounded-xl bg-stay-card-bg/95 backdrop-blur-md border border-stay-border shadow-lg flex items-center justify-center hover:bg-stay-bg-app"
          />
        </Tooltip>
      </div>

      {/* Floating Room Counter Badge */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-stay-card-bg/95 backdrop-blur-md border border-stay-border px-3.5 py-2 rounded-xl shadow-lg text-xs font-semibold text-stay-text flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hiển thị <strong>{rooms.length}</strong> phòng trên bản đồ</span>
        </div>
      </div>
    </div>
  );
};

export default RoomBigMap;
