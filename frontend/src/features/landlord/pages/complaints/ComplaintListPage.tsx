import React, { useState } from 'react';
import { useComplaints, useUpdateComplaintProgress } from '@/shared/hooks';

import { message } from '@/shared/components';
import { Complaint, ComplaintStatus, UpdateComplaintProgressDto } from '@/shared/types/landlord';
import { ComplaintFilter } from './components/ComplaintFilter';
import { ComplaintTable } from './components/ComplaintTable';
import { ComplaintProgressModal } from './components/ComplaintProgressModal';

export const ComplaintListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');

  const { pageInfo, isLoading } = useComplaints({
    page,
    size,
    status: statusFilter,
  });
  const { updateProgress, isUpdatingProgress } = useUpdateComplaintProgress();

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
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      <ComplaintFilter
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setPage(0);
        }}
      />

      <ComplaintTable
        pageInfo={pageInfo}
        isLoading={isLoading}
        onPageChange={(p, s) => {
          setPage(p);
          setSize(s);
        }}
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
