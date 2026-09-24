import React from 'react';
import { Select } from '@/shared/components';
import { BillStatus } from '@/shared/types/landlord';

interface BillFilterProps {
  billingMonth: string;
  onBillingMonthChange: (val: string) => void;
  statusFilter: BillStatus | 'ALL';
  onStatusFilterChange: (val: BillStatus | 'ALL') => void;
}

export const BillFilter: React.FC<BillFilterProps> = ({
  billingMonth,
  onBillingMonthChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={billingMonth}
        onChange={(val) => onBillingMonthChange(val)}
        className="w-full sm:w-56 h-10"
        options={[
          { label: 'Kỳ Tháng 10/2026', value: '10/2026' },
          { label: 'Kỳ Tháng 09/2026', value: '09/2026' },
          { label: 'Kỳ Tháng 08/2026', value: '08/2026' },
          { label: 'Kỳ Tháng 07/2026', value: '07/2026' },
        ]}
      />

      <Select
        value={statusFilter}
        onChange={(val) => onStatusFilterChange(val as BillStatus | 'ALL')}
        className="w-full sm:w-56 h-10"
        options={[
          { label: 'Tất cả trạng thái', value: 'ALL' },
          { label: 'Chờ thanh toán', value: 'UNPAID' },
          { label: 'Thanh toán một phần', value: 'PARTIALLY_PAID' },
          { label: 'Đã thanh toán', value: 'PAID' },
          { label: 'Quá hạn nộp', value: 'OVERDUE' },
          { label: 'Đã hủy', value: 'CANCELLED' },
        ]}
      />
    </div>
  );
};
