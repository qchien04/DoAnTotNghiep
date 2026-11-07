import React from 'react';
import { Modal, Button, StatusBadge } from '@/shared/components';
import { UtilityService } from '@/shared/types/landlord';
import { getBillingMethodShortLabel } from '@/shared/utils';

interface ServiceDetailModalProps {
  open: boolean;
  service: UtilityService | null;
  onCancel: () => void;
  onEdit?: (service: UtilityService) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  open,
  service,
  onCancel,
  onEdit,
}) => {
  if (!service) return null;

  const renderCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'ELECTRICITY':
        return 'Điện sinh hoạt (ELECTRICITY)';
      case 'WATER':
        return 'Nước sinh hoạt (WATER)';
      case 'INTERNET':
        return 'Internet Wifi (INTERNET)';
      case 'CLEANING':
        return 'Vệ sinh & Rác (CLEANING)';
      case 'PARKING':
        return 'Gửi xe (PARKING)';
      case 'ELEVATOR':
        return 'Thang máy (ELEVATOR)';
      default:
        return 'Tiện ích khác (OTHER)';
    }
  };

  const price = Number(service.unitPrice ?? 0);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={`Chi tiết dịch vụ: ${service.name}`}
      width={720}
      centered
      destroyOnClose
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full pt-1">
          <Button
            key="close"
            variant="outline"
            size="md"
            onClick={onCancel}
            className="h-9 px-4 rounded-lg border border-stay-border text-stay-text hover:bg-stay-bg-app bg-stay-card-bg font-medium text-[14px]"
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
                onEdit(service);
              }}
              className="h-9 px-4 rounded-lg bg-stay-primary hover:bg-stay-primary-hover text-white font-medium text-[14px] shadow-xs"
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      }
    >
      <div className="mt-4 space-y-3.5 text-[14px]">
        {/* SECTION 1: ĐỊNH DANH & PHÂN LOẠI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Tên dịch vụ:
            </span>
            <span className="text-stay-text text-[14px] font-semibold">
              {service.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Trạng thái:
            </span>
            <StatusBadge
              status={service.isActive !== false ? 'ACTIVE' : 'STOPPED'}
              label={service.isActive !== false ? 'Đang áp dụng' : 'Tạm dừng'}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Phân loại:
            </span>
            <span className="text-stay-text text-[14px]">
              {renderCategoryLabel(service.category as string)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
              Phạm vi áp dụng:
            </span>
            <span className="text-stay-text text-[14px]">
              {service.scope || 'Tất cả'}
            </span>
          </div>
        </div>

        {/* SECTION 2: ĐƠN GIÁ & HÌNH THỨC THU */}
        <div className="pt-3.5 border-t border-stay-border-subtle">
          <span className="text-[13px] font-semibold text-stay-text-secondary block mb-2.5">
            Đơn giá & Hình thức thu phí
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
                Đơn vị tính:
              </span>
              <span className="text-stay-text text-[14px]">
                {service.unit || '—'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
                Hình thức thu phí:
              </span>
              <span className="text-stay-text text-[14px] font-medium">
                {getBillingMethodShortLabel(service.billingMethod)}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
                Đơn giá:
              </span>
              <span className="text-stay-primary text-[15px] font-bold">
                {price.toLocaleString()} đ / {service.unit || 'lần'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
