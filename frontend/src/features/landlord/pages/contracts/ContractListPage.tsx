import React, { useState } from 'react';
import {
  useContracts,
  useCreateContract,
  useTerminateContract,
  useRooms,
  useTenants,
  useServices,
} from '@/shared/hooks';
import { message } from '@/shared/components';
import { RentalContract, CreateContractDto, TerminateContractDto, ContractStatus } from '@/shared/types/landlord';
import { ContractFilter } from './components/ContractFilter';
import { ContractTable } from './components/ContractTable';
import { CreateContractModal } from './components/CreateContractModal';
import { TerminateContractModal } from './components/TerminateContractModal';
import { ContractDetailModal } from './components/ContractDetailModal';

export const ContractListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [keyword, setKeyword] = useState('');

  const { pageInfo: contractsPageInfo, isLoading } = useContracts({
    page,
    size,
    status: statusFilter,
    keyword,
  });
  const { createContract, isCreating } = useCreateContract();
  const { terminateContract, isTerminating } = useTerminateContract();

  const { pageInfo: roomsPageInfo } = useRooms({ status: 'AVAILABLE' });
  const rooms = roomsPageInfo?.items ?? [];
  const { pageInfo: tenantsPageInfo } = useTenants();
  const tenants = tenantsPageInfo?.items ?? [];
  const { services } = useServices();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [terminateModalOpen, setTerminateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<RentalContract | null>(null);

  const handleOpenDetail = (contract: RentalContract) => {
    setSelectedContract(contract);
    setDetailModalOpen(true);
  };

  const handleOpenTerminate = (contract: RentalContract) => {
    setSelectedContract(contract);
    setTerminateModalOpen(true);
  };

  const handleCreateSubmit = async (values: CreateContractDto) => {
    await createContract(values);
    message.success('Tạo và kích hoạt hợp đồng thuê phòng thành công!');
    setCreateModalOpen(false);
  };

  const handleTerminateSubmit = async (contractId: string | number, dto: TerminateContractDto) => {
    await terminateContract({ id: contractId, dto });
    message.success('Xác nhận hoàn tất thanh lý hợp đồng và trả cọc!');
    setTerminateModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Filter with integrated CTA */}

      <ContractFilter
        keyword={keyword}
        onKeywordChange={(k) => {
          setKeyword(k);
          setPage(0);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setPage(0);
        }}
        onOpenCreate={() => setCreateModalOpen(true)}
      />

      {/* Table */}
      <ContractTable
        pageInfo={contractsPageInfo}
        isLoading={isLoading}
        onPageChange={(p, s) => {
          setPage(p);
          setSize(s);
        }}
        onOpenDetail={handleOpenDetail}
        onOpenTerminate={handleOpenTerminate}
      />

      {/* Create Modal */}
      <CreateContractModal
        open={createModalOpen}
        rooms={rooms}
        tenants={tenants}
        services={services}
        confirmLoading={isCreating}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Terminate Modal */}
      <TerminateContractModal
        open={terminateModalOpen}
        contract={selectedContract}
        confirmLoading={isTerminating}
        onCancel={() => setTerminateModalOpen(false)}
        onSubmit={handleTerminateSubmit}
      />

      {/* Detail Modal */}
      <ContractDetailModal
        open={detailModalOpen}
        contract={selectedContract}
        onCancel={() => setDetailModalOpen(false)}
        onOpenTerminate={handleOpenTerminate}
      />
    </div>
  );
};
