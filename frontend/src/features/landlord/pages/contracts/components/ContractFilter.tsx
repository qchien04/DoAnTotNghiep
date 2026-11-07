import React from 'react';
import { Search, RotateCcw, Plus } from 'lucide-react';
import { Input, Select, Button } from '@/shared/components';
import { ContractStatus } from '@/shared/types/landlord';

interface ContractFilterProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  statusFilter: ContractStatus | 'ALL';
  onStatusFilterChange: (val: ContractStatus | 'ALL') => void;
  onReset?: () => void;
  onOpenCreate?: () => void;
}

export const ContractFilter: React.FC<ContractFilterProps> = ({
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusFilterChange,
  onReset,
  onOpenCreate,
}) => {
  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onKeywordChange('');
      onStatusFilterChange('ALL');
    }
  };

  return (
    <div className="bg-stay-card-bg p-3.5 sm:p-4 rounded-[8px] border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
      <Input
        placeholder="Tìm tên khách, số phòng hoặc hợp đồng..."
        prefix={<Search className="w-4 h-4 text-[#8C8C8C]" />}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        allowClear
        className="w-full sm:w-[320px] h-[40px] rounded-[8px]"
      />

      <Select
        value={statusFilter}
        onChange={(val) => onStatusFilterChange(val as ContractStatus | 'ALL')}
        className="w-full sm:w-[200px] h-[40px] rounded-[8px]"
        options={[
          { label: 'Tất cả trạng thái', value: 'ALL' },
          { label: 'Đang hiệu lực', value: 'ACTIVE' },
          { label: 'Đã thanh lý', value: 'TERMINATED' },
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
            Tạo hợp đồng
          </Button>
        </div>
      )}
    </div>
  );
};
