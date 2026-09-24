import React from 'react';
import { Search } from 'lucide-react';
import { Input, Select } from '@/shared/components';
import { Building, RoomStatus } from '@/shared/types/landlord';

interface RoomFilterProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  buildingId: string | undefined;
  onBuildingIdChange: (val: string | undefined) => void;
  status: RoomStatus | 'ALL';
  onStatusChange: (val: RoomStatus | 'ALL') => void;
  buildings: Building[];
}

export const RoomFilter: React.FC<RoomFilterProps> = ({
  keyword,
  onKeywordChange,
  buildingId,
  onBuildingIdChange,
  status,
  onStatusChange,
  buildings,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Tìm theo mã phòng hoặc tên phòng..."
        prefix={<Search className="w-4 h-4 text-stay-text-muted" />}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        allowClear
        className="w-full sm:w-64"
      />

      <Select
        placeholder="Chọn tòa nhà"
        value={buildingId}
        onChange={onBuildingIdChange}
        allowClear
        className="w-full sm:w-52"
        options={buildings.map((b: any) => ({
          label: `${b.buildingCode || b.code || ''} - ${b.name}`,
          value: b.id,
        }))}
      />

      <Select
        value={status}
        onChange={onStatusChange}
        className="w-full sm:w-44"
        options={[
          { label: 'Tất cả trạng thái', value: 'ALL' },
          { label: 'Còn trống', value: 'AVAILABLE' },
          { label: 'Đang thuê', value: 'OCCUPIED' },
          { label: 'Đang sửa chữa', value: 'UNDER_MAINTENANCE' },
          { label: 'Ngừng sử dụng', value: 'STOPPED' },
        ]}
      />
    </div>
  );
};
