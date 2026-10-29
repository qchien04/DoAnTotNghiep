import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Select, Button } from '@/shared/components';
import { ComplaintStatus } from '@/shared/types/landlord';

interface ComplaintFilterProps {
  statusFilter: ComplaintStatus | 'ALL';
  onStatusFilterChange: (val: ComplaintStatus | 'ALL') => void;
  onReset?: () => void;
}

export const ComplaintFilter: React.FC<ComplaintFilterProps> = ({
  statusFilter,
  onStatusFilterChange,
  onReset,
}) => {
  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onStatusFilterChange('ALL');
    }
  };

  return (
    <div className="bg-stay-card-bg p-4 rounded-xl border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
      <Select
        value={statusFilter}
        onChange={(val) => onStatusFilterChange(val as ComplaintStatus | 'ALL')}
        className="w-full sm:w-[260px] h-[40px] rounded-[8px]"
        options={[
          { label: 'Tất cả trạng thái sự cố', value: 'ALL' },
          { label: 'Mới gửi', value: 'NEW' },
          { label: 'Đang xử lý', value: 'PROCESSING' },
          { label: 'Đã giải quyết', value: 'RESOLVED' },
          { label: 'Từ chối giải quyết', value: 'REJECTED' },
        ]}
      />

      <Button
        icon={<RotateCcw className="w-4 h-4 text-stay-text-secondary" />}
        onClick={handleReset}
        className="h-[40px] rounded-[8px] border-[#D7D7DB] dark:border-stay-border text-stay-text hover:text-stay-primary font-medium"
      >
        Đặt lại
      </Button>
    </div>
  );
};
