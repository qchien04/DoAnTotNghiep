import React from 'react';
import { Eye, FileText } from 'lucide-react';
import { Table } from '@/shared/components';
import { Tooltip } from 'antd';
import { RentalContract, ContractStatus } from '@/shared/types/landlord';
import { PageResponse } from '@/shared/types/api';

interface ContractTableProps {
  pageInfo?: PageResponse<RentalContract>;
  isLoading: boolean;
  onPageChange?: (page: number, size: number) => void;
  onOpenDetail: (contract: RentalContract) => void;
  onOpenTerminate: (contract: RentalContract) => void;
}

export const ContractTable: React.FC<ContractTableProps> = ({
  pageInfo,
  isLoading,
  onPageChange,
  onOpenDetail,
  onOpenTerminate,
}) => {
  const renderStatus = (st: ContractStatus) => {
    switch (st) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            Đang hiệu lực
          </span>
        );
      case 'TERMINATED':
        return (
          <span className="inline-flex items-center gap-1.5 text-stay-text-muted">
            Đã thanh lý
          </span>
        );
      default:
        return <span className="text-stay-text-muted">{st}</span>;
    }
  };

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
      render: (_: any, r: RentalContract) => (
        <div>
          <span
            onClick={() => onOpenDetail(r)}
            className="font-medium text-[14px] text-stay-text block cursor-pointer hover:text-stay-primary hover:underline"
          >
            {r.roomName || '—'}
          </span>
          {r.buildingName && (
            <span className="text-[12px] text-stay-text-muted block">{r.buildingName}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Khách đại diện',
      key: 'representativeTenantName',
      width: 180,
      ellipsis: { showTitle: true },
      render: (_: any, r: RentalContract) => (
        <div>
          <p className="font-medium text-[14px] text-stay-text">
            {r.representativeTenantName || '—'}
          </p>
          {r.representativeTenantPhone && (
            <p className="text-[12px] text-stay-text-secondary">
              {r.representativeTenantPhone}
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Thời hạn thuê',
      key: 'period',
      width: 170,
      ellipsis: { showTitle: true },
      render: (_: any, r: RentalContract) => (
        <div className="text-[14px] text-stay-text">
          {r.startDate} → {r.endDate}
        </div>
      ),
    },
    {
      title: 'Tiền thuê',
      key: 'rentPrice',
      width: 140,
      ellipsis: { showTitle: true },
      render: (_: any, r: RentalContract) => {
        const val = r.rentPrice ?? 0;
        return (
          <span className="font-medium text-[14px] text-stay-text">
            {Number(val).toLocaleString()} đ/tháng
          </span>
        );
      },
    },
    {
      title: 'Tiền cọc',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
      width: 120,
      ellipsis: { showTitle: true },
      render: (val: number) => (
        <span className="text-[14px] text-stay-text">{(val ?? 0).toLocaleString()} đ</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      ellipsis: { showTitle: true },
      render: (val: ContractStatus) => renderStatus(val),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      fixed: 'right' as const,
      render: (_: any, r: RentalContract) => (
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

          {r.status === 'ACTIVE' && (
            <Tooltip title="Thanh lý hợp đồng">
              <button
                type="button"
                className="stay-action-btn"
                onClick={() => onOpenTerminate(r)}
              >
                <FileText className="w-4 h-4" />
              </button>
            </Tooltip>
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
        showTotal: (total) => `Tổng ${total} hợp đồng`,
        onChange: (page, pageSize) => onPageChange?.(page - 1, pageSize),
      }}
      scroll={{ x: 'max-content' }}
      className="overflow-x-auto"
    />
  );
};
