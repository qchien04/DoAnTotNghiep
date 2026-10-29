import React, { useState } from 'react';
import { useMyComplaints, useSubmitComplaint, useRateComplaint } from '@/shared/hooks';
import { Button, Input } from '@/shared/components';
import { Plus, Search, RotateCcw } from 'lucide-react';
import { message, Select } from 'antd';
import { Complaint } from '@/shared/types/landlord';
import { CreateTenantComplaintDto } from '@/shared/types/tenant';
import { ComplaintTable } from './components/ComplaintTable';
import { CreateComplaintModal } from './components/CreateComplaintModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { RateComplaintModal } from './components/RateComplaintModal';

export const MyComplaintsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const { pageInfo, isLoading } = useMyComplaints({
    page,
    size,
    keyword: keyword || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    severity: severityFilter === 'ALL' ? undefined : severityFilter,
  });

  const { submitComplaint, isSubmitting } = useSubmitComplaint();
  const { rateComplaint, isRating } = useRateComplaint();

  // Create Modal State (UC18)
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Rate Modal State
  const [rateModalOpen, setRateModalOpen] = useState(false);

  const handleCreateSubmit = async (data: CreateTenantComplaintDto) => {
    try {
      await submitComplaint(data);
      message.success('Đã gửi phản ánh sự cố thành công! Chủ trọ sẽ nhận được thông báo để hẹn thợ.');
      setCreateModalOpen(false);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleRateSubmit = async (rating: number, feedback: string) => {
    if (!selectedComplaint) return;
    try {
      await rateComplaint({
        id: String(selectedComplaint.id),
        dto: { rating, feedback },
      });
      message.success('Cảm ơn bạn đã đánh giá chất lượng sửa chữa!');
      setRateModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Lỗi gửi đánh giá');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Standard Filter Bar */}
      <div className="bg-stay-card-bg p-4 rounded-xl border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm theo tiêu đề, nội dung..."
          prefix={<Search className="w-4 h-4 text-[#8C8C8C]" />}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(0);
          }}
          allowClear
          className="w-full sm:w-[320px] h-[40px] rounded-[8px]"
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
            { label: 'Chờ tiếp nhận', value: 'PENDING' },
            { label: 'Đang xử lý', value: 'PROCESSING' },
            { label: 'Đã khắc phục', value: 'RESOLVED' },
            { label: 'Đã từ chối', value: 'REJECTED' },
          ]}
        />

        <Select
          value={severityFilter}
          onChange={(val) => {
            setSeverityFilter(val);
            setPage(0);
          }}
          className="w-full sm:w-[180px] h-[40px] rounded-[8px]"
          options={[
            { label: 'Tất cả mức độ', value: 'ALL' },
            { label: 'Thấp', value: 'LOW' },
            { label: 'Bình thường', value: 'MEDIUM' },
            { label: 'Khẩn cấp', value: 'HIGH' },
            { label: 'Nguy hiểm', value: 'URGENT' },
          ]}
        />

        <Button
          icon={<RotateCcw className="w-4 h-4 text-stay-text-secondary" />}
          onClick={() => {
            setKeyword('');
            setStatusFilter('ALL');
            setSeverityFilter('ALL');
            setPage(0);
          }}
          className="h-[40px] rounded-[8px] border-[#D7D7DB] dark:border-stay-border text-stay-text hover:text-stay-primary font-medium"
        >
          Đặt lại
        </Button>

        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
          className="ml-auto bg-stay-primary hover:bg-stay-primary-hover h-[40px] px-4 font-medium"
        >
          Gửi khiếu nại
        </Button>
      </div>

      {/* Complaint Table (UC18) */}
      <ComplaintTable
        pageInfo={pageInfo}
        isLoading={isLoading}
        onPageChange={(p, s) => {
          setPage(p);
          setSize(s);
        }}
        onOpenDetail={(cmp) => {
          setSelectedComplaint(cmp);
          setDetailModalOpen(true);
        }}
        onOpenRate={(cmp) => {
          setSelectedComplaint(cmp);
          setRateModalOpen(true);
        }}
      />

      {/* Modals */}
      <CreateComplaintModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={isSubmitting}
      />

      <ComplaintDetailModal
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        complaint={selectedComplaint}
      />

      <RateComplaintModal
        open={rateModalOpen}
        onCancel={() => setRateModalOpen(false)}
        complaint={selectedComplaint}
        onSubmit={handleRateSubmit}
        loading={isRating}
      />
    </div>
  );
};
