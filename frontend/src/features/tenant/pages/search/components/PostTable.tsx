import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button } from '@/shared/components';
import { RoommatePost } from '@/shared/types/tenant';
import { PageResponse } from '@/shared/types/api';

interface PostTableProps {
  pageInfo?: PageResponse<RoommatePost>;
  posts?: RoommatePost[];
  isLoading?: boolean;
  onPageChange?: (page: number, size: number) => void;
}

export const PostTable: React.FC<PostTableProps> = ({
  pageInfo,
  posts,
  isLoading,
  onPageChange,
}) => {
  const navigate = useNavigate();

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
      dataIndex: 'title',
      key: 'title',
      render: (title: string, r: RoommatePost) => (
        <div className="space-y-0.5">
          <Link
            to={`/roommates/${r.id}`}
            className="font-medium text-stay-text hover:text-stay-primary transition-colors line-clamp-1"
          >
            {title}
          </Link>
          <div className=" text-stay-text-secondary line-clamp-1">{r.description}</div>
        </div>
      ),
    },
    {
      title: 'Khu vực / Địa chỉ',
      dataIndex: 'areaName',
      key: 'areaName',
      width: 220,
      render: (area: string, r: RoommatePost) => (
        <span className=" text-stay-text">{area || r.district || 'Hà Nội'}</span>
      ),
    },
    {
      title: 'Giá share (VNĐ/người)',
      dataIndex: 'sharePrice',
      key: 'sharePrice',
      width: 170,
      render: (price: number) => (
        <span className="font-semibold text-stay-primary">{price.toLocaleString()} đ</span>
      ),
    },
    {
      title: 'Số người đang tìm',
      key: 'members',
      width: 170,
      render: (_: any, r: RoommatePost) => (
        <span className=" text-stay-text">
          Cần tìm {r.neededRoommates} (Đã có {r.currentRoommates})
        </span>
      ),
    },
    {
      title: 'Độ khớp sinh hoạt',
      dataIndex: 'matchPercentage',
      key: 'matchPercentage',
      width: 160,
      render: (pct: number = 85) => {
        let label = 'Phù hợp';
        let colorClass = 'text-slate-600';
        if (pct >= 90) {
          label = 'Rất hợp';
          colorClass = 'text-emerald-700 font-semibold';
        } else if (pct >= 80) {
          label = 'Khá hợp';
          colorClass = 'text-blue-700 font-semibold';
        }
        return (
          <span className={` ${colorClass}`}>
            {pct}% ({label})
          </span>
        );
      },
    },
    {
      title: 'Loại phòng',
      dataIndex: 'postType',
      key: 'postType',
      width: 140,
      render: (type: string) => (
        <span className=" text-stay-text">
          {type === 'HAS_ROOM' ? 'Có sẵn phòng' : 'Chưa có phòng'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      render: (_: any, r: RoommatePost) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`/roommates/${r.id}`)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg border border-stay-border rounded-xl overflow-hidden shadow-2xs">
      <Table
        columns={columns}
        dataSource={pageInfo?.items ?? posts ?? []}
        rowKey="id"
        loading={isLoading}
        pagination={
          pageInfo
            ? {
              current: (pageInfo.page ?? 0) + 1,
              pageSize: pageInfo.size ?? 10,
              total: pageInfo.totalElements ?? 0,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Tổng ${total} bài đăng`,
              onChange: (p, s) => onPageChange?.(p - 1, s),
            }
            : { pageSize: 8 }
        }
        className="overflow-x-auto "
      />
    </div>
  );
};
