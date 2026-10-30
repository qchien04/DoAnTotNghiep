/**
 * Định nghĩa type và helper cho tính năng tìm kiếm phòng và khoanh vùng bản đồ (DrawZone)
 */

export interface CircleZone {
  id: string;
  latitude: number;
  longitude: number;
  radiusInMeters: number;
}

/**
 * Tính khoảng cách giữa hai tọa độ địa lý theo công thức Haversine (đơn vị: mét)
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Bán kính trái đất tính bằng mét
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Định dạng hiển thị bán kính thân thiện: mét nếu < 1000m, km nếu >= 1000m
 */
export function formatRadius(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1).replace(/\.0$/, '')} km`;
}

/**
 * Chuyển đổi CircleZone sang GeoZone dùng cho API Backend
 */
export function circleZonesToGeoZones(zones: CircleZone[]) {
  return zones.map((z) => ({
    latitude: z.latitude,
    longitude: z.longitude,
    radiusKm: Math.max(0.1, Math.round((z.radiusInMeters / 1000) * 100) / 100),
  }));
}
