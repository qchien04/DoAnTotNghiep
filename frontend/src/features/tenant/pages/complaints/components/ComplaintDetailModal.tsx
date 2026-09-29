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
      <div className="space-y-4 pt-3 text-xs">
        <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stay-text text-sm">{complaint.title}</span>
            <span className="text-slate-500">
              Ngày gửi: {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('vi-VN') : '02/10/2026'}
            </span>
          </div>
          <p className="text-stay-text whitespace-pre-line leading-relaxed">
            {complaint.content}
          </p>
        </div>

        {/* Phản hồi từ chủ nhà */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
            Phản hồi & Tiến độ từ chủ trọ:
          </label>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border text-stay-text leading-relaxed">
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
