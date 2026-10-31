import React from 'react';
import { Eye, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Table, Popconfirm, Tag, StatusBadge } from '@/shared/components';
import { Tooltip } from 'antd';
import { Room, RoomStatus } from '@/shared/types/landlord';
import { PageResponse } from '@/shared/types/api';
import { decodeAmenitiesMask } from '@/shared/constants/roomAmenities';

interface RoomTableProps {
  pageInfo?: PageResponse<Room>;
  isLoading: boolean;
  isDeleting: boolean;
  onPageChange?: (page: number, size: number) => void;
  onView: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (id: string | number) => void;
}

export const RoomTable: React.FC<RoomTableProps> = ({
  pageInfo,
  isLoading,
  isDeleting,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const renderStatusTag = (st: RoomStatus) => <StatusBadge status={st} />;

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
      title: 'Tên phòng',
      key: 'name',
      minWidth: 220,
      ellipsis: { showTitle: true },
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        const coverImg = item.coverImageUrl || (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null);
        return (
          <div className="flex items-center gap-3">
            {coverImg ? (
              <img
                src={coverImg}
                alt={item.name}
                className="w-11 h-11 rounded-[6px] object-cover border border-stay-border shrink-0 cursor-pointer"
                onClick={() => onView(item)}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                onClick={() => onView(item)}
                className="w-11 h-11 rounded-[6px] bg-stay-bg-app border border-stay-border flex items-center justify-center shrink-0 text-stay-text-muted cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <p
                onClick={() => onView(item)}
                className="font-medium text-[14px] text-stay-text truncate cursor-pointer hover:text-stay-primary hover:underline"
              >
                {item.name || '—'}
              </p>
              {item.buildingName ? (
                <p className="text-[12px] text-stay-text-muted truncate">{item.buildingName}</p>
              ) : (
                <p className="text-[12px] text-stay-text-muted truncate">
                  {item.addressDetail || (item.ward ? `${item.ward}, ${item.province || ''}` : 'Chưa có địa chỉ')}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Tầng',
      key: 'floor',
      width: 80,
      ellipsis: { showTitle: true },
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        return <span className="text-[14px] text-stay-text">Tầng {item.floor ?? 1}</span>;
      },
    },
    {
      title: 'Diện tích',
      key: 'area',
      width: 100,
      ellipsis: { showTitle: true },
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        return <span className="text-[14px] text-stay-text">{item.area ?? 0} m²</span>;
      },
    },
    {
      title: 'Giá thuê',
      key: 'listedPrice',
      width: 150,
      ellipsis: { showTitle: true },
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        const p = Number(item.listedPrice ?? 0);
        return (
          <span className="font-semibold text-[14px] text-stay-text">
            {p.toLocaleString()} đ/tháng
          </span>
        );
      },
    },
    {
      title: 'Sức chứa',
      key: 'maxCapacity',
      width: 100,
      ellipsis: { showTitle: true },
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        const cap = item.maxCapacity ?? 1;
        return (
          <span className="text-[14px] text-stay-text">
            {cap} người
          </span>
        );
      },
    },
    {
      title: 'Tiện nghi',
      key: 'amenities',
      width: 130,
      ellipsis: { showTitle: true },
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        const count = item.amenitiesMask
          ? decodeAmenitiesMask(item.amenitiesMask).length
          : Array.isArray(item.amenities)
          ? item.amenities.length
          : 0;
        return (
          <span className="text-[13px] text-stay-text font-medium">
            {count > 0 ? `${count} tiện ích` : 'Cơ bản'}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      ellipsis: { showTitle: true },
      render: (val: RoomStatus) => renderStatusTag(val),
    },
    {
      title: 'Hiển thị',
      key: 'isPublic',
      width: 130,
      ellipsis: { showTitle: true },
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        const isPub = item.isPublic !== false;
        return isPub ? (
          <Tag color="success">
            <span>Công khai</span>
          </Tag>
        ) : (
          <Tag color="default">
            <span>Nội bộ</span>
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        return (
          <div className="flex items-center justify-start gap-1.5">
            <Tooltip title="Xem chi tiết">
              <button
                type="button"
                className="stay-action-btn"
                onClick={() => onView(item)}
              >
                <Eye className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title="Chỉnh sửa">
              <button
                type="button"
                className="stay-action-btn"
                onClick={() => onEdit(item)}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip title="Xóa">
              <Popconfirm
                title="Xác nhận xóa phòng?"
                description={`Bạn có chắc muốn xóa phòng "${item.name}"?`}
                onConfirm={() => onDelete(item.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <button
                  type="button"
                  className="stay-action-btn"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Popconfirm>
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
      pagination={{
        current: (pageInfo?.page ?? 0) + 1,
        pageSize: pageInfo?.size ?? 10,
        total: pageInfo?.totalElements ?? 0,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total) => `Tổng ${total} phòng`,
        onChange: (page, pageSize) => onPageChange?.(page - 1, pageSize),
      }}
      scroll={{ x: 'max-content' }}
      className="overflow-x-auto"
    />
  );
};
