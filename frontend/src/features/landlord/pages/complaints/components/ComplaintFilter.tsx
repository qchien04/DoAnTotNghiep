import React from 'react';
import { Select } from '@/shared/components';
import { ComplaintStatus } from '@/shared/types/landlord';

interface ComplaintFilterProps {
  statusFilter: ComplaintStatus | 'ALL';
  onStatusFilterChange: (val: ComplaintStatus | 'ALL') => void;
}

export const ComplaintFilter: React.FC<ComplaintFilterProps> = ({
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={statusFilter}
        onChange={(val) => onStatusFilterChange(val as ComplaintStatus | 'ALL')}
        className="w-full sm:w-60 h-10"
        options={[
          { label: 'Tất cả trạng thái sự cố', value: 'ALL' },
          { label: 'Mới gửi', value: 'NEW' },
          { label: 'Đang xử lý', value: 'PROCESSING' },
          { label: 'Đã giải quyết', value: 'RESOLVED' },
          { label: 'Từ chối giải quyết', value: 'REJECTED' },
        ]}
      />
    </div>
  );
};
