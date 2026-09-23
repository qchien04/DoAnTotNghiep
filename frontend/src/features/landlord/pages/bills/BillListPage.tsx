import React, { useState } from 'react';
import { useBills, useRooms, useContracts } from '@/shared/hooks';
import { DollarSign, Plus } from 'lucide-react';
import { Button, message } from '@/shared/components';
import { Bill, CreateBillDto, BillStatus, ConfirmPaymentDto } from '@/shared/types/landlord';
import { BillFilter } from './components/BillFilter';
import { BillTable } from './components/BillTable';
import { CreateBillModal } from './components/CreateBillModal';
import { BillDetailModal } from './components/BillDetailModal';
import { ConfirmPaymentModal } from './components/ConfirmPaymentModal';
import { CancelBillModal } from './components/CancelBillModal';

export const BillListPage: React.FC = () => {
  const [billingMonth, setBillingMonth] = useState<string>('10/2026');
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'ALL'>('ALL');

  const {
    bills,
    isLoading,
    createBill,
    isCreating,
    cancelBill,
    confirmPayment,
    isConfirming,
  } = useBills({ billingMonth, status: statusFilter });

  const { rooms } = useRooms();
  const { contracts } = useContracts();

  // Create Bill Modal (UC 23)
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);

  // Confirm Payment Modal (UC 26)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Cancel Modal (UC 25)
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCreateSubmit = async (dto: CreateBillDto) => {
    await createBill(dto);
    message.success(
      'Phát hành hóa đơn tiền phòng thành công! Đã tự động gửi thông báo kèm VietQR tới khách thuê.'
    );
    setCreateModalOpen(false);
  };

  const handleOpenDetail = (bill: Bill) => {
    setViewingBill(bill);
    setDetailModalOpen(true);
  };

  const handleOpenPayment = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (billId: string | number, dto: ConfirmPaymentDto) => {
    await confirmPayment({ id: billId, dto });
    message.success('Đã xác nhận thu tiền và gạch nợ hóa đơn thành công!');
    setPaymentModalOpen(false);
  };

  const handleOpenCancel = (bill: Bill) => {
    setSelectedBill(bill);
    setCancelReason('Lập nhầm phòng hoặc sai số chỉ số dịch vụ');
    setCancelModalOpen(true);
  };

  const handleCancelSubmit = async () => {
    if (!selectedBill) return;
    try {
      await cancelBill({ id: selectedBill.id, reason: cancelReason });
      message.success('Đã hủy hóa đơn lập sai!');
      setCancelModalOpen(false);
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stay-card-bg p-6 rounded-2xl border border-stay-border">
        <div>
          <h1 className="text-2xl font-bold text-stay-text tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-stay-primary" />
            Quản Lý Hóa Đơn & Thu Tiền Phòng
          </h1>
          <p className="text-sm text-stay-text-secondary">
            Lập hóa đơn thông minh theo dịch vụ hợp đồng, tính tiền theo công tơ/đầu người và phát hành thông báo cước kèm VietQR
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
          className="bg-stay-primary hover:bg-stay-primary-hover font-semibold shadow-md"
        >
          Tính Tiền Phòng & Lập Hóa Đơn
        </Button>
      </div>

      {/* Filter Bar */}
      <BillFilter
        billingMonth={billingMonth}
        onBillingMonthChange={setBillingMonth}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Bills Table */}
      <BillTable
        bills={bills}
        isLoading={isLoading}
        onOpenDetail={handleOpenDetail}
        onOpenPayment={handleOpenPayment}
        onOpenCancel={handleOpenCancel}
      />

      {/* Create Modal */}
      <CreateBillModal
        open={createModalOpen}
        rooms={rooms}
        contracts={contracts}
        confirmLoading={isCreating}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Detail Modal */}
      <BillDetailModal
        open={detailModalOpen}
        bill={viewingBill}
        onCancel={() => setDetailModalOpen(false)}
        onOpenPayment={handleOpenPayment}
      />

      {/* Confirm Payment Modal */}
      <ConfirmPaymentModal
        open={paymentModalOpen}
        bill={selectedBill}
        confirmLoading={isConfirming}
        onCancel={() => setPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
      />

      {/* Cancel Modal */}
      <CancelBillModal
        open={cancelModalOpen}
        bill={selectedBill}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onCancel={() => setCancelModalOpen(false)}
        onSubmit={handleCancelSubmit}
      />
    </div>
  );
};
