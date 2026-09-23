import React from 'react';
import { Edit2, Trash2, Users } from 'lucide-react';
import { Table, Button, Tag, Popconfirm } from '@/shared/components';
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
        return <Tag color="green" className="font-semibold">Còn trống</Tag>;
      case 'RENTED':
        return <Tag color="blue" className="font-semibold">Đang thuê</Tag>;
      case 'MAINTENANCE':
        return <Tag color="orange" className="font-semibold">Đang sửa chữa</Tag>;
      case 'DISABLED':
        return <Tag color="default" className="font-semibold">Ngừng sử dụng</Tag>;
      default:
        return <Tag>{st}</Tag>;
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
          <span className="font-bold text-stay-primary">{item.code || item.roomCode || '---'}</span>
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
            <p className="font-semibold text-stay-text">{item.name || '---'}</p>
            <p className="text-xs text-stay-text-secondary">{item.buildingName || 'Tòa Ánh Dương'}</p>
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
      title: 'Giá thuê (VNĐ)',
      key: 'price',
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        const p = Number(item.price ?? item.listedPrice ?? 0);
        return (
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
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
          <span className="text-xs flex items-center gap-1 text-stay-text-secondary">
            <Users className="w-3.5 h-3.5 text-stay-text-muted" /> {cap} người
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
      title: 'Tùy chọn',
      key: 'action',
      width: 120,
      render: (_: any, r: Room) => {
        const item = r || (_ as Room) || {};
        return (
          <div className="flex items-center gap-1">
            <Button
              size="small"
              type="text"
              icon={<Edit2 className="w-3.5 h-3.5 text-stay-primary" />}
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
    <div className="bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs overflow-hidden">
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
