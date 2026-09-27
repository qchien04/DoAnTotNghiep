import React from 'react';
import { Search, RotateCcw, Check } from 'lucide-react';
import { Input, Select, Button, Slider } from '@/shared/components';

interface SearchFilterProps {
  searchMode: 'ROOMMATE' | 'WHOLE_ROOM';
  onSearchModeChange: (mode: 'ROOMMATE' | 'WHOLE_ROOM') => void;
  keyword: string;
  onKeywordChange: (val: string) => void;
  district?: string;
  onDistrictChange: (val?: string) => void;
  postType: 'ALL' | 'HAS_ROOM' | 'SEARCHING_ROOM';
  onPostTypeChange: (val: 'ALL' | 'HAS_ROOM' | 'SEARCHING_ROOM') => void;
  priceRange: [number, number];
  onPriceRangeChange: (val: [number, number]) => void;
  genderFilter: 'ALL' | 'MALE' | 'FEMALE';
  onGenderFilterChange: (val: 'ALL' | 'MALE' | 'FEMALE') => void;
  noSmokingFilter: boolean | null;
  onNoSmokingFilterChange: (val: boolean | null) => void;
  sleepTimeFilter: 'ALL' | 'BEFORE_24H' | 'AFTER_24H';
  onSleepTimeFilterChange: (val: 'ALL' | 'BEFORE_24H' | 'AFTER_24H') => void;
  noPetFilter: boolean | null;
  onNoPetFilterChange: (val: boolean | null) => void;
  cookingFilter: boolean | null;
  onCookingFilterChange: (val: boolean | null) => void;
  totalResults: number;
  priceError: string | null;
  onApply: () => void;
  onReset: () => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchMode,
  onSearchModeChange,
  keyword,
  onKeywordChange,
  district,
  onDistrictChange,
  postType,
  onPostTypeChange,
  priceRange,
  onPriceRangeChange,
  genderFilter,
  onGenderFilterChange,
  noSmokingFilter,
  onNoSmokingFilterChange,
  sleepTimeFilter,
  onSleepTimeFilterChange,
  noPetFilter,
  onNoPetFilterChange,
  cookingFilter,
  onCookingFilterChange,
  totalResults,
  priceError,
  onApply,
  onReset,
}) => {
  return (
    <div className="bg-stay-card-bg border border-stay-border rounded-xl p-5 space-y-4">
      {/* Search Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-stay-border pb-3">
        <button
          type="button"
          onClick={() => onSearchModeChange('ROOMMATE')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            searchMode === 'ROOMMATE'
              ? 'bg-stay-primary text-white'
              : 'text-stay-text-secondary hover:text-stay-text hover:bg-stay-bg-app'
          }`}
        >
          Tìm người ở ghép
        </button>
        <button
          type="button"
          onClick={() => onSearchModeChange('WHOLE_ROOM')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            searchMode === 'WHOLE_ROOM'
              ? 'bg-stay-primary text-white'
              : 'text-stay-text-secondary hover:text-stay-text hover:bg-stay-bg-app'
          }`}
        >
          Tìm phòng trọ nguyên căn
        </button>
      </div>

      {/* Row 1: Keyword, District, Post Type, Price Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-xs font-semibold text-stay-text block mb-1.5">
            Từ khóa khu vực / Trường ĐH / Tuyến đường
          </label>
          <Input
            placeholder="Nhập Cầu Giấy, Bách Khoa, Duy Tân..."
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            allowClear
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stay-text block mb-1.5">
            Quận / Huyện
          </label>
          <Select
            placeholder="Tất cả quận huyện"
            value={district}
            onChange={onDistrictChange}
            allowClear
            className="w-full"
            options={[
              { label: 'Tất cả quận huyện', value: undefined },
              { label: 'Cầu Giấy', value: 'Cầu Giấy' },
              { label: 'Hai Bà Trưng', value: 'Hai Bà Trưng' },
              { label: 'Đống Đa', value: 'Đống Đa' },
              { label: 'Thanh Xuân', value: 'Thanh Xuân' },
              { label: 'Nam Từ Liêm', value: 'Nam Từ Liêm' },
              { label: 'Bắc Từ Liêm', value: 'Bắc Từ Liêm' },
              { label: 'Hà Đông', value: 'Hà Đông' },
              { label: 'Ba Đình', value: 'Ba Đình' },
            ]}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stay-text block mb-1.5">
            Loại tin đăng
          </label>
          <Select
            value={postType}
            onChange={onPostTypeChange}
            className="w-full"
            options={[
              { label: 'Tất cả loại tin', value: 'ALL' },
              { label: 'Đã có sẵn phòng trọ', value: 'HAS_ROOM' },
              { label: 'Chưa có phòng (Tìm bạn cùng thuê)', value: 'SEARCHING_ROOM' },
            ]}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-stay-text font-semibold mb-1">
            <span>Khoảng giá share / người:</span>
            <span className="text-stay-primary">
              {(priceRange[0] / 1000000).toFixed(1)} - {(priceRange[1] / 1000000).toFixed(1)} triệu
            </span>
          </div>
          <Slider
            range
            min={500000}
            max={6000000}
            step={100000}
            value={priceRange}
            onChange={(val) => onPriceRangeChange(val as [number, number])}
          />
        </div>
      </div>

      {/* Row 2: Lifestyle Filters (UC11) */}
      <div className="pt-3 border-t border-stay-border">
        <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block mb-2.5">
          Bộ lọc tiêu chí lối sống & sinh hoạt:
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <span className="text-[11px] text-slate-500 block mb-1">Giới tính:</span>
            <Select
              value={genderFilter}
              onChange={onGenderFilterChange}
              className="w-full text-xs"
              options={[
                { label: 'Tất cả giới tính', value: 'ALL' },
                { label: 'Chỉ tìm Nam', value: 'MALE' },
                { label: 'Chỉ tìm Nữ', value: 'FEMALE' },
              ]}
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block mb-1">Hút thuốc lá:</span>
            <Select
              value={noSmokingFilter === null ? 'ALL' : noSmokingFilter ? 'NO_SMOKE' : 'SMOKE'}
              onChange={(val) => {
                if (val === 'ALL') onNoSmokingFilterChange(null);
                else if (val === 'NO_SMOKE') onNoSmokingFilterChange(true);
                else onNoSmokingFilterChange(false);
              }}
              className="w-full text-xs"
              options={[
                { label: 'Không yêu cầu', value: 'ALL' },
                { label: 'Không hút thuốc', value: 'NO_SMOKE' },
                { label: 'Hút thuốc', value: 'SMOKE' },
              ]}
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block mb-1">Giờ giấc thức - ngủ:</span>
            <Select
              value={sleepTimeFilter}
              onChange={onSleepTimeFilterChange}
              className="w-full text-xs"
              options={[
                { label: 'Tất cả thói quen', value: 'ALL' },
                { label: 'Đi ngủ trước 24h', value: 'BEFORE_24H' },
                { label: 'Ngủ sau 24h (Cú đêm)', value: 'AFTER_24H' },
              ]}
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block mb-1">Nuôi thú cưng:</span>
            <Select
              value={noPetFilter === null ? 'ALL' : noPetFilter ? 'NO_PET' : 'PET'}
              onChange={(val) => {
                if (val === 'ALL') onNoPetFilterChange(null);
                else if (val === 'NO_PET') onNoPetFilterChange(true);
                else onNoPetFilterChange(false);
              }}
              className="w-full text-xs"
              options={[
                { label: 'Không yêu cầu', value: 'ALL' },
                { label: 'Không nuôi thú cưng', value: 'NO_PET' },
                { label: 'Có nuôi thú cưng', value: 'PET' },
              ]}
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block mb-1">Nấu ăn tại phòng:</span>
            <Select
              value={cookingFilter === null ? 'ALL' : cookingFilter ? 'COOK' : 'NO_COOK'}
              onChange={(val) => {
                if (val === 'ALL') onCookingFilterChange(null);
                else if (val === 'COOK') onCookingFilterChange(true);
                else onCookingFilterChange(false);
              }}
              className="w-full text-xs"
              options={[
                { label: 'Không yêu cầu', value: 'ALL' },
                { label: 'Thường xuyên nấu ăn', value: 'COOK' },
                { label: 'Ít / Không nấu ăn', value: 'NO_COOK' },
              ]}
            />
          </div>
        </div>
      </div>

      {priceError && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs">
          {priceError}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-stay-text-secondary">
          Tìm thấy <strong>{totalResults}</strong> bài đăng phù hợp
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={onReset}
          >
            Đặt lại bộ lọc
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Check className="w-3.5 h-3.5" />}
            onClick={onApply}
          >
            Áp dụng bộ lọc và Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  );
};
