import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Table, Button, Popconfirm } from '@/shared/components';
import { UtilityService } from '@/shared/types/landlord';

interface ServiceTableProps {
  services: UtilityService[];
  isLoading: boolean;
  isDeleting: boolean;
  onEdit: (service: UtilityService) => void;
  onDelete: (id: string | number) => void;
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
}) => {

  const renderCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'ELECTRICITY':
        return 'Điện sinh hoạt';
      case 'WATER':
        return 'Nước sinh hoạt';
      case 'INTERNET':
        return 'Wifi / Internet';
      case 'CLEANING':
        return 'Vệ sinh & Rác';
      case 'PARKING':
        return 'Trông giữ xe';
      case 'ELEVATOR':
        return 'Thang máy';
      default:
        return 'Tiện ích khác';
    }
  };

  const columns = [
    {
      title: 'Mã',
      key: 'serviceCode',
      width: 90,
      render: (_: any, r: UtilityService) => {
        const code = r.serviceCode || r.code || `DV${String(r.id || '').padStart(2, '0')}`;
        return <span className="font-mono text-xs text-stay-text-secondary">{code}</span>;
      },
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      render: (val: string, r: UtilityService) => (
        <div>
          <span className="font-medium text-stay-text text-sm block">{val}</span>
          <span className="text-xs text-stay-text-muted">
            {renderCategoryLabel(r.category as string)}
          </span>
        </div>
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      render: (val: string) => <span className="text-sm text-stay-text">{val || '---'}</span>,
    },
    {
      title: 'Đơn giá',
      key: 'unitPrice',
      width: 140,
      render: (_: any, r: UtilityService) => {
        const p = Number(
          r.unitPrice !== undefined ? r.unitPrice : r.price !== undefined ? r.price : 0
        );
        return <span className="font-medium text-sm text-stay-text">{p.toLocaleString()} đ</span>;
      },
    },
    {
      title: 'Hình thức tính',
      key: 'billingMethod',
      width: 150,
      render: (_: any, r: UtilityService) => {
        const method = r.billingMethod || r.chargingType;
        let label = 'Cố định';
        if (method === 'METER_INDEX') label = 'Theo công tơ';
        else if (method === 'FIXED_PER_PERSON') label = 'Theo người';
        else if (method === 'FIXED_PER_ROOM') label = 'Theo phòng';
        return <span className="text-xs text-stay-text-secondary">{label}</span>;
      },
    },
    {
      title: 'Phạm vi',
      key: 'scope',
      width: 110,
      render: (_: any, r: UtilityService) => (
        <span className="text-xs text-stay-text-muted">{r.scope || r.appliedScope || 'Tất cả'}</span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      width: 130,
      render: (_: any, r: UtilityService) => {
        const active = r.isActive !== undefined ? r.isActive : r.status === 'ACTIVE';
        return active ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đang áp dụng
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-stay-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Tạm ngừng
          </span>
        );
      },
    },
    {
      title: 'Tùy chọn',
      key: 'actions',
      width: 90,
      render: (_: any, r: UtilityService) => (
        <div className="flex items-center gap-1">
          <Button
            size="small"
            type="text"
            icon={<Edit2 className="w-3.5 h-3.5 text-stay-text" />}
            onClick={() => onEdit(r)}
            title="Chỉnh sửa đơn giá"
          />
          <Popconfirm
            title="Xóa dịch vụ tiện ích này?"
            description="Lưu ý: Các phòng đang sử dụng dịch vụ này có thể bị ảnh hưởng khi tính tiền."
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
              title="Xóa dịch vụ"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs overflow-hidden">
      <Table
        dataSource={services}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        className="overflow-x-auto"
      />
    </div>
  );
};
