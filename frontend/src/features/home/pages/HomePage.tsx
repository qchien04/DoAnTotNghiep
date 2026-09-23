import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  StayConnectHero,
  SearchFilters,
  LifestyleMatchCard,
  RoommateProfile,
  VerifiedRoomCard,
  RoomListing,
  LandlordDashboardPromoCard,
  Modal,
  Button,
  Tag,
  message,
  LeafletMap,
  type MapMarker,
} from '@/shared/components';
import {
  ChevronRight,
  ShieldCheck,
  MapPin,
  Calendar,
  Phone,
  Users,
  Compass,
  Building,
  Check,
  Map as MapIcon,
  LayoutGrid,
} from 'lucide-react';

const FEATURED_ROOMMATES: RoommateProfile[] = [
  {
    id: 1,
    name: 'Hoàng Minh Anh',
    age: 22,
    occupation: 'Sinh viên năm cuối ĐH Quốc Gia',
    location: 'Cầu Giấy, Hà Nội',
    budget: '2.5 - 3.2 tr/tháng',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    secondaryAvatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    ],
    matchPercentage: 96,
    bio: 'Tính tình vui vẻ, thích nấu ăn cuối tuần, không hút thuốc và luôn giữ gìn vệ sinh chung sạch sẽ.',
    habits: [
      { icon: '🐶', label: 'Yêu thú cưng' },
      { icon: '🌙', label: 'Ngủ sau 0h' },
      { icon: '🚭', label: 'Không hút thuốc' },
      { icon: '🍳', label: 'Thích nấu ăn' },
    ],
  },
  {
    id: 2,
    name: 'Trần Đức Thắng',
    age: 24,
    occupation: 'Kỹ sư phần mềm',
    location: 'Bình Thạnh, TP.HCM',
    budget: '3.5 - 4.5 tr/tháng',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    secondaryAvatars: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    ],
    matchPercentage: 93,
    bio: 'Đi làm giờ hành chính, buổi tối yên tĩnh đọc sách, tìm bạn ở ghép lịch sự và tôn trọng không gian riêng.',
    habits: [
      { icon: '☀️', label: 'Dậy sớm 6h' },
      { icon: '🚭', label: 'Không hút thuốc' },
      { icon: '🎧', label: 'Yên tĩnh' },
      { icon: '🧹', label: 'Ngăn nắp' },
    ],
  },
  {
    id: 3,
    name: 'Lê Thảo My & Quỳnh Trang',
    age: 21,
    occupation: 'Sinh viên ĐH Ngoại Thương',
    location: 'Đống Đa, Hà Nội',
    budget: '2.0 - 2.8 tr/người',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    secondaryAvatars: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    ],
    matchPercentage: 91,
    bio: 'Căn hộ 2 phòng ngủ còn dư 1 slot, đầy đủ máy giặt, điều hòa, ban công nhiều ánh sáng và cây xanh.',
    habits: [
      { icon: '🐱', label: 'Yêu mèo' },
      { icon: '🌱', label: 'Lối sống xanh' },
      { icon: '🚭', label: 'Không hút thuốc' },
      { icon: '🍳', label: 'Làm bánh' },
    ],
  },
];

