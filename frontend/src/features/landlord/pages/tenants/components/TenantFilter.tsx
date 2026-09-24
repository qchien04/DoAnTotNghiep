import React from 'react';
import { Search } from 'lucide-react';
import { Input, Select } from '@/shared/components';
import { Building } from '@/shared/types/landlord';

interface TenantFilterProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  buildingId: string | undefined;
  onBuildingIdChange: (val: string | undefined) => void;
  buildings: Building[];
}

export const TenantFilter: React.FC<TenantFilterProps> = ({
  keyword,
  onKeywordChange,
  buildingId,
  onBuildingIdChange,
  buildings,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Tìm theo tên khách, SĐT, số CCCD hoặc số phòng..."
        prefix={<Search className="w-4 h-4 text-stay-text-muted" />}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        allowClear
        className="w-full sm:w-80 h-10"
      />

      <Select
        placeholder="Lọc theo tòa nhà"
        value={buildingId}
        onChange={(val) => onBuildingIdChange(val)}
        allowClear
        className="w-full sm:w-60 h-10"
        options={buildings.map((b: any) => ({
          label: `${b.buildingCode || b.code || ''} - ${b.name}`,
          value: b.id,
        }))}
      />
    </div>
  );
};
