import React from 'react';
import { Table, Button } from '@/shared/components';
import { LandlordDashboardData } from '@/shared/types/landlord';

interface DashboardOverdueTableProps {
  overdueDebts: LandlordDashboardData['overdueDebts'];
  onRemindDebt: (roomName: string, phone: string) => void;
}

export const DashboardOverdueTable: React.FC<DashboardOverdueTableProps> = ({
  overdueDebts,
  onRemindDebt,
}) => {
  const columns = [
    {
      title: 'Phòng',
      dataIndex: 'roomName',
      key: 'roomName',
      render: (val: string) => <span className="font-mono text-xs font-semibold text-stay-text">{val}</span>,
    },
    {
      title: 'Tòa nhà',
      dataIndex: 'buildingName',
      key: 'buildingName',
      render: (val: string) => <span className="text-xs text-stay-text-secondary">{val}</span>,
    },
    {
      title: 'Khách đại diện',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (val: string, r: any) => (
        <div>
          <p className="font-medium text-sm text-stay-text">{val}</p>
          <p className="text-xs text-stay-text-secondary">{r.phone}</p>
        </div>
      ),
    },
    {
      title: 'Số tiền nợ',
      dataIndex: 'debtAmount',
      key: 'debtAmount',
      render: (val: number) => (
        <span className="font-medium text-sm text-red-600 dark:text-red-400">
          {(val ?? 0).toLocaleString()} đ
        </span>
      ),
    },
    {
      title: 'Trễ hạn',
      dataIndex: 'daysLate',
      key: 'daysLate',
      render: (val: number) => (
        <span className="text-xs font-medium text-red-600 dark:text-red-400">
          {val} ngày
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'right' as const,
      render: (_: any, r: any) => (
        <Button
          size="small"
          type="text"
          onClick={() => onRemindDebt(r.roomName, r.phone)}
          className="text-xs text-amber-600 hover:text-amber-700 font-medium px-2"
        >
          Nhắc nợ
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-lg border border-stay-border overflow-hidden">
      <div className="p-4 border-b border-stay-border">
        <h2 className="text-sm font-semibold text-stay-text">Nợ cước quá hạn</h2>
      </div>
      <Table
        dataSource={overdueDebts || []}
        columns={columns}
        rowKey="roomName"
        pagination={false}
        className="overflow-x-auto"
      />
    </div>
  );
};
