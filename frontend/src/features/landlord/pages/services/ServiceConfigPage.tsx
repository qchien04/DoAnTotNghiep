import React, { useState } from 'react';
import { useServices } from '@/shared/hooks';
import { Plus } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stay-text tracking-tight">Dịch vụ tiện ích</h1>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Thêm dịch vụ
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
