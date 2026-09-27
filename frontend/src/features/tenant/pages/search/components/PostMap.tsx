import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LeafletMap, type MapMarker } from '@/shared/components';

interface PostMapProps {
  markers: MapMarker[];
}

export const PostMap: React.FC<PostMapProps> = ({ markers }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="p-3 bg-stay-card-bg rounded-xl border border-stay-border text-xs text-stay-text-secondary flex justify-between items-center">
        <span>Hiển thị <strong>{markers.length}</strong> bài đăng ghim trên bản đồ</span>
        <span>Bấm vào ghim để xem chi tiết bài đăng</span>
      </div>
      <LeafletMap
        markers={markers}
        height="560px"
        onMarkerClick={(marker) => navigate(`/roommates/${marker.id}`)}
      />
    </div>
  );
};
