import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyRoommatePosts, useApplications } from '@/shared/hooks';
import { Button, Modal, Skeleton } from '@/shared/components';
import { Plus, Users } from 'lucide-react';
import { message } from 'antd';
import { RoommatePostStatus, RoommateApplication } from '@/shared/types/tenant';
import { formatCurrency } from '@/shared/utils';
import { PostHeaderCard } from './components/PostHeaderCard';
import { ApplicantTable } from './components/ApplicantTable';
import { ReviewApplicantModal } from './components/ReviewApplicantModal';
import { RejectApplicantModal } from './components/RejectApplicantModal';
import { GroupCompletedModal } from './components/GroupCompletedModal';

export const MyRoommatePostsPage: React.FC = () => {
  const { posts, isLoading, lockGroup } = useMyRoommatePosts();
  const [activeTab, setActiveTab] = useState<RoommatePostStatus | 'ALL'>('ALL');

  // Selected post for group applicant review (UC15)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'ALL') return true;
    return p.status === activeTab;
  });

  const selectedPost =
    filteredPosts.find((p) => String(p.id) === String(selectedPostId)) ||
    filteredPosts[0] ||
    posts[0] ||
    null;

  const { applications, approveApplication, rejectApplication } = useApplications(
    selectedPost?.id ? String(selectedPost.id) : 'post_1'
  );

  // Review modal state (UC15)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<RoommateApplication | null>(null);

  // Reject reason modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Thói quen sinh hoạt chưa thực sự phù hợp với nhóm');

  // Group completion dialog
  const [completedSuccessModalOpen, setCompletedSuccessModalOpen] = useState(false);

  const handleOpenReview = (app: RoommateApplication) => {
    setSelectedApplicant(app);
    setReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedApplicant) return;
    Modal.confirm({
      title: 'Xác nhận chấp thuận thành viên vào nhóm?',
      content: `Bạn có chắc chắn chấp thuận ứng viên ${selectedApplicant.applicantName} vào nhóm ở ghép?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await approveApplication(selectedApplicant.id);
          message.success(`Đã chấp thuận ${selectedApplicant.applicantName} vào nhóm thành công!`);
          setReviewModalOpen(false);
          setCompletedSuccessModalOpen(true);
        } catch (err: any) {
          message.error(err.message || 'Lỗi duyệt thành viên');
        }
      },
    });
  };

  const handleReject = async () => {
    if (!selectedApplicant) return;
    try {
      await rejectApplication({ applicationId: selectedApplicant.id, reason: rejectReason });
      message.success(`Đã từ chối đơn xin gia nhập của ${selectedApplicant.applicantName}.`);
      setRejectModalOpen(false);
      setReviewModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Lỗi từ chối đơn');
    }
  };

  const handleFinishGroup = async () => {
    if (!selectedPost) return;
    try {
      await lockGroup(selectedPost.id);
      message.success('Nhóm đã chuyển sang trạng thái Hoàn thành! Đã đóng nhận đơn mới.');
      setCompletedSuccessModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Lỗi hoàn thành nhóm');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stay-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stay-text flex items-center gap-2">
            <Users className="w-6 h-6 text-stay-primary" />
            Quản Lý Bài Đăng Tìm Người Ở Ghép
          </h1>
          <p className="text-xs text-stay-text-secondary mt-0.5">
            Theo dõi tiến độ ghép phòng, đối chiếu tiêu chí lối sống và phê duyệt ứng viên vào nhóm.
          </p>
        </div>
        <Link to="/tenant/create-post">
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Đăng tin mới
          </Button>
        </Link>
      </div>

        {/* Tabs Filter */}
        <div className="flex gap-4 border-b border-stay-border overflow-x-auto no-scrollbar">
          {[
            { key: 'ALL', label: `Tất cả bài đăng (${posts.length})` },
            { key: 'OPEN', label: `Đang tìm bạn (${posts.filter((p) => p.status === 'OPEN').length})` },
            { key: 'COMPLETED', label: `Đã chốt nhóm (${posts.filter((p) => p.status === 'COMPLETED').length})` },
            { key: 'CLOSED', label: `Đã đóng (${posts.filter((p) => p.status === 'CLOSED').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'text-stay-primary border-b-2 border-stay-primary font-bold'
                  : 'text-stay-text-secondary hover:text-stay-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Post Selection List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-stay-border rounded-2xl p-10 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stay-text">Bạn chưa có bài đăng nào ở mục này</p>
            <p className="text-xs text-stay-text-secondary max-w-sm mx-auto">
              Hãy tạo bài đăng tìm bạn ở cùng cho phòng đang ở hoặc phòng mới để kết nối các bạn có lối sống tương đồng.
            </p>
            <div className="pt-2">
              <Link to="/roommates/create">
                <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
                  Đăng tin ngay
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Post Switcher if multiple posts */}
            {filteredPosts.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
                  Chọn bài đăng cần xem chi tiết & duyệt đơn ({filteredPosts.length})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredPosts.map((p) => {
                    const isSelected = String(p.id) === String(selectedPost?.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPostId(String(p.id))}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'border-stay-primary bg-stay-primary/5 ring-1 ring-stay-primary/40 shadow-xs'
                            : 'border-stay-border hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-stay-text">{p.code || `BG${p.id}`}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              p.status === 'OPEN'
                                ? 'bg-emerald-50 text-emerald-700'
                                : p.status === 'COMPLETED'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.status === 'OPEN' ? 'Đang tìm' : p.status === 'COMPLETED' ? 'Đã chốt' : 'Đã đóng'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-stay-text line-clamp-1 mt-1">{p.title}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                          <span className="font-bold text-stay-primary">{formatCurrency(p.sharePrice)}/người</span>
                          <span>Cần {p.neededRoommates} bạn</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Post Header Card */}
            {selectedPost && <PostHeaderCard post={selectedPost} />}

            {/* Applicant Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
                  Danh sách đơn xin gia nhập ({applications.length})
                </label>
                {selectedPost?.status === 'OPEN' && (
                  <span className="text-xs text-slate-500">
                    Ứng viên được đối chiếu độ tương thích dựa trên khảo sát lối sống
                  </span>
                )}
              </div>

              <ApplicantTable
                applications={applications}
                onOpenReview={handleOpenReview}
              />
            </div>
          </div>
        )}

        {/* Modals */}
        <ReviewApplicantModal
          open={reviewModalOpen}
          onCancel={() => setReviewModalOpen(false)}
          applicant={selectedApplicant}
          onApprove={handleApprove}
          onOpenReject={() => setRejectModalOpen(true)}
        />

        <RejectApplicantModal
          open={rejectModalOpen}
          onCancel={() => setRejectModalOpen(false)}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          onConfirm={handleReject}
        />

        <GroupCompletedModal
          open={completedSuccessModalOpen}
          onCancel={() => setCompletedSuccessModalOpen(false)}
          onFinishGroup={handleFinishGroup}
        />
      </div>
  );
};
