import React, { useState, useMemo } from 'react';
import {
  Check,
  CheckCircle2,
  CheckSquare,
  Sliders,
  AlertCircle,
  Layers,
  Moon,
  Briefcase,
  Home,
  ShieldAlert,
  Flame,
  Dog,
  Users,
} from 'lucide-react';
import { Tooltip, Progress } from 'antd';
import { LifestyleQuestionResponse } from '@/shared/types/tenant';

export interface DealbreakerValues {
  gender?: string;
  genderPreference?: string;
  smokes?: boolean;
  rejectsSmokers?: boolean;
  hasPet?: boolean;
  rejectsPets?: boolean;
}

export interface LifestyleQuestionnaireProps {
  questions: LifestyleQuestionResponse[];
  answers: Record<number, number[]>;
  onAnswerChange: (questionId: number, optionIds: number[]) => void;
  dealbreakers?: DealbreakerValues;
  onDealbreakerChange?: (field: keyof DealbreakerValues, val: any) => void;
  showDealbreakers?: boolean;
  readOnly?: boolean;
}

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.FC<{ className?: string }>; description: string }
> = {
  ALL: {
    label: 'Tất cả câu hỏi',
    icon: Layers,
    description: 'Trọn bộ 15 tiêu chí lối sống theo thuật toán Roomi Pairwise Matching',
  },
  LIVING: {
    label: 'Sinh hoạt chung',
    icon: Home,
    description: 'Vệ sinh, nấu nướng, tiếp khách, dùng điều hòa và chia sẻ chi phí',
  },
  HABIT: {
    label: 'Giờ giấc & Giấc ngủ',
    icon: Moon,
    description: 'Giờ thức - ngủ ban đêm và thói quen phát âm thanh, nhạy cảm tiếng ồn',
  },
  PERSONAL: {
    label: 'Công việc & Sở thích',
    icon: Briefcase,
    description: 'Hình thức làm việc, không gian riêng tư, sinh hoạt cuối tuần & đam mê',
  },
};

