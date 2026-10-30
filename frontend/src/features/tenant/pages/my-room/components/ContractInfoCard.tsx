import React from 'react';
import { Button } from '@/shared/components';
import { Download, Phone } from 'lucide-react';
import { message } from 'antd';
import { MyRoomDetails } from '@/shared/types/tenant';

interface ContractInfoCardProps {
  roomDetails: MyRoomDetails;
}

export const ContractInfoCard: React.FC<ContractInfoCardProps> = ({ roomDetails }) => {
  const room = roomDetails.room;
  const contract = roomDetails.contract;

  if (!room) return null;

  return (
    <div className="bg-stay-card-bg border border-stay-border rounded-xl p-6 space-y-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className=" text-stay-text-secondary font-medium">
              Số HĐ: {contract?.contractNumber || 'HĐ-2026-P102'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stay-text">
            {room.name} - {room.buildingName}
          </h1>
          <p className=" text-stay-text-secondary mt-0.5">
            {room.address}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => message.success('Đang tải bản PDF hợp đồng HĐ-2026-P102...')}
          >
            Tải PDF hợp đồng
          </Button>
        </div>
      </div>

      {/* Contract Details Grid */}
      <div className="space-y-4 pt-4 border-t border-stay-border text-[14px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-stay-text font-medium block mb-1">
              Phòng cho thuê
            </label>
            <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
              {room.name} {room.buildingName ? `(${room.buildingName})` : ''}
            </div>
          </div>

          <div>
            <label className="text-stay-text font-medium block mb-1">
              Chủ nhà cho thuê
            </label>
            <div className="h-10 px-3 flex items-center justify-between rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
              <span>{room.landlord.name}</span>
              <a
                href={`tel:${room.landlord.phone}`}
                className="text-stay-primary hover:underline flex items-center gap-1 text-xs font-normal"
              >
                <Phone className="w-3 h-3" /> {room.landlord.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-stay-text font-medium block mb-1">
              Tiền phòng hàng tháng
            </label>
            <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-primary font-bold">
              {room.monthlyRent.toLocaleString()} đ/tháng
            </div>
          </div>

          <div>
            <label className="text-stay-text font-medium block mb-1">
              Tiền đặt cọc
            </label>
            <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
              {contract?.depositAmount ? `${contract.depositAmount.toLocaleString()} đ` : '3.800.000 đ'}
            </div>
          </div>

          <div>
            <label className="text-stay-text font-medium block mb-1">
              Thời hạn hợp đồng
            </label>
            <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
              {contract?.startDate || '01/10/2026'} - {contract?.endDate || '30/09/2027'}
            </div>
          </div>

          <div>
            <label className="text-stay-text font-medium block mb-1">
              Chu kỳ thanh toán
            </label>
            <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
              Ngày {(contract as any)?.paymentCycleDay || 5} hàng tháng
            </div>
          </div>
        </div>

        {/* Dịch vụ công tơ ban đầu nếu có */}
        {contract?.services && contract.services.filter((s) => s.billingMethod === 'METER_INDEX').length > 0 && (
          <div>
            <label className="text-stay-text font-medium block mb-1">
              Dịch vụ công tơ ban đầu
            </label>
            <div className="min-h-10 px-3 py-2 flex flex-wrap items-center gap-3 rounded-lg border border-stay-border bg-stay-card-bg text-stay-text text-xs">
              {contract.services
                .filter((s) => s.billingMethod === 'METER_INDEX')
                .map((s, idx) => (
                  <span key={s.id || idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stay-bg-app border border-stay-border">
                    <span className="text-stay-text-secondary">{s.serviceName || s.name}:</span>
                    <strong className="text-stay-primary">{s.lastIndex ?? 0} {s.unit || ''}</strong>
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
