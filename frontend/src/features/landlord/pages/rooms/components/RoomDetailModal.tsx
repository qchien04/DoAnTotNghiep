import React from 'react';
import { Modal, Button, StatusBadge } from '@/shared/components';
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

  const images = room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls : room.coverImageUrl ? [room.coverImageUrl] : [];
  const rawAmenities = room.amenities as any;
  const amenityList: string[] = Array.isArray(rawAmenities)
    ? rawAmenities
    : typeof rawAmenities === 'string' && rawAmenities
      ? rawAmenities.split(',').map((s: string) => s.trim()).filter(Boolean)
      : (room.amenityDetails?.map((a) => a.name) || []);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={`Chi tiết phòng: ${room.name}`}
      width={860}
      centered
      destroyOnClose
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full pt-1">
          <Button
            key="close"
            variant="outline"
            size="md"
            onClick={onCancel}
            className="h-9 px-4 rounded-lg border border-stay-border text-stay-text hover:bg-stay-bg-app bg-stay-card-bg font-medium text-[14px]"
          >
            Đóng
          </Button>
          {onEdit && (
            <Button
              key="edit"
              variant="primary"
              size="md"
              onClick={() => {
                onCancel();
                onEdit(room);
              }}
              className="h-9 px-4 rounded-lg bg-stay-primary hover:bg-stay-primary-hover text-white font-medium text-[14px] shadow-xs"
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      }
    >
      <div className="mt-4 space-y-4 text-[14px]">
        {/* Hình ảnh phòng */}
        {images.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[13px] font-semibold text-stay-text-secondary block">
              Hình ảnh phòng trọ ({images.length} ảnh)
            </span>
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
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <span className="text-stay-text-secondary text-[14px] w-40 shrink-0">
              Thuộc tòa nhà / Khu trọ:
            </span>
            <span className="text-stay-text text-[14px] font-medium">
              {room.buildingName ? `Tòa nhà: ${room.buildingName}` : 'Phòng trọ độc lập (không thuộc tòa nhà nào)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <span className="text-stay-text-secondary text-[14px] w-40 shrink-0">
              Địa chỉ chi tiết:
            </span>
            <span className="text-stay-text text-[14px]">
              {room.addressDetail || '—'}
            </span>
          </div>
        </div>

        {/* SECTION 2: THÔNG TIN CƠ BẢN & GIÁ THUÊ */}
        <div className="pt-3.5 border-t border-stay-border-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
                Tên phòng:
              </span>
              <span className="text-stay-text text-[14px] font-semibold">
                {room.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
                Trạng thái:
              </span>
              <StatusBadge status={room.status} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
                Tầng bố trí:
              </span>
              <span className="text-stay-text text-[14px]">
                Tầng {room.floor ?? 1}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
                Diện tích:
              </span>
              <span className="text-stay-text text-[14px]">
                {room.area ?? 0} m²
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
                Sức chứa tối đa:
              </span>
              <span className="text-stay-text text-[14px]">
                {room.maxCapacity ?? 1} người
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
                Tiền cọc tiêu chuẩn:
              </span>
              <span className="text-stay-text text-[14px] font-semibold">
                {Number(room.standardDeposit || 0).toLocaleString()} đ
              </span>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <span className="text-stay-text-secondary text-[14px] w-36 shrink-0">
                Giá thuê niêm yết:
              </span>
              <span className="text-stay-primary text-[15px] font-bold">
                {Number(room.listedPrice || 0).toLocaleString()} đ/tháng
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: TIỆN NGHI */}
        {amenityList.length > 0 && (
          <div className="space-y-2 pt-3.5 border-t border-stay-border-subtle">
            <span className="text-[13px] font-semibold text-stay-text-secondary block">
              Tiện nghi phòng trọ
            </span>
            <div className="flex flex-wrap gap-2">
              {amenityList.map((item, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md border border-stay-border bg-stay-bg-app text-stay-text font-medium text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: MÔ TẢ CHI TIẾT */}
        {room.description && (
          <div className="space-y-1.5 pt-3.5 border-t border-stay-border-subtle">
            <span className="text-[13px] font-semibold text-stay-text-secondary block">
              Mô tả chi tiết phòng
            </span>
            <div className="text-stay-text whitespace-pre-line leading-relaxed text-[14px]">
              {room.description}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