const ALL_ROOMS: (RoomListing & {
  fullDescription: string;
  deposit: string;
  electricity: string;
  water: string;
  internet: string;
  landlordName: string;
  landlordPhone: string;
  gallery: string[];
})[] = [
  {
    id: 1,
    title: 'Phòng studio ban công full tiện nghi, giờ giấc tự do',
    price: '4.2 tr/tháng',
    priceNumber: 4200000,
    location: 'Số 18 Ngõ 68 Trần Thái Tông, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    area: '28m²',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { key: 'ac', label: 'Điều hòa' },
      { key: 'wifi', label: 'Wifi tốc độ cao' },
      { key: '24/7', label: 'Khóa vân tay 24/7' },
      { key: 'balcony', label: 'Ban công thoáng' },
    ],
    fullDescription: 'Phòng studio mới 100%, trang bị đầy đủ giường tủ cao cấp, bàn học/làm việc, nóng lạnh, điều hòa inverter. Ban công đón ánh sáng tự nhiên, khu dân trí cao, an ninh tuyệt đối camera 24/7.',
    deposit: '4.200.000 đ (1 tháng)',
    electricity: '3.800 đ / kWh',
    water: '30.000 đ / m³',
    internet: '100.000 đ / phòng / tháng',
    landlordName: 'Nguyễn Văn Thành',
    landlordPhone: '0988.123.456',
  },
  {
    id: 2,
    title: 'Căn hộ mini 1N1K riêng biệt, bếp thoáng tại Duy Tân',
    price: '4.8 tr/tháng',
    priceNumber: 4800000,
    location: 'Ngõ 72 Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    area: '35m²',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { key: 'ac', label: 'Điều hòa' },
      { key: 'wifi', label: 'Wifi' },
      { key: '24/7', label: 'Thang máy' },
      { key: 'kitchen', label: 'Bếp riêng' },
    ],
    fullDescription: 'Căn hộ 1 phòng ngủ 1 phòng khách, bếp riêng biệt không ám mùi, thang máy tốc độ cao, máy giặt dùng chung tại tầng thượng. Vị trí đắc địa ngay cụm văn phòng công nghệ Duy Tân và ĐH Quốc Gia.',
    deposit: '4.800.000 đ (1 tháng)',
    electricity: '3.800 đ / kWh',
    water: '100.000 đ / người / tháng',
    internet: 'Miễn phí',
    landlordName: 'Trần Thị Mai',
    landlordPhone: '0912.888.999',
  },
  {
    id: 3,
    title: 'Phòng trọ cao cấp gần ĐH Bách Khoa, có gác lửng',
    price: '3.5 tr/tháng',
    priceNumber: 3500000,
    location: 'Số 42 Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    area: '25m²',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { key: 'ac', label: 'Điều hòa' },
      { key: 'wifi', label: 'Wifi' },
      { key: '24/7', label: 'Giờ tự do' },
      { key: 'mezzanine', label: 'Gác lửng cao' },
    ],
    fullDescription: 'Phòng khép kín sạch sẽ, có gác lửng đứng thẳng người, chỉ cách cổng phụ ĐH Bách Khoa 200m. Phù hợp cho nhóm 2 bạn sinh viên Bách Khoa - Xây Dựng - Kinh Tế Quốc Dân.',
    deposit: '3.500.000 đ (1 tháng)',
    electricity: '3.500 đ / kWh',
    water: '25.000 đ / m³',
    internet: '80.000 đ / người',
    landlordName: 'Lê Hoàng Nam',
    landlordPhone: '0977.654.321',
  },
  {
    id: 4,
    title: 'Phòng khép kín ban công lộng gió gần ĐH Ngoại Thương',
    price: '3.8 tr/tháng',
    priceNumber: 3800000,
    location: 'Ngõ 91 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    area: '26m²',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { key: 'ac', label: 'Điều hòa' },
      { key: 'wifi', label: 'Wifi' },
      { key: 'balcony', label: 'Ban công' },
      { key: 'water_heater', label: 'Nóng lạnh' },
    ],
    fullDescription: 'Phòng tầng 3 trong nhà 6 tầng thang máy, ban công hướng Đông Nam thoáng mát, đầy đủ tiện nghi cơ bản. Cách ĐH Ngoại Thương 300m, gần hồ Chùa Láng nhiều quán ăn uống sinh viên.',
    deposit: '3.800.000 đ',
    electricity: '3.800 đ / kWh',
    water: '80.000 đ / người',
    internet: '100.000 đ / phòng',
    landlordName: 'Vũ Quốc Huy',
    landlordPhone: '0903.456.789',
  },
  {
    id: 5,
    title: 'Căn hộ chung cư mini 2 phòng ngủ tại Mỹ Đình',
    price: '5.5 tr/tháng',
    priceNumber: 5500000,
    location: 'Đường Đình Thôn, Mỹ Đình 1, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    area: '45m²',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef9?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef9?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { key: 'ac', label: '2 Điều hòa' },
      { key: 'kitchen', label: 'Tủ bếp trên dưới' },
      { key: 'parking', label: 'Chỗ để xe máy' },
      { key: '24/7', label: 'Bảo vệ 24/24' },
    ],
    fullDescription: 'Căn hộ 2 phòng ngủ riêng biệt, phòng khách chung rộng rãi, phù hợp cho nhóm 3-4 bạn sinh viên hoặc đồng nghiệp đi làm. Tòa nhà có hầm gửi xe rộng, bảo vệ thường trực 24/7.',
    deposit: '5.500.000 đ',
    electricity: '3.500 đ / kWh',
    water: '28.000 đ / m³',
    internet: '120.000 đ / phòng',
    landlordName: 'Phạm Thị Thoa',
    landlordPhone: '0989.112.233',
  },
  {
    id: 6,
    title: 'Phòng trọ giá rẻ sinh viên, sạch sẽ không chung chủ',
    price: '2.6 tr/tháng',
    priceNumber: 2600000,
    location: 'Ngõ 165 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    area: '20m²',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { key: 'ac', label: 'Điều hòa' },
      { key: 'water_heater', label: 'Nóng lạnh' },
      { key: 'wifi', label: 'Wifi' },
      { key: '24/7', label: 'Giờ tự do' },
    ],
    fullDescription: 'Phòng khép kín sạch sẽ, giá sinh viên tiết kiệm, có sẵn điều hòa, bình nóng lạnh, kệ bếp nấu ăn. Không chung chủ, ra vào khóa cổng vân tay.',
    deposit: '2.600.000 đ',
    electricity: '3.800 đ / kWh',
    water: '80.000 đ / người',
    internet: '70.000 đ / người',
    landlordName: 'Đặng Tuấn Anh',
    landlordPhone: '0966.333.444',
  },
];

