import React, { useMemo } from 'react';
import { Printer } from 'lucide-react';
import { Modal, Button, Tag, StatusBadge } from '@/shared/components';
import { InvoiceResponse, InvoiceStatus } from '@/shared/types/landlord';
import { formatCurrency, formatDate } from '@/shared/utils';

interface BillDetailModalProps {
  open: boolean;
  bill: InvoiceResponse | null;
  onCancel: () => void;
  onOpenPayment: (bill: InvoiceResponse) => void;
  onPublish?: (bill: InvoiceResponse) => void;
}

export const BillDetailModal: React.FC<BillDetailModalProps> = ({
  open,
  bill,
  onCancel,
  onOpenPayment,
  onPublish,
}) => {
  const roomRentCost = useMemo(() => {
    if (!bill) return 0;
    const roomItem = bill.items?.find((it) => it.itemType === 'ROOM_RENT');
    return roomItem?.amount ?? bill.roomPrice ?? 0;
  }, [bill]);

  const serviceItems = useMemo(() => {
    if (!bill?.items) return [];
    return bill.items.filter(
      (it) => it.itemType === 'SERVICE' || (!it.itemType && it.contractServiceId != null)
    );
  }, [bill]);

  const adjustmentItems = useMemo(() => {
    if (!bill?.items) return [];
    return bill.items.filter(
      (it) =>
        it.itemType === 'SURCHARGE' ||
        it.itemType === 'DISCOUNT' ||
        (!it.itemType && it.contractServiceId == null && it.itemType !== 'ROOM_RENT')
    );
  }, [bill]);

  const hasPaidAmount = Number(bill?.paidAmount || 0) > 0 && bill?.status !== 'PAID';

  const renderStatusBadge = (status: InvoiceStatus) => <StatusBadge status={status} />;

  return (
    <Modal
      title={
        bill ? (
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stay-text text-base">Chi tiết hóa đơn</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-stay-bg-app border border-stay-border text-stay-text-secondary">
                #{bill.id}
              </span>
            </div>
            {renderStatusBadge(bill.status)}
          </div>
        ) : (
          'Chi tiết hóa đơn'
        )
      }
      open={open}
      onCancel={onCancel}
      width={960}
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            key="print"
            size="middle"
            onClick={() => window.print()}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            In hóa đơn
          </Button>

          <div className="flex items-center gap-2">
            <Button onClick={onCancel}>
              Đóng
            </Button>

            {bill && bill.status === 'DRAFT' && onPublish && (
              <Button
                className="border-amber-500 text-amber-600 hover:text-amber-500 font-medium"
                onClick={() => {
                  onCancel();
                  onPublish(bill);
                }}
              >
                Ban hành hóa đơn
              </Button>
            )}

            {bill &&
              (bill.status === 'UNPAID' || bill.status === 'PARTIALLY_PAID' || bill.status === 'OVERDUE') && (
                <Button
                  type="primary"
                  onClick={() => {
                    onCancel();
                    onOpenPayment(bill);
                  }}
                  className="bg-stay-primary hover:bg-stay-primary-hover font-medium"
                >
                  Xác nhận thu tiền
                </Button>
              )}
          </div>
        </div>
      }
    >
      {bill && (
        <div className="mt-4 space-y-5 text-[14px]">
          {/* SECTION 1: THÔNG TIN CHUNG HÓA ĐƠN */}
          <div className="space-y-3 text-[14px]">
            {/* PHẦN 1: PHÒNG & TÒA NHÀ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
                <span className="text-stay-text-secondary shrink-0 min-w-[100px]">Tòa nhà:</span>
                <span className="text-stay-text font-medium">
                  {bill.buildingName || 'Phòng độc lập'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
                <span className="text-stay-text-secondary shrink-0 min-w-[100px]">Phòng trọ:</span>
                <span className="text-stay-text font-semibold">
                  {bill.roomName || '---'}
                </span>
              </div>
            </div>

            {/* PHẦN 2: KHÁCH THUÊ ĐẠI DIỆN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 pt-1 border-t border-stay-border-subtle">
              <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
                <span className="text-stay-text-secondary shrink-0 min-w-[120px]">Khách đại diện:</span>
                <span className="text-stay-text font-medium">
                  {bill.representativeTenantName || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
                <span className="text-stay-text-secondary shrink-0 min-w-[120px]">Số điện thoại:</span>
                <span className="text-stay-text font-medium">
                  {bill.representativeTenantPhone || '—'}
                </span>
              </div>
            </div>

            {/* PHẦN 3: KỲ CƯỚC & THỜI HẠN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 pt-1 border-t border-stay-border-subtle">
              <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
                <span className="text-stay-text-secondary shrink-0 min-w-[120px]">Kỳ cước:</span>
                <span className="text-stay-text font-medium">
                  {bill.billingPeriod || '---'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
                <span className="text-stay-text-secondary shrink-0 min-w-[120px]">Ngày lập:</span>
                <span className="text-stay-text font-medium">
                  {bill.createdAt ? formatDate(bill.createdAt) : '---'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
                <span className="text-stay-text-secondary shrink-0 min-w-[120px]">Hạn nộp tiền:</span>
                <span className="text-stay-text font-medium">
                  {bill.dueDate ? formatDate(bill.dueDate) : 'Trong kỳ'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 py-1.5 border-b border-stay-border-subtle">
                <span className="text-stay-text-secondary shrink-0 min-w-[120px]">Tình trạng:</span>
                <span className="text-stay-text font-medium">
                  {bill.paidAt ? `Đã nộp (${formatDate(bill.paidAt)})` : 'Chưa thanh toán'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: BẢNG DỊCH VỤ & CHI PHÍ */}
          <div className="space-y-2 pt-2 border-t border-stay-border-subtle">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stay-text m-0">
                Dịch vụ & chi phí phòng
              </h3>
            </div>

            <div className="rounded-xl border border-stay-border overflow-hidden bg-stay-card-bg">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stay-bg-app text-stay-text-secondary border-b border-stay-border text-xs font-semibold">
                  <tr>
                    <th className="p-2.5 pl-3">Khoản mục</th>
                    <th className="p-2.5 text-right w-36">Đơn giá</th>
                    <th className="p-2.5 text-center w-24">Chỉ số cũ</th>
                    <th className="p-2.5 text-center w-36">Chỉ số mới / SL</th>
                    <th className="p-2.5 text-center w-24">Sử dụng</th>
                    <th className="p-2.5 text-right w-36 pr-3">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stay-border text-stay-text text-sm">
                  {/* 1. Tiền thuê phòng */}
                  <tr className="hover:bg-stay-bg-app/40 transition-colors">
                    <td className="p-2.5 pl-3">
                      <p className="font-semibold text-stay-text m-0">Tiền thuê phòng trọ</p>
                      <p className="text-xs text-stay-text-secondary m-0">Giá thuê theo hợp đồng</p>
                    </td>
                    <td className="p-2.5 text-right text-stay-text-secondary">
                      {formatCurrency(roomRentCost)}
                    </td>
                    <td className="p-2.5 text-center text-stay-text-muted">-</td>
                    <td className="p-2.5 text-center text-stay-text-secondary">1</td>
                    <td className="p-2.5 text-center font-medium text-stay-text">1 tháng</td>
                    <td className="p-2.5 text-right font-bold text-stay-text pr-3">
                      {formatCurrency(roomRentCost)}
                    </td>
                  </tr>

                  {/* 2. Dịch vụ tiện ích */}
                  {serviceItems.map((svc, idx) => {
                    const hasMeterIndex =
                      svc.previousIndex !== undefined &&
                      svc.currentIndex !== undefined &&
                      (svc.currentIndex > 0 || svc.previousIndex > 0);
                    const consumed = hasMeterIndex
                      ? (svc.currentIndex ?? 0) - (svc.previousIndex ?? 0)
                      : (svc.quantity ?? 1);

                    return (
                      <tr key={idx} className="hover:bg-stay-bg-app/40 transition-colors">
                        <td className="p-2.5 pl-3">
                          <p className="font-semibold text-stay-text m-0">{svc.itemName}</p>
                          {svc.note && (
                            <p className="text-xs text-stay-text-secondary m-0">{svc.note}</p>
                          )}
                        </td>
                        <td className="p-2.5 text-right text-stay-text-secondary">
                          {formatCurrency(svc.unitPrice || 0)}
                        </td>
                        <td className="p-2.5 text-center">
                          {hasMeterIndex ? (
                            <span className="px-2 py-0.5 rounded bg-stay-bg-app border border-stay-border font-semibold text-stay-text text-xs">
                              {svc.previousIndex}
                            </span>
                          ) : (
                            <span className="text-stay-text-muted">-</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-medium">
                          {hasMeterIndex ? (
                            <span className="px-2 py-0.5 rounded bg-stay-bg-app border border-stay-border font-semibold text-stay-text text-xs">
                              {svc.currentIndex}
                            </span>
                          ) : (
                            svc.quantity || 1
                          )}
                        </td>
                        <td className="p-2.5 text-center font-medium text-stay-text">
                          {consumed}
                        </td>
                        <td className="p-2.5 text-right font-bold text-stay-text pr-3">
                          {formatCurrency(svc.amount || 0)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* 3. Phụ thu & giảm trừ (nếu có) */}
                  {adjustmentItems.map((adj, idx) => {
                    const isSurcharge = adj.itemType === 'SURCHARGE';
                    const cleanName = adj.itemName
                      ? adj.itemName.replace(/^\[(Phụ thu|Giảm trừ)\]\s*/i, '')
                      : 'Khoản phát sinh';
                    return (
                      <tr key={`adj-${idx}`} className="hover:bg-stay-bg-app/40 transition-colors">
                        <td className="p-2.5 pl-3">
                          <div className="flex items-center gap-1.5">
                            <Tag
                              className={`m-0 font-medium ${
                                isSurcharge
                                  ? 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                                  : 'border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                              }`}
                            >
                              {isSurcharge ? 'Phụ thu' : 'Giảm trừ'}
                            </Tag>
                            <span className="font-semibold text-stay-text">{cleanName}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-right text-stay-text-secondary">
                          {formatCurrency(adj.unitPrice || 0)}
                        </td>
                        <td className="p-2.5 text-center text-stay-text-muted">-</td>
                        <td className="p-2.5 text-center">{adj.quantity || 1}</td>
                        <td className="p-2.5 text-center font-medium text-stay-text">
                          {adj.quantity || 1} lần
                        </td>
                        <td
                          className={`p-2.5 text-right font-bold pr-3 ${
                            isSurcharge ? 'text-stay-text' : 'text-rose-600'
                          }`}
                        >
                          {isSurcharge ? '+' : '-'} {formatCurrency(Math.abs(adj.amount || 0))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* TỔNG TIỀN NẰM NGAY CUỐI BẢNG (TFOOT) */}
                <tfoot className="bg-stay-bg-app border-t border-stay-border text-[14px]">
                  <tr>
                    <td colSpan={5} className="p-3 pl-3 text-right font-semibold text-stay-text uppercase text-[13px]">
                      Tổng tiền hóa đơn:
                    </td>
                    <td className="p-3 text-right font-bold text-[15px] text-stay-primary pr-3">
                      {formatCurrency(bill.totalAmount)}
                    </td>
                  </tr>

                  {hasPaidAmount && (
                    <>
                      <tr className="border-t border-stay-border-subtle text-emerald-600">
                        <td colSpan={5} className="p-2.5 pl-3 text-right font-medium text-[13px]">
                          Đã thanh toán:
                        </td>
                        <td className="p-2.5 text-right font-semibold text-[14px] pr-3">
                          {formatCurrency(bill.paidAmount || 0)}
                        </td>
                      </tr>
                      <tr className="border-t border-stay-border-subtle text-rose-600">
                        <td colSpan={5} className="p-2.5 pl-3 text-right font-semibold text-[13px] uppercase">
                          Còn lại cần thu:
                        </td>
                        <td className="p-2.5 text-right font-bold text-[15px] pr-3">
                          {formatCurrency(
                            bill.remainingAmount ||
                              ((bill.totalAmount || 0) - (bill.paidAmount || 0))
                          )}
                        </td>
                      </tr>
                    </>
                  )}
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BillDetailModal;
