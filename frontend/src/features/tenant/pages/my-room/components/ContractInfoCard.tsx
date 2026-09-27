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
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Đang thuê hoạt động
            </span>
            <span className="text-xs text-stay-text-secondary font-medium">
              Số HĐ: {contract?.contractNumber || 'HĐ-2026-P102'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stay-text">
            {room.name} - {room.buildingName}
          </h1>
          <p className="text-xs text-stay-text-secondary mt-0.5">
            {room.address}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-stay-bg-app border border-stay-border rounded-xl text-right">
            <span className="text-[11px] text-slate-500 block">Tiền phòng tháng:</span>
            <span className="text-lg font-bold text-stay-primary">
              {room.monthlyRent.toLocaleString()} đ
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => message.success('Đang tải bản PDF hợp đồng HĐ-2026-P102...')}
          >
            Tải PDF
          </Button>
        </div>
      </div>

      {/* Contract Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stay-border text-xs">
        <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border space-y-1">
          <span className="font-semibold text-slate-500 block">Chủ nhà cho thuê:</span>
          <p className="font-bold text-stay-text text-sm">{room.landlord.name}</p>
          <p className="text-slate-500 flex items-center gap-1">
            <Phone className="w-3 h-3 text-stay-primary" /> {room.landlord.phone}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border space-y-1">
          <span className="font-semibold text-slate-500 block">Thời hạn hợp đồng:</span>
          <p className="font-bold text-stay-text text-sm">
            {contract?.startDate || '01/10/2026'} - {contract?.endDate || '30/09/2027'}
          </p>
          <p className="text-slate-500">Chu kỳ thu tiền: Ngày 05 hàng tháng</p>
        </div>

        <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border space-y-1">
          <span className="font-semibold text-slate-500 block">Chỉ số bàn giao ban đầu:</span>
          <p className="text-stay-text">
            Điện: <strong className="text-amber-700">{contract?.initialElectricity || 125} kWh</strong> | Nước: <strong className="text-blue-700">{contract?.initialWater || 15} m³</strong>
          </p>
          <p className="text-slate-500">Tiền cọc: {contract?.depositAmount?.toLocaleString() || '3.800.000'} VNĐ</p>
        </div>
      </div>
    </div>
  );
};
