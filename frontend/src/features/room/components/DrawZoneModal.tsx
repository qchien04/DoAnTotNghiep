import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Button, Tooltip, message } from 'antd';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Pencil,
  Undo2,
  Trash2,
  LocateFixed,
  Loader2,
  MapPin,
  Check,
  X,
  Info,
} from 'lucide-react';
import { CircleZone, haversineDistance, formatRadius } from '../types/roomSearch';
import { VIETNAM_BOUNDS } from '@/shared/components/ui/LeafletMap';
import { HOANG_SA_CENTER, TRUONG_SA_CENTER } from '@/shared/constants/vietnamIslands';

// Sửa lỗi nạp icon mặc định của Leaflet trong Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface DrawZoneModalProps {
  open: boolean;
  initialZones?: CircleZone[];
  onCancel: () => void;
  onApply: (zones: CircleZone[]) => void;
}

export const DrawZoneModal: React.FC<DrawZoneModalProps> = ({
  open,
  initialZones = [],
  onCancel,
  onApply,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Trạng thái vùng khoanh
  const [zones, setZones] = useState<CircleZone[]>(initialZones);
  const [isPenActive, setIsPenActive] = useState<boolean>(false);
  const [isGeolocating, setIsGeolocating] = useState<boolean>(false);

  // Refs phục vụ kéo thả vẽ vòng tròn không bị lag do re-render
  const isPenActiveRef = useRef<boolean>(false);
  isPenActiveRef.current = isPenActive;

  const isDrawingRef = useRef<boolean>(false);
  const startLatLngRef = useRef<L.LatLng | null>(null);
  const tempCircleRef = useRef<L.Circle | null>(null);

  // Đồng bộ zones khi mở modal
  useEffect(() => {
    if (open) {
      setZones(initialZones || []);
      setIsPenActive(true); // Tự động bật bút vẽ để người dùng thao tác ngay
    } else {
      setIsPenActive(false);
      isDrawingRef.current = false;
    }
  }, [open, initialZones]);

  // Áp dụng trạng thái kéo/vẽ cho Leaflet Map
  const applyPenMode = useCallback((active: boolean) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (active) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
    }
    // Ngăn chặn map bị xám/trắng bằng invalidateSize
    setTimeout(() => {
      map.invalidateSize();
    }, 50);
  }, []);

  // Cập nhật chế độ kéo bản đồ khi bật/tắt bút vẽ
  useEffect(() => {
    applyPenMode(isPenActive);
  }, [isPenActive, applyPenMode]);

  // Xóa vùng theo ID
  const handleRemoveZone = useCallback((id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
  }, []);

  // Hoàn tác vùng gần nhất
  const handleUndo = useCallback(() => {
    setZones((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
  }, []);

  // Xóa tất cả các vùng
  const handleClearAll = useCallback(() => {
    setZones([]);
    message.info('Đã xóa tất cả các vùng khoanh');
  }, []);

  // Định vị vị trí hiện tại của người dùng
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      message.warning('Trình duyệt không hỗ trợ định vị GPS');
      return;
    }
    const map = mapInstanceRef.current;
    if (!map) return;

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeolocating(false);
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 15, { duration: 1.2 });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const userDotIcon = L.divIcon({
            className: 'user-gps-dot',
            html: `
              <div style="position: relative; width: 22px; height: 22px;">
                <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(79, 70, 229, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="width: 22px; height: 22px; border-radius: 50%; background: #4F46E5; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userDotIcon })
            .bindPopup('<strong>Vị trí hiện tại của bạn</strong>')
            .addTo(map);
        }
        message.success('Đã xác định vị trí hiện tại');
      },
      (err) => {
        setIsGeolocating(false);
        let msg = 'Không thể lấy vị trí hiện tại.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Vui lòng cho phép quyền truy cập vị trí trên trình duyệt.';
        }
        message.warning(msg);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Khởi tạo bản đồ Leaflet
  useEffect(() => {
    if (!open) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    let resizeObserver: ResizeObserver | null = null;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // Xóa _leaflet_id cũ nếu có
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Khởi tạo map
      const map = L.map(mapContainerRef.current, {
        center: [21.0285, 105.8048], // Hà Nội
        zoom: 13,
        minZoom: 5,
        maxZoom: 19,
        maxBounds: VIETNAM_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
      });

      // OpenStreetMap Humanitarian Tile
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Thiết lập trạng thái tương tác ngay khi khởi tạo
      if (isPenActiveRef.current) {
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.boxZoom.disable();
      } else {
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.boxZoom.enable();
      }

      // Layer khẳng định chủ quyền Hoàng Sa & Trường Sa
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

      // Layer group cho các vòng tròn đã khoanh
      const zonesLayer = L.layerGroup().addTo(map);
      zonesLayerRef.current = zonesLayer;

      // Event Mousedown: bắt đầu vẽ
      map.on('mousedown', (e: L.LeafletMouseEvent) => {
        if (!isPenActiveRef.current) return;
        // Bỏ qua nếu không phải chuột trái
        if (e.originalEvent && e.originalEvent.button !== 0) return;
        if (e.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
          L.DomEvent.preventDefault(e.originalEvent);
        }

        isDrawingRef.current = true;
        startLatLngRef.current = e.latlng;

        if (tempCircleRef.current) {
          map.removeLayer(tempCircleRef.current);
          tempCircleRef.current = null;
        }

        // Tạo vòng tròn tạm thời
        const tempCircle = L.circle(e.latlng, {
          radius: 5,
          color: '#7C3AED',
          weight: 2.5,
          dashArray: '6, 6',
          fillColor: '#8B5CF6',
          fillOpacity: 0.25,
        }).addTo(map);

        tempCircle
          .bindTooltip('0 m', {
            permanent: true,
            direction: 'center',
            className: 'stay-circle-drawing-tooltip',
          })
          .openTooltip();

        tempCircleRef.current = tempCircle;
      });

      // Event Mousemove: cập nhật bán kính động
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        if (!isDrawingRef.current || !startLatLngRef.current || !tempCircleRef.current) return;
        if (e.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
        }
        const currentRadius = haversineDistance(
          startLatLngRef.current.lat,
          startLatLngRef.current.lng,
          e.latlng.lat,
          e.latlng.lng
        );
        tempCircleRef.current.setRadius(Math.max(currentRadius, 5));
        tempCircleRef.current.setTooltipContent(formatRadius(currentRadius));
      });

      // Event Mouseup: kết thúc và lưu vòng tròn
      const finishDrawing = (e?: L.LeafletMouseEvent) => {
        if (!isDrawingRef.current || !startLatLngRef.current) return;
        isDrawingRef.current = false;

        const endLatLng = e ? e.latlng : startLatLngRef.current;
        const finalRadius = haversineDistance(
          startLatLngRef.current.lat,
          startLatLngRef.current.lng,
          endLatLng.lat,
          endLatLng.lng
        );

        if (tempCircleRef.current) {
          map.removeLayer(tempCircleRef.current);
          tempCircleRef.current = null;
        }

        // Bán kính tối thiểu 30 mét để tránh click nhầm
        if (finalRadius >= 30) {
          const newZone: CircleZone = {
            id: `zone_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            latitude: startLatLngRef.current.lat,
            longitude: startLatLngRef.current.lng,
            radiusInMeters: Math.round(finalRadius),
          };
          setZones((prev) => [...prev, newZone]);
          message.success(`Đã thêm vùng bán kính ${formatRadius(finalRadius)}`);
        }
        startLatLngRef.current = null;
      };

      map.on('mouseup', finishDrawing);

      // Nếu kéo chuột nhả ra ngoài bản đồ
      const handleGlobalMouseUp = () => {
        if (isDrawingRef.current) {
          finishDrawing();
        }
      };
      window.addEventListener('mouseup', handleGlobalMouseUp);

      mapInstanceRef.current = map;

      // ResizeObserver đảm bảo container luôn đủ kích thước và không bị xám/trắng
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      // Invalidate size nhiều lần sau khi mở modal để khớp với animation
      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 300);
      setTimeout(() => map.invalidateSize(), 600);

      return () => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }, 80);

    return () => {
      clearTimeout(timer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [open]);

  // Vẽ các vòng tròn đã lưu lên layerGroup
  useEffect(() => {
    const layer = zonesLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    zones.forEach((zone, idx) => {
      // Vòng tròn chính
      const circle = L.circle([zone.latitude, zone.longitude], {
        radius: zone.radiusInMeters,
        color: '#7C3AED',
        weight: 2.5,
        fillColor: '#8B5CF6',
        fillOpacity: 0.22,
      });

      // Điểm chấm tâm hình tròn
      const centerDot = L.divIcon({
        className: 'zone-center-icon',
        html: `
          <div style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #7C3AED;
            border: 2.5px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          "></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const marker = L.marker([zone.latitude, zone.longitude], { icon: centerDot });

      // Tooltip bán kính
      circle.bindTooltip(`Vùng #${idx + 1} (${formatRadius(zone.radiusInMeters)})`, {
        direction: 'top',
        offset: [0, -10],
      });

      // Popup thông tin và nút xóa
      const popupEl = document.createElement('div');
      popupEl.style.padding = '4px';
      popupEl.style.fontFamily = 'inherit';
      popupEl.innerHTML = `
        <div style="font-weight: 700; color: #4F46E5; font-size: 13px; margin-bottom: 2px;">Vùng #${idx + 1}</div>
        <div style="font-size: 12px; color: #4B5563; margin-bottom: 8px;">
          Bán kính: <strong>${formatRadius(zone.radiusInMeters)}</strong>
        </div>
        <button id="del-btn-${zone.id}" style="
          width: 100%;
          background: #EF4444;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 5px 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        ">Xóa vùng này</button>
      `;

      popupEl.querySelector(`#del-btn-${zone.id}`)?.addEventListener('click', () => {
        handleRemoveZone(zone.id);
      });

      circle.bindPopup(popupEl);

      layer.addLayer(circle);
      layer.addLayer(marker);
    });
  }, [zones, handleRemoveZone]);

  const handleApply = () => {
    onApply(zones);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width="92vw"
      style={{ maxWidth: 1280, top: 20 }}
      destroyOnClose
      styles={{
        body: {
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
        },
      }}
    >
      <div className="flex flex-col h-[85vh] bg-stay-card-bg">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stay-border bg-stay-card-bg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stay-primary-subtle text-stay-primary flex items-center justify-center font-bold">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stay-text m-0 flex items-center gap-2">
                Khoanh Vùng Tìm Kiếm Phòng Trọ
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-stay-match-subtle text-stay-match border border-stay-match/20">
                  Bản đồ vệ tinh
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-stay-text-muted hover:text-stay-text hover:bg-stay-bg-app transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khu vực Bản đồ + Floating Toolbar */}
        <div className="relative flex-1 w-full min-h-0 bg-slate-100 overflow-hidden">
          {/* Container Leaflet */}
          <div
            ref={mapContainerRef}
            className="absolute inset-0 w-full h-full"
            style={{
              cursor: isPenActive ? 'crosshair' : 'grab',
              touchAction: 'none',
            }}
          />

          {/* Floating Instructions Banner (Góc trên bên trái) */}
          <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
            <div className="bg-stay-card-bg/95 backdrop-blur-md border border-stay-border text-stay-text text-xs font-medium px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-stay-primary shrink-0" />
              <span>
                {isPenActive ? (
                  <>
                    <strong className="text-stay-primary">Chế độ vẽ đang BẬT:</strong> Nhấn giữ chuột và kéo để tạo vòng tròn.
                  </>
                ) : (
                  <>
                    <strong className="text-stay-text">Bản đồ tự do:</strong> Bạn có thể kéo/zoom bản đồ. Nhấn nút Bút vẽ để khoanh vùng.
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Floating Action Toolbar (Góc trên bên phải) */}
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 z-[1000] flex items-center gap-2 bg-stay-card-bg/95 backdrop-blur-md border border-stay-border p-1.5 rounded-2xl shadow-xl"
          >
            {/* Toggle Bút vẽ */}
            <Tooltip title={isPenActive ? 'Tắt chế độ vẽ (cho phép kéo map)' : 'Bật chế độ vẽ (dí chuột kéo vòng tròn)'}>
              <Button
                type={isPenActive ? 'primary' : 'default'}
                icon={<Pencil className="w-4 h-4" />}
                onClick={() => setIsPenActive((prev) => !prev)}
                className={`h-9 px-3.5 rounded-xl font-medium flex items-center gap-1.5 transition ${isPenActive
                    ? 'bg-stay-primary hover:bg-stay-primary-hover text-white shadow-md'
                    : 'text-stay-text border-stay-border hover:bg-stay-bg-app'
                  }`}
              >
                {isPenActive ? 'Đang vẽ' : 'Vẽ vùng'}
              </Button>
            </Tooltip>

            <div className="w-[1px] h-6 bg-stay-border my-auto" />

            {/* Hoàn tác (Undo) */}
            <Tooltip title="Hoàn tác vùng vừa vẽ">
              <Button
                type="text"
                icon={<Undo2 className="w-4 h-4" />}
                disabled={zones.length === 0}
                onClick={handleUndo}
                className="h-9 w-9 p-0 rounded-xl text-stay-text hover:bg-stay-bg-app flex items-center justify-center disabled:opacity-40"
              />
            </Tooltip>

            {/* Xóa toàn bộ */}
            <Tooltip title="Xóa tất cả các vùng">
              <Button
                type="text"
                danger
                icon={<Trash2 className="w-4 h-4" />}
                disabled={zones.length === 0}
                onClick={handleClearAll}
                className="h-9 w-9 p-0 rounded-xl hover:bg-red-50 flex items-center justify-center disabled:opacity-40"
              />
            </Tooltip>

            <div className="w-[1px] h-6 bg-stay-border my-auto" />

            {/* Vị trí hiện tại */}
            <Tooltip title="Bay đến vị trí hiện tại của bạn">
              <Button
                type="text"
                icon={
                  isGeolocating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-stay-primary" />
                  ) : (
                    <LocateFixed className="w-4 h-4 text-stay-primary" />
                  )
                }
                loading={isGeolocating}
                onClick={handleLocateMe}
                className="h-9 w-9 p-0 rounded-xl hover:bg-stay-primary-subtle flex items-center justify-center"
              />
            </Tooltip>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3.5 border-t border-stay-border bg-stay-card-bg flex items-center justify-between flex-wrap gap-3">
          {/* Thông tin các vùng đã chọn */}
          <div className="flex items-center gap-2 flex-wrap max-w-[65%]">
            <span className="text-xs font-semibold text-stay-text-secondary">
              Đã khoanh: <strong className="text-stay-text">{zones.length}</strong> vùng
            </span>

            {zones.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto py-0.5">
                {zones.map((zone, idx) => (
                  <span
                    key={zone.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stay-primary-subtle text-stay-primary border border-stay-primary/20"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>#{idx + 1}: {formatRadius(zone.radiusInMeters)}</span>
                    <button
                      onClick={() => handleRemoveZone(zone.id)}
                      className="hover:text-red-500 ml-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Nút hành động */}
          <div className="flex items-center gap-2.5 ml-auto">
            <Button
              size="large"
              onClick={onCancel}
              className="h-10 px-5 rounded-xl border-stay-border text-stay-text hover:bg-stay-bg-app font-medium"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<Check className="w-4 h-4" />}
              onClick={handleApply}
              className="h-10 px-6 rounded-xl bg-stay-primary hover:bg-stay-primary-hover text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
            >
              Áp dụng vùng chọn ({zones.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Scoped CSS cho Tooltip động */}
      <style>{`
        .stay-circle-drawing-tooltip {
          background: rgba(124, 58, 237, 0.95) !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          border: 1.5px solid rgba(255, 255, 255, 0.6) !important;
          border-radius: 9999px !important;
          padding: 4px 12px !important;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4) !important;
        }
        .stay-circle-drawing-tooltip::before {
          display: none !important;
        }
      `}</style>
    </Modal>
  );
};

export default DrawZoneModal;
