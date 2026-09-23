import React, { useState } from 'react';
import { useRooms, useBuildings, useServices } from '@/shared/hooks';
import { DoorOpen, Plus } from 'lucide-react';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stay-card p-6 rounded-2xl border border-stay-border">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-stay-primary/10 text-stay-primary rounded-xl">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stay-text">Danh sách Phòng trọ</h1>
            <p className="text-sm text-stay-text-secondary">
              Quản lý chi tiết từng phòng trọ, diện tích, đơn giá và trạng thái thuê
            </p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="bg-stay-primary hover:bg-stay-primary-hover shadow-md font-medium"
        >
          Thêm phòng mới
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
