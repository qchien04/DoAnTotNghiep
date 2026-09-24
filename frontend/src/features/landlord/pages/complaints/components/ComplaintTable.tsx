import React from 'react';
import { Table, Button } from '@/shared/components';
import { Complaint, ComplaintStatus } from '@/shared/types/landlord';

interface ComplaintTableProps {
  complaints: Complaint[];
  isLoading: boolean;
  onOpenDetail: (complaint: Complaint) => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  isLoading,
  onOpenDetail,
}) => {
  const renderStatus = (st: ComplaintStatus) => {
    switch (st) {
      case 'NEW':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Chờ tiếp nhận
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Đang xử lý
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã xử lý
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-stay-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Từ chối
          </span>
        );
      default:
        return <span className="text-xs text-stay-text-muted">{st}</span>;
    }
  };

  const columns = [
    {
      title: 'Mã KN',
      key: 'code',
      width: 90,
      render: (_: any, r: Complaint) => (
        <span className="font-mono text-xs font-semibold text-stay-text">
          {r.code || r.complaintCode || `KN${r.id}`}
        </span>
      ),
    },
    {
      title: 'Phòng',
      key: 'roomName',
      render: (_: any, r: Complaint) => (
        <div>
          <span className="font-medium text-xs text-stay-text block">
            {r.roomName || (r.roomCode ? `P.${r.roomCode}` : '---')}
          </span>
          {r.buildingName && (
            <span className="text-[11px] text-stay-text-muted block">{r.buildingName}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Người gửi',
      key: 'senderName',
      render: (_: any, r: Complaint) => (
        <span className="font-medium text-sm text-stay-text">{r.senderName || r.tenantName || '---'}</span>
      ),
    },
    {
      title: 'Loại sự cố',
      key: 'type',
      render: (_: any, r: Complaint) => {
        const val = r.type || r.incidentType || '';
        const label =
          val === 'EQUIPMENT'
            ? 'Thiết bị điện nước'
            : val === 'SECURITY'
            ? 'An ninh trật tự'
            : val === 'NOISE'
            ? 'Tiếng ồn'
            : 'Khác';
        return <span className="text-xs text-stay-text-secondary">{label}</span>;
      },
    },
    {
      title: 'Nội dung',
      dataIndex: 'title',
      key: 'title',
      render: (val: string, r: Complaint) => (
        <div>
          <p className="font-medium text-stay-text text-sm">{val}</p>
          <p className="text-xs text-stay-text-secondary line-clamp-1">{r.content || ''}</p>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (val: string) => <span className="font-mono text-xs text-stay-text-secondary">{val}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (val: ComplaintStatus) => renderStatus(val),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'right' as const,
      render: (_: any, r: Complaint) => (
        <div className="flex items-center justify-end">
          <Button
            size="small"
            type="text"
            onClick={() => onOpenDetail(r)}
            className="text-xs text-stay-primary hover:text-stay-primary-hover font-medium px-2"
          >
            Xử lý
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-lg border border-stay-border overflow-hidden">
      <Table
        dataSource={complaints}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        className="overflow-x-auto"
      />
    </div>
  );
};
