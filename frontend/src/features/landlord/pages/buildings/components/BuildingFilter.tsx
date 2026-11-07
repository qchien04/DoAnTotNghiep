import React from 'react';
import { Search, RotateCcw, Plus } from 'lucide-react';
import { Input, Select, Button } from '@/shared/components';

interface BuildingFilterProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  floorFilter: number | undefined;
  onFloorFilterChange: (val: number | undefined) => void;
  onReset?: () => void;
  onOpenCreate?: () => void;
}

export const BuildingFilter: React.FC<BuildingFilterProps> = ({
  keyword,
  onKeywordChange,
  floorFilter,
  onFloorFilterChange,
  onReset,
  onOpenCreate,
}) => {
  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onKeywordChange('');
      onFloorFilterChange(undefined);
    }
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-[8px] bg-stay-card-bg border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
      <Input
        placeholder="Tìm kiếm theo tên tòa nhà hoặc địa chỉ..."
        prefix={<Search className="w-4 h-4 text-[#8C8C8C]" />}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        allowClear
        className="w-full sm:w-[340px] h-[40px] rounded-[8px]"
      />
      <Select
        placeholder="Lọc số tầng"
        value={floorFilter}
        onChange={onFloorFilterChange}
        allowClear
        className="w-full sm:w-[200px] h-[40px] rounded-[8px]"
        options={[
          { label: 'Tất cả số tầng', value: undefined },
          { label: '4 tầng', value: 4 },
          { label: '5 tầng', value: 5 },
          { label: '6 tầng', value: 6 },
        ]}
      />
      <Button
        icon={<RotateCcw className="w-4 h-4 text-stay-text-secondary" />}
        onClick={handleReset}
        className="h-[40px] rounded-[8px] border-[#D7D7DB] dark:border-slate-700 text-stay-text hover:text-stay-primary font-medium"
      >
        Đặt lại
      </Button>

      {onOpenCreate && (
        <div className="ml-auto">
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={onOpenCreate}
            className="h-[40px] rounded-[8px] bg-stay-primary hover:bg-stay-primary-hover text-white font-medium"
          >
            Thêm tòa nhà
          </Button>
        </div>
      )}
    </div>
  );
};
