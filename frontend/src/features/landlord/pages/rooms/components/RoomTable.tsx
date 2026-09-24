import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Table, Button, Popconfirm } from '@/shared/components';
import { Room, RoomStatus } from '@/shared/types/landlord';

interface RoomTableProps {
  rooms: Room[];
  isLoading: boolean;
  isDeleting: boolean;
  onEdit: (room: Room) => void;
  onDelete: (id: string | number) => void;
}

export const RoomTable: React.FC<RoomTableProps> = ({
  rooms,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
}) => {
  const renderStatusTag = (st: RoomStatus) => {
    switch (st) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Còn trống
          </span>
        );
      case 'OCCUPIED':
      case 'RENTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Đang thuê
          </span>
        );
      case 'UNDER_MAINTENANCE':
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Đang sửa chữa
          </span>
        );
      case 'STOPPED':
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-stay-text-muted font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Ngừng sử dụng
          </span>
        );
      default:
        return <span className="text-xs text-stay-text-muted">{st}</span>;
    }
  };

  const columns = [
    {
      title: 'Mã phòng',
      key: 'code',
      width: 100,
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        return (
          <span className="font-mono text-xs font-semibold text-stay-text">{item.code || item.roomCode || '---'}</span>
        );
      },
    },
    {
      title: 'Tên phòng',
      key: 'name',
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        return (
          <div>
            <p className="font-medium text-stay-text">{item.name || '---'}</p>
            {item.buildingName && <p className="text-xs text-stay-text-muted">{item.buildingName}</p>}
          </div>
        );
      },
    },
    {
      title: 'Tầng',
      key: 'floor',
      width: 80,
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        return `Tầng ${item.floor ?? 1}`;
      },
    },
    {
      title: 'Diện tích',
      key: 'area',
      width: 100,
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        return `${item.area ?? 0} m²`;
      },
    },
    {
      title: 'Giá thuê',
      key: 'price',
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        const p = Number(item.price ?? item.listedPrice ?? 0);
        return (
          <span className="font-medium text-stay-text">
            {p.toLocaleString()} đ/tháng
          </span>
        );
      },
    },
    {
      title: 'Sức chứa',
      key: 'capacity',
      width: 100,
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        const cap = item.capacity ?? item.maxCapacity ?? 1;
        return (
          <span className="text-xs text-stay-text-secondary">
            {cap} người
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (val: RoomStatus) => renderStatusTag(val),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      align: 'right' as const,
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="small"
              type="text"
              icon={<Edit2 className="w-3.5 h-3.5 text-stay-text-secondary hover:text-stay-text" />}
              onClick={() => onEdit(item)}
              title="Sửa phòng"
            />
            <Popconfirm
              title="Xác nhận xóa phòng?"
              description={`Bạn có chắc muốn xóa phòng ${item.code || item.roomCode || ''}?`}
              onConfirm={() => onDelete(item.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                type="text"
                danger
                icon={<Trash2 className="w-3.5 h-3.5" />}
                loading={isDeleting}
                title="Xóa phòng"
              />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-lg border border-stay-border overflow-hidden">
      <Table
        dataSource={rooms}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        className="overflow-x-auto"
      />
    </div>
  );
};
