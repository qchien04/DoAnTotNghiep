import React, { useMemo } from 'react';
import { Printer, Receipt } from 'lucide-react';
import { Modal, Button, StatusBadge, Tag } from '@/shared/components';
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

  const renderStatusBadge = (status: InvoiceStatus) => <StatusBadge status={status} size="lg" />;

  return (
    <Modal
      title={
        bill ? (
          <div className="flex items-center justify-between gap-4 pr-6 py-0.5">
            <div className="flex items-center gap-2.5">
              <Receipt className="w-5 h-5 text-stay-primary" />
              <span className="font-semibold text-stay-text text-base">Hóa đơn tiền phòng</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-stay-bg-app border border-stay-border text-stay-text-secondary">
                #{bill.id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-stay-text-secondary font-medium">Trạng thái:</span>
              {renderStatusBadge(bill.status)}
            </div>
          </div>
        ) : (
          'Chi tiết hóa đơn'
        )
      }
      open={open}
      onCancel={onCancel}
      width={960}
      centered
      destroyOnClose
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <Button
            key="print"
            size="md"
            variant="outline"
            onClick={() => window.print()}
            icon={<Printer className="w-3.5 h-3.5" />}
            className="h-9 px-4 rounded-lg border border-stay-border text-stay-text hover:bg-stay-bg-app bg-stay-card-bg font-medium text-[14px]"
          >
            In hóa đơn
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={onCancel}
              variant="outline"
              size="md"
              className="h-9 px-4 rounded-lg border border-stay-border text-stay-text hover:bg-stay-bg-app bg-stay-card-bg font-medium text-[14px]"
            >
              Đóng
            </Button>

            {bill && bill.status === 'DRAFT' && onPublish && (
              <Button
                variant="outline"
                size="md"
                className="h-9 px-4 rounded-lg border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium text-[14px]"
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
                  variant="primary"
                  size="md"
                  onClick={() => {
                    onCancel();
                    onOpenPayment(bill);
                  }}
                  className="h-9 px-4 rounded-lg bg-stay-primary hover:bg-stay-primary-hover font-medium text-white text-[14px] shadow-xs"
                >
                  Xác nhận thu tiền
                </Button>
              )}
          </div>
        </div>
      }
    >
      {bill && (
        <div className="mt-4 space-y-4 text-[14px]">
          {/* SECTION 1: THÔNG TIN CHUNG HÓA ĐƠN */}
          <div className="bg-stay-bg-app/40 border border-stay-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stay-border-subtle">
              <Receipt className="w-4 h-4 text-stay-primary" />
              <span className="text-[13px] font-semibold text-stay-text">
                Thông tin phòng thuê & Kỳ thanh toán
              </span>
            </div>

            {/* Dòng 1: Căn hộ & Khách thuê đại diện */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8">
              <div className="flex items-center gap-2">
                <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                  Tòa nhà / Khu:
                </span>
                <span className="text-stay-text font-medium text-[14px]">
                  {bill.buildingName || 'Phòng độc lập'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                  Khách đại diện:
                </span>
                <span className="text-stay-text font-medium text-[14px]">
                  {bill.representativeTenantName || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                  Phòng trọ:
                </span>
                <span className="text-stay-text font-semibold text-[14px]">
                  {bill.roomName || '---'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                  Số điện thoại:
                </span>
                <span className="text-stay-text font-medium text-[14px]">
                  {bill.representativeTenantPhone || '—'}
                </span>
              </div>
            </div>

            {/* Dòng 2: Kỳ cước & Thời hạn */}
            <div className="pt-3 border-t border-stay-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8">
              <div className="flex items-center gap-2">
                <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                  Kỳ cước:
                </span>
                <span className="text-stay-text font-semibold text-[14px]">
                  {bill.billingPeriod || '---'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                  Ngày lập hóa đơn:
                </span>
                <span className="text-stay-text text-[14px]">
                  {bill.createdAt ? formatDate(bill.createdAt) : '---'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                  Hạn nộp tiền:
                </span>
                <span className="text-stay-text text-[14px]">
                  {bill.dueDate ? formatDate(bill.dueDate) : 'Trong kỳ'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">
                  Ngày thanh toán:
                </span>
                <span className="text-stay-text text-[14px]">
                  {bill.paidAt ? formatDate(bill.paidAt) : 'Chưa thanh toán'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: BẢNG DỊCH VỤ & CHI PHÍ */}
          <div className="space-y-2 pt-2 border-t border-stay-border-subtle">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-stay-primary" />
              <span className="text-[13px] font-semibold text-stay-text">
                Bảng chi phí & Dịch vụ phòng
              </span>
            </div>

            <div className="rounded-xl border border-stay-border overflow-hidden bg-stay-card-bg">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stay-bg-app text-stay-text-secondary border-b border-stay-border text-[13px] font-semibold">
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
                    <td className="p-3 text-right font-bold text-[15px] text-stay-text pr-3">
                      {formatCurrency(bill.totalAmount)}
                    </td>
                  </tr>

                  {hasPaidAmount && (
                    <>
                      <tr className="border-t border-stay-border-subtle">
                        <td colSpan={5} className="p-2.5 pl-3 text-right font-medium text-[13px] text-stay-text-secondary">
                          Đã thanh toán:
                        </td>
                        <td className="p-2.5 text-right font-semibold text-[14px] text-stay-text pr-3">
                          {formatCurrency(bill.paidAmount || 0)}
                        </td>
                      </tr>
                      <tr className="border-t border-stay-border-subtle">
                        <td colSpan={5} className="p-2.5 pl-3 text-right font-semibold text-[13px] uppercase text-stay-text">
                          Còn lại cần thu:
                        </td>
                        <td className="p-2.5 text-right font-bold text-[15px] text-stay-text pr-3">
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
