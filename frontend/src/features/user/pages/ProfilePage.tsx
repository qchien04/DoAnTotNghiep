import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Save,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  CigaretteOff,
  Sliders,
  RefreshCw,
  Check,
  Palette,
  Lock,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  useLifestyleQuestions,
  useUserLifestyleProfile,
  useSaveLifestyleProfile,
} from '@/shared/hooks';
import { message, Tabs, Spin } from 'antd';
import { LifestyleQuestionResponse } from '@/shared/types/tenant';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, logoutAll, isLoading: isUpdatingUser } = useAuthStore();
  const { questions, isLoading: isLoadingQuestions } = useLifestyleQuestions();
  const {
    profile: lifestyleProfile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useUserLifestyleProfile();
  const { saveProfile, isSavingProfile } = useSaveLifestyleProfile();

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('info');

  // Tab 1: Form state - Personal Info
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || 'MALE');
  const [genderPreference, setGenderPreference] = useState(user?.genderPreference || 'ANY');
  const [smokes, setSmokes] = useState(Boolean(user?.smokes));
  const [rejectsSmokers, setRejectsSmokers] = useState(Boolean(user?.rejectsSmokers));
  const [hasPet, setHasPet] = useState(Boolean(user?.hasPet));
  const [rejectsPets, setRejectsPets] = useState(Boolean(user?.rejectsPets));
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Tab 2: Lifestyle survey answers state (questionId -> optionId[])
  const [answers, setAnswers] = useState<Record<number, number[]>>({});

  // Password Change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ các thông tin mật khẩu');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp với mật khẩu mới');
      return;
    }

    setIsChangingPassword(true);
    const success = await changePassword({ oldPassword, newPassword, confirmPassword });
    setIsChangingPassword(false);
    if (success) {
      setPasswordSuccess('Đổi mật khẩu thành công! Các phiên đăng nhập trên thiết bị khác đã được thu hồi.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      message.success('Đổi mật khẩu thành công!');
    } else {
      setPasswordError('Mật khẩu cũ không chính xác');
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất tài khoản khỏi tất cả các thiết bị?')) {
      setIsLoggingOutAll(true);
      await logoutAll();
      setIsLoggingOutAll(false);
      window.location.replace('/login');
    }
  };

  // Sync user info when store user changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : '');
      setGender(user.gender || 'MALE');
      setGenderPreference(user.genderPreference || 'ANY');
      setSmokes(Boolean(user.smokes));
      setRejectsSmokers(Boolean(user.rejectsSmokers));
      setHasPet(Boolean(user.hasPet));
      setRejectsPets(Boolean(user.rejectsPets));
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Sync lifestyle answers when profile loaded
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
      const next = current.includes(optId)
        ? current.filter((id) => id !== optId)
        : [...current, optId];
      setAnswers((prev) => ({ ...prev, [q.id]: next }));
    } else {
      setAnswers((prev) => ({ ...prev, [q.id]: [optId] }));
    }
  };

  // Survey completion progress
  const totalQuestions = questions.length;
  const answeredCount = questions.filter(
    (q) => answers[q.id] && answers[q.id].length > 0
  ).length;
  const percentComplete = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

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
      genderPreference,
      smokes,
      rejectsSmokers,
      hasPet,
      rejectsPets,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
    });

    if (success) {
      message.success('Cập nhật thông tin cá nhân thành công!');
    } else {
      message.error('Không thể cập nhật thông tin cá nhân');
    }
  };

  // Handler for Lifestyle Survey Save
  const handleSaveLifestyle = async () => {
    if (questions.length === 0) return;

    const missingQuestions = questions.filter(
      (q) => !answers[q.id] || answers[q.id].length === 0
    );
    if (missingQuestions.length > 0) {
      message.warning(`Bạn còn ${missingQuestions.length} câu hỏi chưa hoàn thành!`);
    }

    try {
      const payloadAnswers = Object.entries(answers).flatMap(([qId, oIds]) =>
        oIds.map((oId) => ({
          questionId: Number(qId),
          optionId: Number(oId),
        }))
      );

      await saveProfile({ answers: payloadAnswers });
      message.success('Đã lưu khảo sát thói quen sinh hoạt thành công!');
      await refetchProfile();
    } catch {
      message.error('Có lỗi xảy ra khi lưu câu trả lời khảo sát');
    }
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256',
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* MAIN TABS */}
      <div className="bg-stay-card-bg rounded-xl border border-[#D7D7DB] dark:border-slate-700 p-4 sm:p-5 shadow-none">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              key: 'info',
              label: (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                  <UserIcon className="w-4 h-4" />
                  <span>Thông tin cá nhân & Tiêu chí</span>
                </span>
              ),
              children: (
                <form onSubmit={handleSavePersonalInfo} className="space-y-4 pt-2">
                  {/* Compact Header Summary inside Form */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 p-3.5 rounded-lg border border-stay-border bg-stay-bg-app/40">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-stay-border bg-stay-bg-app flex items-center justify-center">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={fullName || 'Avatar'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user?.username || 'user');
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-stay-primary flex items-center justify-center text-white text-xl font-bold">
                            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="text-base font-bold text-stay-text">
                          {user?.fullName || 'Người dùng'}
                        </span>
                        <span className="px-2 py-0.5 bg-stay-primary/10 text-stay-primary text-xs font-semibold rounded-md border border-stay-primary/20">
                          {user?.role === 'ROLE_LANDLORD'
                            ? 'Chủ trọ'
                            : user?.role === 'ROLE_ADMIN'
                              ? 'Quản trị viên'
                              : 'Người thuê'}
                        </span>
                        {user?.enabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã xác thực
                          </span>
                        )}
                      </div>
                      <p className="text-stay-text-secondary text-xs flex items-center justify-center sm:justify-start gap-2 flex-wrap">
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
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-medium text-stay-text mb-1">
                        Họ và tên <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-3 py-1.5 rounded-lg border border-stay-border bg-stay-bg-app text-stay-text text-xs focus:outline-none focus:border-stay-primary"
                        required
                      />
                    </div>

                    {/* Username (Readonly) */}
                    <div>
                      <label className="block text-xs font-medium text-stay-text mb-1">
                        Tên đăng nhập
                      </label>
                      <input
                        type="text"
                        value={user?.username || ''}
                        disabled
                        className="w-full px-3 py-1.5 rounded-lg border border-stay-border bg-stay-bg-app/50 text-stay-text-muted text-xs cursor-not-allowed"
                      />
                    </div>

                    {/* Email (Readonly) */}
                    <div>
                      <label className="block text-xs font-medium text-stay-text mb-1">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stay-border bg-stay-bg-app/50 text-stay-text-muted text-xs cursor-not-allowed"
                        />
                        <Mail className="w-3.5 h-3.5 text-stay-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-medium text-stay-text mb-1">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0912 345 678"
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stay-border bg-stay-bg-app text-stay-text text-xs focus:outline-none focus:border-stay-primary"
                        />
                        <Phone className="w-3.5 h-3.5 text-stay-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-medium text-stay-text mb-1">
                        Ngày sinh
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stay-border bg-stay-bg-app text-stay-text text-xs focus:outline-none focus:border-stay-primary"
                        />
                        <Calendar className="w-3.5 h-3.5 text-stay-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-medium text-stay-text mb-1">
                        Giới tính
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'MALE', label: 'Nam' },
                          { value: 'FEMALE', label: 'Nữ' },
                          { value: 'OTHER', label: 'Khác' },
                        ].map((g) => (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => setGender(g.value)}
                            className={`py-1.5 px-3 rounded-lg border text-xs font-medium transition cursor-pointer ${gender === g.value
                              ? 'bg-stay-primary text-white border-stay-primary font-semibold'
                              : 'border-stay-border bg-stay-bg-app text-stay-text hover:text-stay-primary'
                              }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Criteria / Dealbreakers */}
                  <div className="p-3.5 rounded-lg border border-stay-border bg-stay-bg-app/40 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-stay-border">
                      <ShieldCheck className="w-4 h-4 text-stay-primary" />
                      <h4 className="text-xs font-bold text-stay-text">
                        Tiêu chí phòng & bạn cùng phòng
                      </h4>
                    </div>

                    {/* Gender Preference */}
                    <div>
                      <label className="block text-[11px] font-medium text-stay-text-secondary mb-1">
                        Yêu cầu giới tính bạn cùng phòng
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { value: 'ANY', label: 'Linh hoạt (Nam / Nữ)' },
                          { value: 'MALE_ONLY', label: 'Chỉ ở với Nam' },
                          { value: 'FEMALE_ONLY', label: 'Chỉ ở với Nữ' },
                        ].map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setGenderPreference(item.value)}
                            className={`p-2 rounded-lg border text-xs text-center transition cursor-pointer ${genderPreference === item.value
                              ? 'bg-stay-primary text-white border-stay-primary font-semibold'
                              : 'border-stay-border bg-stay-card-bg text-stay-text hover:bg-stay-bg-app'
                              }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Smoking & Pets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Smoking */}
                      <div className="p-2.5 rounded-lg border border-stay-border bg-stay-card-bg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-stay-text flex items-center gap-1">
                            <CigaretteOff className="w-3.5 h-3.5 text-stay-primary" /> Khói thuốc
                          </span>
                          <span className="text-[11px] text-stay-text-secondary">
                            {smokes ? 'Có hút' : 'Không hút'} • {rejectsSmokers ? 'Cấm hút' : 'Không cấm'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setSmokes(!smokes)}
                            className={`p-1.5 rounded border text-center transition cursor-pointer ${smokes
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 font-semibold'
                              : 'border-stay-border bg-stay-bg-app text-stay-text'
                              }`}
                          >
                            {smokes ? 'Bản thân: Hút' : 'Bản thân: Không'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectsSmokers(!rejectsSmokers)}
                            className={`p-1.5 rounded border text-center transition cursor-pointer ${rejectsSmokers
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 font-semibold'
                              : 'border-stay-border bg-stay-bg-app text-stay-text'
                              }`}
                          >
                            {rejectsSmokers ? 'Luật: Cấm hút' : 'Luật: Không cấm'}
                          </button>
                        </div>
                      </div>

                      {/* Pets */}
                      <div className="p-2.5 rounded-lg border border-stay-border bg-stay-card-bg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-stay-text flex items-center gap-1">
                            <HeartHandshake className="w-3.5 h-3.5 text-stay-primary" /> Thú cưng
                          </span>
                          <span className="text-[11px] text-stay-text-secondary">
                            {hasPet ? 'Có pet' : 'Không pet'} • {rejectsPets ? 'Cấm pet' : 'Không cấm'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setHasPet(!hasPet)}
                            className={`p-1.5 rounded border text-center transition cursor-pointer ${hasPet
                              ? 'bg-stay-primary/10 border-stay-primary/30 text-stay-primary font-semibold'
                              : 'border-stay-border bg-stay-bg-app text-stay-text'
                              }`}
                          >
                            {hasPet ? 'Bản thân: Nuôi' : 'Bản thân: Không'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectsPets(!rejectsPets)}
                            className={`p-1.5 rounded border text-center transition cursor-pointer ${rejectsPets
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 font-semibold'
                              : 'border-stay-border bg-stay-bg-app text-stay-text'
                              }`}
                          >
                            {rejectsPets ? 'Luật: Cấm pet' : 'Luật: Không cấm'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-medium text-stay-text mb-1">
                      Giới thiệu bản thân
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Mô tả ngắn về nghề nghiệp, thói quen sinh hoạt..."
                      className="w-full px-3 py-1.5 rounded-lg border border-stay-border bg-stay-bg-app text-stay-text text-xs focus:outline-none focus:border-stay-primary"
                    />
                  </div>

                  {/* Avatar URL & Presets */}
                  <div>
                    <label className="block text-xs font-medium text-stay-text mb-1">
                      Ảnh đại diện
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="Dán link ảnh đại diện (URL)..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-stay-border bg-stay-bg-app text-stay-text text-xs focus:outline-none focus:border-stay-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stay-text-muted">Gợi ý nhanh:</span>
                      {presetAvatars.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className="w-6 h-6 rounded-full overflow-hidden border border-stay-border hover:border-stay-primary transition cursor-pointer"
                        >
                          <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingUser}
                      className="px-5 py-2 rounded-lg bg-stay-primary hover:bg-stay-primary-hover text-white font-medium text-xs shadow-xs transition disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {isUpdatingUser ? (
                        <>
                          <Spin size="small" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Lưu thông tin cá nhân</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ),
            },
            {
              key: 'lifestyle',
              label: (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                  <Sliders className="w-4 h-4" />
                  <span>Khảo sát thói quen sinh hoạt</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[11px] font-semibold ${percentComplete === 100
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                      }`}
                  >
                    {answeredCount}/{totalQuestions}
                  </span>
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">

                  {isLoadingQuestions || isLoadingProfile ? (
                    <div className="py-12 text-center">
                      <Spin size="default" />
                      <p className="text-xs text-stay-text-secondary mt-2">Đang tải câu hỏi khảo sát...</p>
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="py-8 text-center text-stay-text-secondary text-xs">
                      Chưa có câu hỏi khảo sát nào.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((q, idx) => {
                        const selectedOptionIds = answers[q.id] || [];
                        const isAnswered = selectedOptionIds.length > 0;
                        const isMulti = q.qType === 'MULTI';

                        return (
                          <div
                            key={q.id}
                            className={`p-3.5 rounded-lg border transition-all ${isAnswered
                              ? 'bg-stay-card-bg border-stay-border shadow-2xs'
                              : 'bg-stay-bg-app/40 border-stay-border'
                              }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 border ${isAnswered
                                    ? 'bg-stay-primary text-white border-stay-primary'
                                    : 'bg-stay-bg-app text-stay-text-secondary border-stay-border'
                                    }`}
                                >
                                  {isAnswered ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                                </span>
                                <h5 className="font-semibold text-stay-text text-xs">
                                  {q.label}
                                </h5>
                              </div>

                              <span className="text-[11px] text-stay-text-muted px-2 py-0.5 rounded bg-stay-bg-app border border-stay-border shrink-0">
                                {isMulti ? 'Chọn nhiều' : 'Chọn 1'}
                              </span>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options?.map((opt) => {
                                const isSelected = selectedOptionIds.includes(opt.id);
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleSelectOption(q, opt.id)}
                                    className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer flex items-center justify-between ${isSelected
                                      ? 'bg-stay-primary text-white border-stay-primary font-medium'
                                      : 'bg-stay-bg-app border-stay-border text-stay-text hover:border-stay-primary/50'
                                      }`}
                                  >
                                    <span>{opt.label}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Save Survey Button */}
                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={handleSaveLifestyle}
                          disabled={isSavingProfile}
                          className="px-5 py-2 rounded-lg bg-stay-primary hover:bg-stay-primary-hover text-white font-medium text-xs shadow-xs transition disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          {isSavingProfile ? (
                            <>
                              <Spin size="small" />
                              <span>Đang lưu...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Lưu khảo sát thói quen</span>
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
              key: 'account',
              label: (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                  <Lock className="w-4 h-4" />
                  <span>Bảo mật & Tài khoản</span>
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2 text-xs">
                  {/* Account overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-lg border border-stay-border bg-stay-bg-app">
                      <span className="text-stay-text-muted text-[11px] block">Mã tài khoản</span>
                      <span className="font-bold text-stay-text text-sm">#{user?.id}</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-stay-border bg-stay-bg-app">
                      <span className="text-stay-text-muted text-[11px] block">Vai trò</span>
                      <span className="font-bold text-stay-primary text-sm">{user?.role}</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-stay-border bg-stay-bg-app">
                      <span className="text-stay-text-muted text-[11px] block">Trạng thái</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {user?.enabled ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-stay-border bg-stay-bg-app">
                      <span className="text-stay-text-muted text-[11px] block">Ngày tham gia</span>
                      <span className="font-semibold text-stay-text text-sm">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Change Password Card */}
                  <div className="p-4 rounded-lg border border-stay-border bg-stay-card-bg space-y-3">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-stay-border">
                      <Lock className="w-4 h-4 text-stay-primary" />
                      <h4 className="font-semibold text-stay-text text-xs">Đổi mật khẩu</h4>
                    </div>

                    {passwordError && (
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{passwordSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
                      <div>
                        <label className="block text-[11px] font-medium text-stay-text mb-1">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          required
                          value={oldPassword}
                          onChange={(e) => {
                            setPasswordError('');
                            setOldPassword(e.target.value);
                          }}
                          placeholder="Nhập mật khẩu hiện tại"
                          className="w-full px-3 py-1.5 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text focus:outline-none focus:border-stay-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stay-text mb-1">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => {
                            setPasswordError('');
                            setNewPassword(e.target.value);
                          }}
                          placeholder="Tối thiểu 6 ký tự"
                          className="w-full px-3 py-1.5 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text focus:outline-none focus:border-stay-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stay-text mb-1">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => {
                            setPasswordError('');
                            setConfirmPassword(e.target.value);
                          }}
                          placeholder="Nhập lại mật khẩu mới"
                          className="w-full px-3 py-1.5 bg-stay-bg-app border border-stay-border rounded-lg text-xs text-stay-text focus:outline-none focus:border-stay-primary"
                        />
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="px-4 py-1.5 bg-stay-primary hover:bg-stay-primary-hover text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                        </button>

                        <button
                          type="button"
                          onClick={handleLogoutAll}
                          disabled={isLoggingOutAll}
                          className="px-3 py-1.5 border border-stay-border hover:border-rose-500/40 text-stay-text-secondary hover:text-rose-600 text-xs font-medium rounded-lg transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Đăng xuất mọi thiết bị
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};
