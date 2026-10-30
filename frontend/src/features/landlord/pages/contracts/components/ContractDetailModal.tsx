import React from 'react';
import { Users, Zap } from 'lucide-react';
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

  const renderStatus = (st: string) => <StatusBadge status={st} />;

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
      title={`Chi tiết hợp đồng thuê`}
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
            className="h-10 px-5 rounded-xl border border-stay-border text-stay-text hover:bg-stay-bg-app bg-stay-card-bg font-medium"
          >
            Đóng
          </Button>
          {activeContract.status === 'ACTIVE' && onOpenTerminate && (
            <Button
              key="terminate"
              variant="danger"
              size="md"
              onClick={() => {
                onCancel();
                onOpenTerminate(activeContract);
              }}
              className="h-10 px-5 rounded-xl font-semibold text-white shadow-xs"
            >
              Thanh lý hợp đồng
            </Button>
          )}
        </div>
      }
    >
      <div className="mt-4 space-y-5 text-[14px]">
        {/* SECTION 1: THÔNG TIN HỢP ĐỒNG */}
        <div className="space-y-3 text-[14px]">
          {/* PHẦN 1: PHÒNG & TÒA NHÀ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0 min-w-[100px]">Tòa nhà:</span>
              <span className="text-stay-text font-medium">
                {activeContract.buildingName || 'Phòng độc lập'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0 min-w-[100px]">Phòng trọ:</span>
              <span className="text-stay-text font-semibold">
                {activeContract.roomName}
              </span>
            </div>
          </div>

          {/* PHẦN 2: KHÁCH THUÊ ĐẠI DIỆN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 pt-1 border-t border-stay-border-subtle">
            <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0 min-w-[120px]">Khách đại diện:</span>
              <span className="text-stay-text font-medium">
                {activeContract.representativeTenantName || '—'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0 min-w-[120px]">Số điện thoại:</span>
              <span className="text-stay-text font-medium">
                {activeContract.representativeTenantPhone || '—'}
              </span>
            </div>
          </div>

          {/* PHẦN 3: ĐIỀU KHOẢN TÀI CHÍNH & THỜI HẠN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 pt-1 border-t border-stay-border-subtle">
            <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0 min-w-[130px]">Tiền thuê phòng:</span>
              <span className="text-stay-text font-medium">
                {Number(activeContract.rentPrice || 0).toLocaleString()} đ/tháng
              </span>
            </div>

            <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0 min-w-[130px]">Tiền đặt cọc:</span>
              <span className="text-stay-text font-medium">
                {Number(activeContract.depositAmount || 0).toLocaleString()} đ
              </span>
            </div>

            <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0 min-w-[130px]">Thời hạn hợp đồng:</span>
              <span className="text-stay-text font-medium">
                {activeContract.startDate || '—'} đến {activeContract.endDate || '—'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0 min-w-[130px]">Chu kỳ thu tiền:</span>
              <span className="text-stay-text font-medium">
                Ngày {activeContract.paymentCycleDay || 5} hàng tháng
              </span>
            </div>

            <div className="flex items-center gap-2 py-1.5 border-b border-stay-border-subtle sm:col-span-2">
              <span className="text-stay-text-secondary shrink-0 min-w-[130px]">Trạng thái hợp đồng:</span>
              <div>{renderStatus(activeContract.status)}</div>
            </div>
          </div>
        </div>

        {/* SECTION 2: BẢNG DANH SÁCH KHÁCH THUÊ TRONG PHÒNG */}
        <div className="space-y-2 pt-2 border-t border-stay-border-subtle">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-stay-primary" />
            <label className="text-stay-text font-bold block m-0">
              Danh sách khách thuê trong phòng
            </label>
          </div>

          <div className="border border-stay-border rounded-xl overflow-hidden bg-stay-card-bg">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text-secondary font-semibold text-xs">
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-stay-primary-subtle text-stay-primary border border-stay-primary/20">
                            ★ Đại diện
                          </span>
                        ) : (
                          <span className="text-stay-text-muted text-xs">Thành viên</span>
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

        {/* SECTION 5: BẢNG DỊCH VỤ TIỆN ÍCH ÁP DỤNG */}
        <div className="space-y-2 pt-2 border-t border-stay-border-subtle">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-stay-primary" />
            <label className="text-stay-text font-bold block m-0">
              Dịch vụ tiện ích áp dụng
            </label>
          </div>

          {services.length > 0 ? (
            <div className="border border-stay-border rounded-xl overflow-hidden bg-stay-card-bg">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text-secondary font-semibold text-xs">
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
                      <td className="py-2.5 px-3 font-semibold text-stay-primary">
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
            <div className="py-4 text-center text-xs text-stay-text-muted border border-dashed border-stay-border rounded-xl bg-stay-bg-app">
              Hợp đồng này không đăng ký dịch vụ tính phí riêng.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
