import React from 'react';
import {
  Edit2,
  Trash2,
  Zap,
  Droplets,
  Wifi,
  Trash,
  Car,
  HelpCircle,
  ArrowUpDown,
} from 'lucide-react';
import { Table, Button, Tag, Popconfirm } from '@/shared/components';
import { UtilityService, ServiceCategory } from '@/shared/types/landlord';

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
  const renderCategoryIcon = (cat: ServiceCategory | string) => {
    switch (cat) {
      case 'ELECTRICITY':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'WATER':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'INTERNET':
        return <Wifi className="w-4 h-4 text-purple-500" />;
      case 'CLEANING':
        return <Trash className="w-4 h-4 text-emerald-500" />;
      case 'PARKING':
        return <Car className="w-4 h-4 text-indigo-500" />;
      case 'ELEVATOR':
        return <ArrowUpDown className="w-4 h-4 text-cyan-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-stay-text-muted" />;
    }
  };

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
      title: 'Mã DV',
      key: 'serviceCode',
      width: 100,
      render: (_: any, r: UtilityService) => {
        const code = r.serviceCode || r.code || `DV${String(r.id || '').padStart(2, '0')}`;
        return (
          <Tag className="bg-stay-primary-subtle text-stay-primary border-stay-primary/30 font-mono font-bold">
            {code}
          </Tag>
        );
      },
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      render: (val: string, r: UtilityService) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-stay-primary-subtle flex items-center justify-center shrink-0 border border-stay-border">
            {renderCategoryIcon(r.category)}
          </div>
          <div>
            <span className="font-semibold text-stay-text block">{val}</span>
            <span className="text-[11px] text-stay-text-secondary font-medium">
              {renderCategoryLabel(r.category as string)}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      key: 'unit',
      width: 130,
      render: (val: string) => <span className="font-medium text-stay-text">{val || '---'}</span>,
    },
    {
      title: 'Đơn giá (VNĐ)',
      key: 'unitPrice',
      width: 150,
      render: (_: any, r: UtilityService) => {
        const p = Number(
          r.unitPrice !== undefined ? r.unitPrice : r.price !== undefined ? r.price : 0
        );
        return <span className="font-bold text-stay-secondary">{p.toLocaleString()} đ</span>;
      },
    },
    {
      title: 'Hình thức thu',
      key: 'billingMethod',
      width: 160,
      render: (_: any, r: UtilityService) => {
        const method = r.billingMethod || r.chargingType;
        switch (method) {
          case 'METER_INDEX':
            return (
              <Tag color="cyan" className="font-medium">
                Theo công tơ
              </Tag>
            );
          case 'FIXED_PER_PERSON':
            return (
              <Tag color="purple" className="font-medium">
                Theo số người
              </Tag>
            );
          case 'FIXED_PER_ROOM':
            return (
              <Tag color="blue" className="font-medium">
                Cố định phòng
              </Tag>
            );
          default:
            return <Tag color="default">{method || 'Cố định'}</Tag>;
        }
      },
    },
    {
      title: 'Áp dụng',
      key: 'scope',
      width: 110,
      render: (_: any, r: UtilityService) => (
        <span className="text-xs text-stay-text-secondary">{r.scope || r.appliedScope || 'Tất cả'}</span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      width: 130,
      render: (_: any, r: UtilityService) => {
        const active = r.isActive !== undefined ? r.isActive : r.status === 'ACTIVE';
        return active ? (
          <Tag color="green" className="font-semibold">
            Đang áp dụng
          </Tag>
        ) : (
          <Tag color="default" className="font-semibold">
            Tạm ngừng
          </Tag>
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
