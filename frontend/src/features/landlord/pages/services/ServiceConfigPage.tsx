import React, { useState } from 'react';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '@/shared/hooks';
import { Plus, Search, RotateCcw } from 'lucide-react';
import { Button, Input, Select, message } from '@/shared/components';
import { UtilityService, CreateServiceDto } from '@/shared/types/landlord';
import { ServiceTable } from './components/ServiceTable';
import { ServiceFormModal } from './components/ServiceFormModal';
import { ServiceDetailModal } from './components/ServiceDetailModal';

export const ServiceConfigPage: React.FC = () => {
  const { services, isLoading } = useServices();
  const { createService, isCreating } = useCreateService();
  const { updateService, isUpdating } = useUpdateService();
  const { deleteService, isDeleting } = useDeleteService();

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingService, setViewingService] = useState<UtilityService | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<UtilityService | null>(null);

  const handleOpenDetail = (srv: UtilityService) => {
    setViewingService(srv);
    setDetailModalOpen(true);
  };

  const handleOpenCreate = () => {

    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: UtilityService) => {
    setEditingService(srv);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: CreateServiceDto) => {
    if (editingService) {
      await updateService({ id: editingService.id, dto: payload });
      message.success(`Cập nhật dịch vụ ${payload.name} thành công!`);
    } else {
      await createService(payload);
      message.success(`Thêm mới dịch vụ ${payload.name} thành công!`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteService(id);
      message.success('Đã xóa dịch vụ thành công!');
    } catch (err: any) {
      message.error(err.message || 'Không thể xóa dịch vụ');
    }
  };

  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredServices = (services || []).filter((srv: UtilityService) => {
    const matchName = !keyword.trim() || srv.name.toLowerCase().includes(keyword.trim().toLowerCase());
    const matchCat = categoryFilter === 'ALL' || srv.category === categoryFilter;
    return matchName && matchCat;
  });

  const handleReset = () => {
    setKeyword('');
    setCategoryFilter('ALL');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Filter toolbar */}

      <div className="bg-stay-card-bg p-4 rounded-xl border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm tên dịch vụ tiện ích..."
          prefix={<Search className="w-4 h-4 text-[#8C8C8C]" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          className="w-full sm:w-[320px] h-[40px] rounded-[8px]"
        />

        <Select
          value={categoryFilter}
          onChange={(val) => setCategoryFilter(val)}
          className="w-full sm:w-[220px] h-[40px] rounded-[8px]"
          options={[
            { label: 'Tất cả loại dịch vụ', value: 'ALL' },
            { label: 'Điện sinh hoạt', value: 'ELECTRICITY' },
            { label: 'Nước sinh hoạt', value: 'WATER' },
            { label: 'Wifi / Internet', value: 'INTERNET' },
            { label: 'Vệ sinh & Rác', value: 'CLEANING' },
            { label: 'Trông giữ xe', value: 'PARKING' },
            { label: 'Thang máy', value: 'ELEVATOR' },
            { label: 'Tiện ích khác', value: 'OTHER' },
          ]}
        />

        <Button
          icon={<RotateCcw className="w-4 h-4 text-stay-text-secondary" />}
          onClick={handleReset}
          className="h-[40px] rounded-[8px] border-[#D7D7DB] dark:border-stay-border text-stay-text hover:text-stay-primary font-medium"
        >
          Đặt lại
        </Button>

        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="ml-auto bg-stay-primary hover:bg-stay-primary-hover h-[40px] px-4 font-medium"
        >
          Thêm dịch vụ
        </Button>
      </div>

      <ServiceTable
        services={filteredServices}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onView={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <ServiceDetailModal
        open={detailModalOpen}
        service={viewingService}
        onCancel={() => setDetailModalOpen(false)}
      />

      <ServiceFormModal
        open={isModalOpen}
        editingService={editingService}
        servicesCount={services?.length || 0}
        confirmLoading={isCreating || isUpdating}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );

};
