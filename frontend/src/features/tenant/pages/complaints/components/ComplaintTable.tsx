import React from 'react';
import { Table, Button } from '@/shared/components';
import { Complaint } from '@/shared/types/landlord';

interface ComplaintTableProps {
  complaints: Complaint[];
  onOpenDetail: (cmp: Complaint) => void;
  onOpenRate: (cmp: Complaint) => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  onOpenDetail,
  onOpenRate,
}) => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (_: any, r: Complaint) => <span className="font-semibold text-stay-text">#{r.id}</span>,
    },
    {
      title: 'Loại sự cố',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (t: string) => {
        let label = 'Khác';
        if (t === 'COOLING') label = 'Điện lạnh / Điều hòa';
        else if (t === 'PLUMBING' || t === 'ELECTRICITY') label = 'Điện nước sinh hoạt';
        else if (t === 'SECURITY') label = 'An ninh trật tự';
        else if (t === 'BILL') label = 'Sai lệch hóa đơn';
        return <span className="text-xs text-stay-text">{label}</span>;
      },
    },
    {
      title: 'Tiêu đề sự cố',
      dataIndex: 'title',
      key: 'title',
      render: (val: string, r: Complaint) => (
        <div className="space-y-0.5">
          <p className="font-medium text-stay-text line-clamp-1">{val}</p>
          <p className="text-xs text-stay-text-secondary line-clamp-1">{r.content}</p>
        </div>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 110,
      render: (urg: string) => {
        if (urg === 'HIGH' || urg === 'URGENT') {
          return <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">Khẩn cấp</span>;
        }
        return <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Bình thường</span>;
      },
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d: string) => (
        <span className="text-xs text-stay-text-secondary">
          {d ? new Date(d).toLocaleDateString('vi-VN') : '02/10/2026'}
        </span>
      ),
    },
    {
      title: 'Trạng thái xử lý',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (st: string) => {
        if (st === 'RESOLVED') {
          return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Đã giải quyết</span>;
        }
        if (st === 'PROCESSING') {
          return <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Đang xử lý</span>;
        }
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Mới gửi</span>;
      },
    },
    {
      title: 'Phản hồi từ chủ nhà',
      dataIndex: 'responseNote',
      key: 'responseNote',
      render: (val: string) => (
        <span className="text-xs text-stay-text-secondary italic">
          {val || 'Đang hẹn thợ qua kiểm tra'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: any, r: Complaint) => (
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onOpenDetail(r)}>
            Chi tiết
          </Button>
          {r.status === 'RESOLVED' && (
            <Button variant="primary" size="sm" onClick={() => onOpenRate(r)}>
              Đánh giá
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg border border-stay-border rounded-xl overflow-hidden shadow-2xs">
      <Table
        dataSource={complaints}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        className="text-xs"
      />
    </div>
  );
};
