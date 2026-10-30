import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Tooltip } from 'antd';
import { Table, Popconfirm, StatusBadge } from '@/shared/components';
import { UtilityService } from '@/shared/types/landlord';
import { getBillingMethodShortLabel } from '@/shared/utils';

interface ServiceTableProps {
  services: UtilityService[];
  isLoading: boolean;
  isDeleting: boolean;
  onView: (service: UtilityService) => void;
  onEdit: (service: UtilityService) => void;
  onDelete: (id: string | number) => void;
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  isLoading,
  isDeleting,
  onView,
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
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      width: 170,
      ellipsis: { showTitle: true },
      render: (val: string, r: UtilityService) => (
        <div>
          <span className="font-medium text-stay-text text-[14px] block truncate">{val}</span>
          <span className="text-[12px] text-stay-text-muted block truncate">
            {renderCategoryLabel(r.category as string)}
          </span>
        </div>
      ),
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      ellipsis: { showTitle: true },
      render: (val: string) => <span className="text-[14px] text-stay-text">{val || '—'}</span>,
    },
    {
      title: 'Đơn giá',
      key: 'unitPrice',
      width: 140,
      render: (_: any, r: UtilityService) => {
        const p = Number(r.unitPrice ?? 0);
        return <span className="font-semibold text-[14px] text-stay-text">{p.toLocaleString()} đ</span>;
      },
    },
    {
      title: 'Hình thức tính',
      key: 'billingMethod',
      width: 160,
      ellipsis: { showTitle: true },
      render: (_: any, r: UtilityService) => {
        return <span className="text-[14px] text-stay-text-secondary">{getBillingMethodShortLabel(r.billingMethod)}</span>;
      },
    },
    {
      title: 'Phạm vi',
      key: 'scope',
      width: 110,
      ellipsis: { showTitle: true },
      render: (_: any, r: UtilityService) => (
        <span className="text-stay-text-muted">{r.scope || 'Tất cả'}</span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      width: 140,
      ellipsis: { showTitle: true },
      render: (_: any, r: UtilityService) => (
        <StatusBadge
          status={r.isActive !== false ? 'ACTIVE' : 'STOPPED'}
          label={r.isActive !== false ? 'Đang áp dụng' : 'Tạm ngừng'}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, r: UtilityService) => (
        <div className="flex items-center justify-start gap-1.5">
          <Tooltip title="Xem chi tiết">
            <button
              type="button"
              className="stay-action-btn"
              onClick={() => onView(r)}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip title="Chỉnh sửa đơn giá">
            <button
              type="button"
              className="stay-action-btn"
              onClick={() => onEdit(r)}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip title="Xóa dịch vụ">
            <Popconfirm
              title="Xóa dịch vụ tiện ích này?"
              description="Lưu ý: Các phòng đang sử dụng dịch vụ này có thể bị ảnh hưởng khi tính tiền."
              onConfirm={() => onDelete(r.id)}
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
      ),
    },
  ];

  return (
    <Table
      dataSource={services}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      scroll={{ x: 'max-content' }}
      className="overflow-x-auto"
    />
  );
};


