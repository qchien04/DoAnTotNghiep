import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  useMyRoommatePosts,
  useCloseRoommatePost,
  useCompleteRoommatePost,
  useApplications,
  useApproveApplication,
  useRejectApplication,
} from '@/shared/hooks';
import { Table } from '@/shared/components';
import {
  Button,
  Input,
  Select,
  Modal,
  message,
  Tooltip,
} from 'antd';
import {
  Plus,
  Search,
  Users,
  MapPin,
  ExternalLink,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { RoommatePost, RoommatePostStatus, RoommateApplication } from '@/shared/types/tenant';
import { formatCurrency } from '@/shared/utils';
import { ApplicantDrawer } from './components/ApplicantDrawer';
import { ReviewApplicantModal } from './components/ReviewApplicantModal';
import { RejectApplicantModal } from './components/RejectApplicantModal';
import { CreatePostModal } from './components/CreatePostModal';

export const MyRoommatePostsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [activeTab, setActiveTab] = useState<RoommatePostStatus | 'ALL'>('ALL');
  const [postTypeFilter, setPostTypeFilter] = useState<'ALL' | 'HAS_ROOM' | 'SEARCHING_ROOM'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const { pageInfo, isLoading, refetch } = useMyRoommatePosts({
    page,
    size,
    keyword: searchKeyword || undefined,
    status: activeTab === 'ALL' ? undefined : activeTab,
    postType: postTypeFilter === 'ALL' ? undefined : postTypeFilter,
  });

  const { closePost } = useCloseRoommatePost();
  const { completePost: lockGroup } = useCompleteRoommatePost();

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
    refetch: refetchApps,
    isLoading: isAppsLoading,
  } = useApplications(selectedPost?.id ? String(selectedPost.id) : '');

  const { approveApplication } = useApproveApplication();
  const { rejectApplication } = useRejectApplication();

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

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <span className="text-[14px] text-stay-text-secondary font-medium">
          {index + 1}
        </span>
      ),
    },
    {
      title: 'Tiêu đề bài đăng',
      key: 'title',
      render: (_: any, r: RoommatePost) => (
        <div className="space-y-0.5 max-w-md">
          <Link
            to={`/roommates/${r.id}`}
            target="_blank"
            className="text-[14px] font-medium text-stay-text hover:text-stay-primary transition-colors line-clamp-1 inline-flex items-center gap-1 group"
          >
            <span>{r.title}</span>
            <ExternalLink className="w-3 h-3 text-stay-text-muted group-hover:text-stay-primary shrink-0" />
          </Link>
          <div className="flex items-center gap-1 text-[12px] text-stay-text-muted">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{r.areaName || r.district || r.roomInfo?.address}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Loại tin',
      dataIndex: 'postType',
      key: 'postType',
      width: 130,
      render: (type: string) => {
        const isHasRoom = type === 'HAS_ROOM';
        return (
          <span className="text-[14px] text-stay-text-secondary">
            {isHasRoom ? 'Đã có phòng' : 'Tìm cùng thuê'}
          </span>
        );
      },
    },
    {
      title: 'Giá share',
      dataIndex: 'sharePrice',
      key: 'sharePrice',
      width: 140,
      align: 'right' as const,
      render: (price: number) => (
        <span className="text-[14px] font-semibold text-stay-text">
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: 'Tiến độ ghép',
      key: 'progress',
      width: 130,
      align: 'center' as const,
      render: (_: any, r: RoommatePost) => (
        <span className="text-[14px] text-stay-text">
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
        const count = r.pendingApplicantsCount ?? 0;
        return (
          <Button
            size="small"
            onClick={() => handleOpenApplications(r)}
            className="h-[32px] rounded-[6px] border-stay-border hover:border-stay-primary hover:text-stay-primary text-stay-text text-xs"
          >
            <Users className="w-3.5 h-3.5 inline mr-1" />
            Xem đơn ({count})
          </Button>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center' as const,
      render: (st: RoommatePostStatus) => {
        if (st === 'OPEN') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">Đang tìm</span>;
        if (st === 'COMPLETED') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-stay-primary bg-stay-primary/10 border border-stay-primary/20">Đã chốt</span>;
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-stay-text-muted bg-stay-bg-app border border-stay-border">Đã đóng</span>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      fixed: 'right' as const,
      render: (_: any, r: RoommatePost) => {
        const isOpen = r.status === 'OPEN';
        return (
          <div className="flex items-center justify-start gap-1.5">
            <Tooltip title="Xem đơn ứng tuyển">
              <button
                type="button"
                className="stay-action-btn stay-action-btn-view"
                onClick={() => handleOpenApplications(r)}
              >
                <Users className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title={isOpen ? 'Chốt nhóm (Đã đủ người)' : 'Bài đăng đã kết thúc'}>
              <button
                type="button"
                className={`stay-action-btn ${isOpen ? 'stay-action-btn-edit' : 'opacity-40 cursor-not-allowed text-slate-400'}`}
                onClick={() => isOpen && handleFinishGroup(r)}
                disabled={!isOpen}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title={isOpen ? 'Đóng bài đăng' : 'Bài đăng đã đóng'}>
              <button
                type="button"
                className={`stay-action-btn ${isOpen ? 'stay-action-btn-delete' : 'opacity-40 cursor-not-allowed text-slate-400'}`}
                onClick={() => isOpen && handleClosePost(String(r.id))}
                disabled={!isOpen}
              >
                <XCircle className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Standard Filter Bar */}
      <div className="bg-stay-card-bg p-4 rounded-xl border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm theo tiêu đề, địa chỉ..."
          prefix={<Search className="w-4 h-4 text-[#8C8C8C]" />}
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
            setPage(0);
          }}
          allowClear
          className="w-full sm:w-[320px] h-[40px] rounded-[8px]"
        />

        <Select
          value={activeTab}
          onChange={(val) => {
            setActiveTab(val as any);
            setPage(0);
          }}
          className="w-full sm:w-[200px] h-[40px] rounded-[8px]"
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'OPEN', label: 'Đang tìm bạn' },
            { value: 'COMPLETED', label: 'Đã chốt nhóm' },
            { value: 'CLOSED', label: 'Đã đóng bài' },
          ]}
        />

        <Select
          value={postTypeFilter}
          onChange={(val) => {
            setPostTypeFilter(val as any);
            setPage(0);
          }}
          className="w-full sm:w-[200px] h-[40px] rounded-[8px]"
          options={[
            { value: 'ALL', label: 'Tất cả loại tin' },
            { value: 'HAS_ROOM', label: 'Đã có phòng' },
            { value: 'SEARCHING_ROOM', label: 'Tìm cùng thuê' },
          ]}
        />

        <Button
          icon={<RotateCcw className="w-4 h-4 text-stay-text-secondary" />}
          onClick={() => {
            setSearchKeyword('');
            setActiveTab('ALL');
            setPostTypeFilter('ALL');
            setPage(0);
          }}
          className="h-[40px] rounded-[8px] border-[#D7D7DB] dark:border-stay-border text-stay-text hover:text-stay-primary font-medium"
        >
          Đặt lại
        </Button>

        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
          className="ml-auto bg-stay-primary hover:bg-stay-primary-hover h-[40px] px-4 font-medium"
        >
          Đăng tin tìm bạn
        </Button>
      </div>

      {/* Main Table */}
      <Table<RoommatePost>
        columns={columns}
        dataSource={pageInfo?.items ?? []}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        className="overflow-x-auto"
        pagination={{
          current: (pageInfo?.page ?? 0) + 1,
          pageSize: pageInfo?.size ?? 10,
          total: pageInfo?.totalElements ?? 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng ${total} bài đăng`,
          onChange: (p, s) => {
            setPage(p - 1);
            setSize(s);
          },
        }}
      />

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
