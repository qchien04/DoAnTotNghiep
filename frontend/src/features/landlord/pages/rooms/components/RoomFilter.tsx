import React from 'react';
import { Search, RotateCcw, Plus } from 'lucide-react';
import { Input, Select, Button } from '@/shared/components';
import { Building, RoomStatus } from '@/shared/types/landlord';

interface RoomFilterProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  buildingId: string | undefined;
  onBuildingIdChange: (val: string | undefined) => void;
  status: RoomStatus | 'ALL';
  onStatusChange: (val: RoomStatus | 'ALL') => void;
  buildings: Building[];
  onReset?: () => void;
  onOpenCreate?: () => void;
}

export const RoomFilter: React.FC<RoomFilterProps> = ({
  keyword,
  onKeywordChange,
  buildingId,
  onBuildingIdChange,
  status,
  onStatusChange,
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
      onStatusChange('ALL');
    }
  };

  return (
    <div className="bg-stay-card-bg p-3.5 sm:p-4 rounded-[8px] border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
      <Input
        placeholder="Tìm theo tên phòng hoặc mã phòng..."
        prefix={<Search className="w-4 h-4 text-[#8C8C8C]" />}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        allowClear
        className="w-full sm:w-[320px] h-[40px] rounded-[8px]"
      />

      <Select
        placeholder="Chọn tòa nhà"
        value={buildingId}
        onChange={onBuildingIdChange}
        allowClear
        className="w-full sm:w-[200px] h-[40px] rounded-[8px]"
        options={buildings.map((b: any) => ({
          label: b.name,
          value: b.id,
        }))}
      />

      <Select
        value={status}
        onChange={onStatusChange}
        className="w-full sm:w-[190px] h-[40px] rounded-[8px]"
        options={[
          { label: 'Tất cả trạng thái', value: 'ALL' },
          { label: 'Còn trống', value: 'AVAILABLE' },
          { label: 'Đang thuê', value: 'OCCUPIED' },
          { label: 'Đang sửa chữa', value: 'UNDER_MAINTENANCE' },
          { label: 'Ngừng sử dụng', value: 'STOPPED' },
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
            Thêm phòng
          </Button>
        </div>
      )}
    </div>
  );
};
