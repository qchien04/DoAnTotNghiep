import React from 'react';
import { Table, Button, Tag } from '@/shared/components';
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
        return <Tag color="blue">Mới gửi</Tag>;
      case 'PROCESSING':
        return <Tag color="orange">Đang xử lý</Tag>;
      case 'RESOLVED':
        return <Tag color="green">Đã giải quyết</Tag>;
      case 'REJECTED':
        return <Tag color="default">Từ chối</Tag>;
      default:
        return <Tag>{st}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã KN',
      dataIndex: 'code',
      key: 'code',
      width: 90,
      render: (val: string) => <Tag color="blue" className="font-bold">{val}</Tag>,
    },
    {
      title: 'Phòng',
      dataIndex: 'roomName',
      key: 'roomName',
      render: (val: string, r: Complaint) => (
        <div>
          <span className="font-semibold text-stay-primary">{val}</span>
          <span className="text-xs text-stay-text-secondary block">{r.buildingName}</span>
        </div>
      ),
    },
    {
      title: 'Người gửi',
      dataIndex: 'senderName',
      key: 'senderName',
      render: (val: string) => <span className="font-medium text-stay-text">{val}</span>,
    },
    {
      title: 'Loại sự cố',
      dataIndex: 'type',
      key: 'type',
      render: (val: string) => (
        <Tag color="cyan" className="font-medium">
          {val === 'EQUIPMENT'
            ? 'Thiết bị điện nước'
            : val === 'SECURITY'
            ? 'An ninh trật tự'
            : val === 'NOISE'
            ? 'Tiếng ồn'
            : 'Khác'}
        </Tag>
      ),
    },
    {
      title: 'Nội dung phản ánh',
      dataIndex: 'title',
      key: 'title',
      render: (val: string, r: Complaint) => (
        <div>
          <p className="font-semibold text-stay-text text-sm">{val}</p>
          <p className="text-xs text-stay-text-secondary line-clamp-1">{r.content || ''}</p>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (val: string) => <span className="text-xs text-stay-text-secondary">{val}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (val: ComplaintStatus) => renderStatus(val),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: any, r: Complaint) => (
        <Button
          size="small"
          type="primary"
          onClick={() => onOpenDetail(r)}
          className="bg-stay-primary hover:bg-stay-primary-hover text-xs font-semibold rounded-lg"
        >
          Xử lý
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs overflow-hidden">
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
