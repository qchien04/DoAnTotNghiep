import React, { useState } from 'react';
import {
  useBills,
  useCreateBill,
  usePublishBill,
  useCancelBill,
  useConfirmPayment,
  useRooms,
  useContracts,
} from '@/shared/hooks';
import { message } from '@/shared/components';
import { Bill, CreateBillDto, BillStatus, ConfirmPaymentDto } from '@/shared/types/landlord';
import { BillFilter } from './components/BillFilter';
import { BillTable } from './components/BillTable';
import { CreateBillModal } from './components/CreateBillModal';
import { BillDetailModal } from './components/BillDetailModal';
import { ConfirmPaymentModal } from './components/ConfirmPaymentModal';
import { CancelBillModal } from './components/CancelBillModal';

export const BillListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [billingMonth, setBillingMonth] = useState<string>('10/2026');
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'ALL'>('ALL');

  const { pageInfo: billsPageInfo, isLoading } = useBills({
    page,
    size,
    billingPeriod: billingMonth,
    status: statusFilter,
  });
  const { createBill, isCreating } = useCreateBill();
  const { publishBill } = usePublishBill();
  const { cancelBill } = useCancelBill();
  const { confirmPayment, isConfirming } = useConfirmPayment();

  const { pageInfo: roomsPageInfo } = useRooms();
  const rooms = roomsPageInfo?.items ?? [];
  const { pageInfo: contractsPageInfo } = useContracts();
  const contracts = contractsPageInfo?.items ?? [];

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
    if (dto.isDraft) {
      message.success('Đã lưu hóa đơn dưới dạng BẢN NHÁP! (Khách thuê chưa nhận được hóa đơn này).');
    } else {
      message.success(
        'Phát hành hóa đơn tiền phòng thành công! Đã tự động gửi thông báo kèm VietQR tới khách thuê.'
      );
    }
    setCreateModalOpen(false);
  };

  const handlePublishBill = async (bill: Bill) => {
    try {
      await publishBill(bill.id);
      message.success(`Đã ban hành hóa đơn #${bill.id} thành công! Khách thuê đã nhận được thông báo kèm mã VietQR.`);
    } catch (err: any) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể ban hành hóa đơn');
    }
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
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Filter Bar */}

      <BillFilter
        billingMonth={billingMonth}
        onBillingMonthChange={(m) => {
          setBillingMonth(m);
          setPage(0);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setPage(0);
        }}
        onOpenCreate={() => setCreateModalOpen(true)}
      />

      {/* Bills Table */}
      <BillTable
        pageInfo={billsPageInfo}
        isLoading={isLoading}
        onPageChange={(p, s) => {
          setPage(p);
          setSize(s);
        }}
        onOpenDetail={handleOpenDetail}
        onOpenPayment={handleOpenPayment}
        onOpenCancel={handleOpenCancel}
        onPublish={handlePublishBill}
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
        onPublish={handlePublishBill}
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
