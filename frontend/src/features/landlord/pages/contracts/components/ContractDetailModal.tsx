import React from 'react';
import { Modal, Button } from '@/shared/components';
import { RentalContract } from '@/shared/types/landlord';
import { getBillingMethodShortLabel } from '@/shared/utils';

interface ContractDetailModalProps {
  open: boolean;
  contract: RentalContract | null;
  onCancel: () => void;
  onOpenTerminate?: (contract: RentalContract) => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  open,
  contract,
  onCancel,
  onOpenTerminate,
}) => {
  if (!contract) return null;

  const renderStatus = (st: string) => {
    switch (st) {
      case 'ACTIVE':
        return 'Đang hiệu lực';
      case 'EXPIRING_SOON':
        return 'Sắp hết hạn';
      case 'TERMINATED':
        return 'Đã thanh lý';
      default:
        return st;
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={`Chi tiết hợp đồng thuê: ${contract.roomName || 'Hợp đồng'}`}
      width={880}
      centered
      destroyOnClose
      footer={[
        <Button key="close" onClick={onCancel} className="h-9 px-4 rounded-lg">
          Đóng
        </Button>,
        contract.status === 'ACTIVE' && onOpenTerminate && (
          <Button
            key="terminate"
            danger
            onClick={() => {
              onCancel();
              onOpenTerminate(contract);
            }}
            className="h-9 px-4 rounded-lg font-medium"
          >
            Thanh lý hợp đồng
          </Button>
        ),
      ]}
    >
      <div className="mt-4 space-y-4 text-[14px]">
        {/* SECTION 1: PHÒNG & KHÁCH HÀNG */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            1. Thông tin phòng trọ & khách đại diện
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Phòng cho thuê
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {contract.roomName} {contract.buildingName ? `(${contract.buildingName})` : ''}
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Khách thuê đại diện
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {contract.representativeTenantName || '—'} {contract.representativeTenantPhone ? `(${contract.representativeTenantPhone})` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: THỜI HẠN & CHU KỲ */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            2. Thời hạn hợp đồng & chu kỳ thanh toán
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Ngày bắt đầu
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  {contract.startDate || '—'}
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Ngày kết thúc
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  {contract.endDate || '—'}
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Kỳ thu tiền hàng tháng
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  Ngày {contract.paymentCycleDay || 5} hàng tháng
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Trạng thái hợp đồng
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {renderStatus(contract.status)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TÀI CHÍNH & TIỀN CỌC */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            3. Giá thuê & tiền cọc cam kết
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Tiền thuê phòng thỏa thuận
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {Number(contract.rentPrice || 0).toLocaleString()} đ/tháng
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Tiền đặt cọc giữ phòng
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {Number(contract.depositAmount || 0).toLocaleString()} đ
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: DỊCH VỤ TIỆN ÍCH ÁP DỤNG */}
        {contract.services && contract.services.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-stay-text">
              4. Dịch vụ tiện ích chốt trong hợp đồng ({contract.services.length})
            </h3>
            <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border">
              <div className="divide-y divide-stay-border border border-stay-border rounded-lg bg-stay-card-bg overflow-hidden">
                <div className="grid grid-cols-12 px-3 py-2 bg-stay-bg-app text-xs font-semibold text-stay-text-secondary">
                  <div className="col-span-4">Tên dịch vụ</div>
                  <div className="col-span-3">Đơn giá áp dụng</div>
                  <div className="col-span-3">Hình thức tính</div>
                  <div className="col-span-2 text-right">Chỉ số đầu</div>
                </div>
                {contract.services.map((srv, idx) => (
                  <div key={idx} className="grid grid-cols-12 px-3 py-2.5 text-xs items-center text-stay-text">
                    <div className="col-span-4 font-medium">{srv.serviceName || `Dịch vụ #${srv.serviceId}`}</div>
                    <div className="col-span-3">
                      {Number(srv.appliedUnitPrice || 0).toLocaleString()} đ / {srv.unit || 'kỳ'}
                    </div>
                    <div className="col-span-3 text-stay-text-secondary">
                      {getBillingMethodShortLabel(srv.billingMethod)}
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      {srv.billingMethod === 'METER_INDEX' && srv.lastIndex !== undefined
                        ? srv.lastIndex
                        : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
