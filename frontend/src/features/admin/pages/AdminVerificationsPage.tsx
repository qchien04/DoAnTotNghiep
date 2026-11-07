import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Check,
  X,
  Phone,
  Mail,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Table, Modal, Input, message, Image, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { landlordVerificationService } from '@/shared/services/landlordVerificationService';
import {
  LandlordVerificationResponse,
  LandlordVerificationOverviewStats,
  LandlordVerificationStatus,
} from '@/shared/types/landlordVerification';
import { VerifiedLandlordBadge } from '@/shared/components';

export const AdminVerificationsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verifications, setVerifications] = useState<LandlordVerificationResponse[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<LandlordVerificationStatus | 'ALL'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Overview stats
  const [stats, setStats] = useState<LandlordVerificationOverviewStats>({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });

  // Drawer / Detail modal
  const [selectedVerification, setSelectedVerification] = useState<LandlordVerificationResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Reject modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchStats();
    fetchVerifications();
  }, [statusFilter, currentPage, pageSize]);

  const fetchStats = async () => {
    try {
      const data = await landlordVerificationService.getOverviewStats();
      setStats(data);
    } catch (err) {
      console.error('Không thể lấy thống kê xác minh:', err);
    }
  };

  const fetchVerifications = async () => {
    try {
      setIsLoading(true);
      const res = await landlordVerificationService.getAdminVerifications({
        status: statusFilter,
        search: searchKeyword.trim(),
        page: currentPage - 1,
        size: pageSize,
      });
      setVerifications(res.items);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      message.error('Không thể tải danh sách hồ sơ xác minh');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVerifications();
  };

  const handleOpenDetail = (item: LandlordVerificationResponse) => {
    setSelectedVerification(item);
    setIsDetailModalOpen(true);
  };

  const handleApprove = async (id: number) => {
    try {
      setIsActionLoading(true);
      const res = await landlordVerificationService.approveVerification(id);
      message.success('Đã phê duyệt hồ sơ và gắn huy hiệu Chủ trọ xác minh thành công!');

      // Update local state
      setVerifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'VERIFIED', rejectionReason: null } : item))
      );
      if (selectedVerification?.id === id) {
        setSelectedVerification(res);
      }
      fetchStats();
    } catch (err: any) {
      message.error(err?.response?.data?.message || err.message || 'Lỗi khi phê duyệt hồ sơ');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenRejectModal = () => {
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedVerification) return;
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối hồ sơ');
      return;
    }

    try {
      setIsActionLoading(true);
      const res = await landlordVerificationService.rejectVerification(selectedVerification.id, rejectReason.trim());
      message.success('Đã từ chối hồ sơ xác minh và gửi phản hồi tới chủ trọ');

      // Update local state
      setVerifications((prev) =>
        prev.map((item) => (item.id === selectedVerification.id ? { ...item, status: 'REJECTED', rejectionReason: rejectReason.trim() } : item))
      );
      setSelectedVerification(res);
      setIsRejectModalOpen(false);
      fetchStats();
    } catch (err: any) {
      message.error(err?.response?.data?.message || err.message || 'Lỗi khi từ chối hồ sơ');
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (status: LandlordVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 size={12} /> Đã duyệt
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock size={12} /> Chờ duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
            <XCircle size={12} /> Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500">
            Chưa nộp
          </span>
        );
    }
  };

  const columns: ColumnsType<LandlordVerificationResponse> = [
    {
      title: 'Chủ trọ',
      key: 'landlord',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.landlordAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={record.landlordName || 'Chủ trọ'}
            className="w-10 h-10 rounded-full object-cover border border-stay-border"
          />
          <div>
            <div className="font-semibold text-stay-text text-sm flex items-center gap-1.5">
              <span>{record.landlordName || 'Chưa cập nhật tên'}</span>
              {record.status === 'VERIFIED' && <VerifiedLandlordBadge size="sm" showText={false} />}
            </div>
            <div className="text-xs text-stay-text-muted flex items-center gap-2 mt-0.5">
              {record.landlordPhone && <span>{record.landlordPhone}</span>}
              {record.landlordEmail && <span>• {record.landlordEmail}</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Loại tài liệu',
      dataIndex: 'verificationTypeDisplay',
      key: 'verificationType',
      render: (_, record) => (
        <div>
          <span className="font-medium text-stay-text text-xs block">
            {record.verificationTypeDisplay}
          </span>
          {record.documentNumber && (
            <span className="text-[11px] text-stay-text-muted">
              Số: {record.documentNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Ảnh giấy tờ',
      key: 'documents',
      render: (_, record) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stay-bg-app border border-stay-border text-stay-text-secondary">
          {record.documents?.length || 0} ảnh
        </span>
      ),
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => (
        <span className="text-xs text-stay-text-secondary">
          {val ? new Date(val).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => getStatusBadge(record.status),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <button
          onClick={() => handleOpenDetail(record)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            text-stay-primary bg-stay-primary-subtle border border-stay-primary/20
            hover:bg-stay-primary hover:text-white transition-colors cursor-pointer"
        >
          <Eye size={14} />
          Chi tiết & Duyệt
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stay-text flex items-center gap-2.5">
            <ShieldCheck className="text-stay-primary" size={28} />
            Duyệt Xác Minh Chủ Trọ
          </h1>
          <p className="text-sm text-stay-text-secondary mt-1">
            Thẩm định ảnh chụp Sổ đỏ/Sổ hồng hoặc Hợp đồng ủy quyền để cấp huy hiệu Chủ trọ xác minh và quyền đăng tin.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchVerifications();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl
            border border-stay-border text-stay-text-secondary hover:text-stay-text
            bg-stay-card-bg hover:bg-stay-bg-app transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          Làm mới danh sách
        </button>
      </div>

      {/* Thẻ thống kê 4 ô */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'ALL'
              ? 'bg-stay-primary-subtle/40 border-stay-primary shadow-xs'
              : 'bg-stay-card-bg border-stay-border hover:border-stay-border-subtle'
          }`}
        >
          <span className="text-xs font-medium text-stay-text-muted">Tổng hồ sơ</span>
          <p className="text-2xl font-bold text-stay-text mt-1">{stats.total}</p>
        </div>

        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500/10 border-amber-500 shadow-xs'
              : 'bg-stay-card-bg border-stay-border hover:border-amber-500/40'
          }`}
        >
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock size={14} /> Chờ xét duyệt
          </span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</p>
        </div>

        <div
          onClick={() => setStatusFilter('VERIFIED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'VERIFIED'
              ? 'bg-emerald-500/10 border-emerald-500 shadow-xs'
              : 'bg-stay-card-bg border-stay-border hover:border-emerald-500/40'
          }`}
        >
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={14} /> Đã phê duyệt
          </span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.verified}</p>
        </div>

        <div
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'REJECTED'
              ? 'bg-red-500/10 border-red-500 shadow-xs'
              : 'bg-stay-card-bg border-stay-border hover:border-red-500/40'
          }`}
        >
          <span className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
            <XCircle size={14} /> Đã từ chối
          </span>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="p-4 rounded-2xl bg-stay-card-bg border border-stay-border flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                statusFilter === tab
                  ? 'bg-stay-primary text-white shadow-xs'
                  : 'bg-stay-bg-app text-stay-text-secondary hover:text-stay-text border border-stay-border'
              }`}
            >
              {tab === 'ALL' && 'Tất cả'}
              {tab === 'PENDING' && 'Chờ duyệt'}
              {tab === 'VERIFIED' && 'Đã duyệt'}
              {tab === 'REJECTED' && 'Từ chối'}
            </button>
          ))}
        </div>

        {/* Ô tìm kiếm */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stay-text-muted" size={16} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm tên, SĐT, email, số hiệu..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-stay-bg-app border border-stay-border text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:border-stay-primary"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stay-primary text-white hover:bg-stay-primary-hover transition-colors cursor-pointer"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-stay-card-bg border border-stay-border rounded-2xl overflow-hidden shadow-xs">
        <Table
          columns={columns}
          dataSource={verifications}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalElements,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          className="stay-table"
        />
      </div>

      {/* MODAL CHI TIẾT HỒ SƠ & DUYỆT / TỪ CHỐI */}
      <Modal
        title={
          <div className="flex items-center gap-2.5 pr-6">
            <ShieldCheck className="text-stay-primary" size={22} />
            <span className="font-bold text-base text-stay-text">
              Thẩm Định Hồ Sơ Xác Minh Chủ Trọ #{selectedVerification?.id}
            </span>
            {selectedVerification && getStatusBadge(selectedVerification.status)}
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={850}
        footer={null}
        destroyOnClose
      >
        {selectedVerification && (
          <div className="space-y-6 pt-3">
            {/* Thông tin chủ trọ */}
            <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border-subtle grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedVerification.landlordAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={selectedVerification.landlordName || 'Chủ trọ'}
                  className="w-12 h-12 rounded-full object-cover border border-stay-border"
                />
                <div>
                  <h3 className="font-bold text-stay-text text-sm flex items-center gap-1.5">
                    {selectedVerification.landlordName}
                    {selectedVerification.status === 'VERIFIED' && <VerifiedLandlordBadge size="sm" showText={false} />}
                  </h3>
                  <p className="text-xs text-stay-text-muted">ID Tài khoản: #{selectedVerification.userId}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-stay-text-secondary">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-stay-text-muted" />
                  <span>{selectedVerification.landlordEmail || 'Chưa có email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-stay-text-muted" />
                  <span>{selectedVerification.landlordPhone || 'Chưa có SĐT'}</span>
                </div>
              </div>
            </div>

            {/* Thông tin tài liệu nhà đất */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stay-text-muted uppercase tracking-wider">
                Thông tin pháp lý tài liệu
              </h4>
              <div className="p-4 rounded-xl bg-stay-card-bg border border-stay-border grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stay-text-muted block">Loại tài liệu:</span>
                  <span className="font-semibold text-stay-text text-sm">
                    {selectedVerification.verificationTypeDisplay}
                  </span>
                </div>
                <div>
                  <span className="text-stay-text-muted block">Số hiệu giấy tờ:</span>
                  <span className="font-semibold text-stay-text text-sm">
                    {selectedVerification.documentNumber || 'Chưa cung cấp'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-stay-text-muted block">Địa chỉ bất động sản / Cơ sở trọ:</span>
                  <span className="font-medium text-stay-text">
                    {selectedVerification.propertyAddress || 'Chưa cung cấp'}
                  </span>
                </div>
                {selectedVerification.notes && (
                  <div className="md:col-span-2 pt-2 border-t border-stay-border-subtle">
                    <span className="text-stay-text-muted block">Ghi chú từ chủ trọ:</span>
                    <span className="text-stay-text-secondary italic">"{selectedVerification.notes}"</span>
                  </div>
                )}
                {selectedVerification.rejectionReason && (
                  <div className="md:col-span-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                    <strong className="block mb-0.5">Lý do từ chối trước đó:</strong>
                    <span>{selectedVerification.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* BỘ ẢNH GIẤY TỜ & TÍNH NĂNG SOI ẢNH CHI TIẾT */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stay-text-muted uppercase tracking-wider">
                  Hình ảnh tài liệu đính kèm ({selectedVerification.documents?.length || 0} ảnh)
                </h4>
                <span className="text-[11px] text-stay-text-muted italic">
                  * Nhấn vào ảnh để phóng to, xoay 90°, lật ảnh và soi con dấu
                </span>
              </div>

              {selectedVerification.documents && selectedVerification.documents.length > 0 ? (
                <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border">
                  <Image.PreviewGroup>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {selectedVerification.documents.map((doc, idx) => (
                        <div key={doc.id} className="relative group rounded-xl overflow-hidden border border-stay-border bg-stay-card-bg">
                          <Image
                            src={doc.viewUrl}
                            alt={doc.originalFilename}
                            className="w-full h-36 object-cover cursor-zoom-in"
                          />
                          <div className="p-2 bg-stay-card-bg border-t border-stay-border-subtle text-[11px] text-stay-text truncate">
                            <span className="font-semibold text-stay-primary mr-1">#{idx + 1}</span>
                            {doc.originalFilename}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-stay-bg-app border border-stay-border text-stay-text-muted text-xs">
                  Không có hình ảnh đính kèm trong hồ sơ này
                </div>
              )}
            </div>

            {/* Thanh nút Phê duyệt / Từ chối */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stay-border-subtle">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stay-text-secondary hover:text-stay-text bg-stay-bg-app border border-stay-border cursor-pointer"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={handleOpenRejectModal}
                disabled={isActionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                  text-red-600 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
                {selectedVerification.status === 'REJECTED' ? 'Cập nhật lý do từ chối' : 'Từ chối hồ sơ'}
              </button>

              <Popconfirm
                title="Xác nhận phê duyệt hồ sơ?"
                description="Tài khoản này sẽ được gắn huy hiệu Chủ trọ xác minh và mở khóa quyền đăng tin phòng trọ."
                okText="Đồng ý duyệt"
                cancelText="Hủy"
                onConfirm={() => handleApprove(selectedVerification.id)}
              >
                <button
                  type="button"
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold
                    text-white bg-stay-primary hover:bg-stay-primary-hover transition-colors shadow-xs cursor-pointer"
                >
                  <Check size={14} />
                  {selectedVerification.status === 'VERIFIED' ? 'Đã duyệt (Duyệt lại)' : 'Phê duyệt xác minh'}
                </button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL NHẬP LÝ DO TỪ CHỐI */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            <span className="font-bold text-sm">Từ Chối Hồ Sơ Xác Minh Chủ Trọ</span>
          </div>
        }
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        onOk={handleConfirmReject}
        okText="Gửi lý do từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: isActionLoading }}
        destroyOnClose
      >
        <div className="space-y-3 pt-3">
          <p className="text-xs text-stay-text-secondary">
            Vui lòng nêu rõ lý do từ chối để chủ trọ biết rõ thiếu sót và nộp lại hồ sơ hợp lệ (ví dụ: ảnh mờ, thiếu con dấu công chứng, sai địa chỉ...):
          </p>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do cụ thể gửi tới chủ trọ..."
            className="text-xs"
          />
        </div>
      </Modal>
    </div>
  );
};
