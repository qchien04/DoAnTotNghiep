import React from 'react';

export type StatusType = 'invoice' | 'contract' | 'room' | 'complaint' | 'link';

interface StatusBadgeProps {
  status?: string | null;
  type?: StatusType;
  label?: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  // Invoice statuses
  PAID: {
    label: 'Đã thanh toán',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  UNPAID: {
    label: 'Chờ thanh toán',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  },
  PARTIALLY_PAID: {
    label: 'Thanh toán 1 phần',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  },
  OVERDUE: {
    label: 'Quá hạn',
    className:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700',
  },
  DRAFT: {
    label: 'Bản nháp',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700',
  },

  // Contract statuses
  ACTIVE: {
    label: 'Đang hiệu lực',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  TERMINATED: {
    label: 'Đã thanh lý',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700',
  },
  EXPIRED: {
    label: 'Hết hạn',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700',
  },

  // Room statuses
  AVAILABLE: {
    label: 'Còn trống',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  OCCUPIED: {
    label: 'Đang thuê',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  },
  UNDER_MAINTENANCE: {
    label: 'Đang sửa chữa',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  },
  STOPPED: {
    label: 'Ngừng sử dụng',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700',
  },

  // Complaint statuses
  PENDING: {
    label: 'Chờ xử lý',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  },
  PROCESSING: {
    label: 'Đang xử lý',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  },
  RESOLVED: {
    label: 'Đã xử lý',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  REJECTED: {
    label: 'Từ chối',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700',
  },

  // Link statuses
  LINKED: {
    label: 'Đã liên kết',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  UNLINKED: {
    label: 'Chưa liên kết',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700',
  },
  NOT_LINKED: {
    label: 'Chưa liên kết',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700',
  },

  // Roommate Post statuses
  OPEN: {
    label: 'Đang tìm',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  COMPLETED: {
    label: 'Đã ghép',
    className:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
  },
  CLOSED: {
    label: 'Đã đóng',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700',
  },

  // Roommate application statuses
  APPROVED: {
    label: 'Đã duyệt',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },

  // User / Admin statuses
  LOCKED: {
    label: 'Đã khóa',
    className:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  },
  BANNED: {
    label: 'Đã khóa',
    className:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  },
  PROCESSED: {
    label: 'Đã xử lý',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type: _type,
  label,
  className = '',
}) => {
  if (!status) {
    return <span className="text-stay-text-muted">—</span>;
  }

  const normalized = status.toUpperCase();
  const config = STATUS_CONFIG[normalized];

  const displayText = label || config?.label || status;
  const styleClasses =
    config?.className ||
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClasses} ${className}`}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;
