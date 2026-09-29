import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Save,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Sliders,
  RefreshCw,
  Check,
  Palette,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLifestyle } from '@/shared/hooks/tenant/useLifestyle';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';
import { message, Tabs, Spin, Tag, Tooltip, Progress } from 'antd';
import { LifestyleQuestionResponse } from '@/shared/types/tenant';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading: isUpdatingUser } = useAuthStore();
  const {
    questions,
    isLoadingQuestions,
    profile: lifestyleProfile,
    isLoadingProfile,
    saveProfile,
    isSavingProfile,
    refetchProfile,
  } = useLifestyle();

  // Active tab state: Mặc định mở tab khảo sát câu hỏi của admin tạo
  const [activeTab, setActiveTab] = useState<string>('lifestyle');

  // Tab 1: Form state - Personal Info
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || 'MALE');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Tab 2: Lifestyle survey answers state (questionId -> optionId[])
  // Hỗ trợ cả câu hỏi SINGLE (1 option) và câu hỏi MULTI (nhiều options)
  const [answers, setAnswers] = useState<Record<number, number[]>>({});

  // Sync user info when store user changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : '');
      setGender(user.gender || 'MALE');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Sync lifestyle answers when profile loaded (nhóm theo questionId thành mảng number[])
  useEffect(() => {
    if (lifestyleProfile?.answers) {
      const map: Record<number, number[]> = {};
      lifestyleProfile.answers.forEach((ans) => {
        if (!map[ans.questionId]) {
          map[ans.questionId] = [];
        }
        if (!map[ans.questionId].includes(ans.optionId)) {
          map[ans.questionId].push(ans.optionId);
        }
      });
      setAnswers(map);
    }
  }, [lifestyleProfile]);

  // Handle select option for SINGLE or MULTI
  const handleSelectOption = (q: LifestyleQuestionResponse, optId: number) => {
    const isMulti = q.qType === 'MULTI';
    const current = answers[q.id] || [];

    if (isMulti) {
      // Toggle checkbox (thêm hoặc xóa option)
      const next = current.includes(optId)
        ? current.filter((id) => id !== optId)
        : [...current, optId];
      setAnswers((prev) => ({ ...prev, [q.id]: next }));
    } else {
      // Radio (chỉ chọn 1 option duy nhất)
      setAnswers((prev) => ({ ...prev, [q.id]: [optId] }));
    }
  };

  // Calculate survey completion progress
  const totalQuestions = questions.length;
  const answeredCount = questions.filter(
    (q) => answers[q.id] && answers[q.id].length > 0
  ).length;
  const percentComplete = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const currentVector = lifestyleProfile?.lifestyleVector || user?.lifestyleVector;

  // Handler for Personal Info Save
  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      message.error('Vui lòng nhập họ và tên');
      return;
    }

    const success = await updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      dateOfBirth: dateOfBirth || undefined,
      gender,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
    });

    if (success) {
      message.success('Cập nhật thông tin cá nhân thành công!');
    } else {
      message.error('Không thể cập nhật thông tin cá nhân');
    }
  };

  // Handler for Lifestyle Survey Save (lưu danh sách option, hỗ trợ nhiều dòng cho câu MULTI)
  const handleSaveLifestyle = async () => {
    if (questions.length === 0) return;

    const missingQuestions = questions.filter(
      (q) => !answers[q.id] || answers[q.id].length === 0
    );
    if (missingQuestions.length > 0) {
      message.warning(`Bạn còn ${missingQuestions.length} câu hỏi chưa hoàn thành!`);
    }

    try {
      // Flatten các answers: câu SINGLE ra 1 dòng, câu MULTI ra nhiều dòng
      const payloadAnswers = Object.entries(answers).flatMap(([qId, oIds]) =>
        oIds.map((oId) => ({
          questionId: Number(qId),
          optionId: Number(oId),
        }))
      );

      await saveProfile({ answers: payloadAnswers });
      message.success('Đã lưu thành công các câu trả lời khảo sát và cập nhật Vector AI!');
      await refetchProfile();
    } catch {
      message.error('Có lỗi xảy ra khi lưu câu trả lời khảo sát');
    }
  };

  // Preset avatars for quick choice
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256',
  ];

  return (
    <div className="min-h-screen bg-stay-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 1. TOP PROFILE CARD HEADER (Adaptable Light/Dark Theme) */}
        <div className="bg-stay-card-bg rounded-2xl shadow-sm border border-stay-border p-6 md:p-8 relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-stay-primary/10 via-stay-match/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Quick Theme Switcher Button at top right */}
          <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
            <Tooltip title="Đổi bảng màu / Chế độ Sáng - Tối">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stay-bg-app border border-stay-border shadow-xs hover:border-stay-primary/50 transition">
                <Palette className="w-4 h-4 text-stay-primary" />
                <ThemeSwitcher compact />
              </div>
            </Tooltip>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar with status indicator */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-stay-card-bg shadow-md bg-stay-bg-app dark:bg-slate-800 flex items-center justify-center transition-colors">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName || 'Avatar'}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user?.username || 'user');
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-stay-primary to-stay-secondary flex items-center justify-center text-white text-3xl font-bold">
                    {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-2 border-stay-card-bg rounded-full p-1.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* User basic meta info */}
            <div className="flex-1 text-center md:text-left space-y-2 pr-0 md:pr-32">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-bold text-stay-text tracking-tight transition-colors">
                  {user?.fullName || 'Người dùng'}
                </h1>
                <span className="px-3 py-0.5 bg-stay-primary-subtle text-stay-primary text-xs font-semibold rounded-full border border-stay-primary/20 transition-colors">
                  {user?.role === 'ROLE_LANDLORD'
                    ? 'Chủ trọ'
                    : user?.role === 'ROLE_ADMIN'
                    ? 'Quản trị viên'
                    : 'Người thuê / Tìm bạn ở ghép'}
                </span>
                {user?.enabled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stay-match-subtle text-stay-match-dark dark:text-stay-match border border-stay-match/30 transition-colors">
                    <CheckCircle2 className="w-3 h-3 text-stay-match" />
                    Đã xác thực
                  </span>
                )}
              </div>

              <p className="text-stay-text-secondary text-sm flex items-center justify-center md:justify-start gap-4 transition-colors">
                <span>@{user?.username || 'username'}</span>
                <span>•</span>
                <span>{user?.email}</span>
                {user?.phone && (
                  <>
                    <span>•</span>
                    <span>{user.phone}</span>
                  </>
                )}
              </p>

              {user?.bio && (
                <p className="text-stay-text-secondary text-sm max-w-2xl line-clamp-2 italic pt-1 transition-colors">
                  "{user.bio}"
                </p>
              )}

              {/* Vector status summary */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stay-bg-app border border-stay-border text-xs font-medium text-stay-text transition-colors">
                  <Activity className="w-3.5 h-3.5 text-stay-primary" />
                  <span>Vector AI:</span>
                  {currentVector ? (
                    <code className="text-stay-primary font-mono font-semibold bg-stay-card-bg px-2 py-0.5 rounded border border-stay-border transition-colors">
                      {currentVector}
                    </code>
                  ) : (
                    <span className="text-amber-500 font-normal italic">Chưa hoàn thành khảo sát</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. ADMIN SURVEY PROGRESS CALLOUT BANNER (Dark Theme Adaptive) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-stay-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 text-indigo-200 text-xs font-semibold border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Bộ câu hỏi khảo sát do Quản trị viên (Admin) thiết lập
              </div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-white">
                Khảo sát tiêu chí sinh hoạt & phong cách sống
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Hỗ trợ cả câu hỏi <strong>Chọn 1 lựa chọn (Single)</strong> và <strong>Chọn nhiều lựa chọn (Multi)</strong>.
                Hệ thống AI sẽ lượng hóa thói quen của bạn để tính toán độ tương thích chuẩn xác nhất khi tìm bạn ở ghép.
              </p>
            </div>

            {/* Progress Box */}
            <div className="bg-white/10 dark:bg-slate-800/60 backdrop-blur-md rounded-xl p-4 border border-white/15 dark:border-slate-700/60 w-full md:w-64 shrink-0">
              <div className="flex items-center justify-between text-xs font-medium text-slate-200 mb-1.5">
                <span>Tiến độ trả lời:</span>
                <span className="font-bold text-white text-sm">
                  {answeredCount} / {totalQuestions} câu
                </span>
              </div>
              <Progress
                percent={percentComplete}
                strokeColor={{
                  '0%': '#818cf8',
                  '100%': '#34d399',
                }}
                trailColor="rgba(255,255,255,0.15)"
                size="small"
              />
              <div className="mt-2 text-center">
                {percentComplete === 100 ? (
                  <span className="text-[11px] font-semibold text-emerald-300 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã hoàn thành 100% câu hỏi!
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-300">
                    Còn {totalQuestions - answeredCount} câu hỏi chưa chọn
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT TABS (Adaptable to Light & Dark Theme) */}
        <div className="bg-stay-card-bg rounded-2xl shadow-sm border border-stay-border p-6 md:p-8 transition-colors duration-200">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            className="custom-profile-tabs"
            items={[
              {
                key: 'lifestyle',
                label: (
                  <span className="flex items-center gap-2 text-sm font-semibold text-stay-text">
                    <Sliders className="w-4 h-4 text-stay-primary" />
                    <span>Trả lời câu hỏi của Admin</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        percentComplete === 100
                          ? 'bg-stay-match-subtle text-stay-match-dark dark:text-stay-match'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {answeredCount}/{totalQuestions}
                    </span>
                  </span>
                ),
                children: (
                  <div className="space-y-6 pt-4">
                    {/* Header info in Tab */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stay-border">
                      <div>
                        <h4 className="text-base font-bold text-stay-text flex items-center gap-2 transition-colors">
                          <Sliders className="w-4 h-4 text-stay-primary" />
                          Danh mục câu hỏi do Quản trị viên (Admin) tạo
                        </h4>
                        <p className="text-xs text-stay-text-secondary mt-0.5 transition-colors">
                          Mỗi câu hỏi có thể có hình thức <strong>Chọn 1</strong> hoặc <strong>Chọn nhiều lựa chọn</strong> tùy theo cấu hình của Admin.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => refetchProfile()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stay-border bg-stay-card-bg hover:bg-stay-bg-app text-stay-text text-xs font-medium transition shadow-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Làm mới
                        </button>
                      </div>
                    </div>

                    {/* Questions Survey List */}
                    {isLoadingQuestions || isLoadingProfile ? (
                      <div className="py-16 text-center">
                        <Spin size="large" />
                        <p className="text-sm text-stay-text-secondary mt-3">Đang tải bộ câu hỏi khảo sát từ Quản trị viên...</p>
                      </div>
                    ) : questions.length === 0 ? (
                      <div className="py-12 text-center text-stay-text-secondary text-sm">
                        Chưa có câu hỏi khảo sát nào được thiết lập trong hệ thống.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {questions.map((q, idx) => {
                          const selectedOptionIds = answers[q.id] || [];
                          const isAnswered = selectedOptionIds.length > 0;
                          const isMulti = q.qType === 'MULTI';

                          return (
                            <div
                              key={q.id}
                              className={`p-5 rounded-2xl border transition-all duration-200 ${
                                isAnswered
                                  ? 'bg-stay-card-bg border-stay-border shadow-xs dark:bg-slate-800/40 dark:border-slate-700/80'
                                  : 'bg-amber-500/5 border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/25'
                              }`}
                            >
                              {/* Question Title & Meta Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div className="flex items-start gap-3">
                                  <span
                                    className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 border transition-colors ${
                                      isAnswered
                                        ? 'bg-stay-primary text-white border-stay-primary shadow-xs'
                                        : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                                    }`}
                                  >
                                    {isAnswered ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-bold text-stay-text text-sm md:text-base leading-snug transition-colors">
                                        {q.label}
                                      </h5>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                      <span className="text-[11px] text-stay-text-muted font-mono">
                                        Mã: #{q.code}
                                      </span>
                                      {q.category && (
                                        <span className="text-[11px] px-2 py-0.5 bg-stay-bg-app text-stay-text-secondary border border-stay-border-subtle rounded-md font-medium transition-colors">
                                          {q.category === 'HABIT'
                                            ? 'Thói quen'
                                            : q.category === 'PERSONAL'
                                            ? 'Cá nhân'
                                            : q.category === 'LIVING'
                                            ? 'Sinh hoạt chung'
                                            : q.category}
                                        </span>
                                      )}
                                      {/* Single / Multi Type Tag */}
                                      {isMulti ? (
                                        <Tag color="purple" className="rounded-full px-2.5 text-[11px] font-semibold border-purple-300 dark:border-purple-800">
                                          Chọn nhiều đáp án (MULTI)
                                        </Tag>
                                      ) : (
                                        <Tag className="rounded-full px-2.5 text-[11px] font-semibold text-stay-text-secondary bg-stay-bg-app border-stay-border">
                                          Chọn 1 đáp án (SINGLE)
                                        </Tag>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Badges */}
                                <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pl-10 sm:pl-0">
                                  {q.isHard && (
                                    <Tag color="error" className="rounded-full px-2.5 text-[11px] font-semibold">
                                      Tiêu chí cứng (Bắt buộc)
                                    </Tag>
                                  )}
                                  <Tooltip title={`Trọng số do Admin cài đặt: ${q.weight}. Trọng số càng cao càng ảnh hưởng lớn đến % tương thích AI.`}>
                                    <span className="text-[11px] font-semibold px-2.5 py-1 bg-stay-bg-app text-stay-text rounded-full border border-stay-border transition-colors">
                                      Trọng số: x{q.weight}
                                    </span>
                                  </Tooltip>
                                </div>
                              </div>

                              {/* Options Pill/Checkbox/Radio list do Admin tạo */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                                {q.options.map((opt) => {
                                  const isSelected = selectedOptionIds.includes(opt.id);
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => handleSelectOption(q, opt.id)}
                                      className={`group relative flex items-center justify-between p-3.5 rounded-xl border text-left text-sm transition-all duration-150 ${
                                        isSelected
                                          ? 'bg-stay-primary-subtle border-stay-primary text-stay-primary font-semibold shadow-xs ring-2 ring-stay-primary/20 dark:bg-stay-primary-subtle/30 dark:border-stay-primary dark:text-white'
                                          : 'bg-stay-bg-app/80 border-stay-border text-stay-text hover:bg-stay-bg-app hover:border-stay-primary/50 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750'
                                      }`}
                                    >
                                      <span className="pr-3 leading-relaxed">{opt.label}</span>
                                      
                                      {/* Indicator: Checkbox vuông cho MULTI, Radio tròn cho SINGLE */}
                                      <span
                                        className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors border ${
                                          isMulti ? 'rounded-md' : 'rounded-full'
                                        } ${
                                          isSelected
                                            ? 'border-stay-primary bg-stay-primary text-white shadow-xs'
                                            : 'border-stay-border bg-stay-card-bg group-hover:border-stay-primary dark:border-slate-600 dark:bg-slate-700'
                                        }`}
                                      >
                                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {/* Sticky Save Action Bar (Theme Adaptive) */}
                        <div className="sticky bottom-4 z-20 bg-stay-card-bg/95 dark:bg-slate-850/95 backdrop-blur-md p-4 rounded-2xl border border-stay-border dark:border-slate-700 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
                          <div className="flex items-center gap-3 text-xs text-stay-text-secondary">
                            <div className="w-8 h-8 rounded-lg bg-stay-primary-subtle text-stay-primary flex items-center justify-center font-bold shrink-0">
                              {answeredCount}/{totalQuestions}
                            </div>
                            <div>
                              <p className="font-semibold text-stay-text text-sm">
                                {percentComplete === 100
                                  ? 'Bạn đã chọn đủ tất cả câu hỏi của Admin!'
                                  : `Đã chọn ${answeredCount}/${totalQuestions} câu hỏi`}
                              </p>
                              <p className="text-stay-text-muted text-[11px]">
                                Nhấn lưu để cập nhật các câu trả lời (cả Single & Multi) vào cơ sở dữ liệu và tái tính toán Vector AI.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleSaveLifestyle}
                            disabled={isSavingProfile}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-stay-primary hover:bg-stay-primary-hover text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
                          >
                            {isSavingProfile ? (
                              <>
                                <Spin size="small" />
                                <span>Đang lưu câu trả lời...</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                <span>Lưu tất cả câu trả lời</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'info',
                label: (
                  <span className="flex items-center gap-2 text-sm font-semibold text-stay-text">
                    <UserIcon className="w-4 h-4" />
                    Thông tin tài khoản cơ bản
                  </span>
                ),
                children: (
                  <form onSubmit={handleSavePersonalInfo} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-stay-text uppercase tracking-wider mb-2">
                          Họ và tên <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className="w-full px-4 py-2.5 rounded-xl border border-stay-border bg-stay-card-bg text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary/20 focus:border-stay-primary text-sm transition dark:bg-slate-850 dark:border-slate-700 dark:text-slate-100"
                          required
                        />
                      </div>

                      {/* Username (Readonly) */}
                      <div>
                        <label className="block text-xs font-semibold text-stay-text uppercase tracking-wider mb-2">
                          Tên đăng nhập
                        </label>
                        <input
                          type="text"
                          value={user?.username || ''}
                          disabled
                          className="w-full px-4 py-2.5 rounded-xl border border-stay-border-subtle bg-slate-100 text-stay-text-muted text-sm cursor-not-allowed dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400"
                        />
                      </div>

                      {/* Email (Readonly) */}
                      <div>
                        <label className="block text-xs font-semibold text-stay-text uppercase tracking-wider mb-2">
                          Địa chỉ Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-stay-border-subtle bg-slate-100 text-stay-text-muted text-sm cursor-not-allowed pl-10 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400"
                          />
                          <Mail className="w-4 h-4 text-stay-text-muted absolute left-3.5 top-3" />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-stay-text uppercase tracking-wider mb-2">
                          Số điện thoại liên hệ
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0912 345 678"
                            className="w-full px-4 py-2.5 rounded-xl border border-stay-border bg-stay-card-bg text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary/20 focus:border-stay-primary text-sm transition pl-10 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-100"
                          />
                          <Phone className="w-4 h-4 text-stay-text-muted absolute left-3.5 top-3" />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-xs font-semibold text-stay-text uppercase tracking-wider mb-2">
                          Ngày sinh
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stay-border bg-stay-card-bg text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary/20 focus:border-stay-primary text-sm transition pl-10 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-100"
                          />
                          <Calendar className="w-4 h-4 text-stay-text-muted absolute left-3.5 top-3" />
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-xs font-semibold text-stay-text uppercase tracking-wider mb-2">
                          Giới tính
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'MALE', label: 'Nam' },
                            { value: 'FEMALE', label: 'Nữ' },
                            { value: 'OTHER', label: 'Khác' },
                          ].map((g) => (
                            <button
                              key={g.value}
                              type="button"
                              onClick={() => setGender(g.value)}
                              className={`py-2 px-3 rounded-xl border text-sm font-medium transition text-center ${
                                gender === g.value
                                  ? 'bg-stay-primary-subtle border-stay-primary text-stay-primary font-semibold'
                                  : 'border-stay-border bg-stay-card-bg text-stay-text-secondary hover:bg-stay-bg-app hover:text-stay-text dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Avatar URL & Presets */}
                    <div>
                      <label className="block text-xs font-semibold text-stay-text uppercase tracking-wider mb-2">
                        Đường dẫn Ảnh đại diện (Avatar URL)
                      </label>
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-4 py-2.5 rounded-xl border border-stay-border bg-stay-card-bg text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary/20 focus:border-stay-primary text-sm transition dark:bg-slate-850 dark:border-slate-700 dark:text-slate-100"
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-stay-text-muted">Hoặc chọn nhanh avatar mẫu:</span>
                        <div className="flex gap-2">
                          {presetAvatars.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setAvatarUrl(url)}
                              className="w-7 h-7 rounded-full overflow-hidden border border-stay-border hover:ring-2 hover:ring-stay-primary transition"
                            >
                              <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-xs font-semibold text-stay-text uppercase tracking-wider mb-2">
                        Giới thiệu bản thân (Bio)
                      </label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Chia sẻ ngắn gọn về nghề nghiệp, sở thích hoặc thói quen của bạn..."
                        className="w-full px-4 py-2.5 rounded-xl border border-stay-border bg-stay-card-bg text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary/20 focus:border-stay-primary text-sm transition dark:bg-slate-850 dark:border-slate-700 dark:text-slate-100"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end pt-4 border-t border-stay-border">
                      <button
                        type="submit"
                        disabled={isUpdatingUser}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stay-primary hover:bg-stay-primary-hover text-white font-medium text-sm shadow-sm transition disabled:opacity-50"
                      >
                        {isUpdatingUser ? (
                          <>
                            <Spin size="small" />
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Lưu thay đổi thông tin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ),
              },
              {
                key: 'account',
                label: (
                  <span className="flex items-center gap-2 text-sm font-semibold text-stay-text">
                    <ShieldCheck className="w-4 h-4" />
                    Tài khoản & Hệ thống
                  </span>
                ),
                children: (
                  <div className="space-y-6 pt-4 text-sm text-stay-text-secondary">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-stay-border bg-stay-bg-app transition-colors">
                        <div className="text-xs text-stay-text-muted font-medium">Mã tài khoản (User ID)</div>
                        <div className="text-base font-bold text-stay-text mt-1">#{user?.id}</div>
                      </div>
                      <div className="p-4 rounded-xl border border-stay-border bg-stay-bg-app transition-colors">
                        <div className="text-xs text-stay-text-muted font-medium">Vai trò hệ thống</div>
                        <div className="text-base font-bold text-stay-primary mt-1">{user?.role}</div>
                      </div>
                      <div className="p-4 rounded-xl border border-stay-border bg-stay-bg-app transition-colors">
                        <div className="text-xs text-stay-text-muted font-medium">Trạng thái tài khoản</div>
                        <div className="text-base font-bold text-emerald-500 mt-1">
                          {user?.enabled ? 'Đang hoạt động' : 'Bị khóa'}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-stay-border bg-stay-bg-app transition-colors">
                        <div className="text-xs text-stay-text-muted font-medium">Thời gian đăng ký</div>
                        <div className="text-base font-bold text-stay-text mt-1">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mặc định hệ thống'}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
