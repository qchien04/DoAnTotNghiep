import React from 'react';
import { Modal, Button, StatusBadge } from '@/shared/components';
import { Complaint } from '@/shared/types/landlord';

interface ComplaintDetailModalProps {
  open: boolean;
  onCancel: () => void;
  complaint: Complaint | null;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  open,
  onCancel,
  complaint,
}) => {
  if (!complaint) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={
        <div className="flex items-center justify-end pt-1">
          <Button
            variant="outline"
            size="md"
            onClick={onCancel}
            className="h-9 px-4 rounded-lg border border-stay-border text-stay-text hover:bg-stay-bg-app bg-stay-card-bg font-medium text-[14px]"
          >
            Đóng
          </Button>
        </div>
      }
      width={720}
      title={`Chi tiết khiếu nại: #${complaint.id}`}
      centered
      destroyOnClose
    >
      <div className="space-y-4 pt-2 text-[14px]">
        {/* Tiêu đề & Ngày gửi & Trạng thái */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-semibold text-stay-text text-[15px]">
              {complaint.title}
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-stay-text-secondary text-[13px]">
                {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('vi-VN') : '02/10/2026'}
              </span>
              <StatusBadge status={complaint.status} />
            </div>
          </div>
          <p className="text-stay-text whitespace-pre-line leading-relaxed text-[14px]">
            {complaint.content}
          </p>
        </div>

        {/* Phản hồi từ chủ nhà */}
        <div className="space-y-1.5 pt-3.5 border-t border-stay-border-subtle">
          <span className="text-[13px] font-semibold text-stay-text-secondary block">
            Phản hồi & Tiến độ từ chủ trọ:
          </span>
          <div className="text-stay-text whitespace-pre-line leading-relaxed text-[14px]">
            {complaint.resolutionNote || 'Chủ trọ đã tiếp nhận sự cố và đang hẹn thợ kỹ thuật qua kiểm tra trực tiếp.'}
          </div>
        </div>
      </div>
    </Modal>
  );
};
