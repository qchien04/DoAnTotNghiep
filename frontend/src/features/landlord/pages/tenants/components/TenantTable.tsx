import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Table, Button, Popconfirm } from '@/shared/components';
import { Tenant, TenantLinkStatus } from '@/shared/types/landlord';

interface TenantTableProps {
  tenants: Tenant[];
  isLoading: boolean;
  isDeleting: boolean;
  onEdit: (tenant: Tenant) => void;
  onDelete: (id: string | number) => void;
  onInvite: (tenant: Tenant) => void;
}

export const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
  onInvite,
}) => {
  const renderLinkStatus = (status: TenantLinkStatus, linkedUserName?: string) => {
    switch (status) {
      case 'LINKED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {linkedUserName || 'Đã liên kết'}
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {linkedUserName ? `${linkedUserName} (chờ duyệt)` : 'Chờ xác nhận'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-stay-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            Chưa liên kết
          </span>
        );
    }
  };

  const columns = [
    {
      title: 'Khách thuê',
      key: 'name',
      render: (_: any, r: Tenant) => (
        <div>
          <span className="font-medium text-stay-text text-sm block">{r.fullName}</span>
          <span className="text-xs text-stay-text-secondary mt-0.5">{r.phone}</span>
        </div>
      ),
    },
    {
      title: 'CCCD',
      dataIndex: 'identityCard',
      key: 'identityCard',
      render: (val: string) => (
        <span className="text-xs font-mono text-stay-text">
          {val || '---'}
        </span>
      ),
    },
    {
      title: 'Quê quán',
      dataIndex: 'hometown',
      key: 'hometown',
      render: (val: string) => <span className="text-xs text-stay-text-secondary">{val || '---'}</span>,
    },
    {
      title: 'Phòng',
      key: 'room',
      render: (_: any, r: Tenant) => (
        <div>
          <span className="font-mono text-xs font-medium text-stay-text block">
            {r.roomCode ? `P.${r.roomCode}` : '---'}
          </span>
          {r.buildingName && <span className="text-[11px] text-stay-text-muted">{r.buildingName}</span>}
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'isRepresentative',
      key: 'isRepresentative',
      render: (isRep: boolean) =>
        isRep ? (
          <span className="text-xs font-medium text-stay-primary">
            Đại diện
          </span>
        ) : (
          <span className="text-xs text-stay-text-muted">
            Thành viên
          </span>
        ),
    },
    {
      title: 'Tài khoản',
      key: 'linkStatus',
      render: (_: any, r: Tenant) => renderLinkStatus(r.linkStatus, r.linkedUserName),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      align: 'right' as const,
      render: (_: any, r: Tenant) => (
        <div className="flex items-center justify-end gap-1">
          {r.linkStatus !== 'LINKED' && (
            <Button
              size="small"
              type="text"
              onClick={() => onInvite(r)}
              className="text-xs text-stay-primary hover:text-stay-primary-hover px-2"
            >
              Liên kết
            </Button>
          )}

          <Button
            size="small"
            type="text"
            icon={<Edit2 className="w-3.5 h-3.5 text-stay-text-secondary hover:text-stay-text" />}
            onClick={() => onEdit(r)}
            title="Sửa hồ sơ"
          />

          <Popconfirm
            title="Xác nhận xóa khách thuê?"
            description="Bạn có chắc muốn xóa khách này khỏi phòng?"
            onConfirm={() => onDelete(r.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<Trash2 className="w-3.5 h-3.5" />}
              loading={isDeleting}
              title="Xóa khách thuê"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-lg border border-stay-border overflow-hidden">
      <Table
        dataSource={tenants}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        className="overflow-x-auto"
      />
    </div>
  );
};
