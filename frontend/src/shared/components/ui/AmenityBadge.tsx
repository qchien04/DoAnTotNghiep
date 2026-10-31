import React from 'react';
import {
  Wind,
  Flame,
  Refrigerator,
  WashingMachine,
  Bed,
  DoorClosed,
  ChefHat,
  Sun,
  Bath,
  Wifi,
  Bike,
  ArrowUpDown,
  ShieldCheck,
  Clock,
  PawPrint,
  Layers,
  Check,
} from 'lucide-react';
import { ROOM_AMENITIES, RoomAmenityItem } from '@/shared/constants/roomAmenities';

interface AmenityIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const AmenityIcon: React.FC<AmenityIconProps> = ({ name, className = 'w-4 h-4', size = 16 }) => {
  switch (name) {
    case 'Wind':
      return <Wind size={size} className={className} />;
    case 'Flame':
      return <Flame size={size} className={className} />;
    case 'Refrigerator':
      return <Refrigerator size={size} className={className} />;
    case 'WashingMachine':
      return <WashingMachine size={size} className={className} />;
    case 'Bed':
      return <Bed size={size} className={className} />;
    case 'DoorClosed':
      return <DoorClosed size={size} className={className} />;
    case 'ChefHat':
      return <ChefHat size={size} className={className} />;
    case 'Sun':
      return <Sun size={size} className={className} />;
    case 'Bath':
      return <Bath size={size} className={className} />;
    case 'Wifi':
      return <Wifi size={size} className={className} />;
    case 'Bike':
      return <Bike size={size} className={className} />;
    case 'ArrowUpDown':
      return <ArrowUpDown size={size} className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck size={size} className={className} />;
    case 'Clock':
      return <Clock size={size} className={className} />;
    case 'PawPrint':
      return <PawPrint size={size} className={className} />;
    case 'Layers':
      return <Layers size={size} className={className} />;
    default:
      return <Layers size={size} className={className} />;
  }
};

interface AmenityBadgeProps {
  item: RoomAmenityItem;
  className?: string;
}

export const AmenityBadge: React.FC<AmenityBadgeProps> = ({ item, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-stay-primary-subtle text-stay-primary border border-stay-primary/20 ${className}`}
    >
      <AmenityIcon name={item.iconName} size={14} className="text-stay-primary shrink-0" />
      <span>{item.name}</span>
    </div>
  );
};

interface AmenitySelectorGridProps {
  selectedNames: string[];
  onChange: (names: string[]) => void;
  disabled?: boolean;
}

export const AmenitySelectorGrid: React.FC<AmenitySelectorGridProps> = ({
  selectedNames,
  onChange,
  disabled = false,
}) => {
  const isSelected = (name: string) => selectedNames.includes(name);

  const toggleAmenity = (name: string) => {
    if (disabled) return;
    if (isSelected(name)) {
      onChange(selectedNames.filter((n) => n !== name));
    } else {
      onChange([...selectedNames, name]);
    }
  };

  const selectAll = () => {
    if (disabled) return;
    onChange(ROOM_AMENITIES.map((a) => a.name));
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-stay-text-secondary">
        <span className="font-medium">
          Đã chọn: <strong className="text-stay-primary">{selectedNames.length}</strong> / 16 tiện nghi
        </span>
        {!disabled && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-stay-primary hover:underline font-medium cursor-pointer"
            >
              Chọn tất cả
            </button>
            <span className="text-stay-border">|</span>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-rose-500 hover:underline font-medium cursor-pointer"
            >
              Bỏ chọn hết
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ROOM_AMENITIES.map((item) => {
          const active = isSelected(item.name);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleAmenity(item.name)}
              disabled={disabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 border text-left cursor-pointer ${
                active
                  ? 'bg-stay-primary-subtle border-stay-primary text-stay-primary shadow-xs'
                  : 'bg-stay-card-bg border-stay-border text-stay-text-secondary hover:border-stay-primary/50 hover:text-stay-text'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <AmenityIcon
                name={item.iconName}
                size={16}
                className={active ? 'text-stay-primary shrink-0' : 'text-stay-text-muted shrink-0'}
              />
              <span className="truncate flex-1">{item.name}</span>
              {active && <Check size={14} className="text-stay-primary shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
