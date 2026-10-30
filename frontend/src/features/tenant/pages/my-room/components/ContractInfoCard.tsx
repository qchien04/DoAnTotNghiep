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
      <div className="space-y-3 pt-4 border-t border-stay-border text-[14px]">
        {/* PHẦN 1: PHÒNG & TÒA NHÀ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[100px]">Tòa nhà:</span>
            <span className="text-stay-text font-medium">
              {room.buildingName || 'Phòng độc lập'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[100px]">Phòng trọ:</span>
            <span className="text-stay-text font-semibold">
              {room.name}
            </span>
          </div>
        </div>

        {/* PHẦN 2: THÔNG TIN CHỦ NHÀ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 pt-1 border-t border-stay-border-subtle">
          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[120px]">Chủ nhà:</span>
            <span className="text-stay-text font-medium">{room.landlord.name}</span>
          </div>

          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[120px]">Số điện thoại:</span>
            <a
              href={`tel:${room.landlord.phone}`}
              className="text-stay-primary hover:underline flex items-center gap-1 font-medium"
            >
              <Phone className="w-3.5 h-3.5" /> {room.landlord.phone}
            </a>
          </div>
        </div>

        {/* PHẦN 3: ĐIỀU KHOẢN TÀI CHÍNH & THỜI HẠN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 pt-1 border-t border-stay-border-subtle">
          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[130px]">Tiền phòng:</span>
            <span className="text-stay-text font-bold text-stay-primary">
              {room.monthlyRent.toLocaleString()} đ/tháng
            </span>
          </div>

          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[130px]">Tiền đặt cọc:</span>
            <span className="text-stay-text font-medium">
              {contract?.depositAmount ? `${contract.depositAmount.toLocaleString()} đ` : '3.800.000 đ'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[130px]">Thời hạn hợp đồng:</span>
            <span className="text-stay-text font-medium">
              {contract?.startDate || '01/10/2026'} - {contract?.endDate || '30/09/2027'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
            <span className="text-stay-text-secondary shrink-0 min-w-[130px]">Chu kỳ thanh toán:</span>
            <span className="text-stay-text font-medium">
              Ngày {(contract as any)?.paymentCycleDay || 5} hàng tháng
            </span>
          </div>
        </div>

        {/* Dịch vụ công tơ ban đầu nếu có */}
        {contract?.services && contract.services.filter((s) => s.billingMethod === 'METER_INDEX').length > 0 && (
          <div className="pt-1 border-t border-stay-border-subtle">
            <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0 min-w-[130px]">Dịch vụ công tơ:</span>
              <div className="flex flex-wrap items-center gap-3">
                {contract.services
                  .filter((s) => s.billingMethod === 'METER_INDEX')
                  .map((s, idx) => (
                    <span key={s.id || idx} className="text-xs text-stay-text">
                      <span className="text-stay-text-secondary">{s.serviceName || s.name}: </span>
                      <strong className="text-stay-text font-semibold">{s.lastIndex ?? 0} {s.unit || ''}</strong>
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

