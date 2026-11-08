import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useBuildings,
} from '@/shared/hooks';
import { ShieldCheck } from 'lucide-react';
import { Room, CreateRoomDto, RoomStatus } from '@/shared/types/landlord';
import { useAuthStore } from '@/stores/useAuthStore';
import { RoomFilter } from './components/RoomFilter';
import { RoomTable } from './components/RoomTable';
import { RoomFormModal } from './components/RoomFormModal';
import { RoomDetailModal } from './components/RoomDetailModal';

export const RoomListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Tự động mở modal thêm phòng mới nếu URL chứa ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
      handleOpenCreate();
    }
  }, [searchParams, setSearchParams]);

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
      {/* Banner khuyến khích xác minh nhận Huy hiệu Tick xanh */}
      {!isVerified && (
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stay-text flex items-center gap-1.5">
                <span>Nhận Huy hiệu Tick Xanh cho phòng trọ của bạn</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  Khuyên dùng
                </span>
              </h3>
              <p className="text-xs text-stay-text-secondary mt-0.5">
                Xác minh giấy tờ nhà/đất hoặc hợp đồng ủy quyền để hiển thị huy hiệu <strong>Chủ trọ đã xác minh</strong> trên tin đăng, giúp tăng độ uy tín và tiếp cận khách thuê tốt hơn.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/landlord/verification')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0 cursor-pointer self-start sm:self-auto shadow-xs"
          >
            Nhận Tick xanh ngay
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
