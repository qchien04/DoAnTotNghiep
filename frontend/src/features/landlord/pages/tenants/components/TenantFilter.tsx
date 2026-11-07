import React from 'react';
import { Search, RotateCcw, Plus } from 'lucide-react';
import { Input, Select, Button } from '@/shared/components';
import { Building } from '@/shared/types/landlord';

interface TenantFilterProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  buildingId: string | undefined;
  onBuildingIdChange: (val: string | undefined) => void;
  buildings: Building[];
  onReset?: () => void;
  onOpenCreate?: () => void;
}

export const TenantFilter: React.FC<TenantFilterProps> = ({
  keyword,
  onKeywordChange,
  buildingId,
  onBuildingIdChange,
  buildings,
  onReset,
  onOpenCreate,
}) => {
  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onKeywordChange('');
      onBuildingIdChange(undefined);
    }
  };

  return (
    <div className="bg-stay-card-bg p-4 rounded-xl border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
      <Input
        placeholder="Tìm tên khách, SĐT, CCCD, phòng..."
        prefix={<Search className="w-4 h-4 text-[#8C8C8C]" />}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        allowClear
        className="w-full sm:w-[320px] h-[40px] rounded-[8px]"
      />

      <Select
        placeholder="Lọc theo tòa nhà"
        value={buildingId}
        onChange={(val) => onBuildingIdChange(val)}
        allowClear
        className="w-full sm:w-[220px] h-[40px] rounded-[8px]"
        options={buildings.map((b: any) => ({
          label: b.name,
          value: b.id,
        }))}
      />

      <Button
        icon={<RotateCcw className="w-4 h-4 text-stay-text-secondary" />}
        onClick={handleReset}
        className="h-[40px] rounded-[8px] border-[#D7D7DB] dark:border-stay-border text-stay-text hover:text-stay-primary font-medium"
      >
        Đặt lại
      </Button>

      {onOpenCreate && (
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={onOpenCreate}
          className="ml-auto bg-stay-primary hover:bg-stay-primary-hover h-[40px] px-4 font-medium"
        >
          Thêm khách thuê
        </Button>
      )}
    </div>
  );
};
