import React, { useState } from 'react';
import { useMyComplaints } from '@/shared/hooks';
import { Button, Skeleton } from '@/shared/components';
import { Plus } from 'lucide-react';
import { message } from 'antd';
import { Complaint } from '@/shared/types/landlord';
import { CreateTenantComplaintDto } from '@/shared/types/tenant';
import { ComplaintTable } from './components/ComplaintTable';
import { CreateComplaintModal } from './components/CreateComplaintModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { RateComplaintModal } from './components/RateComplaintModal';

export const MyComplaintsPage: React.FC = () => {
  const {
    complaints,
    isLoading,
    submitComplaint,
    isSubmitting,
    rateComplaint,
    isRating,
  } = useMyComplaints();

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stay-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stay-text">
            Khiếu Nại & Báo Hỏng Sự Cố
          </h1>
          <p className="text-xs text-stay-text-secondary mt-0.5">
            Gửi yêu cầu sửa chữa điện lạnh, điện nước, an ninh phòng trọ và theo dõi tiến độ xử lý từ chủ nhà.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          Tạo khiếu nại mới
        </Button>
      </div>

      {/* Complaint Table (UC18) */}
      <ComplaintTable
        complaints={complaints}
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
