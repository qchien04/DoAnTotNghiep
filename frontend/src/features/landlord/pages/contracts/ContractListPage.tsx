import React, { useState } from 'react';
import { useContracts, useRooms, useTenants, useServices } from '@/shared/hooks';
import { FileSignature, Plus } from 'lucide-react';
import { Button, message } from '@/shared/components';
import { RentalContract, CreateContractDto, TerminateContractDto, ContractStatus } from '@/shared/types/landlord';
import { ContractFilter } from './components/ContractFilter';
import { ContractTable } from './components/ContractTable';
import { CreateContractModal } from './components/CreateContractModal';
import { TerminateContractModal } from './components/TerminateContractModal';

export const ContractListPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [keyword, setKeyword] = useState('');

  const {
    contracts,
    isLoading,
    createContract,
    isCreating,
    terminateContract,
    isTerminating,
  } = useContracts({ status: statusFilter, keyword });

  const { rooms } = useRooms({ status: 'AVAILABLE' });
  const { tenants } = useTenants();
  const { services } = useServices();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [terminateModalOpen, setTerminateModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<RentalContract | null>(null);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stay-card-bg p-6 rounded-2xl border border-stay-border">
        <div>
          <h1 className="text-2xl font-bold text-stay-text tracking-tight flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-stay-primary" />
            Quản Lý Hợp Đồng Thuê Phòng
          </h1>
          <p className="text-sm text-stay-text-secondary">
            Lập hợp đồng thuê mới, quản lý dịch vụ áp dụng và nghiệm thu phòng thanh lý trả cọc
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
          className="bg-stay-primary hover:bg-stay-primary-hover font-semibold shadow-md"
        >
          Tạo Hợp Đồng Mới
        </Button>
      </div>

      {/* Filter */}
      <ContractFilter
        keyword={keyword}
        onKeywordChange={setKeyword}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Table */}
      <ContractTable
        contracts={contracts}
        isLoading={isLoading}
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
    </div>
  );
};
