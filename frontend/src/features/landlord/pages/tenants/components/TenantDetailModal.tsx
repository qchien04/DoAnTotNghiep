import React from 'react';
import { Modal } from 'antd';
import { Button } from '@/shared/components';
import { Tenant, TenantLinkStatus } from '@/shared/types/landlord';

interface TenantDetailModalProps {
  open: boolean;
  tenant: Tenant | null;
  onCancel: () => void;
  onEdit?: (tenant: Tenant) => void;
}

export const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  open,
  tenant,
  onCancel,
  onEdit,
}) => {
  if (!tenant) return null;

  const renderLinkStatus = (st?: TenantLinkStatus, linkedUserName?: string) => {
    switch (st) {
      case 'LINKED':
        return `Đã liên kết tài khoản (${linkedUserName || 'Người dùng'})`;
      case 'PENDING':
        return `Chờ xác nhận (${linkedUserName || 'Chờ duyệt'})`;
      default:
        return 'Chưa liên kết tài khoản hệ thống';
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={`Chi tiết khách thuê: ${tenant.fullName}`}
      width={820}
      centered
      destroyOnClose
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full pt-1">
          <Button
            key="close"
            variant="outline"
            size="md"
            onClick={onCancel}
            className="h-10 px-5 rounded-xl border border-stay-border text-stay-text hover:bg-stay-bg-app bg-stay-card-bg font-medium"
          >
            Đóng
          </Button>
          {onEdit && (
            <Button
              key="edit"
              variant="primary"
              size="md"
              onClick={() => {
                onCancel();
                onEdit(tenant);
              }}
              className="h-10 px-5 rounded-xl bg-stay-primary hover:bg-stay-primary-hover text-white font-semibold shadow-xs"
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      }
    >
      <div className="mt-4 space-y-4 text-[14px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-[14px]">
          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle sm:col-span-2">
            <span className="text-stay-text-secondary shrink-0">Họ và tên:</span>
            <span className="text-stay-text font-semibold">{tenant.fullName}</span>
          </div>

          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[110px]">Số điện thoại:</span>
            <span className="text-stay-text font-medium">{tenant.phone || '—'}</span>
          </div>

          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[110px]">CCCD / CMND:</span>
            <span className="text-stay-text font-medium">{tenant.idCardNumber || '—'}</span>
          </div>

          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[110px]">Quê quán:</span>
            <span className="text-stay-text font-medium">{tenant.hometown || '—'}</span>
          </div>

          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[110px]">Vai trò:</span>
            <span className="text-stay-text font-medium">
              {tenant.isRepresentative ? 'Đại diện hợp đồng chính' : 'Thành viên ở cùng'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle sm:col-span-2">
            <span className="text-stay-text-secondary shrink-0">Phòng trọ đang ở:</span>
            <span className="text-stay-text font-medium">{tenant.roomName || '—'}</span>
          </div>

          {tenant.userEmail && (
            <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle sm:col-span-2">
              <span className="text-stay-text-secondary shrink-0">Email tài khoản:</span>
              <span className="text-stay-text font-medium">{tenant.userEmail}</span>
            </div>
          )}

          <div className="flex items-center gap-2 py-1.5 border-b border-stay-border-subtle sm:col-span-2">
            <span className="text-stay-text-secondary shrink-0">Trạng thái liên kết:</span>
            <div>{renderLinkStatus(tenant.linkStatus, tenant.userEmail)}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
