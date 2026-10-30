import React from 'react';
import { Users, Zap, FileText } from 'lucide-react';
import { Modal, Button, StatusBadge } from '@/shared/components';
import { RentalContract } from '@/shared/types/landlord';
import { getBillingMethodShortLabel } from '@/shared/utils';
import { useContractDetail } from '@/shared/hooks';

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
  // Tải chi tiết đầy đủ hợp đồng (dịch vụ & khách thuê) từ Backend
  const { contract: detailedContract } = useContractDetail(
    open && contract?.id ? contract.id : undefined
  );

  if (!contract) return null;

  const activeContract = detailedContract || contract;

  // Danh sách khách thuê với fallback khách đại diện nếu mảng rỗng
  const tenants: (Partial<RentalContract['tenants'] extends (infer U)[] | undefined ? U : any>)[] =
    activeContract.tenants && activeContract.tenants.length > 0
      ? activeContract.tenants
      : activeContract.representativeTenantName
        ? [
          {
            id: activeContract.representativeTenantId || 'rep',
            fullName: activeContract.representativeTenantName,
            phone: activeContract.representativeTenantPhone || '—',
            idCardNumber: '—',
            hometown: '—',
            isRepresentative: true,
            linkStatus: 'NOT_LINKED',
          },
        ]
        : [];

  const services = activeContract.services || [];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center justify-between gap-4 pr-6 py-0.5">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-stay-primary" />
            <span className="font-semibold text-stay-text text-base">
              Chi tiết hợp đồng #{activeContract.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-stay-text-secondary font-medium">Trạng thái:</span>
            <StatusBadge status={activeContract.status} size="lg" />
          </div>
        </div>
      }
      width={920}
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
          {activeContract.status === 'ACTIVE' && onOpenTerminate && (
            <Button
              key="terminate"
              variant="primary"
              size="md"
              onClick={() => {
                onCancel();
                onOpenTerminate(activeContract);
              }}
              className="h-9 px-4 rounded-lg font-medium text-white shadow-xs text-[14px] bg-stay-primary hover:bg-stay-primary-hover"
            >
              Thanh lý hợp đồng
            </Button>
          )}
        </div>
      }
    >
      <div className="mt-4 space-y-4 text-[14px]">
        {/* SECTION 1: TỔNG QUAN HỢP ĐỒNG */}
        <div className="bg-stay-bg-app/40 border border-stay-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-stay-border-subtle">
            <FileText className="w-4 h-4 text-stay-primary" />
            <span className="text-[13px] font-semibold text-stay-text">
              Thông tin phòng thuê & Điều khoản hợp đồng
            </span>
          </div>

          {/* Căn hộ & Khách thuê đại diện */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8">
            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                Tòa nhà / Khu:
              </span>
              <span className="text-stay-text font-medium text-[14px]">
                {activeContract.buildingName || 'Phòng độc lập'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                Khách đại diện:
              </span>
              <span className="text-stay-text font-medium text-[14px]">
                {activeContract.representativeTenantName || '—'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                Phòng thuê:
              </span>
              <span className="text-stay-text font-semibold text-[14px]">
                {activeContract.roomName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                Số điện thoại:
              </span>
              <span className="text-stay-text font-medium text-[14px]">
                {activeContract.representativeTenantPhone || '—'}
              </span>
            </div>
          </div>

          {/* Điều khoản tài chính & Thời hạn */}
          <div className="pt-3 border-t border-stay-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8">
            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                Tiền thuê phòng:
              </span>
              <span className="font-bold text-stay-text text-[15px]">
                {Number(activeContract.rentPrice || 0).toLocaleString()} đ/tháng
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                Tiền đặt cọc:
              </span>
              <span className="text-stay-text font-semibold text-[14px]">
                {Number(activeContract.depositAmount || 0).toLocaleString()} đ
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                Thời hạn hợp đồng:
              </span>
              <span className="text-stay-text text-[14px]">
                {activeContract.startDate || '—'} → {activeContract.endDate || '—'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                Chu kỳ thu tiền:
              </span>
              <span className="text-stay-text text-[14px]">
                Ngày {activeContract.paymentCycleDay || 5} hàng tháng
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: BẢNG DANH SÁCH KHÁCH THUÊ TRONG PHÒNG */}
        <div className="space-y-2 pt-2 border-t border-stay-border-subtle">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-stay-primary" />
            <span className="text-[13px] font-semibold text-stay-text">
              Khách thuê đang ở ({tenants.length})
            </span>
          </div>

          <div className="border border-stay-border rounded-xl overflow-hidden bg-stay-card-bg">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text-secondary font-semibold text-[13px]">
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Số điện thoại</th>
                  <th className="py-2.5 px-3">CCCD / CMND</th>
                  <th className="py-2.5 px-3">Quê quán</th>
                  <th className="py-2.5 px-3 text-center">Vai trò</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stay-border-subtle">
                {tenants.length > 0 ? (
                  tenants.map((t, idx) => (
                    <tr key={t.id || idx} className="hover:bg-stay-bg-app/50 transition">
                      <td className="py-2.5 px-3 text-center text-stay-text-muted">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-stay-text">
                        {t.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-stay-text-secondary">{t.phone || '—'}</td>
                      <td className="py-2.5 px-3 text-stay-text-secondary">{t.idCardNumber || (t as any).identityCard || '—'}</td>
                      <td className="py-2.5 px-3 text-stay-text-secondary">{t.hometown || '—'}</td>
                      <td className="py-2.5 px-3 text-center">
                        {t.isRepresentative ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stay-primary-subtle text-stay-primary border border-stay-primary/20">
                            Đại diện
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-stay-text-muted bg-stay-bg-app border border-stay-border">
                            Thành viên
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-xs text-stay-text-muted">
                      Chưa có danh sách khách thuê
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: BẢNG DỊCH VỤ TIỆN ÍCH ÁP DỤNG */}
        <div className="space-y-2 pt-2 border-t border-stay-border-subtle">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-stay-primary" />
            <span className="text-[13px] font-semibold text-stay-text">
              Dịch vụ tiện ích thỏa thuận ({services.length})
            </span>
          </div>

          {services.length > 0 ? (
            <div className="border border-stay-border rounded-xl overflow-hidden bg-stay-card-bg">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text-secondary font-semibold text-[13px]">
                    <th className="py-2.5 px-3 w-12 text-center">STT</th>
                    <th className="py-2.5 px-3">Tên dịch vụ</th>
                    <th className="py-2.5 px-3">Đơn giá áp dụng</th>
                    <th className="py-2.5 px-3">Hình thức tính</th>
                    <th className="py-2.5 px-3 text-right">Chỉ số bắt đầu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stay-border-subtle">
                  {services.map((srv, idx) => (
                    <tr key={srv.id || idx} className="hover:bg-stay-bg-app/50 transition">
                      <td className="py-2.5 px-3 text-center text-stay-text-muted">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-stay-text">
                        {srv.serviceName || `Dịch vụ #${srv.serviceId}`}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-stay-text">
                        {Number(srv.appliedUnitPrice || 0).toLocaleString()} đ / {srv.unit || 'kỳ'}
                      </td>
                      <td className="py-2.5 px-3 text-stay-text-secondary">
                        {getBillingMethodShortLabel(srv.billingMethod)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-stay-text">
                        {srv.billingMethod === 'METER_INDEX' && srv.lastIndex !== undefined ? (
                          srv.lastIndex
                        ) : (
                          <span className="text-stay-text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-3.5 text-center text-xs text-stay-text-muted border border-dashed border-stay-border rounded-xl bg-stay-bg-app">
              Hợp đồng này không đăng ký dịch vụ tính phí riêng.
            </div>
          )}
        </div>

        {/* SECTION 4: ĐIỀU KHOẢN VÀ QUY ĐỊNH */}
        {activeContract.termsAndConditions && (
          <div className="space-y-1.5 pt-2 border-t border-stay-border-subtle">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-stay-primary" />
              <span className="text-[13px] font-semibold text-stay-text">
                Điều khoản & Quy định hợp đồng
              </span>
            </div>
            <div className="p-3 rounded-xl bg-stay-bg-app/40 border border-stay-border text-stay-text text-[14px] whitespace-pre-line leading-relaxed">
              {activeContract.termsAndConditions}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
