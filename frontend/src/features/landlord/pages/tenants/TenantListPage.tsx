import React, { useState } from 'react';
import { useTenants, useBuildings, useRooms } from '@/shared/hooks';
import { Plus } from 'lucide-react';
import { Button, message } from '@/shared/components';
import { Tenant, CreateTenantDto } from '@/shared/types/landlord';
import { TenantFilter } from './components/TenantFilter';
import { TenantTable } from './components/TenantTable';
import { TenantFormModal } from './components/TenantFormModal';
import { TenantInviteModal } from './components/TenantInviteModal';

export const TenantListPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [buildingId, setBuildingId] = useState<string | undefined>(undefined);

  const { buildings } = useBuildings();
  const { rooms } = useRooms({ buildingId });
  const {
    tenants,
    isLoading,
    createTenant,
    isCreating,
    updateTenant,
    isUpdating,
    deleteTenant,
    isDeleting,
    inviteTenantLink,
    isInviting,
  } = useTenants({ keyword, buildingId });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [searchAccountKeyword, setSearchAccountKeyword] = useState('');

  const handleOpenCreate = () => {
    setEditingTenant(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tnt: Tenant) => {
    setEditingTenant(tnt);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: CreateTenantDto) => {
    if (editingTenant) {
      await updateTenant({ id: editingTenant.id, dto: values });
      message.success('Cập nhật thông tin khách thuê thành công!');
    } else {
      await createTenant(values);
      message.success('Thêm khách thuê vào phòng thành công!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteTenant(id);
      message.success('Đã xóa khách thuê khỏi phòng!');
    } catch (err: any) {
      message.error(err.message || 'Không thể xóa khách thuê');
    }
  };

  const handleOpenInvite = (tnt: Tenant) => {
    setSelectedTenant(tnt);
    setSearchAccountKeyword(tnt.phone);
    setInviteModalOpen(true);
  };

  const handleSendInvite = async () => {
    if (!selectedTenant) return;
    try {
      await inviteTenantLink({ tenantId: selectedTenant.id, keyword: searchAccountKeyword });
      message.success(`Đã gửi lời mời liên kết tới tài khoản của ${selectedTenant.fullName}!`);
      setInviteModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Không tìm thấy tài khoản tương ứng');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stay-text tracking-tight">Khách thuê</h1>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="bg-stay-primary hover:bg-stay-primary-hover"
        >
          Thêm khách thuê
        </Button>
      </div>

      {/* Filter */}
      <TenantFilter
        keyword={keyword}
        onKeywordChange={setKeyword}
        buildingId={buildingId}
        onBuildingIdChange={setBuildingId}
        buildings={buildings}
      />

      {/* Table */}
      <TenantTable
        tenants={tenants}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onInvite={handleOpenInvite}
      />

      {/* Form Modal */}
      <TenantFormModal
        open={isModalOpen}
        editingTenant={editingTenant}
        rooms={rooms}
        confirmLoading={isCreating || isUpdating}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Invite Modal */}
      <TenantInviteModal
        open={inviteModalOpen}
        tenant={selectedTenant}
        keyword={searchAccountKeyword}
        onKeywordChange={setSearchAccountKeyword}
        confirmLoading={isInviting}
        onCancel={() => setInviteModalOpen(false)}
        onSubmit={handleSendInvite}
      />
    </div>
  );
};
