import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Table, Popconfirm } from '@/shared/components';
import { Tooltip } from 'antd';
import { Building } from '@/shared/types/landlord';
import { PageResponse } from '@/shared/types/api';

interface BuildingTableProps {
  pageInfo?: PageResponse<Building>;
  isLoading: boolean;
  isDeleting: boolean;
  onPageChange?: (page: number, size: number) => void;
  onView: (bld: Building) => void;
  onEdit: (bld: Building) => void;
  onDelete: (id: string | number) => void;
}

export const BuildingTable: React.FC<BuildingTableProps> = ({
  pageInfo,
  isLoading,
  isDeleting,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
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
      title: 'Tên tòa nhà',
      dataIndex: 'name',
      key: 'name',
      minWidth: 220,
      ellipsis: { showTitle: true },
      render: (val: string, r: Building) => (
        <div>
          <span
            onClick={() => onView(r)}
            className="font-medium text-stay-text text-[14px] block cursor-pointer hover:text-stay-primary hover:underline"
          >
            {val}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[12px] text-stay-text-muted">{r.addressDetail || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Số tầng',
      dataIndex: 'numFloors',
      key: 'numFloors',
      width: 100,
      ellipsis: { showTitle: true },
      render: (val: number) => <span className="text-[14px] text-stay-text">{val ?? 1}</span>,
    },
    {
      title: 'Tổng phòng',
      dataIndex: 'totalRooms',
      key: 'totalRooms',
      width: 110,
      ellipsis: { showTitle: true },
      render: (val: number) => <span className="text-[14px] text-stay-text">{val ?? 0}</span>,
    },
    {
      title: 'Đang ở',
      dataIndex: 'occupiedRooms',
      key: 'occupiedRooms',
      width: 100,
      ellipsis: { showTitle: true },
      render: (val: number) => <span className="text-[14px] text-stay-text font-medium">{val ?? 0}</span>,
    },
    {
      title: 'Phòng trống',
      dataIndex: 'availableRooms',
      key: 'availableRooms',
      width: 120,
      ellipsis: { showTitle: true },
      render: (val: number) => (
        <span className="text-[14px] text-stay-text font-medium">
          {val ?? 0}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, r: Building) => (
        <div className="flex items-center justify-start gap-1.5">
          <Tooltip title="Xem chi tiết">
            <button
              type="button"
              className="stay-action-btn stay-action-btn-view"
              onClick={() => onView(r)}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <button
              type="button"
              className="stay-action-btn stay-action-btn-edit"
              onClick={() => onEdit(r)}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip title="Xóa">
            <Popconfirm
              title="Xác nhận xóa tòa nhà?"
              description={`Bạn có chắc muốn xóa tòa nhà "${r.name}"?`}
              onConfirm={() => onDelete(r.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <button
                type="button"
                className="stay-action-btn stay-action-btn-delete"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Popconfirm>
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
        showTotal: (total) => `Tổng ${total} tòa nhà`,
        onChange: (page, pageSize) => onPageChange?.(page - 1, pageSize),
      }}
      scroll={{ x: 'max-content' }}
      className="overflow-x-auto"
    />
  );
};
