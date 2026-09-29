import React from 'react';
import { Search, HelpCircle } from 'lucide-react';
import { Modal, Input } from '@/shared/components';
import { Tooltip } from 'antd';
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
      title={
        <div className="flex items-center gap-1.5">
          <span>Mời liên kết tài khoản</span>
          <Tooltip title="Sau khi khách thuê xác nhận, tài khoản sẽ được kết nối để xem hóa đơn và nhận mã VietQR thanh toán">
            <HelpCircle className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary cursor-pointer inline" />
          </Tooltip>
        </div>
      }
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Gửi lời mời"
      cancelText="Hủy"
      width={640}
    >
      <div className="py-2 space-y-3">
        <p className="text-xs text-stay-text-secondary leading-relaxed">
          Nhập số điện thoại hoặc email tài khoản của khách thuê{' '}
          <strong className="text-stay-text">{tenant?.fullName}</strong>:
        </p>

        <Input
          prefix={<Search className="w-4 h-4 text-stay-text-muted" />}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Số điện thoại hoặc email đã đăng ký..."
          className="h-10"
        />
      </div>
    </Modal>
  );
};
