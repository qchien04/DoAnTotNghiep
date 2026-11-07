import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useBuildings,
} from '@/shared/hooks';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Modal } from 'antd';
import { Room, CreateRoomDto, RoomStatus } from '@/shared/types/landlord';
import { useAuthStore } from '@/stores/useAuthStore';
import { RoomFilter } from './components/RoomFilter';
import { RoomTable } from './components/RoomTable';
import { RoomFormModal } from './components/RoomFormModal';
import { RoomDetailModal } from './components/RoomDetailModal';

export const RoomListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isVerified = Boolean(user?.landlordVerified || user?.role === 'ROLE_ADMIN');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [buildingId, setBuildingId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<RoomStatus | 'ALL'>('ALL');

  const { pageInfo: buildingsPageInfo } = useBuildings();
  const buildings = buildingsPageInfo?.items ?? [];
  const { pageInfo: roomsPageInfo, isLoading } = useRooms({
    page,
    size,
    keyword,
    buildingId,
    status,
  });
  const { createRoom, isCreating } = useCreateRoom();
  const { updateRoom, isUpdating } = useUpdateRoom();
  const { deleteRoom, isDeleting } = useDeleteRoom();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);

  const handleOpenCreate = () => {
    if (!isVerified) {
      Modal.confirm({
        title: 'Chủ trọ chưa được xác minh',
        icon: <ShieldAlert className="text-amber-500" />,
        content:
          'Để bảo vệ an toàn cho người thuê và duy trì chất lượng hệ thống, bạn cần nộp giấy tờ nhà/đất hoặc hợp đồng ủy quyền để được Ban quản trị duyệt trước khi tạo phòng.',
        okText: 'Đi tới trang xác minh',
        cancelText: 'Để sau',
        onOk: () => navigate('/landlord/verification'),
      });
      return;
    }
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleOpenView = (room: Room) => {
    setViewingRoom(room);
    setDetailModalOpen(true);
  };

  const handleSubmit = async (values: CreateRoomDto) => {
    try {
      if (editingRoom) {
        await updateRoom({ id: editingRoom.id, dto: values });
      } else {
        await createRoom(values);
      }
      setIsModalOpen(false);
    } catch {
      // Handled in mutation hooks
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteRoom(id);
    } catch {
      // Handled in mutation hook
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Cảnh báo chưa xác minh chủ trọ */}
      {!isVerified && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stay-text">Tài khoản chưa được xác minh Chủ trọ</h3>
              <p className="text-xs text-stay-text-secondary mt-0.5">
                Bạn cần nộp giấy tờ sở hữu nhà/đất hoặc hợp đồng ủy quyền để kích hoạt quyền đăng và tạo phòng trọ mới.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/landlord/verification')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            Xác minh ngay
          </button>
        </div>
      )}

      {/* Filter with integrated CTA */}
      <RoomFilter
        keyword={keyword}
        buildingId={buildingId}
        status={status}
        buildings={buildings}
        onKeywordChange={(k) => {
          setKeyword(k);
          setPage(0);
        }}
        onBuildingIdChange={(b) => {
          setBuildingId(b);
          setPage(0);
        }}
        onStatusChange={(s) => {
          setStatus(s);
          setPage(0);
        }}
        onOpenCreate={handleOpenCreate}
      />

      {/* Table */}
      <RoomTable
        pageInfo={roomsPageInfo}
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

      {/* Form Modal */}
      <RoomFormModal
        open={isModalOpen}
        editingRoom={editingRoom}
        confirmLoading={isCreating || isUpdating}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Detail Modal */}
      <RoomDetailModal
        open={detailModalOpen}
        room={viewingRoom}
        onCancel={() => setDetailModalOpen(false)}
        onEdit={handleOpenEdit}
      />
    </div>
  );
};
