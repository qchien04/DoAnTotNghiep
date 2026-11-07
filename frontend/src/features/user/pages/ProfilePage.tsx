import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  Lock,
  Edit3,
  Camera,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { fileService } from '@/shared/services/fileService';
import {
  useLifestyleQuestions,
  useUserLifestyleProfile,
  useSaveLifestyleProfile,
} from '@/shared/hooks';
import { message, Modal, Input, Select, Button, Spin, Progress } from 'antd';
import { LifestyleQuestionnaire } from '@/shared/components';

export const ProfilePage: React.FC = () => {
  const {
    user,
    updateProfile,
    changePassword,
    logoutAll,
    isLoading: isUpdatingUser,
  } = useAuthStore();

  const { questions, isLoading: isLoadingQuestions } = useLifestyleQuestions();
  const {
    profile: lifestyleProfile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useUserLifestyleProfile();
  const { saveProfile, isSavingProfile } = useSaveLifestyleProfile();

  // Modals visibility state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Edit Profile Form State
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

  // Lifestyle survey answers state (questionId -> optionId[])
  const [answers, setAnswers] = useState<Record<number, number[]>>({});

  // Password Change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  // Avatar upload file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
        if (ans.questionId) {
          if (!map[ans.questionId]) {
            map[ans.questionId] = [];
          }
          if (ans.optionIds && ans.optionIds.length > 0) {
            ans.optionIds.forEach((id) => {
              if (!map[ans.questionId].includes(id)) {
                map[ans.questionId].push(id);
              }
            });
          } else if (ans.optionId && !map[ans.questionId].includes(ans.optionId)) {
            map[ans.questionId].push(ans.optionId);
          }
        }
      });
      setAnswers(map);
    }
  }, [lifestyleProfile]);

  // Survey completion progress
  const totalQuestions = questions.length || 15;
  const answeredCount = questions.filter(
    (q) => answers[q.id] && answers[q.id].length > 0
  ).length;
  const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);

  // Handle avatar upload via file input
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn tệp tin hình ảnh (JPG, PNG, WebP)!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh tối đa là 5MB!');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await fileService.uploadImage(file, 'avatars');
      if (url) {
        setAvatarUrl(url);
        if (!isEditModalOpen) {
          await updateProfile({ avatarUrl: url });
        }
        message.success('Tải lên ảnh đại diện thành công!');
      } else {
        message.error('Không thể tải lên ảnh đại diện');
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handler for Personal Info Save
  const handleSavePersonalInfo = async () => {
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
      setIsEditModalOpen(false);
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
      const payloadAnswers = Object.entries(answers).map(([qId, oIds]) => ({
        questionId: Number(qId),
        optionId: oIds[0],
        optionIds: oIds,
      }));

      await saveProfile({ answers: payloadAnswers });
      await refetchProfile();
      setIsSurveyModalOpen(false);
    } catch {
      // Handled in mutation hook
    }
  };

  // Handler for Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      message.error('Vui lòng điền đầy đủ các thông tin mật khẩu');
      return;
    }

    if (newPassword.length < 6) {
      message.error('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp với mật khẩu mới');
      return;
    }

    setIsChangingPassword(true);
    const success = await changePassword({ oldPassword, newPassword, confirmPassword });
    setIsChangingPassword(false);
    if (success) {
      message.success('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordModalOpen(false);
    } else {
      message.error('Mật khẩu cũ không chính xác');
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

  const formatGender = (g?: string) => {
    if (g === 'MALE') return 'Nam';
    if (g === 'FEMALE') return 'Nữ';
    return 'Khác';
  };

  const formatGenderPref = (pref?: string) => {
    if (pref === 'MALE_ONLY') return 'Chỉ ở với Nam';
    if (pref === 'FEMALE_ONLY') return 'Chỉ ở với Nữ';
    return 'Linh hoạt';
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 space-y-4 pb-6">
      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* PROFILE MASTER CARD */}
      <div className="w-full bg-stay-card-bg rounded-2xl border border-stay-border p-6 sm:p-8 space-y-6 shadow-xs">
        {/* HEADER: Avatar, Name, Bio, and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-stay-border">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-stay-border bg-stay-bg-app flex items-center justify-center">
                {isUploadingAvatar ? (
                  <Spin size="default" />
                ) : user?.avatarUrl || avatarUrl ? (
                  <img
                    src={user?.avatarUrl || avatarUrl}
                    alt={user?.fullName || 'Avatar'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user?.username || 'user');
                    }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-stay-text">
                    {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-stay-card-bg border border-stay-border text-stay-text hover:bg-stay-bg-app flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                title="Tải ảnh đại diện mới"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-stay-text m-0">
                  {user?.fullName || 'Chưa đặt tên'}
                </h1>
                <span className="text-xs text-stay-text-secondary">@{user?.username}</span>
              </div>
              <p className="text-xs sm:text-sm text-stay-text-secondary m-0 max-w-xl">
                {user?.bio || 'Chưa có lời giới thiệu bản thân.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/kyc"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-stay-primary/30 bg-stay-primary-subtle text-stay-primary hover:bg-stay-primary hover:text-white text-xs font-semibold shadow-xs transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Xác thực CCCD</span>
            </Link>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              icon={<Edit3 className="w-3.5 h-3.5" />}
              className="rounded-lg h-9 px-4 text-xs font-medium border-stay-border"
            >
              Chỉnh sửa thông tin
            </Button>
            <Button
              onClick={() => setIsPasswordModalOpen(true)}
              icon={<Lock className="w-3.5 h-3.5" />}
              className="rounded-lg h-9 px-4 text-xs font-medium border-stay-border"
            >
              Đổi mật khẩu
            </Button>
          </div>
        </div>

        {/* SECTION 1: THÔNG TIN CƠ BẢN */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block mb-2">
            Thông tin cơ bản
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 text-[14px]">
            <div className="flex items-center gap-2 py-2.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0">Họ và tên:</span>
              <span className="text-stay-text font-medium truncate">{user?.fullName || '—'}</span>
            </div>

            <div className="flex items-center gap-2 py-2.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0">Số điện thoại:</span>
              <span className="text-stay-text font-medium">{user?.phone || 'Chưa cập nhật'}</span>
            </div>

            <div className="flex items-center gap-2 py-2.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0">Tên đăng nhập:</span>
              <span className="text-stay-text font-medium">@{user?.username}</span>
            </div>

            <div className="flex items-center gap-2 py-2.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0">Ngày sinh:</span>
              <span className="text-stay-text font-medium">
                {user?.dateOfBirth ? user.dateOfBirth.substring(0, 10) : 'Chưa cập nhật'}
              </span>
            </div>

            <div className="flex items-center gap-2 py-2.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0">Địa chỉ Email:</span>
              <span className="text-stay-text font-medium truncate">{user?.email || '—'}</span>
            </div>

            <div className="flex items-center gap-2 py-2.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0">Giới tính:</span>
              <span className="text-stay-text font-medium">{formatGender(user?.gender)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: TIÊU CHUẨN LỌC BẠN CÙNG PHÒNG */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block mb-2">
            Tiêu chuẩn lọc bạn cùng phòng
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 text-[14px]">
            <div className="flex items-center gap-2 py-2.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0">Yêu cầu bạn cùng phòng:</span>
              <span className="text-stay-text font-medium">{formatGenderPref(user?.genderPreference)}</span>
            </div>

            <div className="flex items-center gap-2 py-2.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0">Thói quen hút thuốc:</span>
              <span className="text-stay-text font-medium">
                {user?.smokes ? 'Có hút' : 'Không hút'} • {user?.rejectsSmokers ? 'Cấm hút' : 'Linh hoạt'}
              </span>
            </div>

            <div className="flex items-center gap-2 py-2.5 border-b border-stay-border-subtle">
              <span className="text-stay-text-secondary shrink-0">Nuôi thú cưng:</span>
              <span className="text-stay-text font-medium">
                {user?.hasPet ? 'Có nuôi' : 'Không nuôi'} • {user?.rejectsPets ? 'Không nhận' : 'Thoải mái'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: KHẢO SÁT LỐI SỐNG & BẢO MẬT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-stay-border text-[14px]">
          {/* Khảo sát sinh hoạt */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider">
                Khảo sát sinh hoạt
              </span>
              <span className="text-xs text-stay-text-secondary">
                {answeredCount}/{totalQuestions} câu ({completionPercentage}%)
              </span>
            </div>

            <Progress
              percent={completionPercentage}
              showInfo={false}
              strokeColor="currentColor"
              trailColor="var(--stay-border-subtle, #e4e4e7)"
              className="m-0 text-stay-text"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-stay-text-secondary">
                {answeredCount === totalQuestions
                  ? 'Đã hoàn thành 15/15 tiêu chí.'
                  : `Còn ${totalQuestions - answeredCount} câu chưa hoàn thành.`}
              </span>
              <Button
                onClick={() => setIsSurveyModalOpen(true)}
                icon={<Sliders className="w-3.5 h-3.5" />}
                className="rounded-lg h-8 px-3 text-xs font-medium border-stay-border"
              >
                {answeredCount === totalQuestions ? 'Cập nhật' : 'Làm khảo sát'}
              </Button>
            </div>
          </div>

          {/* Bảo mật & Đăng xuất */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
              Bảo mật tài khoản
            </span>

            <div className="flex items-center justify-between py-1 border-b border-stay-border-subtle">
              <div>
                <span className="text-xs text-stay-text-secondary block">Mật khẩu tài khoản</span>
                <span className="font-mono text-xs tracking-widest text-stay-text">••••••••••••</span>
              </div>
              <Button
                onClick={() => setIsPasswordModalOpen(true)}
                icon={<Lock className="w-3.5 h-3.5" />}
                className="rounded-lg h-8 px-3 text-xs font-medium border-stay-border"
              >
                Đổi mật khẩu
              </Button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleLogoutAll}
                disabled={isLoggingOutAll}
                className="inline-flex items-center gap-1.5 text-xs text-stay-text-secondary hover:text-rose-600 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất khỏi tất cả các thiết bị</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CHỈNH SỬA THÔNG TIN CÁ NHÂN & DEALBREAKERS                       */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-stay-border">
            <Edit3 className="w-4 h-4 text-stay-primary" />
            <span className="font-semibold text-stay-text">Chỉnh sửa thông tin cá nhân</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleSavePersonalInfo}
        confirmLoading={isUpdatingUser}
        okText="Lưu thay đổi"
        cancelText="Hủy bỏ"
        width={680}
        centered
        destroyOnClose
      >
        <div className="pt-3 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Avatar upload in edit modal */}
          <div className="flex items-center gap-4 p-3 bg-stay-bg-app rounded-xl border border-stay-border">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-stay-border bg-stay-card-bg shrink-0 flex items-center justify-center">
              {isUploadingAvatar ? (
                <Spin size="small" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-stay-primary">
                  {(fullName || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-stay-text block mb-1">Ảnh đại diện</span>
              <Button
                size="small"
                icon={<Camera className="w-3.5 h-3.5" />}
                onClick={() => fileInputRef.current?.click()}
                loading={isUploadingAvatar}
                className="rounded-lg text-xs"
              >
                Tải ảnh lên
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-stay-text mb-1.5">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <Input
                size="large"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="h-[40px] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stay-text mb-1.5">
                Số điện thoại
              </label>
              <Input
                size="large"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="h-[40px] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stay-text mb-1.5">
                Ngày sinh
              </label>
              <Input
                type="date"
                size="large"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="h-[40px] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stay-text mb-1.5">
                Giới tính
              </label>
              <Select
                size="large"
                value={gender}
                onChange={(val) => setGender(val)}
                className="w-full h-[40px] rounded-xl"
                options={[
                  { value: 'MALE', label: 'Nam' },
                  { value: 'FEMALE', label: 'Nữ' },
                  { value: 'OTHER', label: 'Khác' },
                ]}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stay-text mb-1.5">
                Giới thiệu bản thân
              </label>
              <Input.TextArea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mô tả ngắn gọn về nghề nghiệp, thói quen sinh hoạt..."
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Tiêu chí ở ghép (Dealbreakers) */}
          <div className="pt-3 border-t border-stay-border space-y-3">
            <span className="text-xs font-semibold text-stay-text block uppercase tracking-wider">
              Tiêu chuẩn lọc cứng tìm bạn cùng phòng
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stay-text-secondary mb-1">
                  Yêu cầu giới tính bạn cùng phòng
                </label>
                <Select
                  size="large"
                  value={genderPreference}
                  onChange={(val) => setGenderPreference(val)}
                  className="w-full h-[40px] rounded-xl"
                  options={[
                    { value: 'ANY', label: 'Linh hoạt' },
                    { value: 'MALE_ONLY', label: 'Chỉ ở với Nam' },
                    { value: 'FEMALE_ONLY', label: 'Chỉ ở với Nữ' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs text-stay-text-secondary mb-1">
                  Thói quen hút thuốc của bạn
                </label>
                <Select
                  size="large"
                  value={smokes ? 'yes' : 'no'}
                  onChange={(val) => setSmokes(val === 'yes')}
                  className="w-full h-[40px] rounded-xl"
                  options={[
                    { value: 'no', label: 'Không hút thuốc' },
                    { value: 'yes', label: 'Có hút thuốc' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs text-stay-text-secondary mb-1">
                  Quy định hút thuốc trong phòng
                </label>
                <Select
                  size="large"
                  value={rejectsSmokers ? 'reject' : 'accept'}
                  onChange={(val) => setRejectsSmokers(val === 'reject')}
                  className="w-full h-[40px] rounded-xl"
                  options={[
                    { value: 'accept', label: 'Không cấm' },
                    { value: 'reject', label: 'Cấm hút thuốc' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs text-stay-text-secondary mb-1">
                  Nuôi thú cưng của bạn
                </label>
                <Select
                  size="large"
                  value={hasPet ? 'yes' : 'no'}
                  onChange={(val) => setHasPet(val === 'yes')}
                  className="w-full h-[40px] rounded-xl"
                  options={[
                    { value: 'no', label: 'Không nuôi' },
                    { value: 'yes', label: 'Có nuôi' },
                  ]}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-stay-text-secondary mb-1">
                  Quy định thú cưng trong phòng
                </label>
                <Select
                  size="large"
                  value={rejectsPets ? 'reject' : 'accept'}
                  onChange={(val) => setRejectsPets(val === 'reject')}
                  className="w-full h-[40px] rounded-xl"
                  options={[
                    { value: 'accept', label: 'Không cấm' },
                    { value: 'reject', label: 'Cấm thú cưng' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: KHẢO SÁT LỐI SỐNG 15 TIÊU CHUẨN                                   */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-stay-border">
            <Sliders className="w-5 h-5 text-stay-primary" />
            <span className="font-semibold text-stay-text">
              Khảo sát sinh hoạt & Thói quen sinh hoạt (15 Tiêu chuẩn)
            </span>
          </div>
        }
        open={isSurveyModalOpen}
        onCancel={() => setIsSurveyModalOpen(false)}
        footer={
          <div className="flex items-center justify-between pt-3 border-t border-stay-border">
            <span className="text-xs text-stay-text-secondary hidden sm:inline">
              * Dữ liệu khảo sát được dùng để tính điểm hòa hợp khi tìm bạn ở ghép.
            </span>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsSurveyModalOpen(false)}>Hủy bỏ</Button>
              <Button
                type="primary"
                onClick={handleSaveLifestyle}
                loading={isSavingProfile}
                className="bg-stay-primary hover:bg-stay-primary-hover px-6 font-semibold"
              >
                Lưu kết quả khảo sát
              </Button>
            </div>
          </div>
        }
        width={880}
        centered
        destroyOnClose
      >
        <div className="pt-3 max-h-[75vh] overflow-y-auto pr-1">
          {isLoadingQuestions || isLoadingProfile ? (
            <div className="py-16 text-center">
              <Spin size="default" />
              <p className="text-stay-text-secondary text-sm mt-3">Đang tải bộ câu hỏi khảo sát...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-12 text-center text-stay-text-secondary text-sm">
              Chưa có câu hỏi khảo sát nào trên hệ thống.
            </div>
          ) : (
            <LifestyleQuestionnaire
              questions={questions}
              answers={answers}
              onAnswerChange={(qId, optIds) =>
                setAnswers((prev) => ({ ...prev, [qId]: optIds }))
              }
            />
          )}
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: ĐỔI MẬT KHẨU                                                     */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-stay-border">
            <Lock className="w-4 h-4 text-stay-primary" />
            <span className="font-semibold text-stay-text">Đổi mật khẩu tài khoản</span>
          </div>
        }
        open={isPasswordModalOpen}
        onCancel={() => setIsPasswordModalOpen(false)}
        footer={null}
        width={480}
        centered
        destroyOnClose
      >
        <form onSubmit={handleChangePassword} className="pt-3 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stay-text mb-1.5">
              Mật khẩu hiện tại <span className="text-rose-500">*</span>
            </label>
            <Input.Password
              size="large"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className="h-[40px] rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stay-text mb-1.5">
              Mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <Input.Password
              size="large"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="h-[40px] rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stay-text mb-1.5">
              Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <Input.Password
              size="large"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="h-[40px] rounded-xl"
            />
          </div>

          <div className="pt-3 border-t border-stay-border flex items-center justify-end gap-2.5">
            <Button onClick={() => setIsPasswordModalOpen(false)}>Hủy bỏ</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isChangingPassword}
              className="bg-stay-primary hover:bg-stay-primary-hover px-5 rounded-xl font-medium"
            >
              Xác nhận đổi mật khẩu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
