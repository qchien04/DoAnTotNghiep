import React from 'react';
import { Modal, Button } from '@/shared/components';
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
      footer={null}
      width={740}
      title={
        <span className="text-base font-bold text-stay-text">
          Chi Tiết Khiếu Nại / Báo Hỏng (#{complaint.id})
        </span>
      }
    >
      <div className="space-y-4 pt-3 ">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stay-text text-base">{complaint.title}</span>
            <span className="text-stay-text-secondary text-xs">
              Ngày gửi: {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('vi-VN') : '02/10/2026'}
            </span>
          </div>
          <p className="text-stay-text whitespace-pre-line leading-relaxed text-sm">
            {complaint.content}
          </p>
        </div>

        {/* Phản hồi từ chủ nhà */}
        <div className="space-y-2 pt-4 border-t border-stay-border-subtle">
          <label className="font-semibold text-stay-text text-sm block">
            Phản hồi & Tiến độ từ chủ trọ:
          </label>
          <div className="text-stay-text leading-relaxed text-sm">
            {complaint.resolutionNote || 'Chủ trọ đã tiếp nhận sự cố và đang hẹn thợ kỹ thuật qua kiểm tra trực tiếp.'}
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-stay-border">
          <Button variant="outline" size="md" onClick={onCancel}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
