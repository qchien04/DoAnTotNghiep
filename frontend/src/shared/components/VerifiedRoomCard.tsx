import React, { useState } from 'react';
import { Card, Tag, Button, Typography, Space } from 'antd';
import {
  SafetyCertificateFilled,
  HeartFilled,
  HeartOutlined,
  EnvironmentOutlined,
  WifiOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export interface RoomListing {
  id: string | number;
  title: string;
  price: string;
  priceNumber?: number;
  location: string;
  district: string;
  imageUrl: string;
  verified: boolean;
  area?: string;
  amenities: {
    icon?: string;
    key: 'ac' | 'wifi' | '24/7' | 'balcony' | 'parking' | string;
    label: string;
  }[];
  isFavorite?: boolean;
}

interface VerifiedRoomCardProps {
  room: RoomListing;
  onClick?: (room: RoomListing) => void;
  onToggleFavorite?: (room: RoomListing, isFavorite: boolean) => void;
  className?: string;
}

export const VerifiedRoomCard: React.FC<VerifiedRoomCardProps> = ({
  room,
  onClick,
  onToggleFavorite,
  className = '',
}) => {
  const [favorite, setFavorite] = useState(room.isFavorite || false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !favorite;
    setFavorite(nextState);
    onToggleFavorite?.(room, nextState);
  };

  const renderAmenityTag = (amenity: { key: string; label: string }) => {
    let icon = null;
    if (amenity.key.toLowerCase() === 'wifi') icon = <WifiOutlined className="text-emerald-500" />;
    if (amenity.key.toLowerCase() === '24/7') icon = <ClockCircleOutlined className="text-amber-500" />;

    return (
      <span key={amenity.key} className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
        {icon}
        <span>{amenity.label}</span>
      </span>
    );
  };

  return (
    <Card
      hoverable
      onClick={() => onClick?.(room)}
      className={`rounded-2xl border-stay-border shadow-card hover:shadow-search transition-all overflow-hidden cursor-pointer group flex flex-col justify-between ${className}`}
      bodyStyle={{ padding: 0 }}
      cover={
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={room.imageUrl}
            alt={room.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Top-left: Antd Tag Đã xác minh */}
          {room.verified && (
            <div className="absolute top-3 left-3">
              <Tag
                color="#16A34A"
                icon={<SafetyCertificateFilled />}
                className="font-semibold px-2.5 py-0.5 rounded-full border-none shadow-xs m-0"
              >
                Đã xác minh
              </Tag>
            </div>
          )}

          {/* Top-right: Favorite Button */}
          <Button
            shape="circle"
            size="small"
            onClick={handleFavoriteClick}
            icon={favorite ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
            className="absolute top-3 right-3 bg-stay-card-bg/90 backdrop-blur-xs border-none shadow-xs hover:scale-105"
          />
        </div>
      }
    >
      <div className="p-4 space-y-2">
        {/* Price & Area */}
        <div className="flex items-center justify-between">
          <Text strong className="text-base text-stay-primary font-bold">
            {room.price}
          </Text>
          {room.area && (
            <Tag className="bg-stay-bg-app border-none text-stay-text-secondary text-[11px] m-0">
              {room.area}
            </Tag>
          )}
        </div>

        {/* Room Title */}
        <h4 className="text-sm font-semibold text-stay-text group-hover:text-stay-primary transition-colors line-clamp-1">
          {room.title}
        </h4>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-stay-text-secondary">
          <EnvironmentOutlined className="text-stay-text-muted" />
          <span className="truncate">{room.location}</span>
        </div>
      </div>

      {/* Footer Amenities */}
      <div className="px-4 py-2.5 bg-stay-bg-app border-t border-stay-border-subtle flex items-center justify-between text-xs">
        <Space size={12}>
          {room.amenities.map(renderAmenityTag)}
        </Space>

        <span className="text-[11px] text-stay-primary font-semibold flex items-center gap-0.5 group-hover:underline">
          <span>Chi tiết</span>
          <ArrowRightOutlined className="text-[10px]" />
        </span>
      </div>
    </Card>
  );
};

export default VerifiedRoomCard;
