import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Tooltip, message } from 'antd';
import { LocateFixed, Loader2 } from 'lucide-react';
import {
  VIETNAM_ISLANDS_DATA,
  HOANG_SA_CENTER,
  TRUONG_SA_CENTER,
} from '@/shared/constants/vietnamIslands';

export interface MapMarker {
  id: string | number;
  position: [number, number]; // [lat, lng]
  title: string;
  price?: string;
  address?: string;
  imageUrl?: string;
  type?: 'room' | 'roommate';
  matchPercentage?: number;
  link?: string;
}

export interface MapCircle {
  center: [number, number];
  radiusKm: number;
  label?: string;
  color?: string;
}

export interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  circles?: MapCircle[];
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string | number;
  className?: string;
  showCurrentLocation?: boolean;
  onCurrentLocationFound?: (lat: number, lng: number) => void;
}

// Fix default leaflet marker icon issue in Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Giới hạn phạm vi địa lý nghiêm ngặt chỉ trong lãnh thổ và vùng biển Việt Nam
// Bao gồm đất liền hình chữ S, thềm lục địa, vùng đặc quyền kinh tế, Quần đảo Hoàng Sa và Quần đảo Trường Sa
export const VIETNAM_BOUNDS: L.LatLngBoundsLiteral = [
  [6.0, 101.5],  // Tọa độ góc Tây Nam (Nam Biển Đông, bãi cạn DK1, vịnh Thái Lan)
  [24.0, 118.5], // Tọa độ góc Đông Bắc (Lũng Cú, Vịnh Bắc Bộ, Đông Hoàng Sa & Trường Sa)
];

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center = [21.0285, 105.8048], // Hà Nội center
  zoom = 13,
  markers = [],
  circles = [],
  onMarkerClick,
  onMapClick,
  height = '480px',
  className = '',
  showCurrentLocation = true,
  onCurrentLocationFound,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);

  const handleFlyToCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.warning('Trình duyệt không hỗ trợ định vị vị trí GPS.');
      return;
    }
    const map = mapInstanceRef.current;
    if (!map) return;

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeolocating(false);
        const { latitude, longitude } = pos.coords;

        // Bay mượt mà đến tọa độ hiện tại
        map.flyTo([latitude, longitude], 16, { duration: 1.5 });

        // Tạo hoặc cập nhật chấm định vị phong cách Google Maps
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const userDotIcon = L.divIcon({
            className: 'user-gps-dot',
            html: `
              <div style="position: relative; width: 22px; height: 22px;">
                <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(79, 70, 229, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="width: 22px; height: 22px; border-radius: 50%; background: #4F46E5; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userDotIcon })
            .bindPopup('<strong>Vị trí hiện tại của bạn</strong>')
            .addTo(map);
        }

        onCurrentLocationFound?.(latitude, longitude);
        message.success('Đã xác định vị trí hiện tại thành công!');
      },
      (err) => {
        setIsGeolocating(false);
        let msg = 'Không thể lấy vị trí hiện tại.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Vui lòng cấp quyền truy cập vị trí trên trình duyệt.';
        }
        message.warning(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Clean up any stale leaflet ID to prevent "Map container is already initialized" error
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Khởi tạo bản đồ với giới hạn geometry chỉ trong phạm vi Việt Nam
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        minZoom: 5,  // Giữ khung nhìn luôn nằm trọn trong lãnh thổ Việt Nam, không cho zoom out ra toàn cầu
        maxZoom: 19,
        maxBounds: VIETNAM_BOUNDS,
        maxBoundsViscosity: 1.0, // Chặn cứng không cho kéo/cuộn bản đồ ra ngoài biên giới & vùng biển Việt Nam
        zoomControl: true,
        scrollWheelZoom: true,
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClickRef.current?.(e.latlng.lat, e.latlng.lng);
      });

      // Sử dụng tile layer OpenStreetMap Humanitarian (HOT) qua CDN ổn định:
      // - Giao diện chi tiết, sắc nét, màu sắc hài hòa, không watermark
      // - Tuyệt đối không có đường lưỡi bò phi pháp
      // - Tốc độ tải nhanh, không bị chặn 403 trên localhost
      L.tileLayer(
        'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          subdomains: ['a', 'b'],
        }
      ).addTo(map);

      // Layer khẳng định chủ quyền Quần đảo Hoàng Sa & Quần đảo Trường Sa (Việt Nam)
      const islandsGroup = L.layerGroup().addTo(map);

      // 1. Nhãn chính Quần đảo Hoàng Sa (Việt Nam)
      const hoangSaIcon = L.divIcon({
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
            letter-spacing: 0.2px;
          ">
            <span style="color: #fde047; font-size: 12px;">★</span>
            <span>${HOANG_SA_CENTER.name}</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      L.marker([HOANG_SA_CENTER.lat, HOANG_SA_CENTER.lng], { icon: hoangSaIcon }).addTo(islandsGroup);

      // 2. Nhãn chính Quần đảo Trường Sa (Việt Nam)
      const truongSaIcon = L.divIcon({
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
            letter-spacing: 0.2px;
          ">
            <span style="color: #fde047; font-size: 12px;">★</span>
            <span>${TRUONG_SA_CENTER.name}</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      L.marker([TRUONG_SA_CENTER.lat, TRUONG_SA_CENTER.lng], { icon: truongSaIcon }).addTo(islandsGroup);

      // 3. Toàn bộ 182 đảo, bãi cạn, rạn san hô thuộc Hoàng Sa & Trường Sa
      VIETNAM_ISLANDS_DATA.islands.forEach((island) => {
        const isNamed = !!island.label;
        const groupName = island.group === 'hoangsa' ? 'Hoàng Sa' : 'Trường Sa';

        const islandMarker = L.circleMarker([island.lat, island.lng], {
          radius: isNamed ? 4.5 : 2.5,
          color: '#dc2626',
          fillColor: isNamed ? '#fde047' : '#ef4444',
          fillOpacity: 0.95,
          weight: isNamed ? 1.5 : 1,
        });

        const tooltipContent = isNamed
          ? `<strong>${island.label}</strong><br/><span style="font-size: 10px; color: #dc2626; font-weight: 700;">Quần đảo ${groupName} (Việt Nam)</span>`
          : `<strong>Bãi cạn / Đảo chìm</strong><br/><span style="font-size: 10px; color: #dc2626; font-weight: 700;">Quần đảo ${groupName} (Việt Nam)</span>`;

        islandMarker.bindTooltip(tooltipContent, {
          permanent: false,
          direction: 'top',
          className: 'stay-island-tooltip',
        });

        islandMarker.addTo(islandsGroup);
      });

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Invalidate size shortly after mounting to avoid tile rendering glitches
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 250);

      const handleResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        if (mapContainerRef.current) {
          delete (mapContainerRef.current as any)._leaflet_id;
        }
      };
    }
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const map = mapInstanceRef.current;
    map.invalidateSize();
    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    markers.forEach((marker) => {
      bounds.extend(marker.position);

      // Custom HTML Pin Icon
      const customIcon = L.divIcon({
        className: 'stay-custom-pin',
        html: `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: ${marker.type === 'roommate' ? '#9333ea' : '#2563eb'};
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid #ffffff;
            white-space: nowrap;
            cursor: pointer;
            transform: translate(-50%, -100%);
            transition: all 0.2s ease;
          ">
            <span>${marker.price || 'Phòng'}</span>
            ${marker.matchPercentage ? `<span style="background: rgba(255,255,255,0.25); padding: 1px 4px; border-radius: 4px; font-size: 9px;">${marker.matchPercentage}%</span>` : ''}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const leafletMarker = L.marker(marker.position, { icon: customIcon });

      // Popup content
      const popupHtml = `
        <div style="font-family: inherit; width: 220px; padding: 2px;">
          ${marker.imageUrl
          ? `<div style="width: 100%; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 8px;">
                   <img src="${marker.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${marker.title}" />
                 </div>`
          : ''
        }
          <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 4px 0; color: #1e293b; line-height: 1.3;">
            ${marker.title}
          </h4>
          ${marker.price
          ? `<p style="font-size: 14px; font-weight: 800; color: #2563eb; margin: 0 0 4px 0;">${marker.price}</p>`
          : ''
        }
          ${marker.address
          ? `<p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.3;">${marker.address}</p>`
          : ''
        }
          <div style="text-align: right;">
            <button
              id="map-btn-${marker.id}"
              style="
                background: #2563eb;
                color: #ffffff;
                border: none;
                border-radius: 6px;
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
              "
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      `;

      leafletMarker.bindPopup(popupHtml);

      leafletMarker.on('popupopen', () => {
        const btn = document.getElementById(`map-btn-${marker.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.preventDefault();
            if (onMarkerClick) {
              onMarkerClick(marker);
            } else if (marker.link) {
              window.location.href = marker.link;
            }
          };
        }
      });

      leafletMarker.on('click', () => {
        onMarkerClick?.(marker);
      });

      layerGroup.addLayer(leafletMarker);
    });

    if (markers.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [markers, onMarkerClick]);

  // Update Circles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (!circlesLayerRef.current) {
      circlesLayerRef.current = L.layerGroup().addTo(map);
    }
    const layerGroup = circlesLayerRef.current;
    layerGroup.clearLayers();

    circles.forEach((circle) => {
      const leafletCircle = L.circle(circle.center, {
        radius: circle.radiusKm * 1000,
        color: circle.color || '#4F46E5',
        fillColor: circle.color || '#4F46E5',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '5, 5',
      });
      if (circle.label) {
        leafletCircle.bindTooltip(circle.label, {
          permanent: true,
          direction: 'center',
          className: 'stay-circle-label',
        });
      }
      layerGroup.addLayer(leafletCircle);
    });
  }, [circles]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-stay-border shadow-card bg-stay-card-bg ${className}`}
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Nút vị trí hiện tại nổi trên bản đồ kiểu Google Maps */}
      {showCurrentLocation && (
        <Tooltip title="Vị trí hiện tại của bạn" placement="left">
          <button
            type="button"
            onClick={handleFlyToCurrentLocation}
            disabled={isGeolocating}
            className="absolute bottom-5 right-5 z-[500] w-10 h-10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-stay-primary rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60"
            aria-label="Vị trí hiện tại"
          >
            {isGeolocating ? (
              <Loader2 className="w-5 h-5 animate-spin text-stay-primary" />
            ) : (
              <LocateFixed className="w-5 h-5 text-stay-primary" />
            )}
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default LeafletMap;
