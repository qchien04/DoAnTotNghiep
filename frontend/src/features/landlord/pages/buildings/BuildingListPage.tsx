import React, { useState } from 'react';
import {
  useBuildings,
  useCreateBuilding,
  useUpdateBuilding,
  useDeleteBuilding,
} from '@/shared/hooks';
import { Building, CreateBuildingDto } from '@/shared/types/landlord';
import { BuildingFilter } from './components/BuildingFilter';
import { BuildingTable } from './components/BuildingTable';
import { BuildingFormModal } from './components/BuildingFormModal';
import { BuildingDetailModal } from './components/BuildingDetailModal';

export const BuildingListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [floorFilter, setFloorFilter] = useState<number | undefined>(undefined);

  const { pageInfo, isLoading } = useBuildings({
    page,
    size,
    keyword,
    floors: floorFilter,
  });
  const { createBuilding, isCreating } = useCreateBuilding();
  const { updateBuilding, isUpdating } = useUpdateBuilding();
  const { deleteBuilding, isDeleting } = useDeleteBuilding();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingBuilding, setViewingBuilding] = useState<Building | null>(null);

  const handleOpenCreate = () => {
    setEditingBuilding(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bld: Building) => {
    setEditingBuilding(bld);
    setIsModalOpen(true);
  };

  const handleOpenView = (bld: Building) => {
    setViewingBuilding(bld);
    setDetailModalOpen(true);
  };

  const handleSubmit = async (dto: CreateBuildingDto) => {
    try {
      if (editingBuilding) {
        await updateBuilding({ id: editingBuilding.id, dto });
      } else {
        await createBuilding(dto);
      }
      setIsModalOpen(false);
    } catch {
      // Handled in mutation hooks
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteBuilding(id);
    } catch {
      // Handled in mutation hook
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Filter Bar with integrated CTA */}

      <BuildingFilter
        keyword={keyword}
        onKeywordChange={(k) => {
          setKeyword(k);
          setPage(0);
        }}
        floorFilter={floorFilter}
        onFloorFilterChange={(f) => {
          setFloorFilter(f);
          setPage(0);
        }}
        onOpenCreate={handleOpenCreate}
      />

      {/* Building Table */}
      <BuildingTable
        pageInfo={pageInfo}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onPageChange={(p, s) => {
          setPage(p);
          setSize(s);
        }}
        onView={handleOpenView}
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

      {/* Detail Modal */}
      <BuildingDetailModal
        open={detailModalOpen}
        building={viewingBuilding}
        onCancel={() => setDetailModalOpen(false)}
        onEdit={handleOpenEdit}
      />
    </div>
  );
};

export default BuildingListPage;
