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
      footer={[
        <Button key="close" onClick={onCancel} className="h-9 px-4 rounded-lg">
          Đóng
        </Button>,
        onEdit && (
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              onCancel();
              onEdit(tenant);
            }}
            className="h-9 px-4 rounded-lg bg-[#E60023] hover:bg-[#CC001F] text-white font-medium"
          >
            Chỉnh sửa
          </Button>
        ),
      ]}
    >
      <div className="mt-4 space-y-4 text-[14px]">
        {/* SECTION 1: NHÂN THÂN & LIÊN HỆ */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            1. Thông tin cá nhân & số điện thoại
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Họ và tên khách thuê
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {tenant.fullName}
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Số điện thoại liên lạc
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  {tenant.phone || '—'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Số định danh CCCD / CMND
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  {tenant.idCardNumber || '—'}
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Quê quán / Nơi thường trú
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  {tenant.hometown || '—'}
                </div>
              </div>
            </div>

            {tenant.userEmail && (
              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Email tài khoản
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  {tenant.userEmail}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: BỐ TRÍ PHÒNG & VAI TRÒ */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            2. Bố trí phòng ở & vai trò
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Phòng trọ đang ở
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {tenant.roomName || '—'}
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Vai trò trong phòng trọ
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  {tenant.isRepresentative ? 'Đại diện hợp đồng chính' : 'Thành viên ở cùng'}
                </div>
              </div>
            </div>

            <div>
              <label className="text-stay-text font-medium text-xs block mb-1">
                Trạng thái liên kết tài khoản
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                {renderLinkStatus(tenant.linkStatus, tenant.userEmail)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
