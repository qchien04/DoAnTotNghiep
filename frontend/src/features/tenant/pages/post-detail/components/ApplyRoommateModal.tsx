import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, LifestyleQuestionnaire } from '@/shared/components';
import { Tooltip } from 'antd';
import { useLifestyleQuestions, useUserLifestyleProfile } from '@/shared/hooks';
import { useAuthStore } from '@/stores/useAuthStore';
import { Sparkles, RotateCcw, HelpCircle } from 'lucide-react';

interface ApplyRoommateModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: {
    introMessage: string;
    lifestyleAnswers: { questionId: number; optionId?: number; optionIds?: number[] }[];
    isCustomized: boolean;
    gender?: string;
    sleepTime?: string;
    isSmoking?: boolean;
    isPet?: boolean;
    cookingHabit?: string;
    guestHabit?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export const ApplyRoommateModal: React.FC<ApplyRoommateModalProps> = ({
  open,
  onCancel,
  onSubmit,
  loading,
}) => {
  const { user } = useAuthStore();
  const { questions } = useLifestyleQuestions();
  const { profile } = useUserLifestyleProfile();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [introMessage, setIntroMessage] = useState('');

  // Mapping questionId -> optionId[] đã chọn (hỗ trợ SINGLE và MULTI)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [isCustomized, setIsCustomized] = useState(false);

  // Khi modal mở, tự động clone câu trả lời từ hồ sơ gốc của user
  useEffect(() => {
    if (open) {
      setFullName(user?.fullName || profile?.fullName || '');
      setPhone(user?.phone || '');
      setIntroMessage(
        'Chào bạn, mình xem thông tin phòng thấy rất phù hợp với lối sống và sinh hoạt của mình. Rất mong muốn được trao đổi thêm để vào ở ghép cùng phòng!'
      );

      // Clone các câu trả lời gốc từ user profile (nhóm theo questionId)
      const initialMap: Record<number, number[]> = {};
      if (profile?.answers && profile.answers.length > 0) {
        profile.answers.forEach((ans) => {
          if (ans.questionId) {
            if (!initialMap[ans.questionId]) {
              initialMap[ans.questionId] = [];
            }
            if (ans.optionIds && ans.optionIds.length > 0) {
              ans.optionIds.forEach((id: number) => {
                if (!initialMap[ans.questionId].includes(id)) {
                  initialMap[ans.questionId].push(id);
                }
              });
            } else if (ans.optionId && !initialMap[ans.questionId].includes(ans.optionId)) {
              initialMap[ans.questionId].push(ans.optionId);
            }
          }
        });
      } else if (questions.length > 0) {
        // Fallback: Lấy lựa chọn đầu tiên của từng câu hỏi
        questions.forEach((q) => {
          if (q.options && q.options.length > 0) {
            initialMap[q.id] = [q.options[0].id];
          }
        });
      }
      setSelectedAnswers(initialMap);
      setIsCustomized(false);
    }
  }, [open, profile, questions, user]);

  const handleResetToProfile = () => {
    const profileMap: Record<number, number[]> = {};
    if (profile?.answers) {
      profile.answers.forEach((ans) => {
        if (ans.questionId) {
          if (!profileMap[ans.questionId]) {
            profileMap[ans.questionId] = [];
          }
          if (ans.optionIds && ans.optionIds.length > 0) {
            ans.optionIds.forEach((id: number) => {
              if (!profileMap[ans.questionId].includes(id)) {
                profileMap[ans.questionId].push(id);
              }
            });
          } else if (ans.optionId && !profileMap[ans.questionId].includes(ans.optionId)) {
            profileMap[ans.questionId].push(ans.optionId);
          }
        }
      });
    }
    setSelectedAnswers(profileMap);
    setIsCustomized(false);
  };

  const handleConfirm = async () => {
    const answersList = Object.entries(selectedAnswers).map(([qId, oIds]: [string, number[]]) => ({
      questionId: Number(qId),
      optionId: oIds[0],
      optionIds: oIds,
    }));

    await onSubmit({
      introMessage,
      lifestyleAnswers: answersList,
      isCustomized,
      gender: user?.gender || 'MALE',
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={880}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-stay-primary" />
          <span className="text-base font-bold text-stay-text">
            Hồ Sơ Ứng Tuyển Ở Ghép
          </span>
        </div>
      }
    >
      <div className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
        {/* Section 1: Thông tin cá nhân & Giới thiệu */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-stay-text-secondary font-medium block mb-1">Họ và tên:</span>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <span className="text-stay-text-secondary font-medium block mb-1">Số điện thoại:</span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          <div>
            <span className="text-stay-text-secondary font-medium block mb-1">
              Lời nhắn gửi chủ phòng
            </span>
            <Input.TextArea
              rows={2}
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              placeholder="Chia sẻ lý do bạn muốn ở ghép, giờ giấc học tập / làm việc..."
            />
          </div>
        </div>

        {/* Section 2: Tiêu chí lối sống */}
        <div className="space-y-2 pt-4 border-t border-stay-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className=" font-semibold text-stay-text-secondary uppercase tracking-wider">
                Tiêu chí lối sống (Đối chiếu hòa hợp)
              </span>
              <Tooltip title="Đã sao chép từ hồ sơ gốc của bạn. Bạn có thể tinh chỉnh các lựa chọn riêng cho đơn này mà không làm đổi hồ sơ gốc.">
                <HelpCircle className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary cursor-pointer inline" />
              </Tooltip>
            </div>
            {isCustomized && (
              <button
                type="button"
                onClick={handleResetToProfile}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-stay-primary hover:underline bg-transparent border-0 cursor-pointer"
                title="Khôi phục lại lựa chọn theo hồ sơ gốc"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại theo gốc
              </button>
            )}
          </div>

          <LifestyleQuestionnaire
            questions={questions}
            answers={selectedAnswers}
            onAnswerChange={(qId, optIds) => {
              setSelectedAnswers((prev: Record<number, number[]>) => ({ ...prev, [qId]: optIds }));
              setIsCustomized(true);
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stay-border">
          <Button variant="outline" size="md" onClick={onCancel}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={handleConfirm}
          >
            Xác nhận gửi hồ sơ tham gia
          </Button>
        </div>
      </div>
    </Modal>
  );
};
