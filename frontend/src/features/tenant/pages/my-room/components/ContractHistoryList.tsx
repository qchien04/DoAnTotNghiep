import React, { useState, useMemo } from 'react';
import { TenantContractHistory } from '@/shared/types/tenant';
import { PageResponse } from '@/shared/types/api';
import { Button, Table, Modal, Input, StatusBadge } from '@/shared/components';
import { Tooltip, Select, message } from 'antd';
import {
  FileText,
  Home,
  Eye,
  Search,
  RotateCcw,
  Download,
  Phone,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/shared/utils';

interface ContractHistoryListProps {
  pageInfo?: PageResponse<TenantContractHistory>;
  contracts?: TenantContractHistory[];
  isLoading?: boolean;
  onPageChange?: (page: number, size: number) => void;
}

export const ContractHistoryList: React.FC<ContractHistoryListProps> = ({
  pageInfo,
  contracts = [],
  isLoading = false,
  onPageChange,
}) => {
  const [selectedContract, setSelectedContract] = useState<TenantContractHistory | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const getStatusBadge = (status: string, isCurrent: boolean, size: 'sm' | 'md' | 'lg' = 'md') => {
    if (isCurrent) {
      return <StatusBadge status="ACTIVE" label="Đang thuê" size={size} />;
    }
    return <StatusBadge status={status} size={size} />;
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'CURRENT' && !c.isCurrent) return false;
        if (statusFilter === 'ACTIVE' && c.status !== 'ACTIVE') return false;
        if (statusFilter === 'TERMINATED' && c.status !== 'TERMINATED') return false;
      }
      if (keyword.trim()) {
        const kw = keyword.toLowerCase();
        const matchId = (`hd${c.id}`).includes(kw) || String(c.id).includes(kw);
        const matchRoom = (c.roomName || '').toLowerCase().includes(kw);
        const matchBuilding = (c.buildingName || '').toLowerCase().includes(kw);
        const matchLandlord = (c.landlordName || '').toLowerCase().includes(kw);
        if (!matchId && !matchRoom && !matchBuilding && !matchLandlord) return false;
      }
      return true;
    });
  }, [contracts, statusFilter, keyword]);

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 55,
      render: (_: any, __: any, index: number) => (
        <span className="text-[14px] text-stay-text-secondary font-medium">
          {index + 1}
        </span>
      ),
    },
    {
      title: 'Phòng & Tòa nhà',
      key: 'roomInfo',
      ellipsis: { showTitle: true },
      render: (_: any, r: TenantContractHistory) => (
        <div>
          <span
            onClick={() => {
              setSelectedContract(r);
              setDetailModalOpen(true);
            }}
            className="font-medium text-[14px] text-stay-text block cursor-pointer hover:text-stay-primary hover:underline"
          >
            {r.roomName || 'Phòng thuê'}
          </span>
          {r.buildingName && (
            <span className="text-[12px] text-stay-text-muted block truncate">
              {r.buildingName}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Thời hạn thuê',
      key: 'duration',
      width: 170,
      render: (_: any, r: TenantContractHistory) => (
        <span className="text-[14px] text-stay-text-secondary">
          {formatDate(r.startDate)} ➔ {formatDate(r.endDate)}
        </span>
      ),
    },
    {
      title: 'Giá thuê / tháng',
      key: 'monthlyRent',
      width: 130,
      render: (_: any, r: TenantContractHistory) => (
        <span className="font-semibold text-stay-text text-[14px]">
          {formatCurrency(r.monthlyRent)}
        </span>
      ),
    },
    {
      title: 'Tiền cọc',
      key: 'depositAmount',
      width: 120,
      render: (_: any, r: TenantContractHistory) => (
        <span className="text-[14px] text-stay-text-secondary">
          {formatCurrency(r.depositAmount)}
        </span>
      ),
    },
    {
      title: 'Chủ trọ',
      key: 'landlord',
      width: 150,
      ellipsis: { showTitle: true },
      render: (_: any, r: TenantContractHistory) => (
        <div>
          <span className="text-[14px] font-medium text-stay-text block truncate">
            {r.landlordName || '—'}
          </span>
          {r.landlordPhone && (
            <span className="text-[12px] text-stay-text-muted block">
              {r.landlordPhone}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_: any, r: TenantContractHistory) => getStatusBadge(r.status, r.isCurrent),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, r: TenantContractHistory) => (
        <div className="flex items-center justify-start gap-1.5">
          <Tooltip title="Xem chi tiết hợp đồng">
            <button
              type="button"
              className="stay-action-btn"
              onClick={() => {
                setSelectedContract(r);
                setDetailModalOpen(true);
              }}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip title="Tải xuống / In hợp đồng">
            <button
              type="button"
              className="stay-action-btn"
              onClick={() => {
                setSelectedContract(r);
                setDetailModalOpen(true);
              }}
            >
              <Download className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip title="Liên hệ chủ trọ">
            <button
              type="button"
              className="stay-action-btn"
              onClick={() =>
                message.info(
                  `Chủ trọ ${r.landlordName || ''} - SĐT: ${r.landlordPhone || 'Xem trong chi tiết hợp đồng'}`
                )
              }
            >
              <Phone className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Standard Filter Bar */}
      <div className="bg-stay-card-bg p-4 rounded-xl border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm mã HĐ, tên phòng, chủ trọ..."
          prefix={<Search className="w-4 h-4 text-[#8C8C8C]" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          className="w-full sm:w-[320px] h-[40px] rounded-[8px]"
        />

        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          className="w-full sm:w-[200px] h-[40px] rounded-[8px]"
          options={[
            { label: 'Tất cả trạng thái', value: 'ALL' },
            { label: 'Đang thuê', value: 'CURRENT' },
            { label: 'Hiệu lực', value: 'ACTIVE' },
            { label: 'Đã thanh lý', value: 'TERMINATED' },
          ]}
        />

        <Button
          icon={<RotateCcw className="w-4 h-4 text-stay-text-secondary" />}
          onClick={() => {
            setKeyword('');
            setStatusFilter('ALL');
          }}
          className="h-[40px] rounded-[8px] border-[#D7D7DB] dark:border-stay-border text-stay-text hover:text-stay-primary font-medium"
        >
          Đặt lại
        </Button>
      </div>

      {/* Contracts Table */}
      <Table<TenantContractHistory>
        rowKey="id"
        dataSource={pageInfo?.items ?? filteredContracts}
        columns={columns}
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        className="overflow-x-auto"
        pagination={
          pageInfo
            ? {
              current: (pageInfo.page ?? 0) + 1,
              pageSize: pageInfo.size ?? 10,
              total: pageInfo.totalElements ?? 0,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Tổng ${total} hợp đồng`,
              onChange: (p, s) => onPageChange?.(p - 1, s),
            }
            : {
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => `Tổng ${total} hợp đồng`,
            }
        }
      />

      {/* Contract Detail Modal */}
      <Modal
        title={selectedContract ? `Chi tiết Hợp đồng #HD${selectedContract.id}` : 'Chi tiết Hợp đồng'}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" variant="outline" size="md" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={620}
      >
        {selectedContract && (
          <div className="space-y-3.5 pt-2 ">
            {/* Header info */}
            <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-stay-text">
                  Hợp đồng thuê #HD{selectedContract.id}
                </span>
                <p className="text-stay-text-secondary text-xs mt-0.5">
                  Thời hạn: {formatDate(selectedContract.startDate)} ➔ {formatDate(selectedContract.endDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-stay-text-secondary font-medium">Trạng thái:</span>
                {getStatusBadge(selectedContract.status, selectedContract.isCurrent, 'lg')}
              </div>
            </div>

            {/* Room info */}
            <div className="bg-stay-card-bg border border-stay-border rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-stay-text flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-stay-primary" /> Thông tin phòng & Chủ trọ
              </h4>
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <div>
                  <span className="text-stay-text-muted block text-[13px]">Phòng:</span>
                  <span className="font-semibold text-stay-text text-[14px]">{selectedContract.roomName || '—'}</span>
                </div>
                <div>
                  <span className="text-stay-text-muted block text-[13px]">Tòa nhà:</span>
                  <span className="font-semibold text-stay-text text-[14px]">{selectedContract.buildingName || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stay-text-muted block text-[13px]">Địa chỉ:</span>
                  <span className="text-stay-text text-[14px]">{selectedContract.buildingAddress || '—'}</span>
                </div>
                <div>
                  <span className="text-stay-text-muted block text-[13px]">Chủ trọ:</span>
                  <span className="font-semibold text-stay-text text-[14px]">{selectedContract.landlordName || '—'}</span>
                </div>
                <div>
                  <span className="text-stay-text-muted block text-[13px]">SĐT liên hệ:</span>
                  <span className="font-semibold text-stay-text text-[14px]">{selectedContract.landlordPhone || '—'}</span>
                </div>
              </div>
            </div>

            {/* Rent & Deposit */}
            <div className="bg-stay-card-bg border border-stay-border rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-stay-text flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stay-primary" /> Chi phí & Đặt cọc
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-0.5">
                <div>
                  <span className="text-stay-text-muted block text-[13px]">Tiền phòng / tháng:</span>
                  <span className="font-bold text-stay-text text-[14px]">
                    {formatCurrency(selectedContract.monthlyRent)}
                  </span>
                </div>
                <div>
                  <span className="text-stay-text-muted block text-[13px]">Tiền cọc ban đầu:</span>
                  <span className="font-semibold text-stay-text text-[14px]">
                    {formatCurrency(selectedContract.depositAmount)}
                  </span>
                </div>
                {selectedContract.depositRefundAmount !== null && selectedContract.depositRefundAmount !== undefined && (
                  <div>
                    <span className="text-stay-text-muted block text-[13px]">Tiền cọc hoàn trả:</span>
                    <span className="font-semibold text-stay-text text-[14px]">
                      {formatCurrency(selectedContract.depositRefundAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            {selectedContract.services && selectedContract.services.length > 0 && (
              <div className="bg-stay-card-bg border border-stay-border rounded-lg p-3 space-y-2">
                <h4 className="font-semibold text-stay-text ">Dịch vụ thỏa thuận</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  {selectedContract.services.map((srv, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-stay-bg-app border border-stay-border">
                      <span className="font-medium text-stay-text">{srv.name}</span>
                      <span className="font-semibold text-stay-text">
                        {formatCurrency(srv.price)}/{srv.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms and conditions */}
            {selectedContract.termsAndConditions && (
              <div className="bg-stay-card-bg border border-stay-border rounded-lg p-3 space-y-1">
                <h4 className="font-semibold text-stay-text ">Điều khoản & Quy định</h4>
                <p className="text-stay-text-secondary leading-relaxed  whitespace-pre-line bg-stay-bg-app p-2.5 rounded-lg border border-stay-border">
                  {selectedContract.termsAndConditions}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
