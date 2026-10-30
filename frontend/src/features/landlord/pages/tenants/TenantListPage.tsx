import React, { useState } from 'react';
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  useInviteTenantLink,
  useCancelTenantInvitation,
  useBuildings,
} from '@/shared/hooks';
import { Tenant, CreateTenantDto } from '@/shared/types/landlord';
import { TenantFilter } from './components/TenantFilter';
import { TenantTable } from './components/TenantTable';
import { TenantFormModal } from './components/TenantFormModal';
import { TenantInviteModal } from './components/TenantInviteModal';
import { TenantDetailModal } from './components/TenantDetailModal';

export const TenantListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [buildingId, setBuildingId] = useState<string | undefined>(undefined);

  const { pageInfo: buildingsPageInfo } = useBuildings();
  const buildings = buildingsPageInfo?.items ?? [];
  const { pageInfo: tenantsPageInfo, isLoading } = useTenants({
    page,
    size,
    keyword,
    buildingId,
  });
  const { createTenant, isCreating } = useCreateTenant();
  const { updateTenant, isUpdating } = useUpdateTenant();
  const { deleteTenant, isDeleting } = useDeleteTenant();
  const { inviteTenantLink, isInviting } = useInviteTenantLink();
  const { cancelInvitation } = useCancelTenantInvitation();

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [searchAccountKeyword, setSearchAccountKeyword] = useState('');

  const handleOpenDetail = (tnt: Tenant) => {
    setViewingTenant(tnt);
    setDetailModalOpen(true);
  };

  const handleOpenCreate = () => {

    setEditingTenant(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tnt: Tenant) => {
    setEditingTenant(tnt);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: CreateTenantDto) => {
    try {
      if (editingTenant) {
        await updateTenant({ id: editingTenant.id, dto: values });
      } else {
        await createTenant(values);
      }
      setIsModalOpen(false);
    } catch {
      // Handled in mutation hooks
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteTenant(id);
    } catch {
      // Handled in mutation hook
    }
  };

  const handleOpenInvite = (tnt: Tenant) => {
    setSelectedTenant(tnt);
    setSearchAccountKeyword(tnt.phone);
    setInviteModalOpen(true);
  };

  const handleCancelInvite = async (tnt: Tenant) => {
    try {
      await cancelInvitation(tnt.id);
    } catch {
      // Handled in mutation hook
    }
  };

  const handleSendInvite = async () => {
    if (!selectedTenant) return;
    try {
      await inviteTenantLink({ tenantId: selectedTenant.id, keyword: searchAccountKeyword });
      setInviteModalOpen(false);
    } catch {
      // Handled in mutation hook
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Filter */}

      <TenantFilter
        keyword={keyword}
        onKeywordChange={(k) => {
          setKeyword(k);
          setPage(0);
        }}
        buildingId={buildingId}
        onBuildingIdChange={(b) => {
          setBuildingId(b);
          setPage(0);
        }}
        buildings={buildings}
        onOpenCreate={handleOpenCreate}
      />

      {/* Table */}
      <TenantTable
        pageInfo={tenantsPageInfo}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onPageChange={(p, s) => {
          setPage(p);
          setSize(s);
        }}
        onView={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onInvite={handleOpenInvite}
        onCancelInvite={handleCancelInvite}
      />

      {/* Detail Modal */}
      <TenantDetailModal
        open={detailModalOpen}
        tenant={viewingTenant}
        onCancel={() => setDetailModalOpen(false)}
      />

      {/* Form Modal */}
      <TenantFormModal
        open={isModalOpen}
        editingTenant={editingTenant}
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
