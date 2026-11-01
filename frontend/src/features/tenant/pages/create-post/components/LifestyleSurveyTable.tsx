import React, { useState } from 'react';
import { useLifestyleQuestions } from '@/shared/hooks';
import { LifestyleQuestionnaire } from '@/shared/components';
import { Spin } from 'antd';

export interface LifestyleFormValues {
  gender: string;
  genderImportance: string;
  occupation: string;
  occupationImportance: string;
  sleepTime: string;
  sleepTimeImportance: string;
  smoking: string;
  smokingImportance: string;
  pet: string;
  petImportance: string;
  cooking: string;
  cookingImportance: string;
  guest: string;
  guestImportance: string;
}

interface LifestyleSurveyTableProps {
  values?: LifestyleFormValues;
  onChange?: (newVals: LifestyleFormValues) => void;
  lifestyleAnswers?: Record<number, number[]>;
  onLifestyleAnswersChange?: (answers: Record<number, number[]>) => void;
}

export const LifestyleSurveyTable: React.FC<LifestyleSurveyTableProps> = ({
  values: _values,
  onChange: _onChange,
  lifestyleAnswers: externalAnswers,
  onLifestyleAnswersChange,
}) => {
  const { questions, isLoading } = useLifestyleQuestions();
  const [internalAnswers, setInternalAnswers] = useState<Record<number, number[]>>({});

  const answers = externalAnswers || internalAnswers;
  const handleAnswerChange = (qId: number, optIds: number[]) => {
    const updated = { ...answers, [qId]: optIds };
    if (onLifestyleAnswersChange) {
      onLifestyleAnswersChange(updated);
    } else {
      setInternalAnswers(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center bg-stay-card-bg border border-stay-border rounded-xl">
        <Spin size="default" />
        <p className="text-stay-text-secondary text-xs mt-2">Đang tải bộ khảo sát sinh hoạt 15 chiều Roomi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-stay-text-secondary uppercase tracking-wider block text-xs">
          Khảo sát sinh hoạt & Thói quen sinh hoạt Roomi
        </label>
      </div>
      <LifestyleQuestionnaire
        questions={questions}
        answers={answers}
        onAnswerChange={handleAnswerChange}
      />
    </div>
  );
};
