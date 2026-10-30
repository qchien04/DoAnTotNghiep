import React, { useState } from 'react';
import {
  useBills,
  useCreateBill,
  usePublishBill,
  useCancelBill,
  useConfirmPayment,
} from '@/shared/hooks';
import { message } from '@/shared/components';
import { InvoiceResponse, CreateInvoiceRequest, InvoiceStatus, InvoicePaymentRequest } from '@/shared/types/landlord';
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
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');

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

  // Create Bill Modal (UC 23)
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingBill, setViewingBill] = useState<InvoiceResponse | null>(null);

  // Confirm Payment Modal (UC 26)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<InvoiceResponse | null>(null);

  // Cancel Modal (UC 25)
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCreateSubmit = async (dto: CreateInvoiceRequest) => {
    try {
      await createBill(dto);
      setCreateModalOpen(false);
    } catch {
      // Đã xử lý thông báo trong hook useCreateBill
    }
  };

  const handlePublishBill = async (bill: InvoiceResponse) => {
    try {
      await publishBill(bill.id);
    } catch {
      // Đã xử lý thông báo trong hook usePublishBill
    }
  };

  const handleOpenDetail = (bill: InvoiceResponse) => {
    setViewingBill(bill);
    setDetailModalOpen(true);
  };

  const handleOpenPayment = (bill: InvoiceResponse) => {
    setSelectedBill(bill);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (billId: string | number, dto: InvoicePaymentRequest) => {
    try {
      await confirmPayment({ id: billId, dto });
      setPaymentModalOpen(false);
      setSelectedBill(null);
    } catch {
      // Đã xử lý thông báo trong hook useConfirmPayment
    }
  };

  const handleOpenCancel = (bill: InvoiceResponse) => {
    setSelectedBill(bill);
    setCancelReason('Lập nhầm phòng hoặc sai số chỉ số dịch vụ');
    setCancelModalOpen(true);
  };

  const handleCancelSubmit = async () => {
    if (!selectedBill) return;
    const trimmed = cancelReason.trim();
    if (!trimmed) {
      message.warning('Vui lòng nhập lý do hủy hóa đơn!');
      return;
    }
    try {
      await cancelBill({ id: selectedBill.id, cancelReason: trimmed });
      setCancelModalOpen(false);
      setSelectedBill(null);
    } catch {
      // Đã xử lý thông báo trong hook useCancelBill
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
        cancelReason={cancelReason}
        onCancelReasonChange={setCancelReason}
        onCancel={() => setCancelModalOpen(false)}
        onSubmit={handleCancelSubmit}
      />
    </div>
  );
};
