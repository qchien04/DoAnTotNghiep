import React from 'react';
import {
  Edit2,
  Trash2,
  Link as LinkIcon,
  Phone,
  CreditCard,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Table, Button, Tag, Popconfirm } from '@/shared/components';
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
          <Tag color="green" icon={<CheckCircle className="w-3 h-3 inline mr-1" />}>
            {linkedUserName || 'Đã liên kết'}
          </Tag>
        );
      case 'PENDING':
        return (
          <Tag color="orange" icon={<Clock className="w-3 h-3 inline mr-1" />}>
            {linkedUserName ? `${linkedUserName} (Chờ duyệt)` : 'Chờ xác nhận'}
          </Tag>
        );
      default:
        return <Tag color="default">Chưa liên kết</Tag>;
    }
  };

  const columns = [
    {
      title: 'Khách thuê',
      key: 'name',
      render: (_: any, r: Tenant) => (
        <div>
          <span className="font-semibold text-stay-text text-sm block">{r.fullName}</span>
          <span className="text-xs text-stay-text-secondary flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-stay-primary" /> {r.phone}
          </span>
        </div>
      ),
    },
    {
      title: 'Định danh CCCD',
      dataIndex: 'identityCard',
      key: 'identityCard',
      render: (val: string) => (
        <span className="text-xs font-mono text-stay-text flex items-center gap-1">
          <CreditCard className="w-3.5 h-3.5 text-stay-text-muted" />
          {val || 'Chưa cập nhật'}
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
      title: 'Phòng đang ở',
      key: 'room',
      render: (_: any, r: Tenant) => (
        <div>
          <span className="font-bold text-stay-primary text-xs block">
            {r.roomCode ? `Phòng ${r.roomCode}` : 'Phòng 101'}
          </span>
          <span className="text-[11px] text-stay-text-secondary">{r.buildingName || 'Tòa nhà'}</span>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'roleInRoom',
      key: 'roleInRoom',
      render: (role: string) =>
        role === 'REPRESENTATIVE' ? (
          <Tag color="blue" className="font-medium text-[11px]">
            Đại diện HĐ
          </Tag>
        ) : (
          <Tag color="default" className="text-[11px]">
            Thành viên
          </Tag>
        ),
    },
    {
      title: 'Tài khoản hệ thống',
      key: 'linkStatus',
      render: (_: any, r: Tenant) => renderLinkStatus(r.linkStatus, r.linkedUserName),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: Tenant) => (
        <div className="flex items-center gap-1">
          {r.linkStatus !== 'LINKED' && (
            <Button
              size="small"
              type="dashed"
              icon={<LinkIcon className="w-3.5 h-3.5 text-stay-primary" />}
              onClick={() => onInvite(r)}
              title="Mời liên kết tài khoản"
              className="text-xs rounded-lg"
            >
              Liên kết
            </Button>
          )}

          <Button
            size="small"
            type="text"
            icon={<Edit2 className="w-3.5 h-3.5 text-stay-text" />}
            onClick={() => onEdit(r)}
            title="Sửa hồ sơ"
            className="rounded-lg"
          />

          <Popconfirm
            title="Xóa khách thuê khỏi phòng?"
            description="Lưu ý: Chỉ xóa khách khi hợp đồng đã kết thúc hoặc chuyển phòng."
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
              className="rounded-lg"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs overflow-hidden">
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
