import React from 'react';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import { Table, Button, Tag, Popconfirm } from '@/shared/components';
import { Building } from '@/shared/types/landlord';

interface BuildingTableProps {
  buildings: Building[];
  isLoading: boolean;
  isDeleting: boolean;
  onEdit: (bld: Building) => void;
  onDelete: (id: string | number) => void;
}

export const BuildingTable: React.FC<BuildingTableProps> = ({
  buildings,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      title: 'Mã tòa',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (val: string) => <Tag color="blue" className="font-bold">{val}</Tag>,
    },
    {
      title: 'Tên tòa nhà & Địa chỉ',
      dataIndex: 'name',
      key: 'name',
      render: (val: string, r: Building) => (
        <div>
          <p className="font-bold text-stay-text text-sm">{val}</p>
          <p className="text-xs text-stay-text-secondary flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-stay-text-muted shrink-0" /> {r.address}
          </p>
        </div>
      ),
    },
    {
      title: 'Số tầng',
      dataIndex: 'totalFloors',
      key: 'totalFloors',
      width: 100,
      render: (val: number) => <span className="font-semibold text-stay-text">{val} tầng</span>,
    },
    {
      title: 'Tổng phòng',
      dataIndex: 'totalRooms',
      key: 'totalRooms',
      width: 110,
      render: (val: number) => <span className="font-semibold text-stay-text">{val} phòng</span>,
    },
    {
      title: 'Đang ở',
      dataIndex: 'occupiedRooms',
      key: 'occupiedRooms',
      width: 100,
      render: (val: number) => <Tag color="green">{val} phòng</Tag>,
    },
    {
      title: 'Phòng trống',
      dataIndex: 'availableRooms',
      key: 'availableRooms',
      width: 110,
      render: (val: number) => (
        <Tag color={val > 0 ? 'orange' : 'default'} className="font-semibold">
          {val} phòng
        </Tag>
      ),
    },
    {
      title: 'Tùy chọn',
      key: 'action',
      width: 120,
      render: (_: any, r: Building) => (
        <div className="flex items-center gap-1">
          <Button
            size="small"
            type="text"
            icon={<Edit2 className="w-3.5 h-3.5 text-stay-primary" />}
            onClick={() => onEdit(r)}
            title="Chỉnh sửa tòa nhà"
          />
          <Popconfirm
            title="Xác nhận xóa tòa nhà?"
            description={`Bạn có chắc muốn xóa tòa nhà ${r.code} - ${r.name}?`}
            onConfirm={() => onDelete(r.id)}
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
              title="Xóa tòa nhà"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs overflow-hidden">
      <Table
        dataSource={buildings}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        className="overflow-x-auto"
      />
    </div>
  );
};
