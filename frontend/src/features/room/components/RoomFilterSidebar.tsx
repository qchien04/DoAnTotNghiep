import React, { useEffect, useState } from 'react';
import { Input, Select, Slider, Button } from 'antd';
import {
  Search,
  RotateCcw,
  Pencil,
  MapPin,
  X,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { CircleZone, formatRadius } from '../types/roomSearch';
import { amenityService } from '@/shared/services/amenityService';
import { Amenity } from '@/shared/types/amenity';

export interface RoomFilterValues {
  keyword: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  amenityIds: number[];
  zones: CircleZone[];
}

export interface RoomFilterSidebarProps {
  values: RoomFilterValues;
  onChange: (newValues: Partial<RoomFilterValues>) => void;
  onReset: () => void;
  onOpenDrawModal: () => void;
}

const HANOI_DISTRICTS = [
  { value: 'ALL', label: 'Tất cả quận/huyện' },
  { value: 'Cầu Giấy', label: 'Quận Cầu Giấy' },
  { value: 'Đống Đa', label: 'Quận Đống Đa' },
  { value: 'Thanh Xuân', label: 'Quận Thanh Xuân' },
  { value: 'Hai Bà Trưng', label: 'Quận Hai Bà Trưng' },
  { value: 'Nam Từ Liêm', label: 'Quận Nam Từ Liêm' },
  { value: 'Ba Đình', label: 'Quận Ba Đình' },
  { value: 'Bắc Từ Liêm', label: 'Quận Bắc Từ Liêm' },
  { value: 'Tây Hồ', label: 'Quận Tây Hồ' },
  { value: 'Hoàng Mai', label: 'Quận Hoàng Mai' },
  { value: 'Hà Đông', label: 'Quận Hà Đông' },
  { value: 'Long Biên', label: 'Quận Long Biên' },
];

const PRICE_PRESETS = [
  { label: 'Tất cả', min: 0, max: 15000000 },
  { label: '< 3 tr', min: 0, max: 3000000 },
  { label: '3 - 5 tr', min: 3000000, max: 5000000 },
  { label: '5 - 8 tr', min: 5000000, max: 8000000 },
  { label: '> 8 tr', min: 8000000, max: 15000000 },
];

const AREA_PRESETS = [
  { label: 'Tất cả', min: 15, max: 80 },
  { label: '< 25 m²', min: 15, max: 25 },
  { label: '25 - 35 m²', min: 25, max: 35 },
  { label: '> 35 m²', min: 35, max: 80 },
];

export const RoomFilterSidebar: React.FC<RoomFilterSidebarProps> = ({
  values,
  onChange,
  onReset,
  onOpenDrawModal,
}) => {
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);

  // Tải danh mục tiện ích công khai từ Backend
  useEffect(() => {
    amenityService
      .getAllPublicAmenities()
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setAvailableAmenities(res.data);
        }
      })
      .catch(() => {
        // Fallback danh mục mặc định nếu chưa có kết nối
        setAvailableAmenities([
          { id: 1, name: 'Điều hòa' },
          { id: 2, name: 'Nóng lạnh' },
          { id: 3, name: 'Tủ lạnh' },
          { id: 4, name: 'Máy giặt' },
          { id: 5, name: 'Giường nệm' },
          { id: 6, name: 'Tủ quần áo' },
          { id: 7, name: 'Wifi tốc độ cao' },
          { id: 8, name: 'Bếp riêng' },
          { id: 9, name: 'Ban công' },
          { id: 10, name: 'Thang máy' },
          { id: 11, name: 'Khóa vân tay' },
          { id: 12, name: 'Bảo vệ 24/7' },
        ]);
      });
  }, []);

  const handleToggleAmenity = (id: number) => {
    const current = values.amenityIds || [];
    const updated = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    onChange({ amenityIds: updated });
  };

  const handleRemoveZone = (id: string) => {
    const updated = (values.zones || []).filter((z) => z.id !== id);
    onChange({ zones: updated });
  };

  return (
    <div className="bg-stay-card-bg border border-stay-border rounded-2xl p-5 shadow-sm space-y-6">
      {/* Tiêu đề & Nút đặt lại */}
      <div className="flex items-center justify-between pb-3 border-b border-stay-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-stay-primary" />
          <h2 className="text-base font-bold text-stay-text m-0">Bộ Lọc Tìm Kiếm</h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-stay-text-secondary hover:text-stay-primary flex items-center gap-1 transition cursor-pointer font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Đặt lại
        </button>
      </div>

      {/* Widget Khoanh Vùng Không Gian (Spatial Mini-Map Widget) */}
      <div className="rounded-xl border border-stay-border bg-stay-bg-app p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-stay-primary" />
            <span className="text-xs font-bold text-stay-text">Khoanh vùng trên bản đồ</span>
          </div>
          {values.zones && values.zones.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stay-primary-subtle text-stay-primary border border-stay-primary/20">
              {values.zones.length} vùng
            </span>
          )}
        </div>

        {values.zones && values.zones.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {values.zones.map((zone, idx) => (
                <span
                  key={zone.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-stay-card-bg text-stay-text border border-stay-border shadow-2xs"
                >
                  <span>#{idx + 1}: {formatRadius(zone.radiusInMeters)}</span>
                  <button
                    onClick={() => handleRemoveZone(zone.id)}
                    className="hover:text-red-500 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <Button
              type="primary"
              ghost
              icon={<Pencil className="w-3.5 h-3.5" />}
              onClick={onOpenDrawModal}
              className="w-full h-8 text-xs font-semibold rounded-lg mt-1"
            >
              Chỉnh sửa vùng khoanh
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-xs text-stay-text-secondary m-0 mb-3 leading-relaxed">
              Dí chuột kéo khoanh vùng để chỉ tìm các phòng trong bán kính bạn chọn.
            </p>
            <Button
              type="primary"
              icon={<Pencil className="w-3.5 h-3.5" />}
              onClick={onOpenDrawModal}
              className="w-full h-9 text-xs font-semibold rounded-lg bg-stay-primary hover:bg-stay-primary-hover text-white shadow-sm flex items-center justify-center gap-1.5"
            >
              Vẽ vùng trên bản đồ
            </Button>
          </div>
        )}
      </div>

      {/* Tìm kiếm từ khóa */}
      <div>
        <label className="block text-xs font-bold text-stay-text mb-2">
          Từ khóa tìm kiếm
        </label>
        <Input
          prefix={<Search className="w-4 h-4 text-stay-text-muted" />}
          placeholder="Tên phòng, tên đường, tòa nhà..."
          value={values.keyword}
          onChange={(e) => onChange({ keyword: e.target.value })}
          allowClear
          className="h-10 rounded-xl"
        />
      </div>

      {/* Khu vực quận/huyện */}
      <div>
        <label className="block text-xs font-bold text-stay-text mb-2">
          Khu vực quận / huyện
        </label>
        <Select
          value={values.district}
          onChange={(val) => onChange({ district: val })}
          options={HANOI_DISTRICTS}
          className="w-full h-10"
        />
      </div>

      {/* Khoảng giá thuê */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-stay-text">Khoảng giá thuê</label>
          <span className="text-xs font-semibold text-stay-primary">
            {values.minPrice === 0 && values.maxPrice >= 15000000
              ? 'Tất cả mức giá'
              : `${(values.minPrice / 1000000).toFixed(1)} - ${(values.maxPrice / 1000000).toFixed(1)} tr`}
          </span>
        </div>

        <Slider
          range
          min={0}
          max={15000000}
          step={500000}
          value={[values.minPrice, values.maxPrice]}
          onChange={(val) => onChange({ minPrice: val[0], maxPrice: val[1] })}
          tooltip={{
            formatter: (v) => `${((v || 0) / 1000000).toFixed(1)} tr`,
          }}
        />

        {/* Chips preset mức giá */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          {PRICE_PRESETS.map((p, i) => {
            const isSelected =
              values.minPrice === p.min && values.maxPrice === p.max;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange({ minPrice: p.min, maxPrice: p.max })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-stay-primary text-white border-stay-primary shadow-xs'
                    : 'bg-stay-bg-app text-stay-text-secondary border-stay-border hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Diện tích */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-stay-text">Diện tích phòng</label>
          <span className="text-xs font-semibold text-stay-primary">
            {values.minArea <= 15 && values.maxArea >= 80
              ? 'Tất cả diện tích'
              : `${values.minArea} - ${values.maxArea} m²`}
          </span>
        </div>

        <Slider
          range
          min={15}
          max={80}
          step={5}
          value={[values.minArea, values.maxArea]}
          onChange={(val) => onChange({ minArea: val[0], maxArea: val[1] })}
          tooltip={{
            formatter: (v) => `${v} m²`,
          }}
        />

        {/* Chips preset diện tích */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          {AREA_PRESETS.map((a, i) => {
            const isSelected =
              values.minArea === a.min && values.maxArea === a.max;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange({ minArea: a.min, maxArea: a.max })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-stay-primary text-white border-stay-primary shadow-xs'
                    : 'bg-stay-bg-app text-stay-text-secondary border-stay-border hover:bg-slate-100'
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tiện ích phòng */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-stay-text flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-stay-primary" />
            Tiện ích phòng
          </label>
          {values.amenityIds && values.amenityIds.length > 0 && (
            <span className="text-[11px] text-stay-primary font-semibold">
              Đã chọn {values.amenityIds.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap max-h-48 overflow-y-auto pr-1">
          {availableAmenities.map((amenity) => {
            const isChecked = values.amenityIds?.includes(amenity.id);
            return (
              <button
                key={amenity.id}
                type="button"
                onClick={() => handleToggleAmenity(amenity.id)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${
                  isChecked
                    ? 'bg-stay-primary text-white border-stay-primary shadow-xs'
                    : 'bg-stay-bg-app text-stay-text-secondary border-stay-border hover:bg-slate-100'
                }`}
              >
                {amenity.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoomFilterSidebar;
