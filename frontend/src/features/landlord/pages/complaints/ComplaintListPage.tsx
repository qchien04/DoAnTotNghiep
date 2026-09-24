import React, { useState } from 'react';
import { useComplaints } from '@/shared/hooks';

import { message } from '@/shared/components';
import { Complaint, ComplaintStatus, UpdateComplaintProgressDto } from '@/shared/types/landlord';
import { ComplaintFilter } from './components/ComplaintFilter';
import { ComplaintTable } from './components/ComplaintTable';
import { ComplaintProgressModal } from './components/ComplaintProgressModal';

export const ComplaintListPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');

  const {
    complaints,
    isLoading,
    updateProgress,
    isUpdatingProgress,
  } = useComplaints({ status: statusFilter });

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [progressModalOpen, setProgressModalOpen] = useState(false);

  const handleOpenDetail = (cmp: Complaint) => {
    setSelectedComplaint(cmp);
    setProgressModalOpen(true);
  };

  const handleProgressSubmit = async (complaintId: string | number, dto: UpdateComplaintProgressDto) => {
    await updateProgress({
      id: complaintId,
      dto,
    });
    message.success('Cập nhật tiến độ xử lý và gửi thông báo tới khách thuê thành công!');
    setProgressModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stay-text tracking-tight">Khiếu nại & Báo hỏng</h1>
        </div>
      </div>

      <ComplaintFilter
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <ComplaintTable
        complaints={complaints}
        isLoading={isLoading}
        onOpenDetail={handleOpenDetail}
      />

      <ComplaintProgressModal
        open={progressModalOpen}
        complaint={selectedComplaint}
        confirmLoading={isUpdatingProgress}
        onCancel={() => setProgressModalOpen(false)}
        onSubmit={handleProgressSubmit}
      />
    </div>
  );
};
