import React from 'react';
import { Modal, Button } from '@/shared/components';
import { Room } from '@/shared/types/landlord';

interface RoomDetailModalProps {
  open: boolean;
  room: Room | null;
  onCancel: () => void;
  onEdit?: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  open,
  room,
  onCancel,
  onEdit,
}) => {
  if (!room) return null;

  const renderStatus = () => {
    switch (room.status) {
      case 'AVAILABLE':
        return 'Còn trống (Sẵn sàng cho thuê)';
      case 'OCCUPIED':
        return 'Đang có người thuê';
      case 'UNDER_MAINTENANCE':
        return 'Đang sửa chữa / bảo trì';
      case 'STOPPED':
        return 'Ngừng sử dụng';
      default:
        return room.status;
    }
  };

  const images = room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls : room.coverImageUrl ? [room.coverImageUrl] : [];
  const amenityList: string[] = Array.isArray(room.amenities)
    ? room.amenities
    : typeof room.amenities === 'string' && room.amenities
      ? room.amenities.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={`Chi tiết phòng: ${room.name}`}
      width={940}
      centered
      destroyOnClose
      footer={[
        <Button key="close" onClick={onCancel} className="h-9 px-4 rounded-lg">
          Đóng
        </Button>,
        onEdit && (
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              onCancel();
              onEdit(room);
            }}
            className="h-9 px-4 rounded-lg bg-[#E60023] hover:bg-[#CC001F] text-white font-medium"
          >
            Chỉnh sửa
          </Button>
        ),
      ]}
    >
      <div className="mt-4 space-y-4 text-[14px]">
        {/* Hình ảnh phòng */}
        {images.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stay-text-secondary block">
              Hình ảnh phòng trọ ({images.length} ảnh)
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Room ${room.name} image ${i + 1}`}
                  className="w-28 h-20 rounded-lg object-cover border border-stay-border shrink-0"
                />
              ))}
            </div>
          </div>
        )}

        {/* SECTION 1: TÒA NHÀ & VỊ TRÍ */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            1. Tòa nhà & vị trí phòng trọ
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-3">
            <div>
              <label className="text-stay-text font-medium text-xs block mb-1">
                Thuộc tòa nhà / Khu trọ
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                {room.buildingName ? `Tòa nhà: ${room.buildingName}` : 'Phòng trọ độc lập (không thuộc tòa nhà nào)'}
              </div>
            </div>

            <div>
              <label className="text-stay-text font-medium text-xs block mb-1">
                Địa chỉ chi tiết
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                {room.addressDetail || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: THÔNG TIN CƠ BẢN & GIÁ THUÊ */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            2. Thông tin cơ bản & giá thuê
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-3">
            <div>
              <label className="text-stay-text font-medium text-xs block mb-1">
                Tên phòng
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                {room.name}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Tầng bố trí
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  Tầng {room.floor ?? 1}
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Diện tích phòng
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  {room.area ?? 0} m²
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Sức chứa tối đa
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                  {room.maxCapacity ?? 1} người
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Giá thuê niêm yết
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {Number(room.listedPrice || 0).toLocaleString()} đ/tháng
                </div>
              </div>

              <div>
                <label className="text-stay-text font-medium text-xs block mb-1">
                  Tiền cọc tiêu chuẩn
                </label>
                <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text font-medium">
                  {Number(room.standardDeposit || 0).toLocaleString()} đ
                </div>
              </div>
            </div>

            <div>
              <label className="text-stay-text font-medium text-xs block mb-1">
                Trạng thái phòng
              </label>
              <div className="h-10 px-3 flex items-center rounded-lg border border-stay-border bg-stay-card-bg text-stay-text">
                {renderStatus()}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TIỆN NGHI */}
        {amenityList.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-stay-text">
              3. Tiện nghi phòng trọ
            </h3>
            <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border">
              <div className="flex flex-wrap gap-2">
                {amenityList.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-xs rounded-lg bg-stay-card-bg border border-stay-border text-stay-text font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: MÔ TẢ CHI TIẾT */}
        {room.description && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-stay-text">
              4. Mô tả chi tiết phòng
            </h3>
            <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border text-xs text-stay-text whitespace-pre-line leading-relaxed">
              {room.description}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