export const LifestyleQuestionnaire: React.FC<LifestyleQuestionnaireProps> = ({
  questions,
  answers,
  onAnswerChange,
  dealbreakers,
  onDealbreakerChange,
  showDealbreakers = false,
  readOnly = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Thống kê tiến độ trả lời
  const totalCount = questions.length;
  const answeredCount = useMemo(() => {
    return questions.filter((q) => answers[q.id] && answers[q.id].length > 0).length;
  }, [questions, answers]);

  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // Lọc câu hỏi theo Category
  const filteredQuestions = useMemo(() => {
    if (activeCategory === 'ALL') return questions;
    return questions.filter((q) => q.category === activeCategory);
  }, [questions, activeCategory]);

  const handleToggleOption = (q: LifestyleQuestionResponse, optionId: number) => {
    if (readOnly) return;
    const isMulti = q.qType === 'MULTI';
    const current = answers[q.id] || [];

    if (isMulti) {
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      onAnswerChange(q.id, next);
    } else {
      onAnswerChange(q.id, [optionId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Khảo Sát & Thanh Tiến Độ Hoàn Thành */}
      <div className="bg-stay-bg-app border border-stay-border rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stay-primary-subtle text-stay-primary border border-stay-primary/20 flex items-center gap-1">
                <Sliders className="w-3 h-3" /> Khảo sát lối sống
              </span>
              <span className="text-[13px] font-semibold text-stay-text">
                15 tiêu chuẩn thói quen sinh hoạt
              </span>
            </div>
            <p className="text-[13px] text-stay-text-secondary leading-relaxed">
              Dữ liệu được dùng để đối chiếu hòa hợp hai chiều và tính điểm tương thích khi ở ghép.
            </p>
          </div>

          <div className="bg-stay-card-bg px-4 py-3 rounded-xl border border-stay-border shrink-0 min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-bold text-stay-text mb-1.5">
              <span>Tiến độ khảo sát</span>
              <span className="text-stay-primary">{answeredCount}/{totalCount} câu ({progressPercent}%)</span>
            </div>
            <Progress
              percent={progressPercent}
              showInfo={false}
              strokeColor="var(--stay-primary, #2563EB)"
              trailColor="var(--stay-border-subtle, #E2E8F0)"
              size={['100%', 8]}
            />
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stay-border-subtle overflow-x-auto scrollbar-none">
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const Icon = meta.icon;
            const isActive = activeCategory === key;
            const count = key === 'ALL'
              ? questions.length
              : questions.filter((q) => q.category === key).length;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-stay-primary text-white border-stay-primary shadow-xs'
                    : 'bg-stay-card-bg text-stay-text border-stay-border hover:border-stay-primary/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{meta.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stay-bg-app text-stay-text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Tiêu Chí Lọc Cứng Tiên Quyết (Dealbreakers Zero-Tolerance) - Optional */}
      {showDealbreakers && dealbreakers && onDealbreakerChange && (
        <div className="bg-stay-card-bg border border-stay-border rounded-2xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-stay-border-subtle">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <div>
              <h4 className="text-sm font-bold text-stay-text">
                Tiêu chí Lọc cứng (Dealbreakers Zero-Tolerance)
              </h4>
              <p className="text-[12px] text-stay-text-secondary">
                Không được bù trừ bằng điểm số. Nếu vi phạm, hệ thống sẽ tự động kẹp trần độ tương thích tối đa 50%.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Giới tính & Giới tính yêu cầu */}
            <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border space-y-2">
              <span className="text-xs font-bold text-stay-text flex items-center gap-1.5">
                <Users className="w-4 h-4 text-stay-primary" />
                Yêu cầu giới tính
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: 'ANY', label: 'Linh hoạt' },
                  { value: 'MALE_ONLY', label: 'Nam' },
                  { value: 'FEMALE_ONLY', label: 'Nữ' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onDealbreakerChange('genderPreference', item.value)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition cursor-pointer ${
                      dealbreakers.genderPreference === item.value
                        ? 'bg-stay-primary text-white border-stay-primary'
                        : 'bg-stay-card-bg text-stay-text border-stay-border hover:border-stay-primary/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thuốc lá */}
            <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border space-y-2">
              <span className="text-xs font-bold text-stay-text flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Hút thuốc & Cấm hút thuốc
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer bg-stay-card-bg p-2 rounded-lg border border-stay-border">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={Boolean(dealbreakers.smokes)}
                    onChange={(e) => onDealbreakerChange('smokes', e.target.checked)}
                    className="accent-stay-primary"
                  />
                  <span>Tôi có hút thuốc</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-stay-card-bg p-2 rounded-lg border border-stay-border">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={Boolean(dealbreakers.rejectsSmokers)}
                    onChange={(e) => onDealbreakerChange('rejectsSmokers', e.target.checked)}
                    className="accent-rose-500"
                  />
                  <span className="text-rose-600 font-medium">Cấm hút thuốc</span>
                </label>
              </div>
            </div>

            {/* Thú cưng */}
            <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border space-y-2">
              <span className="text-xs font-bold text-stay-text flex items-center gap-1.5">
                <Dog className="w-4 h-4 text-emerald-600" />
                Thú cưng & Dị ứng pet
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer bg-stay-card-bg p-2 rounded-lg border border-stay-border">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={Boolean(dealbreakers.hasPet)}
                    onChange={(e) => onDealbreakerChange('hasPet', e.target.checked)}
                    className="accent-stay-primary"
                  />
                  <span>Tôi nuôi pet</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-stay-card-bg p-2 rounded-lg border border-stay-border">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={Boolean(dealbreakers.rejectsPets)}
                    onChange={(e) => onDealbreakerChange('rejectsPets', e.target.checked)}
                    className="accent-rose-500"
                  />
                  <span className="text-rose-600 font-medium">Dị ứng / Cấm pet</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Danh Sách Câu Hỏi Lối Sống Dạng Questionnaire Cards */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const selectedOptionIds = answers[q.id] || [];
          const isMulti = q.qType === 'MULTI';
          const isAnswered = selectedOptionIds.length > 0;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border transition-all duration-200 p-5 ${
                isAnswered
                  ? 'bg-stay-card-bg border-stay-border shadow-xs'
                  : 'bg-stay-card-bg/60 border-stay-border/80 hover:border-stay-primary/40'
              }`}
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stay-border-subtle">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                      isAnswered
                        ? 'bg-stay-primary text-white'
                        : 'bg-stay-bg-app text-stay-text-secondary border border-stay-border'
                    }`}
                  >
                    {q.sortOrder || q.id}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-stay-text leading-snug">
                    {q.label}
                  </h4>
                </div>

                {/* Question Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  {isMulti ? (
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-500/10 text-stay-primary border border-stay-primary/20 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Chọn nhiều</span>
                      {selectedOptionIds.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-stay-primary text-white text-[10px] flex items-center justify-center font-bold">
                          {selectedOptionIds.length}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-stay-bg-app text-stay-text-secondary border border-stay-border flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-stay-text-muted" />
                      <span>Chọn 1</span>
                    </span>
                  )}

                  {q.isHard && (
                    <Tooltip title="Tiêu chí trọng số cao có thể kích hoạt phủ quyết (Veto) nếu có xung đột lớn">
                      <span className="px-2 py-1 text-[11px] font-bold rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1 cursor-pointer">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Cốt lõi</span>
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2.5 pt-3.5">
                {q.options?.map((opt) => {
                  const isSelected = selectedOptionIds.includes(opt.id);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleToggleOption(q, opt.id)}
                      className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${
                        readOnly ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                      } ${
                        isSelected
                          ? 'bg-stay-primary/10 border-stay-primary text-stay-primary ring-1 ring-stay-primary/30 shadow-xs'
                          : 'bg-stay-bg-app border-stay-border text-stay-text hover:border-stay-primary/40 hover:bg-stay-bg-app/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Selector Indicator Icon */}
                        {isMulti ? (
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-stay-primary border-stay-primary text-white'
                                : 'border-[#D7D7DB] dark:border-slate-600 bg-stay-card-bg'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        ) : (
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'border-stay-primary'
                                : 'border-[#D7D7DB] dark:border-slate-600 bg-stay-card-bg'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-stay-primary" />}
                          </div>
                        )}

                        <span className="truncate">{opt.label}</span>
                      </div>

                      {/* Small subtle active badge */}
                      {isSelected && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stay-primary/20 text-stay-primary shrink-0 uppercase tracking-wider">
                          Đã chọn
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
