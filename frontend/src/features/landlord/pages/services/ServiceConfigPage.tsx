import React, { useState } from 'react';
import { useServices } from '@/shared/hooks';
import { Receipt, Plus } from 'lucide-react';
import { Button, message } from '@/shared/components';
import { UtilityService, CreateServiceDto } from '@/shared/types/landlord';
import { ServiceTable } from './components/ServiceTable';
import { ServiceFormModal } from './components/ServiceFormModal';

export const ServiceConfigPage: React.FC = () => {
  const {
    services,
    isLoading,
    createService,
    isCreating,
    updateService,
    isUpdating,
    deleteService,
    isDeleting,
  } = useServices();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<UtilityService | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stay-card-bg p-6 rounded-2xl border border-stay-border">
        <div>
          <h1 className="text-2xl font-bold text-stay-text tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-stay-primary" />
            Cấu Hình Dịch Vụ & Đơn Giá Tiện Ích
          </h1>
          <p className="text-sm text-stay-text-secondary">
            Bảng danh mục các dịch vụ tiện ích, hình thức tính tiền và đơn giá minh bạch áp dụng cho các tòa nhà
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="bg-stay-primary hover:bg-stay-primary-hover font-semibold shadow-md"
        >
          Thêm Dịch Vụ Mới
        </Button>
      </div>

      <ServiceTable
        services={services}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
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
