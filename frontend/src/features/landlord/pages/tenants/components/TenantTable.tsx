import React from 'react';
import { Eye, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';
import { Tooltip } from 'antd';
import { Table, Popconfirm } from '@/shared/components';
import { Tenant, TenantLinkStatus } from '@/shared/types/landlord';
import { PageResponse } from '@/shared/types/api';

interface TenantTableProps {
  pageInfo?: PageResponse<Tenant>;
  isLoading: boolean;
  isDeleting: boolean;
  onPageChange?: (page: number, size: number) => void;
  onView: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onDelete: (id: string | number) => void;
  onInvite: (tenant: Tenant) => void;
  onCancelInvite: (tenant: Tenant) => void;
}

export const TenantTable: React.FC<TenantTableProps> = ({
  pageInfo,
  isLoading,
  isDeleting,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onInvite,
  onCancelInvite,
}) => {
  const renderLinkStatus = (status: TenantLinkStatus, linkedUserName?: string) => {
    switch (status) {
      case 'LINKED':
        return (
          <span className="inline-flex items-center gap-1.5 text-stay-text">
            {linkedUserName || 'Đã liên kết'}
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 text-stay-text">
            {linkedUserName ? `${linkedUserName} (chờ duyệt)` : 'Chờ xác nhận'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-stay-text">
            Chưa liên kết
          </span>
        );
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
      title: 'Khách thuê',
      key: 'name',
      width: 170,
      ellipsis: { showTitle: true },
      render: (_: any, r: Tenant) => (
        <div>
          <span className="font-medium text-stay-text text-[14px] block truncate">{r.fullName}</span>
          <span className="text-[12px] text-stay-text-secondary mt-0.5 block">{r.phone}</span>
        </div>
      ),
    },
    {
      title: 'CCCD',
      dataIndex: 'idCardNumber',
      key: 'idCardNumber',
      width: 140,
      ellipsis: { showTitle: true },
      render: (val: string) => (
        <span className="text-[14px] text-stay-text">
          {val || '—'}
        </span>
      ),
    },
    {
      title: 'Quê quán',
      dataIndex: 'hometown',
      key: 'hometown',
      width: 140,
      ellipsis: { showTitle: true },
      render: (val: string) => <span className="text-[14px] text-stay-text-secondary">{val || '—'}</span>,
    },
    {
      title: 'Phòng',
      key: 'room',
      width: 140,
      ellipsis: { showTitle: true },
      render: (_: any, r: Tenant) => (
        <div>
          <span className="text-[14px] font-medium text-stay-text block truncate">
            {r.roomName || '—'}
          </span>
          {r.buildingName && <span className="text-[12px] text-stay-text-muted block truncate">{r.buildingName}</span>}
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'isRepresentative',
      key: 'isRepresentative',
      width: 110,
      ellipsis: { showTitle: true },
      render: (isRep: boolean) =>
        isRep ? (
          <span className="font-semibold text-stay-text">
            Đại diện
          </span>
        ) : (
          <span className="font-semibold text-stay-text">
            Thành viên
          </span>
        ),
    },
    {
      title: 'Tài khoản',
      key: 'linkStatus',
      width: 150,
      ellipsis: { showTitle: true },
      render: (_: any, r: Tenant) => renderLinkStatus(r.linkStatus, r.userEmail),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, r: Tenant) => (
        <div className="flex items-center justify-start gap-1.5">
          <Tooltip title="Xem chi tiết">
            <button
              type="button"
              className="stay-action-btn stay-action-btn-view"
              onClick={() => onView(r)}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>

          {r.linkStatus === 'PENDING' && (
            <Tooltip title="Hủy lời mời liên kết">
              <button
                type="button"
                className="stay-action-btn"
                style={{ color: '#D97706' }}
                onClick={() => onCancelInvite(r)}
              >
                <UserX className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          {(r.linkStatus === 'NOT_LINKED' || r.linkStatus === 'UNLINKED') && (
            <Tooltip title="Mời liên kết tài khoản">
              <button
                type="button"
                className="stay-action-btn"
                style={{ color: '#2563EB' }}
                onClick={() => onInvite(r)}
              >
                <UserCheck className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          <Tooltip title="Chỉnh sửa">
            <button
              type="button"
              className="stay-action-btn stay-action-btn-edit"
              onClick={() => onEdit(r)}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip title="Xóa">
            <Popconfirm
              title="Xác nhận xóa khách thuê?"
              description="Bạn có chắc muốn xóa khách này khỏi phòng?"
              onConfirm={() => onDelete(r.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <button
                type="button"
                className="stay-action-btn stay-action-btn-delete"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Popconfirm>
          </Tooltip>
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
        showTotal: (total) => `Tổng ${total} khách thuê`,
        onChange: (page, pageSize) => onPageChange?.(page - 1, pageSize),
      }}
      scroll={{ x: 'max-content' }}
      className="overflow-x-auto"
    />
  );
};

