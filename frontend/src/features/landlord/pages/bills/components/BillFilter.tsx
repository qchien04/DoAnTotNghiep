import React from 'react';
import { RotateCcw, Plus } from 'lucide-react';
import { Select, Button } from '@/shared/components';
import { InvoiceStatus } from '@/shared/types/landlord';

interface BillFilterProps {
  billingMonth: string;
  onBillingMonthChange: (val: string) => void;
  statusFilter: InvoiceStatus | 'ALL';
  onStatusFilterChange: (val: InvoiceStatus | 'ALL') => void;
  onReset?: () => void;
  onOpenCreate?: () => void;
}

export const BillFilter: React.FC<BillFilterProps> = ({
  billingMonth,
  onBillingMonthChange,
  statusFilter,
  onStatusFilterChange,
  onReset,
  onOpenCreate,
}) => {
  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onBillingMonthChange('10/2026');
      onStatusFilterChange('ALL');
    }
  };

  return (
    <div className="bg-stay-card-bg p-4 rounded-xl border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
      <Select
        value={billingMonth}
        onChange={(val) => onBillingMonthChange(val)}
        className="w-full sm:w-[220px] h-[40px] rounded-[8px]"
        options={[
          { label: 'Kỳ Tháng 10/2026', value: '10/2026' },
          { label: 'Kỳ Tháng 09/2026', value: '09/2026' },
          { label: 'Kỳ Tháng 08/2026', value: '08/2026' },
          { label: 'Kỳ Tháng 07/2026', value: '07/2026' },
        ]}
      />

      <Select
        value={statusFilter}
        onChange={(val) => onStatusFilterChange(val as InvoiceStatus | 'ALL')}
        className="w-full sm:w-[220px] h-[40px] rounded-[8px]"
        options={[
          { label: 'Tất cả trạng thái', value: 'ALL' },
          { label: '📝 Bản nháp (DRAFT)', value: 'DRAFT' },
          { label: 'Chờ thanh toán', value: 'UNPAID' },
          { label: 'Thanh toán một phần', value: 'PARTIALLY_PAID' },
          { label: 'Đã thanh toán', value: 'PAID' },
          { label: 'Quá hạn nộp', value: 'OVERDUE' },
          { label: 'Đã hủy', value: 'CANCELLED' },
        ]}
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
          Lập hóa đơn
        </Button>
      )}
    </div>
  );
};
