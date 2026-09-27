import React from 'react';
import { Eye } from 'lucide-react';
import { Table, Button } from '@/shared/components';
import { Tooltip } from 'antd';
import { Bill, BillStatus } from '@/shared/types/landlord';

interface BillTableProps {
  bills: Bill[];
  isLoading: boolean;
  onOpenDetail: (bill: Bill) => void;
  onOpenPayment: (bill: Bill) => void;
  onOpenCancel: (bill: Bill) => void;
  onPublish?: (bill: Bill) => void;
}

export const BillTable: React.FC<BillTableProps> = ({
  bills,
  isLoading,
  onOpenDetail,
  onOpenPayment,
  onOpenCancel,
  onPublish,
}) => {
  const renderStatus = (st: BillStatus) => {
    switch (st) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Bản nháp
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã thanh toán
          </span>
        );
      case 'PENDING':
      case 'UNPAID':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Chờ thanh toán
          </span>
        );
      case 'PARTIALLY_PAID':
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Trả một phần
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Quá hạn
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-stay-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Đã hủy
          </span>
        );
      default:
        return <span className="text-xs text-stay-text-muted">{st}</span>;
    }
  };

  const columns = [
    {
      title: 'ID',
      key: 'id',
      width: 70,
      render: (_: any, r: Bill) => (
        <span
          onClick={() => onOpenDetail(r)}
          className="font-mono text-xs font-semibold text-stay-text cursor-pointer hover:text-stay-primary hover:underline"
        >
          #{r.id}
        </span>
      ),
    },
    {
      title: 'Phòng',
      key: 'roomName',
      render: (_: any, r: Bill) => (
        <div>
          <span className="font-medium text-xs text-stay-text block">
            {r.roomName || '---'}
          </span>
          {r.buildingName && (
            <span className="text-[11px] text-stay-text-muted block">{r.buildingName}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Khách đại diện',
      key: 'representativeTenantName',
      render: (_: any, r: Bill) => (
        <div>
          <span className="text-sm font-medium text-stay-text">
            {r.representativeTenantName || '---'}
          </span>
          {r.representativeTenantPhone && (
            <span className="text-xs text-stay-text-secondary block">
              {r.representativeTenantPhone}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Kỳ cước',
      key: 'billingPeriod',
      render: (_: any, r: Bill) => (
        <span className="font-mono text-xs text-stay-text-secondary">
          {r.billingPeriod}
        </span>
      ),
    },
    {
      title: 'Tổng tiền',
      key: 'totalAmount',
      render: (_: any, r: Bill) => (
        <div>
          <span className="font-medium text-stay-text text-sm">
            {(r.totalAmount ?? 0).toLocaleString()} đ
          </span>
          {r.remainingAmount !== undefined && r.remainingAmount > 0 && r.status !== 'PAID' && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 block">
              Còn nợ: {r.remainingAmount.toLocaleString()} đ
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (val: string) => <span className="font-mono text-xs text-stay-text-secondary">{val || '---'}</span>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, r: Bill) => renderStatus(r.status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 170,
      align: 'right' as const,
      render: (_: any, r: Bill) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              type="text"
              icon={<Eye className="w-3.5 h-3.5 text-stay-text-secondary hover:text-stay-text" />}
              onClick={() => onOpenDetail(r)}
            />
          </Tooltip>

          {r.status === 'DRAFT' && (
            <>
              <Button
                size="small"
                type="primary"
                onClick={() => onPublish && onPublish(r)}
                className="text-xs bg-amber-600 hover:bg-amber-700 px-2 h-7 font-medium"
              >
                Ban hành
              </Button>
              <Button
                size="small"
                type="text"
                danger
                onClick={() => onOpenCancel(r)}
                className="text-xs px-1.5"
              >
                Hủy
              </Button>
            </>
          )}

          {(r.status === 'PENDING' || r.status === 'UNPAID' || r.status === 'OVERDUE') && (
            <>
              <Button
                size="small"
                type="text"
                onClick={() => onOpenPayment(r)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-1.5"
              >
                Thu tiền
              </Button>
              <Button
                size="small"
                type="text"
                danger
                onClick={() => onOpenCancel(r)}
                className="text-xs px-1.5"
              >
                Hủy
              </Button>
            </>
          )}

          {r.status === 'PAID' && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Đã thu đủ</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-lg border border-stay-border overflow-hidden">
      <Table
        dataSource={bills}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        className="overflow-x-auto"
      />
    </div>
  );
};
