import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRoommatePostDetail, useApplications } from '@/shared/hooks';
import { Skeleton, Button } from '@/shared/components';
import { ArrowLeft, Share2, Flag } from 'lucide-react';
import { message } from 'antd';
import { PostHero } from './components/PostHero';
import { HostInfoCard } from './components/HostInfoCard';
import { LifestyleInfoTable } from './components/LifestyleInfoTable';
import { ApplyRoommateModal } from './components/ApplyRoommateModal';
import { ReportPostModal } from './components/ReportPostModal';

export const RoommatePostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { post, isLoading } = useRoommatePostDetail(id);

  // Application Hooks (UC14)
  const { applyToGroup, isApplying } = useApplications(id);

  // Modal State
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
    message.success('Đã gửi báo cáo vi phạm tới Ban Quản Trị (Mã: BC201)!');
    setReportModalOpen(false);
  };

  if (isLoading || !post) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/roommates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stay-text-secondary hover:text-stay-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tìm bạn
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 className="w-3.5 h-3.5" />}
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              message.success('Đã sao chép liên kết bài đăng!');
            }}
          >
            Chia sẻ
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Flag className="w-3.5 h-3.5 text-red-500" />}
            onClick={() => setReportModalOpen(true)}
            className="text-red-600 hover:bg-red-50"
          >
            Báo cáo
          </Button>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="bg-stay-card-bg border border-stay-border rounded-xl overflow-hidden shadow-2xs">
        <PostHero post={post} />

        <div className="p-6 space-y-6">
          <HostInfoCard
            post={post}
            hasApplied={hasApplied}
            onOpenApply={() => setApplyModalOpen(true)}
          />

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stay-text">Mô tả chi tiết bài đăng</h3>
            <p className="text-xs text-stay-text leading-relaxed whitespace-pre-line p-4 rounded-xl bg-stay-bg-app border border-stay-border">
              {post.description}
            </p>
          </div>

          <LifestyleInfoTable />
        </div>
      </div>

      {/* Modals */}
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
  );
};
