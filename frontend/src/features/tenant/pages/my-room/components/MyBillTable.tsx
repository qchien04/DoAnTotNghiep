import React from 'react';
import { Table } from '@/shared/components';
import { Tooltip, message } from 'antd';
import { QrCode, Eye, CheckCircle2 } from 'lucide-react';
import { Bill } from '@/shared/types/landlord';
import { PageResponse } from '@/shared/types/api';

interface MyBillTableProps {
  pageInfo?: PageResponse<Bill>;
  bills?: Bill[];
  isLoading?: boolean;
  onPageChange?: (page: number, size: number) => void;
  onOpenVietQR: (bill: Bill) => void;
}

export const MyBillTable: React.FC<MyBillTableProps> = ({
  pageInfo,
  bills,
  isLoading,
  onPageChange,
  onOpenVietQR,
}) => {
  const billColumns = [
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
      title: 'Kỳ cước tháng',
      dataIndex: 'billingMonth',
      key: 'billingMonth',
      width: 130,
      render: (val: string) => <span className="font-medium text-[14px] text-stay-text">{val}</span>,
    },
    {
      title: 'Tiền phòng',
      dataIndex: 'roomRent',
      key: 'roomRent',
      width: 130,
      align: 'right' as const,
      render: (val: number) => (
        <span className="text-[14px] text-stay-text font-medium">
          {(val ?? 0).toLocaleString()} đ
        </span>
      ),
    },
    {
      title: 'Tiền dịch vụ',
      dataIndex: 'serviceAmount',
      key: 'serviceAmount',
      width: 130,
      align: 'right' as const,
      render: (val: number) => (
        <span className="text-[14px] text-stay-text font-medium">
          {(val ?? 0).toLocaleString()} đ
        </span>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right' as const,
      render: (val: number) => (
        <span className="font-semibold text-[14px] text-stay-primary">
          {val?.toLocaleString()} đ
        </span>
      ),
    },
    {
      title: 'Hạn thanh toán',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (d: string) => <span className="text-xs text-stay-text-secondary">{d || '05/11/2026'}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (st: string) => {
        if (st === 'PAID') {
          return <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">Đã thanh toán</span>;
        }
        if (st === 'OVERDUE') {
          return <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">Quá hạn</span>;
        }
        return <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">Chờ thanh toán</span>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      fixed: 'right' as const,
      render: (_: any, r: Bill) => {
        const canPay = r.status !== 'PAID';
        return (
          <div className="flex items-center justify-start gap-1.5">
            <Tooltip title="Xem chi tiết hóa đơn & biên lai">
              <button
                type="button"
                className="stay-action-btn stay-action-btn-view"
                onClick={() => onOpenVietQR(r)}
              >
                <Eye className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title={canPay ? 'Quét mã VietQR chuyển khoản' : 'Hóa đơn đã thanh toán'}>
              <button
                type="button"
                className={`stay-action-btn ${canPay ? 'stay-action-btn-edit' : 'opacity-40 cursor-not-allowed text-slate-400'}`}
                onClick={() => canPay && onOpenVietQR(r)}
                disabled={!canPay}
              >
                <QrCode className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title={canPay ? 'Xác nhận đã thanh toán' : 'Đã thanh toán đủ'}>
              <button
                type="button"
                className={`stay-action-btn ${canPay ? 'stay-action-btn-delete' : 'opacity-40 cursor-not-allowed text-slate-400'}`}
                onClick={() =>
                  message.success(
                    'Đã ghi nhận! Chủ trọ sẽ đối soát và cập nhật trạng thái hóa đơn sớm nhất.'
                  )
                }
                disabled={!canPay}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div>
        <h3 className="text-sm font-bold text-stay-text pb-3">
          Lịch Sử Hóa Đơn
        </h3>
      </div>

      <Table
        dataSource={pageInfo?.items ?? bills ?? []}
        columns={billColumns}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        className="overflow-x-auto"
        pagination={
          pageInfo
            ? {
              current: (pageInfo.page ?? 0) + 1,
              pageSize: pageInfo.size ?? 10,
              total: pageInfo.totalElements ?? 0,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Tổng ${total} hóa đơn`,
              onChange: (p, s) => onPageChange?.(p - 1, s),
            }
            : { pageSize: 5 }
        }
      />
    </div>
  );
};
