import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRoommatePostDetail, useApplications } from '@/shared/hooks';
import { Skeleton } from '@/shared/components';
import {
  ArrowLeft,
  Share2,
  Flag,
  Users,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Home,
  Check,
} from 'lucide-react';
import { message } from 'antd';
import { PostHero } from './components/PostHero';
import { HostInfoCard } from './components/HostInfoCard';
import { LifestyleInfoTable } from './components/LifestyleInfoTable';
import { ApplyRoommateModal } from './components/ApplyRoommateModal';
import { ReportPostModal } from './components/ReportPostModal';

export const RoommatePostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { post, isLoading } = useRoommatePostDetail(id);

  // Hook nộp đơn tham gia nhóm
  const { applyToGroup, isApplying } = useApplications(id);

  // Trạng thái modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const handleApplySubmit = async (data: any) => {
    try {
      const res = await applyToGroup({
        postId: id || '',
        introMessage: data.introMessage,
        lifestyleAnswers: data.lifestyleAnswers,
        isCustomized: data.isCustomized,
        gender: data.gender,
      });

      const score = (res as any)?.compatibilityScore ?? (res as any)?.data?.compatibilityScore ?? 92;
      message.success(`Đã gửi hồ sơ tham gia nhóm thành công! Điểm tương thích lối sống: ${score}%.`);
      setHasApplied(true);
      setApplyModalOpen(false);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleReportSubmit = () => {
    message.success('Đã gửi báo cáo vi phạm tới Ban Quản Trị thành công!');
    setReportModalOpen(false);
  };

  if (isLoading || !post) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  const amenities = post.roomInfo?.amenities || [];

  return (
    <div className="min-h-[85vh] bg-stay-bg py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Thanh điều hướng quay lại & Thao tác phụ */}
        <div className="flex items-center justify-between pb-2 border-b border-stay-border-subtle">
          <Link
            to="/roommates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stay-text-secondary hover:text-stay-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách tìm bạn</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                message.success('Đã sao chép liên kết bài đăng!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stay-border bg-stay-card-bg text-stay-text hover:text-stay-primary hover:border-stay-primary transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ</span>
            </button>

            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stay-border bg-stay-card-bg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Báo cáo</span>
            </button>
          </div>
        </div>

        {/* Bố cục 2 cột chính: Cột trái (Nội dung) & Cột phải (Chi phí & Hành động) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: Nội dung chi tiết & Album & Lối sống */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header bài đăng & Album ảnh */}
            <div className="p-5 sm:p-6 rounded-xl bg-stay-card-bg border border-stay-border shadow-xs">
              <PostHero post={post} />
            </div>

            {/* Mô tả chi tiết bài đăng */}
            <div className="p-5 sm:p-6 rounded-xl bg-stay-card-bg border border-stay-border shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-stay-text flex items-center gap-2">
                <span>Mô tả chi tiết bài đăng</span>
              </h2>
              <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border text-xs sm:text-sm text-stay-text leading-relaxed whitespace-pre-line">
                {post.description || 'Chưa có mô tả chi tiết cho bài đăng này.'}
              </div>
            </div>

            {/* Tiện nghi phòng trọ (nếu có) */}
            {amenities.length > 0 && (
              <div className="p-5 sm:p-6 rounded-xl bg-stay-card-bg border border-stay-border shadow-xs space-y-3">
                <h2 className="text-sm font-bold text-stay-text flex items-center gap-2">
                  <Home className="w-4 h-4 text-stay-primary" />
                  <span>Tiện nghi phòng trọ sẵn có</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {amenities.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-stay-bg-app border border-stay-border text-xs text-stay-text flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-stay-primary shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tiêu chuẩn lối sống & Thói quen sinh hoạt */}
            <div className="p-5 sm:p-6 rounded-xl bg-stay-card-bg border border-stay-border shadow-xs">
              <LifestyleInfoTable post={post} />
            </div>
          </div>

          {/* CỘT PHẢI: Sticky Sidebar Chi phí, Nút Ứng tuyển & Chủ phòng */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
            {/* Hộp chi phí & Hành động */}
            <div className="p-5 rounded-xl bg-stay-card-bg border border-stay-border shadow-xs space-y-4">
              <div>
                <span className="text-[11px] text-stay-text-muted uppercase tracking-wider block font-medium">
                  Chi phí chia sẻ dự kiến
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-bold text-stay-primary">
                    {post.sharePrice.toLocaleString()} đ
                  </span>
                  <span className="text-xs text-stay-text-secondary">/ người / tháng</span>
                </div>

                {post.totalRoomPrice && post.totalRoomPrice > 0 && (
                  <p className="text-xs text-stay-text-muted mt-1">
                    Tổng tiền phòng: {post.totalRoomPrice.toLocaleString()} đ/tháng
                  </p>
                )}
              </div>

              {/* Tiến độ nhóm */}
              <div className="p-3 rounded-lg bg-stay-bg-app border border-stay-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stay-text-secondary flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-stay-primary" />
                    <span>Tiến độ nhóm:</span>
                  </span>
                  <span className="font-bold text-stay-text">
                    {post.currentRoommates} / {post.neededRoommates + post.currentRoommates} người
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-stay-card-bg border border-stay-border overflow-hidden">
                  <div
                    className="h-full bg-stay-primary rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (post.currentRoommates / (post.neededRoommates + post.currentRoommates)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-stay-text-secondary">
                  Còn cần tìm thêm: <strong className="text-stay-text">{post.neededRoommates} bạn</strong>
                </p>
              </div>

              {/* Điểm tương thích lối sống */}
              {post.matchPercentage !== undefined && (
                <div className="p-3 rounded-lg bg-stay-primary-subtle border border-stay-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-stay-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-stay-primary">Độ hòa hợp lối sống</p>
                      <p className="text-[11px] text-stay-text-secondary">Theo thuật toán AI 8 chiều</p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-stay-primary">
                    {post.matchPercentage}%
                  </span>
                </div>
              )}

              {/* Nút hành động chính */}
              <div>
                {hasApplied ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Đã gửi hồ sơ ứng tuyển (Đang chờ duyệt)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(true)}
                    className="w-full h-11 rounded-xl text-sm font-semibold bg-stay-primary hover:bg-stay-primary-hover text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Ứng tuyển vào nhóm ở ghép</span>
                  </button>
                )}
              </div>
            </div>

            {/* Thông tin người đăng */}
            <HostInfoCard post={post} />

            {/* Lưu ý an toàn */}
            <div className="p-4 rounded-xl bg-stay-card-bg border border-stay-border space-y-2">
              <h3 className="text-xs font-bold text-stay-text flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Lưu ý an toàn khi ở ghép</span>
              </h3>
              <ul className="text-[11px] text-stay-text-secondary space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Gặp mặt trực tiếp và trao đổi kỹ thói quen sinh hoạt trước khi dọn vào.</li>
                <li>Thống nhất rõ ràng cách chia hóa đơn điện nước và quy định tiền cọc.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Ứng tuyển & Báo cáo */}
        <ApplyRoommateModal
          open={applyModalOpen}
          onCancel={() => setApplyModalOpen(false)}
          onSubmit={handleApplySubmit}
          loading={isApplying}
        />

        <ReportPostModal
          open={reportModalOpen}
          onCancel={() => setReportModalOpen(false)}
          onSubmit={handleReportSubmit}
        />
      </div>
    </div>
  );
};
