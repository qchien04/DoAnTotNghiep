import React, { useState } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { Star } from 'lucide-react';
import { Complaint } from '@/shared/types/landlord';

interface RateComplaintModalProps {
  open: boolean;
  onCancel: () => void;
  complaint: Complaint | null;
  onSubmit: (rating: number, feedback: string) => Promise<void>;
  loading?: boolean;
}

export const RateComplaintModal: React.FC<RateComplaintModalProps> = ({
  open,
  onCancel,
  complaint,
  onSubmit,
  loading,
}) => {
  const [starRating, setStarRating] = useState<number>(5);
  const [rateFeedback, setRateFeedback] = useState<string>('Thợ đến đúng giờ, sửa chữa cẩn thận, thái độ nhiệt tình.');

  if (!complaint) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={
        <span className="text-base font-bold text-stay-text">
          Đánh Giá Chất Lượng Sửa Chữa (#{complaint.id})
        </span>
      }
    >
      <div className="space-y-4 pt-3 text-xs">
        <div>
          <label className="text-slate-500 block mb-2">
            Mức độ hài lòng với thợ sửa chữa:
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setStarRating(star)}
                className="p-1 cursor-pointer transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= starRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 font-bold text-stay-text text-sm">
              {starRating === 5 ? 'Rất hài lòng' : starRating === 4 ? 'Hài lòng' : starRating === 3 ? 'Bình thường' : 'Chưa tốt'}
            </span>
          </div>
        </div>

        <div>
          <label className="text-slate-500 block mb-1">
            Nhận xét phản hồi (tùy chọn):
          </label>
          <Input.TextArea
            rows={3}
            value={rateFeedback}
            onChange={(e) => setRateFeedback(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stay-border">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            onClick={() => onSubmit(starRating, rateFeedback)}
          >
            Gửi đánh giá
          </Button>
        </div>
      </div>
    </Modal>
  );
};
