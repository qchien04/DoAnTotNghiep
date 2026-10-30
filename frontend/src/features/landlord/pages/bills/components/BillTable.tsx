import React from 'react';
import { Eye, Send, DollarSign, XCircle } from 'lucide-react';
import { Table, StatusBadge } from '@/shared/components';
import { Tooltip } from 'antd';
import { InvoiceResponse, InvoiceStatus } from '@/shared/types/landlord';
import { PageResponse } from '@/shared/types/api';

interface BillTableProps {
  pageInfo?: PageResponse<InvoiceResponse>;
  isLoading: boolean;
  onPageChange?: (page: number, size: number) => void;
  onOpenDetail: (bill: InvoiceResponse) => void;
  onOpenPayment: (bill: InvoiceResponse) => void;
  onOpenCancel: (bill: InvoiceResponse) => void;
  onPublish?: (bill: InvoiceResponse) => void;
}

export const BillTable: React.FC<BillTableProps> = ({
  pageInfo,
  isLoading,
  onPageChange,
  onOpenDetail,
  onOpenPayment,
  onOpenCancel,
  onPublish,
}) => {
  const renderStatus = (st: InvoiceStatus) => <StatusBadge status={st} />;

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <span className="text-[14px] text-stay-text-secondary font-medium">
          {index + 1}
        </span>
      ),
    },
    {
      title: 'Phòng',
      key: 'roomName',
      ellipsis: { showTitle: true },
      render: (_: any, r: InvoiceResponse) => (
        <div>
          <span
            onClick={() => onOpenDetail(r)}
            className="font-medium text-[14px] text-stay-text block cursor-pointer hover:text-stay-primary hover:underline"
          >
            {r.roomName || '—'}
          </span>
          {r.buildingName && (
            <span className="text-[12px] text-stay-text-muted block truncate">{r.buildingName}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Khách đại diện',
      key: 'representativeTenantName',
      width: 180,
      ellipsis: { showTitle: true },
      render: (_: any, r: InvoiceResponse) => (
        <div>
          <span className="text-[14px] font-medium text-stay-text block truncate">
            {r.representativeTenantName || '—'}
          </span>
          {r.representativeTenantPhone && (
            <span className="text-[12px] text-stay-text-secondary block truncate">
              {r.representativeTenantPhone}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Kỳ cước',
      key: 'billingPeriod',
      width: 120,
      ellipsis: { showTitle: true },
      render: (_: any, r: InvoiceResponse) => (
        <span className="text-[14px] text-stay-text-secondary">
          {r.billingPeriod}
        </span>
      ),
    },
    {
      title: 'Tổng tiền',
      key: 'totalAmount',
      width: 150,
      render: (_: any, r: InvoiceResponse) => (
        <div>
          <span className="font-semibold text-stay-text text-[14px]">
            {(r.totalAmount ?? 0).toLocaleString()} đ
          </span>
          {r.remainingAmount !== undefined && r.remainingAmount > 0 && r.status !== 'PAID' && (
            <span className="text-[12px] text-stay-text block">
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
      width: 120,
      ellipsis: { showTitle: true },
      render: (val: string) => <span className="text-[14px] text-stay-text-secondary">{val || '—'}</span>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      ellipsis: { showTitle: true },
      render: (_: any, r: InvoiceResponse) => renderStatus(r.status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, r: InvoiceResponse) => (
        <div className="flex items-center justify-start gap-1.5">
          <Tooltip title="Xem chi tiết">
            <button
              type="button"
              className="stay-action-btn"
              onClick={() => onOpenDetail(r)}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>

          {r.status === 'DRAFT' && (
            <>
              <Tooltip title="Ban hành hóa đơn">
                <button
                  type="button"
                  className="stay-action-btn"
                  onClick={() => onPublish && onPublish(r)}
                >
                  <Send className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip title="Hủy hóa đơn">
                <button
                  type="button"
                  className="stay-action-btn"
                  onClick={() => onOpenCancel(r)}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </Tooltip>
            </>
          )}

          {(r.status === 'UNPAID' || r.status === 'PARTIALLY_PAID' || r.status === 'OVERDUE') && (
            <>
              <Tooltip title="Xác nhận thu tiền">
                <button
                  type="button"
                  className="stay-action-btn"
                  onClick={() => onOpenPayment(r)}
                >
                  <DollarSign className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip title="Hủy hóa đơn">
                <button
                  type="button"
                  className="stay-action-btn"
                  onClick={() => onOpenCancel(r)}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </Tooltip>
            </>
          )}

          {r.status === 'PAID' && (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold px-1">Đã thu đủ</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      dataSource={pageInfo?.items ?? []}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      pagination={{
        current: (pageInfo?.page ?? 0) + 1,
        pageSize: pageInfo?.size ?? 10,
        total: pageInfo?.totalElements ?? 0,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total) => `Tổng ${total} hóa đơn`,
        onChange: (page, pageSize) => onPageChange?.(page - 1, pageSize),
      }}
      scroll={{ x: 'max-content' }}
      className="overflow-x-auto"
    />
  );
};
