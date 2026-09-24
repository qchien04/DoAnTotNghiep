import React, { useState } from 'react';
import { useBuildings } from '@/shared/hooks';
import { Plus } from 'lucide-react';
import { Button, message } from '@/shared/components';
import { Building, CreateBuildingDto } from '@/shared/types/landlord';
import { BuildingFilter } from './components/BuildingFilter';
import { BuildingTable } from './components/BuildingTable';
import { BuildingFormModal } from './components/BuildingFormModal';

export const BuildingListPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [floorFilter, setFloorFilter] = useState<number | undefined>(undefined);

  const {
    buildings,
    isLoading,
    createBuilding,
    isCreating,
    updateBuilding,
    isUpdating,
    deleteBuilding,
    isDeleting,
  } = useBuildings({ keyword, floors: floorFilter });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  const handleOpenCreate = () => {
    setEditingBuilding(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bld: Building) => {
    setEditingBuilding(bld);
    setIsModalOpen(true);
  };

  const handleSubmit = async (dto: CreateBuildingDto) => {
    try {
      if (editingBuilding) {
        await updateBuilding({ id: editingBuilding.id, dto });
        message.success('Cập nhật thông tin tòa nhà thành công!');
      } else {
        await createBuilding(dto);
        message.success('Thêm mới tòa nhà thành công!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteBuilding(id);
      message.success('Xóa tòa nhà thành công!');
    } catch (err: any) {
      message.error(err.message || 'Không thể xóa tòa nhà');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stay-text tracking-tight">Tòa nhà</h1>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Thêm tòa nhà
        </Button>
      </div>

      {/* Filter Bar */}
      <BuildingFilter
        keyword={keyword}
        onKeywordChange={setKeyword}
        floorFilter={floorFilter}
        onFloorFilterChange={setFloorFilter}
      />

      {/* Building Table */}
      <BuildingTable
        buildings={buildings}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Create / Edit Modal (Spacious) */}
      <BuildingFormModal
        open={isModalOpen}
        editingBuilding={editingBuilding}
        confirmLoading={isCreating || isUpdating}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default BuildingListPage;
