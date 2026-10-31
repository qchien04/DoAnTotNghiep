import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Maximize2, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { Room } from '@/shared/types/landlord';
import { decodeAmenitiesMask } from '@/shared/constants/roomAmenities';
import { formatFullAddress } from '@/shared/constants/vietnamLocations';

export interface RoomCardProps {
  room: Room;
  onViewDetail?: (id: number | string) => void;
}

const DEFAULT_ROOM_IMAGE =
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

export const RoomCard: React.FC<RoomCardProps> = ({ room, onViewDetail }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onViewDetail) {
      onViewDetail(room.id);
    } else {
      navigate(`/rooms/${room.id}`);
    }
  };

  const coverImg =
    room.coverImageUrl ||
    (room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls[0] : DEFAULT_ROOM_IMAGE);

  const priceNum = Number(room.listedPrice || 0);
  const priceDisplay =
    priceNum >= 1000000
      ? `${(priceNum / 1000000).toFixed(1).replace(/\.0$/, '')} tr/tháng`
      : `${priceNum.toLocaleString('vi-VN')} đ/tháng`;

  const addressText =
    formatFullAddress(room.addressDetail, room.wardId, room.provinceId) ||
    room.addressDetail ||
    'Chưa cập nhật địa chỉ';

  // Lấy danh sách tiện ích (hỗ trợ bitmask amenitiesMask, amenityDetails, amenities dạng array)
  const displayAmenities: string[] = [];
  if (room.amenitiesMask) {
    decodeAmenitiesMask(room.amenitiesMask).forEach((a) => displayAmenities.push(a));
  } else if (room.amenityDetails && room.amenityDetails.length > 0) {
    room.amenityDetails.forEach((a) => displayAmenities.push(a.name));
  } else if (room.amenities && room.amenities.length > 0) {
    room.amenities.forEach((a) => {
      displayAmenities.push(typeof a === 'string' ? a : (a as any).name || '');
    });
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-stay-card-bg border border-stay-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-stay-primary/40 transition-all duration-300 group flex flex-col cursor-pointer relative"
    >
      {/* Ảnh bìa */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={coverImg}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_ROOM_IMAGE;
          }}
        />

        {/* Huy hiệu giá tiền nổi bật góc trên trái */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="bg-stay-primary/90 backdrop-blur-md text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg">
            {priceDisplay}
          </span>
        </div>

        {/* Diện tích góc trên phải */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <span className="bg-black/60 backdrop-blur-md text-white font-medium text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Maximize2 className="w-3 h-3 text-emerald-400" />
            {room.area || 25} m²
          </span>
        </div>

        {/* Trạng thái xác thực */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            <ShieldCheck className="w-3 h-3" />
            Phòng đã xác thực
          </span>
        </div>
      </div>

      {/* Nội dung thông tin phòng */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Tên phòng & tòa nhà */}
          <h3 className="font-bold text-stay-text text-base line-clamp-1 group-hover:text-stay-primary transition m-0">
            {room.name} {room.buildingName ? `· ${room.buildingName}` : ''}
          </h3>

          {/* Địa chỉ vị trí */}
          <p className="text-stay-text-secondary text-xs flex items-center gap-1 line-clamp-1 mt-1 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-stay-primary shrink-0" />
            <span>{addressText}</span>
          </p>

          {/* Danh sách tiện ích pills */}
          {displayAmenities.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {displayAmenities.slice(0, 3).map((amenity, i) => (
                <span
                  key={i}
                  className="bg-stay-bg-app border border-stay-border-subtle text-stay-text-secondary text-[11px] font-medium px-2 py-0.5 rounded-md"
                >
                  {amenity}
                </span>
              ))}
              {displayAmenities.length > 3 && (
                <span className="text-[11px] text-stay-text-muted font-medium">
                  +{displayAmenities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer của card: Chủ trọ + Nút xem chi tiết */}
        <div className="pt-3 border-t border-stay-border flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5 text-stay-text-secondary text-xs">
            <div className="w-5 h-5 rounded-full bg-stay-bg-app flex items-center justify-center text-stay-text-muted">
              <User className="w-3 h-3" />
            </div>
            <span className="line-clamp-1 font-medium text-stay-text">
              {room.landlordName || 'Chủ trọ Roomi'}
            </span>
          </div>

          <span className="text-stay-primary text-xs font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            Chi tiết
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
