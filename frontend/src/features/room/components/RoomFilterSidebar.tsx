import React, { useMemo } from 'react';
import { Input, InputNumber, Select, Slider, Button, Tooltip } from 'antd';
import {
  Search,
  RotateCcw,
  Pencil,
  SlidersHorizontal,
  Sparkles,
  MapPin,
  X,
  Check,
} from 'lucide-react';
import { CircleZone } from '../types/roomSearch';
import { ROOM_AMENITIES } from '@/shared/constants/roomAmenities';
import { AmenityIcon } from '@/shared/components/ui/AmenityBadge';
import {
  getProvinces,
  getWardsByProvinceId,
  getProvinceName,
  getWardName,
} from '@/shared/constants/vietnamLocations';

export interface RoomFilterValues {
  keyword: string;
  district: string;
  provinceId?: number;
  wardId?: number;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
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
  { label: '8 - 12 tr', min: 8000000, max: 12000000 },
  { label: '> 12 tr', min: 12000000, max: 15000000 },
];

const AREA_PRESETS = [
  { label: 'Tất cả', min: 15, max: 80 },
  { label: '< 20 m²', min: 15, max: 20 },
  { label: '20 - 30 m²', min: 20, max: 30 },
  { label: '30 - 45 m²', min: 30, max: 45 },
  { label: '> 45 m²', min: 45, max: 80 },
];

const POPULAR_PROVINCES = [
  { id: 1, name: 'Hà Nội' },
  { id: 79, name: 'TP. HCM' },
  { id: 48, name: 'Đà Nẵng' },
];

