import React from 'react';
import { Search } from 'lucide-react';
import { Input, Select } from '@/shared/components';

interface BuildingFilterProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  floorFilter: number | undefined;
  onFloorFilterChange: (val: number | undefined) => void;
}

export const BuildingFilter: React.FC<BuildingFilterProps> = ({
  keyword,
  onKeywordChange,
  floorFilter,
  onFloorFilterChange,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-stay-card-bg border border-stay-border flex flex-col sm:flex-row items-center gap-3">
      <Input
        placeholder="Tìm kiếm theo tên tòa nhà hoặc địa chỉ..."
        prefix={<Search className="w-4 h-4 text-stay-text-muted" />}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        allowClear
        className="w-full sm:max-w-md"
      />
      <Select
        placeholder="Lọc số tầng"
        value={floorFilter}
        onChange={onFloorFilterChange}
        allowClear
        className="w-full sm:w-44"
        options={[
          { label: 'Tất cả số tầng', value: undefined },
          { label: '4 tầng', value: 4 },
          { label: '5 tầng', value: 5 },
          { label: '6 tầng', value: 6 },
        ]}
      />
    </div>
  );
};
