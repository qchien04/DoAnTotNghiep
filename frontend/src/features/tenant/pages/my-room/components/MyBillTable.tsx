import React from 'react';
import { Table, Button } from '@/shared/components';
import { QrCode, Zap, Droplets } from 'lucide-react';
import { Bill } from '@/shared/types/landlord';

interface MyBillTableProps {
  bills: Bill[];
  onOpenVietQR: (bill: Bill) => void;
}

export const MyBillTable: React.FC<MyBillTableProps> = ({
  bills,
  onOpenVietQR,
}) => {
  const billColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (_: any, r: Bill) => (
        <span className="font-semibold text-stay-text">#{r.id}</span>
      ),
    },
    {
      title: 'Kỳ cước tháng',
      dataIndex: 'billingMonth',
      key: 'billingMonth',
      width: 130,
      render: (val: string) => <span className="font-semibold text-stay-text">{val}</span>,
    },
    {
      title: 'Số điện tiêu thụ',
      dataIndex: 'electricityUsage',
      key: 'electricityUsage',
      width: 130,
      render: (val: number = 115) => (
        <span className="text-xs text-stay-text flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-600" /> {val} kWh
        </span>
      ),
    },
    {
      title: 'Số nước tiêu thụ',
      dataIndex: 'waterUsage',
      key: 'waterUsage',
      width: 130,
      render: (val: number = 9) => (
        <span className="text-xs text-stay-text flex items-center gap-1">
          <Droplets className="w-3.5 h-3.5 text-blue-600" /> {val} m³
        </span>
      ),
    },
    {
      title: 'Tổng tiền (VNĐ)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      render: (val: number) => (
        <span className="font-bold text-stay-primary">
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
      width: 130,
      render: (st: string) => {
        if (st === 'PAID') {
          return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Đã thanh toán</span>;
        }
        if (st === 'OVERDUE') {
          return <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">Quá hạn</span>;
        }
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Chờ thanh toán</span>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      render: (_: any, r: Bill) => (
        r.status !== 'PAID' ? (
          <Button
            variant="primary"
            size="sm"
            icon={<QrCode className="w-3.5 h-3.5" />}
            onClick={() => onOpenVietQR(r)}
          >
            Thanh toán ngay
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenVietQR(r)}
          >
            Xem biên lai
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg border border-stay-border rounded-xl p-5 space-y-4 shadow-2xs">
      <div>
        <h3 className="text-sm font-bold text-stay-text">
          Lịch Sử Hóa Đơn & Tiền Phòng Hàng Tháng
        </h3>
        <p className="text-xs text-stay-text-secondary mt-0.5">
          Xem chỉ số điện nước, chi tiết các khoản phí dịch vụ và thanh toán qua mã VietQR ngân hàng.
        </p>
      </div>

      <div className="border border-stay-border rounded-xl overflow-hidden">
        <Table
          dataSource={bills}
          columns={billColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          className="text-xs"
        />
      </div>
    </div>
  );
};