export const RoomFilterSidebar: React.FC<RoomFilterSidebarProps> = ({
  values,
  onChange,
  onReset,
  onOpenDrawModal,
}) => {
  const provinces = useMemo(() => getProvinces(), []);
  const availableWards = useMemo(
    () => (values.provinceId ? getWardsByProvinceId(values.provinceId) : []),
    [values.provinceId]
  );

  // Tính số lượng bộ lọc đang hoạt động
  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; onRemove: () => void }[] = [];

    if (values.keyword?.trim()) {
      list.push({
        key: 'keyword',
        label: `Từ khóa: "${values.keyword.trim()}"`,
        onRemove: () => onChange({ keyword: '' }),
      });
    }

    if (values.provinceId) {
      const pName = getProvinceName(values.provinceId) || 'Tỉnh / TP';
      list.push({
        key: 'province',
        label: pName,
        onRemove: () => onChange({ provinceId: undefined, wardId: undefined }),
      });
    }

    if (values.wardId) {
      const wName = getWardName(values.wardId) || 'Phường / Xã';
      list.push({
        key: 'ward',
        label: wName,
        onRemove: () => onChange({ wardId: undefined }),
      });
    }

    if (values.minPrice > 0 || values.maxPrice < 15000000) {
      const minText = (values.minPrice / 1000000).toFixed(1);
      const maxText = (values.maxPrice / 1000000).toFixed(1);
      list.push({
        key: 'price',
        label: `${minText} - ${maxText} tr`,
        onRemove: () => onChange({ minPrice: 0, maxPrice: 15000000 }),
      });
    }

    if (values.minArea > 15 || values.maxArea < 80) {
      list.push({
        key: 'area',
        label: `${values.minArea} - ${values.maxArea} m²`,
        onRemove: () => onChange({ minArea: 15, maxArea: 80 }),
      });
    }

    if (values.zones && values.zones.length > 0) {
      list.push({
        key: 'zones',
        label: `${values.zones.length} vùng bản đồ`,
        onRemove: () => onChange({ zones: [] }),
      });
    }

    const mask = values.amenitiesMask || 0;
    if (mask > 0) {
      const count = ROOM_AMENITIES.filter((a) => (mask & a.bitValue) !== 0).length;
      list.push({
        key: 'amenities',
        label: `${count} tiện ích`,
        onRemove: () => onChange({ amenitiesMask: 0 }),
      });
    }

    return list;
  }, [values, onChange]);

  const selectedAmenityCount = useMemo(() => {
    const mask = values.amenitiesMask || 0;
    if (!mask) return 0;
    return ROOM_AMENITIES.filter((a) => (mask & a.bitValue) !== 0).length;
  }, [values.amenitiesMask]);

  const handleToggleAmenity = (bitValue: number) => {
    const currentMask = values.amenitiesMask || 0;
    const isChecked = (currentMask & bitValue) !== 0;
    const newMask = isChecked ? currentMask ^ bitValue : currentMask | bitValue;
    onChange({ amenitiesMask: newMask });
  };

  const handleSelectAllAmenities = () => {
    // 16 bit: (1 << 16) - 1 = 65535
    onChange({ amenitiesMask: (1 << 16) - 1 });
  };

  const handleClearAllAmenities = () => {
    onChange({ amenitiesMask: 0 });
  };

  return (
    <div className="bg-stay-card-bg border border-stay-border rounded-2xl shadow-sm flex flex-col h-auto max-h-[calc(100vh-6rem)] overflow-hidden transition-colors">
      {/* 1. Header cố định trên đầu Sidebar */}
      <div className="p-4 sm:p-5 pb-3.5 border-b border-stay-border shrink-0 bg-stay-card-bg z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stay-primary-subtle text-stay-primary flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stay-text m-0 flex items-center gap-2">
                Bộ Lọc Tìm Kiếm
                {activeFilters.length > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stay-primary-subtle text-stay-primary border border-stay-primary/20">
                    {activeFilters.length}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            disabled={activeFilters.length === 0}
            className={`text-xs flex items-center gap-1.5 transition font-medium cursor-pointer ${activeFilters.length > 0
              ? 'text-stay-text-secondary hover:text-stay-primary'
              : 'text-stay-text-muted cursor-not-allowed opacity-50'
              }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      {/* 2. Thân Sidebar - Cuộn linh hoạt bên trong khi dài quá */}
      <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 custom-sidebar-scroll">
        {/* Widget Khoanh Vùng Bản Đồ Không Gian (Spatial Mini-Map Widget) */}
        <div className="rounded-xl border border-stay-border bg-stay-bg-app p-3.5 relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stay-primary" />
              <span className="text-xs font-bold text-stay-text">Khoanh vùng trên bản đồ</span>
            </div>
            {values.zones && values.zones.length > 0 && (
              <span className="text-[11px] font-semibold text-stay-match bg-stay-match-subtle px-2 py-0.5 rounded-full border border-stay-match/20">
                {values.zones.length} vùng đã vẽ
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              icon={<Pencil className="w-3.5 h-3.5" />}
              onClick={onOpenDrawModal}
              className="flex-1 h-9 text-xs font-semibold rounded-lg bg-stay-primary hover:bg-stay-primary-hover text-white shadow-sm flex items-center justify-center gap-1.5"
            >
              {values.zones && values.zones.length > 0 ? 'Chỉnh sửa vùng vẽ' : 'Vẽ vùng trên bản đồ'}
            </Button>
            {values.zones && values.zones.length > 0 && (
              <Tooltip title="Xóa các vùng đã vẽ">
                <Button
                  danger
                  icon={<X className="w-3.5 h-3.5" />}
                  onClick={() => onChange({ zones: [] })}
                  className="h-9 px-3 rounded-lg"
                />
              </Tooltip>
            )}
          </div>
        </div>

        {/* Tìm kiếm từ khóa */}
        <div>
          <label className="block text-xs font-bold text-stay-text mb-1.5">
            Từ khóa tìm kiếm
          </label>
          <Input
            prefix={<Search className="w-4 h-4 text-stay-text-muted" />}
            placeholder="Tên phòng, tên đường, tòa nhà..."
            value={values.keyword}
            onChange={(e) => onChange({ keyword: e.target.value })}
            allowClear
            className="h-9.5 rounded-xl border-stay-border hover:border-stay-primary focus:border-stay-primary"
          />
        </div>

        {/* Khu vực Tỉnh / Thành phố & Phường / Xã */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stay-text">
              Tỉnh / Thành phố & Phường / Xã
            </label>
          </div>

          {/* Quick city chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {POPULAR_PROVINCES.map((prov) => {
              const isSelected = values.provinceId === prov.id;
              return (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      provinceId: isSelected ? undefined : prov.id,
                      wardId: undefined,
                      district: isSelected ? '' : prov.name,
                    })
                  }
                  className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${isSelected
                    ? 'bg-stay-primary text-white border-stay-primary shadow-xs'
                    : 'bg-stay-bg-app text-stay-text-secondary border-stay-border hover:border-stay-primary/50'
                    }`}
                >
                  {prov.name}
                </button>
              );
            })}
          </div>

          <Select
            showSearch
            allowClear
            placeholder="Chọn Tỉnh / Thành phố"
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
            className="w-full h-9.5"
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
            className="w-full h-9.5"
          />
        </div>

        {/* Khoảng giá thuê */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stay-text">Khoảng giá thuê</label>
            <span className="text-xs font-bold text-stay-primary">
              {values.minPrice === 0 && values.maxPrice >= 15000000
                ? 'Tất cả mức giá'
                : `${(values.minPrice / 1000000).toFixed(1)} - ${(values.maxPrice / 1000000).toFixed(1)} tr/tháng`}
            </span>
          </div>

          {/* Ô nhập khoảng giá trực tiếp */}
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div>
              <span className="text-[11px] text-stay-text-secondary block mb-1 font-medium">Giá tối thiểu</span>
              <InputNumber
                min={0}
                max={values.maxPrice || 50000000}
                step={500000}
                value={values.minPrice}
                formatter={(val) => `${val ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : 0)}
                onChange={(val) => onChange({ minPrice: val ?? 0 })}
                placeholder="Từ (VNĐ)"
                suffix={<span className="text-[11px] text-stay-text-muted">đ</span>}
                className="w-full !rounded-lg h-8 text-xs border-stay-border"
              />
            </div>
            <div>
              <span className="text-[11px] text-stay-text-secondary block mb-1 font-medium">Giá tối đa</span>
              <InputNumber
                min={values.minPrice || 0}
                max={50000000}
                step={500000}
                value={values.maxPrice}
                formatter={(val) => `${val ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : 15000000)}
                onChange={(val) => onChange({ maxPrice: val ?? 15000000 })}
                placeholder="Đến (VNĐ)"
                suffix={<span className="text-[11px] text-stay-text-muted">đ</span>}
                className="w-full !rounded-lg h-8 text-xs border-stay-border"
              />
            </div>
          </div>

          <Slider
            range
            min={0}
            max={15000000}
            step={500000}
            value={[values.minPrice, Math.min(values.maxPrice, 15000000)]}
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
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${isSelected
                    ? 'bg-stay-primary text-white border-stay-primary shadow-xs'
                    : 'bg-stay-bg-app text-stay-text-secondary border-stay-border hover:border-stay-primary/50'
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
            <span className="text-xs font-bold text-stay-primary">
              {values.minArea <= 15 && values.maxArea >= 80
                ? 'Tất cả diện tích'
                : `${values.minArea} - ${values.maxArea} m²`}
            </span>
          </div>

          {/* Ô nhập diện tích trực tiếp */}
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div>
              <span className="text-[11px] text-stay-text-secondary block mb-1 font-medium">Từ (m²)</span>
              <InputNumber
                min={0}
                max={values.maxArea || 200}
                step={1}
                value={values.minArea}
                onChange={(val) => onChange({ minArea: val ?? 15 })}
                placeholder="15"
                suffix={<span className="text-[11px] text-stay-text-muted">m²</span>}
                className="w-full !rounded-lg h-8 text-xs border-stay-border"
              />
            </div>
            <div>
              <span className="text-[11px] text-stay-text-secondary block mb-1 font-medium">Đến (m²)</span>
              <InputNumber
                min={values.minArea || 0}
                max={300}
                step={1}
                value={values.maxArea}
                onChange={(val) => onChange({ maxArea: val ?? 80 })}
                placeholder="80"
                suffix={<span className="text-[11px] text-stay-text-muted">m²</span>}
                className="w-full !rounded-lg h-8 text-xs border-stay-border"
              />
            </div>
          </div>

          <Slider
            range
            min={15}
            max={80}
            step={1}
            value={[Math.max(15, values.minArea), Math.min(values.maxArea, 80)]}
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
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${isSelected
                    ? 'bg-stay-primary text-white border-stay-primary shadow-xs'
                    : 'bg-stay-bg-app text-stay-text-secondary border-stay-border hover:border-stay-primary/50'
                    }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tiện ích phòng (16 tiện ích chuẩn hóa 16-bit Bitmask) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stay-primary" />
              <label className="text-xs font-bold text-stay-text">
                Tiện ích phòng
              </label>
              {selectedAmenityCount > 0 && (
                <span className="text-[11px] font-semibold text-stay-primary bg-stay-primary-subtle px-1.5 py-0.2 rounded border border-stay-primary/20">
                  {selectedAmenityCount}/16
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllAmenities}
                className="text-[11px] text-stay-text-secondary hover:text-stay-primary font-medium cursor-pointer transition"
              >
                Chọn hết
              </button>
              {selectedAmenityCount > 0 && (
                <>
                  <span className="text-stay-border text-xs">•</span>
                  <button
                    type="button"
                    onClick={handleClearAllAmenities}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-medium cursor-pointer transition"
                  >
                    Bỏ chọn
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pr-1">
            {ROOM_AMENITIES.map((amenity) => {
              const isChecked = Boolean(
                values.amenitiesMask && (values.amenitiesMask & amenity.bitValue) !== 0
              );
              return (
                <button
                  key={amenity.key}
                  type="button"
                  onClick={() => handleToggleAmenity(amenity.bitValue)}
                  className={`text-xs px-2.5 py-2 rounded-xl border transition cursor-pointer font-medium flex items-center justify-between text-left gap-1.5 ${isChecked
                    ? 'bg-stay-primary text-white border-stay-primary shadow-xs'
                    : 'bg-stay-bg-app text-stay-text-secondary border-stay-border hover:border-stay-primary/50'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AmenityIcon
                      name={amenity.iconName}
                      size={14}
                      className={isChecked ? 'text-white' : 'text-stay-text-muted'}
                    />
                    <span className="truncate text-[11px]">{amenity.name}</span>
                  </div>
                  {isChecked && <Check className="w-3 h-3 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Footer cố định dưới đáy Sidebar */}
      <div className="p-3.5 px-4 sm:px-5 border-t border-stay-border shrink-0 bg-stay-bg-app/60 flex items-center justify-between text-xs">
        <span className="text-stay-text-secondary text-[11px]">
          Tự động lọc kết quả
        </span>
        {activeFilters.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] text-stay-primary hover:underline font-semibold cursor-pointer"
          >
            Xóa tất cả bộ lọc ({activeFilters.length})
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomFilterSidebar;
