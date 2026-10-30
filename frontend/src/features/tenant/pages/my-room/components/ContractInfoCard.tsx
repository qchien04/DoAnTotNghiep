import React from 'react';
import { Button } from '@/shared/components';
import { Download, Phone, FileText } from 'lucide-react';
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
    <div className="bg-stay-card-bg border border-stay-border rounded-xl p-6 space-y-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-stay-text-secondary font-medium text-xs">
              Số HĐ: {contract?.contractNumber || 'HĐ-2026-P102'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stay-text">
            {room.name} - {room.buildingName}
          </h1>
          <p className="text-stay-text-secondary text-sm mt-0.5">
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

      {/* Contract Details Panel */}
      <div className="bg-stay-bg-app/40 border border-stay-border rounded-xl p-4 space-y-3 text-[14px]">
        <div className="flex items-center gap-2 pb-2 border-b border-stay-border-subtle">
          <FileText className="w-4 h-4 text-stay-primary" />
          <span className="text-[13px] font-semibold text-stay-text">
            Thông tin hợp đồng & Chủ trọ
          </span>
        </div>

        {/* Tòa nhà, Phòng & Chủ nhà */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8">
          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Tòa nhà / Khu:</span>
            <span className="text-stay-text font-medium text-[14px]">
              {room.buildingName || 'Phòng độc lập'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Chủ trọ:</span>
            <span className="text-stay-text font-medium text-[14px]">{room.landlord.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Phòng trọ:</span>
            <span className="text-stay-text font-semibold text-[14px]">{room.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Số điện thoại:</span>
            <a
              href={`tel:${room.landlord.phone}`}
              className="text-stay-primary hover:underline flex items-center gap-1 font-medium text-[14px]"
            >
              <Phone className="w-3.5 h-3.5" /> {room.landlord.phone}
            </a>
          </div>
        </div>

        {/* Điều khoản tài chính & Thời hạn */}
        <div className="pt-3 border-t border-stay-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8">
          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Tiền phòng:</span>
            <span className="font-bold text-stay-text text-[15px]">
              {room.monthlyRent.toLocaleString()} đ/tháng
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Tiền đặt cọc:</span>
            <span className="text-stay-text font-semibold text-[14px]">
              {contract?.depositAmount ? `${contract.depositAmount.toLocaleString()} đ` : '—'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Thời hạn hợp đồng:</span>
            <span className="text-stay-text text-[14px]">
              {contract?.startDate || '—'} → {contract?.endDate || '—'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Chu kỳ thu tiền:</span>
            <span className="text-stay-text text-[14px]">
              Ngày {(contract as any)?.paymentCycleDay || 5} hàng tháng
            </span>
          </div>
        </div>

        {/* Dịch vụ công tơ ban đầu nếu có */}
        {contract?.services && contract.services.filter((s) => s.billingMethod === 'METER_INDEX').length > 0 && (
          <div className="pt-2.5 border-t border-stay-border-subtle flex items-center gap-2">
            <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Chỉ số ban đầu:</span>
            <div className="flex flex-wrap items-center gap-3">
              {contract.services
                .filter((s) => s.billingMethod === 'METER_INDEX')
                .map((s, idx) => (
                  <span key={s.id || idx} className="text-[13px] text-stay-text">
                    <span className="text-stay-text-secondary">{s.serviceName || s.name}: </span>
                    <strong className="text-stay-text font-semibold">{s.lastIndex ?? 0} {s.unit || ''}</strong>
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

