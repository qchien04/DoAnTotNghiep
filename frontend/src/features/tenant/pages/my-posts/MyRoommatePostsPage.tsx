import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMyRoommatePosts, useApplications } from '@/shared/hooks';
import { Skeleton } from '@/shared/components';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Dropdown,
  Modal,
  message,
  Empty,
  Space,
} from 'antd';
import {
  Plus,
  Search,
  Users,
  MapPin,
  ExternalLink,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { RoommatePost, RoommatePostStatus, RoommateApplication } from '@/shared/types/tenant';
import { formatCurrency } from '@/shared/utils';
import { ApplicantDrawer } from './components/ApplicantDrawer';
import { ReviewApplicantModal } from './components/ReviewApplicantModal';
import { RejectApplicantModal } from './components/RejectApplicantModal';
import { CreatePostModal } from './components/CreatePostModal';

export const MyRoommatePostsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { posts, isLoading, lockGroup, closePost, refetch } = useMyRoommatePosts();

  // Filters
  const [activeTab, setActiveTab] = useState<RoommatePostStatus | 'ALL'>('ALL');
  const [postTypeFilter, setPostTypeFilter] = useState<'ALL' | 'HAS_ROOM' | 'SEARCHING_ROOM'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Auto open create modal if ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateModalOpen(true);
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Drawer xem đơn ứng tuyển
  const [selectedPost, setSelectedPost] = useState<RoommatePost | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    applications,
    approveApplication,
    rejectApplication,
    refetch: refetchApps,
    isLoading: isAppsLoading,
  } = useApplications(selectedPost?.id ? String(selectedPost.id) : '');

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<RoommateApplication | null>(null);

  // Reject reason modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Thói quen sinh hoạt chưa phù hợp với nhóm');

  const handleOpenApplications = (post: RoommatePost) => {
    setSelectedPost(post);
    setDrawerOpen(true);
  };

  const handleOpenReview = (app: RoommateApplication) => {
    setSelectedApplicant(app);
    setReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedApplicant) return;
    Modal.confirm({
      title: 'Xác nhận chấp thuận thành viên vào nhóm?',
      content: `Chấp thuận ${selectedApplicant.applicantName} tham gia nhóm ở ghép này?`,
      okText: 'Chấp thuận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await approveApplication(selectedApplicant.id);
          message.success(`Đã chấp thuận ${selectedApplicant.applicantName} vào nhóm!`);
          setReviewModalOpen(false);
          refetchApps?.();
          refetch?.();
        } catch (err: any) {
          message.error(err?.message || 'Lỗi duyệt thành viên');
        }
      },
    });
  };

  const handleReject = async () => {
    if (!selectedApplicant) return;
    try {
      await rejectApplication({ applicationId: selectedApplicant.id, reason: rejectReason });
      message.success(`Đã từ chối đơn của ${selectedApplicant.applicantName}.`);
      setRejectModalOpen(false);
      setReviewModalOpen(false);
      refetchApps?.();
    } catch (err: any) {
      message.error(err?.message || 'Lỗi từ chối đơn');
    }
  };

  const handleFinishGroup = async (post: RoommatePost) => {
    Modal.confirm({
      title: 'Xác nhận chốt nhóm ghép phòng?',
      content: `Bài đăng "${post.title}" sẽ chuyển sang trạng thái Hoàn thành và đóng nhận đơn mới.`,
      okText: 'Chốt nhóm',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await lockGroup(post.id);
          message.success('Đã chốt nhóm thành công!');
          if (selectedPost && String(selectedPost.id) === String(post.id)) {
            setSelectedPost({ ...selectedPost, status: 'COMPLETED' });
          }
          refetch?.();
        } catch (err: any) {
          message.error(err?.message || 'Lỗi chốt nhóm');
        }
      },
    });
  };

  const handleClosePost = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận đóng bài đăng tìm bạn?',
      content: 'Bài đăng sẽ ngừng hiển thị công khai và không nhận thêm đơn mới.',
      okText: 'Đóng bài',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await closePost(id);
          message.success('Đã đóng bài đăng thành công.');
          if (selectedPost && String(selectedPost.id) === String(id)) {
            setSelectedPost({ ...selectedPost, status: 'CLOSED' });
          }
          refetch?.();
        } catch (err: any) {
          message.error(err?.message || 'Không thể đóng bài đăng');
        }
      },
    });
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (activeTab !== 'ALL' && p.status !== activeTab) return false;
      if (postTypeFilter !== 'ALL' && p.postType !== postTypeFilter) return false;
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(kw);
        const matchArea = (p.areaName || p.district || p.roomInfo?.address || '').toLowerCase().includes(kw);
        const matchCode = (p.code || '').toLowerCase().includes(kw);
        if (!matchTitle && !matchArea && !matchCode) return false;
      }
      return true;
    });
  }, [posts, activeTab, postTypeFilter, searchKeyword]);

  const openCount = posts.filter((p) => p.status === 'OPEN').length;
  const completedCount = posts.filter((p) => p.status === 'COMPLETED').length;
  const closedCount = posts.filter((p) => p.status === 'CLOSED').length;

  const columns = [
    {
      title: 'Mã tin',
      dataIndex: 'code',
      key: 'code',
      width: 90,
      render: (_: any, r: RoommatePost) => (
        <span className="font-mono text-xs font-semibold text-stay-text">
          {r.code || `#BG${r.id}`}
        </span>
      ),
    },
    {
      title: 'Tiêu đề bài đăng',
      key: 'title',
      render: (_: any, r: RoommatePost) => (
        <div className="space-y-1 max-w-md">
          <Link
            to={`/roommates/${r.id}`}
            target="_blank"
            className="text-xs sm:text-sm font-semibold text-stay-text hover:text-stay-primary transition-colors line-clamp-1 inline-flex items-center gap-1 group"
          >
            <span>{r.title}</span>
            <ExternalLink className="w-3 h-3 text-stay-text-muted group-hover:text-stay-primary shrink-0" />
          </Link>
          <div className="flex items-center gap-1 text-[11px] text-stay-text-secondary">
            <MapPin className="w-3 h-3 text-stay-text-muted shrink-0" />
            <span className="truncate">{r.areaName || r.district || r.roomInfo?.address}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Loại tin',
      dataIndex: 'postType',
      key: 'postType',
      width: 120,
      render: (type: string) => {
        const isHasRoom = type === 'HAS_ROOM';
        return (
          <span className="text-xs text-stay-text">
            {isHasRoom ? 'Đã có phòng' : 'Tìm cùng thuê'}
          </span>
        );
      },
    },
    {
      title: 'Giá share',
      dataIndex: 'sharePrice',
      key: 'sharePrice',
      width: 130,
      align: 'right' as const,
      render: (price: number) => (
        <span className="text-xs font-semibold text-stay-text">
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      width: 110,
      align: 'center' as const,
      render: (_: any, r: RoommatePost) => (
        <span className="text-xs text-stay-text">
          {r.currentRoommates} / {r.neededRoommates + r.currentRoommates} người
        </span>
      ),
    },
    {
      title: 'Đơn ứng tuyển',
      key: 'applications',
      width: 140,
      align: 'center' as const,
      render: (_: any, r: RoommatePost) => {
        const count = r.pendingApplicantsCount ?? 1;
        return (
          <Button
            size="small"
            onClick={() => handleOpenApplications(r)}
            className="text-xs rounded border-stay-border hover:border-stay-primary hover:text-stay-primary text-stay-text"
          >
            <Users className="w-3 h-3 inline mr-1" />
            Xem đơn ({count})
          </Button>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (st: RoommatePostStatus) => {
        if (st === 'OPEN') return <Tag color="green">Đang tìm</Tag>;
        if (st === 'COMPLETED') return <Tag color="blue">Đã chốt</Tag>;
        return <Tag>Đã đóng</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'right' as const,
      render: (_: any, r: RoommatePost) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleOpenApplications(r)}
            className="p-0 text-xs text-stay-primary"
          >
            Chi tiết
          </Button>

          {r.status === 'OPEN' && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'finish',
                    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
                    label: 'Chốt nhóm (Đủ người)',
                    onClick: () => handleFinishGroup(r),
                  },
                  {
                    key: 'close',
                    icon: <XCircle className="w-3.5 h-3.5 text-rose-500" />,
                    danger: true,
                    label: 'Đóng bài đăng',
                    onClick: () => handleClosePost(String(r.id)),
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button
                type="text"
                size="small"
                icon={<MoreHorizontal className="w-4 h-4 text-stay-text-secondary" />}
              />
            </Dropdown>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stay-border">
        <div>
          <h1 className="text-xl font-semibold text-stay-text tracking-tight">
            Bài đăng ở ghép của tôi
          </h1>
          <p className="text-xs text-stay-text-secondary mt-0.5">
            Quản lý các tin tìm bạn cùng phòng và tiếp nhận đơn xin gia nhập nhóm
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
          className="bg-stay-primary hover:bg-stay-primary-hover text-white rounded-lg h-9 text-xs sm:text-sm font-medium"
        >
          Đăng tin tìm bạn
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-stay-card-bg border border-stay-border rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { key: 'ALL', label: `Tất cả (${posts.length})` },
            { key: 'OPEN', label: `Đang tìm bạn (${openCount})` },
            { key: 'COMPLETED', label: `Đã chốt (${completedCount})` },
            { key: 'CLOSED', label: `Đã đóng (${closedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-stay-primary text-white font-semibold'
                  : 'text-stay-text-secondary hover:text-stay-text hover:bg-stay-bg-app'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Type Filters */}
        <div className="flex items-center gap-2">
          <Select
            value={postTypeFilter}
            onChange={(val) => setPostTypeFilter(val)}
            className="w-36 text-xs"
            size="middle"
            options={[
              { value: 'ALL', label: 'Tất cả loại tin' },
              { value: 'HAS_ROOM', label: 'Đã có phòng' },
              { value: 'SEARCHING_ROOM', label: 'Tìm cùng thuê' },
            ]}
          />

          <Input
            prefix={<Search className="w-3.5 h-3.5 text-stay-text-muted" />}
            placeholder="Tìm theo tiêu đề, địa chỉ..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
            className="w-56 text-xs"
            size="middle"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-stay-card-bg border border-stay-border rounded-xl overflow-hidden shadow-2xs">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-xs text-stay-text-secondary">
                  Không tìm thấy bài đăng nào phù hợp
                </span>
              }
            >
              <Button
                type="primary"
                size="small"
                onClick={() => setCreateModalOpen(true)}
                className="bg-stay-primary hover:bg-stay-primary-hover text-white text-xs"
              >
                Tạo bài đăng ngay
              </Button>
            </Empty>
          </div>
        ) : (
          <Table<RoommatePost>
            columns={columns}
            dataSource={filteredPosts}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              size: 'small',
            }}
            size="middle"
            scroll={{ x: 900 }}
          />
        )}
      </div>

      {/* Drawer xem đơn ứng tuyển */}
      <ApplicantDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        post={selectedPost}
        applications={applications}
        isLoading={isAppsLoading}
        onOpenReview={handleOpenReview}
        onFinishGroup={() => selectedPost && handleFinishGroup(selectedPost)}
        onClosePost={() => selectedPost && handleClosePost(String(selectedPost.id))}
      />

      {/* Modal đăng tin */}
      <CreatePostModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          refetch?.();
        }}
      />

      {/* Modals duyệt & từ chối đơn */}
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
    </div>
  );
};
