import React, { useState } from 'react';
import { useMyBills, useConfirmPaymentTransferred, useVietQRPayment } from '@/shared/hooks';
import { Button, Table, Modal, Input, StatusBadge } from '@/shared/components';
import { Tooltip, Select } from 'antd';
import {
  QrCode,
  CheckCircle2,
  Search,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { InvoiceResponse, InvoiceStatus } from '@/shared/types/landlord';
import { formatCurrency } from '@/shared/utils';
import { VietQRPaymentModal } from './my-room/components/VietQRPaymentModal';

export const TenantBillsPage: React.FC = () => {
  // Filter & Search states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID' | 'OVERDUE'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<string>('id');
  const sortDirection: 'desc' | 'asc' = 'desc';

  const { pageInfo, isLoading } = useMyBills({
    page,
    size,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    keyword: searchKeyword || undefined,
    sortBy,
    sortDirection,
  });
  const { confirmTransferred, isConfirming } = useConfirmPaymentTransferred();

  // VietQR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeBill, setActiveBill] = useState<InvoiceResponse | null>(null);
  const { qrData: vietQRData } = useVietQRPayment(activeBill ? String(activeBill.id) : undefined);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<InvoiceResponse | null>(null);

  const handleOpenVietQR = (bill: InvoiceResponse) => {
    setActiveBill(bill);
    setQrModalOpen(true);
  };

  const handleOpenDetail = (bill: InvoiceResponse) => {
    setSelectedBill(bill);
    setDetailModalOpen(true);
  };

  const handleConfirmPaid = async () => {
    if (!activeBill) return;
    try {
      await confirmTransferred(String(activeBill.id));
      setQrModalOpen(false);
    } catch {
      // Handled in mutation hook
    }
  };

  const handleConfirmDirect = async (billId: number | string) => {
    try {
      await confirmTransferred(String(billId));
    } catch {
      // Handled in mutation hook
    }
  };

  const renderStatus = (st: InvoiceStatus | string, size: 'sm' | 'md' | 'lg' = 'md') => (
    <StatusBadge status={st} size={size} />
  );

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 55,
      render: (_: any, __: any, index: number) => (
        <span className="text-[14px] text-stay-text-secondary font-medium">
          {index + 1}
        </span>
      ),
    },
    {
      title: 'Kỳ cước',
      key: 'billingPeriod',
      width: 110,
      render: (_: any, r: InvoiceResponse) => (
        <span className="text-[14px] text-stay-text font-medium">
          {r.billingPeriod || (r as any).billingMonth || '—'}
        </span>
      ),
    },
    {
      title: 'Phòng & Tòa nhà',
      key: 'roomInfo',
      ellipsis: { showTitle: true },
      render: (_: any, r: InvoiceResponse) => (
        <div>
          <span
            onClick={() => handleOpenDetail(r)}
            className="font-medium text-[14px] text-stay-text block cursor-pointer hover:text-stay-primary hover:underline"
          >
            {r.roomName || 'Phòng thuê'}
          </span>
          {r.buildingName && (
            <span className="text-[12px] text-stay-text-muted block truncate">
              {r.buildingName}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Hạn nộp',
      key: 'dueDate',
      width: 110,
      render: (_: any, r: InvoiceResponse) => (
        <span className="text-[14px] text-stay-text-secondary">
          {r.dueDate || '—'}
        </span>
      ),
    },
    {
      title: 'Tổng tiền',
      key: 'totalAmount',
      width: 150,
      render: (_: any, r: InvoiceResponse) => (
        <div>
          <span className="font-semibold text-stay-text text-[14px] block">
            {formatCurrency(r.totalAmount ?? 0)}
          </span>
          {r.remainingAmount !== undefined && r.remainingAmount > 0 && r.status !== 'PAID' && (
            <span className="text-[12px] text-stay-text block">
              Còn nợ: {formatCurrency(r.remainingAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      render: (_: any, r: InvoiceResponse) => renderStatus(r.status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, r: InvoiceResponse) => {
        const canPay = r.status !== 'PAID' && r.status !== 'CANCELLED';
        return (
          <div className="flex items-center justify-start gap-1.5">
            <Tooltip title="Xem chi tiết hóa đơn">
              <button
                type="button"
                className="stay-action-btn"
                onClick={() => handleOpenDetail(r)}
              >
                <Eye className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title={canPay ? 'Quét mã VietQR chuyển khoản' : 'Hóa đơn đã thanh toán'}>
              <button
                type="button"
                className={`stay-action-btn ${!canPay ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={() => canPay && handleOpenVietQR(r)}
                disabled={!canPay}
              >
                <QrCode className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title={canPay ? 'Báo đã chuyển khoản' : 'Đã hoàn tất thanh toán'}>
              <button
                type="button"
                className={`stay-action-btn ${!canPay ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={() => canPay && handleConfirmDirect(r.id)}
                disabled={!canPay || isConfirming}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Filter & Search Bar - Standardized like Landlord */}
      <div className="bg-stay-card-bg p-4 rounded-xl border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm mã HĐ, tháng, phòng..."
          prefix={<Search className="w-4 h-4 text-[#8C8C8C]" />}
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
            setPage(0);
          }}
          allowClear
          className="w-full sm:w-[300px] h-[40px] rounded-[8px]"
        />

        <Select
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(0);
          }}
          className="w-full sm:w-[200px] h-[40px] rounded-[8px]"
          options={[
            { label: 'Tất cả trạng thái', value: 'ALL' },
            { label: 'Chờ thanh toán', value: 'UNPAID' },
            { label: 'Đã thanh toán', value: 'PAID' },
            { label: 'Quá hạn nộp', value: 'OVERDUE' },
          ]}
        />

        <Select
          value={sortBy}
          onChange={(val) => {
            setSortBy(val);
            setPage(0);
          }}
          className="w-full sm:w-[170px] h-[40px] rounded-[8px]"
          options={[
            { label: 'Mới nhất', value: 'id' },
            { label: 'Tổng tiền', value: 'totalamount' },
            { label: 'Hạn nộp', value: 'duedate' },
            { label: 'Kỳ cước', value: 'billingperiod' },
          ]}
        />

        <Button
          icon={<RotateCcw className="w-4 h-4 text-stay-text-secondary" />}
          onClick={() => {
            setSearchKeyword('');
            setStatusFilter('ALL');
            setSortBy('id');
            setPage(0);
          }}
          className="h-[40px] rounded-[8px] border-[#D7D7DB] dark:border-stay-border text-stay-text hover:text-stay-primary font-medium"
        >
          Đặt lại
        </Button>
      </div>

      {/* Bill Table */}
      <Table<InvoiceResponse>
        rowKey="id"
        dataSource={pageInfo?.items ?? []}
        columns={columns}
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        className="overflow-x-auto"
        pagination={{
          current: (pageInfo?.page ?? 0) + 1,
          pageSize: pageInfo?.size ?? 10,
          total: pageInfo?.totalElements ?? 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng ${total} hóa đơn`,
          onChange: (p, s) => {
            setPage(p - 1);
            setSize(s);
          },
        }}
      />

      {/* Detail Modal */}
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
        width={580}
      >
        {selectedBill && (
          <div className="space-y-3.5 pt-2 ">
            {/* Header Box */}
            <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-stay-text">
                  Kỳ cước: {selectedBill.billingPeriod || (selectedBill as any).billingMonth}
                </p>
                <p className="text-stay-text-secondary text-xs mt-0.5">
                  Hạn nộp tiền: {selectedBill.dueDate || '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-stay-text-secondary font-medium">Trạng thái:</span>
                {renderStatus(selectedBill.status, 'lg')}
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-stay-border rounded-lg overflow-hidden">
              <table className="w-full text-left ">
                <thead className="bg-stay-bg-app border-b border-stay-border text-stay-text-secondary font-medium">
                  <tr>
                    <th className="py-2 px-3">Khoản mục</th>
                    <th className="py-2 px-3 text-center">Số lượng</th>
                    <th className="py-2 px-3 text-right">Đơn giá</th>
                    <th className="py-2 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stay-border">
                  {selectedBill.items && selectedBill.items.length > 0 ? (
                    selectedBill.items.map((it: any, idx: number) => {
                      const name = (it.serviceName || it.itemName || 'Dịch vụ');
                      const isDiscount = it.itemType === 'DISCOUNT';
                      const isSurcharge = it.itemType === 'SURCHARGE';
                      const amt = Math.abs(it.amount ?? it.totalAmount ?? 0);
                      const price = Math.abs(it.unitPrice ?? it.amount ?? it.totalAmount ?? 0);
                      return (
                        <tr key={idx} className="hover:bg-stay-bg-app/50">
                          <td className="py-2 px-3 font-medium text-stay-text">
                            {name}
                            {isDiscount && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600">
                                Giảm trừ
                              </span>
                            )}
                            {isSurcharge && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700">
                                Phụ thu
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center text-stay-text-secondary">
                            {it.note || (it.previousIndex !== undefined && it.currentIndex !== undefined
                              ? `${it.quantity ?? (it.currentIndex - it.previousIndex)} (${it.previousIndex} ➔ ${it.currentIndex})`
                              : (it.quantity ?? 1))}
                          </td>
                          <td className="py-2 px-3 text-right text-stay-text-secondary">
                            {formatCurrency(price)}
                          </td>
                          <td className={`py-2 px-3 text-right font-semibold ${isDiscount ? 'text-rose-500' : 'text-stay-text'}`}>
                            {isDiscount ? '-' : ''}{formatCurrency(amt)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="hover:bg-stay-bg-app/50">
                      <td className="py-2 px-3 font-medium text-stay-text">
                        Tiền thuê phòng & dịch vụ trọn gói
                      </td>
                      <td className="py-2 px-3 text-center text-stay-text-secondary">1 kỳ</td>
                      <td className="py-2 px-3 text-right text-stay-text-secondary">
                        {formatCurrency(selectedBill.totalAmount)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-stay-text">
                        {formatCurrency(selectedBill.totalAmount)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-stay-bg-app border-t border-stay-border font-semibold">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3 text-right text-stay-text-secondary">
                      Tổng tiền hóa đơn:
                    </td>
                    <td className="py-2.5 px-3 text-right text-sm text-stay-text font-bold">
                      {formatCurrency(selectedBill.totalAmount)}
                    </td>
                  </tr>
                  {selectedBill.status === 'PAID' && (
                    <tr className="border-t border-stay-border-subtle">
                      <td colSpan={3} className="py-1.5 px-3 text-right text-stay-text-secondary">
                        Số tiền đã thanh toán:
                      </td>
                      <td className="py-1.5 px-3 text-right text-stay-text font-semibold">
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
