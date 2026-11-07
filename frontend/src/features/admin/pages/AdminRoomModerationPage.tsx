import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Check,
  X,
  Phone,
  RefreshCw,
  History,
  Unlock,
  AlertOctagon,
  Zap,
  Droplets,
} from 'lucide-react';
import { Table, Modal, Input, message, Tag, Tabs, Tooltip, Progress, Timeline } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { roomModerationService } from '@/shared/services/roomModerationService';
import {
  RoomModerationItem,
  RoomModerationDetailResponse,
} from '@/shared/types/roomModeration';
import { VerifiedLandlordBadge } from '@/shared/components';

export const AdminRoomModerationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rooms, setRooms] = useState<RoomModerationItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Detail & Audit Modal states
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [moderationDetail, setModerationDetail] = useState<RoomModerationDetailResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Reject Modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectingRoomId, setRejectingRoomId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch list of rooms for moderation
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const res = await roomModerationService.getModerationRooms();
      if (res.data) {
        setRooms(res.data);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải danh sách kiểm duyệt phòng trọ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch detail & audit logs
  const handleOpenDetail = async (roomId: number) => {
    setSelectedRoomId(roomId);
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    try {
      const res = await roomModerationService.getRoomModerationDetail(roomId);
      if (res.data) {
        setModerationDetail(res.data);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải chi tiết kiểm duyệt phòng');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Quick Approve
  const handleApprove = async (roomId: number) => {
    try {
      setIsSubmitting(true);
      const res = await roomModerationService.approveRoom(roomId);
      message.success(res.message || 'Đã phê duyệt tin đăng phòng trọ thành công!');
      fetchRooms();
      if (isDetailModalOpen && selectedRoomId === roomId) {
        setIsDetailModalOpen(false);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi khi phê duyệt tin đăng');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Reject Modal
  const handleOpenRejectModal = (roomId: number) => {
    setRejectingRoomId(roomId);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  // Confirm Reject
  const handleConfirmReject = async () => {
    if (!rejectingRoomId) return;
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối tin đăng');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await roomModerationService.rejectRoom(rejectingRoomId, rejectReason.trim());
      message.success(res.message || 'Đã từ chối tin đăng phòng trọ');
      setIsRejectModalOpen(false);
      fetchRooms();
      if (isDetailModalOpen && selectedRoomId === rejectingRoomId) {
        setIsDetailModalOpen(false);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi khi từ chối tin đăng');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unlock Stolen Images room
  const handleUnlock = async (roomId: number) => {
    try {
      setIsSubmitting(true);
      const res = await roomModerationService.unlockRoom(roomId);
      message.success(res.message || 'Đã mở khóa phòng trọ thành công!');
      fetchRooms();
      if (isDetailModalOpen && selectedRoomId === roomId) {
        setIsDetailModalOpen(false);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi khi mở khóa phòng trọ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      // Status filter
      if (statusFilter !== 'ALL' && r.moderationStatus !== statusFilter) {
        return false;
      }
      // Keyword filter
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        const matchName = r.name?.toLowerCase().includes(kw);
        const matchLandlord = r.landlordName?.toLowerCase().includes(kw);
        const matchPhone = r.landlordPhone?.includes(kw);
        const matchId = String(r.id).includes(kw);
        if (!matchName && !matchLandlord && !matchPhone && !matchId) {
          return false;
        }
      }
      return true;
    });
  }, [rooms, statusFilter, searchKeyword]);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: rooms.length,
      pending: rooms.filter((r) => r.moderationStatus === 'PENDING_REVIEW').length,
      stolenLocked: rooms.filter((r) => r.moderationStatus === 'LOCKED_STOLEN_IMAGES').length,
      rejected: rooms.filter((r) => r.moderationStatus === 'REJECTED').length,
      approved: rooms.filter((r) => r.moderationStatus === 'APPROVED').length,
    };
  }, [rooms]);

  // Risk Score Badge Helper
  const renderRiskBadge = (score: number = 0, moderationStatus: string) => {
    if (moderationStatus === 'LOCKED_STOLEN_IMAGES') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
          <AlertOctagon className="w-3.5 h-3.5" /> 100đ • Trộm ảnh vi phạm
        </span>
      );
    }

    if (score >= 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
          <AlertTriangle className="w-3.5 h-3.5" /> {score}đ • Rủi ro cao
        </span>
      );
    }

    if (score >= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5" /> {score}đ • Cần xem xét
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" /> {score}đ • An toàn
      </span>
    );
  };

  // Moderation Status Tag Helper
  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <Tag color="gold" className="font-medium">
            Chờ admin duyệt
          </Tag>
        );
      case 'LOCKED_STOLEN_IMAGES':
        return (
          <Tag color="magenta" className="font-bold">
            Khóa do trộm ảnh
          </Tag>
        );
      case 'REJECTED':
        return (
          <Tag color="red" className="font-medium">
            Từ chối duyệt
          </Tag>
        );
      case 'APPROVED':
        return (
          <Tag color="green" className="font-medium">
            Đã phê duyệt
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Table Columns
  const columns: ColumnsType<RoomModerationItem> = [
    {
      title: 'Phòng trọ',
      key: 'room',
      width: 280,
      render: (_, record) => {
        const thumb =
          record.watermarkedImageUrls?.[0] || record.imageUrls?.[0] || 'https://via.placeholder.com/80';
        return (
          <div className="flex items-start gap-3">
            <img
              src={thumb}
              alt={record.name}
              className="w-14 h-14 rounded-lg object-cover border border-stay-border shrink-0 bg-slate-100 dark:bg-slate-800"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=120';
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-stay-text line-clamp-1">{record.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-stay-text-muted">
                  ID: #{record.id}
                </span>
              </div>
              <p className="text-xs text-stay-text-secondary line-clamp-1 mt-0.5">
                {record.buildingName ? `${record.buildingName} • ` : ''}Tầng {record.floor} • {record.area}m²
              </p>
              <p className="text-[11px] text-stay-text-muted line-clamp-1">
                {record.province || record.fullAddress || 'Chưa cập nhật địa chỉ'}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Chủ trọ',
      key: 'landlord',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-stay-text">{record.landlordName || 'Chủ trọ'}</span>
            {record.landlordVerified && <VerifiedLandlordBadge size="sm" showText={false} />}
          </div>
          {record.landlordPhone && (
            <p className="text-xs text-stay-text-secondary flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-stay-text-muted" /> {record.landlordPhone}
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Đơn giá & Tiền cọc',
      key: 'price',
      width: 190,
      render: (_, record) => (
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-stay-primary">
            {record.listedPrice ? Number(record.listedPrice).toLocaleString('vi-VN') : '0'} đ/tháng
          </p>
          <p className="text-stay-text-secondary">
            Cọc: {record.standardDeposit ? Number(record.standardDeposit).toLocaleString('vi-VN') : '0'} đ
          </p>
          <div className="flex items-center gap-2 text-[11px] text-stay-text-muted pt-0.5">
            <span className="flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 text-amber-500" /> {record.electricityPrice || 0}đ
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Droplets className="w-2.5 h-2.5 text-blue-500" /> {record.waterPrice || 0}đ
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Điểm rủi ro AI',
      key: 'riskScore',
      width: 200,
      render: (_, record) => renderRiskBadge(record.riskScore, record.moderationStatus),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => renderStatusTag(record.moderationStatus),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip title="Xem chi tiết & Lịch sử chỉnh sửa">
            <button
              onClick={() => handleOpenDetail(record.id)}
              className="p-1.5 rounded-lg border border-stay-border text-stay-text hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>

          {record.moderationStatus === 'LOCKED_STOLEN_IMAGES' ? (
            <Tooltip title="Mở khóa tin vi phạm">
              <button
                onClick={() => handleUnlock(record.id)}
                disabled={isSubmitting}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1 transition"
              >
                <Unlock className="w-3.5 h-3.5" /> Mở khóa
              </button>
            </Tooltip>
          ) : (
            <>
              {record.moderationStatus !== 'APPROVED' && (
                <Tooltip title="Phê duyệt tin">
                  <button
                    onClick={() => handleApprove(record.id)}
                    disabled={isSubmitting}
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
              {record.moderationStatus !== 'REJECTED' && (
                <Tooltip title="Từ chối tin">
                  <button
                    onClick={() => handleOpenRejectModal(record.id)}
                    disabled={isSubmitting}
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stay-text flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            Kiểm duyệt & Xử lý Rủi ro Tin đăng
          </h1>
          <p className="text-xs sm:text-sm text-stay-text-secondary mt-0.5">
            Hệ thống phân tích điểm rủi ro rule-based, phát hiện SĐT/mạng xã hội/STK và chống trộm ảnh dHash
          </p>
        </div>
        <button
          onClick={fetchRooms}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stay-border bg-stay-card-bg text-stay-text hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setStatusFilter('PENDING_REVIEW')}
          className={`p-4 rounded-2xl border bg-stay-card-bg cursor-pointer transition shadow-sm ${
            statusFilter === 'PENDING_REVIEW'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-stay-border hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stay-text-secondary">Chờ kiểm duyệt</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-stay-text mt-2">{stats.pending}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Điểm rủi ro 30 - 60 điểm</p>
        </div>

        <div
          onClick={() => setStatusFilter('LOCKED_STOLEN_IMAGES')}
          className={`p-4 rounded-2xl border bg-stay-card-bg cursor-pointer transition shadow-sm ${
            statusFilter === 'LOCKED_STOLEN_IMAGES'
              ? 'border-rose-600 ring-2 ring-rose-600/20'
              : 'border-stay-border hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stay-text-secondary">Trộm ảnh vi phạm</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-stay-text mt-2">{stats.stolenLocked}</p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">Khóa vĩnh viễn (100 điểm)</p>
        </div>

        <div
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-4 rounded-2xl border bg-stay-card-bg cursor-pointer transition shadow-sm ${
            statusFilter === 'REJECTED'
              ? 'border-red-500 ring-2 ring-red-500/20'
              : 'border-stay-border hover:border-red-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stay-text-secondary">Bị từ chối</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-stay-text mt-2">{stats.rejected}</p>
          <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">Điểm rủi ro &gt; 60 điểm</p>
        </div>

        <div
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-4 rounded-2xl border bg-stay-card-bg cursor-pointer transition shadow-sm ${
            statusFilter === 'APPROVED'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-stay-border hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stay-text-secondary">Đã phê duyệt</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-stay-text mt-2">{stats.approved}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">An toàn hiển thị trên sàn</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-stay-card-bg p-4 rounded-2xl border border-stay-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'PENDING_REVIEW', label: `Chờ duyệt (${stats.pending})` },
            { key: 'LOCKED_STOLEN_IMAGES', label: `Trộm ảnh (${stats.stolenLocked})` },
            { key: 'REJECTED', label: `Từ chối (${stats.rejected})` },
            { key: 'APPROVED', label: `Đã duyệt (${stats.approved})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-stay-primary text-white shadow-sm'
                  : 'text-stay-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stay-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên phòng, ID, chủ trọ, SĐT..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stay-border bg-stay-bg-app text-stay-text text-xs focus:outline-none focus:border-stay-primary transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-stay-card-bg rounded-2xl border border-stay-border shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredRooms}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 8, showTotal: (total) => `Tổng ${total} tin đăng` }}
          scroll={{ x: 1000 }}
        />
      </div>

      {/* MODAL CHI TIẾT KIỂM DUYỆT & LỊCH SỬ CHỈNH SỬA */}
      <Modal
        title={
          <div className="flex items-center gap-2 pr-6">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span className="font-bold text-stay-text">
              Chi tiết Kiểm duyệt & Lịch sử Chỉnh sửa: {moderationDetail?.room?.name || 'Phòng trọ'}
            </span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={850}
        destroyOnClose
      >
        {isDetailLoading ? (
          <div className="py-16 text-center text-stay-text-secondary">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-stay-primary" />
            Đang tải dữ liệu kiểm duyệt và lịch sử audit...
          </div>
        ) : moderationDetail ? (
          <div className="space-y-6 pt-2">
            {/* Cảnh báo trộm ảnh nếu có */}
            {moderationDetail.riskEvaluation?.hasStolenImages && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <h4 className="font-bold text-sm text-rose-700 dark:text-rose-300">
                    CẢNH BÁO VI PHẠM BẢN QUYỀN HÌNH ẢNH (100 ĐIỂM)
                  </h4>
                  <p className="text-xs mt-1">
                    {moderationDetail.riskEvaluation.moderationReason ||
                      'Hệ thống phát hiện hình ảnh trùng khớp với tin đăng của chủ trọ khác. Tin đăng đã bị khóa vĩnh viễn.'}
                  </p>
                </div>
              </div>
            )}

            {/* Tabs Chi Tiết */}
            <Tabs
              defaultActiveKey="evaluation"
              items={[
                {
                  key: 'evaluation',
                  label: (
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ShieldCheck className="w-4 h-4" /> Bảng Điểm Rủi Ro ({moderationDetail.room.riskScore || 0}đ)
                    </span>
                  ),
                  children: (
                    <div className="space-y-4 pt-1">
                      {/* Risk Score Gauge */}
                      <div className="p-4 rounded-xl border border-stay-border bg-stay-bg-app">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-stay-text">
                            Tổng điểm rủi ro tính theo luật:
                          </span>
                          <span className="text-sm font-black text-stay-primary">
                            {moderationDetail.riskEvaluation?.totalRiskScore || moderationDetail.room.riskScore || 0} / 100 điểm
                          </span>
                        </div>
                        <Progress
                          percent={
                            moderationDetail.riskEvaluation?.totalRiskScore ||
                            moderationDetail.room.riskScore ||
                            0
                          }
                          status={
                            (moderationDetail.room.riskScore || 0) >= 60
                              ? 'exception'
                              : (moderationDetail.room.riskScore || 0) >= 30
                              ? 'active'
                              : 'success'
                          }
                          strokeColor={
                            (moderationDetail.room.riskScore || 0) >= 60
                              ? '#ef4444'
                              : (moderationDetail.room.riskScore || 0) >= 30
                              ? '#f59e0b'
                              : '#10b981'
                          }
                        />
                        <p className="text-xs text-stay-text-secondary mt-2">
                          <strong>Kết luận kiểm duyệt:</strong>{' '}
                          {moderationDetail.riskEvaluation?.moderationReason ||
                            moderationDetail.room.moderationReason ||
                            'Chưa có kết luận'}
                        </p>
                      </div>

                      {/* Triggered Rules List */}
                      <div>
                        <h4 className="text-xs font-bold text-stay-text-secondary uppercase tracking-wider mb-2">
                          Các luật rủi ro bị kích hoạt:
                        </h4>
                        {moderationDetail.riskEvaluation?.triggeredRules &&
                        moderationDetail.riskEvaluation.triggeredRules.length > 0 ? (
                          <div className="space-y-2">
                            {moderationDetail.riskEvaluation.triggeredRules.map((rule, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl border border-stay-border bg-stay-card-bg flex items-start justify-between gap-3"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-stay-text">{rule.ruleName}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-stay-text-muted">
                                      {rule.ruleCode}
                                    </span>
                                  </div>
                                  <p className="text-xs text-stay-text-secondary">{rule.description}</p>
                                </div>
                                <span className="shrink-0 text-xs font-bold text-rose-600 bg-rose-500/10 px-2 py-1 rounded-lg">
                                  +{rule.penaltyPoints}đ
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl border border-stay-border bg-stay-card-bg text-center text-xs text-stay-text-secondary">
                            Không phát hiện dấu hiệu vi phạm nào. Tin đăng đạt tiêu chuẩn an toàn.
                          </div>
                        )}
                      </div>

                      {/* Thông tin phòng trọ */}
                      <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-stay-border bg-stay-bg-app text-xs">
                        <div>
                          <span className="text-stay-text-muted">Giá niêm yết:</span>
                          <p className="font-bold text-stay-text mt-0.5">
                            {Number(moderationDetail.room.listedPrice || 0).toLocaleString('vi-VN')} đ/tháng
                          </p>
                        </div>
                        <div>
                          <span className="text-stay-text-muted">Tiền cọc:</span>
                          <p className="font-bold text-stay-text mt-0.5">
                            {Number(moderationDetail.room.standardDeposit || 0).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                        <div>
                          <span className="text-stay-text-muted">Giá điện:</span>
                          <p className="font-medium text-stay-text mt-0.5">
                            {Number(moderationDetail.room.electricityPrice || 0).toLocaleString('vi-VN')} đ/kWh
                          </p>
                        </div>
                        <div>
                          <span className="text-stay-text-muted">Giá nước:</span>
                          <p className="font-medium text-stay-text mt-0.5">
                            {Number(moderationDetail.room.waterPrice || 0).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>

                      {/* Watermarked Images Preview */}
                      <div>
                        <h4 className="text-xs font-bold text-stay-text-secondary uppercase tracking-wider mb-2">
                          Ảnh phòng trọ (Đã đóng dấu Watermark tự động chống trộm):
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {(
                            moderationDetail.room.watermarkedImageUrls ||
                            moderationDetail.room.imageUrls ||
                            []
                          ).map((imgUrl, i) => (
                            <img
                              key={i}
                              src={imgUrl}
                              alt={`Ảnh ${i + 1}`}
                              className="w-full h-28 object-cover rounded-xl border border-stay-border bg-slate-100 dark:bg-slate-800"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'auditLogs',
                  label: (
                    <span className="flex items-center gap-1.5 font-semibold">
                      <History className="w-4 h-4" /> Lịch Sử Chỉnh Sửa & Audit Log ({moderationDetail.auditLogs?.length || 0})
                    </span>
                  ),
                  children: (
                    <div className="pt-2">
                      {moderationDetail.auditLogs && moderationDetail.auditLogs.length > 0 ? (
                        <Timeline
                          items={moderationDetail.auditLogs.map((log) => {
                            const isApproved = log.action === 'MODERATION_APPROVED';
                            const isRejected = log.action === 'MODERATION_REJECTED';
                            const isUnlocked = log.action === 'MODERATION_UNLOCKED';
                            const isCreated = log.action === 'CREATED';

                            return {
                              color: isApproved ? 'green' : isRejected ? 'red' : isUnlocked ? 'blue' : isCreated ? 'purple' : 'gray',
                              children: (
                                <div className="p-3 rounded-xl border border-stay-border bg-stay-bg-app mb-2 text-xs">
                                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-stay-text">{log.actorName || 'Người dùng'}</span>
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-stay-text">
                                        {log.actorRole === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Chủ trọ'}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-stay-text-muted">{log.createdAt}</span>
                                  </div>
                                  <div className="flex items-center gap-2 my-1">
                                    <Tag color={isApproved ? 'green' : isRejected ? 'red' : 'blue'}>
                                      {log.action}
                                    </Tag>
                                    {log.riskScore !== undefined && log.riskScore > 0 && (
                                      <span className="text-[10px] text-stay-text-muted">
                                        Điểm rủi ro: {log.riskScore}đ
                                      </span>
                                    )}
                                  </div>
                                  {log.changedSummary && (
                                    <p className="text-stay-text-secondary mt-1 font-medium">
                                      {log.changedSummary}
                                    </p>
                                  )}
                                  {log.reason && (
                                    <p className="text-stay-text-muted mt-0.5 italic">
                                      Ghi chú / Lý do: {log.reason}
                                    </p>
                                  )}
                                </div>
                              ),
                            };
                          })}
                        />
                      ) : (
                        <div className="py-12 text-center text-xs text-stay-text-secondary">
                          Chưa có bản ghi nhật ký kiểm duyệt nào cho phòng trọ này.
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-stay-border">
              {moderationDetail.room.moderationStatus === 'LOCKED_STOLEN_IMAGES' ? (
                <button
                  onClick={() => handleUnlock(moderationDetail.room.id)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition flex items-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" /> Mở khóa bản quyền
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleOpenRejectModal(moderationDetail.room.id)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Từ chối duyệt tin
                  </button>
                  <button
                    onClick={() => handleApprove(moderationDetail.room.id)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Phê duyệt tin đăng
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* MODAL NHẬP LÝ DO TỪ CHỐI */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <XCircle className="w-5 h-5" />
            <span className="font-bold">Từ chối duyệt tin đăng phòng trọ</span>
          </div>
        }
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        onOk={handleConfirmReject}
        confirmLoading={isSubmitting}
        okText="Xác nhận từ chối"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
      >
        <div className="space-y-3 pt-2">
          <p className="text-xs text-stay-text-secondary">
            Vui lòng nhập lý do cụ thể để gửi thông báo giải thích đến chủ trọ và lưu vào nhật ký Audit:
          </p>
          <Input.TextArea
            rows={4}
            placeholder="Ví dụ: Hình ảnh mờ không rõ ràng; giá điện nước vượt quy định nhà nước; bài đăng chứa SĐT trao đổi ngoài..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
