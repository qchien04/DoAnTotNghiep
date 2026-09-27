import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Table, Button, Popconfirm } from '@/shared/components';
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (_: any, r: Building) => <span className="font-mono text-xs text-stay-text-secondary">#{r.id}</span>,
    },
    {
      title: 'Tên tòa nhà',
      dataIndex: 'name',
      key: 'name',
      render: (val: string, r: Building) => (
        <div>
          <span className="font-medium text-stay-text text-sm block">{val}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-stay-text-muted">{r.addressDetail || '---'}</span>
            {r.latitude && r.longitude && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-1 rounded">
                📍 {Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Số tầng',
      dataIndex: 'numFloors',
      key: 'numFloors',
      width: 90,
      render: (val: number) => <span className="text-sm text-stay-text">{val ?? 1}</span>,
    },
    {
      title: 'Tổng phòng',
      dataIndex: 'totalRooms',
      key: 'totalRooms',
      width: 100,
      render: (val: number) => <span className="text-sm text-stay-text">{val ?? 0}</span>,
    },
    {
      title: 'Đang ở',
      dataIndex: 'occupiedRooms',
      key: 'occupiedRooms',
      width: 90,
      render: (val: number) => <span className="text-sm text-stay-text font-medium">{val ?? 0}</span>,
    },
    {
      title: 'Phòng trống',
      dataIndex: 'availableRooms',
      key: 'availableRooms',
      width: 100,
      render: (val: number) => (
        <span className={val > 0 ? "text-sm text-emerald-600 dark:text-emerald-400 font-medium" : "text-sm text-stay-text-muted"}>
          {val ?? 0}
        </span>
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
            description={`Bạn có chắc muốn xóa tòa nhà "${r.name}"?`}
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
