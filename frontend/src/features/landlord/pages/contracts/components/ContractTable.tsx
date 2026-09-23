import React from 'react';
import { Table, Button, Tag } from '@/shared/components';
import { RentalContract, ContractStatus } from '@/shared/types/landlord';

interface ContractTableProps {
  contracts: RentalContract[];
  isLoading: boolean;
  onOpenTerminate: (contract: RentalContract) => void;
}

export const ContractTable: React.FC<ContractTableProps> = ({
  contracts,
  isLoading,
  onOpenTerminate,
}) => {
  const renderStatus = (st: ContractStatus) => {
    switch (st) {
      case 'ACTIVE':
        return (
          <Tag className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold px-2.5 py-0.5 rounded-full">
            Đang hiệu lực
          </Tag>
        );
      case 'EXPIRING_SOON':
        return (
          <Tag className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold px-2.5 py-0.5 rounded-full">
            Sắp hết hạn
          </Tag>
        );
      case 'TERMINATED':
        return (
          <Tag className="bg-slate-500/10 text-stay-text-muted border-stay-border font-semibold px-2.5 py-0.5 rounded-full">
            Đã thanh lý
          </Tag>
        );
      default:
        return <Tag className="border-stay-border text-stay-text px-2.5 py-0.5 rounded-full">{st}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã hợp đồng',
      key: 'contractNumber',
      render: (_: any, r: RentalContract) => (
        <span className="font-bold text-stay-primary">
          {r.contractCode || r.contractNumber || `HD #${r.id}`}
        </span>
      ),
    },
    {
      title: 'Phòng',
      key: 'roomName',
      render: (_: any, r: RentalContract) => (
        <div>
          <span className="font-semibold text-stay-text block">
            {r.roomCode || r.roomName || '---'}
          </span>
          {r.buildingName && (
            <span className="text-xs text-stay-text-secondary block">{r.buildingName}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Khách đại diện',
      key: 'tenantName',
      render: (_: any, r: RentalContract) => (
        <div>
          <p className="font-semibold text-stay-text">
            {r.representativeTenantName || r.tenantName || '---'}
          </p>
          {(r.representativeTenantPhone || r.tenantPhone) && (
            <p className="text-xs text-stay-text-secondary">
              {r.representativeTenantPhone || r.tenantPhone}
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Thời hạn thuê',
      key: 'period',
      render: (_: any, r: RentalContract) => {
        let months = r.durationMonths;
        if (!months && r.startDate && r.endDate) {
          const start = new Date(r.startDate);
          const end = new Date(r.endDate);
          months = Math.max(1, Math.round(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        }
        return (
          <span className="text-xs font-mono text-stay-text">
            {r.startDate} - {r.endDate} ({months || 12} tháng)
          </span>
        );
      },
    },
    {
      title: 'Tiền thuê (VNĐ)',
      key: 'monthlyRent',
      render: (_: any, r: RentalContract) => {
        const val = r.rentPrice ?? r.monthlyRent ?? 0;
        return (
          <span className="font-bold text-stay-secondary">
            {Number(val).toLocaleString()} đ
          </span>
        );
      },
    },
    {
      title: 'Tiền cọc (VNĐ)',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
      render: (val: number) => (
        <span className="font-medium text-stay-text">{(val ?? 0).toLocaleString()} đ</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (val: ContractStatus) => renderStatus(val),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, r: RentalContract) => (
        <div className="flex items-center gap-1">
          {r.status === 'ACTIVE' && (
            <Button
              size="small"
              danger
              onClick={() => onOpenTerminate(r)}
              className="font-medium text-xs rounded-lg"
            >
              Thanh lý
            </Button>
          )}
          {r.status === 'TERMINATED' && (
            <Tag color="default" className="rounded-md">Đã tất toán</Tag>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs overflow-hidden">
      <Table
        dataSource={contracts}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        className="overflow-x-auto"
      />
    </div>
  );
};
