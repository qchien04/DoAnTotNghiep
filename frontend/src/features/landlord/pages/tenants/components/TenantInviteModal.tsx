import React from 'react';
import { Search } from 'lucide-react';
import { Modal, Input } from '@/shared/components';
import { Tenant } from '@/shared/types/landlord';

interface TenantInviteModalProps {
  open: boolean;
  tenant: Tenant | null;
  keyword: string;
  onKeywordChange: (val: string) => void;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}

export const TenantInviteModal: React.FC<TenantInviteModalProps> = ({
  open,
  tenant,
  keyword,
  onKeywordChange,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Mời liên kết tài khoản"
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Gửi lời mời liên kết"
      cancelText="Hủy"
      width={560}
    >
      <div className="py-2 space-y-4">
        <p className="text-xs text-stay-text-secondary leading-relaxed">
          Nhập số điện thoại hoặc email tài khoản đã đăng ký trên hệ thống của khách thuê{' '}
          <strong className="text-stay-text">{tenant?.fullName}</strong>:
        </p>

        <Input
          prefix={<Search className="w-4 h-4 text-stay-text-muted" />}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Ví dụ: 0905111333..."
          className="h-10"
        />

        <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border text-xs text-stay-text-secondary leading-relaxed">
          Hệ thống sẽ gửi thông báo liên kết tới ứng dụng của khách thuê. Sau khi khách xác nhận, tài khoản sẽ được kết nối chính thức để xem bảng kê hóa đơn và nhận mã VietQR thanh toán.
        </div>
      </div>
    </Modal>
  );
};
