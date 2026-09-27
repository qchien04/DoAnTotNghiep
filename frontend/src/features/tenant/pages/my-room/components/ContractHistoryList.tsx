import React, { useState } from 'react';
import { TenantContractHistory } from '@/shared/types/tenant';
import { Button, Modal } from '@/shared/components';
import { FileText, Calendar, Home, Shield, Zap, Droplets, CheckCircle2, History, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/shared/utils';

interface ContractHistoryListProps {
  contracts: TenantContractHistory[];
  isLoading?: boolean;
}

export const ContractHistoryList: React.FC<ContractHistoryListProps> = ({
  contracts,
  isLoading = false,
}) => {
  const [selectedContract, setSelectedContract] = useState<TenantContractHistory | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const getStatusBadge = (status: string, isCurrent: boolean) => {
    if (isCurrent) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Đang thuê
        </span>
      );
    }
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Hiệu lực
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Hết hạn
          </span>
        );
      case 'TERMINATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            Đã thanh lý
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            {status || 'Đã kết thúc'}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!contracts || contracts.length === 0) {
    return (
      <div className="bg-stay-card-bg border border-stay-border rounded-xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <History className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-stay-text">Chưa có lịch sử hợp đồng nào</p>
        <p className="text-xs text-stay-text-secondary max-w-sm mx-auto">
          Các hợp đồng thuê phòng của bạn (cả hiện tại và quá khứ) sẽ được lưu trữ và hiển thị tại đây để bạn tiện theo dõi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className={`bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
              contract.isCurrent
                ? 'border-stay-primary/40 ring-1 ring-stay-primary/20 bg-gradient-to-br from-stay-primary/5 via-white to-white'
                : 'border-stay-border hover:border-slate-300'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-stay-border/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stay-text font-mono">
                    Hợp đồng #{contract.id}
                  </span>
                  {getStatusBadge(contract.status, contract.isCurrent)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stay-text-secondary">
                  <Home className="w-3.5 h-3.5 text-stay-primary" />
                  <span className="font-semibold text-stay-text">{contract.roomName || 'Phòng trọ'}</span>
                  <span>•</span>
                  <span>{contract.buildingName || 'Tòa nhà'}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-extrabold text-stay-primary">
                  {formatCurrency(contract.monthlyRent)}
                </p>
                <p className="text-[10px] text-stay-text-secondary">/tháng</p>
              </div>
            </div>

            {/* Details */}
            <div className="py-3 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-stay-text-secondary">
                  <Calendar className="w-3.5 h-3.5" /> Thời hạn thuê:
                </span>
                <span className="font-medium text-stay-text">
                  {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-stay-text-secondary">
                  <Shield className="w-3.5 h-3.5" /> Tiền đặt cọc:
                </span>
                <span className="font-medium text-stay-text">
                  {formatCurrency(contract.depositAmount)}
                </span>
              </div>

              {contract.depositRefundAmount != null && (
                <div className="flex items-center justify-between text-emerald-700 font-medium">
                  <span>Tiền cọc đã hoàn lại:</span>
                  <span>{formatCurrency(contract.depositRefundAmount)}</span>
                </div>
              )}

              {contract.buildingAddress && (
                <div className="pt-1 text-[11px] text-slate-500 line-clamp-1">
                  📍 {contract.buildingAddress}
                </div>
              )}
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-stay-border/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Chủ nhà: <strong className="text-slate-600">{contract.landlordName || 'Nguyễn Văn Thành'}</strong>
              </span>

              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold text-stay-primary hover:text-stay-primary border-stay-primary/30 hover:bg-stay-primary/5 flex items-center gap-1"
                onClick={() => {
                  setSelectedContract(contract);
                  setDetailModalOpen(true);
                }}
              >
                Chi tiết hợp đồng <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal chi tiết hợp đồng */}
      <Modal
        title={selectedContract ? `Chi tiết hợp đồng #${selectedContract.id}` : 'Chi tiết hợp đồng'}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" variant="primary" size="md" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={650}
      >
        {selectedContract && (
          <div className="space-y-4 pt-2 text-xs">
            {/* Status Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-stay-text">Hợp đồng #{selectedContract.id}</p>
                <p className="text-slate-500 text-xs">
                  Hiệu lực từ {formatDate(selectedContract.startDate)} đến {formatDate(selectedContract.endDate)}
                </p>
              </div>
              {getStatusBadge(selectedContract.status, selectedContract.isCurrent)}
            </div>

            {/* Thông tin phòng & tòa nhà */}
            <div className="bg-white border border-stay-border rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-stay-text text-sm flex items-center gap-1.5">
                <Home className="w-4 h-4 text-stay-primary" /> Thông tin phòng thuê
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block">Phòng:</span>
                  <span className="font-bold text-slate-800">{selectedContract.roomName || 'Phòng trọ'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tòa nhà:</span>
                  <span className="font-semibold text-slate-800">{selectedContract.buildingName || 'Tòa nhà'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Địa chỉ:</span>
                  <span className="font-medium text-slate-800">{selectedContract.buildingAddress || 'Hà Nội'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Chủ trọ:</span>
                  <span className="font-semibold text-slate-800">{selectedContract.landlordName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Số điện thoại liên hệ:</span>
                  <span className="font-semibold text-slate-800">{selectedContract.landlordPhone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Chi phí & Chỉ số */}
            <div className="bg-white border border-stay-border rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-stay-text text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-stay-primary" /> Chi phí & Đặt cọc
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block">Tiền phòng hàng tháng:</span>
                  <span className="font-bold text-stay-primary text-sm">
                    {formatCurrency(selectedContract.monthlyRent)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tiền cọc ban đầu:</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(selectedContract.depositAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Số điện ban đầu:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    {selectedContract.services?.find((s: any) => (s.name || s.serviceName || '').toLowerCase().includes('điện'))?.lastIndex ?? 0} kWh
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Số nước ban đầu:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    {selectedContract.services?.find((s: any) => (s.name || s.serviceName || '').toLowerCase().includes('nước'))?.lastIndex ?? 0} m³
                  </span>
                </div>
              </div>
            </div>

            {/* Dịch vụ kèm theo */}
            {selectedContract.services && selectedContract.services.length > 0 && (
              <div className="bg-white border border-stay-border rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-stay-text text-sm">Dịch vụ thỏa thuận</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {selectedContract.services.map((srv, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-700">{srv.name}</span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(srv.price)}/{srv.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Điều khoản hợp đồng */}
            {selectedContract.termsAndConditions && (
              <div className="bg-white border border-stay-border rounded-xl p-4 space-y-1">
                <h4 className="font-bold text-stay-text text-sm">Điều khoản & Quy định</h4>
                <p className="text-slate-600 leading-relaxed text-xs whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedContract.termsAndConditions}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