const QUICK_FILTERS = [
  { id: 'ALL', label: 'Tất cả phòng' },
  { id: 'CAU_GIAY', label: 'Cầu Giấy (ĐH Quốc Gia)' },
  { id: 'HAI_BA_TRUNG', label: 'Hai Bà Trưng (Bách Khoa)' },
  { id: 'DONG_DA', label: 'Đống Đa (Ngoại Thương)' },
  { id: 'UNDER_3M', label: 'Giá dưới 3.5 triệu' },
  { id: 'STUDIO', label: 'Studio cao cấp' },
];

const ROOM_DISTRICT_COORDINATES: Record<string, [number, number]> = {
  'cầu giấy': [21.0366, 105.7828],
  'đống đa': [21.0183, 105.8236],
  'hai bà trưng': [21.0084, 105.8504],
  'ba đình': [21.0341, 105.8242],
  'thanh xuân': [20.9984, 105.8083],
};

const getRoomCoordinates = (district: string, id: number | string): [number, number] => {
  const lower = (district || '').toLowerCase();
  for (const [key, coords] of Object.entries(ROOM_DISTRICT_COORDINATES)) {
    if (lower.includes(key)) {
      const numId = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, '') || '0', 10);
      const latOffset = ((numId % 5) - 2) * 0.003;
      const lngOffset = (((numId * 2) % 5) - 2) * 0.003;
      return [coords[0] + latOffset, coords[1] + lngOffset];
    }
  }
  return [21.0285, 105.8048];
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState<(typeof ALL_ROOMS)[0] | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredRooms = ALL_ROOMS.filter((room) => {
    if (selectedFilter === 'CAU_GIAY') return room.district === 'Cầu Giấy';
    if (selectedFilter === 'HAI_BA_TRUNG') return room.district === 'Hai Bà Trưng';
    if (selectedFilter === 'DONG_DA') return room.district === 'Đống Đa';
    if (selectedFilter === 'UNDER_3M') return (room.priceNumber || 0) <= 3500000;
    if (selectedFilter === 'STUDIO') return room.title.toLowerCase().includes('studio');
    return true;
  });

  const roomMapMarkers = useMemo<MapMarker[]>(() => {
    return filteredRooms.map((room) => {
      const coords = getRoomCoordinates(room.district, room.id);
      return {
        id: room.id,
        position: coords,
        title: room.title,
        price: room.price,
        address: room.location,
        imageUrl: room.imageUrl,
        type: 'room',
      };
    });
  }, [filteredRooms]);

  const handleHeroSearch = (filters: SearchFilters) => {
    if (filters.tab === 'roommates') {
      navigate('/roommates');
    } else {
      if (filters.location?.toLowerCase().includes('cầu giấy')) setSelectedFilter('CAU_GIAY');
      else if (filters.location?.toLowerCase().includes('đống đa')) setSelectedFilter('DONG_DA');
      else if (filters.location?.toLowerCase().includes('hai bà trưng')) setSelectedFilter('HAI_BA_TRUNG');
      else setSelectedFilter('ALL');

      message.success(`Đã lọc danh sách phòng trọ theo tiêu chí tìm kiếm!`);
    }
  };

  const handleOpenRoomDetails = (room: (typeof ALL_ROOMS)[0]) => {
    setSelectedRoom(room);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = () => {
    message.success('Đã gửi yêu cầu đặt lịch xem phòng tới chủ trọ! Chủ nhà sẽ liên hệ bạn trong 30 phút.');
    setBookingModalOpen(false);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* 1. StayConnect Hero Section */}
      <StayConnectHero onSearch={handleHeroSearch} />

      {/* 2. Quick Filter Pills Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-stay-text-secondary uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-stay-primary" />
            Tìm nhanh:
          </span>
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                selectedFilter === f.id
                  ? 'bg-stay-primary text-white border-stay-primary shadow-xs'
                  : 'bg-stay-card-bg text-stay-text hover:border-stay-primary/50 border-stay-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Danh sách Phòng trọ xác minh & Promo chủ trọ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột Trái: Phòng trọ xác minh (8/12 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stay-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-stay-secondary" />
                  <h2 className="text-xl sm:text-2xl font-bold text-stay-text">
                    Phòng trọ xác minh ({filteredRooms.length})
                  </h2>
                </div>
                <p className="text-xs text-stay-text-secondary mt-0.5">
                  100% tin đăng được đội ngũ StayConnect kiểm duyệt pháp lý, khảo sát hình ảnh thực tế
                </p>
              </div>

              {/* View Switcher: Danh sách / Bản đồ */}
              <div className="flex items-center gap-1 bg-stay-card-bg border border-stay-border rounded-xl p-1 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-stay-primary text-white shadow-xs'
                      : 'text-stay-text-secondary hover:text-stay-text'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Danh sách
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-stay-primary text-white shadow-xs'
                      : 'text-stay-text-secondary hover:text-stay-text'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  Bản đồ
                </button>
              </div>
            </div>

            {/* Map View */}
            {viewMode === 'map' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-stay-card-bg rounded-2xl border border-stay-border text-xs text-stay-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <MapIcon className="w-4 h-4 text-stay-primary" />
                    Bản đồ OpenStreetMap (OSM) • <strong>{roomMapMarkers.length}</strong> phòng tại Hà Nội
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Nhấp vào ghim để xem chi tiết phòng
                  </span>
                </div>
                <LeafletMap
                  markers={roomMapMarkers}
                  height="450px"
                  onMarkerClick={(marker) => {
                    const room = ALL_ROOMS.find((r) => r.id === marker.id);
                    if (room) handleOpenRoomDetails(room);
                  }}
                />
              </div>
            )}

            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.map((room) => (
                <VerifiedRoomCard
                  key={room.id}
                  room={room}
                  onClick={() => handleOpenRoomDetails(room)}
                />
              ))}
            </div>
          </div>

          {/* Cột Phải: Kênh Dành Riêng Cho Chủ Trọ (4/12 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <LandlordDashboardPromoCard
              onExploreClick={() => navigate('/landlord')}
            />

            {/* Student Hotspots Card */}
            <div className="p-6 rounded-2xl bg-stay-card-bg border border-stay-border space-y-4 shadow-card">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-stay-primary" />
                <h3 className="text-sm font-bold text-stay-text">Khu vực sinh viên trọng điểm</h3>
              </div>
              <div className="space-y-2.5 text-xs">
                <div
                  onClick={() => setSelectedFilter('CAU_GIAY')}
                  className="p-2.5 rounded-xl bg-stay-bg-app hover:bg-stay-primary-subtle transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="font-semibold text-stay-text">Cầu Giấy (ĐH Quốc Gia, Sư Phạm)</span>
                  <span className="text-stay-primary font-bold">142 phòng</span>
                </div>
                <div
                  onClick={() => setSelectedFilter('HAI_BA_TRUNG')}
                  className="p-2.5 rounded-xl bg-stay-bg-app hover:bg-stay-primary-subtle transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="font-semibold text-stay-text">Hai Bà Trưng (Bách Khoa, NEU)</span>
                  <span className="text-stay-primary font-bold">98 phòng</span>
                </div>
                <div
                  onClick={() => setSelectedFilter('DONG_DA')}
                  className="p-2.5 rounded-xl bg-stay-bg-app hover:bg-stay-primary-subtle transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="font-semibold text-stay-text">Đống Đa (Ngoại Thương, Luật)</span>
                  <span className="text-stay-primary font-bold">86 phòng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ghép đôi theo lối sống (Lifestyle Match) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2 border-b border-stay-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-stay-match"></span>
              <h2 className="text-xl sm:text-2xl font-bold text-stay-text">
                Tìm bạn ở ghép cùng gu
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stay-text-secondary mt-1">
              Khám phá những người bạn cùng phòng có độ tương thích cao về nhịp sinh học và thói quen sinh hoạt
            </p>
          </div>

          <Link
            to="/roommates"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-stay-primary hover:underline"
          >
            <span>Khám phá cộng đồng ở ghép</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Roommate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_ROOMMATES.map((profile) => (
            <LifestyleMatchCard
              key={profile.id}
              profile={profile}
              onChat={() => navigate('/roommates')}
              onViewProfile={() => navigate('/roommates')}
            />
          ))}
        </div>
      </section>

      {/* 5. Banner Kêu Gọi Hành Động (CTA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-stay-primary to-indigo-700 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              Cộng đồng hơn 50.000+ sinh viên & người đi làm
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bạn đang tìm phòng hay tìm bạn ở cùng?
            </h3>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Tạo hồ sơ lối sống miễn phí ngay hôm nay để nhận thông báo khi có bạn cùng phòng hoặc căn phòng phù hợp nhất với bạn.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link to="/roommates">
              <Button
                size="large"
                className="bg-white text-stay-primary hover:bg-slate-100 font-bold px-6 h-12 rounded-xl shadow-md"
              >
                Tìm bạn ở ghép
              </Button>
            </Link>
            <Link to="/roommates/create">
              <Button
                size="large"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-6 h-12 rounded-xl"
              >
                Đăng tin tìm bạn
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal Chi Tiết Phòng Trọ */}
      {selectedRoom && (
        <Modal
          open={bookingModalOpen}
          onCancel={() => setBookingModalOpen(false)}
          footer={null}
          width={720}
        >
          <div className="space-y-6 pt-2">
            {/* Gallery Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-stay-border">
              <img
                src={selectedRoom.imageUrl}
                alt={selectedRoom.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Tag color="#16A34A" className="font-semibold px-2.5 py-1 rounded-lg">
                  Đã xác minh chính chủ
                </Tag>
              </div>
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur text-white text-sm font-bold">
                {selectedRoom.price}
              </div>
            </div>

            {/* Room Title & Location */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-stay-text">{selectedRoom.title}</h3>
              <p className="text-xs text-stay-text-secondary flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stay-primary shrink-0" />
                <span>{selectedRoom.location}</span>
              </p>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-stay-bg-app border border-stay-border text-center">
                <span className="text-[10px] text-slate-400 block">Diện tích</span>
                <span className="text-sm font-bold text-stay-text">{selectedRoom.area}</span>
              </div>
              <div className="p-3 rounded-xl bg-stay-bg-app border border-stay-border text-center">
                <span className="text-[10px] text-slate-400 block">Tiền cọc</span>
                <span className="text-sm font-bold text-stay-text">{selectedRoom.deposit}</span>
              </div>
              <div className="p-3 rounded-xl bg-stay-bg-app border border-stay-border text-center">
                <span className="text-[10px] text-slate-400 block">Tiền điện</span>
                <span className="text-sm font-bold text-stay-text">{selectedRoom.electricity}</span>
              </div>
              <div className="p-3 rounded-xl bg-stay-bg-app border border-stay-border text-center">
                <span className="text-[10px] text-slate-400 block">Tiền nước</span>
                <span className="text-sm font-bold text-stay-text">{selectedRoom.water}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stay-text">Mô tả phòng</h4>
              <p className="text-xs text-stay-text-secondary leading-relaxed bg-stay-bg-app p-4 rounded-xl border border-stay-border">
                {selectedRoom.fullDescription}
              </p>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stay-text">Tiện nghi có sẵn</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.amenities.map((a) => (
                  <span
                    key={a.key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stay-primary-subtle text-stay-primary text-xs font-semibold border border-stay-primary/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{a.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Landlord Contact & Actions */}
            <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">Chủ phòng:</p>
                <p className="text-sm font-bold text-stay-text">{selectedRoom.landlordName}</p>
                <p className="text-xs text-stay-primary font-semibold flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedRoom.landlordPhone}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    message.info(`Đang kết nối Zalo tới chủ phòng: ${selectedRoom.landlordPhone}`);
                  }}
                >
                  Chat Zalo
                </Button>
                <Button
                  variant="primary"
                  icon={<Calendar className="w-4 h-4" />}
                  onClick={handleConfirmBooking}
                >
                  Đặt lịch xem phòng
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HomePage;
