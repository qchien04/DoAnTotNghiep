import React from 'react';
import { Table, Button } from '@/shared/components';
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
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đang hiệu lực
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Sắp hết hạn
          </span>
        );
      case 'TERMINATED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-stay-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Đã thanh lý
          </span>
        );
      default:
        return <span className="text-xs text-stay-text-muted">{st}</span>;
    }
  };

  const columns = [
    {
      title: 'Mã hợp đồng',
      key: 'contractNumber',
      render: (_: any, r: RentalContract) => (
        <span className="font-mono text-xs font-semibold text-stay-text">
          {r.contractCode || r.contractNumber || `HD #${r.id}`}
        </span>
      ),
    },
    {
      title: 'Phòng',
      key: 'roomName',
      render: (_: any, r: RentalContract) => (
        <div>
          <span className="font-medium text-xs text-stay-text block">
            {r.roomCode ? `P.${r.roomCode}` : r.roomName || '---'}
          </span>
          {r.buildingName && (
            <span className="text-[11px] text-stay-text-muted block">{r.buildingName}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Khách đại diện',
      key: 'tenantName',
      render: (_: any, r: RentalContract) => (
        <div>
          <p className="font-medium text-sm text-stay-text">
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
      render: (_: any, r: RentalContract) => (
        <div className="font-mono text-xs text-stay-text">
          {r.startDate} → {r.endDate}
        </div>
      ),
    },
    {
      title: 'Tiền thuê',
      key: 'monthlyRent',
      render: (_: any, r: RentalContract) => {
        const val = r.rentPrice ?? r.monthlyRent ?? 0;
        return (
          <span className="font-medium text-stay-text">
            {Number(val).toLocaleString()} đ/tháng
          </span>
        );
      },
    },
    {
      title: 'Tiền cọc',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
      render: (val: number) => (
        <span className="text-xs text-stay-text">{(val ?? 0).toLocaleString()} đ</span>
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
      width: 100,
      align: 'right' as const,
      render: (_: any, r: RentalContract) => (
        <div className="flex items-center justify-end gap-1">
          {r.status === 'ACTIVE' && (
            <Button
              size="small"
              type="text"
              danger
              onClick={() => onOpenTerminate(r)}
              className="text-xs"
            >
              Thanh lý
            </Button>
          )}
          {r.status === 'TERMINATED' && (
            <span className="text-xs text-stay-text-muted">Đã tất toán</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-lg border border-stay-border overflow-hidden">
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
