import React from 'react';
import {
  Receipt,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Table, Button, Tag } from '@/shared/components';
import { Tooltip } from 'antd';
import { Bill, BillStatus } from '@/shared/types/landlord';

interface BillTableProps {
  bills: Bill[];
  isLoading: boolean;
  onOpenDetail: (bill: Bill) => void;
  onOpenPayment: (bill: Bill) => void;
  onOpenCancel: (bill: Bill) => void;
}

export const BillTable: React.FC<BillTableProps> = ({
  bills,
  isLoading,
  onOpenDetail,
  onOpenPayment,
  onOpenCancel,
}) => {
  const renderStatus = (st: BillStatus) => {
    switch (st) {
      case 'PAID':
        return (
          <Tag color="green" icon={<CheckCircle className="w-3 h-3 inline mr-1" />}>
            Đã thanh toán
          </Tag>
        );
      case 'PENDING':
      case 'UNPAID':
        return (
          <Tag color="orange" icon={<Clock className="w-3 h-3 inline mr-1" />}>
            Chờ thanh toán
          </Tag>
        );
      case 'OVERDUE':
        return (
          <Tag color="error" icon={<AlertCircle className="w-3 h-3 inline mr-1" />}>
            Quá hạn
          </Tag>
        );
      case 'CANCELLED':
        return (
          <Tag color="default" icon={<XCircle className="w-3 h-3 inline mr-1" />}>
            Đã hủy
          </Tag>
        );
      default:
        return <Tag>{st}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã hóa đơn',
      key: 'billNumber',
      render: (_: any, r: Bill) => (
        <span
          onClick={() => onOpenDetail(r)}
          className="font-bold text-stay-primary cursor-pointer hover:underline flex items-center gap-1.5"
        >
          <Receipt className="w-4 h-4 text-stay-primary" />
          {r.invoiceCode || r.billNumber || `HD-${r.id}`}
        </span>
      ),
    },
    {
      title: 'Phòng / Tòa nhà',
      key: 'roomName',
      render: (_: any, r: Bill) => (
        <div>
          <span className="font-semibold text-stay-text">{r.roomCode || r.roomName}</span>
          <span className="text-xs text-stay-text-secondary block">{r.buildingName || 'Tòa nhà'}</span>
        </div>
      ),
    },
    {
      title: 'Khách đại diện',
      key: 'tenantName',
      render: (_: any, r: Bill) => (
        <div>
          <span className="text-sm font-medium text-stay-text">
            {r.representativeTenantName || r.tenantName || '---'}
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
        <Tag color="blue" className="font-medium px-2 py-0.5 rounded-full">
          {r.billingPeriod || r.billingMonth}
        </Tag>
      ),
    },
    {
      title: 'Tổng tiền (VNĐ)',
      key: 'totalAmount',
      render: (_: any, r: Bill) => (
        <div>
          <span className="font-bold text-stay-text text-sm">
            {(r.totalAmount ?? 0).toLocaleString()} đ
          </span>
          {r.remainingAmount !== undefined && r.remainingAmount > 0 && r.status !== 'PAID' && (
            <span className="text-[11px] text-amber-600 block">
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
      render: (val: string) => <span className="text-xs text-stay-text-secondary">{val || '---'}</span>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, r: Bill) => renderStatus(r.status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, r: Bill) => (
        <div className="flex items-center gap-1.5">
          <Tooltip title="Xem chi tiết bảng kê">
            <Button
              size="small"
              type="text"
              icon={<Eye className="w-3.5 h-3.5 text-stay-text-secondary" />}
              onClick={() => onOpenDetail(r)}
            />
          </Tooltip>

          {(r.status === 'PENDING' || r.status === 'UNPAID' || r.status === 'OVERDUE') && (
            <>
              <Button
                size="small"
                type="primary"
                onClick={() => onOpenPayment(r)}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold px-2 rounded-lg"
              >
                Thu tiền
              </Button>
              <Button
                size="small"
                danger
                onClick={() => onOpenCancel(r)}
                className="text-xs px-2 rounded-lg"
              >
                Hủy
              </Button>
            </>
          )}

          {r.status === 'PAID' && (
            <Tag color="green" className="m-0 rounded-md">Đã thu đủ</Tag>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs overflow-hidden">
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
