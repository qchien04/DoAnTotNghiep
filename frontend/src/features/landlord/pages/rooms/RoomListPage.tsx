import React, { useState } from 'react';
import {
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useBuildings,
} from '@/shared/hooks';
import { Room, CreateRoomDto, RoomStatus } from '@/shared/types/landlord';
import { RoomFilter } from './components/RoomFilter';
import { RoomTable } from './components/RoomTable';
import { RoomFormModal } from './components/RoomFormModal';
import { RoomDetailModal } from './components/RoomDetailModal';

export const RoomListPage: React.FC = () => {
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
