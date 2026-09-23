import React from 'react';
import { AlertCircle, Send } from 'lucide-react';
import { Card, Table, Tag, Button } from '@/shared/components';
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
      render: (val: string) => <span className="font-bold text-stay-primary">{val}</span>,
    },
    {
      title: 'Tòa nhà',
      dataIndex: 'buildingName',
      key: 'buildingName',
    },
    {
      title: 'Khách đại diện',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (val: string, r: any) => (
        <div>
          <p className="font-semibold text-stay-text">{val}</p>
          <p className="text-xs text-stay-text-secondary">{r.phone}</p>
        </div>
      ),
    },
    {
      title: 'Số tiền nợ',
      dataIndex: 'debtAmount',
      key: 'debtAmount',
      render: (val: number) => (
        <span className="font-semibold text-red-600 dark:text-red-400">
          {(val ?? 0).toLocaleString()} VNĐ
        </span>
      ),
    },
    {
      title: 'Trễ hạn',
      dataIndex: 'daysLate',
      key: 'daysLate',
      render: (val: number) => <Tag color="error">Trễ {val} ngày</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, r: any) => (
        <Button
          size="small"
          icon={<Send className="w-3.5 h-3.5" />}
          onClick={() => onRemindDebt(r.roomName, r.phone)}
          className="text-amber-600 border-amber-300 hover:bg-amber-50 rounded-lg text-xs"
        >
          Nhắc nợ SMS
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2 text-stay-text">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>Danh Sách Phòng Đang Nợ Tiền Cước Quá Hạn</span>
        </div>
      }
      className="rounded-2xl border-stay-border shadow-xs overflow-hidden"
    >
      <Table
        dataSource={overdueDebts || []}
        columns={columns}
        rowKey="roomName"
        pagination={false}
        className="overflow-x-auto"
      />
    </Card>
  );
};
