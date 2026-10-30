import React from 'react';
import { Modal } from 'antd';
import { Button } from '@/shared/components';
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
                onEdit(service);
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
        {/* SECTION 1: ĐỊNH DANH & PHÂN LOẠI */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-stay-text font-medium block mb-1">
                Tên dịch vụ
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                {service.name}
              </div>
            </div>

            <div>
              <label className="text-stay-text font-medium block mb-1">
                Phân loại dịch vụ
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                {renderCategoryLabel(service.category as string)}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ĐƠN GIÁ & HÌNH THỨC THU */}
        <div className="space-y-3 pt-4 border-t border-stay-border-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-stay-text font-medium block mb-1">
                Đơn vị tính
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                {service.unit || '—'}
              </div>
            </div>

            <div>
              <label className="text-stay-text font-medium block mb-1">
                Đơn giá (VNĐ)
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                {price.toLocaleString()} đ
              </div>
            </div>

            <div>
              <label className="text-stay-text font-medium block mb-1">
                Hình thức thu phí
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                {getBillingMethodShortLabel(service.billingMethod)}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: PHẠM VI & TRẠNG THÁI */}
        <div className="space-y-3 pt-4 border-t border-stay-border-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-stay-text font-medium block mb-1">
                Phạm vi áp dụng
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                {service.scope || 'Tất cả'}
              </div>
            </div>

            <div>
              <label className="text-stay-text font-medium block mb-1">
                Trạng thái
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                {service.isActive !== false ? 'Đang áp dụng' : 'Tạm dừng'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
