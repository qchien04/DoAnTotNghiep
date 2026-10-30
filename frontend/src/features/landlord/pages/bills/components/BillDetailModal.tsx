import React, { useMemo } from 'react';
import { Printer } from 'lucide-react';
import { Modal, Button, Tag } from '@/shared/components';
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

  const hasAdjustments = adjustmentItems.length > 0;
  const hasPaidAmount = Number(bill?.paidAmount || 0) > 0 && bill?.status !== 'PAID';

  const renderStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
            Đã thanh toán
          </span>
        );
      case 'UNPAID':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
            Chờ thanh toán
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">
            Thanh toán 1 phần
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
            Quá hạn
          </span>
        );
      case 'DRAFT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            Bản nháp
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
            Đã hủy
          </span>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

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
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-stay-text font-medium block mb-1">
                  Phòng cho thuê
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {bill.roomName || '---'} {bill.buildingName ? `(${bill.buildingName})` : ''}
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium block mb-1">
                  Khách thuê đại diện
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {bill.representativeTenantName || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-stay-text font-medium block mb-1">
                  Kỳ cước hóa đơn
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {bill.billingPeriod || '---'}
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium block mb-1">
                  Ngày lập hóa đơn
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  {bill.createdAt ? formatDate(bill.createdAt) : '---'}
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium block mb-1">
                  Hạn nộp tiền
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  {bill.dueDate ? formatDate(bill.dueDate) : 'Trong kỳ'}
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium block mb-1">
                  Tình trạng thanh toán
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {bill.paidAt ? `Đã nộp (${formatDate(bill.paidAt)})` : 'Chưa thanh toán'}
                </div>
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
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: BẢNG PHỤ THU & GIẢM TRỪ (NẾU CÓ) */}
          {hasAdjustments && (
            <div className="space-y-2 pt-4 border-t border-stay-border-subtle">
              <h3 className="text-sm font-semibold text-stay-text m-0">
                Phụ thu & giảm trừ
              </h3>

              <div className="rounded-xl border border-stay-border overflow-hidden bg-stay-card-bg">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-stay-bg-app text-stay-text-secondary border-b border-stay-border text-xs font-semibold">
                    <tr>
                      <th className="p-2.5 pl-3 w-28 text-center">Loại</th>
                      <th className="p-2.5">Nguyên nhân / Nội dung</th>
                      <th className="p-2.5 text-center w-20">SL</th>
                      <th className="p-2.5 text-right w-36">Đơn giá</th>
                      <th className="p-2.5 text-right w-36 pr-3">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stay-border text-stay-text text-sm">
                    {adjustmentItems.map((adj, idx) => {
                      const isSurcharge = adj.itemType === 'SURCHARGE';
                      const cleanName = adj.itemName ? adj.itemName.replace(/^\[(Phụ thu|Giảm trừ)\]\s*/i, '') : 'Khoản phát sinh';
                      return (
                        <tr key={idx} className="hover:bg-stay-bg-app/40 transition-colors">
                          <td className="p-2.5 pl-3 text-center">
                            <Tag
                              className={`m-0 font-medium ${isSurcharge
                                  ? 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                                  : 'border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                                }`}
                            >
                              {isSurcharge ? 'Phụ thu' : 'Giảm trừ'}
                            </Tag>
                          </td>
                          <td className="p-2.5 font-medium">{cleanName}</td>
                          <td className="p-2.5 text-center">{adj.quantity || 1}</td>
                          <td className="p-2.5 text-right text-stay-text-secondary">
                            {formatCurrency(adj.unitPrice || 0)}
                          </td>
                          <td
                            className={`p-2.5 text-right font-bold pr-3 ${isSurcharge ? 'text-stay-text' : 'text-rose-600'
                              }`}
                          >
                            {isSurcharge ? '+' : '-'} {formatCurrency(Math.abs(adj.amount || 0))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TỔNG TIỀN HÓA ĐƠN */}
          <div className="pt-4 border-t border-stay-border space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stay-text text-sm uppercase">TỔNG TIỀN HÓA ĐƠN:</span>
              <span className="text-xl font-bold text-stay-primary">
                {formatCurrency(bill.totalAmount)}
              </span>
            </div>

            {hasPaidAmount && (
              <div className="pt-2 space-y-1 text-sm border-t border-stay-border/60">
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Đã thanh toán:</span>
                  <span>{formatCurrency(bill.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-dashed border-stay-border">
                  <span>Còn lại cần thu:</span>
                  <span>{formatCurrency(bill.remainingAmount || ((bill.totalAmount || 0) - (bill.paidAmount || 0)))}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BillDetailModal;
