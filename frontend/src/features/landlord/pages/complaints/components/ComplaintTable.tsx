import React from 'react';
import { Eye } from 'lucide-react';
import { Tooltip } from 'antd';
import { Table } from '@/shared/components';
import { Complaint, ComplaintStatus } from '@/shared/types/landlord';
import { PageResponse } from '@/shared/types/api';
import { getComplaintIncidentTypeLabel } from '@/shared/utils';

interface ComplaintTableProps {
  pageInfo?: PageResponse<Complaint>;
  isLoading: boolean;
  onPageChange?: (page: number, size: number) => void;
  onOpenDetail: (complaint: Complaint) => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  pageInfo,
  isLoading,
  onPageChange,
  onOpenDetail,
}) => {
  const renderStatus = (st: ComplaintStatus) => {
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
            Đã xử lý
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
      title: 'Phòng',
      key: 'roomName',
      width: 140,
      ellipsis: { showTitle: true },
      render: (_: any, r: Complaint) => (
        <div>
          <span className="font-medium text-[14px] text-stay-text block truncate">
            {r.roomName || '—'}
          </span>
          {r.buildingName && (
            <span className="text-[12px] text-stay-text-muted block truncate">{r.buildingName}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Người gửi',
      key: 'tenantName',
      width: 150,
      ellipsis: { showTitle: true },
      render: (_: any, r: Complaint) => (
        <span className="font-medium text-[14px] text-stay-text truncate block">{r.tenantName || '—'}</span>
      ),
    },
    {
      title: 'Loại sự cố',
      key: 'incidentType',
      width: 140,
      ellipsis: { showTitle: true },
      render: (_: any, r: Complaint) => {
        return <span className="text-[14px] text-stay-text-secondary">{getComplaintIncidentTypeLabel(r.incidentType)}</span>;
      },
    },
    {
      title: 'Nội dung',
      dataIndex: 'title',
      key: 'title',
      ellipsis: { showTitle: true },
      render: (val: string, r: Complaint) => (
        <div>
          <p className="font-medium text-stay-text text-[14px] truncate">{val}</p>
          <p className="text-[12px] text-stay-text-secondary truncate">{r.content || ''}</p>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      ellipsis: { showTitle: true },
      render: (val: string) => <span className="text-[14px] text-stay-text-secondary">{val || '—'}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      ellipsis: { showTitle: true },
      render: (val: ComplaintStatus) => renderStatus(val),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      fixed: 'right' as const,
      render: (_: any, r: Complaint) => (
        <div className="flex items-center justify-start">
          <Tooltip title="Xem & Xử lý khiếu nại">
            <button
              type="button"
              className="stay-action-btn stay-action-btn-view"
              onClick={() => onOpenDetail(r)}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Table
      dataSource={pageInfo?.items ?? []}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      pagination={{
        current: (pageInfo?.page ?? 0) + 1,
        pageSize: pageInfo?.size ?? 10,
        total: pageInfo?.totalElements ?? 0,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total) => `Tổng ${total} phản ánh`,
        onChange: (page, pageSize) => onPageChange?.(page - 1, pageSize),
      }}
      scroll={{ x: 'max-content' }}
      className="overflow-x-auto"
    />
  );
};

