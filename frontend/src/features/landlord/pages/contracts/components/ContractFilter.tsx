import React from 'react';
import { Search } from 'lucide-react';
import { Input, Select } from '@/shared/components';
import { ContractStatus } from '@/shared/types/landlord';

interface ContractFilterProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  statusFilter: ContractStatus | 'ALL';
  onStatusFilterChange: (val: ContractStatus | 'ALL') => void;
}

export const ContractFilter: React.FC<ContractFilterProps> = ({
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-stay-card-bg border border-stay-border flex flex-wrap items-center gap-3">
      <Input
        placeholder="Tìm theo mã hợp đồng, tên khách hoặc phòng..."
        prefix={<Search className="w-4 h-4 text-stay-text-muted" />}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        allowClear
        className="w-full sm:w-80 h-10"
      />

      <Select
        value={statusFilter}
        onChange={(val) => onStatusFilterChange(val as ContractStatus | 'ALL')}
        className="w-full sm:w-52 h-10"
        options={[
          { label: 'Tất cả trạng thái', value: 'ALL' },
          { label: 'Đang hiệu lực', value: 'ACTIVE' },
          { label: 'Sắp hết hạn', value: 'EXPIRING_SOON' },
          { label: 'Đã thanh lý', value: 'TERMINATED' },
        ]}
      />
    </div>
  );
};
