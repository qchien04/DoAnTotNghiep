import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRooms, useBuildings, useServices } from '@/shared/hooks';
import { Plus, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button, message } from '@/shared/components';
import { Modal } from 'antd';
import { Room, CreateRoomDto, RoomStatus } from '@/shared/types/landlord';
import { useAuthStore } from '@/stores/useAuthStore';
import { RoomFilter } from './components/RoomFilter';
import { RoomTable } from './components/RoomTable';
import { RoomFormModal } from './components/RoomFormModal';

export const RoomListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isVerified = Boolean(user?.landlordVerified || user?.role === 'ROLE_ADMIN');

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

  const handleSubmit = async (values: CreateRoomDto) => {
    const roomName = values.name || (editingRoom ? editingRoom.name : 'mới');
    if (editingRoom) {
      await updateRoom({ id: editingRoom.id, dto: values });
      message.success(`Cập nhật phòng "${roomName}" thành công!`);
    } else {
      await createRoom(values);
      message.success(`Tạo phòng "${roomName}" thành công!`);
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
