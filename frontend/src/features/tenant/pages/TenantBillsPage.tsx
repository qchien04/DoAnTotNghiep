import React, { useState, useMemo } from 'react';
import { useMyBills, useVietQRPayment } from '@/shared/hooks';
import { Button, Skeleton, Modal } from '@/shared/components';
import { message } from 'antd';
import {
  Receipt,
  QrCode,
  Zap,
  Droplets,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Eye,
  CreditCard,
  FileText,
} from 'lucide-react';
import { Bill } from '@/shared/types/landlord';
import { formatCurrency } from '@/shared/utils';
import { VietQRPaymentModal } from './my-room/components/VietQRPaymentModal';

export const TenantBillsPage: React.FC = () => {
  const { bills, isLoading, confirmTransferred, isConfirming } = useMyBills();

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID' | 'OVERDUE'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // VietQR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeBill, setActiveBill] = useState<Bill | null>(null);
  const { qrData: vietQRData } = useVietQRPayment(activeBill ? String(activeBill.id) : undefined);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const handleOpenVietQR = (bill: Bill) => {
    setActiveBill(bill);
    setQrModalOpen(true);
  };

  const handleOpenDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setDetailModalOpen(true);
  };

  const handleConfirmPaid = async () => {
    if (!activeBill) return;
    try {
      await confirmTransferred(String(activeBill.id));
      message.success('Hệ thống đã ghi nhận thông báo chuyển khoản! Đang xác nhận gạch nợ tự động.');
      setQrModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Lỗi cập nhật thanh toán');
    }
  };

  // KPIs
  const stats = useMemo(() => {
    let unpaidTotal = 0;
    let paidTotal = 0;
    let unpaidCount = 0;
    let paidCount = 0;
    let overdueCount = 0;

    let totalCount = bills.length;

    bills.forEach((b: any) => {
      const remaining = Number(b.remainingAmount ?? (b.status === 'PAID' ? 0 : b.totalAmount ?? 0));
      const paid = Number(b.paidAmount ?? (b.status === 'PAID' ? b.totalAmount ?? 0 : 0));

      if (b.status === 'PAID') {
        paidCount++;
        paidTotal += paid;
      } else if (b.status === 'OVERDUE') {
        overdueCount++;
        unpaidTotal += remaining;
      } else {
        unpaidCount++;
        unpaidTotal += remaining;
      }
    });

    return { unpaidTotal, paidTotal, unpaidCount, paidCount, overdueCount, totalCount };
  }, [bills]);

  // Filtered bills
  const filteredBills = useMemo(() => {
    return bills.filter((b: any) => {
      // Status filter
      if (statusFilter === 'UNPAID' && b.status === 'PAID') return false;
      if (statusFilter === 'PAID' && b.status !== 'PAID') return false;
      if (statusFilter === 'OVERDUE' && b.status !== 'OVERDUE') return false;

      // Keyword filter
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const code = (b.billNumber || b.invoiceCode || '').toLowerCase();
        const month = (b.billingMonth || '').toLowerCase();
        const room = (b.roomCode || '').toLowerCase();
        return code.includes(kw) || month.includes(kw) || room.includes(kw);
      }

      return true;
    });
  }, [bills, statusFilter, searchKeyword]);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã thanh toán
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-3.5 h-3.5" /> Quá hạn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" /> Chờ thanh toán
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stay-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stay-text flex items-center gap-2">
            <Receipt className="w-6 h-6 text-stay-primary" />
            Quản Lý Hóa Đơn & Thanh Toán
          </h1>
          <p className="text-xs text-stay-text-secondary mt-0.5">
            Tra cứu hóa đơn tiền phòng, điện nước hàng tháng, xem lại các hóa đơn trước đó và thanh toán nhanh chóng qua VietQR.
          </p>
        </div>
      </div>

      {/* Stats KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stay-card-bg border border-amber-500/30 rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Cần thanh toán</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stay-text mt-2">
            {formatCurrency(stats.unpaidTotal)}
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
            {stats.unpaidCount + stats.overdueCount} hóa đơn chưa hoàn tất
          </p>
        </div>

        <div className="bg-stay-card-bg border border-emerald-500/30 rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Đã thanh toán</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stay-text mt-2">
            {formatCurrency(stats.paidTotal)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            {stats.paidCount} hóa đơn đã gạch nợ thành công
          </p>
        </div>

        <div className="bg-stay-card-bg border border-stay-border rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stay-text-secondary">Tổng số kỳ hóa đơn</span>
            <div className="w-8 h-8 rounded-lg bg-stay-bg-app flex items-center justify-center text-stay-text-secondary">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stay-text mt-2">{stats.totalCount}</p>
          <p className="text-[11px] text-stay-text-secondary mt-0.5">
            Toàn bộ lịch sử các tháng và các phòng đã thuê
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-stay-card-bg border border-stay-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
          {[
            { key: 'ALL', label: `Tất cả (${stats.totalCount})` },
            { key: 'UNPAID', label: `Chờ thanh toán (${stats.unpaidCount})` },
            { key: 'PAID', label: `Đã thanh toán (${stats.paidCount})` },
            { key: 'OVERDUE', label: `Quá hạn (${stats.overdueCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-stay-primary text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

            {/* Search bar */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tháng, phòng..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-stay-text focus:outline-none focus:border-stay-primary focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Bill List */}
          {filteredBills.length === 0 ? (
            <div className="bg-white border border-stay-border rounded-2xl p-10 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Receipt className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stay-text">Không tìm thấy hóa đơn nào</p>
              <p className="text-xs text-stay-text-secondary max-w-sm mx-auto">
                Không có hóa đơn nào khớp với bộ lọc hiện tại. Khi chủ trọ chốt số điện nước và xuất hóa đơn, thông tin sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBills.map((b: any) => {
                const total = Number(b.totalAmount || 0);
                const remaining = Number(b.remainingAmount ?? (b.status === 'PAID' ? 0 : total));
                const isPaid = b.status === 'PAID';

                return (
                  <div
                    key={b.id}
                    className={`bg-white border rounded-2xl p-5 transition-all duration-200 hover:shadow-md space-y-3.5 ${
                      isPaid
                        ? 'border-stay-border'
                        : 'border-amber-300 ring-1 ring-amber-200/50 bg-gradient-to-br from-amber-50/20 via-white to-white'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-stay-text">
                            #{b.id}
                          </span>
                          {getStatusBadge(b.status)}
                        </div>
                      <div className="flex items-center gap-2 text-xs text-stay-text-secondary">
                        <span className="font-semibold text-stay-text">Tháng {b.billingMonth}</span>
                        <span>•</span>
                        <span>{b.roomName || 'Phòng trọ'}</span>
                        {b.buildingName && <span>({b.buildingName})</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-extrabold text-stay-primary">
                        {formatCurrency(total)}
                      </p>
                      {!isPaid && remaining < total && (
                        <p className="text-[10px] text-amber-700">
                          Còn nợ: {formatCurrency(remaining)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Usage Breakdown */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block">Tiền phòng</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(b.roomRent || 3800000)}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" /> Điện tiêu thụ
                      </span>
                      <span className="font-semibold text-slate-800">
                        {b.electricityUsage ?? 0} kWh
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-500" /> Nước tiêu thụ
                      </span>
                      <span className="font-semibold text-slate-800">
                        {b.waterUsage ?? 0} m³
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-stay-border/60 text-xs">
                    <div className="flex items-center gap-1.5 text-stay-text-secondary text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Hạn nộp: <strong className="text-slate-700">{b.dueDate || '05/11/2026'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-1"
                        onClick={() => handleOpenDetail(b)}
                      >
                        <Eye className="w-3.5 h-3.5" /> Chi tiết
                      </Button>

                      {!isPaid && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs flex items-center gap-1 font-semibold"
                          onClick={() => handleOpenVietQR(b)}
                        >
                          <QrCode className="w-3.5 h-3.5" /> Quét VietQR
                        </Button>
                      )}

                      {isPaid && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center gap-1"
                          onClick={() => handleOpenVietQR(b)}
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Biên lai
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Chi tiết Hóa đơn */}
        <Modal
          title={selectedBill ? `Chi tiết hóa đơn #${selectedBill.id}` : 'Chi tiết hóa đơn'}
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={[
            selectedBill && selectedBill.status !== 'PAID' && (
              <Button
                key="pay"
                variant="primary"
                size="md"
                icon={<QrCode className="w-4 h-4" />}
                onClick={() => {
                  setDetailModalOpen(false);
                  handleOpenVietQR(selectedBill);
                }}
              >
                Thanh toán qua VietQR
              </Button>
            ),
            <Button key="close" variant="outline" size="md" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={600}
        >
          {selectedBill && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Header Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-stay-text">
                    Kỳ cước: {selectedBill.billingPeriod}
                  </p>
                  <p className="text-slate-500 text-xs">
                    Hạn nộp tiền: {selectedBill.dueDate || '05/11/2026'}
                  </p>
                </div>
                {getStatusBadge(selectedBill.status)}
              </div>

              {/* Items Table */}
              <div className="border border-stay-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-stay-border text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Khoản mục</th>
                      <th className="py-2.5 px-3 text-center">Số lượng</th>
                      <th className="py-2.5 px-3 text-right">Đơn giá</th>
                      <th className="py-2.5 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stay-border">
                    {selectedBill.items && selectedBill.items.length > 0 ? (
                      selectedBill.items.map((it: any, idx: number) => {
                        const name = it.serviceName || it.itemName || 'Dịch vụ';
                        const isDiscount = it.itemType === 'DISCOUNT' || name.toLowerCase().includes('giảm trừ') || (it.amount || 0) < 0;
                        const isSurcharge = it.itemType === 'SURCHARGE' || name.toLowerCase().includes('phụ thu');
                        const amt = Math.abs(it.amount ?? it.totalAmount ?? 0);
                        const price = Math.abs(it.unitPrice ?? it.amount ?? it.totalAmount ?? 0);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {name}
                              {isDiscount && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600">
                                  Giảm trừ
                                </span>
                              )}
                              {isSurcharge && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
                                  Phụ thu
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-600">
                              {it.note || (it.previousIndex !== undefined && it.currentIndex !== undefined
                                ? `${it.quantity ?? (it.currentIndex - it.previousIndex)} (${it.previousIndex} ➔ ${it.currentIndex})`
                                : (it.quantity ?? 1))}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600">
                              {formatCurrency(price)}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-bold ${isDiscount ? 'text-red-500' : 'text-slate-900'}`}>
                              {isDiscount ? '-' : ''}{formatCurrency(amt)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          Tiền thuê phòng & dịch vụ trọn gói
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">1 kỳ</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {formatCurrency(selectedBill.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(selectedBill.totalAmount)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-stay-border font-bold">
                    <tr>
                      <td colSpan={3} className="py-3 px-3 text-right text-slate-700">
                        Tổng tiền hóa đơn:
                      </td>
                      <td className="py-3 px-3 text-right text-sm text-stay-primary">
                        {formatCurrency(selectedBill.totalAmount)}
                      </td>
                    </tr>
                    {selectedBill.status === 'PAID' && (
                      <tr className="text-emerald-700">
                        <td colSpan={3} className="py-2 px-3 text-right">
                          Số tiền đã thanh toán:
                        </td>
                        <td className="py-2 px-3 text-right">
                          {formatCurrency(selectedBill.paidAmount || selectedBill.totalAmount)}
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </Modal>

        {/* VietQR Modal */}
        <VietQRPaymentModal
          open={qrModalOpen}
          onCancel={() => setQrModalOpen(false)}
          activeBill={activeBill}
          vietQRData={vietQRData}
          onConfirmPaid={handleConfirmPaid}
          isConfirming={isConfirming}
        />
      </div>
  );
};
