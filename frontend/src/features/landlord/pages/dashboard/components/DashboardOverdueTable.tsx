import React from 'react';
import { Bell } from 'lucide-react';
import { Tooltip } from 'antd';
import { Table } from '@/shared/components';
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
      width: 120,
      ellipsis: { showTitle: true },
      render: (val: string) => <span className="font-mono text-[14px] font-semibold text-stay-text">{val}</span>,
    },
    {
      title: 'Tòa nhà',
      dataIndex: 'buildingName',
      key: 'buildingName',
      width: 160,
      ellipsis: { showTitle: true },
      render: (val: string) => <span className="text-[14px] text-stay-text-secondary truncate block">{val}</span>,
    },
    {
      title: 'Khách đại diện',
      dataIndex: 'tenantName',
      key: 'tenantName',
      ellipsis: { showTitle: true },
      render: (val: string, r: any) => (
        <div>
          <p className="font-medium text-[14px] text-stay-text truncate">{val}</p>
          <p className="text-[12px] text-stay-text-secondary">{r.phone}</p>
        </div>
      ),
    },
    {
      title: 'Số tiền nợ',
      dataIndex: 'debtAmount',
      key: 'debtAmount',
      width: 150,
      render: (val: number) => (
        <span className="font-semibold text-[14px] text-red-600 dark:text-red-400">
          {(val ?? 0).toLocaleString()} đ
        </span>
      ),
    },
    {
      title: 'Trễ hạn',
      dataIndex: 'daysLate',
      key: 'daysLate',
      width: 110,
      render: (val: number) => (
        <span className="text-[13px] font-medium text-red-600 dark:text-red-400">
          {val} ngày
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, r: any) => (
        <div className="flex items-center justify-start">
          <Tooltip title="Gửi nhắc nợ">
            <button
              type="button"
              className="stay-action-btn"
              onClick={() => onRemindDebt(r.roomName, r.phone)}
            >
              <Bell className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];


  return (
    <div className="bg-stay-card-bg rounded-xl border border-[#D7D7DB] dark:border-slate-700 shadow-none overflow-hidden">
      <div className="p-4 border-b border-[#D7D7DB] dark:border-slate-700">
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
