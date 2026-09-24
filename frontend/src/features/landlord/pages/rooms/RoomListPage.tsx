import React, { useState } from 'react';
import { useRooms, useBuildings, useServices } from '@/shared/hooks';
import { Plus } from 'lucide-react';
import { Button, message } from '@/shared/components';
import { Room, CreateRoomDto, RoomStatus } from '@/shared/types/landlord';
import { RoomFilter } from './components/RoomFilter';
import { RoomTable } from './components/RoomTable';
import { RoomFormModal } from './components/RoomFormModal';

export const RoomListPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [buildingId, setBuildingId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<RoomStatus | 'ALL'>('ALL');

  const { buildings } = useBuildings();
  const { services } = useServices();
  const {
    rooms,
    isLoading,
    createRoom,
    isCreating,
    updateRoom,
    isUpdating,
    deleteRoom,
    isDeleting,
  } = useRooms({ keyword, buildingId, status });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: CreateRoomDto) => {
    const code = values.code || values.roomCode || 'mới';
    if (editingRoom) {
      await updateRoom({ id: editingRoom.id, dto: values });
      message.success(`Cập nhật phòng ${code} thành công!`);
    } else {
      await createRoom(values);
      message.success(`Tạo phòng ${code} thành công!`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteRoom(id);
      message.success('Xóa phòng trọ thành công!');
    } catch (err: any) {
      message.error(err.message || 'Không thể xóa phòng');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stay-text tracking-tight">Phòng trọ</h1>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Thêm phòng
        </Button>
      </div>

      {/* Filter */}
      <RoomFilter
        keyword={keyword}
        buildingId={buildingId}
        status={status}
        buildings={buildings}
        onKeywordChange={setKeyword}
        onBuildingIdChange={setBuildingId}
        onStatusChange={setStatus}
      />

      {/* Table */}
      <RoomTable
        rooms={rooms}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <RoomFormModal
        open={isModalOpen}
        editingRoom={editingRoom}
        buildings={buildings}
        services={services}
        confirmLoading={isCreating || isUpdating}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
