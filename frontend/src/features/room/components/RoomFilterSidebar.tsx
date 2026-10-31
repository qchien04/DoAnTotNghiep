import React from 'react';
import { Input, Select, Slider, Button } from 'antd';
import {
  Search,
  RotateCcw,
  Pencil,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { CircleZone } from '../types/roomSearch';
import { ROOM_AMENITIES } from '@/shared/constants/roomAmenities';
import { AmenityIcon } from '@/shared/components/ui/AmenityBadge';
import { getProvinces, getWardsByProvinceId } from '@/shared/constants/vietnamLocations';

export interface RoomFilterValues {
  keyword: string;
  district: string;
  provinceId?: number;
  wardId?: number;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  amenityIds: number[];
  amenitiesMask?: number;
  zones: CircleZone[];
}

export interface RoomFilterSidebarProps {
  values: RoomFilterValues;
  onChange: (newValues: Partial<RoomFilterValues>) => void;
  onReset: () => void;
  onOpenDrawModal: () => void;
}

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
  const provinces = getProvinces();
  const availableWards = values.provinceId ? getWardsByProvinceId(values.provinceId) : [];

  const handleToggleAmenity = (bitValue: number) => {
    const currentMask = values.amenitiesMask || 0;
    const isChecked = (currentMask & bitValue) !== 0;
    const newMask = isChecked ? (currentMask ^ bitValue) : (currentMask | bitValue);
    onChange({ amenitiesMask: newMask });
  };

  return (
    <div className="bg-stay-card-bg border border-stay-border rounded-2xl p-5 shadow-sm space-y-5 max-h-[calc(100vh-2rem)] overflow-y-auto custom-modal-scroll">
      {/* Tiêu đề & Nút đặt lại (Sticky top bên trong sidebar) */}
      <div className="flex items-center justify-between pb-3 border-b border-stay-border sticky top-0 bg-stay-card-bg z-10 -mx-1 px-1">
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
        <div>
          <Button
            type="primary"
            icon={<Pencil className="w-3.5 h-3.5" />}
            onClick={onOpenDrawModal}
            className="w-full h-9 text-xs font-semibold rounded-lg bg-stay-primary hover:bg-stay-primary-hover text-white shadow-sm flex items-center justify-center gap-1.5"
          >
            Vẽ vùng trên bản đồ
          </Button>
        </div>
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

      {/* Khu vực Tỉnh / Thành phố & Phường / Xã */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-stay-text">
          Tỉnh / Thành phố & Phường / Xã
        </label>
        <Select
          showSearch
          allowClear
          placeholder="Chọn Tỉnh / TP"
          optionFilterProp="label"
          value={values.provinceId}
          onChange={(val) =>
            onChange({
              provinceId: val,
              wardId: undefined,
              district: val ? provinces.find((p) => p.id === val)?.name || '' : '',
            })
          }
          options={provinces.map((p) => ({ value: p.id, label: p.name }))}
          className="w-full h-9"
        />

        <Select
          showSearch
          allowClear
          disabled={!values.provinceId}
          placeholder={values.provinceId ? 'Chọn Phường / Xã' : 'Chọn Tỉnh / TP trước'}
          optionFilterProp="label"
          value={values.wardId}
          onChange={(val) => onChange({ wardId: val })}
          options={availableWards.map((w) => ({ value: w.id, label: w.name }))}
          className="w-full h-9"
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
                className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${isSelected
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
                className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${isSelected
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

      {/* Tiện ích phòng (16 tiện ích chuẩn) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-stay-text flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-stay-primary" />
            Tiện ích phòng
          </label>
          {Boolean(values.amenitiesMask && values.amenitiesMask > 0) && (
            <span className="text-[11px] text-stay-primary font-semibold">
              Đã lọc tiện ích
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap max-h-56 overflow-y-auto pr-1">
          {ROOM_AMENITIES.map((amenity) => {
            const isChecked = Boolean(
              values.amenitiesMask && (values.amenitiesMask & amenity.bitValue) !== 0
            );
            return (
              <button
                key={amenity.key}
                type="button"
                onClick={() => handleToggleAmenity(amenity.bitValue)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer font-medium flex items-center gap-1.5 ${
                  isChecked
                    ? 'bg-stay-primary text-white border-stay-primary shadow-xs'
                    : 'bg-stay-bg-app text-stay-text-secondary border-stay-border hover:border-stay-primary/50'
                }`}
              >
                <AmenityIcon
                  name={amenity.iconName}
                  size={13}
                  className={isChecked ? 'text-white' : 'text-stay-text-muted'}
                />
                <span>{amenity.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoomFilterSidebar;
