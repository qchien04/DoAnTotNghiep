import React from 'react';
import { Eye, Star, Phone } from 'lucide-react';
import { Tooltip, message } from 'antd';
import { Table } from '@/shared/components';
import { Complaint } from '@/shared/types/landlord';
import { PageResponse } from '@/shared/types/api';
import {
  getComplaintIncidentTypeLabel,
  getComplaintSeverityLabel,
} from '@/shared/utils';

interface ComplaintTableProps {
  pageInfo?: PageResponse<Complaint>;
  isLoading?: boolean;
  onPageChange?: (page: number, size: number) => void;
  onOpenDetail: (cmp: Complaint) => void;
  onOpenRate: (cmp: Complaint) => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  pageInfo,
  isLoading,
  onPageChange,
  onOpenDetail,
  onOpenRate,
}) => {
  const renderStatus = (st: string) => {
    switch (st) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
            Chờ tiếp nhận
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
            Đang xử lý
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            Đã khắc phục
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-stay-text-muted">
            Từ chối
          </span>
        );
      default:
        return <span className="text-stay-text-muted">{st}</span>;
    }
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
      title: 'Loại sự cố',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (t: string) => (
        <span className="text-[14px] text-stay-text-secondary">
          {getComplaintIncidentTypeLabel(t)}
        </span>
      ),
    },
    {
      title: 'Tiêu đề sự cố',
      dataIndex: 'title',
      key: 'title',
      render: (val: string, r: Complaint) => (
        <div className="space-y-0.5">
          <span
            onClick={() => onOpenDetail(r)}
            className="font-medium text-stay-text text-[14px] line-clamp-1 cursor-pointer hover:text-stay-primary hover:underline"
          >
            {val}
          </span>
          <p className="text-[12px] text-stay-text-muted line-clamp-1">{r.content}</p>
        </div>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 120,
      render: (urg: string) => {
        const isUrgent = urg === 'HIGH' || urg === 'URGENT';
        return (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              isUrgent
                ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20'
                : 'text-stay-text-secondary bg-stay-bg-app border border-stay-border'
            }`}
          >
            {getComplaintSeverityLabel(urg)}
          </span>
        );
      },
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (d: string) => (
        <span className="text-[14px] text-stay-text-secondary">
          {d ? new Date(d).toLocaleDateString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (st: string) => renderStatus(st),
    },
    {
      title: 'Phản hồi chủ nhà',
      dataIndex: 'responseNote',
      key: 'responseNote',
      width: 200,
      ellipsis: { showTitle: true },
      render: (val: string) => (
        <span className="text-[13px] text-stay-text-secondary italic">
          {val || '—'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      fixed: 'right' as const,
      render: (_: any, r: Complaint) => {
        const canRate = r.status === 'RESOLVED';
        return (
          <div className="flex items-center justify-start gap-1.5">
            <Tooltip title="Xem chi tiết sự cố">
              <button
                type="button"
                className="stay-action-btn stay-action-btn-view"
                onClick={() => onOpenDetail(r)}
              >
                <Eye className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title={canRate ? 'Đánh giá chất lượng sửa chữa' : 'Chỉ đánh giá khi đã khắc phục'}>
              <button
                type="button"
                className={`stay-action-btn ${canRate ? 'stay-action-btn-edit' : 'opacity-40 cursor-not-allowed text-slate-400'}`}
                onClick={() => canRate && onOpenRate(r)}
                disabled={!canRate}
              >
                <Star className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title="Liên hệ chủ trọ hỗ trợ">
              <button
                type="button"
                className="stay-action-btn stay-action-btn-delete"
                onClick={() => message.info('Vui lòng liên hệ số điện thoại chủ trọ hoặc xem chi tiết hợp đồng để gọi trực tiếp.')}
              >
                <Phone className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={pageInfo?.items ?? []}
      columns={columns}
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
        showTotal: (total) => `Tổng ${total} phản ánh`,
        onChange: (page, pageSize) => onPageChange?.(page - 1, pageSize),
      }}
    />
  );
};
