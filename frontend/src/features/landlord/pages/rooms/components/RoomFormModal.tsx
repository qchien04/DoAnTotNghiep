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
import {
  HelpCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  LocateFixed,
  Loader2,
} from 'lucide-react';
import { CreateRoomDto, Room } from '@/shared/types/landlord';
import {
  useBuildings,
  useBuildingDetail,
  useServices,
  useUploadMultipleImages,
} from '@/shared/hooks';
import {
  formatServicePriceWithUnit,
  getBillingMethodInfo,
} from '@/shared/utils/serviceUtils';
import { VIETNAM_BOUNDS } from '@/shared/components/ui/LeafletMap';
import {
  getProvinces,
  getWardsByProvinceId,
  getProvinceName,
  getWardName,
} from '@/shared/constants/vietnamLocations';
import {
  encodeAmenitiesMask,
  decodeAmenitiesMask,
} from '@/shared/constants/roomAmenities';
import { AmenitySelectorGrid } from '@/shared/components/ui/AmenityBadge';

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
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateRoomDto) => Promise<void>;
}

export const RoomFormModal: React.FC<RoomFormModalProps> = ({
  open,
  editingRoom,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const { services } = useServices();
  const { uploadMultipleImages } = useUploadMultipleImages();

  const watchedBuildingId = Form.useWatch('buildingId', form);
  const { building: selectedBuilding } = useBuildingDetail(watchedBuildingId);

  // Room Images State
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location & Map State
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 21.0285,
    lng: 105.8048,
  });
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(1);

  const provinces = getProvinces();
  const availableWards = selectedProvinceId ? getWardsByProvinceId(selectedProvinceId) : [];

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
          const fullDisplayName = data.display_name || '';

          const allProvs = getProvinces();
          const matchedProvince = allProvs.find(
            (p) =>
              (addr.city && addr.city.toLowerCase().includes(p.name.toLowerCase())) ||
              (addr.state && addr.state.toLowerCase().includes(p.name.toLowerCase())) ||
              (addr.province && addr.province.toLowerCase().includes(p.name.toLowerCase())) ||
              p.name.toLowerCase().includes((addr.city || addr.state || addr.province || '').toLowerCase())
          );

          if (matchedProvince) {
            setSelectedProvinceId(matchedProvince.id);
            const wards = getWardsByProvinceId(matchedProvince.id);
            const matchedWard = wards.find(
              (w) =>
                (addr.quarter && addr.quarter.toLowerCase().includes(w.name.toLowerCase())) ||
                (addr.suburb && addr.suburb.toLowerCase().includes(w.name.toLowerCase())) ||
                (addr.neighbourhood && addr.neighbourhood.toLowerCase().includes(w.name.toLowerCase())) ||
                (addr.city_district && addr.city_district.toLowerCase().includes(w.name.toLowerCase())) ||
                w.name.toLowerCase().includes((addr.quarter || addr.suburb || addr.neighbourhood || '').toLowerCase())
            );

            form.setFieldsValue({
              provinceId: matchedProvince.id,
              province: matchedProvince.name,
              wardId: matchedWard ? matchedWard.id : undefined,
              ward: matchedWard ? matchedWard.name : '',
              addressDetail: fullDisplayName,
            });
          } else {
            form.setFieldsValue({
              addressDetail: fullDisplayName,
            });
          }
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
        const effectiveLat = editingRoom.latitude ? Number(editingRoom.latitude) : 21.0285;
        const effectiveLng = editingRoom.longitude ? Number(editingRoom.longitude) : 105.8048;
        const effectiveCoords = { lat: effectiveLat, lng: effectiveLng };

        setCurrentCoords(effectiveCoords);
        const initialImages =
          editingRoom.imageUrls && editingRoom.imageUrls.length > 0
            ? editingRoom.imageUrls
            : editingRoom.coverImageUrl
            ? [editingRoom.coverImageUrl]
            : [];
        setImageUrls(initialImages);

        const mask =
          editingRoom.amenitiesMask ||
          (editingRoom.amenities
            ? encodeAmenitiesMask(
                Array.isArray(editingRoom.amenities)
                  ? editingRoom.amenities
                  : [String(editingRoom.amenities)]
              )
            : 0);
        const parsedAmenities = decodeAmenitiesMask(mask);

        const roomServiceIds =
          editingRoom.serviceIds ||
          (editingRoom.services
            ? (editingRoom.services as any[]).map((s: any) => s.id)
            : []);

        const allProvs = getProvinces();
        const pId =
          editingRoom.provinceId ??
          (editingRoom.province
            ? allProvs.find((p) => p.name.toLowerCase() === editingRoom.province?.toLowerCase())?.id
            : 1);
        const wId =
          editingRoom.wardId ??
          (editingRoom.ward && pId
            ? getWardsByProvinceId(pId).find((w) => w.name.toLowerCase() === editingRoom.ward?.toLowerCase())?.id
            : undefined);

        setSelectedProvinceId(pId || 1);

        form.setFieldsValue({
          buildingId: editingRoom.buildingId || null,
          provinceId: pId || 1,
          wardId: wId,
          province: editingRoom.province || getProvinceName(pId || 1),
          ward: editingRoom.ward || (wId ? getWardName(wId) : ''),
          addressDetail: editingRoom.addressDetail || 'Hà Nội, Việt Nam',
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
        setImageUrls([]);
        const initialCoords = { lat: 21.0285, lng: 105.8048 };
        setCurrentCoords(initialCoords);
        setSelectedProvinceId(1);

        form.setFieldsValue({
          buildingId: null,
          provinceId: 1,
          wardId: undefined,
          province: getProvinceName(1),
          ward: '',
          addressDetail: 'Hà Nội, Việt Nam',
          latitude: 21.0285,
          longitude: 105.8048,
          floor: 1,
          area: 25,
          maxCapacity: 2,
          listedPrice: 3500000,
          standardDeposit: 3500000,
          isPublic: true,
          amenities: ['Điều hòa', 'Nóng lạnh', 'Wi-Fi tốc độ cao'],
          serviceIds: services.map((s: any) => s.id),
        });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([21.0285, 105.8048], 15);
          markerRef.current.setLatLng([21.0285, 105.8048]);
        }
      }
    }
  }, [open, editingRoom, services, form]);

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

      L.tileLayer(
        'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          subdomains: ['a', 'b'],
        }
      ).addTo(map);

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

  useEffect(() => {
    if (selectedBuilding) {
      const lat = selectedBuilding.latitude ? Number(selectedBuilding.latitude) : currentCoords.lat;
      const lng = selectedBuilding.longitude ? Number(selectedBuilding.longitude) : currentCoords.lng;
      const addr =
        selectedBuilding.addressDetail ||
        `${selectedBuilding.ward ? selectedBuilding.ward + ', ' : ''}${selectedBuilding.province || ''}`;

      setCurrentCoords({ lat, lng });

      const allProvs = getProvinces();
      const pId =
        selectedBuilding.provinceId ??
        (selectedBuilding.province
          ? allProvs.find((p) => p.name.toLowerCase() === selectedBuilding.province?.toLowerCase())?.id
          : 1);
      const wId =
        selectedBuilding.wardId ??
        (selectedBuilding.ward && pId
          ? getWardsByProvinceId(pId).find((w) => w.name.toLowerCase() === selectedBuilding.ward?.toLowerCase())?.id
          : undefined);

      if (pId) {
        setSelectedProvinceId(pId);
      }

      form.setFieldsValue({
        provinceId: pId,
        wardId: wId,
        province: selectedBuilding.province || (pId ? getProvinceName(pId) : 'Thành phố Hà Nội'),
        ward: selectedBuilding.ward || (wId ? getWardName(wId) : ''),
        addressDetail: selectedBuilding.addressDetail || addr || 'Hà Nội, Việt Nam',
        latitude: lat,
        longitude: lng,
      });

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.0 });
        markerRef.current.setLatLng([lat, lng]);
      }
      message.info(`Đã nạp vị trí và địa chỉ từ tòa nhà: ${selectedBuilding.name}`);
    }
  }, [selectedBuilding]);

  const handleBuildingChange = (val: number | string | null) => {
    if (!val) {
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

  // Handlers for room images
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileList) {
      if (!file.type.startsWith('image/')) {
        message.warning(`Tệp ${file.name} không phải là hình ảnh.`);
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        message.warning(`Tệp ${file.name} vượt quá 15MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsProcessingFiles(true);
    try {
      const uploadedUrls = await uploadMultipleImages(validFiles, 'rooms');
      if (uploadedUrls && uploadedUrls.length > 0) {
        setImageUrls((prev) => [...prev, ...uploadedUrls]);
        message.success(`Đã tải lên ${uploadedUrls.length} ảnh phòng thành công.`);
      }
    } catch {
      // Handled in mutation hook
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    message.info('Đã xóa ảnh.');
  };

  const handleSetCoverImage = (indexToCover: number) => {
    if (indexToCover === 0) return;
    setImageUrls((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(indexToCover, 1);
      return [item, ...copy];
    });
    message.success('Đã chọn làm ảnh đại diện chính.');
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const coverImageUrl = imageUrls.length > 0 ? imageUrls[0] : undefined;
    const selectedAmenityNames: string[] = values.amenities || [];
    const amenitiesMask = encodeAmenitiesMask(selectedAmenityNames);

    const isInheritingBuilding = Boolean(watchedBuildingId && selectedBuilding);
    const provinceId =
      isInheritingBuilding && selectedBuilding?.provinceId ? selectedBuilding.provinceId : values.provinceId;
    const wardId =
      isInheritingBuilding && selectedBuilding?.wardId ? selectedBuilding.wardId : values.wardId;
    const pName = getProvinceName(provinceId) || values.province;
    const wName = wardId ? getWardName(wardId) : values.ward;

    await onSubmit({
      ...values,
      provinceId,
      wardId,
      province: pName,
      ward: wName,
      amenities: selectedAmenityNames,
      amenitiesMask,
      coverImageUrl,
      imageUrls,
    } as CreateRoomDto);
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
        <div className="space-y-3">

          <div className="space-y-3">
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
              <Select.Infinite
                useQueryHook={useBuildings}
                allowClear
                placeholder="Chọn tòa nhà hoặc để trống nếu là phòng trọ độc lập"
                onChange={handleBuildingChange}
                className="w-full h-10"
                mapOption={(b: any) => ({
                  label: `🏢 ${b.name}${b.address ? ` (${b.address})` : ''}`,
                  value: b.id,
                })}
              />
            </Form.Item>

            {/* 2 CỘT TỶ LỆ KHOẢNG 6:4: 1 BÊN BẢN ĐỒ - 1 BÊN INPUT ĐỊA CHỈ */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stay-text">
                  Vị trí trên bản đồ & địa chỉ phòng
                </span>
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

                    {/* Nút vị trí hiện tại nổi trên bản đồ kiểu Google Maps */}
                    <Tooltip title="Vị trí hiện tại của bạn" placement="left">
                      <button
                        type="button"
                        onClick={handleGetQuickLocation}
                        disabled={isGeolocating}
                        className="absolute bottom-3 right-3 z-[500] w-9 h-9 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-stay-primary rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60"
                        aria-label="Vị trí hiện tại"
                      >
                        {isGeolocating ? (
                          <Loader2 className="w-4 h-4 animate-spin text-stay-primary" />
                        ) : (
                          <LocateFixed className="w-4 h-4 text-stay-primary" />
                        )}
                      </button>
                    </Tooltip>

                    {isGeolocating && (
                      <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50">
                        <Spin tip="Đang lấy tọa độ GPS..." />
                      </div>
                    )}
                  </div>
                </div>

                {/* CỘT 2 (TỶ LỆ ~40%): CÁC Ô INPUT ĐỊA CHỈ */}
                <div className="lg:col-span-5 space-y-2.5">
                  {Boolean(watchedBuildingId) && (
                    <div className="p-2 rounded-lg bg-stay-primary-subtle border border-stay-primary/20 text-stay-primary text-xs flex items-center gap-1.5 font-medium">
                      <span>🏢 Địa chỉ được kế thừa từ tòa nhà</span>
                    </div>
                  )}

                  <Form.Item
                    label={<span className="font-semibold text-stay-text ">Tỉnh / Thành phố</span>}
                    name="provinceId"
                    rules={[{ required: true, message: 'Vui lòng chọn Tỉnh / TP' }]}
                    className="mb-2"
                  >
                    <Select
                      showSearch
                      disabled={Boolean(watchedBuildingId)}
                      placeholder="Chọn Tỉnh / Thành phố"
                      optionFilterProp="label"
                      className="w-full h-9"
                      options={provinces.map((p) => ({ value: p.id, label: p.name }))}
                      onChange={(val) => {
                        setSelectedProvinceId(val);
                        form.setFieldsValue({
                          wardId: undefined,
                          province: getProvinceName(val),
                          ward: '',
                        });
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-semibold text-stay-text ">Phường / Xã</span>}
                    name="wardId"
                    className="mb-2"
                  >
                    <Select
                      showSearch
                      allowClear
                      disabled={Boolean(watchedBuildingId) || !selectedProvinceId}
                      placeholder={selectedProvinceId ? 'Chọn Phường / Xã' : 'Vui lòng chọn Tỉnh / TP trước'}
                      optionFilterProp="label"
                      className="w-full h-9"
                      options={availableWards.map((w) => ({ value: w.id, label: w.name }))}
                      onChange={(val) => {
                        form.setFieldsValue({
                          ward: val ? getWardName(val) : '',
                        });
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-stay-text ">Địa chỉ chi tiết</span>
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
                      disabled={Boolean(watchedBuildingId)}
                      placeholder="Số nhà, ngõ/ngách, tên đường..."
                      className="w-full p-2  rounded-lg"
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
        <div className="space-y-3 pt-4 border-t border-stay-border-subtle">
          <div className="space-y-3">
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
                  suffix={<span className=" text-stay-text-muted font-medium">Tầng</span>}
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
                  suffix={<span className=" text-stay-text-muted font-medium">m²</span>}
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
                  suffix={<span className=" text-stay-text-muted font-medium">Người</span>}
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
                  suffix={<span className=" font-semibold text-600">VNĐ/tháng</span>}
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
                  suffix={<span className=" font-semibold text-stay-text">VNĐ</span>}
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
                    { label: 'Đang thuê (OCCUPIED)', value: 'OCCUPIED' },
                    { label: 'Đang bảo trì (UNDER_MAINTENANCE)', value: 'UNDER_MAINTENANCE' },
                    { label: 'Ngừng sử dụng (STOPPED)', value: 'STOPPED' },
                  ]}
                />
              </Form.Item>
            )}
          </div>
        </div>

        {/* SECTION 3: TIỆN NGHI & DỊCH VỤ */}
        <div className="space-y-3 pt-4 border-t border-stay-border-subtle">
          <div className="space-y-4">
            <Form.Item
              label={
                <span className="font-semibold text-stay-text text-sm">
                  Tiện nghi có sẵn trong phòng (16 tiện ích chuẩn)
                </span>
              }
              name="amenities"
              className="mb-3"
            >
              <AmenitySelectorGrid
                selectedNames={form.getFieldValue('amenities') || []}
                onChange={(names) => form.setFieldsValue({ amenities: names })}
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
                    type="outline"
                    className="p-0  text-stay-primary font-medium"
                    onClick={() => form.setFieldsValue({ serviceIds: services.map((s) => s.id) })}
                  >
                    Chọn tất cả
                  </Button>
                  <span className="text-stay-border">|</span>
                  <Button
                    size="small"
                    type="outline"
                    className="p-0  text-rose-500 font-medium"
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
                  className="w-full p-2.5 rounded-xl "
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

        {/* SECTION 4: HÌNH ẢNH PHÒNG TRỌ THỰC TẾ */}
        <div className="space-y-3 pt-4 border-t border-stay-border-subtle">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stay-text flex items-center gap-2">

            </h3>
            {imageUrls.length > 0 && (
              <button
                type="button"
                onClick={() => setImageUrls([])}
                className="text-xs text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Xóa tất cả ảnh
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Thanh công cụ: Tải file từ máy tính & Nhập URL ảnh */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Button
                type="outline"
                icon={<Upload className="w-4 h-4" />}
                onClick={() => fileInputRef.current?.click()}
                loading={isProcessingFiles}
                className="h-10 px-4 font-medium flex items-center gap-2 shrink-0 "
              >
                Tải ảnh từ máy tính
              </Button>
            </div>

            {/* Danh sách ảnh hoặc Trạng thái trống */}
            {imageUrls.length === 0 ? (
              <div
                className="border-2 border-dashed border-stay-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-stay-primary/50 transition-colors cursor-pointer bg-stay-card-bg/40"
              >
                <div className="w-12 h-12 rounded-full bg-stay-bg-app flex items-center justify-center text-stay-text-muted mb-2 border border-stay-border">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className=" font-medium text-stay-text mb-1">
                  Chưa có hình ảnh nào cho phòng trọ này
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                {imageUrls.map((url, idx) => {
                  const isCover = idx === 0;
                  return (
                    <div
                      key={idx}
                      className="group relative aspect-4/3 rounded-xl overflow-hidden border border-stay-border bg-stay-card-bg shadow-xs"
                    >
                      <img
                        src={url}
                        alt={`Ảnh phòng ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80';
                        }}
                      />

                      {/* Huy hiệu ảnh bìa */}
                      {isCover && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs backdrop-blur-xs">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Ảnh đại diện</span>
                        </div>
                      )}

                      {/* Các nút thao tác khi hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 backdrop-blur-2xs">
                        {!isCover && (
                          <button
                            type="button"
                            title="Đặt làm ảnh đại diện"
                            onClick={() => handleSetCoverImage(idx)}
                            className="p-1.5 rounded-lg bg-stay-card-bg text-stay-text hover:scale-110 transition-all shadow-sm cursor-pointer"
                          >
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Xóa ảnh"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 rounded-lg bg-rose-500/90 hover:bg-rose-600 text-white hover:scale-110 transition-all shadow-sm cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Đánh số thứ tự ảnh */}
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                        #{idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Form>
    </Modal>
  );
};
